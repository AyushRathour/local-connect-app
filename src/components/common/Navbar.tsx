import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from './BrandLogo';
import { Bell, ChevronDown, User as UserIcon, LogOut, LayoutDashboard, Shield, Wrench } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, switchDemoRole, unreadCount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'provider') return '/provider/dashboard';
    return '/customer/dashboard';
  };

  const handleRoleSwitch = async (role: 'customer' | 'provider' | 'admin') => {
    await switchDemoRole(role);
    setRoleSwitcherOpen(false);
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'provider') navigate('/provider/dashboard');
    else navigate('/customer/dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand */}
        <BrandLogo />

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors whitespace-nowrap ${
                  isActive ? 'text-zinc-950 font-semibold' : 'hover:text-zinc-950'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Account */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Role Switcher Pill for reviewer convenience */}
          <div className="relative">
            <button
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-md border border-zinc-200 transition"
              title="Switch demo preview role"
            >
              <span>Demo Role:</span>
              <span className="capitalize font-semibold text-zinc-900">{user?.role || 'Guest'}</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {roleSwitcherOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Switch Active Role
                </div>
                <button
                  onClick={() => handleRoleSwitch('customer')}
                  className="w-full text-left px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                >
                  <UserIcon className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Customer (John Doe)</span>
                </button>
                <button
                  onClick={() => handleRoleSwitch('provider')}
                  className="w-full text-left px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                >
                  <Wrench className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Provider (Rahul Singh)</span>
                </button>
                <button
                  onClick={() => handleRoleSwitch('admin')}
                  className="w-full text-left px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Admin Console</span>
                </button>
              </div>
            )}
          </div>

          {isAuthenticated && user ? (
            <div className="relative flex items-center gap-2">
              <Link
                to={getDashboardPath()}
                className="p-2 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-full relative transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-zinc-900" />
                )}
              </Link>

              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1 text-sm font-medium text-zinc-800 hover:bg-zinc-100 rounded-full border border-zinc-200 transition"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-semibold">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="max-w-[100px] truncate text-xs">{user.name}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-zinc-200 rounded-lg shadow-xl py-1.5 z-50">
                    <div className="px-3.5 py-2 border-b border-zinc-100">
                      <p className="text-xs font-semibold text-zinc-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-zinc-500 capitalize">{user.role}</p>
                    </div>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-left px-3.5 py-2 text-xs text-zinc-700 hover:bg-zinc-50 flex items-center gap-2.5"
                    >
                      <LayoutDashboard className="w-4 h-4 text-zinc-500" />
                      Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 border-t border-zinc-100"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-zinc-800 hover:text-zinc-950 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-full transition shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
