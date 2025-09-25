import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Star, Search, Users, Shield, Zap, ArrowDown, Award, Target, Globe, Heart, TrendingUp } from 'lucide-react';

const Home = () => {
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const missionRef = useRef(null);

  const features = [
    {
      icon: Upload,
      title: 'AI Resume Analysis',
      description: 'Upload your resume and let our AI extract your skills, experience, and preferences automatically.'
    },
    {
      icon: Star,
      title: 'Smart Recommendations',
      description: 'Get personalized internship recommendations based on your profile and career goals.'
    },
    {
      icon: Search,
      title: 'Advanced Filtering',
      description: 'Filter internships by skills, location, category, stipend, and duration.'
    },
    {
      icon: Users,
      title: 'Fair Matching',
      description: 'Our algorithm ensures fair and unbiased matching for all applicants.'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data is secure and anonymized. We prioritize your privacy.'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get matched with suitable internships in seconds, not days.'
    }
  ];

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  useEffect(() => {
    // Add smooth scrolling behavior to the entire page
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-14 sm:pt-16">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center text-center py-8 sm:py-12 lg:py-20 px-3 sm:px-4 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-48 h-48 sm:w-72 sm:h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* PM Modi Photo and Quote */}
          <div className="flex flex-col lg:flex-row items-center justify-center mb-8 sm:mb-12 gap-4 sm:gap-8">
            <div className="lg:w-1/3 flex justify-center">
              <div className="relative group">
                <img 
                  src="https://media.gettyimages.com/id/1824260444/photo/dubai-united-arab-emirates-indian-prime-minister-narendra-modi-speaks-during-day-one-of-the.jpg?s=612x612&w=0&k=20&c=lJbhhzQIHqYtqT80GxhORlaeaMI9U4aYO31x4J3_iII=" 
                  alt="Honorable Prime Minister Narendra Modi"
                  className="w-48 h-48 sm:w-64 sm:h-64 rounded-2xl shadow-2xl object-cover border-4 border-white transform group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-blue-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </div>
            </div>
            
            <div className="lg:w-2/3 text-center lg:text-left">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg">
                <Award className="h-8 w-8 sm:h-12 sm:w-12 text-yellow-500 mx-auto lg:mx-0 mb-3 sm:mb-4" />
                <blockquote className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-800 mb-3 sm:mb-4 italic">
                  "Empowering the youth with opportunities is empowering the nation's future."
                </blockquote>
                <cite className="text-sm sm:text-base lg:text-lg text-blue-600 font-medium">
                  - Honorable Prime Minister Narendra Modi
                </cite>
                <p className="text-gray-600 mt-2 sm:mt-3 text-sm sm:text-base">
                  Supporting the PM Internship Scheme for skill development and nation building
                </p>
              </div>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            AI-Powered 
            <span className="text-blue-600 block"> Internship Platform</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-2">
            Revolutionizing the <span className="font-semibold text-blue-600">PM Internship Scheme</span> with 
            artificial intelligence. Get matched with the perfect internship based on your skills, 
            location, and career aspirations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-2">
            <Link to="/upload" className="btn-primary text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 py-3 sm:py-4 transform hover:scale-105 transition-transform">
              <Upload className="inline h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-1 sm:mr-2" />
              Upload Resume & Get Started
            </Link>
            <Link to="/internships" className="btn-secondary text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 py-3 sm:py-4 transform hover:scale-105 transition-transform">
              <Search className="inline h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-1 sm:mr-2" />
              Browse Internships
            </Link>
          </div>

          {/* Scroll Indicator */}
          <button 
            onClick={() => scrollToSection(featuresRef)}
            className="animate-bounce inline-flex flex-col items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span className="text-sm mb-2">Discover More</span>
            <ArrowDown className="h-6 w-6" />
          </button>
        </div>
      </section>

      {/* Mission Section */}
      <section ref={missionRef} className="py-12 sm:py-16 lg:py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="text-center mb-12 sm:mb-16">
            <Target className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 mx-auto mb-3 sm:mb-4" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Our Mission
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              To bridge the gap between talented youth and meaningful opportunities through 
              technology-driven solutions under the PM Internship Scheme
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-4 sm:p-6">
              <Globe className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Nationwide Reach</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Connecting students from every corner of India with quality internship opportunities
              </p>
            </div>
            
            <div className="text-center p-4 sm:p-6">
              <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-red-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Youth Empowerment</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Empowering the next generation with practical experience and skill development
              </p>
            </div>
            
            <div className="text-center p-4 sm:p-6">
              <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Career Growth</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Fostering professional growth and building future leaders of India
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <Star className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-500 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
            We combine cutting-edge AI technology with user-friendly design to revolutionize 
            internship matching under the PM Internship Scheme
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="card p-4 sm:p-6 lg:p-8 text-center transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Government Initiative Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 text-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/800px-Flag_of_India.svg.png" 
            alt="Indian Flag"
            className="w-20 h-12 sm:w-24 sm:h-16 mx-auto mb-4 sm:mb-6 object-cover"
          />
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
            Supported by Government of India
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 max-w-3xl mx-auto">
            This platform is part of the PM Internship Scheme initiative to provide meaningful 
            internship opportunities to India's youth and contribute to nation building
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">50,000+</div>
              <div className="text-sm sm:text-base">Students Registered</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">1,000+</div>
              <div className="text-sm sm:text-base">Partner Organizations</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">95%</div>
              <div className="text-sm sm:text-base">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 sm:mb-12">
            Platform Statistics
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div className="p-4 sm:p-6">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-600 mb-1 sm:mb-2">500+</div>
              <div className="text-gray-600 text-sm sm:text-base lg:text-lg">Internships Available</div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-600 mb-1 sm:mb-2">95%</div>
              <div className="text-gray-600 text-sm sm:text-base lg:text-lg">Match Accuracy</div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-600 mb-1 sm:mb-2">2,000+</div>
              <div className="text-gray-600 text-sm sm:text-base lg:text-lg">Successful Matches</div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-orange-600 mb-1 sm:mb-2">50+</div>
              <div className="text-gray-600 text-sm sm:text-base lg:text-lg">Cities Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90">
            Join thousands of students who have found their perfect internship through our AI-powered platform
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link 
              to="/upload" 
              className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base lg:text-lg hover:bg-blue-700 transition-colors transform hover:scale-105"
            >
              Start with Resume Upload
            </Link>
            <Link 
              to="/internships" 
              className="bg-gray-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base lg:text-lg hover:bg-gray-600 transition-colors transform hover:scale-105"
            >
              Explore Opportunities
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Navigation */}
      <div className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 z-50 flex flex-col gap-2">
        <button
          onClick={() => scrollToSection(missionRef)}
          className="bg-blue-600 text-white p-2 sm:p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Scroll to Mission"
        >
          <Target className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          onClick={() => scrollToSection(featuresRef)}
          className="bg-green-600 text-white p-2 sm:p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors"
          title="Scroll to Features"
        >
          <Star className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          onClick={() => scrollToSection(statsRef)}
          className="bg-purple-600 text-white p-2 sm:p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
          title="Scroll to Stats"
        >
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        /* Smooth scrolling for older browsers */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default Home;