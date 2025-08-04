import { useMemo } from 'react';

interface DashboardData {
	totalEvents: number;
	totalRevenue: number;
	totalAttendees: number;
	pendingTransactions: number;
	monthlyRevenue: { month: string; revenue: number }[];
	eventStats: {
		eventId: string;
		title: string;
		attendees: number;
		revenue: number;
	}[];
}

interface DashboardStatsProps {
	data: DashboardData;
}

export default function DashboardStats({ data }: DashboardStatsProps) {
	// Calculate current month revenue
	const currentMonthRevenue = useMemo(() => {
		const currentMonth = new Date().toLocaleDateString('en-US', {
			month: 'long',
		});
		const monthData = data.monthlyRevenue.find((m) => m.month === currentMonth);
		return monthData?.revenue || 0;
	}, [data.monthlyRevenue]);

	// Get top performing event
	const topEvent = useMemo(() => {
		return data.eventStats.reduce(
			(prev, current) => (prev.revenue > current.revenue ? prev : current),
			data.eventStats[0] || { title: 'No events', revenue: 0, attendees: 0 }
		);
	}, [data.eventStats]);

	const stats = [
		{
			title: 'Total Events',
			value: data.totalEvents,
			subtitle: 'Active events',
			color: 'bg-blue-500',
		},
		{
			title: 'Total Revenue',
			value: `$${data.totalRevenue.toLocaleString()}`,
			subtitle: 'All time earnings',
			color: 'bg-green-500',
		},
		{
			title: 'Total Attendees',
			value: data.totalAttendees,
			subtitle: 'Across all events',
			color: 'bg-purple-500',
		},
		{
			title: 'Pending Transactions',
			value: data.pendingTransactions,
			subtitle: 'Awaiting approval',
			color: 'bg-yellow-500',
		},
	];

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{stats.map((stat, index) => (
					<div
						key={index}
						className="bg-white rounded-lg shadow p-6"
					>
						<div className="flex items-center">
							<div className={`${stat.color} rounded-lg p-3`}>
								<div className="w-6 h-6 bg-white bg-opacity-30 rounded"></div>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">
									{stat.title}
								</p>
								<p className="text-2xl font-semibold text-gray-900">
									{stat.value}
								</p>
								<p className="text-sm text-gray-500">{stat.subtitle}</p>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Revenue Chart & Top Event */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Monthly Revenue Chart */}
				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						Monthly Revenue
					</h3>
					<div className="space-y-3">
						{data.monthlyRevenue.slice(-6).map((month, index) => (
							<div
								key={index}
								className="flex items-center justify-between"
							>
								<span className="text-sm text-gray-600">{month.month}</span>
								<div className="flex items-center">
									<div className="w-32 bg-gray-200 rounded-full h-2">
										<div
											className="bg-primary h-2 rounded-full"
											style={{
												width: `${Math.min(
													(month.revenue /
														Math.max(
															...data.monthlyRevenue.map((m) => m.revenue)
														)) *
														100,
													100
												)}%`,
											}}
										></div>
									</div>
									<span className="ml-3 text-sm font-medium">
										${month.revenue.toLocaleString()}
									</span>
								</div>
							</div>
						))}
					</div>
					<div className="mt-4 p-3 bg-blue-50 rounded-lg">
						<p className="text-sm text-blue-800">
							<span className="font-semibold">This Month:</span> $
							{currentMonthRevenue.toLocaleString()}
						</p>
					</div>
				</div>

				{/* Top Performing Events */}
				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						Top Performing Events
					</h3>
					<div className="space-y-3">
						{data.eventStats.slice(0, 5).map((event, index) => (
							<div
								key={event.eventId}
								className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
							>
								<div>
									<p className="font-medium text-gray-900">{event.title}</p>
									<p className="text-sm text-gray-600">
										{event.attendees} attendees
									</p>
								</div>
								<div className="text-right">
									<p className="font-semibold text-green-600">
										${event.revenue.toLocaleString()}
									</p>
									<p className="text-xs text-gray-500">#{index + 1}</p>
								</div>
							</div>
						))}
						{data.eventStats.length === 0 && (
							<p className="text-gray-500 text-center py-4">
								No events data available
							</p>
						)}
					</div>
					{topEvent && (
						<div className="mt-4 p-3 bg-green-50 rounded-lg">
							<p className="text-sm text-green-800">
								<span className="font-semibold">Best Performer:</span>{' '}
								{topEvent.title}
								(${topEvent.revenue.toLocaleString()})
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Quick Actions */}
			<div className="bg-white rounded-lg shadow p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">
					Quick Actions
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
						<div className="font-medium text-gray-900">Review Transactions</div>
						<div className="text-sm text-gray-600">
							{data.pendingTransactions} pending approvals
						</div>
					</button>
					<button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
						<div className="font-medium text-gray-900">Create New Event</div>
						<div className="text-sm text-gray-600">
							Add a new event to your portfolio
						</div>
					</button>
					<button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
						<div className="font-medium text-gray-900">View Reports</div>
						<div className="text-sm text-gray-600">
							Detailed analytics and insights
						</div>
					</button>
				</div>
			</div>
		</div>
	);
}
