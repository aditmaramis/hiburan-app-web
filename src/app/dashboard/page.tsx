'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
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
			<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
				<div className="text-center">
					<div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
						<span className="text-white text-2xl">⏳</span>
					</div>
					<div className="text-white text-lg">Loading your dashboard...</div>
					<div className="text-gray-400 text-sm mt-2">Please wait a moment</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
				<div className="text-center bg-gray-800 p-8 rounded-xl border border-gray-700">
					<div className="text-red-400 text-lg mb-4">{error}</div>
					<button
						className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all duration-200 font-medium"
						onClick={() => router.push('/login')}
					>
						Go to Login
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-400">
			{/* Header */}
			<header className="bg-gray-800/50 backdrop-blur-sm border-b border-orange-500/20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-4">
						<div>
							<h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
								Event Management Dashboard
							</h1>
							<p className="text-white text-sm">
								Welcome back,{' '}
								<span className="text-orange-400 font-medium">
									{user?.name}
								</span>
								!
							</p>
						</div>
						<div className="flex items-center gap-2">
							<button
								className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-all duration-200 border border-gray-600 hover:border-orange-500/50"
								onClick={handleGoHome}
							>
								🏠 Home
							</button>
							<button
								className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-all duration-200 border border-gray-600 hover:border-orange-500/50"
								onClick={() => router.push('/profile')}
							>
								Profile
							</button>
							
							<button
								className="px-3 py-1.5 bg-gray-700 hover:bg-red-600 text-white text-sm rounded-lg transition-all duration-200 border border-gray-600 hover:border-red-500"
								onClick={handleLogout}
							>
								Logout
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Navigation Tabs */}
			<div className="bg-gray-800/30 backdrop-blur-sm border-b border-gray-700">
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
								className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
									activeTab === tab.key
										? 'border-orange-500 text-orange-400'
										: 'border-transparent text-white hover:text-gray-300 hover:border-gray-600'
								}`}
							>
								{tab.label}
							</button>
						))}
					</nav>
				</div>
			</div>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
				{/* Success Message */}
				{successMessage && (
					<div className="mb-4 bg-gradient-to-r from-green-600 to-green-700 p-4 rounded-xl border border-green-500">
						<div className="text-green-100 font-medium">{successMessage}</div>
					</div>
				)}

				{activeTab === 'overview' && dashboardData && (
					<div className="space-y-4">
						{/* Welcome Section */}
						<div className="mb-4 text-center">
							<h2 className="text-2xl font-bold text-gray-900 mb-1">
								Your Dashboard
							</h2>
							<p className="text-gray-600 text-sm">
								Manage your events, attendees, and revenue all in one place
							</p>
						</div>

						{/* Main Stats */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
							<div className="bg-gradient-to-br from-orange-600 to-orange-700 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
								<div className="flex items-center justify-between mb-2">
									<div className="text-2xl font-bold text-white">
										{dashboardData.totalEvents}
									</div>
									<div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
										<span className="text-white text-sm">🎭</span>
									</div>
								</div>
								<div className="text-sm text-orange-100">Total Events</div>
							</div>
							<div className="bg-gradient-to-br from-green-600 to-green-700 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
								<div className="flex items-center justify-between mb-2">
									<div className="text-lg font-bold text-white">
										IDR {dashboardData.totalRevenue.toLocaleString()}
									</div>
									<div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
										<span className="text-white text-sm">💰</span>
									</div>
								</div>
								<div className="text-sm text-green-100">Total Revenue</div>
							</div>
							<div className="bg-gradient-to-br from-purple-600 to-purple-700 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
								<div className="flex items-center justify-between mb-2">
									<div className="text-2xl font-bold text-white">
										{dashboardData.totalAttendees}
									</div>
									<div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
										<span className="text-white text-sm">👥</span>
									</div>
								</div>
								<div className="text-sm text-purple-100">Total Attendees</div>
							</div>
							<div className="bg-gradient-to-br from-gray-600 to-gray-700 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
								<div className="flex items-center justify-between mb-2">
									<div className="text-2xl font-bold text-white">
										{dashboardData.pendingTransactions}
									</div>
									<div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
										<span className="text-white text-sm">⏳</span>
									</div>
								</div>
								<div className="text-sm text-gray-100">
									Pending Transactions
								</div>
							</div>
						</div>

						{/* Quick Actions */}
						<div className="bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-orange-500/30">
							<div className="flex items-center justify-between mb-3">
								<h3 className="text-lg font-bold text-white">Quick Actions</h3>
								<div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
									<span className="text-white text-xs">⚡</span>
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<button
									onClick={() => router.push('/dashboard/create-event')}
									className="p-4 bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
								>
									<div className="text-left">
										<div className="font-medium mb-1">Create New Event</div>
										<div className="text-sm opacity-90">
											Set up your next event
										</div>
									</div>
								</button>
								<button
									onClick={() => setActiveTab('events')}
									className="p-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-300 border border-gray-600 hover:border-orange-500/50"
								>
									<div className="text-left">
										<div className="font-medium mb-1">Manage Events</div>
										<div className="text-sm opacity-80">
											Edit or cancel events
										</div>
									</div>
								</button>
								<button
									onClick={() => setActiveTab('transactions')}
									className="p-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-300 border border-gray-600 hover:border-orange-500/50"
								>
									<div className="text-left">
										<div className="font-medium mb-1">Review Payments</div>
										<div className="text-sm opacity-80">
											Check pending transactions
										</div>
									</div>
								</button>
							</div>
						</div>
					</div>
				)}

				{activeTab === 'events' && (
					<div className="bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700">
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
					</div>
				)}

				{activeTab === 'transactions' && (
					<div className="bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700">
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-xl font-bold text-white">
								Transaction Management
							</h2>
							<div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
								<span className="text-white text-xs">💳</span>
							</div>
						</div>
						<p className="text-gray-400 mb-4 text-sm">
							Review and manage payment transactions from customers
						</p>
						<TransactionList onRefresh={fetchDashboardData} />
					</div>
				)}

				{activeTab === 'attendees' && (
					<div className="bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700">
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-xl font-bold text-white">
								Attendee Management
							</h2>
							<div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
								<span className="text-white text-xs">👥</span>
							</div>
						</div>
						<AttendeeList onRefresh={fetchDashboardData} />
					</div>
				)}

				{activeTab === 'statistics' && (
					<div className="bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700">
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-xl font-bold text-white">
								Statistics & Analytics
							</h2>
							<div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
								<span className="text-white text-xs">📊</span>
							</div>
						</div>
						<StatisticsDashboard />
					</div>
				)}
			</main>
		</div>
	);
}
