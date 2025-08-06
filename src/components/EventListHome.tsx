'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
	organizer?: {
		id: number;
		name: string;
		email: string;
	};
}

interface EventListHomeProps {
	searchQuery?: string;
	locationQuery?: string;
	categoryFilter?: string;
	dateFilter?: string;
	limit?: number; // Optional limit for number of events to show
	showPastEvents?: boolean; // Whether to include past events
}

// Function to get category colors
const getCategoryColors = (category: string) => {
	switch (category.toLowerCase()) {
		case 'music':
			return 'bg-gradient-to-r from-purple-500/40 to-pink-500/30 border-purple-400/50 text-white';
		case 'sports':
			return 'bg-gradient-to-r from-green-500/40 to-emerald-500/30 border-green-400/50 text-white';
		case 'technology':
			return 'bg-gradient-to-r from-blue-500/40 to-cyan-500/30 border-blue-400/50 text-white';
		case 'food & drink':
		case 'food':
			return 'bg-gradient-to-r from-orange-500/40 to-red-500/30 border-orange-400/50 text-white';
		case 'art & culture':
		case 'art':
			return 'bg-gradient-to-r from-indigo-500/40 to-purple-500/30 border-indigo-400/50 text-white';
		case 'business':
			return 'bg-gradient-to-r from-gray-500/40 to-slate-500/30 border-gray-400/50 text-white';
		case 'education':
			return 'bg-gradient-to-r from-yellow-500/40 to-amber-500/30 border-yellow-400/50 text-white';
		default:
			return 'bg-white/20 text-white border-white/30';
	}
};

export default function EventListHome({
	searchQuery = '',
	locationQuery = '',
	categoryFilter = 'all',
	dateFilter = '',
	limit,
	showPastEvents = false, // Default to false (upcoming only)
}: EventListHomeProps) {
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [selectedCategory, setSelectedCategory] = useState(categoryFilter);

	useEffect(() => {
		fetchEvents();
	}, [searchQuery, locationQuery, categoryFilter, dateFilter]);

	useEffect(() => {
		setSelectedCategory(categoryFilter);
	}, [categoryFilter]);

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

	const filteredEvents = events.filter((event) => {
		// Date filtering logic - show upcoming events only unless showPastEvents is true
		const eventDate = new Date(event.date);
		const now = new Date();

		let isUpcoming = true;
		if (!showPastEvents) {
			// Handle UTC dates properly by comparing dates in UTC
			// Convert both dates to YYYY-MM-DD format for comparison
			const eventDateStr = eventDate.toISOString().split('T')[0];
			const nowDateStr = now.toISOString().split('T')[0];

			isUpcoming = eventDateStr >= nowDateStr;
		}

		// Category filter
		const categoryMatch =
			selectedCategory === 'all' || event.category === selectedCategory;

		// Search query filter (title and description)
		const searchMatch =
			!searchQuery ||
			event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			event.description.toLowerCase().includes(searchQuery.toLowerCase());

		// Location filter
		const locationMatch =
			!locationQuery ||
			event.location.toLowerCase().includes(locationQuery.toLowerCase());

		// Date filter for quick filters
		let dateMatch = true;
		if (dateFilter) {
			const startOfWeek = new Date(now);
			startOfWeek.setDate(now.getDate() - now.getDay());
			const endOfWeek = new Date(startOfWeek);
			endOfWeek.setDate(startOfWeek.getDate() + 6);
			const nextWeekStart = new Date(endOfWeek);
			nextWeekStart.setDate(endOfWeek.getDate() + 1);
			const nextWeekEnd = new Date(nextWeekStart);
			nextWeekEnd.setDate(nextWeekStart.getDate() + 6);

			switch (dateFilter) {
				case 'weekend':
					const friday = new Date(now);
					friday.setDate(now.getDate() + (5 - now.getDay()));
					const sunday = new Date(friday);
					sunday.setDate(friday.getDate() + 2);
					dateMatch = eventDate >= friday && eventDate <= sunday;
					break;
				case 'nextweek':
					dateMatch = eventDate >= nextWeekStart && eventDate <= nextWeekEnd;
					break;
				case 'free':
					dateMatch = parseFloat(event.price) === 0;
					break;
				default:
					dateMatch = true;
			}
		}

		return (
			isUpcoming && categoryMatch && searchMatch && locationMatch && dateMatch
		);
	});

	// Sort events: upcoming events first (sorted by date ascending), then past events (sorted by date descending)
	const sortedEvents = filteredEvents.sort((a, b) => {
		const dateA = new Date(a.date);
		const dateB = new Date(b.date);
		const now = new Date();

		// Convert to date strings for comparison (same logic as filter)
		const dateAStr = dateA.toISOString().split('T')[0];
		const dateBStr = dateB.toISOString().split('T')[0];
		const nowStr = now.toISOString().split('T')[0];

		const isUpcomingA = dateAStr >= nowStr;
		const isUpcomingB = dateBStr >= nowStr;

		// If one is upcoming and one is past, upcoming comes first
		if (isUpcomingA && !isUpcomingB) return -1;
		if (!isUpcomingA && isUpcomingB) return 1;

		// If both are upcoming, sort by date ascending (soonest first)
		if (isUpcomingA && isUpcomingB) {
			return dateA.getTime() - dateB.getTime();
		}

		// If both are past, sort by date descending (most recent first)
		return dateB.getTime() - dateA.getTime();
	});

	// Apply limit if specified
	const displayEvents = limit ? sortedEvents.slice(0, limit) : sortedEvents;

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const getEventStatus = (event: Event) => {
		const eventDate = new Date(event.date);
		const now = new Date();
		const occupancyRate =
			((event.total_seats - event.available_seats) / event.total_seats) * 100;

		if (eventDate < now) return { label: 'Past', color: 'bg-gray-500' };
		if (event.available_seats === 0)
			return { label: 'Sold Out', color: 'bg-red-500' };
		if (occupancyRate >= 90)
			return { label: 'Almost Full', color: 'bg-orange-500' };
		return { label: 'Available', color: 'bg-green-500' };
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
		}).format(amount);
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center py-12">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/50"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-12">
				<div className="text-red-300 mb-4">{error}</div>
				<button
					onClick={fetchEvents}
					className="glass text-white px-6 py-2 rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
				>
					Try Again
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Events Grid */}
			{displayEvents.length > 0 ? (
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
					{displayEvents.map((event) => {
						const status = getEventStatus(event);
						return (
							<div
								key={event.id}
								className="glass-dark rounded-xl overflow-hidden hover:bg-white/20 transition-all duration-300 border border-white/20 group"
							>
								{/* Event Image */}
								<div className="h-48 bg-white/10 relative overflow-hidden">
									{event.image ? (
										<Image
											src={event.image}
											alt={event.title}
											fill
											className="object-cover group-hover:scale-105 transition-transform duration-300"
											sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center text-white/40">
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
									<div
										className={`absolute top-3 right-3 ${status.color} text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/20`}
									>
										{status.label}
									</div>
								</div>

								{/* Event Details */}
								<div className="p-4">
									<div className="flex justify-between items-start mb-2">
										<span
											className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize backdrop-blur-sm border ${getCategoryColors(
												event.category
											)}`}
										>
											{event.category}
										</span>
										<span className="text-lg font-bold text-white">
											{formatCurrency(parseFloat(event.price))}
										</span>
									</div>

									<h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
										{event.title}
									</h3>

									<p className="text-white/70 text-xs mb-3 line-clamp-2">
										{event.description}
									</p>

									<div className="space-y-1 text-xs text-white/60 mb-3">
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
									</div>

									{/* Book Now Button */}
									<Link href={`/events/${event.id}`}>
										<button
											className={`w-full py-1.5 px-3 rounded-lg font-medium text-sm transition-all duration-300 backdrop-blur-sm border ${
												event.available_seats > 0
													? 'bg-white/20 text-white hover:bg-white/30 border-white/30'
													: 'bg-white/10 text-white/50 cursor-not-allowed border-white/20'
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
					<div className="text-white/40 mb-4">
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
					<h3 className="text-lg font-medium text-white mb-2">
						No events found
					</h3>
					<p className="text-white/70">
						{selectedCategory === 'all' && !searchQuery && !locationQuery
							? 'There are no events available at the moment.'
							: 'No events found matching your search criteria. Try adjusting your filters.'}
					</p>
				</div>
			)}
		</div>
	);
}
