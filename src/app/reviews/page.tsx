'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import {
  StarIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import StarRating from '@/components/ui/star-rating';
import { Button } from '@/components/ui/button';

interface ReviewableEvent {
  id: number;
  title: string;
  description: string | null;
  date: string;
  time: string;
  location: string;
  price: number;
  image?: string | null;
  category: string;
  organizer: {
    id: number;
    name: string | null;
    email: string;
  };
  userReview?: {
    id: number;
    rating: number;
    comment: string | null;
    created_at: string;
  };
}

export default function ReviewsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<ReviewableEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReviewableEvents = useCallback(async () => {
    try {
      setLoading(true);

      // Check authentication
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get(
        'http://localhost:8000/api/reviews/reviewable-events',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setEvents(response.data.events || []);
      }
    } catch (error: unknown) {
      console.error('Error fetching reviewable events:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number } };
        if (axiosError.response?.status === 401) {
          router.push('/login');
        } else {
          setError('Failed to load events');
        }
      } else {
        setError('Failed to load events');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchReviewableEvents();
  }, [fetchReviewableEvents]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
            </div>
          </div>
        </div>

        {/* Loading State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="w-3/4 h-6 bg-gray-200 rounded"></div>
                  <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                  <div className="w-full h-4 bg-gray-200 rounded"></div>
                  <div className="w-24 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
          <Button onClick={fetchReviewableEvents}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>{' '}
                <p className="text-gray-600 mt-1">
                  Review events you&apos;ve attended to help other users make
                  informed decisions
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {events.length}
                </div>
                <div className="text-sm text-gray-500">Events Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {events.length === 0 ? (
          <div className="text-center py-16">
            <StarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Events to Review
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven&apos;t attended any events yet, or you&apos;ve already
              reviewed all your attended events.
            </p>
            <Button onClick={() => router.push('/')}>Browse Events</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {event.image && (
                  <div className="h-48 relative">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {event.category}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {event.title}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {formatDate(event.date)} at {event.time}
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-2" />
                      {event.organizer.name}
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  {/* Existing Review Display */}
                  {event.userReview ? (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <StarRating
                          rating={event.userReview.rating}
                          readonly
                          size="sm"
                        />
                        <span className="text-xs text-gray-500">
                          Reviewed on{' '}
                          {new Date(
                            event.userReview.created_at
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {event.userReview.comment && (
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {event.userReview.comment}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <p className="text-yellow-800 text-sm">
                        <strong>⭐ Ready to Review:</strong> Share your
                        experience with this event!
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push(`/reviews/${event.id}`)}
                      className="flex-1"
                      variant={event.userReview ? 'outline' : 'default'}
                    >
                      {event.userReview ? '✏️ Edit Review' : '⭐ Write Review'}
                    </Button>
                    <Button
                      onClick={() => router.push(`/events/${event.id}`)}
                      variant="outline"
                      size="sm"
                    >
                      View Event
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Helpful Tips */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            💡 Review Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">✅ Be Honest & Helpful</h4>
              <p>
                Share your genuine experience to help other users make informed
                decisions.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">📝 Be Specific</h4>
              <p>
                Mention what you liked, what could be improved, and any standout
                moments.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">⭐ Rate Fairly</h4>
              <p>
                Consider the overall experience: venue, organization, value, and
                enjoyment.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🤝 Be Respectful</h4>
              <p>
                Provide constructive feedback that helps organizers improve
                future events.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
