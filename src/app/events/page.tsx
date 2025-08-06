'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Event {
	id: number;
	title: string;
	description: string | null;
	date: string;
	time: string;
	location: string;
	price: number;
	available_seats: number;
	total_seats: number;
	category: string;
	image?: string | null;
	organizer_id: number;
	created_at: string;
	updated_at: string;
	organizer?: {
		id: number;
		name: string | null;
		email: string;
	};
}

export default function EventsPage() {
	const [events, setEvents] = useState<Event[]>([]);
	const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('all');
	const router = useRouter();

	const categories = [
		{ value: 'all', label: 'All Events' },
		{ value: 'Music', label: 'Music' },
		{ value: 'Sports', label: 'Sports' },
		{ value: 'Technology', label: 'Technology' },
		{ value: 'Food', label: 'Food & Drink' },
		{ value: 'Art', label: 'Art & Culture' },
		{ value: 'Business', label: 'Business' },
		{ value: 'Education', label: 'Education' },
		{ value: 'Entertainment', label: 'Entertainment' },
		{ value: 'Health', label: 'Health & Wellness' },
		{ value: 'Other', label: 'Other' },
	];

	useEffect(() => {
		fetchEvents();
	}, []);

	const fetchEvents = async () => {
		try {
			setLoading(true);
			const response = await axios.get('http://localhost:8000/api/events');
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

	const filterEvents = useCallback(() => {
		let filtered = events;

		// Filter by category
		if (selectedCategory !== 'all') {
			filtered = filtered.filter(
				(event) => event.category === selectedCategory
			);
		}

		// Filter by search term
		if (searchTerm.trim()) {
			const searchLower = searchTerm.toLowerCase();
			filtered = filtered.filter(
				(event) =>
					event.title.toLowerCase().includes(searchLower) ||
					(event.description &&
						event.description.toLowerCase().includes(searchLower)) ||
					event.location.toLowerCase().includes(searchLower)
			);
		}

		// Sort by date (upcoming events first)
		filtered.sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
		);

		setFilteredEvents(filtered);
	}, [events, searchTerm, selectedCategory]);

	useEffect(() => {
		filterEvents();
	}, [filterEvents]);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
		}).format(price);
	};

	const getEventStatus = (event: Event) => {
		const eventDate = new Date(event.date);
		const now = new Date();
		const occupancyRate =
			((event.total_seats - event.available_seats) / event.total_seats) * 100;

		if (eventDate < now)
			return { status: 'Past', color: 'bg-gray-100 text-gray-800' };
		if (event.available_seats === 0)
			return { status: 'Sold Out', color: 'bg-red-100 text-red-800' };
		if (occupancyRate >= 80)
			return { status: 'Almost Full', color: 'bg-orange-100 text-orange-800' };
		if (eventDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
			return { status: 'This Week', color: 'bg-blue-100 text-blue-800' };
		return { status: 'Available', color: 'bg-green-100 text-green-800' };
	};

	const handleEventClick = (eventId: number) => {
		router.push(`/events/${eventId}`);
	};

	if (loading) {
		return (
			<div className="min-h-screen">
				<Navbar />
				<div className="min-h-screen flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
						<div className="text-lg text-gray-600">Loading events...</div>
					</div>
				</div>
				<Footer />
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen">
				<Navbar />
				<div className="min-h-screen flex items-center justify-center">
					<div className="text-center">
						<div className="text-red-500 text-lg mb-4">{error}</div>
						<Button onClick={fetchEvents}>Try Again</Button>
					</div>
				</div>
				<Footer />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />

			{/* Hero Section */}
			<div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h1 className="text-4xl md:text-6xl font-bold mb-4">
						Discover Amazing Events
					</h1>
					<p className="text-xl md:text-2xl mb-8 opacity-90">
						Find and book tickets for concerts, workshops, sports events, and
						more
					</p>
					<div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
						<Input
							type="text"
							placeholder="Search events..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="flex-1 text-gray-900"
						/>
						<select
							value={selectedCategory}
							onChange={(e) => setSelectedCategory(e.target.value)}
							className="px-4 py-2 rounded-md border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							{categories.map((category) => (
								<option
									key={category.value}
									value={category.value}
								>
									{category.label}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Events Grid */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{filteredEvents.length === 0 ? (
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
									d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V13a2 2 0 012-2z"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							{searchTerm || selectedCategory !== 'all'
								? 'No events found'
								: 'No events available'}
						</h3>
						<p className="text-gray-600 mb-4">
							{searchTerm || selectedCategory !== 'all'
								? 'Try adjusting your search criteria or browse all categories'
								: 'Check back later for new events'}
						</p>
						{(searchTerm || selectedCategory !== 'all') && (
							<div className="space-x-4">
								<Button
									variant="outline"
									onClick={() => {
										setSearchTerm('');
										setSelectedCategory('all');
									}}
								>
									Clear Filters
								</Button>
							</div>
						)}
					</div>
				) : (
					<>
						<div className="flex justify-between items-center mb-8">
							<div>
								<h2 className="text-2xl font-bold text-gray-900">
									{selectedCategory === 'all'
										? 'All Events'
										: `${
												categories.find((c) => c.value === selectedCategory)
													?.label
										  } Events`}
								</h2>
								<p className="text-gray-600">
									{filteredEvents.length} event
									{filteredEvents.length !== 1 ? 's' : ''} found
								</p>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredEvents.map((event) => {
								const eventStatus = getEventStatus(event);
								const occupancyRate =
									((event.total_seats - event.available_seats) /
										event.total_seats) *
									100;

								return (
									<div
										key={event.id}
										className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
										onClick={() => handleEventClick(event.id)}
									>
										{/* Event Image */}
										<div className="h-48 bg-gray-200 relative">
											{event.image ? (
												<Image
													src={event.image}
													alt={event.title}
													fill
													className="object-cover"
													onError={(e) => {
														const target = e.target as HTMLImageElement;
														target.src = '/placeholder-event.jpg';
													}}
												/>
											) : (
												<div className="h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
													<span className="text-white text-lg font-semibold">
														{event.title.slice(0, 2).toUpperCase()}
													</span>
												</div>
											)}
											{/* Status Badge */}
											<div className="absolute top-3 right-3">
												<span
													className={`px-2 py-1 rounded-full text-xs font-medium ${eventStatus.color}`}
												>
													{eventStatus.status}
												</span>
											</div>
										</div>

										{/* Event Content */}
										<div className="p-6">
											<div className="flex items-start justify-between mb-2">
												<h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
													{event.title}
												</h3>
											</div>

											<div className="space-y-2 text-sm text-gray-600 mb-4">
												<div className="flex items-center">
													<svg
														className="w-4 h-4 mr-2 text-gray-400"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V13a2 2 0 012-2z"
														/>
													</svg>
													<span>
														{formatDate(event.date)} at {event.time}
													</span>
												</div>
												<div className="flex items-center">
													<svg
														className="w-4 h-4 mr-2 text-gray-400"
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
													<span className="line-clamp-1">{event.location}</span>
												</div>
												<div className="flex items-center">
													<svg
														className="w-4 h-4 mr-2 text-gray-400"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
														/>
													</svg>
													<span className="font-semibold text-gray-900">
														{formatPrice(event.price)}
													</span>
												</div>
											</div>

											{/* Seats and Progress */}
											<div className="mb-4">
												<div className="flex justify-between text-sm text-gray-600 mb-1">
													<span>Available Seats</span>
													<span>
														{event.available_seats} / {event.total_seats}
													</span>
												</div>
												<div className="w-full bg-gray-200 rounded-full h-2">
													<div
														className="bg-primary h-2 rounded-full transition-all duration-300"
														style={{ width: `${occupancyRate}%` }}
													></div>
												</div>
											</div>

											{/* Description */}
											{event.description && (
												<p className="text-sm text-gray-600 line-clamp-2 mb-4">
													{event.description}
												</p>
											)}

											{/* Action Button */}
											<Button
												className="w-full"
												disabled={
													event.available_seats === 0 ||
													new Date(event.date) < new Date()
												}
											>
												{event.available_seats === 0
													? 'Sold Out'
													: new Date(event.date) < new Date()
													? 'Event Ended'
													: 'View Details'}
											</Button>
										</div>
									</div>
								);
							})}
						</div>
					</>
				)}
			</div>

			<Footer />
		</div>
	);
}
