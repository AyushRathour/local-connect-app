import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from './BrandLogo';
import {
  LayoutDashboard,
  CalendarCheck,
  Star,
  User as UserIcon,
  Settings,
  LogOut,
  Briefcase,
  Clock,
  TrendingUp,
  Users,
  Shield,
  FileText,
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  CheckCircle,
} from 'lucide-react';

interface SidebarItem {
  label: string;
  id: string;
  icon: React.ElementType;
}

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
}

import { ReactNode } from 'react';

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  title,
  subtitle,
  searchPlaceholder = 'Search...',
  onSearch,
}) => {
  const { user, logout, switchDemoRole, notifications, unreadCount, markAsRead, markAllAsRead } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  // Define sidebar menu items based on role
  let navItems: SidebarItem[] = [];

  if (user?.role === 'admin') {
    navItems = [
      { label: 'Dashboard', id: 'overview', icon: LayoutDashboard },
      { label: 'Users', id: 'users', icon: Users },
      { label: 'Service Providers', id: 'providers', icon: Shield },
      { label: 'Services', id: 'services', icon: Briefcase },
      { label: 'Bookings', id: 'bookings', icon: CalendarCheck },
      { label: 'Reports', id: 'reports', icon: FileText },
      { label: 'Settings', id: 'settings', icon: Settings },
    ];
  } else if (user?.role === 'provider') {
    navItems = [
      { label: 'Dashboard', id: 'overview', icon: LayoutDashboard },
      { label: 'Manage Services', id: 'services', icon: Briefcase },
      { label: 'Bookings', id: 'bookings', icon: CalendarCheck },
      { label: 'Availability', id: 'availability', icon: Clock },
      { label: 'Earnings', id: 'earnings', icon: TrendingUp },
      { label: 'Profile', id: 'profile', icon: UserIcon },
      { label: 'Settings', id: 'settings', icon: Settings },
    ];
  } else {
    // Customer
    navItems = [
      { label: 'Dashboard', id: 'overview', icon: LayoutDashboard },
      { label: 'My Bookings', id: 'bookings', icon: CalendarCheck },
      { label: 'My Reviews', id: 'reviews', icon: Star },
      { label: 'Profile', id: 'profile', icon: UserIcon },
      { label: 'Settings', id: 'settings', icon: Settings },
    ];
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchVal);
  };

  const handleRoleSwitch = async (role: 'customer' | 'provider' | 'admin') => {
    await switchDemoRole(role);
    setProfileDropdownOpen(false);
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'provider') navigate('/provider/dashboard');
    else navigate('/customer/dashboard');
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/60 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Dark Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 text-zinc-300 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <BrandLogo darkTheme linkTo="/" />
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-800/90 text-white shadow-xs font-semibold'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-zinc-800/80 space-y-2">
          <Link
            to="/services"
            className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl transition"
          >
            <Search className="w-4 h-4 text-zinc-400" />
            <span>Public Marketplace</span>
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-zinc-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-zinc-600 hover:text-zinc-950 rounded-lg hover:bg-zinc-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Header search bar */}
            <form onSubmit={handleSearchSubmit} className="relative w-full hidden sm:block">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => {
                  setSearchVal(e.target.value);
                  if (onSearch) onSearch(e.target.value);
                }}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-zinc-100/80 border border-transparent hover:border-zinc-300 focus:border-zinc-950 focus:bg-white rounded-full transition focus:outline-hidden"
              />
            </form>
          </div>

          {/* Right actions: Notifications + Profile */}
          <div className="flex items-center gap-4">
            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setNotifPopoverOpen(!notifPopoverOpen)}
                className="p-2 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-full relative transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-zinc-950 ring-2 ring-white" />
                )}
              </button>

              {notifPopoverOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-zinc-200 rounded-2xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-zinc-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] text-zinc-500 hover:text-zinc-950 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-zinc-50">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-zinc-400">No notifications yet.</div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`p-3 text-xs cursor-pointer hover:bg-zinc-50 transition ${
                            !n.isRead ? 'bg-zinc-50/80 font-medium' : 'text-zinc-600'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-zinc-900">{n.title}</span>
                            {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
                          </div>
                          <p className="text-[11px] text-zinc-600 line-clamp-2">{n.message}</p>
                          <span className="text-[10px] text-zinc-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu with Quick Role Switch */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 rounded-full border border-zinc-200 transition"
              >
                <div className="w-7 h-7 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-[11px]">
                  {userInitials}
                </div>
                <span className="font-semibold hidden sm:inline">{user?.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-xl shadow-xl py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-zinc-100">
                    <p className="text-xs font-bold text-zinc-900">{user?.name}</p>
                    <p className="text-[11px] text-zinc-500 capitalize">{user?.role} Account</p>
                  </div>

                  <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Quick Role Switch (Demo)
                  </div>
                  <button
                    onClick={() => handleRoleSwitch('customer')}
                    className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between hover:bg-zinc-50 ${
                      user?.role === 'customer' ? 'font-semibold text-zinc-950' : 'text-zinc-600'
                    }`}
                  >
                    <span>John Doe (Customer)</span>
                    {user?.role === 'customer' && <CheckCircle className="w-3.5 h-3.5 text-zinc-950" />}
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('provider')}
                    className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between hover:bg-zinc-50 ${
                      user?.role === 'provider' ? 'font-semibold text-zinc-950' : 'text-zinc-600'
                    }`}
                  >
                    <span>Rahul Singh (Provider)</span>
                    {user?.role === 'provider' && <CheckCircle className="w-3.5 h-3.5 text-zinc-950" />}
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('admin')}
                    className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between hover:bg-zinc-50 ${
                      user?.role === 'admin' ? 'font-semibold text-zinc-950' : 'text-zinc-600'
                    }`}
                  >
                    <span>Platform Admin</span>
                    {user?.role === 'admin' && <CheckCircle className="w-3.5 h-3.5 text-zinc-950" />}
                  </button>

                  <div className="border-t border-zinc-100 my-1" />

                  <Link
                    to="/"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="w-full text-left px-3.5 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 block"
                  >
                    Return to Homepage
                  </Link>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full text-left px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Title Header */}
        <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-zinc-500 mt-1">{subtitle}</p>}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-12">{children}</main>
      </div>
    </div>
  );
};
