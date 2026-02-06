"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Logo({ compact }: { compact?: boolean }) {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Link href="/" className="flex items-center gap-2.5" onClick={handleLogoClick}>
      <div className="w-14 h-14 flex-shrink-0">
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 36 36" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          aria-label="FlexFit Logo"
          className="w-full h-full"
        >
          <image href="/newlogo.svg" width="36" height="36" />
        </svg>
      </div>
      
      {!compact && (
        <div className="flex items-baseline gap-0" style={{
          background: 'linear-gradient(90deg, #4A7BA7 0%, #8B9DC3 25%, #A89968 75%, #8B6F47 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          <span 
            className="text-xl font-black" 
            style={{ 
              fontFamily: '"Bebas Neue", "Arial Black", sans-serif',
              fontWeight: '900',
              letterSpacing: '0.08em'
            }}
          >
            flex
          </span>
          <span 
            className="text-xl font-black" 
            style={{ 
              fontFamily: '"Bebas Neue", "Arial Black", sans-serif',
              fontWeight: '900',
              letterSpacing: '0.08em'
            }}
          >
            fit
          </span>
        </div>
      )}
    </Link>
  );
}
