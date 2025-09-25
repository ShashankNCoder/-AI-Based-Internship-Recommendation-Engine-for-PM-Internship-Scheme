import React, { useState, useEffect, useRef } from 'react';
import { Filter, X, ChevronDown, Search } from 'lucide-react';
import { SKILLS, LOCATIONS, INTERNSHIP_CATEGORIES, DURATION_OPTIONS } from '../utils/constants';

const SkillFilter = ({ filters, onFiltersChange, onClearFilters, maxStipend = 50000 }) => {
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [skillSearchTerm, setSkillSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Filter skills based on search term
  const filteredSkills = SKILLS.filter(skill =>
    skill.toLowerCase().includes(skillSearchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSkillsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSkillToggle = (skill) => {
    const currentSkills = filters.skills || [];
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    onFiltersChange('skills', newSkills);
  };

  const handleClearSkills = () => {
    onFiltersChange('skills', []);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <button
          onClick={onClearFilters}
          className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
        >
          <X className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Clear all</span>
          <span className="sm:hidden">Clear</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Skills Filter */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills {filters.skills?.length > 0 && (
              <span className="text-blue-600">({filters.skills.length} selected)</span>
            )}
          </label>
          
          {/* Skills Dropdown Button */}
          <button
            type="button"
            onClick={() => setIsSkillsOpen(!isSkillsOpen)}
            className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <span className="text-sm text-gray-700">
              {filters.skills?.length > 0 
                ? `${filters.skills.length} skill${filters.skills.length === 1 ? '' : 's'} selected`
                : 'Select skills'
              }
            </span>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isSkillsOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Skills Dropdown */}
          {isSkillsOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
              {/* Search Input */}
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search skills..."
                    value={skillSearchTerm}
                    onChange={(e) => setSkillSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Skills List */}
              <div className="max-h-48 overflow-y-auto">
                {filteredSkills.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500 text-center">No skills found</div>
                ) : (
                  <div className="p-2">
                    {filteredSkills.map((skill) => (
                      <label
                        key={skill}
                        className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.skills?.includes(skill) || false}
                          onChange={() => handleSkillToggle(skill)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700">{skill}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear Skills Button */}
              {filters.skills?.length > 0 && (
                <div className="p-3 border-t border-gray-200">
                  <button
                    onClick={handleClearSkills}
                    className="w-full text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear all skills
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Selected Skills Display */}
          {filters.skills?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {filters.skills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {skill}
                  <button
                    onClick={() => handleSkillToggle(skill)}
                    className="ml-1 h-4 w-4 rounded-full hover:bg-blue-200 flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {filters.skills.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  +{filters.skills.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <select
            value={filters.location}
            onChange={(e) => onFiltersChange('location', e.target.value)}
            className="input-field"
          >
            <option value="">All Locations</option>
            {LOCATIONS.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => onFiltersChange('category', e.target.value)}
            className="input-field"
          >
            <option value="">All Categories</option>
            {INTERNSHIP_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Duration Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration
          </label>
          <select
            value={filters.duration}
            onChange={(e) => onFiltersChange('duration', e.target.value)}
            className="input-field"
          >
            <option value="">Any Duration</option>
            {DURATION_OPTIONS.map(duration => (
              <option key={duration} value={duration}>{duration}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stipend Range Filter */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Stipend Range: ₹{filters.stipendRange[0]} - ₹{filters.stipendRange[1]}
        </label>
        <input
          type="range"
          min="0"
          max={maxStipend}
          step="100"
          value={filters.stipendRange[1]}
          onChange={(e) => onFiltersChange('stipendRange', [0, parseInt(e.target.value)])}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default SkillFilter;