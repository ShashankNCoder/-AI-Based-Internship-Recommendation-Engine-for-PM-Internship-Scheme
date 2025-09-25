from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
import random
import string
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from io import BytesIO

try:
    from PyPDF2 import PdfReader
except Exception:
    PdfReader = None
try:
    import docx
except Exception:
    docx = None


app = Flask(__name__)
CORS(app)

# Import email configuration
try:
    from email_config import EMAIL_CONFIG
except ImportError:
    # Fallback configuration if email_config.py doesn't exist
    EMAIL_CONFIG = {
        'smtp_server': 'smtp.gmail.com',
        'smtp_port': 587,
        'sender_email': 'your-email@gmail.com',
        'sender_password': 'your-app-password',
        'sender_name': 'PM Internship Recommender'
    }


# CSV schema columns expected (updated to new format)
COLUMN_NAMES = [
    'internship_id',
    'title',
    'company',
    'skills',
    'location',
    'category',
    'stipend',
    'duration',
    'education',
    'description',
]


def load_dataset(csv_path: str) -> pd.DataFrame:
    if not os.path.exists(csv_path):
        return pd.DataFrame(columns=COLUMN_NAMES)
    try:
        return pd.read_csv(csv_path, names=COLUMN_NAMES, header=0)
    except Exception:
        return pd.DataFrame(columns=COLUMN_NAMES)


ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
DEFAULT_DATASET_PATH = os.path.join(ROOT_DIR, 'pm_internships.csv')
DATASET_PATH = os.getenv('INTERNSHIP_DATASET_PATH', DEFAULT_DATASET_PATH)
df = load_dataset(DATASET_PATH)


def preprocess_sets(s):
    if pd.notna(s) and isinstance(s, str):
        return set(x.strip().lower() for x in s.split(','))
    return set()


def score_internship(internship: pd.Series, user: dict):
    loc_match = 1 if str(internship.get('location', '')).strip().lower() == str(user.get('location', '')).strip().lower() else 0

    # Category now replaces sectors; treat category as a single-item set for overlap logic
    intern_sectors = preprocess_sets(internship.get('category', ''))
    user_sectors = set([x.strip().lower() for x in user.get('sectors', [])])
    sector_match_norm = len(user_sectors & intern_sectors) / len(intern_sectors) if intern_sectors else 0

    # Skills column name updated
    intern_skills = preprocess_sets(internship.get('skills', ''))
    user_skills = set([x.strip().lower() for x in user.get('skills', [])])
    skill_match_norm = len(user_skills & intern_skills) / len(intern_skills) if intern_skills else 0

    # Education column name updated
    edu_req = str(internship.get('education', '')).strip().lower()
    edu_match = 1 if str(user.get('education', '')).strip().lower() in edu_req else 0

    # Preserve priority logic/weights
    score = (0.45 * loc_match) + (0.35 * sector_match_norm) + (0.15 * skill_match_norm) + (0.05 * edu_match)
    return score, loc_match


def recommend_internships(user: dict, frame: pd.DataFrame, top_k_local: int = 5, top_k_overall: int = 10):
    scores = []
    for _, internship in frame.iterrows():
        score, loc_match = score_internship(internship, user)
        scores.append((
            internship.get('internship_id'),
            internship.get('title'),
            internship.get('location'),
            float(score),
            int(loc_match),
            internship.get('skills', ''),
            internship.get('description', ''),
            internship.get('category', ''),
        ))

    local_recs = [s for s in scores if s[4] == 1]
    overall_recs = scores

    local_sorted = sorted(local_recs, key=lambda x: x[3], reverse=True)[:top_k_local]
    overall_sorted = sorted(overall_recs, key=lambda x: x[3], reverse=True)[:top_k_overall]

    def to_obj(t):
        skills_list = [x.strip() for x in str(t[5]).split(',') if x.strip()] if t[5] else []
        return {
            'id': int(t[0]) if pd.notna(t[0]) else None,
            'title': str(t[1]) if pd.notna(t[1]) else '',
            'location': str(t[2]) if pd.notna(t[2]) else '',
            'matchScore': int(round(t[3] * 100)),
            'skills': skills_list,
            'description': str(t[6]) if pd.notna(t[6]) else '',
            'category': (str(t[7]).split(',')[0].strip() if t[7] else '') or 'Technology',
            # Use dataset values when available from main frame (fallbacks in list endpoints)
            'company': str(frame.loc[frame['internship_id'] == t[0]].iloc[0].get('company', 'Company')) if 'company' in frame.columns and not frame.empty else 'Company',
            'stipend': int(frame.loc[frame['internship_id'] == t[0]].iloc[0].get('stipend', 0)) if 'stipend' in frame.columns and not frame.empty else 0,
            'duration': str(frame.loc[frame['internship_id'] == t[0]].iloc[0].get('duration', '3 months')) if 'duration' in frame.columns and not frame.empty else '3 months',
        }

    return [to_obj(x) for x in local_sorted], [to_obj(x) for x in overall_sorted]


def extract_profile_from_text(text: str) -> dict:
    text_lc = text.lower() if text else ''
    skills_vocab = [
        'javascript','react','node.js','mongodb','python','java','html','css','express',
        'machine learning','ai','data analysis','sql','nosql','aws','docker','kubernetes',
        'git','rest api','project management','analytical thinking','communication','leadership'
    ]
    locations = ['delhi','bangalore','hyderabad','jaipur','mumbai','chennai','pune','kolkata','ahmedabad','gurgaon','noida','remote']
    degrees = ['bachelor','master','phd','b.tech','m.tech','b.e.','m.e.','bsc','msc','ba','ma','mbbs','bca','mca']

    skills = [s for s in skills_vocab if s in text_lc]
    location = next((c for c in locations if c in text_lc), 'remote')
    import re
    exp = 0
    for pat in [r'(\d+)\s*(years?|yrs?)', r'experience.*?(\d+)', r'(\d+)\+?\s*years?']:
        m = re.search(pat, text_lc)
        if m:
            try:
                exp = int(m.group(1))
                break
            except Exception:
                pass
    education = next((d for d in degrees if d in text_lc), 'bachelor')
    return {
        'skills': skills,
        'location': location,
        'experience': exp,
        'education': education,
    }


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok', 
        'dataset_loaded': not df.empty, 
        'rows': int(len(df)),
        'email_configured': EMAIL_CONFIG['sender_email'] != 'your-email@gmail.com',
        'endpoints': [
            '/api/health',
            '/api/upload-resume',
            '/api/recommend',
            '/api/internships',
            '/api/internships/<id>',
            '/api/internships/<id>/apply',
            '/api/applications',
            '/api/applications/send-confirmation',
            '/api/applications/download-confirmation',
            '/api/auth/send-otp',
            '/api/auth/verify-otp',
            '/api/auth/resend-otp'
        ]
    })


@app.route('/api/upload-resume', methods=['POST'])
def upload_resume():
    if 'file' not in request.files:
        return jsonify({'error': 'file field is required'}), 400
    f = request.files['file']
    try:
        filename = (f.filename or '').lower()
        content = f.read()
        text = ''
        if filename.endswith('.pdf') and PdfReader is not None:
            try:
                reader = PdfReader(BytesIO(content))
                for page in reader.pages:
                    text += (page.extract_text() or '') + '\n'
            except Exception:
                text = ''
        elif (filename.endswith('.docx') or filename.endswith('.doc')) and docx is not None:
            try:
                document = docx.Document(BytesIO(content))
                text = '\n'.join([p.text for p in document.paragraphs])
            except Exception:
                text = ''
        else:
            # Fallback: treat as plain text
            try:
                text = content.decode('utf-8', errors='ignore')
            except Exception:
                text = ''
    except Exception:
        text = ''

    profile = extract_profile_from_text(text)
    return jsonify(profile)


@app.route('/api/recommend', methods=['POST'])
def recommend():
    data = request.get_json(force=True, silent=True) or {}
    user = {
        'location': data.get('location', ''),
        'skills': data.get('skills', []),
        'sectors': data.get('sectors', []),
        'education': data.get('education', ''),
    }

    if df.empty:
        return jsonify({'local': [], 'overall': [], 'message': 'dataset not loaded'}), 200

    local_recs, overall_recs = recommend_internships(user, df)
    return jsonify({'local': local_recs, 'overall': overall_recs})


@app.route('/api/internships', methods=['GET'])
def list_internships():
    if df.empty:
        return jsonify([])

    def to_obj_row(row: pd.Series):
        skills_list = [x.strip() for x in str(row.get('skills', '')).split(',') if x.strip()]
        category = (str(row.get('category', '')).split(',')[0].strip() if row.get('category', '') else '') or 'Technology'
        return {
            'id': int(row.get('internship_id')) if pd.notna(row.get('internship_id')) else None,
            'title': str(row.get('title', '')) if pd.notna(row.get('title')) else '',
            'location': str(row.get('location', '')) if pd.notna(row.get('location')) else '',
            'matchScore': None,
            'skills': skills_list,
            'description': str(row.get('description', '')) if pd.notna(row.get('description')) else '',
            'category': category,
            'company': str(row.get('company', 'Company')) if pd.notna(row.get('company')) else 'Company',
            'stipend': int(row.get('stipend', 0)) if pd.notna(row.get('stipend')) and str(row.get('stipend', '')).strip() != '' else 0,
            'duration': str(row.get('duration', '3 months')) if pd.notna(row.get('duration')) else '3 months',
        }

    internships = [to_obj_row(row) for _, row in df.iterrows()]
    return jsonify(internships)


@app.route('/api/internships/<id>', methods=['GET'])
def get_internship(id):
    if df.empty:
        return jsonify({'error': 'not found'}), 404
    match = df[df['internship_id'].astype(str) == str(id)]
    if match.empty:
        return jsonify({'error': 'not found'}), 404
    row = match.iloc[0]
    skills_list = [x.strip() for x in str(row.get('skills', '')).split(',') if x.strip()]
    category = (str(row.get('category', '')).split(',')[0].strip() if row.get('category', '') else '') or 'Technology'
    obj = {
        'id': int(row.get('internship_id')) if pd.notna(row.get('internship_id')) else None,
        'title': str(row.get('title', '')) if pd.notna(row.get('title')) else '',
        'location': str(row.get('location', '')) if pd.notna(row.get('location')) else '',
        'matchScore': None,
        'skills': skills_list,
        'description': str(row.get('description', '')) if pd.notna(row.get('description')) else '',
        'category': category,
        'company': str(row.get('company', 'Company')) if pd.notna(row.get('company')) else 'Company',
        'stipend': int(row.get('stipend', 0)) if pd.notna(row.get('stipend')) and str(row.get('stipend', '')).strip() != '' else 0,
        'duration': str(row.get('duration', '3 months')) if pd.notna(row.get('duration')) else '3 months',
    }
    return jsonify(obj)


@app.route('/api/internships/<id>/apply', methods=['POST'])
def apply_internship(id):
    payload = request.get_json(force=True, silent=True) or {}
    return jsonify({'status': 'received', 'internshipId': id, 'application': payload}), 200


# Application Management Endpoints
@app.route('/api/applications', methods=['POST'])
def submit_application():
    """Submit a new internship application"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['internshipId', 'fullName', 'email', 'phone', 'coverLetter']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Generate application ID using internship ID
        internship_id = data.get('internshipId', 'UNK')
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        application_id = f"APP-{internship_id}-{timestamp[-6:]}"
        
        # Create application record
        application = {
            'applicationId': application_id,
            'internshipId': data.get('internshipId'),
            'internshipTitle': data.get('internshipTitle', ''),
            'companyName': data.get('companyName', ''),
            'applicantName': data.get('fullName'),
            'applicantEmail': data.get('email'),
            'applicantPhone': data.get('phone'),
            'coverLetter': data.get('coverLetter'),
            'portfolioUrl': data.get('portfolioUrl', ''),
            'linkedinUrl': data.get('linkedinUrl', ''),
            'resumeFileName': data.get('resume', {}).get('name', '') if data.get('resume') else '',
            'submittedAt': datetime.now().isoformat(),
            'status': 'Under Review'
        }
        
        # In production, save to database
        # For now, just return the application
        return jsonify({
            'message': 'Application submitted successfully',
            'application': application,
            'applicationId': application_id,
            'applicantName': application['applicantName'],
            'applicantEmail': application['applicantEmail'],
            'applicantPhone': application['applicantPhone'],
            'submittedAt': application['submittedAt'],
            'status': application['status']
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/applications/send-confirmation', methods=['POST'])
def send_confirmation_email():
    """Send confirmation email for application"""
    try:
        data = request.get_json()
        
        application_id = data.get('applicationId')
        applicant_email = data.get('applicantEmail')
        internship_title = data.get('internshipTitle')
        company_name = data.get('companyName')
        
        if not all([application_id, applicant_email, internship_title, company_name]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Create confirmation email
        msg = MIMEMultipart()
        msg['From'] = f"{EMAIL_CONFIG['sender_name']} <{EMAIL_CONFIG['sender_email']}>"
        msg['To'] = applicant_email
        msg['Subject'] = f"Application Confirmation - {internship_title}"
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">Application Received!</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Your internship application has been submitted</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">Application Details</h2>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Application ID:</strong> {application_id}</p>
                    <p style="margin: 5px 0;"><strong>Position:</strong> {internship_title}</p>
                    <p style="margin: 5px 0;"><strong>Company:</strong> {company_name}</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #28a745;">Under Review</span></p>
                    <p style="margin: 5px 0;"><strong>Submitted:</strong> {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
                </div>
                
                <p style="color: #666; line-height: 1.6;">
                    Thank you for your interest in this position. We have received your application and will review it carefully. 
                    You will be contacted within 5-7 business days regarding the next steps.
                </p>
                
                <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #1976d2;"><strong>What's Next?</strong></p>
                    <ul style="margin: 10px 0; color: #1976d2;">
                        <li>Our team will review your application</li>
                        <li>Shortlisted candidates will be contacted for interviews</li>
                        <li>You'll receive updates via email</li>
                    </ul>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                        This is an automated message. Please do not reply to this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(html_body, 'html'))
        
        # Send email
        try:
            server = smtplib.SMTP(EMAIL_CONFIG['smtp_server'], EMAIL_CONFIG['smtp_port'])
            server.starttls()
            server.login(EMAIL_CONFIG['sender_email'], EMAIL_CONFIG['sender_password'])
            text = msg.as_string()
            server.sendmail(EMAIL_CONFIG['sender_email'], applicant_email, text)
            server.quit()
            
            print(f"Confirmation email sent to {applicant_email}")
            return jsonify({'message': 'Confirmation email sent successfully'}), 200
            
        except Exception as email_error:
            print(f"Failed to send confirmation email: {email_error}")
            # Don't fail the application if email fails
            return jsonify({'message': 'Application submitted, but confirmation email failed'}), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/applications/download-confirmation', methods=['POST'])
def download_confirmation():
    """Generate and download application confirmation PDF"""
    try:
        data = request.get_json()
        
        # Create a comprehensive HTML confirmation document
        html_content = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Application Confirmation - {data.get('applicationId', 'N/A')}</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    background: #f8f9fa;
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 10px 10px 0 0;
                    text-align: center;
                }}
                .content {{
                    background: white;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }}
                .success-icon {{
                    font-size: 48px;
                    margin-bottom: 10px;
                }}
                .application-details {{
                    background: #f8f9fa;
                    border-left: 4px solid #007bff;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 5px;
                }}
                .detail-row {{
                    display: flex;
                    justify-content: space-between;
                    margin: 10px 0;
                    padding: 5px 0;
                    border-bottom: 1px solid #eee;
                }}
                .detail-label {{
                    font-weight: bold;
                    color: #666;
                }}
                .detail-value {{
                    color: #333;
                }}
                .status {{
                    background: #d4edda;
                    color: #155724;
                    padding: 5px 10px;
                    border-radius: 15px;
                    font-size: 12px;
                    font-weight: bold;
                }}
                .next-steps {{
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    padding: 20px;
                    border-radius: 5px;
                    margin: 20px 0;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    color: #666;
                    font-size: 12px;
                }}
                @media print {{
                    body {{ background: white; }}
                    .header {{ background: #667eea !important; -webkit-print-color-adjust: exact; }}
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <div class="success-icon">✅</div>
                <h1>Application Confirmation</h1>
                <p>Your internship application has been successfully submitted</p>
            </div>
            
            <div class="content">
                <h2>Application Details</h2>
                <div class="application-details">
                    <div class="detail-row">
                        <span class="detail-label">Application ID:</span>
                        <span class="detail-value">{data.get('applicationId', 'N/A')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Position:</span>
                        <span class="detail-value">{data.get('internshipTitle', 'N/A')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Company:</span>
                        <span class="detail-value">{data.get('companyName', 'N/A')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Applicant:</span>
                        <span class="detail-value">{data.get('applicantName', 'N/A')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">{data.get('applicantEmail', 'N/A')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">{data.get('applicantPhone', 'N/A')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Submitted:</span>
                        <span class="detail-value">{datetime.now().strftime('%B %d, %Y at %I:%M %p')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value"><span class="status">Under Review</span></span>
                    </div>
                </div>
                
                <div class="next-steps">
                    <h3>What happens next?</h3>
                    <ul>
                        <li>Our team will review your application within 5-7 business days</li>
                        <li>Shortlisted candidates will be contacted for interviews</li>
                        <li>You'll receive updates via email regarding your application status</li>
                        <li>Keep this confirmation for your records</li>
                    </ul>
                </div>
                
                <p style="margin-top: 30px; font-size: 14px; color: #666;">
                    <strong>Important:</strong> This is an automated confirmation. Please do not reply to this document. 
                    If you have any questions, please contact our support team.
                </p>
            </div>
            
            <div class="footer">
                <p>Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
                <p>PM Internship Recommender System</p>
            </div>
        </body>
        </html>
        """
        
        # Return HTML content that can be saved and opened in browser
        from flask import Response
        return Response(
            html_content,
            mimetype='text/html',
            headers={
                'Content-Disposition': f'attachment; filename=application-confirmation-{data.get("applicationId", "unknown")}.html'
            }
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# OTP Storage (in production, use Redis or database)
otp_storage = {}

def generate_otp():
    """Generate a 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

def send_otp_email(email, otp):
    """Send OTP via email"""
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = f"{EMAIL_CONFIG['sender_name']} <{EMAIL_CONFIG['sender_email']}>"
        msg['To'] = email
        msg['Subject'] = "Your Verification Code - PM Internship Recommender"
        
        # Email body
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">PM Internship Recommender</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Your verification code is ready</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">Email Verification</h2>
                <p style="color: #666; line-height: 1.6;">
                    Thank you for signing up! To complete your registration, please use the verification code below:
                </p>
                
                <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                    <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; font-family: monospace;">
                        {otp}
                    </div>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                    <strong>Important:</strong> This code will expire in 5 minutes. If you didn't request this code, please ignore this email.
                </p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                        This is an automated message. Please do not reply to this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(html_body, 'html'))
        
        # Send email
        server = smtplib.SMTP(EMAIL_CONFIG['smtp_server'], EMAIL_CONFIG['smtp_port'])
        server.starttls()
        server.login(EMAIL_CONFIG['sender_email'], EMAIL_CONFIG['sender_password'])
        text = msg.as_string()
        server.sendmail(EMAIL_CONFIG['sender_email'], email, text)
        server.quit()
        
        print(f"OTP email sent successfully to {email}")
        return True
        
    except Exception as e:
        print(f"Failed to send OTP email to {email}: {str(e)}")
        # Fallback: print to console for development
        print(f"OTP for {email}: {otp}")
        return False

@app.route('/api/auth/send-otp', methods=['POST'])
def send_otp():
    """Send OTP to email for verification"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        # Generate OTP
        otp = generate_otp()
        expires_at = datetime.now() + timedelta(minutes=5)  # OTP expires in 5 minutes
        
        # Store OTP
        otp_storage[email] = {
            'otp': otp,
            'expires_at': expires_at,
            'attempts': 0
        }
        
        # Send OTP (simulated)
        send_otp_email(email, otp)
        
        return jsonify({
            'message': 'OTP sent successfully',
            'expires_in': 300  # 5 minutes in seconds
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/verify-otp', methods=['POST'])
def verify_otp():
    """Verify OTP"""
    try:
        data = request.get_json()
        email = data.get('email')
        otp = data.get('otp')
        
        if not email or not otp:
            return jsonify({'error': 'Email and OTP are required'}), 400
        
        # Check if OTP exists
        if email not in otp_storage:
            return jsonify({'error': 'OTP not found or expired'}), 400
        
        stored_data = otp_storage[email]
        
        # Check if OTP is expired
        if datetime.now() > stored_data['expires_at']:
            del otp_storage[email]
            return jsonify({'error': 'OTP has expired'}), 400
        
        # Check attempts
        if stored_data['attempts'] >= 3:
            del otp_storage[email]
            return jsonify({'error': 'Too many attempts. Please request a new OTP'}), 400
        
        # Verify OTP
        if stored_data['otp'] == otp:
            # OTP is correct, remove it from storage
            del otp_storage[email]
            return jsonify({
                'message': 'OTP verified successfully',
                'verified': True
            }), 200
        else:
            # Increment attempts
            stored_data['attempts'] += 1
            return jsonify({
                'error': 'Invalid OTP',
                'attempts_remaining': 3 - stored_data['attempts']
            }), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/resend-otp', methods=['POST'])
def resend_otp():
    """Resend OTP"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        # Generate new OTP
        otp = generate_otp()
        expires_at = datetime.now() + timedelta(minutes=5)
        
        # Update OTP storage
        otp_storage[email] = {
            'otp': otp,
            'expires_at': expires_at,
            'attempts': 0
        }
        
        # Send new OTP
        send_otp_email(email, otp)
        
        return jsonify({
            'message': 'OTP resent successfully',
            'expires_in': 300
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)


