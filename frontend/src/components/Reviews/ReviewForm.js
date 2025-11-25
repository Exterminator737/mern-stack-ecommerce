import React, { useState } from "react";
import { Star, X } from "lucide-react";

const ReviewForm = ({ onClose, onSubmit, isSubmitting }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [photoUrls, setPhotoUrls] = useState([""]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (comment.trim().length < 10) {
      setError("Review must be at least 10 characters");
      return;
    }
    const photos = photoUrls
      .map((u) => u.trim())
      .filter(Boolean)
      .slice(0, 5);
    onSubmit({ rating, title, comment, photos });
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3
                className="text-lg leading-6 font-medium text-gray-900"
                id="modal-title"
              >
                Write a Review
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Rating */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overall Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className="focus:outline-none transition-transform hover:scale-110"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoverRating || rating)
                            ? "fill-current text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-500">
                    {rating
                      ? rating === 1
                        ? "Poor"
                        : rating === 2
                        ? "Fair"
                        : rating === 3
                        ? "Average"
                        : rating === 4
                        ? "Good"
                        : "Excellent"
                      : "Select a rating"}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Review Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Example: Great product!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
              </div>

              {/* Comment */}
              <div className="mb-4">
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Review
                </label>
                <textarea
                  id="comment"
                  rows="4"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="What did you like or dislike?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                ></textarea>
              </div>

              {/* UGC Photos (URLs) */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Photos (optional)
                  </label>
                  <span className="text-xs text-gray-400">
                    Add up to 5 URLs
                  </span>
                </div>
                <div className="space-y-2">
                  {photoUrls.map((url, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="url"
                        placeholder="https://example.com/photo.jpg"
                        value={url}
                        onChange={(e) => {
                          const next = [...photoUrls];
                          next[idx] = e.target.value;
                          setPhotoUrls(next);
                        }}
                        className="flex-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      {photoUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setPhotoUrls(photoUrls.filter((_, i) => i !== idx))
                          }
                          className="text-xs text-gray-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {photoUrls.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrls([...photoUrls, ""])}
                    className="mt-2 text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Add another photo URL
                  </button>
                )}
                {/* Preview thumbnails */}
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {photoUrls.map((u, i) =>
                    u ? (
                      <img
                        key={i}
                        src={u}
                        alt={`Preview ${i + 1}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-16 object-cover rounded"
                      />
                    ) : null
                  )}
                </div>
              </div>

              {error && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              <div className="mt-5 sm:mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm ${
                    isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
