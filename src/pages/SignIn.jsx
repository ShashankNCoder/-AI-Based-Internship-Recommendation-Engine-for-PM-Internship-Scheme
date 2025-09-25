import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import AuthModal from '../components/AuthModal';

const SignIn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/';
  const [showAuthModal, setShowAuthModal] = useState(true);

  const handleAuthSuccess = () => {
    // Redirect to the original page they were trying to access
    navigate(from, { replace: true });
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-16">
      <div className="flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600 mb-8">
            Sign in to access personalized internship recommendations and apply for opportunities
          </p>
        </div>

        {/* Auth Modal */}
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => navigate('/')}
          mode="login"
          onSuccess={handleAuthSuccess}
        />

        {/* Features */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 text-center">
            What you'll get access to:
          </h3>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              AI-powered resume analysis and skill extraction
            </div>
            <div className="flex items-center text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              Personalized internship recommendations
            </div>
            <div className="flex items-center text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              Direct application to internships
            </div>
            <div className="flex items-center text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              Track your applications and progress
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
