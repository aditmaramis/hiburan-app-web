'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import EventList from '@/components/dashboard/EventList';
import TransactionList from '@/components/dashboard/TransactionList';
import AttendeeList from '@/components/dashboard/AttendeeList';
import StatisticsDashboard from '@/components/dashboard/StatisticsDashboard';
import { type Currency } from '@/utils/currency';

interface User {
	id: string;
	name: string;
	email: string;
	role: string;
}

interface Event {
	id: number;
	title: string;
	description: string | null;
	date: string;
	time: string;
	location: string;
	price: number;
	currency: Currency;
	available_seats: number;
	total_seats: number;
	category: string;
	image?: string | null;
	organizer_id: number;
	created_at: string;
	updated_at: string;
}

interface DashboardData {
	totalEvents: number;
	totalRevenue: number;
	totalAttendees: number;
	pendingTransactions: number;
	monthlyRevenue: { month: string; revenue: number }[];
	eventStats: {
		eventId: string;
		title: string;
		attendees: number;
		revenue: number;
	}[];
}

export default function DashboardPage() {
	const [user, setUser] = useState<User | null>(null);
	const [dashboardData, setDashboardData] = useState<DashboardData | null>(
		null
	);
	const [events, setEvents] = useState<Event[]>([]);
	const [activeTab, setActiveTab] = useState<
		'overview' | 'events' | 'transactions' | 'attendees' | 'statistics'
	>('overview');
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const router = useRouter();

	const fetchDashboardData = useCallback(async () => {
		try {
			setIsLoading(true);

			// Get token from localStorage
			const token = localStorage.getItem('token');
			if (!token) {
				setError('Authentication required. Please log in again.');
				return;
			}

			// Fetch events from API
			const eventsResponse = await axios.get(
				'http://localhost:8000/api/events/organizer',
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const fetchedEvents = eventsResponse.data.events || [];

			// Mock dashboard stats for now (these can be implemented later)
			const mockDashboardData: DashboardData = {
				totalEvents: fetchedEvents.length,
				totalRevenue: fetchedEvents.reduce(
					(sum: number, event: Event) =>
						sum +
						Number(event.price) * (event.total_seats - event.available_seats),
					0
				),
				totalAttendees: fetchedEvents.reduce(
					(sum: number, event: Event) =>
						sum + (event.total_seats - event.available_seats),
					0
				),
				pendingTransactions: 0,
				monthlyRevenue: [
					{ month: 'Jan', revenue: 2000 },
					{ month: 'Feb', revenue: 3000 },
					{ month: 'Mar', revenue: 4000 },
					{ month: 'Apr', revenue: 6000 },
				],
				eventStats: fetchedEvents.map((event: Event) => ({
					eventId: event.id.toString(),
					title: event.title,
					attendees: event.total_seats - event.available_seats,
					revenue:
						Number(event.price) * (event.total_seats - event.available_seats),
				})),
			};

			setDashboardData(mockDashboardData);
			setEvents(fetchedEvents);
		} catch (error: unknown) {
			console.error('fetchDashboardData: Error occurred:', error);
			if (error && typeof error === 'object' && 'response' in error) {
				const axiosError = error as {
					response: { data?: { message?: string }; status?: number };
				};
				if (axiosError.response?.status === 401) {
					setError('Authentication failed. Please log in again.');
					router.push('/auth/login');
				} else {
					setError(
						axiosError.response?.data?.message ||
							'Failed to load dashboard data'
					);
				}
			} else {
				setError('Network error. Please check your connection.');
			}
		} finally {
			setIsLoading(false);
		}
	}, [router]);

	// Check authentication and fetch initial data
	useEffect(() => {
		const token = localStorage.getItem('token');
		const userData = localStorage.getItem('user');

		if (!token || !userData) {
			router.push('/login');
			return;
		}

		const parsedUser = JSON.parse(userData);
		if (parsedUser.role !== 'organizer') {
			setError('Access denied. Organizer role required.');
			return;
		}

		setUser(parsedUser);
		fetchDashboardData();
	}, [router, fetchDashboardData]);

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		router.push('/login');
	};

	const handleGoHome = () => {
		router.push('/');
	};

	const handleEditEvent = (eventId: number) => {
		router.push(`/dashboard/edit-event/${eventId}`);
	};

	const handleViewEventDetails = (eventId: number) => {
		router.push(`/events/${eventId}`);
	};

	const handleDeleteEvent = async (eventId: number) => {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				setError('Authentication required');
				return;
			}

			await axios.delete(`http://localhost:8000/api/events/${eventId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			// Refresh dashboard data
			await fetchDashboardData();
			setSuccessMessage('Event deleted successfully');
		} catch (error) {
			console.error('Error deleting event:', error);
			setError('Failed to delete event');
		}
	};

	const handleCancelEvent = handleDeleteEvent; // Alias for compatibility

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-lg">Loading dashboard...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="text-red-500 text-lg mb-4">{error}</div>
					<Button onClick={() => router.push('/login')}>Go to Login</Button>
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
							<h1 className="text-2xl font-bold text-gray-900">
								Event Management Dashboard
							</h1>
							<p className="text-gray-600">Welcome back, {user?.name}</p>
						</div>
						<div className="flex items-center gap-4">
							<Button
								variant="outline"
								onClick={handleGoHome}
							>
								🏠 Home
							</Button>
							<Button
								variant="outline"
								onClick={() => router.push('/profile')}
							>
								Profile
							</Button>
							<Button
								variant="outline"
								onClick={() => router.push('/dashboard/create-event')}
								className="bg-blue-600 text-white hover:bg-blue-700"
							>
								+ Create Event
							</Button>
							<Button
								variant="outline"
								onClick={handleLogout}
							>
								Logout
							</Button>
						</div>
					</div>
				</div>
			</header>

			{/* Navigation Tabs */}
			<div className="bg-white border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<nav className="flex space-x-8">
						{[
							{ key: 'overview', label: 'Overview' },
							{ key: 'events', label: 'My Events' },
							{ key: 'transactions', label: 'Transactions' },
							{ key: 'attendees', label: 'Attendees' },
							{ key: 'statistics', label: 'Statistics' },
						].map((tab) => (
							<button
								key={tab.key}
								onClick={() =>
									setActiveTab(
										tab.key as
											| 'overview'
											| 'events'
											| 'transactions'
											| 'attendees'
											| 'statistics'
									)
								}
								className={`py-4 px-1 border-b-2 font-medium text-sm ${
									activeTab === tab.key
										? 'border-primary text-primary'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
							>
								{tab.label}
							</button>
						))}
					</nav>
				</div>
			</div>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
				{/* Success Message */}
				{successMessage && (
					<div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
						<div className="text-green-800">{successMessage}</div>
					</div>
				)}

				{activeTab === 'overview' && dashboardData && (
					<div className="space-y-6">
						{/* Main Stats */}
						<div className="bg-white p-6 rounded-lg shadow">
							<h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="bg-blue-50 p-4 rounded">
									<div className="text-2xl font-bold text-blue-600">
										{dashboardData.totalEvents}
									</div>
									<div className="text-sm text-gray-600">Total Events</div>
								</div>
								<div className="bg-green-50 p-4 rounded">
									<div className="text-2xl font-bold text-green-600">
										IDR {dashboardData.totalRevenue.toLocaleString()}
									</div>
									<div className="text-sm text-gray-600">Total Revenue</div>
								</div>
								<div className="bg-purple-50 p-4 rounded">
									<div className="text-2xl font-bold text-purple-600">
										{dashboardData.totalAttendees}
									</div>
									<div className="text-sm text-gray-600">Total Attendees</div>
								</div>
								<div className="bg-orange-50 p-4 rounded">
									<div className="text-2xl font-bold text-orange-600">
										{dashboardData.pendingTransactions}
									</div>
									<div className="text-sm text-gray-600">
										Pending Transactions
									</div>
								</div>
							</div>
						</div>

						{/* Quick Actions */}
						<div className="bg-white p-6 rounded-lg shadow">
							<h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<Button
									onClick={() => router.push('/dashboard/create-event')}
									className="h-16 text-left justify-start"
								>
									<div>
										<div className="font-medium">Create New Event</div>
										<div className="text-sm opacity-80">
											Set up your next event
										</div>
									</div>
								</Button>
								<Button
									variant="outline"
									onClick={() => setActiveTab('events')}
									className="h-16 text-left justify-start"
								>
									<div>
										<div className="font-medium">Manage Events</div>
										<div className="text-sm opacity-80">
											Edit or cancel events
										</div>
									</div>
								</Button>
								<Button
									variant="outline"
									onClick={() => setActiveTab('transactions')}
									className="h-16 text-left justify-start"
								>
									<div>
										<div className="font-medium">Review Payments</div>
										<div className="text-sm opacity-80">
											Check pending transactions
										</div>
									</div>
								</Button>
							</div>
						</div>
					</div>
				)}

				{activeTab === 'events' && (
					<EventList
						events={events}
						onRefresh={fetchDashboardData}
						onSelectEvent={() => {
							// View attendees functionality would go here
							setActiveTab('attendees');
						}}
						onEditEvent={handleEditEvent}
						onViewDetails={handleViewEventDetails}
						onCancelEvent={handleCancelEvent}
					/>
				)}

				{activeTab === 'transactions' && (
					<div className="bg-white p-6 rounded-lg shadow">
						<h2 className="text-2xl font-bold mb-4">Transaction Management</h2>
						<p className="text-gray-600 mb-6">
							Review and manage payment transactions from customers
						</p>
						<TransactionList onRefresh={fetchDashboardData} />
					</div>
				)}

				{activeTab === 'attendees' && (
					<div className="bg-white p-6 rounded-lg shadow">
						<AttendeeList onRefresh={fetchDashboardData} />
					</div>
				)}

				{activeTab === 'statistics' && (
					<div>
						<StatisticsDashboard />
					</div>
				)}
			</main>
		</div>
	);
}
