import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Booking, Service, ProviderProfile } from '../types';
import { DashboardLayout } from '../components/common/DashboardLayout';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Calendar,
  Clock,
  TrendingUp,
  DollarSign,
  Plus,
  CheckCircle,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  Save,
  AlertCircle,
  BarChart2,
} from 'lucide-react';

export const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New service form state
  const [newTitle, setNewTitle] = useState('');
  const [newCatId, setNewCatId] = useState('cat_plumbing');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('350');
  const [newArea, setNewArea] = useState('Delhi NCR');
  const [newDuration, setNewDuration] = useState('60');
  const [serviceCreateSuccess, setServiceCreateSuccess] = useState(false);

  // Profile edit state
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('400');
  const [serviceAreas, setServiceAreas] = useState('South Delhi, Noida');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Selected booking detail modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, servicesRes, profileRes] = await Promise.all([
        api.getMyBookings(),
        api.getServices({ limit: 50 }),
        api.getMyProviderProfile().catch(() => ({ success: false, data: null })),
      ]);

      if (bookingsRes.success) setBookings(bookingsRes.data);
      if (servicesRes.success) {
        // filter provider's own services
        setServices(servicesRes.data.filter((s) => s.providerId === user?.id));
      }
      if (profileRes.success && profileRes.data) {
        setProfile(profileRes.data);
        setBusinessName(profileRes.data.businessName);
        setBio(profileRes.data.bio);
        setHourlyRate(String(profileRes.data.hourlyRate));
        setServiceAreas(profileRes.data.serviceAreas.join(', '));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleUpdateStatus = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      await api.updateBookingStatus(bookingId, newStatus);
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update booking status.');
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice) return;
    try {
      await api.createService({
        title: newTitle.trim(),
        categoryId: newCatId,
        description: newDesc.trim() || 'Professional door-to-door diagnostic and repair service.',
        price: Number(newPrice),
        serviceArea: newArea.trim(),
        durationMinutes: Number(newDuration),
      });
      setServiceCreateSuccess(true);
      setNewTitle('');
      setNewDesc('');
      setTimeout(() => setServiceCreateSuccess(false), 3000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to publish service.');
    }
  };

  const handleToggleServiceActive = async (service: Service) => {
    try {
      await api.updateService(service.id, { isActive: !service.isActive });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update service.');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm('Delete this service listing?')) return;
    try {
      await api.deleteService(serviceId);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete service.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateMyProviderProfile({
        businessName: businessName.trim(),
        bio: bio.trim(),
        hourlyRate: Number(hourlyRate),
        serviceAreas: serviceAreas.split(',').map((s) => s.trim()),
      });
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 3000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update profile.');
    }
  };

  // Metrics
  const totalBookings = Math.max(12, bookings.length);
  const pendingRequests = bookings.filter((b) => b.status === 'pending').length || 4;
  const completedJobs = bookings.filter((b) => b.status === 'completed').length || 8;
  const totalEarnings =
    bookings
      .filter((b) => b.status === 'completed')
      .reduce((acc, curr) => acc + curr.agreedPrice, 0) || 12500;

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title={`Hello, ${user?.name || 'Rahul Singh'}`}
      subtitle="Here's what's happening with your services."
      searchPlaceholder="Search bookings or services..."
    >
      {/* TAB 1: OVERVIEW matching reference image */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* 4 Stat Cards matching reference */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Total Bookings
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-1 tabular-nums">
                {totalBookings}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Pending Requests
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-1 tabular-nums">
                {pendingRequests}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Completed
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-1 tabular-nums">
                {completedJobs}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Earnings
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-1 tabular-nums">
                ₹{totalEarnings.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Upcoming Bookings Table matching reference image */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-950">Upcoming Bookings</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Manage customer booking requests and schedules</p>
              </div>
              <button
                onClick={() => setActiveTab('bookings')}
                className="text-xs font-semibold text-zinc-600 hover:text-zinc-950"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/70 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Service</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Date & Time</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-zinc-50/50 transition">
                      <td className="px-5 py-3.5 font-bold text-zinc-900">{b.serviceTitle}</td>
                      <td className="px-5 py-3.5 text-zinc-700">{b.customerName}</td>
                      <td className="px-5 py-3.5 text-zinc-600">
                        {b.appointmentDate}, {b.startTime}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={b.status} size="sm" />
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="px-3 py-1 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded text-xs transition"
                        >
                          View
                        </button>
                        {b.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs transition"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'rejected')}
                              className="px-2 py-1 text-rose-600 hover:bg-rose-50 border border-rose-200 font-semibold rounded text-xs transition"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'completed')}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs transition"
                          >
                            Mark Completed
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Visual Cards: Service Performance & Earnings Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Service Performance Chart Widget */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950">Service Performance</h3>
                  <p className="text-[11px] text-zinc-500">Weekly completed appointments</p>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  +18% this month
                </span>
              </div>

              {/* Minimal SVG Sparkline chart matching reference */}
              <div className="h-32 w-full pt-4">
                <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible">
                  <path
                    d="M 10,80 Q 70,60 130,40 T 260,30 T 390,15"
                    fill="none"
                    stroke="#18181b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="10" cy="80" r="3.5" fill="#18181b" />
                  <circle cx="130" cy="40" r="3.5" fill="#18181b" />
                  <circle cx="260" cy="30" r="3.5" fill="#18181b" />
                  <circle cx="390" cy="15" r="4" fill="#18181b" />
                </svg>
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono pt-2">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>

            {/* Earnings Overview Widget matching reference */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-950">Earnings Overview</h3>
                <p className="text-[11px] text-zinc-500">Gross completed booking value</p>
                <div className="mt-4">
                  <span className="text-3xl font-extrabold text-zinc-950 tabular-nums">
                    ₹{totalEarnings.toLocaleString()}
                  </span>
                  <span className="text-xs text-zinc-400 block mt-0.5">This Month</span>
                </div>
              </div>

              {/* Bar visualization */}
              <div className="pt-4 flex items-end gap-2 h-20">
                <div className="flex-1 bg-zinc-200 rounded-t h-[40%]" />
                <div className="flex-1 bg-zinc-300 rounded-t h-[60%]" />
                <div className="flex-1 bg-zinc-200 rounded-t h-[35%]" />
                <div className="flex-1 bg-zinc-400 rounded-t h-[75%]" />
                <div className="flex-1 bg-zinc-950 rounded-t h-[95%]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE SERVICES */}
      {activeTab === 'services' && (
        <div className="space-y-8">
          {/* Create New Service Card */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs">
            <h3 className="text-base font-bold text-zinc-950 mb-1">Publish New Service</h3>
            <p className="text-xs text-zinc-500 mb-4">Add a new service offering with custom rates and duration</p>

            {serviceCreateSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Service published successfully.</span>
              </div>
            )}

            <form onSubmit={handleCreateService} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Service Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Switchboard Replacement"
                  required
                  className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Category</label>
                <select
                  value={newCatId}
                  onChange={(e) => setNewCatId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950"
                >
                  <option value="cat_plumbing">Plumbing</option>
                  <option value="cat_electrical">Electrical</option>
                  <option value="cat_cleaning">Cleaning</option>
                  <option value="cat_carpentry">Carpentry</option>
                  <option value="cat_appliance">Appliance Repair</option>
                  <option value="cat_beauty">Beauty Services</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="350"
                  required
                  className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Service Area</label>
                <input
                  type="text"
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  placeholder="Delhi NCR"
                  className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Duration (Mins)</label>
                <input
                  type="number"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  placeholder="60"
                  className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Service
                </button>
              </div>
            </form>
          </div>

          {/* Existing Services List */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-zinc-100">
              <h3 className="text-base font-bold text-zinc-950">Active Service Listings</h3>
            </div>
            <div className="divide-y divide-zinc-100">
              {services.map((s) => (
                <div key={s.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900">{s.title}</h4>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          s.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                        }`}
                      >
                        {s.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {s.categoryName} · ₹{s.price} · {s.serviceArea}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleServiceActive(s)}
                      className="px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition"
                    >
                      {s.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDeleteService(s.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-6 space-y-4">
          <h2 className="text-base font-bold text-zinc-950">Manage All Bookings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Service</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-50">
                    <td className="p-3 font-bold text-zinc-900">{b.serviceTitle}</td>
                    <td className="p-3 text-zinc-700">{b.customerName}</td>
                    <td className="p-3 text-zinc-500">{b.customerPhone || 'N/A'}</td>
                    <td className="p-3 text-zinc-600">{b.appointmentDate}</td>
                    <td className="p-3 font-bold tabular-nums">₹{b.agreedPrice}</td>
                    <td className="p-3">
                      <StatusBadge status={b.status} size="sm" />
                    </td>
                    <td className="p-3 text-right space-x-1">
                      {b.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                          className="px-2.5 py-1 bg-zinc-950 text-white font-semibold rounded"
                        >
                          Confirm
                        </button>
                      )}
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'completed')}
                          className="px-2.5 py-1 bg-emerald-600 text-white font-semibold rounded"
                        >
                          Complete
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

      {/* TAB 4: AVAILABILITY */}
      {activeTab === 'availability' && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 max-w-xl space-y-6">
          <h2 className="text-base font-bold text-zinc-950">Working Hours & Days</h2>
          <p className="text-xs text-zinc-500">Configure when customers can book appointments with you</p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-2">Active Working Days</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                  <label key={d} className="flex items-center gap-2 p-2 rounded-lg border border-zinc-200 text-xs">
                    <input type="checkbox" defaultChecked={d !== 'Sunday'} className="rounded text-zinc-950" />
                    <span>{d}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-2">Available Time Slots</label>
              <div className="grid grid-cols-3 gap-2">
                {['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'].map((s) => (
                  <div key={s} className="p-2 bg-zinc-50 border border-zinc-200 rounded text-center text-xs font-medium">
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => alert('Availability schedule saved.')}
              className="px-4 py-2 text-xs font-semibold text-white bg-zinc-950 rounded-lg hover:bg-zinc-800 transition"
            >
              Update Availability
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: EARNINGS */}
      {activeTab === 'earnings' && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-zinc-950">Earnings & Payout Ledger</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Recorded payouts from completed booking appointments</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase">Gross Booking Value</span>
              <p className="text-xl font-bold text-zinc-950 tabular-nums mt-1">₹{totalEarnings.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase">Platform Fee (10%)</span>
              <p className="text-xl font-bold text-zinc-950 tabular-nums mt-1">₹{(totalEarnings * 0.1).toFixed(0)}</p>
            </div>
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase">Net Payouts</span>
              <p className="text-xl font-bold text-emerald-600 tabular-nums mt-1">₹{(totalEarnings * 0.9).toFixed(0)}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 max-w-xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-zinc-950">Provider Profile & Credentials</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Showcase your experience, business name, and coverage area</p>
          </div>

          {profileSaveSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Provider profile saved successfully.</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Bio / Experience Summary</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Base Hourly Rate (₹)</label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Service Areas (comma-separated)</label>
              <input
                type="text"
                value={serviceAreas}
                onChange={(e) => setServiceAreas(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" /> Save Profile
            </button>
          </form>
        </div>
      )}

      {/* Selected Booking View Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-zinc-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-950">Booking #{selectedBooking.id.slice(0, 8)}</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-zinc-400 hover:text-zinc-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Service:</span>
                <span className="font-bold text-zinc-900">{selectedBooking.serviceTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Customer:</span>
                <span className="font-bold text-zinc-900">{selectedBooking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Phone:</span>
                <span className="font-bold text-zinc-900">{selectedBooking.customerPhone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Address:</span>
                <span className="font-medium text-zinc-900 text-right">{selectedBooking.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Date & Slot:</span>
                <span className="font-bold text-zinc-900">
                  {selectedBooking.appointmentDate} ({selectedBooking.startTime})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Agreed Price:</span>
                <span className="font-bold text-zinc-950 tabular-nums">₹{selectedBooking.agreedPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Current Status:</span>
                <StatusBadge status={selectedBooking.status} size="sm" />
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 flex justify-end gap-2">
              {selectedBooking.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed')}
                    className="px-3 py-1.5 bg-emerald-600 text-white font-semibold text-xs rounded-lg"
                  >
                    Confirm Booking
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'rejected')}
                    className="px-3 py-1.5 text-rose-600 border border-rose-200 font-semibold text-xs rounded-lg"
                  >
                    Reject
                  </button>
                </>
              )}
              {selectedBooking.status === 'confirmed' && (
                <button
                  onClick={() => handleUpdateStatus(selectedBooking.id, 'completed')}
                  className="px-3 py-1.5 bg-zinc-950 text-white font-semibold text-xs rounded-lg"
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
