import React from 'react';
import { Booking } from '../../types';

interface StatusBadgeProps {
  status: Booking['status'];
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  switch (status) {
    case 'confirmed':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5" />
          Confirmed
        </span>
      );
    case 'pending':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
          Pending
        </span>
      );
    case 'completed':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mr-1.5" />
          Completed
        </span>
      );
    case 'cancelled':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-rose-50 text-rose-800 border border-rose-200/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
          Cancelled
        </span>
      );
    case 'rejected':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-red-50 text-red-800 border border-red-200/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />
          Rejected
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-zinc-100 text-zinc-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};
