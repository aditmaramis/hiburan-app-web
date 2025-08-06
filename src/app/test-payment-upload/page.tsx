'use client';

import { useState } from 'react';
import PaymentProofUpload from '@/components/booking/payment-proof-upload';

export default function PaymentProofTestPage() {
	const [success, setSuccess] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [bookingId, setBookingId] = useState<number>(1);

	const handleSuccess = () => {
		setSuccess('Payment proof uploaded successfully!');
		setError(null);
	};

	const handleError = (errorMessage: string) => {
		setError(errorMessage);
		setSuccess(null);
	};

	return (
		<div className="container mx-auto p-6 max-w-2xl">
			<h1 className="text-3xl font-bold mb-6">Payment Proof Upload Test</h1>

			{/* Test Mode Toggle */}
			<div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
				<h3 className="font-semibold mb-2">Test Configuration:</h3>
				<div className="space-y-3">
					<div>
						<label
							htmlFor="bookingId"
							className="block text-sm font-medium mb-1"
						>
							Booking ID:
						</label>
						<input
							id="bookingId"
							type="number"
							value={bookingId}
							onChange={(e) => setBookingId(parseInt(e.target.value) || 1)}
							className="border border-gray-300 rounded-md px-3 py-2 w-32"
							min="1"
						/>
					</div>
				</div>
			</div>

			{/* Success Message */}
			{success && (
				<div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
					{success}
				</div>
			)}

			{/* Error Message */}
			{error && (
				<div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
					{error}
				</div>
			)}

			{/* Payment Proof Upload Component */}
			<div className="border border-gray-200 rounded-lg p-6">
				<PaymentProofUpload
					bookingId={bookingId}
					onSuccess={handleSuccess}
					onError={handleError}
				/>
			</div>

			{/* Instructions */}
			<div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
				<h3 className="font-semibold text-blue-900 mb-2">Test Instructions:</h3>
				<ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
					<li>Make sure the backend server is running on localhost:8000</li>
					<li>Change the booking ID above to test different bookings</li>
					<li>Select an image file (JPEG, PNG, or WebP)</li>
					<li>Ensure the file is under 5MB</li>
					<li>Click &quot;Upload Payment Proof&quot; to test the upload</li>
					<li>Check for success/error messages above</li>
				</ol>

				<div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
					<p className="text-green-800 text-sm">
						<strong>Production Mode:</strong> Will connect to the backend server
						at localhost:8000. Make sure your backend server is running.
					</p>
				</div>
			</div>

			{/* Original Component for Comparison */}
			<div className="mt-8 border border-gray-200 rounded-lg p-6">
				<h3 className="font-semibold mb-4">Payment Proof Upload Test:</h3>
				<PaymentProofUpload
					bookingId={bookingId}
					onSuccess={() => handleSuccess()}
					onError={handleError}
				/>
			</div>
		</div>
	);
}
