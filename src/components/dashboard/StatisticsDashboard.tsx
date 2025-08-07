'use client';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
	PointElement,
	LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Button } from '@/components/ui/button';
import { formatCurrency, type Currency } from '@/utils/currency';

// Register Chart.js components
ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
	PointElement,
	LineElement
);

interface StatisticsData {
	overview: {
		totalEvents: number;
		totalRevenueUSD: number;
		totalRevenueIDR: number;
		totalBookings: number;
		totalAttendees: number;
		pendingTransactions: number;
		pendingRevenue: number;
	};
	monthlyRevenue: { month: string; revenueUSD: number; revenueIDR: number }[];
	eventStats: {
		eventId: number;
		title: string;
		date: string;
		attendees: number;
		revenue: number;
		currency: Currency;
		capacity: number;
		ticketsSold: number;
	}[];
	topEvents: {
		eventId: number;
		title: string;
		date: string;
		attendees: number;
		revenue: number;
		currency: Currency;
		capacity: number;
		ticketsSold: number;
	}[];
	period: {
		days: number;
		startDate: string | null;
		endDate: string | null;
	};
}

interface StatisticsDashboardProps {
	className?: string;
}

export default function StatisticsDashboard({
	className = '',
}: StatisticsDashboardProps) {
	const [data, setData] = useState<StatisticsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [period, setPeriod] = useState('30');

	const fetchStatistics = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const token = localStorage.getItem('token');
			if (!token) {
				throw new Error('No authentication token found');
			}

			const response = await axios.get(
				`http://localhost:8000/api/statistics/organizer?period=${period}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.data?.success) {
				setData(response.data.data);
			} else {
				throw new Error('Failed to fetch statistics');
			}
		} catch (err) {
			console.error('Error fetching statistics:', err);
			setError(
				err instanceof Error ? err.message : 'Failed to load statistics'
			);
		} finally {
			setLoading(false);
		}
	}, [period]);

	useEffect(() => {
		fetchStatistics();
	}, [fetchStatistics]);

	if (loading) {
		return (
			<div className={`${className} animate-pulse`}>
				<div className="space-y-6">
					<div className="h-8 bg-gray-200 rounded w-64"></div>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
						{[...Array(4)].map((_, i) => (
							<div
								key={i}
								className="h-24 bg-gray-200 rounded"
							></div>
						))}
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div className="h-64 bg-gray-200 rounded"></div>
						<div className="h-64 bg-gray-200 rounded"></div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className={`${className} text-center py-12`}>
				<div className="text-red-500 mb-4">
					<svg
						className="mx-auto h-12 w-12"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h3 className="text-lg font-medium text-gray-900 mb-2">
					Error Loading Statistics
				</h3>
				<p className="text-gray-600 mb-4">{error}</p>
				<Button onClick={fetchStatistics}>Try Again</Button>
			</div>
		);
	}

	if (!data) {
		return null;
	}

	// Chart configurations
	const monthlyRevenueChartData = {
		labels: data.monthlyRevenue.map((item) => item.month),
		datasets: [
			{
				label: 'Monthly Revenue (IDR)',
				data: data.monthlyRevenue.map((item) => item.revenueIDR),
				backgroundColor: 'rgba(59, 130, 246, 0.5)',
				borderColor: 'rgb(59, 130, 246)',
				borderWidth: 1,
			},
			{
				label: 'Monthly Revenue (USD)',
				data: data.monthlyRevenue.map((item) => item.revenueUSD),
				backgroundColor: 'rgba(16, 185, 129, 0.5)',
				borderColor: 'rgb(16, 185, 129)',
				borderWidth: 1,
			},
		],
	};

	const chartOptions = {
		responsive: true,
		plugins: {
			legend: {
				position: 'top' as const,
			},
		},
		scales: {
			y: {
				beginAtZero: true,
			},
		},
	};

	const revenueComparisonData = {
		labels: data.eventStats.slice(0, 5).map((event) => event.title),
		datasets: [
			{
				label: 'Revenue by Event',
				data: data.eventStats.slice(0, 5).map((event) => event.revenue),
				backgroundColor: [
					'rgba(239, 68, 68, 0.5)',
					'rgba(245, 158, 11, 0.5)',
					'rgba(34, 197, 94, 0.5)',
					'rgba(59, 130, 246, 0.5)',
					'rgba(147, 51, 234, 0.5)',
				],
				borderColor: [
					'rgb(239, 68, 68)',
					'rgb(245, 158, 11)',
					'rgb(34, 197, 94)',
					'rgb(59, 130, 246)',
					'rgb(147, 51, 234)',
				],
				borderWidth: 1,
			},
		],
	};

	const attendanceData = {
		labels: data.eventStats.slice(0, 6).map((event) => event.title),
		datasets: [
			{
				label: 'Attendees',
				data: data.eventStats.slice(0, 6).map((event) => event.attendees),
				borderColor: 'rgb(75, 192, 192)',
				backgroundColor: 'rgba(75, 192, 192, 0.2)',
				tension: 0.1,
			},
		],
	};

	return (
		<div className={className}>
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
				<div>
					<h1 className="text-2xl font-bold text-orange-400">
						Analytics Dashboard
					</h1>
					<p className="text-white">
						Track your event performance and revenue
					</p>
				</div>
				<div className="flex gap-2 mt-4 sm:mt-0">
					<select
						value={period}
						onChange={(e) => setPeriod(e.target.value)}
						className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="7">Last 7 days</option>
						<option value="30">Last 30 days</option>
						<option value="90">Last 90 days</option>
						<option value="365">Last year</option>
					</select>
					<Button
						className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-all duration-200 border border-gray-600 hover:border-orange-500/50 font-medium"
						variant="outline"
						onClick={fetchStatistics}
					>
						Refresh
					</Button>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				{/* Total Events */}
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="p-2 bg-blue-100 rounded-lg">
							<svg
								className="h-6 w-6 text-blue-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 0v8a2 2 0 002 2h4a2 2 0 002-2v-8m-6 0H6a2 2 0 00-2 2v8a2 2 0 002 2h2m8-10V9a2 2 0 00-2-2h-2m-4 0V3"
								/>
							</svg>
						</div>
						<div className="ml-4">
							<h3 className="text-2xl font-bold text-gray-900">
								{data.overview.totalEvents}
							</h3>
							<div className="text-sm text-gray-600">Total Events</div>
						</div>
					</div>
				</div>

				{/* Total Revenue */}
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="p-2 bg-green-100 rounded-lg">
							<svg
								className="h-6 w-6 text-green-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
								/>
							</svg>
						</div>
						<div className="ml-4">
							<div className="space-y-1">
								{data.overview.totalRevenueIDR > 0 && (
									<h3 className="text-lg font-bold text-gray-900">
										{formatCurrency(data.overview.totalRevenueIDR, 'IDR')}
									</h3>
								)}
								{data.overview.totalRevenueUSD > 0 && (
									<h3 className="text-lg font-bold text-gray-900">
										{formatCurrency(data.overview.totalRevenueUSD, 'USD')}
									</h3>
								)}
							</div>
							<div className="text-sm text-gray-600">Total Revenue</div>
						</div>
					</div>
				</div>

				{/* Total Attendees */}
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="p-2 bg-purple-100 rounded-lg">
							<svg
								className="h-6 w-6 text-purple-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
								/>
							</svg>
						</div>
						<div className="ml-4">
							<h3 className="text-2xl font-bold text-gray-900">
								{data.overview.totalAttendees}
							</h3>
							<div className="text-sm text-gray-600">Total Attendees</div>
						</div>
					</div>
				</div>

				{/* Pending Transactions */}
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="p-2 bg-yellow-100 rounded-lg">
							<svg
								className="h-6 w-6 text-yellow-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div className="ml-4">
							<h3 className="text-2xl font-bold text-gray-900">
								{data.overview.pendingTransactions}
							</h3>
							<div className="text-sm text-gray-600">Pending Transactions</div>
						</div>
					</div>
				</div>
			</div>

			{/* Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
				{/* Monthly Revenue Chart */}
				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h3>
					<Bar
						data={monthlyRevenueChartData}
						options={chartOptions}
					/>
				</div>

				{/* Revenue by Event */}
				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-lg font-semibold mb-4">Revenue by Event</h3>
					<Pie
						data={revenueComparisonData}
						options={{
							responsive: true,
							plugins: {
								legend: {
									position: 'right' as const,
								},
							},
						}}
					/>
				</div>

				{/* Attendance Trend */}
				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-lg font-semibold mb-4">Attendance Trend</h3>
					<Line
						data={attendanceData}
						options={chartOptions}
					/>
				</div>

				{/* Event Performance Table */}
				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-lg font-semibold mb-4">Top Performing Events</h3>
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Event
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Revenue
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Attendees
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{data.eventStats.slice(0, 5).map((event) => (
									<tr key={event.eventId}>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{event.title}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{formatCurrency(event.revenue, event.currency)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{event.attendees}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
