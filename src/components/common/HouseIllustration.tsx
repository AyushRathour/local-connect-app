import React from 'react';
import { Wrench, Zap, Sparkles, Hammer, Shield } from 'lucide-react';

export const HouseIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center p-6 ${className}`}>
      {/* Decorative ambient backdrop */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* House line drawing */}
        <svg
          viewBox="0 0 200 200"
          className="w-48 h-48 text-zinc-600 stroke-current fill-none stroke-[2]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ground line */}
          <line x1="20" y1="170" x2="180" y2="170" strokeLinecap="round" />

          {/* House body */}
          <rect x="50" y="90" width="100" height="80" rx="4" strokeWidth="2.5" />

          {/* Roof */}
          <polygon points="100,35 35,90 165,90" strokeWidth="2.5" strokeLinejoin="round" />

          {/* Chimney */}
          <path d="M130,55 L130,45 L145,45 L145,67" strokeWidth="2" strokeLinejoin="round" />

          {/* Door with arch and knob */}
          <path d="M85,170 L85,125 A15,15 0 0,1 115,125 L115,170" strokeWidth="2" />
          <circle cx="110" cy="145" r="1.5" fill="currentColor" />

          {/* Left Window */}
          <rect x="60" y="105" width="16" height="20" rx="1.5" />
          <line x1="68" y1="105" x2="68" y2="125" />
          <line x1="60" y1="115" x2="76" y2="115" />

          {/* Right Window */}
          <rect x="124" y="105" width="16" height="20" rx="1.5" />
          <line x1="132" y1="105" x2="132" y2="125" />
          <line x1="124" y1="115" x2="140" y2="115" />

          {/* Roof Attic Window */}
          <circle cx="100" cy="65" r="8" />
          <line x1="100" y1="57" x2="100" y2="73" />
          <line x1="92" y1="65" x2="108" y2="65" />
        </svg>

        {/* Floating circular icon nodes around house */}
        <div className="absolute top-2 left-6 w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shadow-md">
          <Wrench className="w-4 h-4 stroke-[2]" />
        </div>

        <div className="absolute top-4 right-6 w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shadow-md">
          <Zap className="w-4 h-4 stroke-[2]" />
        </div>

        <div className="absolute bottom-10 left-2 w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shadow-md">
          <Sparkles className="w-4 h-4 stroke-[2]" />
        </div>

        <div className="absolute bottom-10 right-2 w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shadow-md">
          <Hammer className="w-4 h-4 stroke-[2]" />
        </div>

        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shadow-md">
          <Shield className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
