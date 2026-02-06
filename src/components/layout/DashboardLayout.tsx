'use client';

import React from 'react';

interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  heroImage?: string;
}

export function DashboardLayout({ title = "Dashboard", subtitle, children, actions, heroImage }: DashboardLayoutProps) {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: `
        radial-gradient(ellipse at 20% 0%, rgba(230, 200, 120, 0.04) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 100%, rgba(184, 147, 94, 0.04) 0%, transparent 50%),
        linear-gradient(180deg, #f8f8fa 0%, #fafaf9 25%, #fcfbf8 50%, #fafaf9 75%, #f8f8fa 100%)
      `, 
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      {/* Organic flowing shapes in background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.4 }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '50%', height: '60%', background: 'radial-gradient(circle, rgba(230, 200, 120, 0.15) 0%, rgba(184, 147, 94, 0.08) 35%, transparent 70%)', filter: 'blur(100px)', borderRadius: '50%', animation: 'pulse 8s ease-in-out infinite' }}></div>
        <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: '45%', height: '50%', background: 'radial-gradient(circle, rgba(184, 147, 94, 0.12) 0%, rgba(139, 110, 76, 0.06) 40%, transparent 70%)', filter: 'blur(120px)', borderRadius: '50%', animation: 'pulse 10s ease-in-out infinite 1s' }}></div>
        <div style={{ position: 'absolute', top: '40%', left: '30%', width: '30%', height: '35%', background: 'radial-gradient(circle, rgba(230, 200, 120, 0.1) 0%, transparent 70%)', filter: 'blur(90px)', borderRadius: '50%', animation: 'pulse 12s ease-in-out infinite 2s' }}></div>
        <div style={{ position: 'absolute', top: '60%', right: '25%', width: '35%', height: '40%', background: 'radial-gradient(circle, rgba(196, 169, 98, 0.08) 0%, transparent 70%)', filter: 'blur(110px)', borderRadius: '50%', animation: 'pulse 9s ease-in-out infinite 3s' }}></div>
      </div>
      
      {/* Subtle texture overlay */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        opacity: 0.02,
        background: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 2px,
          rgba(230, 200, 120, 0.1) 2px,
          rgba(230, 200, 120, 0.1) 4px
        )`
      }}></div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>
      
      {/* Hero Section */}
      <div
        style={{
          minHeight: '800px',
          backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url('/newDashboard.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 80%',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'scroll',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '5rem 1rem 4rem 1rem',
          marginTop: '-100px',
          position: 'relative'
        }}
      >
        <div className="text-center max-w-3xl">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-2" style={{ color: '#ffffff', letterSpacing: '-0.02em' }}>
            {title.split(',')[0]}
          </h1>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6" style={{ color: '#E6C878' }}>
            {title.split(',')[1]?.trim() || ''}
          </h2>
          {subtitle && (
            <p className="text-xl sm:text-2xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(200, 200, 200, 0.8)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16" style={{ paddingTop: '3rem' }}>
        <div className="space-y-8 lg:space-y-12">
          {children}
        </div>
      </div>
    </div>
  );
}
