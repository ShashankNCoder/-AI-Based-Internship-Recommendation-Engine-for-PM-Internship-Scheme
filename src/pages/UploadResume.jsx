import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ResumeUploader from '../components/ResumeUploader';
import { CheckCircle, AlertCircle, FileText, MapPin, Briefcase, GraduationCap } from 'lucide-react';

const UploadResume = () => {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileProcessed = (data) => {
    setAnalysis(data);
    dispatch({ type: 'SET_USER_PROFILE', payload: data });
  };

  const handleGetRecommendations = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      navigate('/recommendations');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upload Your Resume
          </h1>
          <p className="text-lg text-gray-600">
            Let our AI analyze your resume and find the perfect internship matches for you.
          </p>
        </div>

        {!analysis ? (
          <ResumeUploader onFileProcessed={handleFileProcessed} />
        ) : (
          <div className="space-y-6">
            {/* Analysis Results */}
            <div className="card p-6">
              <div className="flex items-center space-x-2 mb-6">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  Resume Analysis Complete
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Skills Found</h3>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      {analysis.skills.slice(0, 4).map((skill, index) => (
                        <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                      {analysis.skills.length > 4 && (
                        <span className="text-xs text-gray-500">
                          +{analysis.skills.length - 4} more
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      placeholder="Edit skills (comma-separated)"
                      value={(analysis.skills || []).join(', ')}
                      onChange={(e) => {
                        const skills = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        const updated = { ...analysis, skills };
                        setAnalysis(updated);
                        dispatch({ type: 'SET_USER_PROFILE', payload: updated });
                      }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Location</h3>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-700 text-center"
                    value={analysis.location}
                    onChange={(e) => {
                      const updated = { ...analysis, location: e.target.value };
                      setAnalysis(updated);
                      dispatch({ type: 'SET_USER_PROFILE', payload: updated });
                    }}
                  />
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <GraduationCap className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Education</h3>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-700 text-center capitalize"
                    value={analysis.education}
                    onChange={(e) => {
                      const updated = { ...analysis, education: e.target.value };
                      setAnalysis(updated);
                      dispatch({ type: 'SET_USER_PROFILE', payload: updated });
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetRecommendations}
                disabled={loading}
                className="btn-primary flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Finding Recommendations...
                  </>
                ) : (
                  <>
                    Get AI Recommendations
                  </>
                )}
              </button>
              
              <button
                onClick={() => setAnalysis(null)}
                className="btn-secondary"
              >
                Upload Different Resume
              </button>
            </div>

            {/* Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">Pro Tip</h4>
                  <p className="text-yellow-700 text-sm">
                    Make sure your resume includes specific skills, projects, and experience details 
                    for more accurate recommendations. Our AI works best with detailed information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadResume;