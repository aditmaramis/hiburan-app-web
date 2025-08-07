'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import axios from '@/lib/axios';

function SearchParamsSuspense({
	setToken,
}: {
	setToken: (token: string) => void;
}) {
	const searchParams = useSearchParams();
	useEffect(() => {
		setToken(searchParams.get('token') || '');
	}, [searchParams, setToken]);
	return null;
}

export default function ResetPasswordPage() {
	const [token, setToken] = useState('');
	return (
		<Suspense>
			<SearchParamsSuspense setToken={setToken} />
			<ResetPasswordPageContent token={token} />
		</Suspense>
	);
}

function ResetPasswordPageContent({ token }: { token: string }) {
	const router = useRouter();
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [message, setMessage] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newPassword || !confirmPassword) {
			setMessage('Please fill in all fields.');
			return;
		}
		if (newPassword.length < 6) {
			setMessage('Password must be at least 6 characters.');
			return;
		}
		if (newPassword !== confirmPassword) {
			setMessage('Passwords do not match.');
			return;
		}
		setLoading(true);
		try {
			const response = await axios.post('/profile/reset-password', {
				token,
				newPassword,
			});
			if (response.data.success) {
				setMessage('Password reset successful! Redirecting to login...');
				setTimeout(() => router.push('/login'), 2000);
			} else {
				setMessage(response.data.message || 'Failed to reset password.');
			}
		} catch (err) {
			let errorMsg = 'Failed to reset password. Try again.';
			if (err && typeof err === 'object' && 'response' in err) {
				const axiosError = err as {
					response?: { data?: { message?: string } };
				};
				errorMsg = axiosError.response?.data?.message || errorMsg;
			}
			setMessage(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center relative">
			{/* Full screen background image - fixed positioning */}
			<div className="fixed inset-0 z-0">
				<Image
					src="/concert.jpg"
					alt="Background"
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
			<div className="relative z-10 w-full max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/30 p-8">
				<h1 className="text-3xl font-bold text-center bg-gradient-to-r text-white bg-clip-text text-transparent mb-6">
					Reset Password
				</h1>
				{message && (
					<div className="mb-4 p-3 bg-white/20 border border-orange-400 text-orange-700 rounded-lg text-center backdrop-blur">
						{message}
					</div>
				)}
				<form
					onSubmit={handleSubmit}
					className="space-y-4"
				>
					<div>
						<label className="block text-sm font-medium text-white mb-1">
							New Password
						</label>
						<input
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							className="w-full px-4 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white/20 text-white placeholder:text-white/60 backdrop-blur"
							minLength={6}
							required
							placeholder="Enter new password"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-white mb-1">
							Confirm New Password
						</label>
						<input
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className="w-full px-4 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white/20 text-white placeholder:text-white/60 backdrop-blur"
							required
							placeholder="Confirm new password"
						/>
					</div>
					<button
						type="submit"
						className="w-full py-2 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg"
						disabled={loading}
					>
						{loading ? 'Resetting...' : 'Reset Password'}
					</button>
				</form>
				<div className="mt-6 text-center">
					<button
						type="button"
						className="text-white hover:underline text-sm"
						onClick={() => router.push('/login')}
					>
						Back to Login
					</button>
				</div>
			</div>
		</div>
	);
}
