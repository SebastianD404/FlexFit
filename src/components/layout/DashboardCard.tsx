'use client';

import React from 'react';

interface DashboardCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'accent';
  style?: React.CSSProperties;
}

export function DashboardCard({
  title,
  description,
  children,
  className = '',
  variant = 'default',
  style,
}: DashboardCardProps) {
  const variantClasses = {
    default: 'backdrop-blur-sm shadow-lg',
    gradient: 'backdrop-blur-sm shadow-lg',
    accent: 'backdrop-blur-sm shadow-xl',
  };

  const baseStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.6) 0%, rgba(20, 20, 30, 0.7) 100%)',
    backdropFilter: 'blur(10px)',
    color: '#FFFFFF',
    border: `1.5px solid rgba(196, 169, 98, 0.15)`,
    borderRadius: '0px',
    padding: '2rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
    ...(style || {}),
  } as any;

  // gradient variant uses a subtle overlay gradient on top of card color
  const gradientStyle: React.CSSProperties = variant === 'gradient' ? {
    background: 'linear-gradient(135deg, rgba(230, 200, 120, 0.08) 0%, rgba(184, 147, 94, 0.05) 25%, rgba(26, 26, 26, 0.9) 50%, rgba(20, 20, 30, 0.95) 100%)',
  } : {};

  return (
    <div style={{ ...baseStyle, ...gradientStyle }} className={`rounded-xl transition-all duration-200 ${variantClasses[variant]} ${className}`}>
      {title && (
        <h3 className="text-xl lg:text-2xl font-black mb-2 uppercase" style={{ color: '#E6C878', letterSpacing: '0.05em' }}>
          {title}
        </h3>
      )}
      {description && (
        <p className="text-xs mb-4 uppercase tracking-wider" style={{ color: 'rgba(230, 200, 120, 0.7)' }}>
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
