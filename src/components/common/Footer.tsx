import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { Mail, Phone, MapPin, ShieldCheck, Clock, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-950 text-zinc-400 pt-16 pb-12 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-zinc-800">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo darkTheme />
            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              LocalServices connects homeowners and businesses with background-verified, insured, and skilled local
              technicians. Reliable on-demand repairs, maintenance, and installations at transparent prices.
            </p>
            <div className="flex items-center gap-4 pt-2 text-xs text-zinc-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Pros
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-zinc-300" /> On-Time Guarantee
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-zinc-300" /> Upfront Pricing
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition">
                  Explore Services
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition">
                  Join as a Provider
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Categories</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/services?category=cat_plumbing" className="hover:text-white transition">
                  Plumbing Services
                </Link>
              </li>
              <li>
                <Link to="/services?category=cat_electrical" className="hover:text-white transition">
                  Electrical Wiring & Repairs
                </Link>
              </li>
              <li>
                <Link to="/services?category=cat_cleaning" className="hover:text-white transition">
                  Home & Office Cleaning
                </Link>
              </li>
              <li>
                <Link to="/services?category=cat_carpentry" className="hover:text-white transition">
                  Carpentry & Furniture
                </Link>
              </li>
              <li>
                <Link to="/services?category=cat_appliance" className="hover:text-white transition">
                  Appliance & AC Care
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Contact Info</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <span>support@localservices.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <span>123 Business Street, New Delhi, India - 110001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} LocalServices (Local Connect). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-zinc-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-zinc-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-zinc-400 cursor-pointer">Provider Agreement</span>
            <span className="hover:text-zinc-400 cursor-pointer">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
