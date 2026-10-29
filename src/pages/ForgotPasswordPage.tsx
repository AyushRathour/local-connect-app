import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { BrandLogo } from '../components/common/BrandLogo';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('john@example.com');
  const [demoToken, setDemoToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const res = await api.forgotPassword(email.trim());
      if (res.success) {
        setMessage(res.message);
        if (res.demoToken) {
          setDemoToken(res.demoToken);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Request failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoToken || !newPassword) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.resetPassword({ token: demoToken, newPassword });
      if (res.success) {
        setResetDone(true);
      }
    } catch (err: any) {
      setError(err.message || 'Reset failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-zinc-200 shadow-xl space-y-6">
        <BrandLogo />

        <div>
          <h2 className="text-xl font-bold text-zinc-950">Reset Password</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Enter your registered email address to receive secure reset credentials.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {resetDone ? (
          <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-zinc-900">Password Updated</h4>
            <p className="text-xs text-zinc-600">You can now sign in using your new credentials.</p>
            <Link
              to="/login"
              className="inline-block mt-2 px-4 py-2 text-xs font-semibold text-white bg-zinc-950 rounded-lg"
            >
              Back to Login
            </Link>
          </div>
        ) : demoToken ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-600">
              <span className="font-semibold text-zinc-900 block mb-0.5">Reset Token Received:</span>
              <code className="font-mono text-[11px] bg-zinc-200 px-1.5 py-0.5 rounded text-zinc-800">
                {demoToken}
              </code>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">New Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  required
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-zinc-950 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl transition"
            >
              {isSubmitting ? 'Updating...' : 'Set New Password'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequestToken} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-zinc-950 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl transition"
            >
              {isSubmitting ? 'Sending Request...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
