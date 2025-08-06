'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from '@/lib/axios';
import ImageUpload from '@/components/ui/image-upload';

interface UserProfile {
	id: number;
	name: string;
	email: string;
	role: string;
	referral_code: string;
	profile_picture?: string;
	created_at: string;
	statistics: {
		totalReferrals: number;
		totalPoints: number;
		activeCoupons: number;
	};
	referred_users: Array<{
		id: number;
		name: string;
		email: string;
		created_at: string;
	}>;
	referral_points: Array<{
		points: number;
		earned_at: string;
		expires_at: string;
	}>;
	coupons: Array<{
		code: string;
		discount_percent: number;
		issued_at: string;
		expires_at: string;
		source: string;
	}>;
}

interface Prize {
	id: number;
	name: string;
	description: string;
	points_required: number;
	stock: number;
}

export default function ProfilePage() {
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [prizes, setPrizes] = useState<Prize[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('overview');
	const [editMode, setEditMode] = useState(false);
	const [editForm, setEditForm] = useState({
		name: '',
		email: '',
		profile_picture: '',
	});
	const [passwordForm, setPasswordForm] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});
	const [deleteForm, setDeleteForm] = useState({
		confirmationText: '',
		password: '',
	});
	const [message, setMessage] = useState('');
	const router = useRouter();

	const handleBackToDashboard = () => {
		if (profile?.role === 'organizer') {
			router.push('/dashboard');
		} else if (profile?.role === 'customer') {
			router.push('/customer-dashboard');
		} else {
			// Fallback to login if role is unclear
			router.push('/login');
		}
	};

	const fetchProfile = useCallback(async () => {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				router.push('/login');
				return;
			}

			const response = await axios.get('/profile', {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (response.data.success) {
				setProfile(response.data.profile);
				setEditForm({
					name: response.data.profile.name || '',
					email: response.data.profile.email || '',
					profile_picture: response.data.profile.profile_picture || '',
				});
			}
		} catch (error: unknown) {
			console.error('Error fetching profile:', error);
			if (error && typeof error === 'object' && 'response' in error) {
				const axiosError = error as { response?: { status: number } };
				if (axiosError.response?.status === 401) {
					localStorage.removeItem('token');
					router.push('/login');
				}
			}
		} finally {
			setLoading(false);
		}
	}, [router]);

	useEffect(() => {
		fetchProfile();
		fetchPrizes();
	}, [fetchProfile]);

	const fetchPrizes = async () => {
		try {
			const token = localStorage.getItem('token');
			console.log(
				'Fetching prizes with token:',
				token ? 'Token exists' : 'No token'
			);

			const response = await axios.get('/referral/prizes', {
				headers: { Authorization: `Bearer ${token}` },
			});

			console.log('Prizes API response:', response.data);

			if (response.data.success) {
				setPrizes(response.data.data);
				console.log('Prizes set:', response.data.data);
			} else {
				console.log('Prizes API returned success: false');
			}
		} catch (error) {
			console.error('Error fetching prizes:', error);
			if (error && typeof error === 'object' && 'response' in error) {
				const axiosError = error as {
					response?: { status: number; data?: unknown };
				};
				console.error('Error response:', axiosError.response?.data);
				console.error('Error status:', axiosError.response?.status);
			}
		}
	};

	const handleUpdateProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const token = localStorage.getItem('token');
			// Only send name and profile_picture, not email
			const updateData = {
				name: editForm.name,
				profile_picture: editForm.profile_picture,
			};
			const response = await axios.put('/profile', updateData, {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (response.data.success) {
				setMessage('Profile updated successfully!');
				setEditMode(false);
				fetchProfile();
				setTimeout(() => setMessage(''), 3000);
			}
		} catch (error: unknown) {
			const message =
				error && typeof error === 'object' && 'response' in error
					? (error as { response?: { data?: { message?: string } } }).response
							?.data?.message || 'Error updating profile'
					: 'Error updating profile';
			setMessage(message);
		}
	};

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const token = localStorage.getItem('token');
			const response = await axios.put(
				'/profile/change-password',
				passwordForm,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			if (response.data.success) {
				setMessage('Password changed successfully!');
				setPasswordForm({
					currentPassword: '',
					newPassword: '',
					confirmPassword: '',
				});
				setTimeout(() => setMessage(''), 3000);
			}
		} catch (error: unknown) {
			const message =
				error && typeof error === 'object' && 'response' in error
					? (error as { response?: { data?: { message?: string } } }).response
							?.data?.message || 'Error changing password'
					: 'Error changing password';
			setMessage(message);
		}
	};

	const handleClaimPrize = async (prizeId: number) => {
		try {
			const token = localStorage.getItem('token');
			const response = await axios.post(
				'/referral/claim-prize',
				{ prizeId },
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			if (response.data.success) {
				setMessage(response.data.message);
				fetchProfile();
				fetchPrizes();
				setTimeout(() => setMessage(''), 3000);
			}
		} catch (error: unknown) {
			const message =
				error && typeof error === 'object' && 'response' in error
					? (error as { response?: { data?: { message?: string } } }).response
							?.data?.message || 'Error claiming prize'
					: 'Error claiming prize';
			setMessage(message);
		}
	};

	const handleDeleteAccount = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate confirmation text
		if (deleteForm.confirmationText !== 'delete account') {
			setMessage('Please type "delete account" exactly to confirm.');
			return;
		}

		// Validate password is provided
		if (!deleteForm.password) {
			setMessage('Please enter your password to confirm account deletion.');
			return;
		}

		try {
			const token = localStorage.getItem('token');
			const response = await axios.delete('/profile', {
				headers: { Authorization: `Bearer ${token}` },
				data: {
					password: deleteForm.password,
					confirmDelete: deleteForm.confirmationText,
				},
			});

			if (response.data.success) {
				setMessage('Account deleted successfully. Redirecting...');
				// Clear local storage and redirect to home
				localStorage.removeItem('token');
				localStorage.removeItem('user');
				setTimeout(() => {
					router.push('/');
				}, 2000);
			}
		} catch (error: unknown) {
			const message =
				error && typeof error === 'object' && 'response' in error
					? (error as { response?: { data?: { message?: string } } }).response
							?.data?.message || 'Error deleting account'
					: 'Error deleting account';
			setMessage(message);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<div className="text-center">
					<div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
						<span className="text-white text-2xl">⏳</span>
					</div>
					<div className="text-gray-900 text-lg">Loading your profile...</div>
					<div className="text-gray-600 text-sm mt-2">Please wait a moment</div>
				</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<div className="text-center bg-gray-800 p-8 rounded-xl border border-gray-700">
					<h2 className="text-2xl font-bold text-white mb-4">
						Profile not found
					</h2>
					<button
						onClick={() => router.push('/auth/login')}
						className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all duration-200 font-medium"
					>
						Go to Login
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen relative">
			{/* Full screen background image - fixed positioning */}
			<div className="fixed inset-0 z-0">
				<Image
					src="/concert.jpg"
					alt="Profile background"
					fill
					className="object-cover object-center filter brightness-100"
					priority
					sizes="100vw"
				/>
				{/* Minimal dark overlay for maximum image visibility */}
				<div className="absolute inset-0 bg-black/5" />
				{/* Subtle glass overlay for gentle blur */}
				<div className="absolute inset-0 backdrop-blur-sm bg-black/5" />
			</div>

			{/* Very light orange-themed animated background gradient overlay */}
			<div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-900/20 via-orange-900/10 to-amber-900/20 animate-gradient-shift" />

			{/* Main content */}
			<div className="relative z-10 min-h-screen">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					{/* Header */}
					<div className="bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-700/50 p-6 mb-6">
						<div className="flex items-center space-x-6">
							<div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
								{profile.profile_picture ? (
									<Image
										src={profile.profile_picture}
										alt="Profile"
										width={96}
										height={96}
										className="w-24 h-24 rounded-full object-cover"
									/>
								) : (
									<span className="text-3xl font-bold text-white">
										{profile.name?.charAt(0).toUpperCase()}
									</span>
								)}
							</div>
							<div className="flex-1">
								<h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
									{profile.name}
								</h1>
								<p className="text-gray-300 text-lg">{profile.email}</p>
								<div className="flex items-center mt-2">
									<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
										User ID: #{profile.id}
									</span>
								</div>
							</div>
							<div className="flex items-center space-x-4">
								<div className="flex flex-col space-y-2">
									<button
										onClick={() => router.push('/')}
										className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center border border-orange-500 text-sm"
									>
										<span>Home</span>
									</button>
									<button
										onClick={handleBackToDashboard}
										className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 border border-gray-600 text-sm"
									>
										<svg
											className="w-4 h-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M10 19l-7-7m0 0l7-7m-7 7h18"
											/>
										</svg>
										<span>Back to Dashboard</span>
									</button>
								</div>
								<div className="text-right bg-gradient-to-br from-orange-600 to-orange-700 p-4 rounded-lg">
									<div className="text-2xl font-bold text-white">
										{profile.statistics.totalPoints.toLocaleString()}
									</div>
									<div className="text-orange-100 text-sm">Total Points</div>
								</div>
							</div>
						</div>
					</div>

					{/* Message */}
					{message && (
						<div className="mb-6 p-4 bg-green-100/90 backdrop-blur-sm border border-green-400 text-green-700 rounded-lg shadow-sm">
							{message}
						</div>
					)}

					{/* Tabs */}
					<div className="bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-700/50">
						<div className="border-b border-gray-700">
							<nav className="flex space-x-8 px-6">
								{[
									{ id: 'overview', label: 'Overview', icon: '📊' },
									{ id: 'referrals', label: 'Referrals', icon: '👥' },
									{ id: 'prizes', label: 'Prizes', icon: '🏆' },
									{ id: 'coupons', label: 'Coupons', icon: '🎟️' },
									{ id: 'settings', label: 'Settings', icon: '⚙️' },
								].map((tab) => (
									<button
										key={tab.id}
										onClick={() => setActiveTab(tab.id)}
										className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all duration-200 ${
											activeTab === tab.id
												? 'border-orange-500 text-orange-400'
												: 'border-transparent text-gray-400 hover:text-gray-300 hover:border-orange-300'
										}`}
									>
										<span>{tab.icon}</span>
										<span>{tab.label}</span>
									</button>
								))}
							</nav>
						</div>

						<div className="p-6">
							{/* Overview Tab */}
							{activeTab === 'overview' && (
								<div className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
										<div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 rounded-xl text-white shadow-lg">
											<div className="flex items-center justify-between mb-2">
												<h3 className="text-lg font-semibold">
													Total Referrals
												</h3>
												<span className="text-2xl">👥</span>
											</div>
											<p className="text-3xl font-bold">
												{profile.statistics.totalReferrals}
											</p>
										</div>
										<div className="bg-gradient-to-r from-gray-700 to-gray-800 p-6 rounded-xl text-white shadow-lg border border-orange-500/30">
											<div className="flex items-center justify-between mb-2">
												<h3 className="text-lg font-semibold">
													Available Points
												</h3>
												<span className="text-2xl">💎</span>
											</div>
											<p className="text-3xl font-bold text-orange-400">
												{profile.statistics.totalPoints.toLocaleString()}
											</p>
										</div>
										<div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 rounded-xl text-white shadow-lg">
											<div className="flex items-center justify-between mb-2">
												<h3 className="text-lg font-semibold">
													Active Coupons
												</h3>
												<span className="text-2xl">🎟️</span>
											</div>
											<p className="text-3xl font-bold">
												{profile.statistics.activeCoupons}
											</p>
										</div>
									</div>

									<div className="bg-gray-700/80 backdrop-blur-sm p-6 rounded-xl border border-gray-600/50">
										<h3 className="text-lg font-semibold mb-4 text-white flex items-center">
											<span className="mr-2">🔗</span>
											Your Referral Code
										</h3>
										<div className="flex items-center space-x-4">
											<code className="bg-gray-800 px-4 py-3 rounded-lg border border-orange-500/30 text-lg font-mono text-orange-400 flex-1">
												{profile.referral_code}
											</code>
											<button
												onClick={() =>
													navigator.clipboard.writeText(profile.referral_code)
												}
												className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200 font-medium"
											>
												Copy
											</button>
										</div>
										<p className="text-sm text-gray-300 mt-3 bg-orange-900/20 p-3 rounded-lg border border-orange-500/20">
											💡 Share this code with friends to earn 10,000 points when
											they register!
										</p>
									</div>
								</div>
							)}

							{/* Referrals Tab */}
							{activeTab === 'referrals' && (
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
									<div className="bg-gray-700/80 backdrop-blur-sm p-4 rounded-xl border border-gray-600/50">
										<h3 className="text-lg font-semibold mb-4 text-white flex items-center">
											<span className="mr-2">👥</span>
											Your Referrals
										</h3>
										{profile.referred_users.length > 0 ? (
											<div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-600 max-h-80">
												<div className="overflow-x-auto overflow-y-auto max-h-80">
													<table className="min-w-full divide-y divide-gray-600">
														<thead className="bg-gray-900 sticky top-0">
															<tr>
																<th className="px-3 py-2 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">
																	Name
																</th>
																<th className="px-3 py-2 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">
																	Email
																</th>
																<th className="px-3 py-2 text-left text-xs font-medium text-orange-400 uppercase tracking-wider">
																	Joined
																</th>
															</tr>
														</thead>
														<tbody className="bg-gray-800 divide-y divide-gray-600">
															{profile.referred_users.map((user) => (
																<tr
																	key={user.id}
																	className="hover:bg-gray-700 transition-colors duration-200"
																>
																	<td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-white">
																		{user.name}
																	</td>
																	<td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
																		{user.email}
																	</td>
																	<td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
																		{new Date(
																			user.created_at
																		).toLocaleDateString()}
																	</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>
											</div>
										) : (
											<div className="text-center py-6 bg-gray-800 rounded-lg border border-orange-500/20">
												<span className="text-3xl mb-2 block">📭</span>
												<h4 className="text-base font-medium text-gray-300 mb-2">
													No referrals yet
												</h4>
												<p className="text-gray-400 text-sm">
													Start sharing your referral code!
												</p>
											</div>
										)}
									</div>

									<div className="bg-gray-700/80 backdrop-blur-sm p-4 rounded-xl border border-gray-600/50">
										<h3 className="text-lg font-semibold mb-4 text-white flex items-center">
											<span className="mr-2">💎</span>
											Points History
										</h3>
										{profile.referral_points.length > 0 ? (
											<div className="space-y-2 max-h-80 overflow-y-auto">
												{profile.referral_points.map((point, index) => (
													<div
														key={index}
														className="bg-gray-800 p-3 rounded-lg border border-gray-600 hover:border-orange-500/50 transition-all duration-200"
													>
														<div className="flex justify-between items-center">
															<div className="flex items-center space-x-2">
																<div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
																	<span className="text-white font-bold text-xs">
																		+
																	</span>
																</div>
																<span className="text-orange-400 font-semibold text-sm">
																	+{point.points.toLocaleString()} pts
																</span>
															</div>
															<div className="text-right text-xs">
																<div className="text-gray-300">
																	{new Date(
																		point.earned_at
																	).toLocaleDateString()}
																</div>
																<div className="text-gray-400">
																	Exp:{' '}
																	{new Date(
																		point.expires_at
																	).toLocaleDateString()}
																</div>
															</div>
														</div>
													</div>
												))}
											</div>
										) : (
											<div className="text-center py-6 bg-gray-800 rounded-lg border border-orange-500/20">
												<span className="text-3xl mb-2 block">💰</span>
												<h4 className="text-base font-medium text-gray-300 mb-2">
													No points earned yet
												</h4>
												<p className="text-gray-400 text-sm">
													Earn points by referring friends!
												</p>
											</div>
										)}
									</div>
								</div>
							)}

							{/* Prizes Tab */}
							{activeTab === 'prizes' && (
								<div className="space-y-6">
									<div className="bg-gray-700/80 backdrop-blur-sm p-6 rounded-xl border border-gray-600/50">
										<div className="flex justify-between items-center mb-6">
											<h3 className="text-lg font-semibold text-white flex items-center">
												<span className="mr-2">🏆</span>
												Available Prizes
											</h3>
											<div className="text-sm bg-orange-900/30 px-4 py-2 rounded-lg border border-orange-500/30">
												<span className="text-gray-300">Your Points: </span>
												<span className="font-bold text-orange-400">
													{profile.statistics.totalPoints.toLocaleString()}
												</span>
											</div>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
											{prizes.map((prize) => (
												<div
													key={prize.id}
													className="bg-gray-800 border border-gray-600 rounded-xl p-6 shadow-lg hover:border-orange-500/50 transition-all duration-200 flex flex-col h-full"
												>
													<h4 className="font-semibold text-lg mb-2 text-white">
														{prize.name}
													</h4>
													<p className="text-gray-300 text-sm mb-4 flex-grow">
														{prize.description}
													</p>
													<div className="flex justify-between items-center mb-4">
														<div className="flex items-center space-x-2">
															<span className="text-2xl font-bold text-orange-400">
																{prize.points_required.toLocaleString()}
															</span>
															<span className="text-orange-500 text-sm">
																pts
															</span>
														</div>
														<span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">
															Stock: {prize.stock}
														</span>
													</div>
													<button
														onClick={() => handleClaimPrize(prize.id)}
														disabled={
															profile.statistics.totalPoints <
																prize.points_required || prize.stock === 0
														}
														className={`w-full py-2 px-3 rounded-lg font-medium transition-all duration-200 text-sm ${
															profile.statistics.totalPoints >=
																prize.points_required && prize.stock > 0
																? 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg'
																: 'bg-gray-600 text-gray-400 cursor-not-allowed'
														}`}
													>
														{prize.stock === 0
															? '🚫 Out of Stock'
															: profile.statistics.totalPoints <
															  prize.points_required
															? '💸 Insufficient Points'
															: '🎁 Claim Prize'}
													</button>
												</div>
											))}
										</div>
									</div>
								</div>
							)}

							{/* Coupons Tab */}
							{activeTab === 'coupons' && (
								<div className="space-y-6">
									<div className="bg-gray-700/80 backdrop-blur-sm p-6 rounded-xl border border-gray-600/50">
										<h3 className="text-lg font-semibold text-white mb-6 flex items-center">
											<span className="mr-2">🎟️</span>
											Your Coupons
										</h3>
										{profile.coupons.length > 0 ? (
											<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
												{profile.coupons.map((coupon, index) => (
													<div
														key={index}
														className="bg-gradient-to-r from-orange-900/40 to-gray-800 p-6 rounded-xl border border-orange-500/30 shadow-lg hover:shadow-xl transition-all duration-200"
													>
														<div className="flex justify-between items-start mb-4">
															<div>
																<h4 className="font-semibold text-lg text-white">
																	{coupon.discount_percent}% Discount
																</h4>
																<p className="text-sm text-gray-300 capitalize">
																	Source: {coupon.source}
																</p>
															</div>
															<span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium">
																Active
															</span>
														</div>
														<div className="bg-gray-900 p-4 rounded-lg border-2 border-dashed border-orange-500/50 mb-4">
															<code className="text-lg font-mono font-bold text-orange-400 block text-center">
																{coupon.code}
															</code>
														</div>
														<div className="text-sm text-gray-300 space-y-1">
															<div className="flex items-center">
																<span className="text-gray-400 mr-2">📅</span>
																Issued:{' '}
																{new Date(
																	coupon.issued_at
																).toLocaleDateString()}
															</div>
															<div className="flex items-center">
																<span className="text-gray-400 mr-2">⏰</span>
																Expires:{' '}
																{new Date(
																	coupon.expires_at
																).toLocaleDateString()}
															</div>
														</div>
													</div>
												))}
											</div>
										) : (
											<div className="text-center py-12 bg-gray-800 rounded-lg border border-orange-500/20">
												<span className="text-6xl mb-4 block">🎫</span>
												<h4 className="text-lg font-medium text-gray-300 mb-2">
													No active coupons
												</h4>
												<p className="text-gray-400">
													Get coupons by referring friends!
												</p>
											</div>
										)}
									</div>
								</div>
							)}

							{/* Settings Tab */}
							{activeTab === 'settings' && (
								<div className="space-y-6">
									{/* First Row - Two Columns */}
									<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
										{/* Profile Update - Left Column */}
										<div className="bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-xl p-6">
											<div className="flex justify-between items-center mb-4">
												<h3 className="text-lg font-semibold text-white flex items-center">
													<span className="mr-2">👤</span>
													Profile Information
												</h3>
												<button
													onClick={() => setEditMode(!editMode)}
													className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 text-sm"
												>
													{editMode ? 'Cancel' : 'Edit'}
												</button>
											</div>

											{editMode ? (
												<form
													onSubmit={handleUpdateProfile}
													className="space-y-4"
												>
													<div>
														<label className="block text-sm font-medium text-gray-300">
															Name
														</label>
														<input
															type="text"
															value={editForm.name}
															onChange={(e) =>
																setEditForm({
																	...editForm,
																	name: e.target.value,
																})
															}
															className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
														/>
													</div>
													<div>
														<label className="block text-sm font-medium text-gray-300">
															Email
														</label>
														<input
															type="email"
															value={profile.email}
															disabled
															className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-gray-400 cursor-not-allowed"
														/>
														<p className="text-xs text-gray-400 mt-1">
															Email cannot be changed for security reasons
														</p>
													</div>
													<div>
														<ImageUpload
															onImageUploaded={(imageUrl) => {
																setEditForm((prev) => ({
																	...prev,
																	profile_picture: imageUrl,
																}));
															}}
															currentImage={editForm.profile_picture}
															label="Profile Picture"
															category="profiles"
															maxSize={2}
														/>
													</div>
													<button
														type="submit"
														className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 font-medium"
													>
														Save Changes
													</button>
												</form>
											) : (
												<div className="space-y-3 bg-gray-800 p-4 rounded-lg border border-gray-600">
													<div className="flex items-center">
														<strong className="text-gray-300 w-24">
															Name:
														</strong>
														<span className="text-white">{profile.name}</span>
													</div>
													<div className="flex items-center">
														<strong className="text-gray-300 w-24">
															Email:
														</strong>
														<span className="text-white">{profile.email}</span>
													</div>
													<div className="flex items-center">
														<strong className="text-gray-300 w-24">
															User ID:
														</strong>
														<span className="text-orange-400">
															#{profile.id}
														</span>
													</div>
													<div className="flex items-center">
														<strong className="text-gray-300 w-24">
															Member since:
														</strong>
														<span className="text-white">
															{new Date(
																profile.created_at
															).toLocaleDateString()}
														</span>
													</div>
												</div>
											)}
										</div>

										{/* Password Change - Right Column */}
										<div className="bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 rounded-xl p-6">
											<h3 className="text-lg font-semibold mb-4 text-white flex items-center">
												<span className="mr-2">🔒</span>
												Change Password
											</h3>
											<form
												onSubmit={handleChangePassword}
												className="space-y-4"
											>
												<div>
													<label className="block text-sm font-medium text-gray-300">
														Current Password
													</label>
													<input
														type="password"
														value={passwordForm.currentPassword}
														onChange={(e) =>
															setPasswordForm({
																...passwordForm,
																currentPassword: e.target.value,
															})
														}
														className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
														required
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-gray-300">
														New Password
													</label>
													<input
														type="password"
														value={passwordForm.newPassword}
														onChange={(e) =>
															setPasswordForm({
																...passwordForm,
																newPassword: e.target.value,
															})
														}
														className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
														required
														minLength={6}
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-gray-300">
														Confirm New Password
													</label>
													<input
														type="password"
														value={passwordForm.confirmPassword}
														onChange={(e) =>
															setPasswordForm({
																...passwordForm,
																confirmPassword: e.target.value,
															})
														}
														className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-orange-500 focus:border-orange-500"
														required
													/>
												</div>
												<button
													type="submit"
													className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 font-medium"
												>
													Change Password
												</button>
											</form>
										</div>
									</div>

									{/* Second Row - Full Width Delete Account */}
									<div className="bg-gray-700/80 backdrop-blur-sm border border-red-500/50 rounded-xl p-6">
										<h3 className="text-lg font-semibold mb-4 text-red-400 flex items-center">
											<span className="mr-2">⚠️</span>
											Danger Zone - Delete Account
										</h3>
										<div className="mb-4 p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
											<p className="text-sm text-red-300 mb-2">
												<strong>Warning:</strong> This action cannot be undone.
												This will permanently delete your account and all
												associated data.
											</p>
											<p className="text-sm text-red-300">
												All your events, transactions, and referral data will be
												permanently removed.
											</p>
										</div>
										<form
											onSubmit={handleDeleteAccount}
											className="grid grid-cols-1 md:grid-cols-3 gap-4"
										>
											<div>
												<label className="block text-sm font-medium text-gray-300">
													Type &quot;delete account&quot; to confirm
												</label>
												<input
													type="text"
													value={deleteForm.confirmationText}
													onChange={(e) =>
														setDeleteForm({
															...deleteForm,
															confirmationText: e.target.value,
														})
													}
													className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-red-500 focus:border-red-500"
													placeholder="delete account"
													required
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-300">
													Confirm with your password
												</label>
												<input
													type="password"
													value={deleteForm.password}
													onChange={(e) =>
														setDeleteForm({
															...deleteForm,
															password: e.target.value,
														})
													}
													className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-red-500 focus:border-red-500"
													required
												/>
											</div>
											<div className="flex items-end">
												<button
													type="submit"
													className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200 font-medium"
												>
													Delete Account Permanently
												</button>
											</div>
										</form>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
