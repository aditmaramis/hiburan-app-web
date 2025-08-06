'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { Button } from '@/components/ui/button';

interface Booking {
	id: number;
	quantity: number;
	total_price: string;
	booking_date: string;
	status: string;
	events?: {
		id: number;
		title: string;
		date: string;
		time: string;
		location: string;
		price: string;
		image?: string;
		category: string;
	};
	payments?: Array<{
		id: number;
		amount: string;
		payment_method: string;
		payment_date: string;
		status: string;
		payment_proof?: string;
		created_at: string;
		updated_at: string;
	}>;
}

interface User {
	id: string;
	name: string;
	email: string;
	role: string;
}

export default function MyTicketsPage() {
	const [user, setUser] = useState<User | null>(null);
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [uploadingPayment, setUploadingPayment] = useState<number | null>(null);
	const router = useRouter();

	useEffect(() => {
		const initializeAndFetchData = async () => {
			try {
				const token = localStorage.getItem('token');
				const userData = localStorage.getItem('user');

				if (!token || !userData) {
					router.push('/login');
					return;
				}

				const parsedUser = JSON.parse(userData);
				if (parsedUser.role !== 'customer') {
					if (parsedUser.role === 'organizer') {
						router.push('/dashboard');
					} else {
						setError('Access denied.');
					}
					return;
				}

				setUser(parsedUser);

				// Fetch user bookings
				const response = await axios.get('http://localhost:8000/api/bookings', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				setBookings(response.data.bookings || []);
			} catch (error) {
				console.error('Error fetching bookings:', error);
				if (error && typeof error === 'object' && 'response' in error) {
					const axiosError = error as {
						response: { status?: number; data?: { message?: string } };
					};
					if (axiosError.response?.status === 401) {
						router.push('/login');
						return;
					}
					setError(
						axiosError.response?.data?.message || 'Failed to load your tickets'
					);
				} else {
					setError('Failed to load your tickets');
				}
			} finally {
				setLoading(false);
			}
		};

		initializeAndFetchData();
	}, [router]);

	const getStatusBadge = (status: string) => {
		const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';
		switch (status.toLowerCase()) {
			case 'pending':
				return `${baseClasses} bg-yellow-100 text-yellow-800`;
			case 'confirmed':
				return `${baseClasses} bg-green-100 text-green-800`;
			case 'rejected':
				return `${baseClasses} bg-red-100 text-red-800`;
			case 'cancelled':
				return `${baseClasses} bg-gray-100 text-gray-800`;
			default:
				return `${baseClasses} bg-gray-100 text-gray-800`;
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const formatTime = (timeString: string) => {
		return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const calculateRemainingTime = (bookingDate: string) => {
		const booking = new Date(bookingDate);
		const now = new Date();
		const twoHoursLater = new Date(booking.getTime() + 2 * 60 * 60 * 1000); // 2 hours after booking

		const remainingMs = twoHoursLater.getTime() - now.getTime();

		if (remainingMs <= 0) {
			return { expired: true, text: 'Payment deadline expired' };
		}

		const hours = Math.floor(remainingMs / (1000 * 60 * 60));
		const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

		if (hours > 0) {
			return {
				expired: false,
				text: `${hours}h ${minutes}m remaining to upload payment proof`,
				isUrgent: hours === 0 && minutes <= 30, // Last 30 minutes
			};
		} else {
			return {
				expired: false,
				text: `${minutes}m remaining to upload payment proof`,
				isUrgent: minutes <= 30, // Last 30 minutes
			};
		}
	};

	const handlePaymentProofUpload = async (bookingId: number, file: File) => {
		try {
			setUploadingPayment(bookingId);
			const token = localStorage.getItem('token');
			if (!token) {
				router.push('/login');
				return;
			}

			const formData = new FormData();
			formData.append('payment_proof', file);

			const response = await axios.post(
				`http://localhost:8000/api/v1/enhanced/bookings/${bookingId}/payment-proof`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'multipart/form-data',
					},
				}
			);

			if (response.data) {
				alert('Payment proof uploaded successfully!');
				// Refresh bookings to show updated status
				window.location.reload();
			}
		} catch (error) {
			console.error('Error uploading payment proof:', error);
			if (error && typeof error === 'object' && 'response' in error) {
				const axiosError = error as {
					response: { data?: { message?: string }; status?: number };
				};
				if (axiosError.response?.status === 401) {
					router.push('/login');
				} else {
					alert(
						axiosError.response?.data?.message ||
							'Failed to upload payment proof'
					);
				}
			} else {
				alert('Failed to upload payment proof');
			}
		} finally {
			setUploadingPayment(null);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading your tickets...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<p className="text-red-600 text-lg mb-4">{error}</p>
					<div className="space-x-4">
						<Button onClick={() => window.location.reload()}>Try Again</Button>
						<Button
							variant="outline"
							onClick={() => router.push('/login')}
						>
							Go to Login
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-4">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
							<p className="text-gray-600">
								View and manage your event tickets - {user?.name}
							</p>
						</div>
						<div className="flex items-center gap-4">
							<Button
								variant="outline"
								onClick={() => router.push('/customer-dashboard')}
							>
								← Back to Dashboard
							</Button>
							<Button
								variant="outline"
								onClick={() => router.push('/events')}
							>
								Browse Events
							</Button>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
				{bookings.length === 0 ? (
					<div className="bg-white rounded-lg shadow p-8">
						<div className="text-center">
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
										d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
									/>
								</svg>
							</div>
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								No tickets yet
							</h3>
							<p className="text-gray-600 mb-6">
								You haven&apos;t purchased any tickets yet. Start by browsing
								available events!
							</p>
							<div className="space-x-4">
								<Button onClick={() => router.push('/events')}>
									Browse Events
								</Button>
								<Button
									variant="outline"
									onClick={() => router.push('/customer-dashboard')}
								>
									Back to Dashboard
								</Button>
							</div>
						</div>
					</div>
				) : (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{bookings.map((booking) => (
							<div
								key={booking.id}
								className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
							>
								{booking.events?.image && (
									<Image
										src={booking.events.image}
										alt={booking.events.title}
										width={400}
										height={192}
										className="w-full h-48 object-cover"
									/>
								)}
								<div className="p-6">
									<div className="flex justify-between items-start mb-3">
										<h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
											{booking.events?.title || 'Event Title Unavailable'}
										</h3>
										<span className={getStatusBadge(booking.status)}>
											{booking.status}
										</span>
									</div>

									<div className="space-y-2 text-sm text-gray-600 mb-4">
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
													d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V7a2 2 0 012-2h4a2 2 0 012 2v0M8 7v10a2 2 0 002 2h4a2 2 0 002-2V7M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h2m0 0h8m-8 0v-2m8 2v-2"
												/>
											</svg>
											{booking.events?.date
												? formatDate(booking.events.date)
												: 'Date TBA'}{' '}
											at{' '}
											{booking.events?.time
												? formatTime(booking.events.time)
												: 'Time TBA'}
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
											{booking.events?.location || 'Location TBA'}
										</div>
									</div>

									<div className="border-t pt-4">
										<div className="flex justify-between items-center text-sm">
											<span className="text-gray-600">Quantity:</span>
											<span className="font-medium">
												{booking.quantity} ticket(s)
											</span>
										</div>
										<div className="flex justify-between items-center text-sm">
											<span className="text-gray-600">Total Amount:</span>
											<span className="font-medium">
												Rp{' '}
												{parseFloat(booking.total_price).toLocaleString(
													'id-ID'
												)}
											</span>
										</div>
										<div className="flex justify-between items-center text-sm">
											<span className="text-gray-600">Booked:</span>
											<span className="font-medium">
												{formatDate(booking.booking_date)}
											</span>
										</div>
									</div>

									{booking.status === 'pending' && (
										<div className="mt-4 p-3 bg-yellow-50 rounded-lg">
											<p className="text-sm text-yellow-800 mb-3">
												Your booking is pending organizer approval.
											</p>
											{!booking.payments?.[0]?.payment_proof ? (
												<div className="mt-3">
													{/* Remaining time display */}
													{(() => {
														const timeInfo = calculateRemainingTime(
															booking.booking_date
														);
														return (
															<div
																className={`mb-3 p-2 rounded ${
																	timeInfo.expired
																		? 'bg-red-100 border border-red-200'
																		: timeInfo.isUrgent
																		? 'bg-orange-100 border border-orange-200'
																		: 'bg-blue-100 border border-blue-200'
																}`}
															>
																<p
																	className={`text-sm font-medium ${
																		timeInfo.expired
																			? 'text-red-700'
																			: timeInfo.isUrgent
																			? 'text-orange-700'
																			: 'text-blue-700'
																	}`}
																>
																	⏰ {timeInfo.text}
																</p>
															</div>
														);
													})()}

													<p className="text-sm text-yellow-800 mb-2">
														Please upload payment proof to complete your
														booking.
													</p>
													<input
														type="file"
														accept="image/*"
														className="hidden"
														id={`payment-upload-${booking.id}`}
														onChange={(e) => {
															const file = e.target.files?.[0];
															if (file) {
																handlePaymentProofUpload(booking.id, file);
															}
														}}
													/>
													<Button
														size="sm"
														disabled={uploadingPayment === booking.id}
														onClick={() => {
															document
																.getElementById(`payment-upload-${booking.id}`)
																?.click();
														}}
													>
														{uploadingPayment === booking.id ? (
															<>
																<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
																Uploading...
															</>
														) : (
															'Upload Payment Proof'
														)}
													</Button>
												</div>
											) : (
												<div className="mt-3">
													<p className="text-sm text-green-700">
														✓ Payment proof uploaded. Waiting for organizer
														approval.
													</p>
												</div>
											)}
										</div>
									)}

									{booking.status === 'confirmed' && (
										<div className="mt-4 p-3 bg-green-50 rounded-lg">
											<p className="text-sm text-green-800">
												Your booking is confirmed! Present this ticket at the
												event.
											</p>
										</div>
									)}

									{booking.status === 'rejected' && (
										<div className="mt-4 p-3 bg-red-50 rounded-lg">
											<p className="text-sm text-red-800">
												Your booking was rejected. Points and coupons have been
												restored.
											</p>
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</main>
		</div>
	);
}
