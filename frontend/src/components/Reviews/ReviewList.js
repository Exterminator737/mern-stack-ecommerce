import React from 'react';
import ReviewItem from './ReviewItem';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ReviewList = ({ 
  reviews, 
  sortBy, 
  onSortChange, 
  page, 
  totalPages, 
  onPageChange, 
  onHelpful, 
  loading 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Header & Sorting */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div className="text-sm text-gray-500">
          Showing {reviews.length} reviews
        </div>
        <div className="flex items-center">
          <label htmlFor="sort" className="mr-2 text-sm text-gray-600">Sort by:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 shadow-sm py-1 pl-2 pr-8"
          >
            <option value="helpful">Most Helpful</option>
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No reviews found matching your criteria.
        </div>
      ) : (
        <div className="space-y-2">
          {reviews.map(review => (
            <ReviewItem 
              key={review._id} 
              review={review} 
              onHelpful={onHelpful} 
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {[...Array(totalPages)].map((_, i) => {
              const p = i + 1;
              // Simple pagination logic: show all pages for now (can be optimized for many pages)
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === p
                      ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
