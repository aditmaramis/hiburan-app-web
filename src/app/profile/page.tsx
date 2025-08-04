'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from '@/lib/axios';

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
	const [editForm, setEditForm] = useState({ name: '', profile_picture: '' });
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
			const response = await axios.get('/referral/prizes', {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (response.data.success) {
				setPrizes(response.data.data);
			}
		} catch (error) {
			console.error('Error fetching prizes:', error);
		}
	};

	const handleUpdateProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const token = localStorage.getItem('token');
			const response = await axios.put('/profile', editForm, {
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
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-900">
						Profile not found
					</h2>
					<button
						onClick={() => router.push('/auth/login')}
						className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
					>
						Go to Login
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
					<div className="flex items-center space-x-4">
						<div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
							{profile.profile_picture ? (
								<Image
									src={profile.profile_picture}
									alt="Profile"
									width={80}
									height={80}
									className="w-20 h-20 rounded-full object-cover"
								/>
							) : (
								<span className="text-2xl font-bold text-white">
									{profile.name?.charAt(0).toUpperCase()}
								</span>
							)}
						</div>
						<div className="flex-1">
							<h1 className="text-2xl font-bold text-gray-900">
								{profile.name}
							</h1>
							<p className="text-gray-600">{profile.email}</p>
							<p className="text-sm text-gray-500 capitalize">{profile.role}</p>
						</div>
						<div className="flex items-center space-x-4">
							<button
								onClick={handleBackToDashboard}
								className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
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
							<div className="text-right">
								<div className="text-2xl font-bold text-blue-600">
									{profile.statistics.totalPoints.toLocaleString()}
								</div>
								<div className="text-sm text-gray-600">Total Points</div>
							</div>
						</div>
					</div>
				</div>

				{/* Message */}
				{message && (
					<div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
						{message}
					</div>
				)}

				{/* Tabs */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200">
					<div className="border-b border-gray-200">
						<nav className="flex space-x-8 px-6">
							{[
								{ id: 'overview', label: 'Overview' },
								{ id: 'referrals', label: 'Referrals' },
								{ id: 'prizes', label: 'Prizes' },
								{ id: 'coupons', label: 'Coupons' },
								{ id: 'settings', label: 'Settings' },
							].map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`py-4 px-2 border-b-2 font-medium text-sm ${
										activeTab === tab.id
											? 'border-blue-500 text-blue-600'
											: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
									}`}
								>
									{tab.label}
								</button>
							))}
						</nav>
					</div>

					<div className="p-6">
						{/* Overview Tab */}
						{activeTab === 'overview' && (
							<div className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
										<h3 className="text-lg font-semibold">Total Referrals</h3>
										<p className="text-3xl font-bold">
											{profile.statistics.totalReferrals}
										</p>
									</div>
									<div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
										<h3 className="text-lg font-semibold">Available Points</h3>
										<p className="text-3xl font-bold">
											{profile.statistics.totalPoints.toLocaleString()}
										</p>
									</div>
									<div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
										<h3 className="text-lg font-semibold">Active Coupons</h3>
										<p className="text-3xl font-bold">
											{profile.statistics.activeCoupons}
										</p>
									</div>
								</div>

								<div className="bg-gray-50 p-6 rounded-lg">
									<h3 className="text-lg font-semibold mb-4">
										Your Referral Code
									</h3>
									<div className="flex items-center space-x-4">
										<code className="bg-white px-4 py-2 rounded border text-lg font-mono">
											{profile.referral_code}
										</code>
										<button
											onClick={() =>
												navigator.clipboard.writeText(profile.referral_code)
											}
											className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
										>
											Copy
										</button>
									</div>
									<p className="text-sm text-gray-600 mt-2">
										Share this code with friends to earn 10,000 points when they
										register!
									</p>
								</div>
							</div>
						)}

						{/* Referrals Tab */}
						{activeTab === 'referrals' && (
							<div className="space-y-6">
								<h3 className="text-lg font-semibold">Your Referrals</h3>
								{profile.referred_users.length > 0 ? (
									<div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
										<table className="min-w-full divide-y divide-gray-300">
											<thead className="bg-gray-50">
												<tr>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Name
													</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Email
													</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Joined Date
													</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{profile.referred_users.map((user) => (
													<tr key={user.id}>
														<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
															{user.name}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
															{user.email}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
															{new Date(user.created_at).toLocaleDateString()}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								) : (
									<div className="text-center py-12">
										<p className="text-gray-500">
											No referrals yet. Start sharing your referral code!
										</p>
									</div>
								)}

								<div className="bg-blue-50 p-6 rounded-lg">
									<h4 className="font-semibold text-blue-900 mb-2">
										Points History
									</h4>
									{profile.referral_points.length > 0 ? (
										<div className="space-y-2">
											{profile.referral_points.map((point, index) => (
												<div
													key={index}
													className="flex justify-between items-center py-2 border-b border-blue-200 last:border-b-0"
												>
													<span className="text-blue-800">
														+{point.points.toLocaleString()} points
													</span>
													<div className="text-right text-sm">
														<div className="text-blue-600">
															Earned:{' '}
															{new Date(point.earned_at).toLocaleDateString()}
														</div>
														<div className="text-blue-500">
															Expires:{' '}
															{new Date(point.expires_at).toLocaleDateString()}
														</div>
													</div>
												</div>
											))}
										</div>
									) : (
										<p className="text-blue-700">No points earned yet.</p>
									)}
								</div>
							</div>
						)}

						{/* Prizes Tab */}
						{activeTab === 'prizes' && (
							<div className="space-y-6">
								<div className="flex justify-between items-center">
									<h3 className="text-lg font-semibold">Available Prizes</h3>
									<div className="text-sm text-gray-600">
										Your Points:{' '}
										<span className="font-bold text-green-600">
											{profile.statistics.totalPoints.toLocaleString()}
										</span>
									</div>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{prizes.map((prize) => (
										<div
											key={prize.id}
											className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
										>
											<h4 className="font-semibold text-lg mb-2">
												{prize.name}
											</h4>
											<p className="text-gray-600 text-sm mb-4">
												{prize.description}
											</p>
											<div className="flex justify-between items-center mb-4">
												<span className="text-2xl font-bold text-blue-600">
													{prize.points_required.toLocaleString()}
												</span>
												<span className="text-sm text-gray-500">
													Stock: {prize.stock}
												</span>
											</div>
											<button
												onClick={() => handleClaimPrize(prize.id)}
												disabled={
													profile.statistics.totalPoints <
														prize.points_required || prize.stock === 0
												}
												className={`w-full py-2 px-4 rounded font-medium ${
													profile.statistics.totalPoints >=
														prize.points_required && prize.stock > 0
														? 'bg-blue-600 text-white hover:bg-blue-700'
														: 'bg-gray-300 text-gray-500 cursor-not-allowed'
												}`}
											>
												{prize.stock === 0
													? 'Out of Stock'
													: profile.statistics.totalPoints <
													  prize.points_required
													? 'Insufficient Points'
													: 'Claim Prize'}
											</button>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Coupons Tab */}
						{activeTab === 'coupons' && (
							<div className="space-y-6">
								<h3 className="text-lg font-semibold">Your Coupons</h3>
								{profile.coupons.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										{profile.coupons.map((coupon, index) => (
											<div
												key={index}
												className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-lg border border-green-200"
											>
												<div className="flex justify-between items-start mb-4">
													<div>
														<h4 className="font-semibold text-lg">
															{coupon.discount_percent}% Discount
														</h4>
														<p className="text-sm text-gray-600 capitalize">
															Source: {coupon.source}
														</p>
													</div>
													<span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
														Active
													</span>
												</div>
												<div className="bg-white p-3 rounded border-2 border-dashed border-gray-300 mb-4">
													<code className="text-lg font-mono font-bold">
														{coupon.code}
													</code>
												</div>
												<div className="text-sm text-gray-600">
													<div>
														Issued:{' '}
														{new Date(coupon.issued_at).toLocaleDateString()}
													</div>
													<div>
														Expires:{' '}
														{new Date(coupon.expires_at).toLocaleDateString()}
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-12">
										<p className="text-gray-500">
											No active coupons. Get coupons by referring friends!
										</p>
									</div>
								)}
							</div>
						)}

						{/* Settings Tab */}
						{activeTab === 'settings' && (
							<div className="space-y-8">
								{/* Profile Update */}
								<div className="bg-white border border-gray-200 rounded-lg p-6">
									<div className="flex justify-between items-center mb-4">
										<h3 className="text-lg font-semibold">
											Profile Information
										</h3>
										<button
											onClick={() => setEditMode(!editMode)}
											className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
												<label className="block text-sm font-medium text-gray-700">
													Name
												</label>
												<input
													type="text"
													value={editForm.name}
													onChange={(e) =>
														setEditForm({ ...editForm, name: e.target.value })
													}
													className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700">
													Profile Picture URL
												</label>
												<input
													type="url"
													value={editForm.profile_picture}
													onChange={(e) =>
														setEditForm({
															...editForm,
															profile_picture: e.target.value,
														})
													}
													className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
													placeholder="https://example.com/your-photo.jpg"
												/>
											</div>
											<button
												type="submit"
												className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
											>
												Save Changes
											</button>
										</form>
									) : (
										<div className="space-y-2">
											<div>
												<strong>Name:</strong> {profile.name}
											</div>
											<div>
												<strong>Email:</strong> {profile.email}
											</div>
											<div>
												<strong>Role:</strong> {profile.role}
											</div>
											<div>
												<strong>Member since:</strong>{' '}
												{new Date(profile.created_at).toLocaleDateString()}
											</div>
										</div>
									)}
								</div>

								{/* Password Change */}
								<div className="bg-white border border-gray-200 rounded-lg p-6">
									<h3 className="text-lg font-semibold mb-4">
										Change Password
									</h3>
									<form
										onSubmit={handleChangePassword}
										className="space-y-4"
									>
										<div>
											<label className="block text-sm font-medium text-gray-700">
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
												className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700">
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
												className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
												required
												minLength={6}
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700">
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
												className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
												required
											/>
										</div>
										<button
											type="submit"
											className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
										>
											Change Password
										</button>
									</form>
								</div>

								{/* Delete Account */}
								<div className="bg-white border border-red-200 rounded-lg p-6">
									<h3 className="text-lg font-semibold mb-4 text-red-600">
										Danger Zone - Delete Account
									</h3>
									<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
										<p className="text-sm text-red-700 mb-2">
											<strong>Warning:</strong> This action cannot be undone.
											This will permanently delete your account and all
											associated data.
										</p>
										<p className="text-sm text-red-700">
											All your events, transactions, and referral data will be
											permanently removed.
										</p>
									</div>
									<form
										onSubmit={handleDeleteAccount}
										className="space-y-4"
									>
										<div>
											<label className="block text-sm font-medium text-gray-700">
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
												className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
												placeholder="delete account"
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700">
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
												className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
												required
											/>
										</div>
										<button
											type="submit"
											className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
										>
											Delete Account Permanently
										</button>
									</form>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
