'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ReviewCard, Review } from '@/components/reviews/review-card';
import { ReviewForm } from '@/components/reviews/review-form';
import { Button } from '@/components/ui/button';
import axios from 'axios';

interface ReviewWithEvent extends Review {
  event: {
    id: number;
    title: string;
    date: string;
    image: string | null;
  };
}

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReview, setEditingReview] = useState<ReviewWithEvent | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchMyReviews();
  }, [router]);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(
        'http://localhost:8000/api/reviews/user',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReviews(response.data.reviews);
    } catch (error: unknown) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load your reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = (review: ReviewWithEvent) => {
    setEditingReview(review);
  };

  const handleReviewUpdated = () => {
    setEditingReview(null);
    fetchMyReviews();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
              <Button
                onClick={() => router.push('/customer-dashboard')}
                variant="outline"
              >
                Back to Dashboard
              </Button>
            </div>
            <p className="text-gray-600 mt-2">
              Manage your event reviews and ratings
            </p>
          </div>

          {/* Edit Review Form */}
          {editingReview && (
            <div className="mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 relative bg-gray-200 rounded-lg overflow-hidden">
                    {editingReview.event.image ? (
                      <Image
                        src={editingReview.event.image}
                        alt={editingReview.event.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {editingReview.event.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(editingReview.event.date)}
                    </p>
                  </div>
                </div>
              </div>

              <ReviewForm
                eventId={editingReview.event.id}
                onReviewSubmitted={handleReviewUpdated}
                onCancel={() => setEditingReview(null)}
                initialReview={{
                  id: editingReview.id,
                  rating: editingReview.rating,
                  comment: editingReview.comment,
                }}
              />
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {error && (
              <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                {error}
              </div>
            )}

            {reviews.length === 0 && !error ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No reviews yet
                </h3>
                <p className="text-gray-500 mb-4">
                  You haven&apos;t written any reviews yet. Attend some events
                  and share your experience!
                </p>
                <Button
                  onClick={() => router.push('/')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Browse Events
                </Button>
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-lg shadow-sm border p-6"
                >
                  {/* Event Info */}
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                    <div className="w-16 h-16 relative bg-gray-200 rounded-lg overflow-hidden">
                      {review.event.image ? (
                        <Image
                          src={review.event.image}
                          alt={review.event.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {review.event.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Event Date: {formatDate(review.event.date)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/events/${review.event.id}`)}
                    >
                      View Event
                    </Button>
                  </div>

                  {/* Review */}
                  <ReviewCard
                    review={review}
                    currentUserId={review.user.id}
                    onReviewUpdated={fetchMyReviews}
                    onEditClick={() => handleEditReview(review)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
