import React, { useState } from 'react';
import { Booking } from '../../types';
import { api } from '../../services/api';
import { X, Star, AlertCircle, CheckCircle } from 'lucide-react';

interface ReviewModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ booking, isOpen, onClose, onSuccess }) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide comments regarding your service experience.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.createReview({
        bookingId: booking.id,
        rating,
        comment: comment.trim(),
      });

      if (res.success) {
        setIsDone(true);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-zinc-200">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div>
            <h3 className="text-base font-bold text-zinc-900">Rate & Review</h3>
            <p className="text-xs text-zinc-500">{booking.serviceTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isDone ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-zinc-900">Review Submitted!</h4>
              <p className="text-xs text-zinc-600 mt-1">
                Your rating has been recorded and will help other customers find verified professionals.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="text-center py-2">
              <span className="text-xs text-zinc-500 block mb-2">How was your service with {booking.providerName}?</span>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-hidden"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-transparent text-zinc-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-semibold text-zinc-700 mt-1 block">
                {rating === 5
                  ? 'Excellent service'
                  : rating === 4
                  ? 'Very good'
                  : rating === 3
                  ? 'Average'
                  : rating === 2
                  ? 'Below expectations'
                  : 'Poor'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Your Feedback</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                required
                placeholder="Share what went well, punctuality, quality of repair..."
                className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950 transition"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 rounded-lg transition"
              >
                {isSubmitting ? 'Posting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
