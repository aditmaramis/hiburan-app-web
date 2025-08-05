import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ConfirmDialog from '@/components/ui/confirm-dialog';

interface Event {
	id: number;
	title: string;
	description: string | null;
	date: string;
	time: string;
	location: string;
	price: number;
	available_seats: number;
	total_seats: number;
	category: string;
	image?: string | null;
	organizer_id: number;
	created_at: string;
	updated_at: string;
}

interface EventListProps {
	events: Event[];
	onRefresh: () => Promise<void>;
	onSelectEvent: (eventId: number) => void;
	onEditEvent?: (eventId: number) => void;
	onCancelEvent?: (eventId: number) => void;
	onViewDetails?: (eventId: number) => void;
}

export default function EventList({
	events,
	onRefresh,
	onSelectEvent,
	onEditEvent,
	onCancelEvent,
	onViewDetails,
}: EventListProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [filterCategory, setFilterCategory] = useState('');
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [confirmDialog, setConfirmDialog] = useState<{
		isOpen: boolean;
		eventId: number;
		eventTitle: string;
	}>({
		isOpen: false,
		eventId: 0,
		eventTitle: '',
	});

	// Filter events based on search and category
	const filteredEvents = events.filter((event) => {
		const matchesSearch =
			event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(event.description &&
				event.description.toLowerCase().includes(searchTerm.toLowerCase()));
		const matchesCategory =
			!filterCategory || event.category === filterCategory;
		return matchesSearch && matchesCategory;
	});

	// Get unique categories
	const categories = Array.from(new Set(events.map((event) => event.category)));

	const handleRefresh = async () => {
		setIsRefreshing(true);
		try {
			await onRefresh();
		} finally {
			setIsRefreshing(false);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const getEventStatus = (event: Event) => {
		const eventDate = new Date(event.date);
		const now = new Date();

		if (eventDate < now)
			return { status: 'Past', color: 'bg-gray-100 text-gray-800' };
		if (event.available_seats === 0)
			return { status: 'Sold Out', color: 'bg-red-100 text-red-800' };
		if (eventDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
			return { status: 'Soon', color: 'bg-yellow-100 text-yellow-800' };
		}
		return { status: 'Active', color: 'bg-green-100 text-green-800' };
	};

	const handleCancelClick = (event: Event) => {
		setConfirmDialog({
			isOpen: true,
			eventId: event.id,
			eventTitle: event.title,
		});
	};

	const handleConfirmCancel = async () => {
		if (onCancelEvent) {
			onCancelEvent(confirmDialog.eventId);
		}
		setConfirmDialog({ isOpen: false, eventId: 0, eventTitle: '' });
	};

	const handleCloseDialog = () => {
		setConfirmDialog({ isOpen: false, eventId: 0, eventTitle: '' });
	};
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">My Events</h2>
					<p className="text-gray-600">{events.length} total events</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={handleRefresh}
						disabled={isRefreshing}
					>
						{isRefreshing ? 'Refreshing...' : 'Refresh'}
					</Button>
					<Button
						onClick={() => (window.location.href = '/dashboard/create-event')}
					>
						+ Create Event
					</Button>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white rounded-lg shadow p-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Search Events
						</label>
						<Input
							type="text"
							placeholder="Search by title or description..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Filter by Category
						</label>
						<select
							className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
							value={filterCategory}
							onChange={(e) => setFilterCategory(e.target.value)}
						>
							<option value="">All Categories</option>
							{categories.map((category) => (
								<option
									key={category}
									value={category}
								>
									{category}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Events Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredEvents.map((event) => {
					const eventStatus = getEventStatus(event);
					const occupancyRate =
						((event.total_seats - event.available_seats) / event.total_seats) *
						100;

					return (
						<div
							key={event.id}
							className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
						>
							{/* Event Image */}
							<div className="h-48 bg-gray-200 relative">
								{event.image ? (
									<Image
										src={event.image}
										alt={event.title}
										fill
										className="object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-gray-400">
										No Image
									</div>
								)}
								<div className="absolute top-2 right-2">
									<span
										className={`px-2 py-1 rounded-full text-xs font-medium ${eventStatus.color}`}
									>
										{eventStatus.status}
									</span>
								</div>
							</div>

							{/* Event Details */}
							<div className="p-4">
								<h3 className="font-bold text-lg text-gray-900 mb-2">
									{event.title}
								</h3>
								<p className="text-gray-600 text-sm mb-3 line-clamp-2">
									{event.description}
								</p>

								<div className="space-y-2 text-sm text-gray-600">
									<div className="flex items-center">
										<span className="font-medium">Date:</span>
										<span className="ml-2">
											{formatDate(event.date)} at {event.time}
										</span>
									</div>
									<div className="flex items-center">
										<span className="font-medium">Location:</span>
										<span className="ml-2">{event.location}</span>
									</div>
									<div className="flex items-center">
										<span className="font-medium">Price:</span>
										<span className="ml-2">${event.price}</span>
									</div>
									<div className="flex items-center">
										<span className="font-medium">Seats:</span>
										<span className="ml-2">
											{event.total_seats - event.available_seats}/
											{event.total_seats}({occupancyRate.toFixed(1)}% full)
										</span>
									</div>
								</div>

								{/* Progress Bar */}
								<div className="mt-3">
									<div className="flex justify-between text-xs text-gray-600 mb-1">
										<span>Sold</span>
										<span>
											{event.total_seats - event.available_seats} tickets
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2">
										<div
											className="bg-primary h-2 rounded-full transition-all duration-300"
											style={{ width: `${occupancyRate}%` }}
										></div>
									</div>
								</div>

								{/* Actions */}
								<div className="mt-4 flex gap-2">
									<Button
										variant="outline"
										size="sm"
										className="flex-1"
										onClick={() => onSelectEvent(event.id)}
									>
										Attendees
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => onEditEvent?.(event.id)}
									>
										Edit
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => onViewDetails?.(event.id)}
									>
										Details
									</Button>
									{eventStatus.status !== 'Past' && (
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleCancelClick(event)}
											className="text-red-600 hover:text-red-700 hover:border-red-300"
										>
											Cancel
										</Button>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Empty State */}
			{filteredEvents.length === 0 && (
				<div className="text-center py-12">
					<div className="text-gray-400 mb-4">
						<svg
							className="mx-auto h-24 w-24"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1}
								d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V13a2 2 0 012-2z"
							/>
						</svg>
					</div>
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						{searchTerm || filterCategory ? 'No events found' : 'No events yet'}
					</h3>
					<p className="text-gray-600 mb-4">
						{searchTerm || filterCategory
							? 'Try adjusting your search or filter criteria'
							: 'Create your first event to get started'}
					</p>
					{!searchTerm && !filterCategory && (
						<Button
							onClick={() => (window.location.href = '/dashboard/create-event')}
						>
							Create Your First Event
						</Button>
					)}
				</div>
			)}

			{/* Confirm Dialog */}
			<ConfirmDialog
				isOpen={confirmDialog.isOpen}
				title="Cancel Event"
				message={`Are you sure you want to cancel "${confirmDialog.eventTitle}"? This action cannot be undone and all attendees will be notified.`}
				confirmText="Yes, Cancel Event"
				cancelText="Keep Event"
				onConfirm={handleConfirmCancel}
				onCancel={handleCloseDialog}
				variant="destructive"
			/>
		</div>
	);
}
