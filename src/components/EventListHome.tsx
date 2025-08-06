'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StarRating from '@/components/ui/star-rating';
import ClientOnly from '@/components/ClientOnly';
import { formatDate, formatCurrency, isEventPast } from '@/utils/format';
import axios from 'axios';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: string;
  available_seats: number;
  total_seats: number;
  category: string;
  image?: string;
  organizer_id: number;
  created_at: string;
  averageRating?: number;
  reviewCount?: number;
  organizer?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function EventListHome() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Events' },
    { value: 'music', label: 'Music' },
    { value: 'sports', label: 'Sports' },
    { value: 'technology', label: 'Technology' },
    { value: 'food', label: 'Food & Drink' },
    { value: 'art', label: 'Art & Culture' },
    { value: 'business', label: 'Business' },
    { value: 'education', label: 'Education' },
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/events');

      // The response should contain an array of events
      const fetchedEvents =
        response.data.events || response.data.data || response.data;
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents =
    selectedCategory === 'all'
      ? events
      : events.filter((event) => event.category === selectedCategory);

  const getEventStatus = (event: Event) => {
    const occupancyRate =
      ((event.total_seats - event.available_seats) / event.total_seats) * 100;

    if (isEventPast(event.date)) return { label: 'Past', color: 'bg-gray-500' };
    if (event.available_seats === 0)
      return { label: 'Sold Out', color: 'bg-red-500' };
    if (occupancyRate >= 90)
      return { label: 'Almost Full', color: 'bg-orange-500' };
    return { label: 'Available', color: 'bg-green-500' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={fetchEvents}
          className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedCategory === category.value
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const status = getEventStatus(event);
            return (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Event Image */}
                <div className="h-48 bg-gray-200 relative">
                  {event.image ? (
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg
                        className="w-16 h-16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Status Badge */}
                  <ClientOnly>
                    <div
                      className={`absolute top-3 right-3 ${status.color} text-white px-2 py-1 rounded-full text-xs font-medium`}
                    >
                      {status.label}
                    </div>
                  </ClientOnly>
                </div>

                {/* Event Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium capitalize">
                      {event.category}
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(parseFloat(event.price))}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {event.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Rating Display */}
                  {event.averageRating && event.reviewCount && (
                    <div className="flex items-center gap-2 mb-3">
                      <StarRating
                        rating={event.averageRating}
                        readonly
                        size="sm"
                      />
                      <span className="text-sm text-gray-600">
                        {event.averageRating.toFixed(1)} ({event.reviewCount}{' '}
                        review{event.reviewCount !== 1 ? 's' : ''})
                      </span>
                    </div>
                  )}

                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {formatDate(event.date)} at {event.time}
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {event.location}
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      {event.available_seats} / {event.total_seats} seats
                      available
                    </div>
                    {event.organizer && (
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <Link
                          href={`/organizer/${event.organizer.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {event.organizer.name || event.organizer.email}
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Book Now Button */}
                  <Link href={`/events/${event.id}`}>
                    <button
                      className={`w-full py-2 px-4 rounded font-medium transition ${
                        event.available_seats > 0
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={event.available_seats === 0}
                    >
                      {event.available_seats > 0 ? 'Book Now' : 'Sold Out'}
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-24 w-24"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No events found
          </h3>
          <p className="text-gray-600">
            {selectedCategory === 'all'
              ? 'There are no events available at the moment.'
              : `No events found in the ${categories
                  .find((c) => c.value === selectedCategory)
                  ?.label.toLowerCase()} category.`}
          </p>
        </div>
      )}
    </div>
  );
}
