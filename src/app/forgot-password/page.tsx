'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setMessage('');
		setIsLoading(true);

		try {
			const response = await api.post('/profile/reset-password-request', {
				email,
			});

			if (response.data.success) {
				setMessage(
					'If an account with this email exists, you will receive password reset instructions shortly.'
				);
				setIsSubmitted(true);
			}
		} catch (error: unknown) {
			// Handle different types of errors
			if (error && typeof error === 'object' && 'response' in error) {
				const axiosError = error as {
					response: { data?: { message?: string } };
				};
				const message =
					axiosError.response.data?.message || 'Password reset request failed';
				setError(message);
			} else if (error && typeof error === 'object' && 'request' in error) {
				setError('Network error. Please check your connection.');
			} else {
				setError('An unexpected error occurred.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleBackToLogin = () => {
		router.push('/login');
	};

	return (
		<div className="flex min-h-screen relative overflow-hidden">
			{/* Full screen background image */}
			<div className="absolute inset-0">
				<Image
					src="/concert.jpg"
					alt="Forgot password background"
					fill
					className="object-cover filter brightness-100"
					priority
				/>
				{/* Minimal dark overlay for maximum image visibility */}
				<div className="absolute inset-0 bg-black/5" />
				{/* Subtle glass overlay for gentle blur */}
				<div className="absolute inset-0 backdrop-blur-sm bg-black/5" />
			</div>

			{/* Very light orange-themed animated background gradient overlay */}
			<div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-orange-900/10 to-amber-900/20 animate-gradient-shift" />

			{/* Floating geometric elements */}
			<div className="absolute top-10 left-10 w-20 h-20 border border-orange-400/30 rounded-full animate-float" />
			<div
				className="absolute top-1/3 right-20 w-16 h-16 border border-amber-400/20 rounded-lg rotate-45 animate-float"
				style={{ animationDelay: '2s' }}
			/>
			<div
				className="absolute bottom-20 left-1/4 w-12 h-12 border border-yellow-400/25 rounded-full animate-float"
				style={{ animationDelay: '4s' }}
			/>

			{/* Centered card with glass morphism */}
			<div className="flex flex-1 items-center justify-center p-6 md:p-12 min-h-screen relative z-30">
				<div className="w-full max-w-sm glass rounded-2xl p-8 md:p-10 flex flex-col gap-8 shadow-2xl shadow-black/50 animate-glow-pulse relative">
					{/* Home Icon */}
					<button
						onClick={() => router.push('/')}
						className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-110 group"
						aria-label="Go to home page"
					>
						<svg
							className="w-5 h-5 text-white/80 group-hover:text-white transition-colors duration-300"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
							/>
						</svg>
					</button>

					{/* Header */}
					<div className="grid auto-rows-min items-start gap-2 px-0">
						<div className="leading-none font-bold text-2xl text-white">
							Reset Password
						</div>
						<div className="text-white/80 text-sm font-medium">
							{isSubmitted
								? 'Check your email for reset instructions'
								: 'Enter your email to receive reset instructions'}
						</div>
					</div>

					{/* Content */}
					<div className="px-0">
						{!isSubmitted ? (
							<form
								onSubmit={handleSubmit}
								className="flex flex-col gap-6"
							>
								<div className="grid gap-2">
									<Label
										htmlFor="email"
										className="text-white font-medium"
									>
										Email Address
									</Label>
									<Input
										id="email"
										type="email"
										placeholder="user@email.com"
										required
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="glass text-white placeholder:text-white/60 border-none focus:border-white/30 focus:ring-0 focus:outline-none focus:ring-white/20 focus-visible:ring-white/20 focus-visible:border-white/30"
									/>
								</div>

								{error && (
									<div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
										{error}
									</div>
								)}

								{message && (
									<div className="text-green-400 text-sm bg-green-500/10 p-3 rounded-lg border border-green-500/20">
										{message}
									</div>
								)}

								{/* Submit Button */}
								<Button
									type="submit"
									className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-black/25 backdrop-blur-sm"
									disabled={isLoading}
								>
									{isLoading ? 'Sending...' : 'Send Reset Link'}
								</Button>
							</form>
						) : (
							<div className="flex flex-col gap-6">
								{/* Success message */}
								<div className="text-green-400 text-sm bg-green-500/10 p-4 rounded-lg border border-green-500/20 text-center">
									<div className="font-medium mb-2">Email Sent!</div>
									<div className="text-white/80">
										If an account with email{' '}
										<span className="text-white font-medium">{email}</span>{' '}
										exists, you will receive password reset instructions within
										a few minutes.
									</div>
								</div>

								{/* Additional instructions */}
								<div className="text-white/60 text-xs text-center space-y-2">
									<p>
										• Check your spam folder if you don&apos;t see the email
									</p>
									<p>• The reset link will expire in 24 hours</p>
									<p>• You can request a new link if needed</p>
								</div>

								{/* Action buttons */}
								<div className="flex flex-col gap-3">
									<Button
										onClick={() => {
											setIsSubmitted(false);
											setEmail('');
											setMessage('');
											setError('');
										}}
										className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-xl transition-all duration-300 backdrop-blur-sm"
									>
										Send Another Email
									</Button>
								</div>
							</div>
						)}

						{/* Back to Login link */}
						<div className="text-center mt-6">
							<span className="text-white/80 text-sm">
								Remember your password?{' '}
								<button
									onClick={handleBackToLogin}
									className="font-bold text-white hover:text-white/90 transition-colors duration-300 underline-offset-4 hover:underline"
								>
									Back to Login
								</button>
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
