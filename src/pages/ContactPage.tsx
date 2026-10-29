import React, { useState } from 'react';
import { api } from '../services/api';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.submitContact({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: subject.trim() || 'General Inquiry',
        message: message.trim(),
      });

      if (res.success) {
        setSuccess(true);
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setMessage('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-50 min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-left space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">Get in Touch</h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            We're here to help! Reach out to us for any queries, suggestions or support.
          </p>
        </div>

        {/* 2-Column Split matching reference image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact details and location map box */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-xs space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Email</span>
                  <a href="mailto:support@localservices.com" className="text-xs sm:text-sm font-semibold text-zinc-900 hover:underline">
                    support@localservices.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Phone</span>
                  <a href="tel:+919876543210" className="text-xs sm:text-sm font-semibold text-zinc-900 hover:underline">
                    +91 98765 43210
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Address</span>
                  <p className="text-xs sm:text-sm font-medium text-zinc-700 leading-relaxed">
                    123 Business Street, New Delhi, India - 110001
                  </p>
                </div>
              </div>
            </div>

            {/* Location Map Illustration Container as in reference */}
            <div className="rounded-2xl border border-zinc-200 overflow-hidden bg-zinc-100 p-4 relative h-48 flex items-center justify-center">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#a1a1aa_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative z-10 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-zinc-950 text-white flex items-center justify-center mx-auto shadow-md">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-zinc-900 block">Our Location</span>
                <span className="text-[11px] text-zinc-500 block">Connaught Place Central Hub, New Delhi</span>
              </div>
            </div>
          </div>

          {/* Right Column: Send a Message Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-xs">
            <h3 className="text-xl font-bold text-zinc-950 mb-6">Send a Message</h3>

            {success ? (
              <div className="p-8 text-center space-y-3 bg-zinc-50 rounded-2xl border border-zinc-200">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-zinc-900">Message Delivered</h4>
                <p className="text-xs text-zinc-600 max-w-sm mx-auto">
                  Thank you for contacting LocalServices. Our help desk has received your ticket and will respond within 24 hours.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-2 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 rounded-lg transition"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-zinc-950 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-zinc-950 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Subject (Optional)</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What is your message regarding?"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-zinc-950 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Message</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    required
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-zinc-950 focus:bg-white transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 text-xs sm:text-sm font-semibold text-white bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
