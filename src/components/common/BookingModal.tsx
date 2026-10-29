import React, { useState } from 'react';
import { Service } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { X, Calendar, Clock, MapPin, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BookingModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ service, isOpen, onClose, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Tomorrow's date formatted as YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState<string>(minDate);
  const [slot, setSlot] = useState<string>('10:00 AM');
  const [address, setAddress] = useState<string>('Flat 402, Sunshine Heights, Vasant Kunj');
  const [city, setCity] = useState<string>('New Delhi');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const timeSlots = ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    if (!date || !slot || !address.trim()) {
      setError('Please select appointment date, time slot, and enter service address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.createBooking({
        serviceId: service.id,
        appointmentDate: date,
        startTime: slot,
        address: address.trim(),
        city: city.trim(),
        notes: notes.trim() || undefined,
      });

      if (res.success && res.data) {
        setSuccessBookingId(res.data.id);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div>
            <h3 className="text-base font-bold text-zinc-900">Book Appointment</h3>
            <p className="text-xs text-zinc-500">{service.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successBookingId ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-zinc-900">Booking Request Placed!</h4>
              <p className="text-xs text-zinc-600 mt-1 max-w-xs mx-auto">
                Your request has been forwarded to <span className="font-semibold">{service.providerName}</span>.
                Scheduled for <span className="font-semibold">{date}</span> at <span className="font-semibold">{slot}</span>.
              </p>
            </div>
            <div className="pt-4 flex gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 rounded-lg transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  navigate('/customer/dashboard');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg flex items-center gap-1.5 transition"
              >
                Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Provider and price bar */}
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-200">
              <div className="flex items-center gap-2.5">
                {service.providerAvatar && (
                  <img
                    src={service.providerAvatar}
                    alt={service.providerName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="text-xs font-semibold text-zinc-900">{service.providerName}</p>
                  <p className="text-[11px] text-zinc-500">Duration: ~{service.durationMinutes} mins</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Standard Price</span>
                <span className="text-base font-bold text-zinc-950 tabular-nums">₹{service.price}</span>
              </div>
            </div>

            {/* Date selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" /> Appointment Date
              </label>
              <input
                type="date"
                min={minDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950 transition"
              />
            </div>

            {/* Slot buttons */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-500" /> Available Time Slot
              </label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSlot(time)}
                    className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition ${
                      slot === time
                        ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" /> Service Location
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / Flat No., Street, Locality"
                required
                className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950 transition"
              />
              <div className="mt-2">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950 transition"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Specific Issue or Instructions</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Describe any particular requirements or access details..."
                className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950 transition"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-zinc-100">
              <span className="text-xs text-zinc-500">Pay on service completion</span>
              <div className="flex items-center gap-2">
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
                  className="px-5 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 rounded-lg transition shadow-xs"
                >
                  {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
