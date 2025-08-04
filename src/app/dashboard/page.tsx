'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface User {
	id: string;
	name: string;
	email: string;
	role: string;
}

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

interface Transaction {
	id: string;
	eventId: string;
	userId: string;
	quantity: number;
	totalPrice: number;
	status: 'pending' | 'accepted' | 'rejected';
	paymentProof?: string;
	pointsUsed: number;
	voucherUsed?: string;
	createdAt: string;
	event: Event;
	user: User;
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
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [activeTab, setActiveTab] = useState<
		'overview' | 'events' | 'transactions' | 'attendees'
	>('overview');
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const router = useRouter();

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
	}, [router]);

	const fetchDashboardData = async () => {
		try {
			console.log('fetchDashboardData: Starting...');
			setIsLoading(true);
			console.log('fetchDashboardData: Set loading to true');

			// For now, use mock data until we create the API endpoints
			const mockDashboardData: DashboardData = {
				totalEvents: 5,
				totalRevenue: 15000,
				totalAttendees: 250,
				pendingTransactions: 3,
				monthlyRevenue: [
					{ month: 'Jan', revenue: 2000 },
					{ month: 'Feb', revenue: 3000 },
					{ month: 'Mar', revenue: 4000 },
					{ month: 'Apr', revenue: 6000 },
				],
				eventStats: [
					{ eventId: '1', title: 'Jazz Night', attendees: 50, revenue: 2500 },
					{
						eventId: '2',
						title: 'Rock Concert',
						attendees: 100,
						revenue: 5000,
					},
				],
			};

			const mockEvents: Event[] = [
				{
					id: '1',
					title: 'Jazz Night',
					description: 'A smooth jazz evening',
					date: '2025-08-15',
					time: '19:00',
					location: 'Blue Note Jazz Club',
					price: 50,
					availableSeats: 20,
					totalSeats: 50,
					category: 'Music',
					organizerId: '1',
					createdAt: '2025-08-01T00:00:00Z',
				},
				{
					id: '2',
					title: 'Rock Concert',
					description: 'High energy rock show',
					date: '2025-08-20',
					time: '20:00',
					location: 'Rock Arena',
					price: 75,
					availableSeats: 50,
					totalSeats: 100,
					category: 'Music',
					organizerId: '1',
					createdAt: '2025-08-02T00:00:00Z',
				},
			];

			const mockTransactions: Transaction[] = [
				{
					id: '1',
					eventId: '1',
					userId: '1',
					quantity: 2,
					totalPrice: 100,
					status: 'pending',
					pointsUsed: 0,
					createdAt: '2025-08-01T00:00:00Z',
					event: {
						id: '1',
						title: 'Jazz Night',
						description: 'A smooth jazz evening',
						date: '2025-08-15',
						time: '19:00',
						location: 'Blue Note Jazz Club',
						price: 50,
						availableSeats: 20,
						totalSeats: 50,
						category: 'Music',
						organizerId: '1',
						createdAt: '2025-08-01T00:00:00Z',
					},
					user: {
						id: '2',
						name: 'John Doe',
						email: 'john@example.com',
						role: 'customer',
					},
				},
			];

			setDashboardData(mockDashboardData);
			setEvents(mockEvents);
			setTransactions(mockTransactions);
			console.log('fetchDashboardData: Data set successfully');
		} catch (error: unknown) {
			console.error('fetchDashboardData: Error occurred:', error);
			if (error && typeof error === 'object' && 'response' in error) {
				const axiosError = error as {
					response: { data?: { message?: string } };
				};
				setError(
					axiosError.response.data?.message || 'Failed to load dashboard data'
				);
			} else {
				setError('Network error. Please check your connection.');
			}
		} finally {
			console.log('fetchDashboardData: Setting loading to false');
			setIsLoading(false);
			console.log('fetchDashboardData: Complete');
		}
	};

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		router.push('/login');
	};

	const handleGoHome = () => {
		router.push('/');
	};

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
								onClick={() => router.push('/events/create')}
							>
								Create Event
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
				{activeTab === 'overview' && dashboardData && (
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
									${dashboardData.totalRevenue}
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
				)}

				{activeTab === 'events' && (
					<div className="bg-white p-6 rounded-lg shadow">
						<h2 className="text-2xl font-bold mb-4">My Events</h2>
						{events.length > 0 ? (
							<div className="space-y-4">
								{events.map((event) => (
									<div
										key={event.id}
										className="border p-4 rounded"
									>
										<h3 className="font-semibold">{event.title}</h3>
										<p className="text-gray-600">{event.description}</p>
										<p className="text-sm text-gray-500">
											{event.date} at {event.time}
										</p>
									</div>
								))}
							</div>
						) : (
							<p>No events found.</p>
						)}
					</div>
				)}

				{activeTab === 'transactions' && (
					<div className="bg-white p-6 rounded-lg shadow">
						<h2 className="text-2xl font-bold mb-4">Transactions</h2>
						{transactions.length > 0 ? (
							<div className="space-y-4">
								{transactions.map((transaction) => (
									<div
										key={transaction.id}
										className="border p-4 rounded"
									>
										<h3 className="font-semibold">{transaction.event.title}</h3>
										<p>
											Status:{' '}
											<span className="capitalize">{transaction.status}</span>
										</p>
										<p>Total: ${transaction.totalPrice}</p>
									</div>
								))}
							</div>
						) : (
							<p>No transactions found.</p>
						)}
					</div>
				)}

				{activeTab === 'attendees' && (
					<div className="bg-white p-6 rounded-lg shadow">
						<h2 className="text-2xl font-bold mb-4">Attendees</h2>
						<p>Attendee management coming soon...</p>
					</div>
				)}
			</main>
		</div>
	);
}
