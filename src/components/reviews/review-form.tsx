'use client';
import React, { useState } from 'react';
import { StarRating } from '@/components/ui/star-rating';
import { Button } from '@/components/ui/button';
import axios from 'axios';

interface ReviewFormProps {
  eventId: number;
  onReviewSubmitted: () => void;
  onCancel: () => void;
  initialReview?: {
    id: number;
    rating: number;
    comment: string;
  };
}

export function ReviewForm({
  eventId,
  onReviewSubmitted,
  onCancel,
  initialReview,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialReview?.rating || 0);
  const [comment, setComment] = useState(initialReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Please provide a comment with at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to submit a review');
      }

      const endpoint = initialReview
        ? `http://localhost:8000/api/reviews/${initialReview.id}`
        : 'http://localhost:8000/api/reviews';

      const method = initialReview ? 'PUT' : 'POST';

      await axios({
        method,
        url: endpoint,
        data: {
          event_id: eventId,
          rating,
          comment: comment.trim(),
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      onReviewSubmitted();
    } catch (error: unknown) {
      console.error('Error submitting review:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data?: { message?: string } } };
        setError(
          axiosError.response?.data?.message ||
            'Failed to submit review. Please try again.'
        );
      } else {
        setError('Failed to submit review. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">
        {initialReview ? 'Edit Your Review' : 'Write a Review'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <StarRating
            rating={rating}
            onRatingChange={setRating}
            size="lg"
            showValue
          />
        </div>

        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Review
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Share your experience with this event..."
            maxLength={1000}
          />
          <p className="text-sm text-gray-500 mt-1">
            {comment.length}/1000 characters
          </p>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            {isSubmitting
              ? initialReview
                ? 'Updating...'
                : 'Submitting...'
              : initialReview
              ? 'Update Review'
              : 'Submit Review'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
