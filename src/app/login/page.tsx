'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setIsLoading(true);

		try {
			const response = await api.post('/auth/login', {
				email,
				password,
			});

			const { token, user } = response.data;

			if (token) {
				// Store token in localStorage (consider httpOnly cookies for production)
				localStorage.setItem('token', token);

				// Store user info if available
				if (user) {
					localStorage.setItem('user', JSON.stringify(user));
				}

				// Set default authorization header for future requests
				api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

				// Redirect based on user role
				if (user.role === 'organizer') {
					router.push('/dashboard');
				} else if (user.role === 'customer') {
					router.push('/customer-dashboard');
				} else {
					router.push('/profile'); // fallback
				}
			} else {
				setError('Authentication failed. No token received.');
			}
		} catch (error: unknown) {
			// Handle different types of errors
			if (error && typeof error === 'object' && 'response' in error) {
				// Server responded with error status
				const axiosError = error as {
					response: { data?: { message?: string } };
				};
				const message = axiosError.response.data?.message || 'Login failed';
				setError(message);
			} else if (error && typeof error === 'object' && 'request' in error) {
				// Request was made but no response received
				setError('Network error. Please check your connection.');
			} else {
				// Something else happened
				setError('An unexpected error occurred.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen flex-col md:flex-row">
			{/* Side image for desktop */}
			<div
				className="hidden md:flex md:w-1/2 min-h-screen items-center justify-center"
				style={{ background: '#f3f4f6' }}
			>
				<Image
					src="/jazz.jpg"
					alt="Login visual"
					fill={false}
					width={600}
					height={800}
					className="object-cover w-full h-full max-h-screen rounded-none"
					style={{ minHeight: 400 }}
					priority
				/>
			</div>
			{/* Centered card (custom, not shadcn) */}
			<div className="flex flex-1 items-center justify-center p-6 md:p-12 min-h-screen">
				<div className="w-full max-w-sm bg-white rounded-xl p-6 md:p-8 flex flex-col gap-6">
					{/* Header */}
					<div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-0">
						<div className="leading-none font-semibold text-xl">
							Login to your account
						</div>
						<div className="text-muted-foreground text-sm">
							Enter your email below to login to your account
						</div>
						<div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
							<Button variant="link">Sign Up</Button>
						</div>
					</div>
					{/* Content */}
					<div className="px-0">
						<form
							onSubmit={handleSubmit}
							className="flex flex-col gap-6"
						>
							<div className="grid gap-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="m@example.com"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>
							<div className="grid gap-2">
								<div className="flex items-center w-full justify-between">
									<Label htmlFor="password">Password</Label>
									<a
										href="#"
										className="inline-block text-sm underline-offset-4 hover:underline"
									>
										Forgot your password?
									</a>
								</div>
								<Input
									id="password"
									type="password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
							</div>
							{error && <div className="text-red-500 text-sm">{error}</div>}

							{/* Submit Button inside form */}
							<Button
								type="submit"
								className="w-full"
								disabled={isLoading}
							>
								{isLoading ? 'Logging in...' : 'Login'}
							</Button>
						</form>
					</div>
					{/* Footer */}
					<div className="flex flex-col gap-2 px-0">
						<Button
							variant="outline"
							className="w-full"
						>
							Login with Google
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
