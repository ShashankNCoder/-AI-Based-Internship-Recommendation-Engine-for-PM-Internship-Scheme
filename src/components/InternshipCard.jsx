import React from 'react';
import { MapPin, Calendar, IndianRupee, Star, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InternshipCard = ({ internship, showMatchScore = false }) => {
  const navigate = useNavigate();

  const handleApplyClick = () => {
    // Navigate to internship detail page
    navigate(`/internships/${internship.id}`);
  };

  return (
    <div className="card p-4 sm:p-6 hover:scale-105 transition-transform duration-200">
      <div className="flex justify-between items-start mb-2 sm:mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
            {internship.title}
          </h3>
          <div className="flex items-center text-gray-600 mb-2">
            <Building className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">{internship.company}</span>
          </div>
        </div>
        
        {showMatchScore && (
          <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full flex-shrink-0 ml-2">
            <Star className="h-3 w-3 mr-1" />
            <span className="text-xs font-medium">{internship.matchScore}%</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-gray-600 mb-3 space-y-1 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center">
          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
          <span className="truncate">{internship.location}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
          <span>{internship.duration}</span>
        </div>
        <div className="flex items-center">
          <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
          <span>{internship.stipend}/month</span>
        </div>
      </div>

      <p className="text-gray-700 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">
        {internship.description}
      </p>

      <div className="mb-3 sm:mb-4">
        <div className="flex flex-wrap gap-1">
          {internship.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
            >
              {skill}
            </span>
          ))}
          {internship.skills.length > 3 && (
            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
              +{internship.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      <button 
        onClick={handleApplyClick}
        className="w-full btn-primary py-2 text-xs sm:text-sm"
      >
        Apply Now
      </button>
    </div>
  );
};

export default InternshipCard;