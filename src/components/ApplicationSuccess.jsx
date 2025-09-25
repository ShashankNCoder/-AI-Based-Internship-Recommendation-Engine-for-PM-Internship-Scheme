import React, { useState } from 'react';
import { X, CheckCircle, Download, Mail, Calendar, User, Building, FileText } from 'lucide-react';

const ApplicationSuccess = ({ application, internship, onClose, onDownload }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  // Debug: Log the application data
  console.log('ApplicationSuccess - Application data:', application);
  console.log('ApplicationSuccess - Internship data:', internship);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Ensure we have the application data
  if (!application) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
          <p>Loading application details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6" />
              <div>
                <h2 className="text-lg font-bold">Application Submitted!</h2>
                <p className="text-green-100 text-xs">Your application has been received</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-white hover:text-green-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Success Message */}
          <div className="text-center mb-4">
            <div className="bg-green-50 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Congratulations!
            </h3>
            <p className="text-sm text-gray-600">
              Your application for <span className="font-semibold text-blue-600">{internship.title}</span> at <span className="font-semibold text-blue-600">{internship.company}</span> has been submitted successfully.
            </p>
          </div>
          
          {/* Application Details Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center mb-2">
              <FileText className="h-4 w-4 text-blue-600 mr-1" />
              <h4 className="font-semibold text-gray-900 text-sm">Application Details</h4>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Application ID:</span>
                <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {application.applicationId || 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Status:</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                  {application.status || 'Under Review'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Submitted:</span>
                <span className="text-xs text-gray-900">
                  {formatDate(application.submittedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <h5 className="font-semibold text-amber-800 text-sm mb-1">What happens next?</h5>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• Our team will review your application</li>
              <li>• Shortlisted candidates will be contacted for interviews</li>
              <li>• You'll receive updates via email</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium text-sm"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Confirmation
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center text-xs text-gray-500 bg-gray-50 rounded-lg py-1">
              <Mail className="h-3 w-3 mr-1" />
              Confirmation email sent to {application.applicantEmail || 'your email'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSuccess;
