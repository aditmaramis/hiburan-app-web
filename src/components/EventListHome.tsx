'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Event {
	id: string;
	title: string;
	description: string;
	date: string;
	time: string;
	location: string;
	price: number;
	availableSeats: number;
	totalSeats: number;
	category: string;
	image?: string;
	organizerId: string;
	createdAt: string;
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
			// Mock data for now since we don't have the events API endpoint yet
			const mockEvents: Event[] = [
				{
					id: '1',
					title: 'Summer Music Festival',
					description:
						'Join us for an amazing summer music festival featuring top artists from around the world.',
					date: '2025-08-15',
					time: '18:00',
					location: 'Central Park, New York',
					price: 75,
					availableSeats: 150,
					totalSeats: 500,
					category: 'music',
					image: '/event1.jpg',
					organizerId: '1',
					createdAt: '2025-07-01',
				},
				{
					id: '2',
					title: 'Tech Conference 2025',
					description:
						'Discover the latest trends in technology and network with industry professionals.',
					date: '2025-09-20',
					time: '09:00',
					location: 'Convention Center, San Francisco',
					price: 120,
					availableSeats: 80,
					totalSeats: 200,
					category: 'technology',
					image: '/event2.jpg',
					organizerId: '2',
					createdAt: '2025-07-15',
				},
				{
					id: '3',
					title: 'Art Gallery Opening',
					description:
						'Experience contemporary art from emerging artists in an exclusive gallery opening.',
					date: '2025-08-30',
					time: '19:00',
					location: 'Modern Art Gallery, Los Angeles',
					price: 25,
					availableSeats: 45,
					totalSeats: 100,
					category: 'art',
					image: '/event3.jpg',
					organizerId: '3',
					createdAt: '2025-07-20',
				},
				{
					id: '4',
					title: 'Food & Wine Festival',
					description:
						'Taste exceptional cuisine and wines from award-winning chefs and vineyards.',
					date: '2025-09-10',
					time: '12:00',
					location: 'Waterfront Plaza, Seattle',
					price: 85,
					availableSeats: 200,
					totalSeats: 300,
					category: 'food',
					image: '/event4.jpg',
					organizerId: '4',
					createdAt: '2025-07-25',
				},
				{
					id: '5',
					title: 'Business Leadership Summit',
					description:
						'Learn from successful entrepreneurs and business leaders in this intensive summit.',
					date: '2025-09-05',
					time: '08:00',
					location: 'Business Center, Chicago',
					price: 200,
					availableSeats: 30,
					totalSeats: 150,
					category: 'business',
					image: '/event5.jpg',
					organizerId: '5',
					createdAt: '2025-07-30',
				},
				{
					id: '6',
					title: 'Basketball Championship',
					description:
						'Watch the exciting championship game between the top teams of the season.',
					date: '2025-08-25',
					time: '20:00',
					location: 'Sports Arena, Miami',
					price: 50,
					availableSeats: 500,
					totalSeats: 1000,
					category: 'sports',
					image: '/event6.jpg',
					organizerId: '6',
					createdAt: '2025-08-01',
				},
			];

			setEvents(mockEvents);
			setLoading(false);
		} catch (error) {
			console.error('Error fetching events:', error);
			setError('Failed to load events. Please try again later.');
			setLoading(false);
		}
	};

	const filteredEvents =
		selectedCategory === 'all'
			? events
			: events.filter((event) => event.category === selectedCategory);

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
			((event.totalSeats - event.availableSeats) / event.totalSeats) * 100;

		if (eventDate < now) return { label: 'Past', color: 'bg-gray-500' };
		if (event.availableSeats === 0)
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
									<div
										className={`absolute top-3 right-3 ${status.color} text-white px-2 py-1 rounded-full text-xs font-medium`}
									>
										{status.label}
									</div>
								</div>

								{/* Event Details */}
								<div className="p-6">
									<div className="flex justify-between items-start mb-2">
										<span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium capitalize">
											{event.category}
										</span>
										<span className="text-2xl font-bold text-primary">
											${event.price}
										</span>
									</div>

									<h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
										{event.title}
									</h3>

									<p className="text-gray-600 text-sm mb-4 line-clamp-2">
										{event.description}
									</p>

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
											{event.availableSeats} / {event.totalSeats} seats
											available
										</div>
									</div>

									{/* Book Now Button */}
									<Link href={`/events/${event.id}`}>
										<button
											className={`w-full py-2 px-4 rounded font-medium transition ${
												event.availableSeats > 0
													? 'bg-primary text-white hover:bg-primary/90'
													: 'bg-gray-300 text-gray-500 cursor-not-allowed'
											}`}
											disabled={event.availableSeats === 0}
										>
											{event.availableSeats > 0 ? 'Book Now' : 'Sold Out'}
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
