import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import InternshipCard from '../components/InternshipCard';
import SkillFilter from '../components/SkillFilter';
import { Filter, Star, TrendingUp, Target } from 'lucide-react';
import { internshipAPI } from '../services/api';

const Recommendations = () => {
  const { state } = useApp();
  const [recommendations, setRecommendations] = useState([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState([]);
  const [filters, setFilters] = useState({
    skills: [],
    location: '',
    category: '',
    stipendRange: [0, 5000],
    duration: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRecommendations = async () => {
      setLoading(true);
      try {
        const res = await internshipAPI.getRecommendations(state.userProfile);
        const combined = [...(res.local || []), ...(res.overall || [])];
        // Deduplicate by id, prefer local entries
        const seen = new Set();
        const unique = [];
        for (const item of combined) {
          if (item && !seen.has(item.id)) {
            seen.add(item.id);
            unique.push(item);
          }
        }
        setRecommendations(unique);
        setFilteredRecommendations(unique);
      } catch (e) {
        setRecommendations([]);
        setFilteredRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    getRecommendations();
  }, [state.userProfile]);

  const handleFiltersChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    // Apply filters
    const filtered = recommendations.filter(internship => {
      if (newFilters.skills.length > 0 && !newFilters.skills.some(skill => 
        internship.skills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
      )) {
        return false;
      }
      
      if (newFilters.location && internship.location.toLowerCase() !== newFilters.location.toLowerCase()) {
        return false;
      }
      
      if (newFilters.category && internship.category.toLowerCase() !== newFilters.category.toLowerCase()) {
        return false;
      }
      
      if (internship.stipend < newFilters.stipendRange[0] || internship.stipend > newFilters.stipendRange[1]) {
        return false;
      }
      
      if (newFilters.duration && internship.duration !== newFilters.duration) {
        return false;
      }
      
      return true;
    });
    
    setFilteredRecommendations(filtered);
  };

  const handleClearFilters = () => {
    setFilters({
      skills: [],
      location: '',
      category: '',
      stipendRange: [0, 5000],
      duration: ''
    });
    setFilteredRecommendations(recommendations);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Analyzing your profile...</h2>
          <p className="text-gray-600">Finding the perfect internship matches for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Star className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-900">AI Recommendations</h1>
          </div>
          <p className="text-lg text-gray-600">
            Personalized internship matches based on your resume analysis
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{recommendations.length}</div>
            <div className="text-gray-600">Total Matches</div>
          </div>
          <div className="card p-6 text-center">
            <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {recommendations.length > 0 ? Math.max(...recommendations.map(r => r.matchScore)) : 0}%
            </div>
            <div className="text-gray-600">Best Match Score</div>
          </div>
          <div className="card p-6 text-center">
            <Filter className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{filteredRecommendations.length}</div>
            <div className="text-gray-600">Filtered Results</div>
          </div>
        </div>

        {/* Filters */}
        <SkillFilter
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {/* Results */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Recommended Internships ({filteredRecommendations.length})
          </h2>
          
          {filteredRecommendations.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more results</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecommendations.map((internship) => (
                <InternshipCard
                  key={internship.id}
                  internship={internship}
                  showMatchScore={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;