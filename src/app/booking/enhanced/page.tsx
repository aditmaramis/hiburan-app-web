'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, type Currency } from '@/utils/currency';
import CountdownTimer from '@/components/ui/countdown-timer';
import PaymentProofUpload from '@/components/booking/payment-proof-upload';

interface Event {
	id: number;
	title: string;
	date: string;
	time: string;
	location: string;
	price: number;
	currency: Currency;
	available_seats: number;
	image?: string;
}

interface PricePreview {
	original_price: number;
	points_discount: number;
	coupon_discount: number;
	final_price: number;
	currency: Currency;
	can_use_points: boolean;
	max_points_usable: number;
	user_available_points: number;
	coupon_valid: boolean;
}

interface BookingResult {
	id: number;
	event_title: string;
	quantity: number;
	total_price: number;
	original_price: number;
	points_used: number;
	coupon_discount: number;
	currency: Currency;
	status: string;
	payment_deadline: string;
}

export default function EnhancedBookingPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const eventId = searchParams.get('event_id');

	const [event, setEvent] = useState<Event | null>(null);
	const [quantity, setQuantity] = useState(1);
	const [usePoints, setUsePoints] = useState(0);
	const [couponCode, setCouponCode] = useState('');
	const [pricePreview, setPricePreview] = useState<PricePreview | null>(null);
	const [bookingResult, setBookingResult] = useState<BookingResult | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [step, setStep] = useState<'booking' | 'payment' | 'confirmation'>(
		'booking'
	);

	useEffect(() => {
		if (eventId) {
			fetchEvent(parseInt(eventId));
		}
	}, [eventId]);

	const fetchEvent = async (id: number) => {
		try {
			const response = await fetch(`/api/v1/events/${id}`);
			if (response.ok) {
				const data = await response.json();
				setEvent(data.event);
			} else {
				setError('Event not found');
			}
		} catch {
			setError('Failed to load event');
		}
	};

	const fetchPricePreview = useCallback(async () => {
		try {
			const response = await fetch('/api/v1/enhanced/bookings/preview', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: JSON.stringify({
					event_id: eventId,
					quantity,
					use_points: usePoints,
					coupon_code: couponCode || undefined,
				}),
			});

			if (response.ok) {
				const data = await response.json();
				setPricePreview(data);
			}
		} catch {
			console.error('Failed to fetch price preview');
		}
	}, [eventId, quantity, usePoints, couponCode]);

	useEffect(() => {
		if (eventId && quantity > 0) {
			fetchPricePreview();
		}
	}, [eventId, quantity, usePoints, couponCode, fetchPricePreview]);

	const handleBooking = async () => {
		if (!event || !pricePreview) return;

		setIsLoading(true);
		setError('');

		try {
			const response = await fetch('/api/v1/enhanced/bookings', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: JSON.stringify({
					event_id: parseInt(eventId!),
					quantity,
					use_points: usePoints,
					coupon_code: couponCode || undefined,
				}),
			});

			if (response.ok) {
				const data = await response.json();
				setBookingResult(data.booking);
				setStep('payment');
			} else {
				const errorData = await response.json();
				setError(errorData.message || 'Booking failed');
			}
		} catch {
			setError('Network error. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handlePaymentSuccess = () => {
		setStep('confirmation');
	};

	const handlePaymentExpire = () => {
		setError('Payment time expired. Please try booking again.');
		setStep('booking');
		setBookingResult(null);
	};

	if (!event) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p>Loading event details...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-2xl mx-auto px-4">
				{/* Event Info */}
				<div className="bg-white rounded-lg shadow-md p-6 mb-6">
					<div className="flex items-start gap-4">
						{event.image && (
							<div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={event.image}
									alt={event.title}
									className="w-full h-full object-cover rounded-lg"
								/>
							</div>
						)}
						<div className="flex-1">
							<h1 className="text-xl font-bold text-gray-900 mb-2">
								{event.title}
							</h1>
							<div className="text-sm text-gray-600 space-y-1">
								<p>
									📅 {new Date(event.date).toLocaleDateString()} at {event.time}
								</p>
								<p>📍 {event.location}</p>
								<p>
									💰 {formatCurrency(event.price, event.currency)} per ticket
								</p>
								<p>🎫 {event.available_seats} seats available</p>
							</div>
						</div>
					</div>
				</div>

				{step === 'booking' && (
					<div className="bg-white rounded-lg shadow-md p-6">
						<h2 className="text-lg font-bold text-gray-900 mb-4">
							Book Your Tickets
						</h2>

						{error && (
							<div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
								<p className="text-red-800 text-sm">{error}</p>
							</div>
						)}

						<div className="space-y-6">
							{/* Quantity */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Number of Tickets
								</label>
								<Input
									type="number"
									min="1"
									max={event.available_seats}
									value={quantity}
									onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
									className="w-32"
								/>
							</div>

							{/* Points Usage */}
							{pricePreview && pricePreview.user_available_points > 0 && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Use Points (Available: {pricePreview.user_available_points})
									</label>
									<div className="flex items-center gap-2">
										<Input
											type="number"
											min="0"
											max={Math.min(
												pricePreview.user_available_points,
												pricePreview.max_points_usable
											)}
											value={usePoints}
											onChange={(e) =>
												setUsePoints(parseInt(e.target.value) || 0)
											}
											className="w-32"
										/>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() =>
												setUsePoints(
													Math.min(
														pricePreview.user_available_points,
														pricePreview.max_points_usable
													)
												)
											}
										>
											Use Max
										</Button>
									</div>
									<p className="text-xs text-gray-500 mt-1">
										Maximum {pricePreview.max_points_usable} points can be used
										(80% of ticket price)
									</p>
								</div>
							)}

							{/* Coupon Code */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Coupon Code (Optional)
								</label>
								<Input
									type="text"
									value={couponCode}
									onChange={(e) => setCouponCode(e.target.value)}
									placeholder="Enter coupon code"
									className="w-full"
								/>
								{couponCode && pricePreview && (
									<p
										className={`text-xs mt-1 ${
											pricePreview.coupon_valid
												? 'text-green-600'
												: 'text-red-600'
										}`}
									>
										{pricePreview.coupon_valid
											? '✓ Valid coupon'
											: '✗ Invalid or expired coupon'}
									</p>
								)}
							</div>

							{/* Price Breakdown */}
							{pricePreview && (
								<div className="bg-gray-50 rounded-lg p-4">
									<h3 className="font-medium text-gray-900 mb-3">
										Price Breakdown
									</h3>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span>
												Original Price ({quantity} ×{' '}
												{formatCurrency(event.price, event.currency)}):
											</span>
											<span>
												{formatCurrency(
													pricePreview.original_price,
													pricePreview.currency
												)}
											</span>
										</div>
										{pricePreview.points_discount > 0 && (
											<div className="flex justify-between text-green-600">
												<span>Points Discount ({usePoints} points):</span>
												<span>
													-
													{formatCurrency(
														pricePreview.points_discount,
														pricePreview.currency
													)}
												</span>
											</div>
										)}
										{pricePreview.coupon_discount > 0 && (
											<div className="flex justify-between text-green-600">
												<span>Coupon Discount:</span>
												<span>
													-
													{formatCurrency(
														pricePreview.coupon_discount,
														pricePreview.currency
													)}
												</span>
											</div>
										)}
										<div className="flex justify-between font-bold text-lg border-t pt-2">
											<span>Total:</span>
											<span>
												{formatCurrency(
													pricePreview.final_price,
													pricePreview.currency
												)}
											</span>
										</div>
									</div>
								</div>
							)}

							<Button
								onClick={handleBooking}
								disabled={
									isLoading ||
									!pricePreview ||
									(usePoints > 0 && !pricePreview.can_use_points)
								}
								className="w-full"
							>
								{isLoading ? 'Processing...' : 'Confirm Booking'}
							</Button>
						</div>
					</div>
				)}

				{step === 'payment' && bookingResult && (
					<div className="bg-white rounded-lg shadow-md p-6">
						<h2 className="text-lg font-bold text-gray-900 mb-4">
							Upload Payment Proof
						</h2>

						<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
							<div className="flex items-center gap-2 mb-2">
								<span className="text-lg">⚠️</span>
								<span className="font-medium text-yellow-800">
									Payment Required
								</span>
							</div>
							<p className="text-yellow-800 text-sm mb-3">
								Please upload your payment proof within the time limit to secure
								your booking.
							</p>
							<CountdownTimer
								deadline={bookingResult.payment_deadline}
								onExpire={handlePaymentExpire}
							/>
						</div>

						<div className="mb-6">
							<h3 className="font-medium text-gray-900 mb-2">
								Booking Summary
							</h3>
							<div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
								<div className="flex justify-between">
									<span>Booking ID:</span>
									<span className="font-mono">#{bookingResult.id}</span>
								</div>
								<div className="flex justify-between">
									<span>Event:</span>
									<span>{bookingResult.event_title}</span>
								</div>
								<div className="flex justify-between">
									<span>Quantity:</span>
									<span>{bookingResult.quantity} ticket(s)</span>
								</div>
								<div className="flex justify-between font-bold">
									<span>Total:</span>
									<span>
										{formatCurrency(
											bookingResult.total_price,
											bookingResult.currency
										)}
									</span>
								</div>
							</div>
						</div>

						<PaymentProofUpload
							bookingId={bookingResult.id}
							onSuccess={handlePaymentSuccess}
							onError={setError}
						/>

						{error && (
							<div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
								<p className="text-red-800 text-sm">{error}</p>
							</div>
						)}
					</div>
				)}

				{step === 'confirmation' && bookingResult && (
					<div className="bg-white rounded-lg shadow-md p-6 text-center">
						<div className="text-green-600 text-6xl mb-4">✅</div>
						<h2 className="text-xl font-bold text-gray-900 mb-2">
							Payment Proof Uploaded!
						</h2>
						<p className="text-gray-600 mb-6">
							Your payment proof has been submitted successfully. We&apos;ll
							review it and confirm your booking within 24 hours.
						</p>

						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
							<h3 className="font-medium text-blue-900 mb-2">
								What happens next?
							</h3>
							<div className="text-sm text-blue-800 text-left space-y-1">
								<p>1. Our team will review your payment proof</p>
								<p>
									2. You&apos;ll receive an email confirmation once approved
								</p>
								<p>3. Your tickets will be available in your account</p>
								<p>
									4. If rejected, points/coupons will be refunded automatically
								</p>
							</div>
						</div>

						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={() => router.push('/my-tickets')}
								className="flex-1"
							>
								View My Tickets
							</Button>
							<Button
								onClick={() => router.push('/events')}
								className="flex-1"
							>
								Browse More Events
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
