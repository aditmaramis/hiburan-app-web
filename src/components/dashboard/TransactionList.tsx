'use client';
import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface Transaction {
	id: number;
	booking_id: number;
	amount: string; // Prisma returns Decimal as string
	payment_method: string;
	payment_date: string;
	status: string;
	payment_proof?: string;
	created_at: string;
	updated_at: string;
	bookings: {
		id: number;
		quantity: number;
		total_price: string; // Prisma returns Decimal as string
		booking_date: string;
		status: string;
		users: {
			id: number;
			name: string;
			email: string;
		};
		events: {
			id: number;
			title: string;
			price: string; // Prisma returns Decimal as string
			date: string;
			time: string;
			location: string;
		};
	};
}

interface TransactionListProps {
	onRefresh: () => void;
}

export default function TransactionList({ onRefresh }: TransactionListProps) {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [selectedTransaction, setSelectedTransaction] =
		useState<Transaction | null>(null);
	const [showImageModal, setShowImageModal] = useState(false);

	const fetchTransactions = async () => {
		try {
			setIsLoading(true);
			const token = localStorage.getItem('token');

			const response = await axios.get(
				'http://localhost:8000/api/transactions',
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			setTransactions(response.data.transactions || []);
		} catch (error: unknown) {
			console.error('Error fetching transactions:', error);
			setError(
				(error as AxiosError<{ message: string }>)?.response?.data?.message ||
					'Failed to fetch transactions'
			);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchTransactions();
	}, []);

	const handleStatusUpdate = async (
		transactionId: number,
		status: 'accepted' | 'rejected'
	) => {
		try {
			const token = localStorage.getItem('token');

			await axios.put(
				`http://localhost:8000/api/transactions/${transactionId}/status`,
				{ status },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			setSuccessMessage(`Transaction ${status} successfully!`);
			fetchTransactions(); // Refresh the list
			onRefresh(); // Refresh dashboard stats

			// Clear success message after 3 seconds
			setTimeout(() => setSuccessMessage(''), 3000);
		} catch (error: unknown) {
			console.error('Error updating transaction:', error);
			setError(
				(error as AxiosError<{ message: string }>)?.response?.data?.message ||
					'Failed to update transaction'
			);

			// Clear error message after 5 seconds
			setTimeout(() => setError(''), 5000);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'pending':
				return 'text-yellow-600 bg-yellow-100';
			case 'waiting_for_admin_confirmation':
				return 'text-blue-600 bg-blue-100';
			case 'accepted':
			case 'confirmed':
				return 'text-green-600 bg-green-100';
			case 'rejected':
				return 'text-red-600 bg-red-100';
			default:
				return 'text-gray-600 bg-gray-100';
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-lg">Loading transactions...</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Success/Error Messages */}
			{successMessage && (
				<div className="bg-green-50 border border-green-200 rounded-md p-4">
					<div className="text-green-800">{successMessage}</div>
				</div>
			)}

			{error && (
				<div className="bg-red-50 border border-red-200 rounded-md p-4">
					<div className="text-red-800">{error}</div>
				</div>
			)}

			{transactions.length === 0 ? (
				<div className="text-center py-8">
					<div className="text-gray-500 text-lg mb-2">
						No transactions found
					</div>
					<p className="text-gray-400">
						Transactions from event bookings will appear here
					</p>
				</div>
			) : (
				<div className="grid gap-4">
					{transactions.map((transaction) => (
						<Card
							key={transaction.id}
							className="p-6"
						>
							<div className="flex justify-between items-start mb-4">
								<div>
									<h3 className="text-lg font-semibold">
										{transaction.bookings?.events?.title ||
											'Event Title Unavailable'}
									</h3>
									<p className="text-gray-600">Transaction #{transaction.id}</p>
								</div>
								<span
									className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
										transaction.status
									)}`}
								>
									{transaction.status === 'waiting_for_admin_confirmation'
										? 'Waiting for Admin Confirmation'
										: transaction.status.charAt(0).toUpperCase() +
										  transaction.status.slice(1)}
								</span>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
								<div>
									<h4 className="font-medium text-gray-900 mb-2">
										Customer Details
									</h4>
									<p className="text-sm text-gray-600">
										<strong>Name:</strong>{' '}
										{transaction.bookings?.users?.name || 'N/A'}
									</p>
									<p className="text-sm text-gray-600">
										<strong>Email:</strong>{' '}
										{transaction.bookings?.users?.email || 'N/A'}
									</p>
									<p className="text-sm text-gray-600">
										<strong>Quantity:</strong>{' '}
										{transaction.bookings?.quantity || 0} ticket(s)
									</p>
								</div>

								<div>
									<h4 className="font-medium text-gray-900 mb-2">
										Payment Details
									</h4>
									<p className="text-sm text-gray-600">
										<strong>Amount:</strong>{' '}
										{formatCurrency(Number(transaction.amount))}
									</p>
									<p className="text-sm text-gray-600">
										<strong>Method:</strong> {transaction.payment_method}
									</p>
									<p className="text-sm text-gray-600">
										<strong>Date:</strong>{' '}
										{formatDate(transaction.payment_date)}
									</p>
								</div>
							</div>

							<div className="mb-4">
								<h4 className="font-medium text-gray-900 mb-2">
									Event Details
								</h4>
								<p className="text-sm text-gray-600">
									<strong>Date:</strong>{' '}
									{transaction.bookings?.events?.date
										? formatDate(transaction.bookings.events.date)
										: 'Date TBA'}
								</p>
								<p className="text-sm text-gray-600">
									<strong>Time:</strong>{' '}
									{transaction.bookings?.events?.time || 'Time TBA'}
								</p>
								<p className="text-sm text-gray-600">
									<strong>Location:</strong>{' '}
									{transaction.bookings?.events?.location || 'Location TBA'}
								</p>
							</div>

							{transaction.payment_proof && (
								<div className="mb-4">
									<h4 className="font-medium text-gray-900 mb-2">
										Payment Proof
									</h4>
									<div
										className="relative w-48 h-32 cursor-pointer"
										onClick={() => {
											setSelectedTransaction(transaction);
											setShowImageModal(true);
										}}
									>
										<Image
											src={(() => {
												let url;
												if (transaction.payment_proof?.startsWith('http')) {
													// Already absolute URL
													url = transaction.payment_proof;
												} else if (
													transaction.payment_proof?.startsWith('/uploads/')
												) {
													// New format: /uploads/payment-proofs/filename
													url = `http://localhost:8000${transaction.payment_proof}`;
												} else {
													// Old format: just filename
													url = `http://localhost:8000/uploads/payment-proofs/${transaction.payment_proof}`;
												}
												console.log(
													'Payment proof value:',
													transaction.payment_proof
												);
												console.log('Constructed URL:', url);
												return url;
											})()}
											alt="Payment Proof"
											fill
											className="object-cover rounded-lg border"
										/>
									</div>
									<p className="text-xs text-gray-500 mt-1">
										Click to view full size
									</p>
								</div>
							)}

							{(transaction.status === 'pending' ||
								transaction.status === 'waiting_for_admin_confirmation') && (
								<div className="flex gap-2 pt-4 border-t">
									<Button
										onClick={() =>
											handleStatusUpdate(transaction.id, 'accepted')
										}
										className="bg-green-600 hover:bg-green-700"
									>
										Accept
									</Button>
									<Button
										onClick={() =>
											handleStatusUpdate(transaction.id, 'rejected')
										}
										variant="outline"
										className="text-red-600 border-red-300 hover:bg-red-50"
									>
										Reject
									</Button>
								</div>
							)}
						</Card>
					))}
				</div>
			)}

			{/* Image Modal */}
			{showImageModal && selectedTransaction?.payment_proof && (
				<div
					className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
					onClick={() => setShowImageModal(false)}
				>
					<div className="max-w-4xl max-h-[90vh] relative">
						<button
							onClick={() => setShowImageModal(false)}
							className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75"
						>
							×
						</button>
						<Image
							src={(() => {
								let url;
								if (selectedTransaction.payment_proof?.startsWith('http')) {
									// Already absolute URL
									url = selectedTransaction.payment_proof;
								} else if (
									selectedTransaction.payment_proof?.startsWith('/uploads/')
								) {
									// New format: /uploads/payment-proofs/filename
									url = `http://localhost:8000${selectedTransaction.payment_proof}`;
								} else {
									// Old format: just filename
									url = `http://localhost:8000/uploads/payment-proofs/${selectedTransaction.payment_proof}`;
								}
								return url;
							})()}
							alt="Payment Proof"
							width={800}
							height={600}
							className="object-contain rounded-lg"
						/>
					</div>
				</div>
			)}
		</div>
	);
}
