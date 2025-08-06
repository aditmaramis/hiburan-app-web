'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PaymentProofUploadProps {
	bookingId: number;
	onSuccess?: () => void;
	onError?: (error: string) => void;
	className?: string;
}

export default function PaymentProofUpload({
	bookingId,
	onSuccess,
	onError,
	className = '',
}: PaymentProofUploadProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>('');
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
		if (!allowedTypes.includes(file.type)) {
			onError?.('Please select a JPEG, PNG, or JPG image file');
			return;
		}

		// Validate file size (5MB max)
		if (file.size > 5 * 1024 * 1024) {
			onError?.('File size must be less than 5MB');
			return;
		}

		setSelectedFile(file);

		// Create preview
		const reader = new FileReader();
		reader.onload = (e) => {
			setPreviewUrl(e.target?.result as string);
		};
		reader.readAsDataURL(file);
	};

	const handleUpload = async () => {
		if (!selectedFile) {
			onError?.('Please select a file first');
			return;
		}

		setIsUploading(true);

		try {
			const formData = new FormData();
			formData.append('payment_proof', selectedFile);

			const response = await fetch(
				`/api/v1/enhanced/bookings/${bookingId}/payment-proof`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
					body: formData,
				}
			);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({
					message: 'Server connection failed',
				}));
				throw new Error(errorData.message || 'Upload failed');
			}

			onSuccess?.();
		} catch (error) {
			console.error('Upload error:', error);

			// Check if it's a connection error
			if (error instanceof TypeError && error.message.includes('fetch')) {
				onError?.(
					'Backend server is not available. Please try again later or contact support.'
				);
			} else {
				onError?.(error instanceof Error ? error.message : 'Upload failed');
			}
		} finally {
			setIsUploading(false);
		}
	};

	const clearSelection = () => {
		setSelectedFile(null);
		setPreviewUrl('');
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	return (
		<div className={`space-y-4 ${className}`}>
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Upload Payment Proof
				</label>
				<Input
					ref={fileInputRef}
					type="file"
					accept="image/jpeg,image/png,image/jpg"
					onChange={handleFileSelect}
					className="w-full"
				/>
				<p className="text-xs text-gray-500 mt-1">
					Supported formats: JPEG, PNG, JPG. Maximum size: 5MB
				</p>
			</div>

			{previewUrl && (
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-gray-700">Preview:</span>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={clearSelection}
						>
							Remove
						</Button>
					</div>
					<div className="border rounded-lg p-2">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={previewUrl}
							alt="Payment proof preview"
							className="max-w-full h-auto max-h-64 rounded"
						/>
					</div>
					<div className="text-xs text-gray-600">
						<strong>File:</strong> {selectedFile?.name} (
						{((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)
					</div>
				</div>
			)}

			<div className="flex gap-2">
				<Button
					onClick={handleUpload}
					disabled={!selectedFile || isUploading}
					className="flex-1"
				>
					{isUploading ? (
						<>
							<span className="animate-spin mr-2">⏳</span>
							Uploading...
						</>
					) : (
						'Upload Payment Proof'
					)}
				</Button>
			</div>

			<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
				<h4 className="font-medium text-blue-900 mb-2">
					Payment Instructions:
				</h4>
				<div className="text-sm text-blue-800 space-y-1">
					<p>1. Make payment to the organizer&apos;s account</p>
					<p>2. Take a clear photo of your payment receipt/confirmation</p>
					<p>3. Upload the photo using the form above</p>
					<p>4. Wait for admin confirmation (usually within 24 hours)</p>
				</div>
			</div>
		</div>
	);
}
