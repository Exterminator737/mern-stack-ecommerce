import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ReviewSummary from './ReviewSummary';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import { useNavigate } from 'react-router-dom';

const Reviews = ({ productId }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    rating: 0,
    numReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  // Filters & Sorting
  const [filters, setFilters] = useState([]);
  const [sortBy, setSortBy] = useState('helpful');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId, page, sortBy, filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const ratingQuery = filters.length > 0 ? `&rating=${filters.join(',')}` : '';
      const url = `/api/reviews/product/${productId}?page=${page}&sort=${sortBy}${ratingQuery}`;
      
      const res = await axios.get(url);
      
      setReviews(res.data.reviews);
      setTotalPages(res.data.totalPages);
      
      // Update stats only if not filtering (or handle partial updates if needed)
      // But usually stats represent the WHOLE product, not just the filtered view.
      // The backend returns 'distribution' which is total distribution.
      // We should calculate average rating from product details usually, but let's use what we have.
      // We might need to fetch product details separately or trust the review aggregation.
      // The backend response includes distribution.
      
      // Let's calculate weighted average from distribution if available
      const dist = res.data.distribution;
      let totalCount = 0;
      let weightedSum = 0;
      Object.keys(dist).forEach(star => {
        totalCount += dist[star];
        weightedSum += dist[star] * Number(star);
      });
      
      const avgRating = totalCount > 0 ? weightedSum / totalCount : 0;
      
      setStats({
        rating: avgRating,
        numReviews: totalCount,
        distribution: dist
      });
      
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setShowModal(true);
  };

  const handleSubmitReview = async (data) => {
    try {
      setIsSubmitting(true);
      await axios.post(`/api/reviews/product/${productId}`, data);
      setShowModal(false);
      // Refresh reviews
      fetchReviews();
      // Reset page/sort? Maybe keeps it fresh.
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await axios.put(`/api/reviews/${reviewId}/helpful`);
      // Update local state to avoid full re-fetch flicker
      setReviews(prev => prev.map(r => 
        r._id === reviewId ? { ...r, helpfulCount: res.data.helpfulCount } : r
      ));
    } catch (error) {
      if (error.response?.status === 400) {
        // Already voted
      } else {
        console.error('Error marking helpful:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8 mb-8" id="reviews">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
        <button
          onClick={handleWriteReview}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
        >
          Write a Review
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar: Summary & Filters */}
        <div className="lg:w-1/3 flex-shrink-0">
          <ReviewSummary 
            rating={stats.rating}
            numReviews={stats.numReviews}
            distribution={stats.distribution}
            filters={filters}
            onFilterChange={setFilters}
          />
        </div>

        {/* Right Side: List */}
        <ReviewList 
          reviews={reviews}
          sortBy={sortBy}
          onSortChange={setSortBy}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onHelpful={handleHelpful}
          loading={loading}
        />
      </div>

      {showModal && (
        <ReviewForm 
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitReview}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default Reviews;
