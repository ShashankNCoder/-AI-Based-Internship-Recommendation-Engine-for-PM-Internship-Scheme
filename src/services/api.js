import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const internshipAPI = {
  // Get all internships
  getInternships: async (filters = {}) => {
    const response = await api.get('/internships', { params: filters });
    return response.data;
  },

  // Get internship by ID
  getInternship: async (id) => {
    const response = await api.get(`/internships/${id}`);
    return response.data;
  },

  // Upload resume and get analysis
  uploadResume: async (formData) => {
    const response = await api.post('/upload-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Get recommendations based on profile
  getRecommendations: async (profile) => {
    const response = await api.post('/recommend', profile);
    return response.data;
  },

  // Apply for internship
  applyForInternship: async (internshipId, applicantData) => {
    const response = await api.post(`/internships/${internshipId}/apply`, applicantData);
    return response.data;
  },

  // Submit application with full form data
  submitApplication: async (applicationData) => {
    const response = await api.post('/applications', applicationData);
    return response.data;
  },

  // Send confirmation email
  sendConfirmationEmail: async (emailData) => {
    const response = await api.post('/applications/send-confirmation', emailData);
    return response.data;
  },

  // Download application confirmation
  downloadConfirmation: async (application) => {
    const response = await api.post('/applications/download-confirmation', application, {
      responseType: 'blob'
    });
    
    // Create download link for HTML file
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/html' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `application-confirmation-${application.applicationId}.html`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  }
};

// OTP API methods
export const otpAPI = {
  // Send OTP to email
  sendOTP: async (email) => {
    const response = await api.post('/auth/send-otp', { email });
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  // Resend OTP
  resendOTP: async (email) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  }
};

export default api;