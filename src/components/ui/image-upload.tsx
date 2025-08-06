'use client';
import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';

interface ImageUploadProps {
	onImageUploaded: (imageUrl: string) => void;
	currentImage?: string;
	label?: string;
	category: 'events' | 'profiles';
	maxSize?: number; // in MB
}

export default function ImageUpload({
	onImageUploaded,
	currentImage,
	label = 'Upload Image',
	category,
	maxSize = 5,
}: ImageUploadProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [preview, setPreview] = useState<string | null>(currentImage || null);
	const [dragActive, setDragActive] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		const files = e.dataTransfer.files;
		if (files && files[0]) {
			handleFileUpload(files[0]);
		}
	};

	const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === 'dragenter' || e.type === 'dragover') {
			setDragActive(true);
		} else if (e.type === 'dragleave') {
			setDragActive(false);
		}
	};

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			handleFileUpload(e.target.files[0]);
		}
	};

	const handleFileUpload = async (file: File) => {
		// Validate file type
		if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
			alert('Please select a valid image file (JPEG, PNG, or GIF)');
			return;
		}

		// Validate file size
		const maxSizeBytes = maxSize * 1024 * 1024;
		if (file.size > maxSizeBytes) {
			alert(`File size must be less than ${maxSize}MB`);
			return;
		}

		setIsUploading(true);

		try {
			// Create preview
			const reader = new FileReader();
			reader.onload = () => {
				setPreview(reader.result as string);
			};
			reader.readAsDataURL(file);

			// Upload to server
			const formData = new FormData();
			formData.append('image', file);

			const token = localStorage.getItem('token');
			const response = await axios.post(
				`http://localhost:8000/api/upload/${category}`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.data.status === 'success') {
				const imageUrl = response.data.data.imageUrl; // Cloudinary URL is already complete
				onImageUploaded(imageUrl);
			} else {
				throw new Error(response.data.message || 'Upload failed');
			}
		} catch (error) {
			console.error('Upload error:', error);
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to upload image';
			alert(errorMessage);
			setPreview(currentImage || null);
		} finally {
			setIsUploading(false);
		}
	};

	const clearImage = () => {
		setPreview(null);
		onImageUploaded('');
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	return (
		<div className="space-y-2">
			<Label>{label}</Label>

			{/* Drop Zone */}
			<div
				className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
					${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
					${
						isUploading
							? 'opacity-50 pointer-events-none'
							: 'cursor-pointer hover:border-gray-400'
					}
				`}
				onDrop={handleDrop}
				onDragEnter={handleDrag}
				onDragLeave={handleDrag}
				onDragOver={handleDrag}
				onClick={() => fileInputRef.current?.click()}
			>
				{preview ? (
					<div className="relative">
						<div className="relative w-full h-48 rounded-lg overflow-hidden">
							<Image
								src={preview}
								alt="Preview"
								fill
								className="object-cover"
							/>
						</div>
						<Button
							type="button"
							variant="destructive"
							size="sm"
							className="absolute top-2 right-2"
							onClick={(e) => {
								e.stopPropagation();
								clearImage();
							}}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				) : (
					<div className="space-y-2">
						<div className="mx-auto w-12 h-12 text-gray-400">
							<ImageIcon className="w-full h-full" />
						</div>
						<div>
							<p className="text-sm text-gray-600">
								Drop an image here, or{' '}
								<span className="text-blue-600 underline">browse</span>
							</p>
							<p className="text-xs text-gray-500">
								Supports JPEG, PNG, GIF up to {maxSize}MB
							</p>
						</div>
					</div>
				)}

				{isUploading && (
					<div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
						<div className="flex items-center space-x-2">
							<Upload className="h-4 w-4 animate-spin" />
							<span className="text-sm">Uploading...</span>
						</div>
					</div>
				)}
			</div>

			{/* Hidden file input */}
			<Input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileChange}
				className="hidden"
			/>
		</div>
	);
}
