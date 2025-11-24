import React from 'react';
import { Star } from 'lucide-react';

const ReviewSummary = ({ rating, numReviews, distribution, filters, onFilterChange }) => {
  const colors = {
    5: 'bg-green-500',
    4: 'bg-lime-400',
    3: 'bg-yellow-400',
    2: 'bg-orange-400',
    1: 'bg-red-500'
  };

  const handleCheckboxChange = (star) => {
    const newFilters = filters.includes(star)
      ? filters.filter(f => f !== star)
      : [...filters, star];
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Reviews</h3>
      
      <div className="flex items-center mb-4">
        <div className="text-5xl font-bold text-gray-900 mr-4">{rating.toFixed(1)}</div>
        <div>
          <div className="flex items-center text-yellow-400 mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`h-5 w-5 ${star <= Math.round(rating) ? 'fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">{numReviews} Reviews</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] || 0;
          const percentage = numReviews > 0 ? (count / numReviews) * 100 : 0;
          
          return (
            <div key={star} className="flex items-center text-sm">
              <div className="w-12 text-gray-600 flex items-center">
                <span className="mr-1">{star}</span>
                <Star className="h-3 w-3 fill-current text-gray-400" />
              </div>
              <div className="flex-1 mx-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${colors[star]}`} 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <div className="w-10 text-right text-gray-500">{count}</div>
            </div>
          );
        })}
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Filter reviews</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <label key={star} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={filters.includes(star)}
                onChange={() => handleCheckboxChange(star)}
              />
              <span className="ml-2 text-sm text-gray-600 flex items-center">
                {star} <Star className="h-3 w-3 ml-1 fill-current text-gray-400" />
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewSummary;
