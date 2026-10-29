import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';
import { HouseIllustration } from '../components/common/HouseIllustration';
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [emailOrPhone, setEmailOrPhone] = useState('john@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim() || !password) {
      setError('Please provide your email/phone and password.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await login(emailOrPhone.trim(), password);
      // Navigate to appropriate dashboard based on user
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (role: 'customer' | 'provider' | 'admin') => {
    setIsSubmitting(true);
    try {
      await switchDemoRole(role);
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'provider') navigate('/provider/dashboard');
      else navigate('/customer/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 grid grid-cols-1 md:grid-cols-2">
        {/* Left Promotional Dark Panel matching reference image */}
        <div className="bg-zinc-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6">
            <BrandLogo darkTheme />
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome Back!</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                Login to your account and continue booking services.
              </p>
            </div>
          </div>

          {/* House Vector Art with Service Badges */}
          <div className="my-6">
            <HouseIllustration />
          </div>

          <div className="text-center pt-4 border-t border-zinc-900">
            <p className="text-xs text-zinc-500 font-medium tracking-wide">
              Trusted Local Services <span className="text-zinc-700">|</span> Better Living
            </p>
          </div>
        </div>

        {/* Right Form Panel matching reference image */}
        <div className="p-8 sm:p-10 flex flex-col justify-center space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Login</h1>
            <p className="text-xs text-zinc-500 mt-1">Enter your credentials to access your account</p>
          </div>

          {/* Quick 1-click Demo Fillers */}
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1.5">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Quick 1-Click Demo Logins
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('customer')}
                className="px-2 py-1 bg-white hover:bg-zinc-200 border border-zinc-200 rounded text-[11px] font-medium text-zinc-800 transition truncate"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('provider')}
                className="px-2 py-1 bg-white hover:bg-zinc-200 border border-zinc-200 rounded text-[11px] font-medium text-zinc-800 transition truncate"
              >
                Provider
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="px-2 py-1 bg-white hover:bg-zinc-200 border border-zinc-200 rounded text-[11px] font-medium text-zinc-800 transition truncate"
              >
                Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Email or Mobile Number</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="name@example.com or phone"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-zinc-950 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-zinc-500 hover:text-zinc-950 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-zinc-950 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 rounded-xl transition shadow-md cursor-pointer"
            >
              {isSubmitting ? 'Signing In...' : 'Login'}
            </button>
          </form>

          {/* Social Logins as shown in reference image */}
          <div className="space-y-3">
            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-zinc-200" />
              <span className="shrink mx-4 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">OR</span>
              <div className="grow border-t border-zinc-200" />
            </div>

            <button
              type="button"
              onClick={() => handleQuickDemo('customer')}
              className="w-full py-2.5 px-4 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-700 hover:bg-zinc-50 flex items-center justify-center gap-2 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <p className="text-center text-xs text-zinc-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-zinc-950 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
