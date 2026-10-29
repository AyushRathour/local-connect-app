import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Service, ServiceCategory, ProviderProfile } from '../types';
import { BookingModal } from '../components/common/BookingModal';
import {
  Search,
  MapPin,
  ShieldCheck,
  Calendar,
  Lock,
  Wrench,
  Zap,
  Sparkles,
  Hammer,
  Tv,
  Scissors,
  Star,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<Service | null>(null);

  useEffect(() => {
    // Fetch categories and featured services
    api.getCategories().then((res) => {
      if (res.success) setCategories(res.data);
    });

    api.getServices({ limit: 4 }).then((res) => {
      if (res.success) setServices(res.data);
    });

    api.getProviders().then((res) => {
      if (res.success) setProviders(res.data);
    });
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (locationQuery.trim()) params.append('location', locationQuery.trim());
    navigate(`/services?${params.toString()}`);
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'wrench':
      case 'plumbing':
        return <Wrench className="w-6 h-6 stroke-[1.8]" />;
      case 'zap':
      case 'electrical':
        return <Zap className="w-6 h-6 stroke-[1.8]" />;
      case 'sparkles':
      case 'cleaning':
        return <Sparkles className="w-6 h-6 stroke-[1.8]" />;
      case 'hammer':
      case 'carpentry':
        return <Hammer className="w-6 h-6 stroke-[1.8]" />;
      case 'tv':
      case 'appliance':
        return <Tv className="w-6 h-6 stroke-[1.8]" />;
      case 'scissors':
      case 'beauty':
        return <Scissors className="w-6 h-6 stroke-[1.8]" />;
      default:
        return <Wrench className="w-6 h-6 stroke-[1.8]" />;
    }
  };

  return (
    <div className="bg-white">
      {/* 1. HERO SECTION matching reference image */}
      <section className="relative pt-10 pb-16 lg:py-20 border-b border-zinc-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-zinc-950 leading-[1.12]">
                Find Trusted <br className="hidden sm:inline" />
                Local Service Providers <br className="hidden sm:inline" />
                Near You
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 max-w-xl leading-relaxed">
                Book professional services for your home and business. Fast, reliable and hassle-free.
              </p>

              {/* Integrated Search Box */}
              <form
                onSubmit={handleHeroSearch}
                className="bg-white p-2 rounded-2xl border border-zinc-300 shadow-xl max-w-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
              >
                <div className="flex-1 flex items-center px-3 py-2 gap-2 text-zinc-500">
                  <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a service (e.g. Plumbing, Cleaning, etc.)"
                    className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-hidden text-zinc-900 placeholder:text-zinc-400"
                  />
                </div>

                <div className="hidden sm:block w-px h-8 bg-zinc-200" />

                <div className="flex items-center px-3 py-2 gap-2 text-zinc-500 sm:w-44">
                  <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="City or locality"
                    className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-hidden text-zinc-900 placeholder:text-zinc-400"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs sm:text-sm font-semibold transition shadow-md whitespace-nowrap"
                >
                  Search
                </button>
              </form>

              {/* Trust Indicators Bar */}
              <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-zinc-600 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-zinc-900" />
                  <span>Trusted Professionals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-900" />
                  <span>Easy Booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-zinc-900" />
                  <span>Secure & Reliable</span>
                </div>
              </div>
            </div>

            {/* Right Hero Graphic with photo & curved doorstep badge */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Curved container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 aspect-4/3 bg-zinc-100">
                  <img
                    src="https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1000&q=80"
                    alt="Plumbing Technician at work"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-zinc-950/40 via-transparent to-transparent" />
                </div>

                {/* Floating pill badge as shown in reference: "Quality Service at Your Doorstep" */}
                <div className="absolute -bottom-5 right-4 sm:right-8 bg-white/95 backdrop-blur border border-zinc-200/80 rounded-full px-5 py-3 shadow-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-950 text-white flex items-center justify-center">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-950 block">Quality Service</span>
                    <span className="text-[11px] text-zinc-500">at Your Doorstep</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR SERVICES GRID matching reference image */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950">Popular Services</h2>
            <Link
              to="/services"
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 flex items-center gap-1 transition"
            >
              Explore All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/services?category=${cat.id}`)}
                className="group p-5 bg-white rounded-2xl border border-zinc-200/90 hover:border-zinc-950 hover:shadow-md transition text-center flex flex-col items-center justify-center space-y-3 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-50 group-hover:bg-zinc-950 group-hover:text-white text-zinc-800 flex items-center justify-center transition-colors">
                  {getCategoryIcon(cat.icon || cat.slug)}
                </div>
                <span className="text-xs font-semibold text-zinc-800 group-hover:text-zinc-950 transition">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED SERVICES WITH DIRECT BOOKING */}
      <section className="py-16 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-950">Top-Rated Services</h2>
              <p className="text-xs text-zinc-500 mt-1">Insured, background-verified technicians ready to assist</p>
            </div>
            <Link
              to="/services"
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 flex items-center gap-1 transition"
            >
              View Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col group"
              >
                {/* Photo container */}
                <div className="relative aspect-4/3 overflow-hidden bg-zinc-100">
                  <img
                    src={svc.image}
                    alt={svc.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-md text-[11px] font-semibold text-zinc-800 border border-zinc-200/60 shadow-xs">
                    {svc.categoryName}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950 line-clamp-1">{svc.title}</h3>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{svc.description}</p>
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-zinc-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-zinc-900">{svc.rating}</span>
                      <span className="text-zinc-400">({svc.reviewsCount}+ reviews)</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-zinc-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Standard</span>
                      <span className="text-base font-bold text-zinc-950 tabular-nums">From ₹{svc.price}</span>
                    </div>
                    <button
                      onClick={() => setSelectedServiceForBooking(svc)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition shadow-xs"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">How LocalServices Works</h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2">
              Simple 3-step process to get verified professionals for any repair or installation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-white mx-auto flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-zinc-900">Choose a Service</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Browse through certified plumbers, electricians, cleaners, and carpenters with upfront rates.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-white mx-auto flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-zinc-900">Pick Date & Time</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Select your preferred calendar slot that fits your schedule with instant booking confirmation.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-white mx-auto flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-zinc-900">Pay on Completion</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                The technician arrives equipped at your doorstep. Review the work and pay securely with satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE US & TRUST PRINCIPLES */}
      <section className="py-16 bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Why Millions Rely on LocalServices
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                We believe in total transparency and accountability. Every technician undergoes background verification,
                skill assessments, and continuous rating audits.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Strict background checks & ID verification for all pros</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Fixed, transparent pricing with no surprise on-site surcharges</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>30-day post-service workmanship warranty on all repairs</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Responsive 24/7 in-app support & rapid dispatch</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 text-center">
                <span className="text-3xl font-extrabold text-white tabular-nums">4.8/5</span>
                <p className="text-xs text-zinc-400 mt-1">Average Customer Rating</p>
              </div>
              <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 text-center">
                <span className="text-3xl font-extrabold text-white tabular-nums">15,000+</span>
                <p className="text-xs text-zinc-400 mt-1">Successful Bookings</p>
              </div>
              <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 text-center">
                <span className="text-3xl font-extrabold text-white tabular-nums">98%</span>
                <p className="text-xs text-zinc-400 mt-1">On-Time Arrival Rate</p>
              </div>
              <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 text-center">
                <span className="text-3xl font-extrabold text-white tabular-nums">100%</span>
                <p className="text-xs text-zinc-400 mt-1">Verified Technicians</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-zinc-100 p-8 sm:p-12 border border-zinc-300 text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
              Need Reliable Home Repairs Today?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
              Find top-rated technicians in your area with instant scheduling and transparent pricing.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/services"
                className="px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl transition shadow-md"
              >
                Browse All Services
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 text-xs sm:text-sm font-semibold text-zinc-800 bg-white hover:bg-zinc-50 border border-zinc-300 rounded-xl transition"
              >
                Register as Provider
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {selectedServiceForBooking && (
        <BookingModal
          service={selectedServiceForBooking}
          isOpen={!!selectedServiceForBooking}
          onClose={() => setSelectedServiceForBooking(null)}
        />
      )}
    </div>
  );
};
