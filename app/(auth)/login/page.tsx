'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import { Flame, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { login, error, loading } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12">
            <Image
              src="/newlogo.svg"
              alt="FlexFit Logo"
              width={40}
              height={40}
              priority
            />
            <span className="text-2xl font-black" style={{ 
              background: 'linear-gradient(135deg, #4A90E2 0%, #9B8B6F 50%, #C4A962 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>FlexFit</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1F2937' }}>Welcome back</h1>
            <p className="text-base" style={{ color: '#6B7280' }}>Sign in to your FlexFit account</p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-lg mb-6 flex items-start gap-3" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid #FCA5A5' }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#DC2626', color: 'white', fontSize: '12px' }}>!</div>
              <p style={{ color: '#DC2626', fontSize: '14px' }}>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Email*</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  borderColor: '#E5E7EB',
                  color: '#1F2937',
                  backgroundColor: '#F9FAFB'
                }}
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Password*</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 pr-12 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{ 
                    borderColor: '#E5E7EB',
                    color: '#1F2937',
                    backgroundColor: '#F9FAFB'
                  }}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  style={{ color: '#6B7280' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#1F2937',
                color: '#FFFFFF'
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm mt-6" style={{ color: '#6B7280' }}>
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold hover:underline" style={{ color: '#9B8B6F' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Marketing Content */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ backgroundColor: '#EEF2F6' }}>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-xl">
            {/* Hero Image */}
            <div className="relative mb-8 rounded-3xl overflow-hidden" style={{ 
              height: '650px',
              boxShadow: '0 20px 60px rgba(155, 139, 111, 0.3)'
            }}>
              <Image
                src="/signUp.jpg"
                alt="Fitness workout"
                fill
                sizes="(max-width: 1024px) 0vw, 50vw"
                className="object-cover"
                style={{ objectPosition: 'center 20%' }}
                priority
              />
              {/* Overlay with gradient for better text visibility */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.1))' }} />
            </div>

            {/* Marketing Text */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-3" style={{ color: '#1F2937' }}>
                Welcome Back to Your Fitness Journey
              </h2>
              <p className="text-base leading-relaxed" style={{ color: '#6B7280' }}>
                Continue your transformation with AI-powered scheduling, 
                personalized routines, and the unique Petflame motivation system.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm">
                <Flame className="w-5 h-5" style={{ color: '#9B8B6F' }} />
                <span className="text-sm font-medium" style={{ color: '#374151' }}>Petflame Streak System</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm">
                <CheckCircle2 className="w-5 h-5" style={{ color: '#9B8B6F' }} />
                <span className="text-sm font-medium" style={{ color: '#374151' }}>AI-Powered Workouts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full opacity-20" style={{ backgroundColor: '#9B8B6F' }} />
        <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full opacity-15" style={{ backgroundColor: '#C4A962' }} />
      </div>

      <style>{`
        input:focus {
          ring-color: #9B8B6F;
          border-color: #9B8B6F;
        }
      `}</style>
    </div>
  );
}
