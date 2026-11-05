import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-3',
  }[size];

  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block border-slate-600 border-t-white rounded-full animate-spin ${sizeClasses} ${className}`}
    />
  );
};
