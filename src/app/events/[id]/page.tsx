'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
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

export default function EventDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const [event, setEvent] = useState<Event | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [ticketQuantity, setTicketQuantity] = useState(1);
	const [showBookingModal, setShowBookingModal] = useState(false);

	useEffect(() => {
		if (params.id) {
			fetchEvent(params.id as string);
		}
	}, [params.id]);

	const fetchEvent = async (eventId: string) => {
		try {
			setLoading(true);
			// Fetch event from API
			const response = await axios.get(
				`http://localhost:8000/api/events/${eventId}`
			);
			const fetchedEvent = response.data.event;

			if (fetchedEvent) {
				setEvent(fetchedEvent);
			} else {
				setError('Event not found');
			}
		} catch (error) {
			console.error('Error fetching event:', error);
			if (error && typeof error === 'object' && 'response' in error) {
				const axiosError = error as {
					response: { status?: number; data?: { message?: string } };
				};
				if (axiosError.response?.status === 404) {
					setError('Event not found');
				} else {
					setError('Failed to load event details');
				}
			} else {
				setError('Network error. Please check your connection.');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleBookTicket = () => {
		const token = localStorage.getItem('token');
		if (!token) {
			router.push('/login');
			return;
		}
		setShowBookingModal(true);
	};

	const confirmBooking = async () => {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				router.push('/login');
				return;
			}

			const response = await axios.post(
				'http://localhost:8000/api/bookings',
				{
					event_id: event?.id,
					quantity: ticketQuantity,
					// Add points and coupon support later
					use_points: 0,
					coupon_code: null,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (response.data) {
				alert(
					`Booking created successfully! Please go to "My Tickets" to upload payment proof. Booking ID: ${response.data.booking.id}`
				);
				setShowBookingModal(false);

				// Update available seats
				if (event) {
					setEvent({
						...event,
						available_seats: event.available_seats - ticketQuantity,
					});
				}

				// Redirect to My Tickets page after successful booking
				router.push('/my-tickets');
			}
		} catch (error) {
			console.error('Booking error:', error);
			if (error && typeof error === 'object' && 'response' in error) {
				const axiosError = error as {
					response: { data?: { message?: string }; status?: number };
				};
				if (axiosError.response?.status === 401) {
					alert('Authentication failed. Please log in again.');
					router.push('/login');
				} else {
					alert(
						axiosError.response?.data?.message ||
							'Failed to book tickets. Please try again.'
					);
				}
			} else {
				alert('Failed to book tickets. Please try again.');
			}
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const getEventStatus = () => {
		if (!event) return null;
		const eventDate = new Date(event.date);
		const now = new Date();
		const occupancyRate =
			((event.total_seats - event.available_seats) / event.total_seats) * 100;

		if (eventDate < now)
			return { label: 'Past Event', color: 'bg-gray-500', available: false };
		if (event.available_seats === 0)
			return { label: 'Sold Out', color: 'bg-red-500', available: false };
		if (occupancyRate >= 90)
			return { label: 'Almost Full', color: 'bg-orange-500', available: true };
		return {
			label: 'Tickets Available',
			color: 'bg-green-500',
			available: true,
		};
	};

	if (loading) {
		return (
			<>
				{/* Fixed Concert Background for entire page */}
				<div className="fixed inset-0 z-0">
					<Image
						src="/concert.jpg"
						alt="Concert Background"
						fill
						className="object-cover blur-sm"
						priority
					/>
					{/* Dark overlay */}
					<div className="absolute inset-0 bg-black/30"></div>
				</div>

				<Navbar />
				<div className="min-h-screen relative z-10 flex items-center justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
				</div>
				<Footer />
			</>
		);
	}

	if (error || !event) {
		return (
			<>
				{/* Fixed Concert Background for entire page */}
				<div className="fixed inset-0 z-0">
					<Image
						src="/concert.jpg"
						alt="Concert Background"
						fill
						className="object-cover blur-sm"
						priority
					/>
					{/* Dark overlay */}
					<div className="absolute inset-0 bg-black/30"></div>
				</div>

				<Navbar />
				<div className="min-h-screen relative z-10 flex items-center justify-center">
					<div className="text-center">
						<h1 className="text-2xl font-bold text-white mb-4">
							{error || 'Event not found'}
						</h1>
						<button
							onClick={() => router.push('/')}
							className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded hover:from-orange-600 hover:to-red-600 transition"
						>
							Go Back Home
						</button>
					</div>
				</div>
				<Footer />
			</>
		);
	}

	const status = getEventStatus();

	return (
		<>
			{/* Fixed Concert Background for entire page */}
			<div className="fixed inset-0 z-0">
				<Image
					src="/concert.jpg"
					alt="Concert Background"
					fill
					className="object-cover blur-sm"
					priority
				/>
				{/* Dark overlay */}
				<div className="absolute inset-0 bg-black/30"></div>
			</div>

			<Navbar />
			<main className="min-h-screen relative z-10">
				{/* Animated Background Elements */}
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
					<div className="absolute top-40 -left-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
					<div className="absolute bottom-40 right-1/4 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
				</div>
				{/* Hero Section */}
				<div className="relative h-96 bg-gradient-to-r from-slate-900/80 to-purple-900/80 backdrop-blur-md">
					{event.image ? (
						<Image
							src={event.image}
							alt={event.title}
							fill
							className="object-cover opacity-30 blur-sm"
							priority
						/>
					) : (
						<div className="w-full h-full bg-gradient-to-r from-orange-500/30 to-purple-600/30"></div>
					)}
					<div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 flex items-center">
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
							<div className="max-w-3xl">
								<div className="flex items-center gap-4 mb-4">
									<span className="inline-block bg-gradient-to-r from-orange-500 to-red-500 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
										{event.category}
									</span>
									{status && (
										<span
											className={`${status.color} backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg`}
										>
											{status.label}
										</span>
									)}
								</div>
								<h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white via-orange-200 to-orange-500 bg-clip-text text-transparent">
									{event.title}
								</h1>
								<div className="flex flex-wrap items-center gap-6 text-lg">
									<div className="flex items-center">
										<svg
											className="w-5 h-5 mr-2"
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
											className="w-5 h-5 mr-2"
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
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Content Section */}
				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
					<div className="grid lg:grid-cols-3 gap-8">
						{/* Main Content */}
						<div className="lg:col-span-2">
							<div className="bg-black/20 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20 h-full flex flex-col">
								<h2 className="text-2xl font-bold mb-6 text-white">
									About This Event
								</h2>
								<div className="prose max-w-none text-gray-200 leading-relaxed flex-grow">
									{event.description &&
										event.description.split('. ').map((sentence, index) => (
											<p
												key={index}
												className="mb-4"
											>
												{sentence}
												{sentence.endsWith('.') ? '' : '.'}
											</p>
										))}
									{!event.description && (
										<p className="text-gray-400 italic">
											No description available.
										</p>
									)}
								</div>

								{/* Event Details */}
								<div className="mt-8 border-t border-white/20 pt-8">
									<h3 className="text-xl font-bold mb-4 text-white">
										Event Details
									</h3>
									<div className="grid md:grid-cols-2 gap-6">
										<div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
											<h4 className="font-semibold text-orange-200 mb-2">
												Date & Time
											</h4>
											<p className="text-white">{formatDate(event.date)}</p>
											<p className="text-white">{event.time}</p>
										</div>
										<div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-4 border border-purple-500/30">
											<h4 className="font-semibold text-purple-200 mb-2">
												Location
											</h4>
											<p className="text-white">{event.location}</p>
										</div>
										<div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
											<h4 className="font-semibold text-orange-200 mb-2">
												Category
											</h4>
											<p className="text-white capitalize">{event.category}</p>
										</div>
										<div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-4 border border-purple-500/30">
											<h4 className="font-semibold text-purple-200 mb-2">
												Availability
											</h4>
											<p className="text-white">
												{event.available_seats} of {event.total_seats} seats
												available
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Booking Sidebar */}
						<div className="lg:col-span-1">
							<div className="bg-black/20 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20 h-full flex flex-col">
								<div className="text-center mb-6">
									<div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
										{formatCurrency(event.price)}
									</div>
									<p className="text-gray-300">per ticket</p>
								</div>

								<div className="flex-grow">
									{status?.available ? (
										<>
											<div className="mb-4">
												<label className="block text-sm font-medium text-white mb-2">
													Number of Tickets
												</label>
												<select
													value={ticketQuantity}
													onChange={(e) =>
														setTicketQuantity(parseInt(e.target.value))
													}
													className="w-full bg-black/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-md"
												>
													{Array.from(
														{ length: Math.min(10, event.available_seats) },
														(_, i) => (
															<option
																key={i + 1}
																value={i + 1}
																className="bg-slate-800 text-white"
															>
																{i + 1} ticket{i > 0 ? 's' : ''}
															</option>
														)
													)}
												</select>
											</div>

											<div className="border-t border-white/20 pt-4 mb-6">
												<div className="flex justify-between items-center text-lg font-semibold">
													<span className="text-white">Total:</span>
													<span className="text-orange-400">
														{formatCurrency(event.price * ticketQuantity)}
													</span>
												</div>
											</div>

											<button
												onClick={handleBookTicket}
												className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
											>
												🎫 Book Now
											</button>
										</>
									) : (
										<div className="text-center py-4">
											<div
												className={`${status?.color} backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4 inline-block`}
											>
												{status?.label}
											</div>
											<p className="text-gray-300">
												{status?.label === 'Sold Out'
													? 'This event is completely sold out.'
													: 'This event has already passed.'}
											</p>
										</div>
									)}
								</div>

								<div className="mt-6 pt-6 border-t border-white/20">
									<div className="flex items-center text-sm text-gray-300">
										<svg
											className="w-4 h-4 mr-2 text-green-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										Secure payment processing
									</div>
									<div className="flex items-center text-sm text-gray-300 mt-2">
										<svg
											className="w-4 h-4 mr-2 text-blue-400"
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
										24/7 customer support
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Booking Modal */}
				{showBookingModal && (
					<div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
						<div className="bg-black/20 backdrop-blur-md rounded-2xl max-w-md w-full border border-white/20 shadow-2xl">
							<div className="p-6">
								<h3 className="text-xl font-bold mb-4 text-white">
									Confirm Booking
								</h3>
								<div className="space-y-3 mb-6">
									<div className="flex justify-between">
										<span className="text-gray-300">Event:</span>
										<span className="font-medium text-white">
											{event.title}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-300">Date:</span>
										<span className="text-white">{formatDate(event.date)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-300">Time:</span>
										<span className="text-white">{event.time}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-300">Tickets:</span>
										<span className="text-white">{ticketQuantity}</span>
									</div>
									<div className="flex justify-between border-t border-white/20 pt-3 font-semibold">
										<span className="text-white">Total:</span>
										<span className="text-orange-400">
											{formatCurrency(event.price * ticketQuantity)}
										</span>
									</div>
								</div>
								<div className="flex gap-4">
									<button
										onClick={confirmBooking}
										className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold"
									>
										Confirm Booking
									</button>
									<button
										onClick={() => setShowBookingModal(false)}
										className="flex-1 border border-white/30 bg-black/20 backdrop-blur-md text-white py-2 px-4 rounded-lg hover:bg-black/30 transition-all duration-300"
									>
										Cancel
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</main>
			<div className="relative z-10">
				<Footer />
			</div>
		</>
	);
}
