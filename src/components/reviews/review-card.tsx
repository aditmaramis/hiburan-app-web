'use client';
import React, { useState } from 'react';
import { StarRating } from '@/components/ui/star-rating';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import axios from 'axios';

export interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string | null;
    email: string;
  };
}

interface ReviewCardProps {
  review: Review;
  currentUserId?: number;
  onReviewUpdated?: () => void;
  onEditClick?: (review: Review) => void;
}

export function ReviewCard({
  review,
  currentUserId,
  onReviewUpdated,
  onEditClick,
}: ReviewCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isOwnReview = currentUserId === review.user.id;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to delete review');
      }

      await axios.delete(`http://localhost:8000/api/reviews/${review.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      onReviewUpdated?.();
    } catch (error: any) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getUserDisplayName = (user: Review['user']) => {
    if (user.name) {
      return user.name;
    }
    // Show first part of email for privacy
    const emailParts = user.email.split('@');
    return `${emailParts[0].substring(0, 3)}***`;
  };

  return (
    <>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {getUserDisplayName(review.user).charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {getUserDisplayName(review.user)}
              </p>
              <p className="text-sm text-gray-500">
                {formatDate(review.created_at)}
                {review.updated_at !== review.created_at && (
                  <span className="ml-1">(edited)</span>
                )}
              </p>
            </div>
          </div>

          {isOwnReview && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEditClick?.(review)}
                className="text-xs"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className="text-xs text-red-600 hover:text-red-700 hover:border-red-300"
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="mb-2">
          <StarRating rating={review.rating} readonly size="sm" showValue />
        </div>

        <p className="text-gray-700 text-sm leading-relaxed">
          {review.comment}
        </p>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
