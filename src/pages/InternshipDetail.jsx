import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  Building, 
  Users, 
  Clock
} from 'lucide-react';
import { internshipAPI } from '../services/api';
import ApplicationForm from '../components/ApplicationForm';
import ApplicationSuccess from '../components/ApplicationSuccess';

// Main InternshipDetail Component
const InternshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [application, setApplication] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchInternship() {
      try {
        setError(null);
        const data = await internshipAPI.getInternship(id);
        if (isMounted) {
          setInternship(data);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load internship details');
          console.error('Error fetching internship:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchInternship();
    
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleApply = () => {
    setShowApplicationForm(true);
  };

  const handleSubmitApplication = async (formData) => {
    try {
      const applicationData = {
        internshipId: id,
        internshipTitle: internship.title,
        companyName: internship.company,
        ...formData,
        submittedAt: new Date().toISOString()
      };

      // Submit application
      const submittedApplication = await internshipAPI.submitApplication(applicationData);
      
      setApplication(submittedApplication);
      setShowApplicationForm(false);
      setShowSuccess(true);
      
      // Send confirmation email
      try {
        await internshipAPI.sendConfirmationEmail({
          applicationId: submittedApplication.applicationId,
          applicantEmail: formData.email,
          internshipTitle: internship.title,
          companyName: internship.company
        });
      } catch (emailError) {
        console.warn('Email confirmation failed:', emailError);
        // Continue even if email fails
      }
      
    } catch (error) {
      throw error;
    }
  };

  const handleDownloadConfirmation = async () => {
    try {
      await internshipAPI.downloadConfirmation(application);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {error || 'Internship not found'}
          </h2>
          <Link to="/internships" className="text-blue-600 hover:text-blue-700">
            Back to internships
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 pt-14 sm:pt-16 lg:pt-24">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        {/* Back Button */}
        <Link
          to="/internships"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 sm:mb-6 text-sm sm:text-base"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Back to internships
        </Link>

        {/* Internship Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4 gap-3">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {internship.title}
              </h1>
              <div className="flex items-center text-base sm:text-lg text-gray-600 mb-3 sm:mb-4">
                <Building className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                <span className="truncate">{internship.company}</span>
              </div>
            </div>
            {internship.category && (
              <span className="inline-block bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium self-start">
                {internship.category}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center text-gray-600 text-sm sm:text-base">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
              <span className="truncate">{internship.location}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm sm:text-base">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
              <span>{internship.duration}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm sm:text-base">
              <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
              <span>₹{internship.stipend}/month</span>
            </div>
          </div>

          <button 
            onClick={handleApply}
            className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base lg:text-lg font-medium"
          >
            Apply for this Internship
          </button>
        </div>

        {/* Internship Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                Internship Description
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                {internship.description}
              </p>
            </div>

            {/* Responsibilities */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                Key Responsibilities
              </h2>
              <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 flex-shrink-0">•</span>
                  Work on real-world projects and contribute to team goals
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 flex-shrink-0">•</span>
                  Collaborate with team members and participate in meetings
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 flex-shrink-0">•</span>
                  Learn and apply new technologies and methodologies
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 flex-shrink-0">•</span>
                  Deliver high-quality work according to project timelines
                </li>
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Skills Required */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Skills Required</h3>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {internship.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-block bg-blue-100 text-blue-800 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Internship Details</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Start Date: Flexible</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Positions: Multiple available</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="h-4 w-4 mr-2" />
                  <span>Type: {internship.location === 'Remote' ? 'Remote' : 'On-site'}</span>
                </div>
              </div>
            </div>

            {/* Application Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Application Tip</h3>
              <p className="text-blue-800 text-sm">
                {internship.skills?.length > 0 ? (
                  <>Make sure to highlight your experience with {internship.skills.slice(0, 2).join(' and ')} in your application.</>
                ) : (
                  <>Tailor your resume and cover letter to match the internship requirements.</>
                )}
                {' '}Be specific about your relevant experience and enthusiasm for the role.
              </p>
            </div>
          </div>
        </div>

        {/* Application Form Modal */}
        {showApplicationForm && (
          <ApplicationForm
            internship={internship}
            onClose={() => setShowApplicationForm(false)}
            onSubmit={handleSubmitApplication}
          />
        )}

        {/* Success Modal */}
        {showSuccess && application && (
          <ApplicationSuccess
            application={application}
            internship={internship}
            onClose={() => setShowSuccess(false)}
            onDownload={handleDownloadConfirmation}
          />
        )}
      </div>
    </div>
  );
};

export default InternshipDetail;