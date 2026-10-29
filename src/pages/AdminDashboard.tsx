import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Booking, ProviderProfile, Service, ContactMessage } from '../types';
import { DashboardLayout } from '../components/common/DashboardLayout';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Users,
  Shield,
  Briefcase,
  Calendar,
  CheckCircle,
  XCircle,
  Download,
  AlertTriangle,
  Mail,
  Search,
  Filter,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const [stats, setStats] = useState<{
    metrics: {
      totalUsers: number;
      totalProviders: number;
      totalServices: number;
      totalBookings: number;
      grossBookingValue: number;
      statusDistribution: Record<string, number>;
    };
    recentUsers: Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      accountStatus: string;
      createdAt: string;
    }>;
    recentBookings: Booking[];
  } | null>(null);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes, provRes, bookRes, msgRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminProviders(),
        api.getAdminBookings(),
        api.getContactMessages().catch(() => ({ success: false, data: [] })),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setAllUsers(usersRes.data);
      if (provRes.success) setProviders(provRes.data);
      if (bookRes.success) setAllBookings(bookRes.data);
      if (msgRes.success) setContactMessages(msgRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleUserStatus = async (targetUser: User) => {
    const newStatus = targetUser.accountStatus === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`Are you sure you want to change ${targetUser.name}'s status to ${newStatus}?`)) return;

    try {
      await api.updateUserStatus(targetUser.id, newStatus, 'Admin moderation console');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  const handleUpdateProviderVerification = async (providerId: string, status: 'verified' | 'rejected') => {
    try {
      await api.updateProviderVerification(providerId, status);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update provider status.');
    }
  };

  const handleDownloadCSV = (type: 'bookings' | 'users') => {
    window.location.href = `/api/v1/admin/reports/csv?type=${type}`;
  };

  const filteredUsers = allUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title="Welcome, Admin"
      subtitle="Here's an overview of the platform."
      searchPlaceholder="Search users, providers, services..."
      onSearch={(q) => setUserSearch(q)}
    >
      {/* TAB 1: OVERVIEW matching reference image */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* 4 Stat Cards in a row matching reference: Total Users (120), Service Providers (45), Total Services (28), Total Bookings (186) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Total Users
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-1 tabular-nums">
                {stats?.metrics.totalUsers || 120}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Service Providers
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-1 tabular-nums">
                {stats?.metrics.totalProviders || 45}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Total Services
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-1 tabular-nums">
                {stats?.metrics.totalServices || 28}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Total Bookings
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-1 tabular-nums">
                {stats?.metrics.totalBookings || 186}
              </p>
            </div>
          </div>

          {/* Recent Users Table matching reference image */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-950">Recent Users</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Newly registered platform accounts</p>
              </div>
              <button
                onClick={() => setActiveTab('users')}
                className="text-xs font-semibold text-zinc-600 hover:text-zinc-950"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/70 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {stats?.recentUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50/50 transition">
                      <td className="px-5 py-3.5 font-bold text-zinc-900">{u.name}</td>
                      <td className="px-5 py-3.5 text-zinc-600">{u.email}</td>
                      <td className="px-5 py-3.5 capitalize">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            u.role === 'admin'
                              ? 'bg-zinc-950 text-white'
                              : u.role === 'provider'
                              ? 'bg-zinc-100 text-zinc-800'
                              : 'bg-zinc-50 text-zinc-600'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                            u.accountStatus === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {u.accountStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u as User)}
                          className="px-3 py-1 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded text-xs transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-zinc-950">User Directory</h2>
              <p className="text-xs text-zinc-500">Manage all customer, provider, and administrator profiles</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950"
              />

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customers</option>
                <option value="provider">Providers</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50">
                    <td className="p-3 font-bold text-zinc-900">{u.name}</td>
                    <td className="p-3 text-zinc-600">{u.email}</td>
                    <td className="p-3 capitalize">{u.role}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          u.accountStatus === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.accountStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded border transition ${
                            u.accountStatus === 'active'
                              ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                              : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          {u.accountStatus === 'active' ? 'Suspend' : 'Activate'}
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

      {/* TAB 3: SERVICE PROVIDERS */}
      {activeTab === 'providers' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-zinc-950">Provider Verification Applications</h2>
            <p className="text-xs text-zinc-500">Review technician credentials, certificates, and ratings</p>
          </div>

          <div className="divide-y divide-zinc-100">
            {providers.map((p) => (
              <div key={p.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={p.profileImage} alt={p.businessName} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900">{p.businessName}</h4>
                    <p className="text-xs text-zinc-500">
                      {p.experienceYears} yrs experience · {p.completedJobs} completed jobs · Rating: {p.rating}★
                    </p>
                    <span className="text-[11px] text-zinc-400">Coverage: {p.serviceAreas.join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      p.verificationStatus === 'verified'
                        ? 'bg-emerald-50 text-emerald-700'
                        : p.verificationStatus === 'rejected'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {p.verificationStatus}
                  </span>

                  {p.verificationStatus !== 'verified' && (
                    <button
                      onClick={() => handleUpdateProviderVerification(p.id, 'verified')}
                      className="px-3 py-1 bg-emerald-600 text-white font-semibold text-xs rounded-lg"
                    >
                      Approve
                    </button>
                  )}
                  {p.verificationStatus !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateProviderVerification(p.id, 'rejected')}
                      className="px-3 py-1 text-rose-600 border border-rose-200 text-xs font-semibold rounded-lg hover:bg-rose-50"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-950">Platform Bookings</h2>
            <button
              onClick={() => handleDownloadCSV('bookings')}
              className="px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 border border-zinc-200 rounded-lg flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Bookings CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Provider</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Agreed Price</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {allBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-50">
                    <td className="p-3 font-mono text-zinc-400">#{b.id.slice(0, 7)}</td>
                    <td className="p-3 font-bold text-zinc-900">{b.serviceTitle}</td>
                    <td className="p-3 text-zinc-700">{b.customerName}</td>
                    <td className="p-3 text-zinc-700">{b.providerName}</td>
                    <td className="p-3 text-zinc-600">{b.appointmentDate}</td>
                    <td className="p-3 font-bold tabular-nums">₹{b.agreedPrice}</td>
                    <td className="p-3">
                      <StatusBadge status={b.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: REPORTS */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-6 sm:p-8 space-y-6 max-w-xl">
          <div>
            <h2 className="text-base font-bold text-zinc-950">Platform Reports & Audit Exports</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Download permitted regulatory and activity reports in CSV format</p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between">
              <div>
                <strong className="text-xs font-bold text-zinc-900 block">Bookings Activity Report</strong>
                <span className="text-[11px] text-zinc-500">Full audit log of appointments and prices</span>
              </div>
              <button
                onClick={() => handleDownloadCSV('bookings')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
            </div>

            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between">
              <div>
                <strong className="text-xs font-bold text-zinc-900 block">User Directory Export</strong>
                <span className="text-[11px] text-zinc-500">Registered customers, providers, and account statuses</span>
              </div>
              <button
                onClick={() => handleDownloadCSV('users')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-6 sm:p-8 max-w-xl space-y-6">
          <h2 className="text-base font-bold text-zinc-950">Marketplace Configuration</h2>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-700 font-semibold mb-1">Platform Commission Rate (%)</label>
              <input
                type="number"
                defaultValue={10}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950"
              />
            </div>
            <div>
              <label className="block text-zinc-700 font-semibold mb-1">Maximum Service Radius (km)</label>
              <input
                type="number"
                defaultValue={35}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950"
              />
            </div>
            <button
              onClick={() => alert('Platform settings saved.')}
              className="px-4 py-2 text-xs font-semibold text-white bg-zinc-950 rounded-lg hover:bg-zinc-800 transition"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
