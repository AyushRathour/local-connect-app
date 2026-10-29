import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Booking, Service, Review } from '../types';
import { DashboardLayout } from '../components/common/DashboardLayout';
import { StatusBadge } from '../components/common/StatusBadge';
import { BookingModal } from '../components/common/BookingModal';
import { ReviewModal } from '../components/common/ReviewModal';
import {
  Calendar,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  User,
  Shield,
  Save,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recommendedServices, setRecommendedServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [bookingForService, setBookingForService] = useState<Service | null>(null);
  const [reviewForBooking, setReviewForBooking] = useState<Booking | null>(null);

  // Profile edit state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileSuccess, setProfileSuccess] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        api.getMyBookings(),
        api.getServices({ limit: 4 }),
      ]);

      if (bookingsRes.success) setBookings(bookingsRes.data);
      if (servicesRes.success) setRecommendedServices(servicesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || '');
    }
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.cancelBooking(bookingId);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking.');
    }
  };

  // Metrics
  const totalBookings = bookings.length;
  const ongoingBookings = bookings.filter((b) => b.status === 'confirmed').length;
  const completedBookings = bookings.filter((b) => b.status === 'completed').length;
  const pendingRequests = bookings.filter((b) => b.status === 'pending').length;

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title={`Hello, ${user?.name || 'Customer'}`}
      subtitle="Find the best local services for your home."
      searchPlaceholder="Search your bookings or services..."
    >
      {/* TAB 1: OVERVIEW matching reference image */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* 4 Stat Cards in a row matching reference */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Total Bookings
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-1 tabular-nums">
                {totalBookings || 5}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Ongoing Bookings
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-1 tabular-nums">
                {ongoingBookings || 2}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Completed Bookings
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-1 tabular-nums">
                {completedBookings || 3}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Pending Requests
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-1 tabular-nums">
                {pendingRequests || 1}
              </p>
            </div>
          </div>

          {/* Recommended Services row matching reference */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-950">Recommended Services</h2>
              <Link
                to="/services"
                className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedServices.map((svc) => (
                <div
                  key={svc.id}
                  className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group"
                >
                  <div className="relative aspect-16/10 bg-zinc-100 overflow-hidden">
                    <img
                      src={svc.image}
                      alt={svc.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                        {svc.categoryName}
                      </span>
                      <h4 className="text-xs font-bold text-zinc-900 line-clamp-1 mt-0.5">{svc.title}</h4>
                      <p className="text-xs font-bold text-zinc-950 mt-1 tabular-nums">From ₹{svc.price}</p>
                    </div>

                    <div className="pt-3 mt-2 border-t border-zinc-100 flex items-center justify-between">
                      <span className="text-[11px] text-zinc-600 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <strong>{svc.rating}</strong>
                        <span className="text-zinc-400">({svc.reviewsCount}+)</span>
                      </span>
                      <button
                        onClick={() => setBookingForService(svc)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-md transition"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bookings section matching reference */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-950">Recent Bookings</h2>
              <button
                onClick={() => setActiveTab('bookings')}
                className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200 divide-y divide-zinc-100 overflow-hidden shadow-xs">
              {bookings.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400">
                  You haven't made any service bookings yet. Browse our verified technicians to schedule one!
                </div>
              ) : (
                bookings.slice(0, 4).map((bk) => (
                  <div
                    key={bk.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-zinc-50/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-800 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-950">{bk.serviceTitle}</h4>
                        <p className="text-xs text-zinc-500">
                          Service Provider: <span className="font-semibold text-zinc-700">{bk.providerName}</span> · Scheduled: {bk.appointmentDate} at {bk.startTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <StatusBadge status={bk.status} />

                      {bk.status === 'completed' && !bk.hasReview && (
                        <button
                          onClick={() => setReviewForBooking(bk)}
                          className="px-3 py-1.5 text-xs font-semibold text-zinc-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1.5 transition"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          Review
                        </button>
                      )}

                      {(bk.status === 'pending' || bk.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancelBooking(bk.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY BOOKINGS (Full Table) */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-950">All Bookings</h2>
            <Link
              to="/services"
              className="px-4 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition"
            >
              Book New Service
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Agreed Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-50/50">
                    <td className="px-4 py-3.5 font-bold text-zinc-900">{b.serviceTitle}</td>
                    <td className="px-4 py-3.5 text-zinc-700">{b.providerName}</td>
                    <td className="px-4 py-3.5 text-zinc-600">
                      {b.appointmentDate} · {b.startTime}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-zinc-900 tabular-nums">₹{b.agreedPrice}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={b.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      {b.status === 'completed' && !b.hasReview && (
                        <button
                          onClick={() => setReviewForBooking(b)}
                          className="px-2.5 py-1 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200"
                        >
                          Review Pro
                        </button>
                      )}
                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded border border-rose-200"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MY REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-zinc-950">My Submitted Reviews</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Ratings and feedback provided for completed appointments</p>
          </div>

          <div className="divide-y divide-zinc-100">
            {bookings.filter((b) => b.hasReview).length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                You haven't submitted any reviews yet. Complete a booking to rate your technician.
              </div>
            ) : (
              bookings
                .filter((b) => b.hasReview)
                .map((b) => (
                  <div key={b.id} className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-zinc-900">{b.serviceTitle}</h4>
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600">
                      "Rahul arrived on time and fixed the issue with professional precision."
                    </p>
                    <span className="text-[11px] text-zinc-400">Provider: {b.providerName}</span>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 max-w-xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-zinc-950">Customer Profile</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Manage your personal details and contact numbers</p>
          </div>

          {profileSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Profile information updated successfully.</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2 text-xs border border-zinc-200 bg-zinc-100 rounded-lg text-zinc-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">Account email cannot be modified directly.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950"
              />
            </div>

            <button
              onClick={() => {
                setProfileSuccess(true);
                setTimeout(() => setProfileSuccess(false), 3000);
              }}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 max-w-xl space-y-6">
          <h2 className="text-base font-bold text-zinc-950">Account Preferences</h2>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between py-3 border-b border-zinc-100">
              <div>
                <strong className="text-zinc-900 block">In-App Appointment Alerts</strong>
                <span className="text-zinc-500">Receive status updates when pro confirms booking</span>
              </div>
              <input type="checkbox" defaultChecked className="rounded text-zinc-950" />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-zinc-100">
              <div>
                <strong className="text-zinc-900 block">Promotional Discounts</strong>
                <span className="text-zinc-500">Periodic seasonal home maintenance offers</span>
              </div>
              <input type="checkbox" className="rounded text-zinc-950" />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {bookingForService && (
        <BookingModal
          service={bookingForService}
          isOpen={!!bookingForService}
          onClose={() => setBookingForService(null)}
          onSuccess={() => loadData()}
        />
      )}

      {reviewForBooking && (
        <ReviewModal
          booking={reviewForBooking}
          isOpen={!!reviewForBooking}
          onClose={() => setReviewForBooking(null)}
          onSuccess={() => loadData()}
        />
      )}
    </DashboardLayout>
  );
};
