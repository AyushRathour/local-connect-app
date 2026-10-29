import React from 'react';
import { Eye, Target, CheckCircle2, Award, Users, ShieldCheck } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* 1. Dark Hero matching reference image */}
      <section className="bg-zinc-950 text-white py-16 sm:py-20 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Header */}
            <div className="lg:col-span-7 space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">About Us</h1>
              <p className="text-sm sm:text-base text-zinc-300 max-w-xl leading-relaxed">
                We are on a mission to connect local customers with trusted service providers and make everyday
                services easier, faster and more reliable.
              </p>
            </div>

            {/* Right Photo with curved mask as shown in reference */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden aspect-16/10 border border-zinc-800 shadow-2xl bg-zinc-900">
                <img
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
                  alt="Service professionals collaborating"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Three Main Cards matching reference image: Our Vision, Our Mission, Why Choose Us? */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Our Vision */}
            <div className="p-8 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-950 flex items-center justify-center">
                <Eye className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950">Our Vision</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                To become the most trusted platform for local services, empowering both customers and service providers
                with cutting-edge scheduling, verified reputation, and fair pricing technology.
              </p>
            </div>

            {/* Card 2: Our Mission */}
            <div className="p-8 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-950 flex items-center justify-center">
                <Target className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950">Our Mission</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                To simplify the process of finding and booking local home and commercial services through a user-friendly,
                secure, and transparent platform that delivers peace of mind.
              </p>
            </div>

            {/* Card 3: Why Choose Us? */}
            <div className="p-8 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-950 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950">Why Choose Us?</h3>
              <ul className="space-y-2.5 text-xs text-zinc-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-950 shrink-0" />
                  <span>Verified Service Providers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-950 shrink-0" />
                  <span>Easy and Fast Booking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-950 shrink-0" />
                  <span>Secure Payments & Data</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-950 shrink-0" />
                  <span>Dedicated Customer Support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Standards of Quality */}
      <section className="py-16 bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
            <h2 className="text-2xl font-bold text-zinc-950">Built on Trust and Craftsmanship</h2>
            <p className="text-xs text-zinc-500">
              We empower local independent tradesmen while protecting homeowners with strict service standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-white rounded-2xl border border-zinc-200">
              <Users className="w-8 h-8 mx-auto text-zinc-950 mb-3" />
              <h4 className="text-sm font-bold text-zinc-900">Empowering Local Pros</h4>
              <p className="text-xs text-zinc-500 mt-1">
                We equip electricians, plumbers, and handymen with scheduling tools and fair income.
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-zinc-200">
              <ShieldCheck className="w-8 h-8 mx-auto text-zinc-950 mb-3" />
              <h4 className="text-sm font-bold text-zinc-900">Zero Fake Reviews</h4>
              <p className="text-xs text-zinc-500 mt-1">
                Only customers with completed bookings can leave ratings and written reviews.
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-zinc-200">
              <Award className="w-8 h-8 mx-auto text-zinc-950 mb-3" />
              <h4 className="text-sm font-bold text-zinc-900">Guaranteed Rework</h4>
              <p className="text-xs text-zinc-500 mt-1">
                If anything isn't right within 30 days of service completion, we send a pro to fix it.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
