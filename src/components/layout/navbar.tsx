'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import Logo from './Logo';
import { UserAccountMenu } from './UserAccountMenu';

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasInitialized = useRef(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Check if current page should have transparent navbar
  const isTransparentNav = pathname === '/dashboard' || pathname === '/workouts' || pathname?.startsWith('/workouts/');

  // Add scroll listener for dashboard navbar transformation
  useEffect(() => {
    if (!isTransparentNav) return;

    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isTransparentNav]);

  // Initialize ONCE from localStorage on first mount
  useEffect(() => {
    setIsClient(true);
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      const savedName = localStorage.getItem('flexfit_username');
      if (savedName) {
        setDisplayName(savedName);
      }
    }
  }, []);

  // Update displayName when user changes
  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
      localStorage.setItem('flexfit_username', user.name);
    }
  }, [user]);

  const handleLogout = async () => {
    setDisplayName(null);
    localStorage.removeItem('flexfit_username');
    await logout();
    router.push('/login');
  };

  const navLinks = [
    { name: 'Features', href: '/#features' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'About Us', href: '/#about-us' },
    { name: 'Dashboard', href: '/dashboard' },
  ];

  const handleFeatureClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Check if we're on the homepage
    if (window.location.pathname === '/') {
      e.preventDefault();
      const featuresSection = document.getElementById('features');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleHowItWorksClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Check if we're on the homepage
    if (window.location.pathname === '/') {
      e.preventDefault();
      const howItWorksSection = document.getElementById('how-it-works');
      if (howItWorksSection) {
        howItWorksSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleAboutUsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Check if we're on the homepage
    if (window.location.pathname === '/') {
      e.preventDefault();
      const aboutUsSection = document.getElementById('about-us');
      if (aboutUsSection) {
        aboutUsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const showUserUI = !!displayName;
  const showLoadingUI = loading && !displayName;

  // Determine navbar styles based on scroll state
  const getNavbarStyle = () => {
    if (isTransparentNav && hasScrolled) {
      // Transform to dark navbar on scroll
      return {
        backgroundColor: '#1a1d23',
        backdropFilter: 'blur(12px)',
      };
    } else if (isTransparentNav) {
      // Transparent on dashboard without scroll
      return {
        backgroundColor: 'transparent',
      };
    } else {
      // Normal navbar on other pages
      return {
        backgroundColor: '#1a1d23',
      };
    }
  };

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isTransparentNav && hasScrolled ? 'backdrop-blur-md border-b border-white/10' : isTransparentNav ? '' : 'backdrop-blur-md border-b border-white/10'}`}
      style={getNavbarStyle()}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-20">
          
          {/* LEFT: Logo */}
          <div className="flex justify-start shrink-0">
            <Logo />
          </div>

          {/* CENTER: Navigation Links */}
          <div className="hidden md:flex items-center justify-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href}
                onClick={
                  link.name === 'Features' 
                    ? handleFeatureClick 
                    : link.name === 'How It Works' 
                    ? handleHowItWorksClick 
                    : link.name === 'About Us'
                    ? handleAboutUsClick
                    : undefined
                }
                className="relative font-medium px-1 py-2 text-white group transition-colors duration-300 hover:text-[#e0d6c2]"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#8f7d63] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* RIGHT: User Actions */}
          <div className="hidden md:flex items-center justify-end space-x-6" style={{ minWidth: '250px' }}>
            
            {/* Server & Initial Client Render: Show Guest UI as placeholder */}
            {!isClient ? (
              <div className="flex items-center gap-6">
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-white transition-colors hover:text-[#a89968]"
                >
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="h-[36px] flex items-center px-5 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:scale-105 bg-[#a89968] hover:bg-[#b5a675] whitespace-nowrap"
                >
                  Start Free
                </Link>
              </div>
            ) : showUserUI ? (
              /* After hydration: LOGGED IN (Persistent) */
              <UserAccountMenu displayName={displayName} onLogout={handleLogout} />
            ) : showLoadingUI ? (
              /* After hydration: LOADING (First time visit only) */
              <div className="flex items-center gap-6">
                <div className="h-5 w-20 bg-white/20 rounded animate-pulse"></div>
                <div className="h-[36px] w-[90px] bg-[#a89968] rounded-lg opacity-80 animate-pulse"></div>
              </div>
            ) : (
              /* After hydration: GUEST */
              <div className="flex items-center gap-6">
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-white transition-colors hover:text-[#a89968]"
                >
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="h-[36px] flex items-center px-5 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:scale-105 bg-[#a89968] hover:bg-[#b5a675] whitespace-nowrap"
                >
                  Start Free
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}