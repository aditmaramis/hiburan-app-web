import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

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

interface TransactionListProps {
	transactions: Transaction[];
	onTransactionAction: (
		transactionId: string,
		action: 'accept' | 'reject'
	) => Promise<void>;
}

export default function TransactionList({
	transactions,
	onTransactionAction,
}: TransactionListProps) {
	const [filterStatus, setFilterStatus] = useState<
		'all' | 'pending' | 'accepted' | 'rejected'
	>('all');
	const [selectedProof, setSelectedProof] = useState<string | null>(null);
	const [processingTransactions, setProcessingTransactions] = useState<
		Set<string>
	>(new Set());

	// Filter transactions
	const filteredTransactions = transactions.filter((transaction) => {
		if (filterStatus === 'all') return true;
		return transaction.status === filterStatus;
	});

	// Sort transactions by date (newest first)
	const sortedTransactions = filteredTransactions.sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);

	const handleTransactionAction = async (
		transactionId: string,
		action: 'accept' | 'reject'
	) => {
		setProcessingTransactions((prev) => new Set(prev).add(transactionId));
		try {
			await onTransactionAction(transactionId, action);
		} finally {
			setProcessingTransactions((prev) => {
				const newSet = new Set(prev);
				newSet.delete(transactionId);
				return newSet;
			});
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const getStatusBadge = (status: string) => {
		const styles = {
			pending: 'bg-yellow-100 text-yellow-800',
			accepted: 'bg-green-100 text-green-800',
			rejected: 'bg-red-100 text-red-800',
		};
		return `px-2 py-1 rounded-full text-xs font-medium ${
			styles[status as keyof typeof styles]
		}`;
	};

	const pendingCount = transactions.filter(
		(t) => t.status === 'pending'
	).length;
	const acceptedCount = transactions.filter(
		(t) => t.status === 'accepted'
	).length;
	const rejectedCount = transactions.filter(
		(t) => t.status === 'rejected'
	).length;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h2 className="text-2xl font-bold text-gray-900">
						Transaction Management
					</h2>
					<p className="text-gray-600">
						{transactions.length} total transactions
					</p>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white rounded-lg shadow p-4">
					<div className="text-2xl font-bold text-gray-900">
						{transactions.length}
					</div>
					<div className="text-sm text-gray-600">Total Transactions</div>
				</div>
				<div className="bg-white rounded-lg shadow p-4">
					<div className="text-2xl font-bold text-yellow-600">
						{pendingCount}
					</div>
					<div className="text-sm text-gray-600">Pending Review</div>
				</div>
				<div className="bg-white rounded-lg shadow p-4">
					<div className="text-2xl font-bold text-green-600">
						{acceptedCount}
					</div>
					<div className="text-sm text-gray-600">Accepted</div>
				</div>
				<div className="bg-white rounded-lg shadow p-4">
					<div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
					<div className="text-sm text-gray-600">Rejected</div>
				</div>
			</div>

			{/* Filter */}
			<div className="bg-white rounded-lg shadow p-4">
				<div className="flex flex-wrap gap-2">
					<label className="block text-sm font-medium text-gray-700 mr-4">
						Filter by Status:
					</label>
					{[
						{ value: 'all', label: 'All' },
						{ value: 'pending', label: 'Pending' },
						{ value: 'accepted', label: 'Accepted' },
						{ value: 'rejected', label: 'Rejected' },
					].map((option) => (
						<button
							key={option.value}
							onClick={() =>
								setFilterStatus(
									option.value as 'all' | 'pending' | 'accepted' | 'rejected'
								)
							}
							className={`px-3 py-1 rounded-full text-sm font-medium ${
								filterStatus === option.value
									? 'bg-primary text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}
						>
							{option.label}
						</button>
					))}
				</div>
			</div>

			{/* Transactions List */}
			<div className="bg-white rounded-lg shadow overflow-hidden">
				{sortedTransactions.length > 0 ? (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Customer & Event
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Details
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Payment
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{sortedTransactions.map((transaction) => (
									<tr
										key={transaction.id}
										className="hover:bg-gray-50"
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div>
												<div className="text-sm font-medium text-gray-900">
													{transaction.user.name}
												</div>
												<div className="text-sm text-gray-500">
													{transaction.user.email}
												</div>
												<div className="text-sm text-gray-500 mt-1">
													<strong>{transaction.event.title}</strong>
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-sm text-gray-900">
												<div>Quantity: {transaction.quantity} tickets</div>
												<div>Total: ${transaction.totalPrice}</div>
												{transaction.pointsUsed > 0 && (
													<div className="text-blue-600">
														Points used: {transaction.pointsUsed}
													</div>
												)}
												{transaction.voucherUsed && (
													<div className="text-purple-600">
														Voucher: {transaction.voucherUsed}
													</div>
												)}
												<div className="text-gray-500 text-xs mt-1">
													{formatDate(transaction.createdAt)}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{transaction.paymentProof ? (
												<button
													onClick={() =>
														setSelectedProof(transaction.paymentProof!)
													}
													className="text-primary hover:text-primary-dark underline text-sm"
												>
													View Proof
												</button>
											) : (
												<span className="text-red-500 text-sm">
													No proof uploaded
												</span>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={getStatusBadge(transaction.status)}>
												{transaction.status.charAt(0).toUpperCase() +
													transaction.status.slice(1)}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											{transaction.status === 'pending' && (
												<div className="flex gap-2">
													<Button
														size="sm"
														onClick={() =>
															handleTransactionAction(transaction.id, 'accept')
														}
														disabled={processingTransactions.has(
															transaction.id
														)}
														className="bg-green-600 hover:bg-green-700"
													>
														{processingTransactions.has(transaction.id)
															? 'Processing...'
															: 'Accept'}
													</Button>
													<Button
														size="sm"
														variant="outline"
														onClick={() =>
															handleTransactionAction(transaction.id, 'reject')
														}
														disabled={processingTransactions.has(
															transaction.id
														)}
														className="border-red-300 text-red-700 hover:bg-red-50"
													>
														{processingTransactions.has(transaction.id)
															? 'Processing...'
															: 'Reject'}
													</Button>
												</div>
											)}
											{transaction.status !== 'pending' && (
												<span className="text-gray-500">
													{transaction.status === 'accepted'
														? 'Approved'
														: 'Rejected'}
												</span>
											)}
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
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							No transactions found
						</h3>
						<p className="text-gray-600">
							{filterStatus === 'all'
								? 'No transactions yet'
								: `No ${filterStatus} transactions`}
						</p>
					</div>
				)}
			</div>

			{/* Payment Proof Modal */}
			{selectedProof && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg max-w-2xl max-h-full overflow-auto">
						<div className="p-4 border-b">
							<div className="flex justify-between items-center">
								<h3 className="text-lg font-medium">Payment Proof</h3>
								<button
									onClick={() => setSelectedProof(null)}
									className="text-gray-400 hover:text-gray-600"
								>
									<svg
										className="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>
						</div>
						<div className="p-4">
							<Image
								src={selectedProof}
								alt="Payment proof"
								width={600}
								height={400}
								className="max-w-full h-auto rounded"
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
