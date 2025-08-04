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
		role: '',
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
				role: '',
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
		<div className="flex min-h-screen flex-col md:flex-row">
			{/* Side image for desktop */}
			<div
				className="hidden md:flex md:w-1/2 min-h-screen items-center justify-center"
				style={{ background: '#f3f4f6' }}
			>
				<Image
					src="/jazz.jpg"
					alt="Register visual"
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
							Create your account
						</div>
						<div className="text-muted-foreground text-sm">
							Fill in your details to register
						</div>
					</div>
					{/* Content */}
					<div className="px-0">
						<form
							onSubmit={handleSubmit}
							className="flex flex-col gap-6"
						>
							<div className="grid gap-2">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									type="text"
									placeholder="Your name"
									required
									value={form.name}
									onChange={handleChange}
									disabled={isLoading}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="m@example.com"
									required
									value={form.email}
									onChange={handleChange}
									disabled={isLoading}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="phone">Phone Number</Label>
								<Input
									id="phone"
									type="tel"
									placeholder="08xxxxxxxxxx"
									required
									value={form.phone}
									onChange={handleChange}
									disabled={isLoading}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									required
									value={form.password}
									onChange={handleChange}
									disabled={isLoading}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="referral">Referral Code</Label>
								<Input
									id="referral"
									type="text"
									placeholder="Referral code (optional)"
									value={form.referral}
									onChange={handleChange}
									disabled={isLoading}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="role">Role</Label>
								<select
									id="role"
									className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
									required
									value={form.role}
									onChange={handleChange}
									disabled={isLoading}
								>
									<option value="">Select role</option>
									<option value="customer">Customer</option>
									<option value="organizer">Organizer</option>
								</select>
							</div>
							{error && <div className="text-red-500 text-sm">{error}</div>}
							{success && (
								<div className="text-green-600 text-sm">{success}</div>
							)}

							{/* Submit Button inside form */}
							<Button
								type="submit"
								className="w-full"
								disabled={isLoading}
							>
								{isLoading ? 'Creating Account...' : 'Register'}
							</Button>
						</form>
					</div>
					{/* Footer */}
					<div className="flex flex-col gap-2 px-0">
						<Button
							variant="outline"
							className="w-full"
							disabled={isLoading}
						>
							Register with Google
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
