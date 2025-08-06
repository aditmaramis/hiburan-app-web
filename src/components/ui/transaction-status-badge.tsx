import React from 'react';

export type TransactionStatus =
	| 'waiting_for_payment'
	| 'waiting_for_admin_confirmation'
	| 'done'
	| 'rejected'
	| 'expired'
	| 'canceled';

interface TransactionStatusBadgeProps {
	status: TransactionStatus;
	className?: string;
}

const statusConfig = {
	waiting_for_payment: {
		label: 'Waiting for Payment',
		color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
		icon: '⏳',
	},
	waiting_for_admin_confirmation: {
		label: 'Pending Review',
		color: 'bg-blue-100 text-blue-800 border-blue-200',
		icon: '👀',
	},
	done: {
		label: 'Confirmed',
		color: 'bg-green-100 text-green-800 border-green-200',
		icon: '✅',
	},
	rejected: {
		label: 'Rejected',
		color: 'bg-red-100 text-red-800 border-red-200',
		icon: '❌',
	},
	expired: {
		label: 'Expired',
		color: 'bg-gray-100 text-gray-800 border-gray-200',
		icon: '⏰',
	},
	canceled: {
		label: 'Canceled',
		color: 'bg-orange-100 text-orange-800 border-orange-200',
		icon: '🚫',
	},
};

export default function TransactionStatusBadge({
	status,
	className = '',
}: TransactionStatusBadgeProps) {
	const config = statusConfig[status];

	return (
		<span
			className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color} ${className}`}
		>
			<span>{config.icon}</span>
			{config.label}
		</span>
	);
}
