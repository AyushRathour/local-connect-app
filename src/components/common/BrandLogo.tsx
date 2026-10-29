import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

interface BrandLogoProps {
  darkTheme?: boolean;
  className?: string;
  linkTo?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ darkTheme = false, className = '', linkTo = '/' }) => {
  return (
    <Link to={linkTo} className={`flex items-center gap-2.5 font-bold tracking-tight text-lg group ${className}`}>
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
          darkTheme ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-white'
        }`}
      >
        <Home className="w-4 h-4 stroke-[2.2]" />
      </div>
      <span className={darkTheme ? 'text-white' : 'text-zinc-950'}>LocalServices</span>
    </Link>
  );
};
