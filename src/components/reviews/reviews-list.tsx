'use client';
import React, { useState, useEffect } from 'react';
import StarRating from '@/components/ui/star-rating';
import { Button } from '@/components/ui/button';
import { ReviewCard, Review } from './review-card';
import { ReviewForm } from './review-form';
import axios from 'axios';

interface ReviewsListProps {
  eventId: number;
  eventTitle: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export function ReviewsList({ eventId, eventTitle }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
    checkIfCanReview();
    getCurrentUser();
  }, [eventId]);

  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:8000/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.user && response.data.user.id) {
        setCurrentUserId(response.data.user.id);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8000/api/reviews/event/${eventId}`
      );

      if (
        response.data &&
        response.data.reviews &&
        Array.isArray(response.data.reviews)
      ) {
        setReviews(response.data.reviews);
      } else {
        setReviews([]);
      }

      if (response.data && response.data.stats) {
        setStats(response.data.stats);
      } else {
        setStats(null);
      }

      // Check if current user has already reviewed this event
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userResponse = await axios.get(
            'http://localhost:8000/api/profile',
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (
            userResponse.data &&
            userResponse.data.user &&
            userResponse.data.user.id
          ) {
            const userId = userResponse.data.user.id;
            const reviews = response.data?.reviews || [];
            const existingReview = Array.isArray(reviews)
              ? reviews.find((r: Review) => r.user.id === userId)
              : null;
            setUserReview(existingReview || null);
          }
        } catch (error) {
          // User not authenticated, ignore
        }
      }
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const checkIfCanReview = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCanReview(false);
        return;
      }

      const response = await axios.get(
        'http://localhost:8000/api/reviews/reviewable-events',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response.data &&
        response.data.events &&
        Array.isArray(response.data.events)
      ) {
        const canReviewThis = response.data.events.some(
          (event: any) => event.id === eventId
        );
        setCanReview(canReviewThis);
      } else {
        setCanReview(false);
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      setCanReview(false);
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    fetchReviews();
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const renderRatingDistribution = () => {
    if (!stats || !stats.distribution || !stats.totalReviews) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count =
            stats.distribution[rating as keyof typeof stats.distribution] || 0;
          const percentage =
            stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

          return (
            <div key={rating} className="flex items-center gap-2 text-sm">
              <span className="w-3">{rating}</span>
              <span className="text-yellow-500">★</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-gray-600">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Reviews & Ratings</h2>
      {/* Rating Summary */}{' '}
      {stats &&
        stats.averageRating !== undefined &&
        stats.totalReviews !== undefined && (
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                <StarRating
                  rating={Math.round(stats.averageRating)}
                  readonly
                  size="lg"
                />
                <p className="text-gray-600 mt-2">
                  Based on {stats.totalReviews} review
                  {stats.totalReviews !== 1 ? 's' : ''}
                </p>
              </div>
              <div>{renderRatingDistribution()}</div>
            </div>
          </div>
        )}
      {/* Review Form or Write Review Button */}
      {canReview && !userReview && !showReviewForm && (
        <div className="mb-6">
          <Button
            onClick={() => setShowReviewForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Write a Review
          </Button>
        </div>
      )}
      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-6">
          <ReviewForm
            eventId={eventId}
            onReviewSubmitted={handleReviewSubmitted}
            onCancel={() => {
              setShowReviewForm(false);
              setEditingReview(null);
            }}
            initialReview={
              editingReview
                ? {
                    id: editingReview.id,
                    rating: editingReview.rating,
                    comment: editingReview.comment,
                  }
                : undefined
            }
          />
        </div>
      )}
      {/* Reviews List */}
      <div className="space-y-4">
        {error && (
          <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
        )}

        {reviews.length === 0 && !error ? (
          <div className="text-center py-8 text-gray-500">
            <p>No reviews yet.</p>
            {canReview && (
              <p className="text-sm mt-2">Be the first to review this event!</p>
            )}
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId || undefined}
              onReviewUpdated={fetchReviews}
              onEditClick={handleEditReview}
            />
          ))
        )}
      </div>
    </div>
  );
}
