'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarRating from '@/components/ui/star-rating';
import { Button } from '@/components/ui/button';
import axios from 'axios';

interface OrganizerProfile {
  organizer: {
    id: number;
    name: string | null;
    email: string;
    profile_picture?: string | null;
    created_at: string;
  };
  statistics: {
    total_events: number;
    past_events: number;
    upcoming_events: number;
    total_tickets_sold: number;
    average_rating: number;
    total_reviews: number;
    rating_distribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
  recent_reviews: Array<{
    id: number;
    rating: number;
    comment: string | null;
    created_at: string;
    events: {
      id: number;
      title: string;
    };
    users: {
      id: number;
      name: string | null;
      profile_picture: string | null;
    };
  }>;
  events: {
    total: number;
    past: Array<{
      id: number;
      title: string;
      date: string;
      category: string;
      total_seats: number;
      available_seats: number;
    }>;
    upcoming: Array<{
      id: number;
      title: string;
      date: string;
      category: string;
      total_seats: number;
      available_seats: number;
    }>;
  };
}

export default function OrganizerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchOrganizerProfile(params.id as string);
    }
  }, [params.id]);

  const fetchOrganizerProfile = async (organizerId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8000/api/reviews/organizer/${organizerId}`
      );
      setProfile(response.data);
    } catch (error: unknown) {
      console.error('Error fetching organizer profile:', error);
      setError('Failed to load organizer profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderRatingDistribution = () => {
    if (!profile) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count =
            profile.statistics.rating_distribution[
              rating as keyof typeof profile.statistics.rating_distribution
            ];
          const percentage =
            profile.statistics.total_reviews > 0
              ? (count / profile.statistics.total_reviews) * 100
              : 0;

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
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-40 bg-gray-200 rounded"></div>
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Organizer not found'}
            </h1>
            <Button onClick={() => router.push('/')}>Go Back Home</Button>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile.organizer.name || 'Event Organizer'}
                </h1>
                <p className="text-gray-600">{profile.organizer.email}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {profile.statistics.average_rating.toFixed(1)}
                </div>
                <StarRating
                  rating={Math.round(profile.statistics.average_rating)}
                  readonly
                  size="lg"
                />
                <p className="text-sm text-gray-600 mt-1">
                  {profile.statistics.total_reviews} review
                  {profile.statistics.total_reviews !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {profile.statistics.total_events}
              </div>
              <p className="text-gray-600">Total Events</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {profile.statistics.total_tickets_sold}
              </div>
              <p className="text-gray-600">Total Tickets Sold</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {profile.statistics.average_rating.toFixed(1)}
              </div>
              <p className="text-gray-600">Average Rating</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {profile.statistics.total_reviews}
              </div>
              <p className="text-gray-600">Total Reviews</p>
            </div>
          </div>

          {/* Rating Distribution and Events */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Rating Distribution */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4">Rating Distribution</h2>
              {renderRatingDistribution()}
            </div>

            {/* Recent Events */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-6">Events</h2>
                <div className="grid gap-4">
                  {profile.events.total === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No events found</p>
                    </div>
                  ) : (
                    [...profile.events.past, ...profile.events.upcoming].map(
                      (event) => (
                        <div
                          key={event.id}
                          className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => router.push(`/events/${event.id}`)}
                        >
                          <div className="w-16 h-16 relative bg-gray-200 rounded-lg overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {event.category.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {event.title}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">
                              {formatDate(event.date)} • {event.category}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">
                                {event.total_seats - event.available_seats}/
                                {event.total_seats} tickets sold
                              </span>
                            </div>
                          </div>
                          <div className="text-gray-400">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
