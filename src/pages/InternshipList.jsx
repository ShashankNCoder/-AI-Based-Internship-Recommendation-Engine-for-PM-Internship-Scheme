import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import InternshipCard from '../components/InternshipCard';
import SkillFilter from '../components/SkillFilter';
import { internshipAPI } from '../services/api';

const InternshipList = () => {
  const [internships, setInternships] = useState([]);
  const [filteredInternships, setFilteredInternships] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    skills: [],
    location: '',
    category: '',
    stipendRange: [0, 5000],
    duration: ''
  });
  const [viewMode, setViewMode] = useState('grid');
  const [maxStipend, setMaxStipend] = useState(50000);
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [displayedInternships, setDisplayedInternships] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchAll() {
      try {
        const data = await internshipAPI.getInternships();
        if (!isMounted) return;
        const list = Array.isArray(data) ? data : [];
        setInternships(list);
        setFilteredInternships(list);
        // Compute dynamic stipend upper bound
        const maxSeen = list.reduce((mx, it) => {
          const val = typeof it.stipend === 'number' ? it.stipend : parseInt(it.stipend || 0);
          return isNaN(val) ? mx : Math.max(mx, val);
        }, 0);
        const dynamicMax = Math.max(5000, maxSeen || 0);
        setMaxStipend(dynamicMax);
        setFilters(prev => ({ ...prev, stipendRange: [0, dynamicMax] }));
      } catch (e) {
        setInternships([]);
        setFilteredInternships([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchAll();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    filterInternships();
  }, [searchTerm, filters, internships]);

  // Update displayed internships when filtered internships or pagination changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedInternships(filteredInternships.slice(startIndex, endIndex));
  }, [filteredInternships, currentPage, itemsPerPage]);

  const filterInternships = () => {
    let filtered = internships;

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(internship =>
        internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        internship.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    filtered = filtered.filter(internship => {
      if (filters.skills.length > 0 && !filters.skills.some(skill => 
        internship.skills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
      )) {
        return false;
      }
      
      if (filters.location && internship.location.toLowerCase() !== filters.location.toLowerCase()) {
        return false;
      }
      
      if (filters.category && internship.category.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }
      
      if (internship.stipend < filters.stipendRange[0] || internship.stipend > filters.stipendRange[1]) {
        return false;
      }
      
      if (filters.duration && internship.duration !== filters.duration) {
        return false;
      }
      
      return true;
    });

    setFilteredInternships(filtered);
  };

  const handleFiltersChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      skills: [],
      location: '',
      category: '',
      stipendRange: [0, 5000],
      duration: ''
    });
    setSearchTerm('');
  };

  // Pagination handlers
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate pagination info
  const totalPages = Math.ceil(filteredInternships.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredInternships.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 pt-14 sm:pt-16 lg:pt-24">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Browse Internships
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">
            Discover {internships.length} available internships in the PM Internship Scheme
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
            <input
              type="text"
              placeholder="Search internships by title, company, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        {/* View Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <span className="text-xs sm:text-sm text-gray-600">
              Showing {startItem}-{endItem} of {filteredInternships.length} internships
            </span>
            
            {/* Items per page selector */}
            <div className="flex items-center space-x-2">
              <label className="text-xs sm:text-sm text-gray-600">Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={6}>6 per page</option>
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
                <option value={48}>48 per page</option>
                <option value={96}>96 per page</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 sm:p-2 rounded-lg ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
              }`}
            >
              <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 sm:p-2 rounded-lg ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
              }`}
            >
              <List className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <SkillFilter
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          maxStipend={maxStipend}
        />

        {/* Results */}
        <div>
          {filteredInternships.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No internships found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className={`grid gap-4 sm:gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {displayedInternships.map((internship) => (
                  <InternshipCard
                    key={internship.id}
                    internship={internship}
                    showMatchScore={false}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                  <div className="text-xs sm:text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <span className="sm:hidden">Next</span>
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternshipList;