'use client';
import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Attendee {
	id: number;
	quantity: number;
	total_price: string;
	booking_date: string;
	status: string;
	user: {
		id: number;
		name: string;
		email: string;
	};
	event: {
		id: number;
		title: string;
		date: string;
		time: string;
		location: string;
		price: string;
	};
	payments: Array<{
		amount: string;
		payment_method: string;
		status: string;
	}>;
}

interface AttendeeListProps {
	onRefresh?: () => void;
}

export default function AttendeeList({}: AttendeeListProps) {
	const [attendees, setAttendees] = useState<Attendee[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [selectedEvent, setSelectedEvent] = useState<string>('all');

	const fetchAttendees = async () => {
		try {
			setIsLoading(true);
			const token = localStorage.getItem('token');

			const response = await axios.get(
				'http://localhost:8000/api/bookings/attendees',
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			setAttendees(response.data.attendees || []);
		} catch (error: unknown) {
			console.error('Error fetching attendees:', error);
			setError(
				(error as AxiosError<{ message: string }>)?.response?.data?.message ||
					'Failed to fetch attendees'
			);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchAttendees();
	}, []);

	const formatCurrency = (amount: string) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
		}).format(Number(amount));
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const formatTime = (timeString: string) => {
		return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('id-ID', {
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	// Get unique events for filter
	const uniqueEvents = attendees.reduce(
		(acc: Array<{ id: number; title: string }>, attendee) => {
			if (!acc.find((event) => event.id === attendee.event.id)) {
				acc.push({
					id: attendee.event.id,
					title: attendee.event.title,
				});
			}
			return acc;
		},
		[]
	);

	// Filter attendees by selected event
	const filteredAttendees =
		selectedEvent === 'all'
			? attendees
			: attendees.filter(
					(attendee) => attendee.event.id.toString() === selectedEvent
			  );

	// Group attendees by event
	const attendeesByEvent = filteredAttendees.reduce(
		(acc: Record<string, Attendee[]>, attendee) => {
			const eventKey = `${attendee.event.id}-${attendee.event.title}`;
			if (!acc[eventKey]) {
				acc[eventKey] = [];
			}
			acc[eventKey].push(attendee);
			return acc;
		},
		{}
	);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-lg">Loading attendees...</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header with Filter */}
			<div className="flex justify-between items-center">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">Event Attendees</h2>
					<p className="text-gray-600">
						Manage attendees for your events ({filteredAttendees.length} total)
					</p>
				</div>
				<div className="flex items-center gap-4">
					<select
						value={selectedEvent}
						onChange={(e) => setSelectedEvent(e.target.value)}
						className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="all">All Events</option>
						{uniqueEvents.map((event) => (
							<option
								key={event.id}
								value={event.id.toString()}
							>
								{event.title}
							</option>
						))}
					</select>
					<Button
						onClick={fetchAttendees}
						variant="outline"
					>
						Refresh
					</Button>
				</div>
			</div>

			{/* Error Message */}
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-md p-4">
					<div className="text-red-800">{error}</div>
				</div>
			)}

			{/* Attendees List */}
			{filteredAttendees.length === 0 ? (
				<div className="text-center py-12">
					<div className="text-gray-500 text-lg mb-2">No attendees found</div>
					<p className="text-gray-400">
						{selectedEvent === 'all'
							? 'No confirmed attendees for your events yet'
							: 'No confirmed attendees for this event'}
					</p>
				</div>
			) : (
				<div className="space-y-8">
					{Object.entries(attendeesByEvent).map(
						([eventKey, eventAttendees]) => {
							const event = eventAttendees[0].event;

							return (
								<div
									key={eventKey}
									className="space-y-4"
								>
									{/* Event Header */}
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
										<div className="flex justify-between items-start">
											<div>
												<h3 className="text-lg font-semibold text-blue-900">
													{event.title}
												</h3>
												<div className="text-sm text-blue-700 mt-1">
													<span className="mr-4">
														📅 {formatDate(event.date)} at{' '}
														{formatTime(event.time)}
													</span>
													<span className="mr-4">📍 {event.location}</span>
													<span>
														💰 {formatCurrency(event.price)} per ticket
													</span>
												</div>
											</div>
											<div className="text-right">
												<div className="text-2xl font-bold text-blue-900">
													{eventAttendees.length}
												</div>
												<div className="text-sm text-blue-700">
													{eventAttendees.length === 1
														? 'Attendee'
														: 'Attendees'}
												</div>
											</div>
										</div>
									</div>

									{/* Attendees for this event */}
									<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
										{eventAttendees.map((attendee) => (
											<Card
												key={attendee.id}
												className="p-4"
											>
												<div className="space-y-3">
													{/* Attendee Info */}
													<div>
														<h4 className="font-semibold text-gray-900">
															{attendee.user.name}
														</h4>
														<p className="text-sm text-gray-600">
															{attendee.user.email}
														</p>
													</div>

													{/* Booking Details */}
													<div className="space-y-1 text-sm">
														<div className="flex justify-between">
															<span className="text-gray-600">Tickets:</span>
															<span className="font-medium">
																{attendee.quantity}
															</span>
														</div>
														<div className="flex justify-between">
															<span className="text-gray-600">Total Paid:</span>
															<span className="font-medium">
																{formatCurrency(attendee.total_price)}
															</span>
														</div>
														<div className="flex justify-between">
															<span className="text-gray-600">Booked:</span>
															<span className="font-medium">
																{formatDate(attendee.booking_date)}
															</span>
														</div>
														{attendee.payments.length > 0 && (
															<div className="flex justify-between">
																<span className="text-gray-600">Payment:</span>
																<span className="font-medium">
																	{attendee.payments[0].payment_method}
																</span>
															</div>
														)}
													</div>

													{/* Status Badge */}
													<div className="pt-2 border-t">
														<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
															✓ Confirmed
														</span>
													</div>
												</div>
											</Card>
										))}
									</div>
								</div>
							);
						}
					)}
				</div>
			)}
		</div>
	);
}
