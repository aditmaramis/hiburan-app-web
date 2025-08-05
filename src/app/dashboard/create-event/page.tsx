'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import ImageUpload from '@/components/ui/image-upload';

interface User {
	id: string;
	name: string;
	email: string;
	role: string;
}

interface EventFormData {
	title: string;
	description: string;
	date: string;
	time: string;
	location: string;
	price: number;
	totalSeats: number;
	category: string;
	image?: string;
}

interface EventFormErrors {
	title?: string;
	description?: string;
	date?: string;
	time?: string;
	location?: string;
	price?: string;
	totalSeats?: string;
	category?: string;
	image?: string;
}

export default function CreateEventPage() {
	const [user, setUser] = useState<User | null>(null);
	const [formData, setFormData] = useState<EventFormData>({
		title: '',
		description: '',
		date: '',
		time: '',
		location: '',
		price: 0,
		totalSeats: 0,
		category: '',
		image: '',
	});
	const [errors, setErrors] = useState<EventFormErrors>({});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const router = useRouter();

	const categories = [
		'Music',
		'Sports',
		'Technology',
		'Art',
		'Food',
		'Education',
		'Business',
		'Entertainment',
		'Health',
		'Other',
	];

	// Check authentication
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
	}, [router]);

	const validateForm = (): boolean => {
		const newErrors: EventFormErrors = {};

		if (!formData.title.trim()) {
			newErrors.title = 'Title is required';
		}

		if (!formData.description.trim()) {
			newErrors.description = 'Description is required';
		}

		if (!formData.date) {
			newErrors.date = 'Date is required';
		} else {
			const eventDate = new Date(formData.date);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			if (eventDate < today) {
				newErrors.date = 'Event date cannot be in the past';
			}
		}

		if (!formData.time) {
			newErrors.time = 'Time is required';
		}

		if (!formData.location.trim()) {
			newErrors.location = 'Location is required';
		}

		if (!formData.category) {
			newErrors.category = 'Category is required';
		}

		if (formData.price < 0) {
			newErrors.price = 'Price cannot be negative';
		}

		if (formData.totalSeats < 1) {
			newErrors.totalSeats = 'Total seats must be at least 1';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]:
				name === 'price' || name === 'totalSeats'
					? parseFloat(value) || 0
					: value,
		}));

		// Clear error for this field when user starts typing
		if (errors[name as keyof EventFormErrors]) {
			setErrors((prev) => ({
				...prev,
				[name]: undefined,
			}));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setSuccess('');

		if (!validateForm()) {
			return;
		}

		setIsLoading(true);

		try {
			// Get token from localStorage
			const token = localStorage.getItem('token');
			if (!token) {
				setError('Authentication required. Please log in again.');
				router.push('/auth/login');
				return;
			}

			// Create event via API
			const response = await axios.post(
				'http://localhost:8000/api/events',
				{
					title: formData.title,
					description: formData.description,
					date: formData.date,
					time: formData.time,
					location: formData.location,
					price: formData.price,
					totalSeats: formData.totalSeats,
					category: formData.category,
					image: formData.image || null,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			console.log('Event created successfully:', response.data);
			setSuccess('Event created successfully!');

			// Reset form
			setFormData({
				title: '',
				description: '',
				date: '',
				time: '',
				location: '',
				price: 0,
				totalSeats: 0,
				category: '',
				image: '',
			});

			// Redirect to dashboard after a short delay
			setTimeout(() => {
				router.push('/dashboard');
			}, 2000);
		} catch (error: unknown) {
			console.error('Error creating event:', error);
			if (error && typeof error === 'object' && 'response' in error) {
				const axiosError = error as {
					response: { data?: { message?: string }; status?: number };
				};
				if (axiosError.response?.status === 401) {
					setError('Authentication failed. Please log in again.');
					router.push('/auth/login');
				} else {
					setError(
						axiosError.response?.data?.message || 'Failed to create event'
					);
				}
			} else {
				setError('Network error. Please check your connection.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		router.push('/dashboard');
	};

	if (!user) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-lg">Loading...</div>
			</div>
		);
	}

	if (error && !user) {
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
								Create New Event
							</h1>
							<p className="text-gray-600">
								Fill in the details to create your event
							</p>
						</div>
						<div className="flex items-center gap-4">
							<Button
								variant="outline"
								onClick={handleCancel}
							>
								Cancel
							</Button>
							<Button
								variant="outline"
								onClick={() => router.push('/')}
							>
								Home
							</Button>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<Card className="p-6">
					<form
						onSubmit={handleSubmit}
						className="space-y-6"
					>
						{/* Success/Error Messages */}
						{success && (
							<div className="bg-green-50 border border-green-200 rounded-md p-4">
								<div className="text-green-800">{success}</div>
							</div>
						)}

						{error && (
							<div className="bg-red-50 border border-red-200 rounded-md p-4">
								<div className="text-red-800">{error}</div>
							</div>
						)}

						{/* Basic Information */}
						<div>
							<h2 className="text-lg font-semibold mb-4">Basic Information</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<Label htmlFor="title">Event Title *</Label>
									<Input
										id="title"
										name="title"
										type="text"
										placeholder="Enter event title"
										value={formData.title}
										onChange={handleInputChange}
										className={errors.title ? 'border-red-500' : ''}
									/>
									{errors.title && (
										<p className="text-red-500 text-sm mt-1">{errors.title}</p>
									)}
								</div>

								<div>
									<Label htmlFor="category">Category *</Label>
									<select
										id="category"
										name="category"
										value={formData.category}
										onChange={handleInputChange}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
											errors.category ? 'border-red-500' : 'border-gray-300'
										}`}
									>
										<option value="">Select a category</option>
										{categories.map((category) => (
											<option
												key={category}
												value={category}
											>
												{category}
											</option>
										))}
									</select>
									{errors.category && (
										<p className="text-red-500 text-sm mt-1">
											{errors.category}
										</p>
									)}
								</div>
							</div>

							<div className="mt-4">
								<Label htmlFor="description">Description *</Label>
								<textarea
									id="description"
									name="description"
									rows={4}
									placeholder="Describe your event..."
									value={formData.description}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
										errors.description ? 'border-red-500' : 'border-gray-300'
									}`}
								/>
								{errors.description && (
									<p className="text-red-500 text-sm mt-1">
										{errors.description}
									</p>
								)}
							</div>
						</div>

						{/* Date and Time */}
						<div>
							<h2 className="text-lg font-semibold mb-4">Date & Time</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<Label htmlFor="date">Event Date *</Label>
									<Input
										id="date"
										name="date"
										type="date"
										value={formData.date}
										onChange={handleInputChange}
										className={errors.date ? 'border-red-500' : ''}
									/>
									{errors.date && (
										<p className="text-red-500 text-sm mt-1">{errors.date}</p>
									)}
								</div>

								<div>
									<Label htmlFor="time">Event Time *</Label>
									<Input
										id="time"
										name="time"
										type="time"
										value={formData.time}
										onChange={handleInputChange}
										className={errors.time ? 'border-red-500' : ''}
									/>
									{errors.time && (
										<p className="text-red-500 text-sm mt-1">{errors.time}</p>
									)}
								</div>
							</div>
						</div>

						{/* Location */}
						<div>
							<h2 className="text-lg font-semibold mb-4">Location</h2>
							<div>
								<Label htmlFor="location">Venue *</Label>
								<Input
									id="location"
									name="location"
									type="text"
									placeholder="Enter venue name and address"
									value={formData.location}
									onChange={handleInputChange}
									className={errors.location ? 'border-red-500' : ''}
								/>
								{errors.location && (
									<p className="text-red-500 text-sm mt-1">{errors.location}</p>
								)}
							</div>
						</div>

						{/* Pricing and Capacity */}
						<div>
							<h2 className="text-lg font-semibold mb-4">Pricing & Capacity</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<Label htmlFor="price">Ticket Price (IDR) *</Label>
									<Input
										id="price"
										name="price"
										type="number"
										min="0"
										step="1000"
										placeholder="0"
										value={formData.price}
										onChange={handleInputChange}
										className={errors.price ? 'border-red-500' : ''}
									/>
									{errors.price && (
										<p className="text-red-500 text-sm mt-1">{errors.price}</p>
									)}
								</div>

								<div>
									<Label htmlFor="totalSeats">Total Seats *</Label>
									<Input
										id="totalSeats"
										name="totalSeats"
										type="number"
										min="1"
										placeholder="100"
										value={formData.totalSeats}
										onChange={handleInputChange}
										className={errors.totalSeats ? 'border-red-500' : ''}
									/>
									{errors.totalSeats && (
										<p className="text-red-500 text-sm mt-1">
											{errors.totalSeats}
										</p>
									)}
								</div>
							</div>
						</div>

						{/* Event Image Upload */}
						<div>
							<ImageUpload
								onImageUploaded={(imageUrl) => {
									setFormData((prev) => ({ ...prev, image: imageUrl }));
								}}
								currentImage={formData.image}
								label="Event Image (Optional)"
								category="events"
								maxSize={5}
							/>
						</div>

						{/* Submit Button */}
						<div className="flex justify-end gap-4 pt-6 border-t">
							<Button
								type="button"
								variant="outline"
								onClick={handleCancel}
								disabled={isLoading}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isLoading}
								className="min-w-[120px]"
							>
								{isLoading ? 'Creating...' : 'Create Event'}
							</Button>
						</div>
					</form>
				</Card>
			</main>
		</div>
	);
}
