import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Service, ServiceCategory } from '../types';
import { BookingModal } from '../components/common/BookingModal';
import {
  Search,
  MapPin,
  Star,
  SlidersHorizontal,
  ArrowUpDown,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filters state
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [category, setCategory] = useState<string>(searchParams.get('category') || 'all');
  const [location, setLocation] = useState<string>(searchParams.get('location') || '');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('');
  const [sort, setSort] = useState<string>('rating_desc');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false);

  const [bookingService, setBookingService] = useState<Service | null>(null);

  // Load categories
  useEffect(() => {
    api.getCategories().then((res) => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  // Fetch filtered services
  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await api.getServices({
        search,
        category: category !== 'all' ? category : '',
        location,
        minPrice,
        maxPrice,
        minRating,
        sort,
        page,
        limit: 9,
      });

      if (res.success) {
        setServices(res.data);
        setTotalCount(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [category, sort, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchServices();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('all');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSort('rating_desc');
    setPage(1);
    setSearchParams({});
    api.getServices({ page: 1, limit: 9 }).then((res) => {
      if (res.success) {
        setServices(res.data);
        setTotalCount(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    });
  };

  return (
    <div className="bg-zinc-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950">Explore Local Services</h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Compare prices, check provider ratings, and schedule guaranteed appointments.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch gap-3">
            <div className="flex-1 relative flex items-center">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search service name (e.g., tap leak, fan wiring, sofa clean)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-zinc-950 focus:bg-white transition"
              />
            </div>

            <div className="md:w-60 relative flex items-center">
              <MapPin className="w-4 h-4 text-zinc-400 absolute left-3.5" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Locality / City..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-zinc-950 focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl transition shadow-xs whitespace-nowrap"
              >
                Find Services
              </button>
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                  filterDrawerOpen
                    ? 'bg-zinc-950 text-white border-zinc-950'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </form>

          {/* Interactive Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-zinc-100">
            <button
              onClick={() => {
                setCategory('all');
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                category === 'all'
                  ? 'bg-zinc-950 text-white font-semibold'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setCategory(c.id);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  category === c.id
                    ? 'bg-zinc-950 text-white font-semibold'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Expandable Advanced Filters Drawer */}
          {filterDrawerOpen && (
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">
                  Min Price (₹)
                </label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">
                  Max Price (₹)
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="1000"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">
                  Minimum Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">
                  Sort By
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-950"
                >
                  <option value="rating_desc">Highest Rated</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>

              <div className="sm:col-span-2 md:col-span-4 flex items-center justify-between pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs text-zinc-500 hover:text-zinc-900 font-medium"
                >
                  Clear all filters
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPage(1);
                    fetchServices();
                  }}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Metadata Bar */}
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>
            Showing <strong className="text-zinc-900">{services.length}</strong> of{' '}
            <strong className="text-zinc-900">{totalCount}</strong> verified services
          </span>
          <div className="flex items-center gap-2">
            <span>Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent border-none text-zinc-900 font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="rating_desc">Highest Rating</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-zinc-200 p-4 space-y-4 animate-pulse">
                <div className="w-full aspect-4/3 bg-zinc-100 rounded-xl" />
                <div className="h-4 bg-zinc-100 rounded-md w-3/4" />
                <div className="h-3 bg-zinc-100 rounded-md w-1/2" />
                <div className="pt-4 border-t border-zinc-100 flex justify-between">
                  <div className="h-5 bg-zinc-100 rounded-md w-20" />
                  <div className="h-8 bg-zinc-100 rounded-lg w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">No Services Found</h3>
              <p className="text-xs text-zinc-500 mt-1">
                We couldn't find matches for your selected criteria. Try adjusting keywords or clearing filters.
              </p>
            </div>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Image */}
                <div className="relative aspect-4/3 bg-zinc-100 overflow-hidden">
                  <img
                    src={svc.image}
                    alt={svc.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-md text-[11px] font-semibold text-zinc-800 border border-zinc-200/80 shadow-xs">
                    {svc.categoryName}
                  </div>
                  <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur px-2 py-0.5 rounded-md text-[11px] text-white flex items-center gap-1 font-mono tabular-nums">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{svc.rating}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span>By {svc.providerName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{svc.serviceArea}</span>
                    </div>

                    <Link to={`/services/${svc.id}`}>
                      <h3 className="text-base font-bold text-zinc-900 group-hover:text-zinc-600 transition line-clamp-1">
                        {svc.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{svc.description}</p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-5 mt-4 border-t border-zinc-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Service Price</span>
                      <span className="text-lg font-bold text-zinc-950 tabular-nums">₹{svc.price}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/services/${svc.id}`}
                        className="px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 rounded-lg transition"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => setBookingService(svc)}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition shadow-xs"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-white disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-zinc-600 px-3 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-white disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingService && (
        <BookingModal
          service={bookingService}
          isOpen={!!bookingService}
          onClose={() => setBookingService(null)}
          onSuccess={() => fetchServices()}
        />
      )}
    </div>
  );
};
