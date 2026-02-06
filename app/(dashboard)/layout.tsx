'use client';

import { Navbar } from '@/components/layout/navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div 
        style={{
          backgroundImage: 'url(/newDashboard.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundAttachment: 'scroll',
          minHeight: '100vh',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {children}
      </div>
    </>
  );
}
