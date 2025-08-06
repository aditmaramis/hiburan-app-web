'use client';

import { useState } from 'react';

interface StarRatingProps {
  rating?: number;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  readonly?: boolean;
  showValue?: boolean;
}

export default function StarRating({
  rating = 0,
  onRatingChange,
  size = 'md',
  readonly = false,
  showValue = false,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            className={`${sizeClasses[size]} ${
              readonly ? 'cursor-default' : 'cursor-pointer'
            } transition-colors`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
          >
            <svg
              className={`w-full h-full ${
                star <= (hover || rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 ml-1">
          {rating > 0 ? rating.toFixed(1) : 'No ratings'}
        </span>
      )}
    </div>
  );
}

export { StarRating };
