import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Service, Review, ProviderProfile } from '../types';
import { BookingModal } from '../components/common/BookingModal';
import {
  Star,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  Share2,
  AlertCircle,
} from 'lucide-react';

export const ServiceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [service, setService] = useState<
    (Service & { providerProfile?: ProviderProfile; reviews: Review[]; relatedServices: Service[] }) | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api
      .getServiceById(id)
      .then((res) => {
        if (res.success && res.data) {
          setService(res.data);
        } else {
          setError('Service not found');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-6 bg-zinc-200 rounded-md w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-96 bg-zinc-200 rounded-3xl" />
          <div className="lg:col-span-4 h-96 bg-zinc-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-zinc-900">Service Not Available</h2>
        <p className="text-xs text-zinc-500">{error || 'This service could not be loaded.'}</p>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-zinc-950 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Catalog
          </Link>
          <span className="text-xs text-zinc-400">
            {service.categoryName} · {service.serviceArea}
          </span>
        </div>

        {/* Main 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Media & Full Description */}
          <div className="lg:col-span-8 space-y-8">
            {/* Main Service Image */}
            <div className="relative rounded-3xl overflow-hidden aspect-16/9 bg-zinc-200 border border-zinc-200 shadow-md">
              <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-white">
                {service.categoryName}
              </div>
            </div>

            {/* Title and Ratings */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">{service.title}</h1>
                  <div className="flex items-center gap-3 mt-2 text-xs text-zinc-600">
                    <span className="flex items-center gap-1 font-semibold text-zinc-900">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      {service.rating}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{service.reviewsCount} verified reviews</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" /> ~{service.durationMinutes} mins
                    </span>
                  </div>
                </div>
              </div>

              <hr className="border-zinc-100" />

              {/* Service Description */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider text-[11px]">
                  Service Overview
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{service.description}</p>
              </div>

              {/* Included Checklist */}
              <div className="space-y-3 pt-4">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider text-[11px]">
                  What's Included
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex items-center gap-2 text-xs text-zinc-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Background-verified expert technician</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Complete diagnostic and upfront repair estimate</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>30-Day post-service rework guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cleanup of workspace upon completion</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Spotlight */}
            {service.providerProfile && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-xs space-y-4">
                <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  About the Service Provider
                </h3>
                <div className="flex items-start gap-4">
                  <img
                    src={service.providerProfile.profileImage}
                    alt={service.providerProfile.businessName}
                    className="w-14 h-14 rounded-2xl object-cover border border-zinc-200"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-zinc-900">
                        {service.providerProfile.businessName}
                      </h4>
                      <span title="Verified Professional">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {service.providerProfile.experienceYears}+ years experience · {service.providerProfile.completedJobs} completed jobs
                    </p>
                    <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                      {service.providerProfile.bio}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Genuine Reviews Section */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-950">Customer Reviews</h3>
                  <p className="text-xs text-zinc-500">Verified customers who booked this service</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-900">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{service.rating} / 5.0</span>
                </div>
              </div>

              {service.reviews.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400 bg-zinc-50 rounded-2xl">
                  No written reviews yet for this service. Book and be the first to review!
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {service.reviews.map((rev) => (
                    <div key={rev.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {rev.customerAvatar ? (
                            <img src={rev.customerAvatar} alt={rev.customerName} className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold">
                              {rev.customerName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="text-xs font-semibold text-zinc-900">{rev.customerName}</span>
                            <span className="text-[10px] text-zinc-400 block">Verified Completed Booking</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-zinc-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-600 pl-9 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Pricing & Booking Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 bg-white p-6 sm:p-7 rounded-3xl border border-zinc-200 shadow-xl space-y-6">
              <div>
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Standard Price</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-zinc-950 tabular-nums">₹{service.price}</span>
                  <span className="text-xs text-zinc-500">per visit / service</span>
                </div>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-600 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span>Service Area:</span>
                  <strong className="text-zinc-900">{service.serviceArea}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estimated Duration:</span>
                  <strong className="text-zinc-900">{service.durationMinutes} minutes</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payment:</span>
                  <strong className="text-zinc-900">Pay on completion</strong>
                </div>
              </div>

              <button
                onClick={() => setBookingModalOpen(true)}
                className="w-full py-3.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" /> Book Appointment
              </button>

              <p className="text-[11px] text-center text-zinc-400">
                Free cancellation up to 2 hours before scheduled slot.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      {bookingModalOpen && (
        <BookingModal
          service={service}
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
        />
      )}
    </div>
  );
};
