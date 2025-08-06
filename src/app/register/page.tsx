'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Removed shadcn/ui Card imports
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
	const [form, setForm] = useState({
		name: '',
		email: '',
		phone: '',
		password: '',
		referral: '',
	});
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		setForm({ ...form, [e.target.id]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setSuccess('');
		setIsLoading(true);

		try {
			await api.post('/auth/register', form);

			// Handle successful registration
			setSuccess('Registration successful! Redirecting to login...');

			// Clear form on success
			setForm({
				name: '',
				email: '',
				phone: '',
				password: '',
				referral: '',
			});

			// Redirect after a short delay
			setTimeout(() => {
				router.push('/login');
			}, 2000);
		} catch (error: unknown) {
			// Handle different types of errors
			if (error && typeof error === 'object' && 'response' in error) {
				// Server responded with error status
				const axiosError = error as {
					response: { data?: { message?: string } };
				};
				const message =
					axiosError.response.data?.message || 'Registration failed';
				setError(message);
			} else if (error && typeof error === 'object' && 'request' in error) {
				// Request was made but no response received
				setError('Network error. Please check your connection.');
			} else {
				// Something else happened
				setError('An unexpected error occurred during registration.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen relative overflow-hidden">
			{/* Full screen background image */}
			<div className="absolute inset-0">
				<Image
					src="/concert.jpg"
					alt="Register background"
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
			<div
				className="absolute top-20 right-1/3 w-14 h-14 border border-orange-300/20 rounded-full animate-float"
				style={{ animationDelay: '1s' }}
			/>

			{/* Centered card with glass morphism */}
			<div className="flex flex-1 items-center justify-center p-6 md:p-12 min-h-screen relative z-30">
				<div className="w-full max-w-md glass rounded-2xl p-8 md:p-10 flex flex-col gap-6 shadow-2xl shadow-black/50 animate-glow-pulse relative">
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
							Create Account
						</div>
						<div className="text-white/80 text-sm font-medium">
							Join us to discover amazing events
						</div>
					</div>
					{/* Content */}
					<div className="px-0">
						<form
							onSubmit={handleSubmit}
							className="flex flex-col gap-4"
						>
							{/* Name and Email in a row for better space usage */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label
										htmlFor="name"
										className="text-white font-medium text-sm"
									>
										Name
									</Label>
									<Input
										id="name"
										type="text"
										placeholder="Your name"
										required
										value={form.name}
										onChange={handleChange}
										disabled={isLoading}
										className="glass text-white placeholder:text-white/60 border-none focus:border-white/30 focus:ring-0 focus:outline-none focus:ring-white/20 focus-visible:ring-white/20 focus-visible:border-white/30"
									/>
								</div>
								<div className="grid gap-2">
									<Label
										htmlFor="email"
										className="text-white font-medium text-sm"
									>
										Email
									</Label>
									<Input
										id="email"
										type="email"
										placeholder="user@email.com"
										required
										value={form.email}
										onChange={handleChange}
										disabled={isLoading}
										className="glass text-white placeholder:text-white/60 border-none focus:border-white/30 focus:ring-0 focus:outline-none focus:ring-white/20 focus-visible:ring-white/20 focus-visible:border-white/30"
									/>
								</div>
							</div>

							{/* Phone */}
							<div className="grid gap-2">
								<Label
									htmlFor="phone"
									className="text-white font-medium text-sm"
								>
									Phone Number
								</Label>
								<Input
									id="phone"
									type="tel"
									placeholder="08xxxxxxxxxx"
									required
									value={form.phone}
									onChange={handleChange}
									disabled={isLoading}
									className="glass text-white placeholder:text-white/60 border-none focus:border-white/30 focus:ring-0 focus:outline-none focus:ring-white/20 focus-visible:ring-white/20 focus-visible:border-white/30"
								/>
							</div>

							{/* Password */}
							<div className="grid gap-2">
								<Label
									htmlFor="password"
									className="text-white font-medium text-sm"
								>
									Password
								</Label>
								<Input
									id="password"
									type="password"
									placeholder="Create a strong password"
									required
									value={form.password}
									onChange={handleChange}
									disabled={isLoading}
									className="glass text-white placeholder:text-white/60 border-none focus:border-white/30 focus:ring-0 focus:outline-none focus:ring-white/20 focus-visible:ring-white/20 focus-visible:border-white/30"
								/>
							</div>

							{/* Referral Code */}
							<div className="grid gap-2">
								<Label
									htmlFor="referral"
									className="text-white font-medium text-sm"
								>
									Referral Code{' '}
									<span className="text-white/60">(optional)</span>
								</Label>
								<Input
									id="referral"
									type="text"
									placeholder="Enter referral code"
									value={form.referral}
									onChange={handleChange}
									disabled={isLoading}
									className="glass text-white placeholder:text-white/60 border-none focus:border-white/30 focus:ring-0 focus:outline-none focus:ring-white/20 focus-visible:ring-white/20 focus-visible:border-white/30"
								/>
							</div>

							{/* Error and Success Messages */}
							{error && (
								<div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
									{error}
								</div>
							)}
							{success && (
								<div className="text-green-400 text-sm bg-green-500/10 p-3 rounded-lg border border-green-500/20">
									{success}
								</div>
							)}

							{/* Submit Button */}
							<Button
								type="submit"
								className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-black/25 backdrop-blur-sm mt-2"
								disabled={isLoading}
							>
								{isLoading ? 'Creating Account...' : 'Create Account'}
							</Button>
						</form>

						{/* Login link */}
						<div className="text-center mt-4">
							<span className="text-white/80 text-sm">
								Already have an account?{' '}
								<button
									type="button"
									onClick={() => router.push('/login')}
									className="font-bold text-white hover:text-white/90 transition-colors duration-300 underline-offset-4 hover:underline"
								>
									Sign In
								</button>
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
