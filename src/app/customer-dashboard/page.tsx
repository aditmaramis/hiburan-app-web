'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
	id: string;
	name: string;
	email: string;
	role: string;
}

export default function CustomerDashboard() {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const router = useRouter();

	// Check authentication and user role
	useEffect(() => {
		const token = localStorage.getItem('token');
		const userData = localStorage.getItem('user');

		if (!token || !userData) {
			router.push('/login');
			return;
		}

		const parsedUser = JSON.parse(userData);
		if (parsedUser.role !== 'customer') {
			// If not a customer, redirect to appropriate dashboard
			if (parsedUser.role === 'organizer') {
				router.push('/dashboard');
			} else {
				setError('Access denied.');
			}
			return;
		}

		setUser(parsedUser);
		setIsLoading(false);
	}, [router]);

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
								Event Hub
							</h1>
							<p className="text-gray-300 text-sm">
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
								Home
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

			{/* Main Content */}
			<main className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
				{/* Welcome Section */}
				<div className="mb-4 text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-1">
						Your Dashboard
					</h2>
					<p className="text-gray-600 text-sm">
						Manage your events, tickets, and profile all in one place
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{/* Quick Actions - Featured */}
					<div className="lg:col-span-1 bg-gradient-to-br from-orange-600 to-orange-700 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-lg font-bold text-white">Quick Actions</h2>
							<div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
								<span className="text-white text-xs">⚡</span>
							</div>
						</div>
						<div className="space-y-2">
							<button
								className="w-full py-2 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition-all duration-200 font-medium backdrop-blur-sm border border-white/20"
								onClick={() => router.push('/events')}
							>
								🎫 Browse Events
							</button>
							<button
								className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-all duration-200 border border-white/20"
								onClick={() => router.push('/profile')}
							>
								👤 Manage Profile
							</button>
							<button
								className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-all duration-200 border border-white/20"
								onClick={() => router.push('/my-tickets')}
							>
								🎟️ My Tickets
							</button>
						</div>
					</div>

					{/* Profile Summary */}
					<div className="bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-orange-500/30">
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-lg font-bold text-white">Profile Summary</h2>
							<div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
								<span className="text-white text-xs">👤</span>
							</div>
						</div>
						<div className="space-y-2">
							<div className="flex justify-between items-center">
								<span className="text-gray-400 text-sm">Name:</span>
								<span className="text-white font-medium text-sm">
									{user?.name}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-400 text-sm">Email:</span>
								<span className="text-white text-xs">{user?.email}</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-400 text-sm">User ID:</span>
								<span className="text-orange-400 font-medium text-sm">
									#{user?.id}
								</span>
							</div>
						</div>
						<button
							className="w-full mt-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-all duration-200 border border-gray-600"
							onClick={() => router.push('/profile')}
						>
							View Full Profile
						</button>
					</div>

					{/* Recent Activity */}
					<div className="bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-orange-500/30">
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-lg font-bold text-white">Recent Activity</h2>
							<div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
								<span className="text-white text-xs">📊</span>
							</div>
						</div>
						<div className="text-center py-4">
							<div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
								<span className="text-gray-400 text-lg">📈</span>
							</div>
							<p className="text-gray-400 text-sm mb-1">No recent activity</p>
							<p className="text-gray-500 text-xs">
								Start booking events to see your activity here!
							</p>
						</div>
					</div>

					{/* Rewards Section - Featured */}
					<div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-500/30 hover:border-orange-500/50">
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-lg font-bold text-white">Rewards & Points</h2>
							<div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
								<span className="text-white text-xs">🏆</span>
							</div>
						</div>
						<div className="text-center">
							<div className="relative">
								<div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-1">
									0
								</div>
								<div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 rounded-full flex items-center justify-center">
									<span className="text-white text-xs">✨</span>
								</div>
							</div>
							<p className="text-gray-400 text-sm mb-3">Total Points</p>
							<button
								className="w-full mt-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-all duration-200 font-medium"
								onClick={() => router.push('/profile')}
							>
								View Rewards
							</button>
						</div>
					</div>

					{/* Referral Section */}
					<div className="bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-orange-500/30">
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-lg font-bold text-white">Refer Friends</h2>
							<div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
								<span className="text-white text-xs">🤝</span>
							</div>
						</div>
						<div className="text-center">
							<div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center mx-auto mb-2">
								<span className="text-white text-lg">💝</span>
							</div>
							<p className="text-gray-400 text-xs mb-3">
								Invite friends and earn rewards!
							</p>
							<button
								className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-all duration-200 border border-gray-600"
								onClick={() => router.push('/profile')}
							>
								Get Referral Code
							</button>
						</div>
					</div>

					{/* Events Section */}
					<div className="bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-orange-500/30">
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-lg font-bold text-white">Discover Events</h2>
							<div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
								<span className="text-white text-xs">🎉</span>
							</div>
						</div>
						<div className="text-center">
							<div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center mx-auto mb-2">
								<span className="text-white text-lg">🎭</span>
							</div>
							<p className="text-gray-400 text-xs mb-3">
								Find amazing events happening near you!
							</p>
							<button
								className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-all duration-200 font-medium"
								onClick={() => router.push('/events')}
							>
								Explore Events
							</button>
						</div>
					</div>
				</div>

				{/* Bottom Stats Bar */}
				<div className="mt-4 bg-gray-800 rounded-xl p-4 border border-gray-700">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="text-center">
							<div className="text-xl font-bold text-orange-400">0</div>
							<div className="text-gray-400 text-xs">Events Attended</div>
						</div>
						<div className="text-center">
							<div className="text-xl font-bold text-orange-400">0</div>
							<div className="text-gray-400 text-xs">Active Tickets</div>
						</div>
						<div className="text-center">
							<div className="text-xl font-bold text-orange-400">0</div>
							<div className="text-gray-400 text-xs">Points Earned</div>
						</div>
						<div className="text-center">
							<div className="text-xl font-bold text-orange-400">0</div>
							<div className="text-gray-400 text-xs">Friends Referred</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
