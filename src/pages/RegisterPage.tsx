import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';
import { HouseIllustration } from '../components/common/HouseIllustration';
import { User, Wrench, Shield, Mail, Lock, UserCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<'customer' | 'provider' | 'admin'>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('Please provide full name, email, and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        role,
      });

      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'provider') navigate('/provider/dashboard');
      else navigate('/customer/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
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
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Create Your Account</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                Join our platform and get access to local services near you.
              </p>
            </div>
          </div>

          <div className="my-6">
            <HouseIllustration />
          </div>

          <div className="text-center pt-4 border-t border-zinc-900">
            <p className="text-xs text-zinc-500 font-medium tracking-wide">
              Trusted Local Services <span className="text-zinc-700">|</span> Better Living
            </p>
          </div>
        </div>

        {/* Right Form Panel with Role Selector */}
        <div className="p-8 sm:p-10 flex flex-col justify-center space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Register</h1>
            <p className="text-xs text-zinc-500 mt-1">Choose your account type to get started</p>
          </div>

          {/* Role Selection Tabs matching reference image */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-2">Choose your role</label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-100 rounded-xl">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`py-2 px-1 text-xs font-semibold rounded-lg flex flex-col items-center gap-1 transition ${
                  role === 'customer'
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Customer</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('provider')}
                className={`py-2 px-1 text-xs font-semibold rounded-lg flex flex-col items-center gap-1 transition ${
                  role === 'provider'
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span className="truncate">Service Provider</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 px-1 text-xs font-semibold rounded-lg flex flex-col items-center gap-1 transition ${
                  role === 'admin'
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Name</label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-zinc-950 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-zinc-950 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Phone Number (Optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-zinc-950 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full pl-9 pr-10 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-zinc-950 focus:bg-white transition"
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
              className="w-full py-3 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 rounded-xl transition shadow-md cursor-pointer mt-2"
            >
              {isSubmitting ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500 pt-1">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-zinc-950 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
