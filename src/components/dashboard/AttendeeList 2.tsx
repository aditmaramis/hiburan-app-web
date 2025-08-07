import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface User {
	id: string;
	name: string;
	email: string;
	role: string;
}

interface Event {
	id: string;
	title: string;
	description: string;
	date: string;
	time: string;
	location: string;
	price: number;
	availableSeats: number;
	totalSeats: number;
	category: string;
	image?: string;
	organizerId: string;
	createdAt: string;
}

interface Transaction {
	id: string;
	eventId: string;
	userId: string;
	quantity: number;
	totalPrice: number;
	status: 'pending' | 'accepted' | 'rejected';
	paymentProof?: string;
	pointsUsed: number;
	voucherUsed?: string;
	createdAt: string;
	event: Event;
	user: User;
}

interface AttendeeListProps {
	events: Event[];
	transactions: Transaction[];
	selectedEventId: string | null;
	onSelectEvent: (eventId: string | null) => void;
}

interface AttendeeData {
	transaction: Transaction;
	attendeeNumber: number;
}

export default function AttendeeList({
	events,
	transactions,
	selectedEventId,
	onSelectEvent,
}: AttendeeListProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [showExportModal, setShowExportModal] = useState(false);

	// Filter transactions for selected event or all events
	const filteredTransactions = useMemo(() => {
		let filtered = transactions;
		if (selectedEventId) {
			filtered = filtered.filter((t) => t.eventId === selectedEventId);
		}
		return filtered;
	}, [transactions, selectedEventId]);

	// Create attendee list with sequential numbering
	const attendees = useMemo(() => {
		const attendeeList: AttendeeData[] = [];
		let attendeeNumber = 1;

		filteredTransactions
			.sort(
				(a, b) =>
					new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			)
			.forEach((transaction) => {
				for (let i = 0; i < transaction.quantity; i++) {
					attendeeList.push({
						transaction,
						attendeeNumber: attendeeNumber++,
					});
				}
			});

		return attendeeList;
	}, [filteredTransactions]);

	// Search functionality
	const searchedAttendees = useMemo(() => {
		if (!searchTerm) return attendees;

		return attendees.filter(
			(attendee) =>
				attendee.transaction.user.name
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				attendee.transaction.user.email
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				attendee.transaction.event.title
					.toLowerCase()
					.includes(searchTerm.toLowerCase())
		);
	}, [attendees, searchTerm]);

	const selectedEvent = selectedEventId
		? events.find((e) => e.id === selectedEventId)
		: null;

	// Calculate statistics
	const stats = useMemo(() => {
		const totalAttendees = attendees.length;
		const uniqueCustomers = new Set(attendees.map((a) => a.transaction.userId))
			.size;
		const totalRevenue = filteredTransactions.reduce(
			(sum, t) => sum + t.totalPrice,
			0
		);
		const averageTicketsPerCustomer =
			uniqueCustomers > 0 ? (totalAttendees / uniqueCustomers).toFixed(1) : '0';

		return {
			totalAttendees,
			uniqueCustomers,
			totalRevenue,
			averageTicketsPerCustomer,
		};
	}, [attendees, filteredTransactions]);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const exportToCSV = () => {
		const headers = [
			'Attendee #',
			'Name',
			'Email',
			'Event',
			'Tickets',
			'Total Paid',
			'Purchase Date',
		];
		const csvData = searchedAttendees.map((attendee) => [
			attendee.attendeeNumber,
			attendee.transaction.user.name,
			attendee.transaction.user.email,
			attendee.transaction.event.title,
			attendee.transaction.quantity,
			`$${attendee.transaction.totalPrice}`,
			formatDate(attendee.transaction.createdAt),
		]);

		const csvContent = [headers, ...csvData]
			.map((row) => row.map((field) => `"${field}"`).join(','))
			.join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute(
			'download',
			`attendees-${selectedEvent ? selectedEvent.title : 'all-events'}-${
				new Date().toISOString().split('T')[0]
			}.csv`
		);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		setShowExportModal(false);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">
						Attendee Management
					</h2>
					<p className="text-gray-600">
						{selectedEvent ? `${selectedEvent.title} - ` : 'All Events - '}
						{stats.totalAttendees} attendees
					</p>
				</div>
				<Button
					onClick={() => setShowExportModal(true)}
					disabled={attendees.length === 0}
				>
					Export List
				</Button>
			</div>

			{/* Event Filter */}
			<div className="bg-white rounded-lg shadow p-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Select Event
						</label>
						<select
							className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
							value={selectedEventId || ''}
							onChange={(e) => onSelectEvent(e.target.value || null)}
						>
							<option value="">All Events</option>
							{events.map((event) => (
								<option
									key={event.id}
									value={event.id}
								>
									{event.title} ({new Date(event.date).toLocaleDateString()})
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Search Attendees
						</label>
						<Input
							type="text"
							placeholder="Search by name, email, or event..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
				</div>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white rounded-lg shadow p-4">
					<div className="text-2xl font-bold text-primary">
						{stats.totalAttendees}
					</div>
					<div className="text-sm text-gray-600">Total Attendees</div>
				</div>
				<div className="bg-white rounded-lg shadow p-4">
					<div className="text-2xl font-bold text-green-600">
						{stats.uniqueCustomers}
					</div>
					<div className="text-sm text-gray-600">Unique Customers</div>
				</div>
				<div className="bg-white rounded-lg shadow p-4">
					<div className="text-2xl font-bold text-blue-600">
						${stats.totalRevenue.toLocaleString()}
					</div>
					<div className="text-sm text-gray-600">Total Revenue</div>
				</div>
				<div className="bg-white rounded-lg shadow p-4">
					<div className="text-2xl font-bold text-purple-600">
						{stats.averageTicketsPerCustomer}
					</div>
					<div className="text-sm text-gray-600">Avg Tickets/Customer</div>
				</div>
			</div>

			{/* Attendees Table */}
			<div className="bg-white rounded-lg shadow overflow-hidden">
				{searchedAttendees.length > 0 ? (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										#
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Attendee
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Event
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Purchase Details
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Purchase Date
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{searchedAttendees.map((attendee, index) => (
									<tr
										key={`${attendee.transaction.id}-${index}`}
										className="hover:bg-gray-50"
									>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											#{attendee.attendeeNumber}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div>
												<div className="text-sm font-medium text-gray-900">
													{attendee.transaction.user.name}
												</div>
												<div className="text-sm text-gray-500">
													{attendee.transaction.user.email}
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-sm text-gray-900">
												{attendee.transaction.event.title}
											</div>
											<div className="text-sm text-gray-500">
												{new Date(
													attendee.transaction.event.date
												).toLocaleDateString()}{' '}
												at {attendee.transaction.event.time}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{attendee.transaction.quantity} ticket
												{attendee.transaction.quantity > 1 ? 's' : ''}
											</div>
											<div className="text-sm text-gray-500">
												Total: ${attendee.transaction.totalPrice}
											</div>
											{attendee.transaction.pointsUsed > 0 && (
												<div className="text-xs text-blue-600">
													{attendee.transaction.pointsUsed} points used
												</div>
											)}
											{attendee.transaction.voucherUsed && (
												<div className="text-xs text-purple-600">
													Voucher: {attendee.transaction.voucherUsed}
												</div>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{formatDate(attendee.transaction.createdAt)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
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
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							No attendees found
						</h3>
						<p className="text-gray-600">
							{searchTerm
								? 'No attendees match your search criteria'
								: selectedEvent
								? `No attendees for ${selectedEvent.title} yet`
								: 'No attendees for any events yet'}
						</p>
					</div>
				)}
			</div>

			{/* Export Modal */}
			{showExportModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg max-w-md w-full">
						<div className="p-6">
							<h3 className="text-lg font-medium text-gray-900 mb-4">
								Export Attendee List
							</h3>
							<p className="text-gray-600 mb-6">
								Export {searchedAttendees.length} attendees
								{selectedEvent
									? ` from ${selectedEvent.title}`
									: ' from all events'}{' '}
								to CSV format?
							</p>
							<div className="flex gap-4">
								<Button
									onClick={exportToCSV}
									className="flex-1"
								>
									Export CSV
								</Button>
								<Button
									variant="outline"
									onClick={() => setShowExportModal(false)}
									className="flex-1"
								>
									Cancel
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
