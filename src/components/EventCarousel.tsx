'use client';
import { useState, useEffect } from 'react';
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
	category: string;
	available_seats: number;
	total_seats: number;
	image?: string;
	organizer_id: number;
	created_at: string;
	organizer?: {
		id: number;
		name: string;
		email: string;
	};
}

interface EventCarouselProps {
	className?: string;
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

export default function EventCarousel({ className = '' }: EventCarouselProps) {
	const [events, setEvents] = useState<Event[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchUpcomingEvents();
	}, []);

	useEffect(() => {
		if (events.length > 0) {
			const interval = setInterval(() => {
				setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
			}, 5000); // Auto-advance every 5 seconds

			return () => clearInterval(interval);
		}
	}, [events.length]);

	const fetchUpcomingEvents = async () => {
		try {
			const response = await axios.get('http://localhost:8000/api/events');

			// The response should contain an array of events
			const fetchedEvents =
				response.data.events || response.data.data || response.data;

			// Get upcoming events (sorted by date) and limit to 5 for carousel
			const upcomingEvents = fetchedEvents
				.filter((event: Event) => new Date(event.date) > new Date())
				.sort(
					(a: Event, b: Event) =>
						new Date(a.date).getTime() - new Date(b.date).getTime()
				)
				.slice(0, 5);
			setEvents(upcomingEvents);
		} catch (error) {
			console.error('Error fetching events:', error);
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const nextSlide = () => {
		setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
	};

	const prevSlide = () => {
		setCurrentIndex(
			(prevIndex) => (prevIndex - 1 + events.length) % events.length
		);
	};

	const goToSlide = (index: number) => {
		setCurrentIndex(index);
	};

	if (loading) {
		return (
			<div
				className={`${className} glass rounded-2xl p-8 flex items-center justify-center`}
			>
				<div className="text-white/80 text-lg">Loading upcoming events...</div>
			</div>
		);
	}

	if (events.length === 0) {
		return (
			<div
				className={`${className} glass rounded-2xl p-8 flex items-center justify-center`}
			>
				<div className="text-white/80 text-lg">No upcoming events found</div>
			</div>
		);
	}

	return (
		<div className={`${className} relative h-full`}>
			<div className="glass rounded-2xl overflow-hidden shadow-2xl h-full flex flex-col">
				{/* Event Images Container - Takes up most of the space */}
				<div className="relative flex-1 min-h-[300px] overflow-hidden">
					{/* Images Wrapper with sliding effect */}
					<div
						className="flex transition-transform duration-500 ease-in-out h-full"
						style={{
							transform: `translateX(-${currentIndex * 100}%)`,
						}}
					>
						{events.map((event) => (
							<div
								key={event.id}
								className="relative w-full h-full flex-shrink-0"
							>
								<Image
									src={event.image || '/placeholder-event.jpg'}
									alt={event.title}
									fill
									className="object-cover"
									priority={event.id === events[currentIndex]?.id}
									onError={(e) => {
										const target = e.target as HTMLImageElement;
										target.src = '/placeholder-event.jpg';
									}}
								/>

								{/* Category Badge */}
								<div className="absolute top-3 left-3">
									<span
										className={`backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium border ${getCategoryColors(
											event.category
										)}`}
									>
										{event.category}
									</span>
								</div>

								{/* Price Badge */}
								<div className="absolute top-3 right-3">
									<span className="bg-orange-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold">
										{event.price === '0' || event.price === 'Free'
											? 'FREE'
											: `Rp ${parseInt(event.price).toLocaleString('id-ID')}`}
									</span>
								</div>

								{/* Event Title Overlay */}
								<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
									<h3 className="text-lg font-bold text-white line-clamp-2">
										{event.title}
									</h3>
									<p className="text-white/80 text-sm">
										{formatDate(event.date)} • {event.time}
									</p>
								</div>
							</div>
						))}
					</div>

					{/* Navigation Arrows */}
					<button
						onClick={prevSlide}
						className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 z-10"
					>
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
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>

					<button
						onClick={nextSlide}
						className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 z-10"
					>
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
					</button>
				</div>

				{/* Dots Indicator - Fixed at bottom */}
				<div className="flex justify-center space-x-2 py-3 bg-black/20">
					{events.map((_, index) => (
						<button
							key={index}
							onClick={() => goToSlide(index)}
							className={`w-2 h-2 rounded-full transition-all duration-300 ${
								index === currentIndex
									? 'bg-white'
									: 'bg-white/40 hover:bg-white/60'
							}`}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
