'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
	deadline: string | Date;
	onExpire?: () => void;
	className?: string;
}

interface TimeRemaining {
	hours: number;
	minutes: number;
	seconds: number;
	expired: boolean;
}

export default function CountdownTimer({
	deadline,
	onExpire,
	className = '',
}: CountdownTimerProps) {
	const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
		hours: 0,
		minutes: 0,
		seconds: 0,
		expired: false,
	});

	useEffect(() => {
		const targetTime = new Date(deadline).getTime();

		const updateTimer = () => {
			const now = Date.now();
			const difference = targetTime - now;

			if (difference <= 0) {
				setTimeRemaining({
					hours: 0,
					minutes: 0,
					seconds: 0,
					expired: true,
				});
				onExpire?.();
				return;
			}

			const hours = Math.floor(difference / (1000 * 60 * 60));
			const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((difference % (1000 * 60)) / 1000);

			setTimeRemaining({
				hours,
				minutes,
				seconds,
				expired: false,
			});
		};

		updateTimer(); // Initial call
		const interval = setInterval(updateTimer, 1000);

		return () => clearInterval(interval);
	}, [deadline, onExpire]);

	if (timeRemaining.expired) {
		return (
			<div className={`flex items-center gap-2 text-red-600 ${className}`}>
				<span className="text-lg">⏰</span>
				<span className="font-medium">Expired</span>
			</div>
		);
	}

	const isUrgent = timeRemaining.hours === 0 && timeRemaining.minutes < 30;

	return (
		<div
			className={`flex items-center gap-2 ${
				isUrgent ? 'text-red-600' : 'text-orange-600'
			} ${className}`}
		>
			<span className="text-lg">⏰</span>
			<div className="font-mono text-sm">
				{timeRemaining.hours.toString().padStart(2, '0')}:
				{timeRemaining.minutes.toString().padStart(2, '0')}:
				{timeRemaining.seconds.toString().padStart(2, '0')}
			</div>
			<span className="text-xs font-medium">
				{isUrgent ? 'URGENT' : 'remaining'}
			</span>
		</div>
	);
}
