import React from 'react';
import { Star, ThumbsUp, Flag } from 'lucide-react';

const ReviewItem = ({ review, onHelpful }) => {
  return (
    <div className="border-b border-gray-200 py-6 last:border-b-0">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <h4 className="font-bold text-gray-900">{review.title || 'Untitled Review'}</h4>
          </div>
          <div className="flex items-center text-sm text-gray-500 gap-2">
            <span className="font-medium text-gray-900">{review.name}</span>
            <span>•</span>
            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="mt-2 text-gray-700 leading-relaxed">
        {review.comment}
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm">
        <button 
          onClick={() => onHelpful(review._id)}
          className="flex items-center text-gray-500 hover:text-primary-600 transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200"
        >
          <ThumbsUp className="h-4 w-4 mr-1.5" />
          Helpful ({review.helpfulCount})
        </button>
        
        <button className="text-gray-400 hover:text-red-500 transition-colors flex items-center text-xs">
          <Flag className="h-3 w-3 mr-1" />
          Report
        </button>
      </div>
    </div>
  );
};

export default ReviewItem;
