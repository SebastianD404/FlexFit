'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/navbar';
import Logo from '@/components/layout/Logo';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Brain, ClipboardList, Atom, Zap, Flame, RefreshCw, Check, Calendar, Target, Sparkles, Dumbbell } from 'lucide-react';

export default function HomePage() {
    // About Us stats animation
    const [aboutStatsAnimated, setAboutStatsAnimated] = useState(false);
    const [aboutStats, setAboutStats] = useState({
      templates: 0,
      plans: 0,
      exercises: 0,
      hours: 0
    });

    useEffect(() => {
      const aboutSection = document.getElementById('about-us');
      if (!aboutSection) return;
      const observer = new window.IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !aboutStatsAnimated) {
            setAboutStatsAnimated(true);
          }
        });
      }, { threshold: 0.3 });
      observer.observe(aboutSection);
      return () => observer.disconnect();
    }, [aboutStatsAnimated]);

    useEffect(() => {
      if (!aboutStatsAnimated) return;
      let t = 0, p = 0, e = 0, h = 0;
      const interval = setInterval(() => {
        t = Math.min(t + 1, 20);
        p = Math.min(p + 50, 1000);
        e = Math.min(e + 10, 300);
        h = Math.min(h + 2, 64);
        setAboutStats({
          templates: t,
          plans: p,
          exercises: e,
          hours: h
        });
        if (t === 20 && p === 1000 && e === 300 && h === 64) clearInterval(interval);
      }, 20);
      return () => clearInterval(interval);
    }, [aboutStatsAnimated]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [plansGenerated, setPlansGenerated] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [expandedStep, setExpandedStep] = useState(0);

  const heroImages = [
    '/gympic1.jpg',
    '/gympic2.jpg',
    '/gympic3.jpg',
    '/gympic4.jpg',
    '/gympic5.jpg'
  ];

  const featureImages = [
    '/smartAlgorithm.jpg',
    '/personalizedPlan.jpg',
    '/scienceBased.jpg',
    '/instantResults.jpg',
    '/petStreak.jpg',
    '/smartExercise.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 2000); // Faster interval
    return () => clearInterval(interval);
  }, []);

  // Intersection Observer to trigger count animation when section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateNumbers();
          }
        });
      },
      { threshold: 0.3 }
    );

    const statsSection = document.getElementById('stats-section');
    if (statsSection) {
      observer.observe(statsSection);
    }

    return () => {
      if (statsSection) {
        observer.unobserve(statsSection);
      }
    };
  }, [hasAnimated]);

  const animateNumbers = () => {
    // Animate Active Users to 50,000
    let userCount = 0;
    const userInterval = setInterval(() => {
      userCount += 1000;
      if (userCount >= 50000) {
        setActiveUsers(50000);
        clearInterval(userInterval);
      } else {
        setActiveUsers(userCount);
      }
    }, 20);

    // Animate User Rating to 4.9
    let rating = 0;
    const ratingInterval = setInterval(() => {
      rating += 0.1;
      if (rating >= 4.9) {
        setUserRating(4.9);
        clearInterval(ratingInterval);
      } else {
        setUserRating(rating);
      }
    }, 40);

    // Animate Plans Generated to 2,000,000
    let plans = 0;
    const plansInterval = setInterval(() => {
      plans += 40000;
      if (plans >= 2000000) {
        setPlansGenerated(2000000);
        clearInterval(plansInterval);
      } else {
        setPlansGenerated(plans);
      }
    }, 20);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K+';
    }
    return num.toString();
  };

  return (
    <div style={{ backgroundColor: '#ffffff' }}>
      <Navbar />

      {/* Hero Section with Auto-Rotating Image Carousel */}
      <div className="relative min-h-[100vh] flex items-center justify-center pt-20 px-4 overflow-hidden">
        {/* Carousel Background */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1500 ${
                idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={img}
                alt="Fitness"
                fill
                className="object-cover object-center"
                priority={idx === 0}
                loading={idx === 0 ? 'eager' : 'lazy'}
                quality={95}
                sizes="100vw"
              />
            </div>
          ))}
          {/* Overlay - Subtle and professional */}
          <div 
            className="absolute inset-0" 
            style={{ backgroundColor: 'rgba(31, 41, 55, 0.58)' }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Badge className="mb-4 px-4 py-2" style={{ backgroundColor: 'rgba(139, 157, 195, 0.25)', border: '1px solid rgba(139, 157, 195, 0.4)', color: '#FFFFFF' }}>
            AI-Powered Fitness Intelligence
          </Badge>
          <h1 className="text-6xl md:text-7xl font-bold mb-4 leading-tight text-white tracking-tight">
            Your Perfect Workout Plan{' '}
            <span style={{ color: '#9B8B6F' }}>In Seconds</span>
          </h1>
          
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-12 text-gray-100 leading-relaxed">
            Tell us your schedule and fitness goals. FlexFit's intelligent algorithm instantly generates a personalized, science-backed workout plan tailored to your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-block px-8 py-4 rounded-lg transition hover:opacity-90 font-semibold text-lg shadow-lg btn-accent"
              style={{ backgroundColor: '#9B8B6F', color: '#333' }}
            >
              Get Started Free →
            </Link>
            <button
              type="button"
              className="inline-block px-8 py-4 rounded-lg transition hover:opacity-80 font-semibold text-lg btn-accent"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', border: '2px solid rgba(255, 255, 255, 0.3)' }}
              onClick={() => {
                const section = document.getElementById('how-it-works');
                if (section) {
                  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              See How It Works
            </button>
          </div>

          {/* Carousel Indicators */}
          <div className="flex gap-2 justify-center mt-16">
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: idx === currentImageIndex ? '#9B8B6F' : 'rgba(255, 255, 255, 0.4)',
                  width: idx === currentImageIndex ? '24px' : '8px'
                }}
                onClick={() => setCurrentImageIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Trust & Social Proof */}
      <div id="stats-section" className="py-12 px-4" style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-around items-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold" style={{ color: '#9B8B6F' }}>{formatNumber(activeUsers)}</div>
              <p style={{ color: '#6B7280' }}>Active Users</p>
            </div>
            <div>
              <div className="text-3xl font-bold" style={{ color: '#9B8B6F' }}>{userRating > 0 ? userRating.toFixed(1) : '0.0'}/5</div>
              <p style={{ color: '#6B7280' }}>User Rating</p>
            </div>
            <div>
              <div className="text-3xl font-bold" style={{ color: '#9B8B6F' }}>{formatNumber(plansGenerated)}</div>
              <p style={{ color: '#6B7280' }}>Plans Generated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Services Section */}
      <div className="py-20 px-4" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Services Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl md:text-6xl font-bold mb-2" style={{ color: '#1F2937' }}>
                  OUR SERVICES
                </h2>
                <p className="text-lg" style={{ color: '#6B7280' }}>
                  The ultimate digital toolkit to plan, track, and master your workouts.
                </p>
              </div>

              {/* Service Items */}
              <div className="space-y-6">
                {/* Service 1 */}
                <div className="flex items-start gap-4 p-6 rounded-lg transition hover:shadow-md" style={{ backgroundColor: '#F9FAFB' }}>
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E5E1DA' }}>
                    <svg className="w-8 h-8" style={{ color: '#89A8B2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2" style={{ color: '#1F2937' }}>AI-POWERED PLANNING</h3>
                    <p style={{ color: '#6B7280' }}>
                      Our intelligent algorithm analyzes your goals, schedule, and fitness level to generate perfectly optimized workout plans in seconds.
                    </p>
                  </div>
                </div>

                {/* Service 2 */}
                <div className="flex items-start gap-4 p-6 rounded-lg transition hover:shadow-md" style={{ backgroundColor: '#F9FAFB' }}>
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E5E1DA' }}>
                    <svg className="w-8 h-8" style={{ color: '#89A8B2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2" style={{ color: '#1F2937' }}>PROGRESS TRACKING</h3>
                    <p style={{ color: '#6B7280' }}>
                      Track every exercise, monitor your streak, and watch your consistency grow with our gamified progress system and visual feedback.
                    </p>
                  </div>
                </div>

                {/* Service 3 */}
                <div className="flex items-start gap-4 p-6 rounded-lg transition hover:shadow-md" style={{ backgroundColor: '#F9FAFB' }}>
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E5E1DA' }}>
                    <svg className="w-8 h-8" style={{ color: '#89A8B2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2" style={{ color: '#1F2937' }}>EXPERT EXERCISE LIBRARY</h3>
                    <p style={{ color: '#6B7280' }}>
                      Access professionally curated exercises with detailed instructions, proper form guides, sets, reps, and equipment requirements for every fitness level.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="relative h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/tennisPic.jpg"
                alt="Athlete Training"
                fill
                className="object-cover"
                style={{ objectPosition: '50% 10%' }}
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={90}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 px-4 relative overflow-hidden" style={{ backgroundColor: '#E5E7EB' }}>
        <div className="feature-divider feature-divider--top" aria-hidden="true" />
        <div className="feature-divider feature-divider--bottom" aria-hidden="true" />
        <div className="feature-bg-orb feature-bg-orb--one" aria-hidden="true" />
        <div className="feature-bg-gradient" aria-hidden="true" />
        <div className="feature-bg-noise" aria-hidden="true" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <Badge className="mb-5" style={{ backgroundColor: '#4A7BA7', color: '#FFFFFF', border: 'none' }}>
              AI-Driven Performance
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#1F2937' }}>
              Powerful Features for Every Lifter
            </h2>
            <p className="text-lg" style={{ color: '#6B7280' }}>
              From beginners to advanced athletes, FlexFit adapts to your needs
            </p>
          </div>

          {/* Continuous Marquee Images */}
          <div className="relative overflow-hidden mb-16 rounded-2xl" style={{ height: '300px' }}>
            <div className="absolute inset-0 z-10 pointer-events-none" style={{ 
              background: 'linear-gradient(to right, #F9FAFB 0%, transparent 10%, transparent 90%, #F9FAFB 100%)' 
            }} />
            <div className="flex gap-6 animate-marquee">
              {[...featureImages, ...featureImages].map((img, idx) => (
                <div key={idx} className="flex-shrink-0 w-[400px] h-[300px] rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src={img}
                    alt="Fitness Training"
                    width={400}
                    height={300}
                    className="object-cover w-full h-full"
                    quality={85}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: Brain, 
                title: 'Smart Algorithm', 
                desc: 'Our AI analyzes your schedule, experience level, and fitness goals to generate the optimal workout split',
                features: ['Analyzes 1-7 training days', 'Adapts to all experience levels', 'Optimizes for your goals', 'Generates custom splits'],
                gradient: 'linear-gradient(135deg, #4A7BA7 0%, #89A8B2 35%, #C4A962 100%)',
                borderColor: 'border-[#9B8B6F]/20',
                checkColor: '#9B8B6F'
              },
              { 
                icon: ClipboardList, 
                title: 'Personalized Plans', 
                desc: 'Every plan is unique with different exercises, sets, and reps based on your specific needs',
                features: ['30+ exercise database', 'Progressive overload tracking', 'Custom substitutions', 'Adjustable duration'],
                gradient: 'linear-gradient(135deg, #89A8B2 0%, #A8956B 45%, #8B7355 100%)',
                borderColor: 'border-[#A8956B]/20',
                checkColor: '#8B7355'
              },
              { 
                icon: Atom, 
                title: 'Science-Based Training', 
                desc: 'Built on proven training principles, muscle physiology, and recovery science',
                features: ['Evidence-backed selection', 'Optimal volume per muscle', 'Proper frequency', 'Recovery protocols'],
                gradient: 'linear-gradient(135deg, #4A7BA7 0%, #B8A47A 55%, #9B8B6F 100%)',
                borderColor: 'border-[#B8A47A]/20',
                checkColor: '#9B8B6F'
              },
              { 
                icon: Zap, 
                title: 'Instant Results', 
                desc: 'Get your complete personalized workout plan in under 2 minutes',
                features: ['Real-time generation', 'No waiting periods', 'Immediate access', 'Ready to start'],
                gradient: 'linear-gradient(135deg, #4A7BA7 0%, #C4A962 60%, #D4B76E 100%)',
                borderColor: 'border-[#C4A962]/20',
                checkColor: '#C4A962'
              },
              { 
                icon: Flame, 
                title: 'Petflame Streak System', 
                desc: 'Gamified motivation system with evolving flame tiers that reward consistency',
                features: ['4 streak tiers (5-76+ days)', 'Dynamic color evolution', 'Visual celebration effects', 'Consistency tracking'],
                gradient: 'linear-gradient(135deg, #89A8B2 0%, #8B7355 45%, #9B8B6F 100%)',
                borderColor: 'border-[#8B7355]/20',
                checkColor: '#8B7355',
                isSpecial: true
              },
              { 
                icon: RefreshCw, 
                title: 'Smart Exercise Swaps', 
                desc: 'Instantly replace any exercise with intelligent alternatives that target the same muscle groups',
                features: ['Real-time alternatives', 'Muscle group matching', 'Equipment variations', 'Seamless replacements'],
                gradient: 'linear-gradient(135deg, #4A7BA7 0%, #9B8B6F 55%, #B8A47A 100%)',
                borderColor: 'border-[#9B8B6F]/20',
                checkColor: '#9B8B6F'
              }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className={`feature-card-animate feature-card-hover ${idx % 2 === 0 ? 'feature-card-even' : 'feature-card-odd'} p-6 rounded-xl transition hover:shadow-xl duration-300 border relative overflow-hidden ${
                  feature.borderColor || 'border-gray-200'
                }`}
                style={{ animationDelay: `${idx * 120}ms` }}
              >
                {/* Gradient Background for all cards */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: feature.gradient
                  }}
                />
                <div className="absolute inset-0 feature-card-surface" />
                {/* Animated glow effect */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30 animate-pulse"
                  style={{
                    background: feature.gradient
                  }}
                />
                
                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-lg" style={{ background: feature.gradient }}>
                    <feature.icon className="w-7 h-7 text-white feature-icon" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#1F2937' }}>{feature.title}</h3>
                  <p style={{ color: '#6B7280' }} className="text-sm mb-4 leading-relaxed">{feature.desc}</p>
                  <ul className="space-y-2">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#6B7280' }}>
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: feature.checkColor }} strokeWidth={3} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div id="about-us" className="py-24 px-4" style={{ backgroundColor: '#1a1d23' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Media */}
            <div className="relative">
              <div className="relative h-[320px] sm:h-[380px] lg:h-[420px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/dashboardpic.jpg"
                  alt="FlexFit dashboard preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-transparent" />
              </div>

              <div className="mt-8 rounded-2xl p-6 border group hover:border-[#9B8B6F]/30 transition-all duration-500" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <p className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#E5E7EB' }}>
                  <span className="inline-block w-1 h-4 bg-gradient-to-b from-[#60A5FA] to-[#C4A962] rounded-full animate-pulse"></span>
                  Our Skills
                </p>
                {[
                  { label: 'Workout Science', value: '95%', delay: '0ms' },
                  { label: 'Personalization', value: '92%', delay: '150ms' },
                  { label: 'Habit Building', value: '88%', delay: '300ms' },
                  { label: 'Progress Tracking', value: '90%', delay: '450ms' }
                ].map((skill, idx) => (
                  <div 
                    key={idx} 
                    className="mb-4 last:mb-0 group/skill hover:translate-x-1 transition-transform duration-300"
                    style={{
                      animation: `slideInLeft 0.6s ease-out ${skill.delay} both`
                    }}
                  >
                    <div className="flex items-center justify-between text-xs mb-2" style={{ color: '#9CA3AF' }}>
                      <span className="group-hover/skill:text-[#C4A962] transition-colors duration-300">{skill.label}</span>
                      <span className="font-semibold group-hover/skill:text-[#60A5FA] transition-colors duration-300">{skill.value}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden relative" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                      <div
                        className="h-2 rounded-full relative overflow-hidden"
                        style={{
                          width: skill.value,
                          background: 'linear-gradient(135deg, #89A8B2 0%, #4A7BA7 25%, #9B8B6F 50%, #C4A962 75%, #89A8B2 100%)',
                          animation: `expandWidth 1.5s ease-out ${skill.delay} both`
                        }}
                      >
                        {/* Shimmer effect */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover/skill:opacity-100 transition-opacity duration-300"
                          style={{
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                            animation: 'shimmerSlide 2s infinite'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Content */}
            <div>
              <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-4" style={{ color: '#9CA3AF' }}>
                About Us
              </p>
              <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ color: '#F9FAFB' }}>
                We build the{' '}
                <span style={{ 
                  background: 'linear-gradient(135deg, #60A5FA 0%, #89A8B2 50%, #9B8B6F 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  smartest path
                </span>{' '}
                to your{' '}
                <span style={{ 
                  background: 'linear-gradient(135deg, #C4A962 0%, #9B8B6F 50%, #89A8B2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  strongest self.
                </span>
              </h2>
              <p className="text-lg leading-relaxed mb-6" style={{ color: '#D1D5DB' }}>
                FlexFit is your personalized training engine. It blends training science with intelligent automation to generate a plan tailored to your schedule, goals, and experience level in minutes.
              </p>
              <p className="text-lg leading-relaxed mb-6" style={{ color: '#D1D5DB' }}>
                From beginner to advanced lifter, FlexFit adapts your split, exercise selection, and recovery approach so you can stay consistent, track progress, and build real results without guesswork.
              </p>
              <p className="text-lg leading-relaxed mb-8" style={{ color: '#D1D5DB' }}>
                What keeps users coming back? <span style={{ color: '#C4A962' }} className="font-semibold">Petflame</span> — your personal streak companion. This evolving flame pet grows with your consistency, unlocking new versions as you maintain your workout streak. It's the motivational hook that transforms discipline into a rewarding habit you'll actually want to keep.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <button
                  className="px-5 py-3 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:bg-[#C4A962] focus:outline-none focus:ring-2 focus:ring-[#C4A962]"
                  style={{ backgroundColor: '#9B8B6F', color: '#FFFFFF' }}
                >AI-generated plans</button>
                <button
                  className="px-5 py-3 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:bg-[#C4A962] focus:outline-none focus:ring-2 focus:ring-[#C4A962]"
                  style={{ backgroundColor: '#9B8B6F', color: '#FFFFFF' }}
                >Evidence-based methods</button>
                <button
                  className="px-5 py-3 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:bg-[#C4A962] focus:outline-none focus:ring-2 focus:ring-[#C4A962]"
                  style={{ backgroundColor: '#9B8B6F', color: '#FFFFFF' }}
                >Built-in streaks</button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-3xl font-bold" style={{ color: '#F9FAFB' }}>{aboutStats.templates}+</p>
                  <p className="text-sm" style={{ color: '#9CA3AF' }}>Training templates refined</p>
                </div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: '#F9FAFB' }}>{aboutStats.plans.toLocaleString()}+</p>
                  <p className="text-sm" style={{ color: '#9CA3AF' }}>Plans generated weekly</p>
                </div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: '#F9FAFB' }}>{aboutStats.exercises}+</p>
                  <p className="text-sm" style={{ color: '#9CA3AF' }}>Exercise variations</p>
                </div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: '#F9FAFB' }}>{aboutStats.hours}</p>
                  <p className="text-sm" style={{ color: '#9CA3AF' }}>Hours saved per coach</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="relative py-24 px-4 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/howItWorks.jpg" 
            alt="How It Works Background"
            fill
            className="object-cover"
            priority
            style={{ objectPosition: '50% 30%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/80 to-black/75"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 mb-6 px-6 py-2 rounded-full backdrop-blur-md border border-[#9B8B6F]/30" style={{ backgroundColor: 'rgba(155, 139, 111, 0.15)' }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#9B8B6F' }}></div>
              <span className="text-sm font-semibold tracking-wider text-[#E5E1DA]">TAKES JUST 2 MINUTES</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-white tracking-tight">
              How It <span className="bg-gradient-to-r from-[#9B8B6F] to-[#C4A962] bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Four simple steps from zero to your perfect personalized workout plan
            </p>
          </div>

          {/* Interactive Steps Container */}
          <div className="max-w-5xl mx-auto">
            {/* Step Selector Tabs */}
            <div className="flex flex-wrap gap-3 mb-12 justify-center">
              {[
                { 
                  number: 1, 
                  title: 'Tell Us Your Schedule & Goals', 
                  description: 'Share your availability and fitness objectives in seconds',
                  details: ['Select 1-7 training days per week', 'Choose your fitness goal (muscle, strength, or fat loss)', 'Pick your experience level (beginner to advanced)', 'Set your session duration (30-90 minutes)'],
                  icon: Calendar
                },
                { 
                  number: 2, 
                  title: 'AI Generates Your Custom Plan', 
                  description: 'Our intelligent algorithm creates your perfect workout split',
                  details: ['Analyzes 300+ exercise variations', 'Generates optimal workout split', 'Assigns exercises with sets & reps', 'Creates progressive weekly schedule'],
                  icon: Sparkles
                },
                { 
                  number: 3, 
                  title: 'Log & Track Your Progress', 
                  description: 'Track every workout and build your consistency streak',
                  details: ['Log sets, reps, and weights easily', 'Get automatic progression recommendations', 'Build your Petflame Streak', 'Monitor your strength gains'],
                  icon: Target
                },
                { 
                  number: 4, 
                  title: 'Adjust & Optimize Anytime', 
                  description: 'Swap exercises and adapt your plan to your needs',
                  details: ['Instantly swap exercises with alternatives', 'Adjust plan based on feedback', 'Adjust difficulty based on your performance', 'Unlock new Petflame pet versions with consistency'],
                  icon: Dumbbell
                }
              ].map((step, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setExpandedStep(idx)} 
                  className="group relative px-5 py-2.5 rounded-xl transition-all duration-300 font-semibold text-base backdrop-blur-sm overflow-hidden transform hover:scale-105"
                  style={{ 
                    backgroundColor: expandedStep === idx ? 'rgba(155, 139, 111, 0.95)' : 'rgba(255, 255, 255, 0.1)',
                    color: expandedStep === idx ? '#FFFFFF' : '#E5E1DA',
                    border: expandedStep === idx ? '2px solid #9B8B6F' : '2px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: expandedStep === idx ? '0 8px 32px rgba(155, 139, 111, 0.4)' : 'none'
                  }}
                >
                  {expandedStep === idx && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#9B8B6F] to-[#C4A962] opacity-20 animate-pulse"></div>
                  )}
                  <span className="relative z-10">Step {step.number}</span>
                </button>
              ))}
            </div>

            {/* Animated Step Content Card */}
            <div className="relative backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
              {/* Decorative gradient overlay */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#9B8B6F] via-[#C4A962] to-[#9B8B6F]"></div>
              
              <div className="p-10 md:p-14">
                {/* Step Header */}
                <div className="flex items-start gap-6 mb-10">
                  {/* Animated Number Badge */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#9B8B6F] to-[#C4A962] rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl text-white shadow-xl transform transition-transform group-hover:scale-110" style={{ backgroundColor: '#9B8B6F' }}>
                      {[
                        { 
                          number: 1, 
                          title: 'Tell Us Your Schedule & Goals', 
                          description: 'Share your availability and fitness objectives in seconds',
                          details: ['Select 1-7 training days per week', 'Choose your fitness goal (muscle, strength, or fat loss)', 'Pick your experience level (beginner to advanced)', 'Set your session duration (30-90 minutes)'],
                          icon: Calendar
                        },
                        { 
                          number: 2, 
                          title: 'AI Generates Your Custom Plan', 
                          description: 'Our intelligent algorithm creates your perfect workout split',
                          details: ['Analyzes 300+ exercise variations', 'Generates optimal workout split', 'Assigns exercises with sets & reps', 'Creates progressive weekly schedule'],
                          icon: Sparkles
                        },
                        { 
                          number: 3, 
                          title: 'Log & Track Your Progress', 
                          description: 'Track every workout and build your consistency streak',
                          details: ['Log sets, reps, and weights easily', 'Get automatic progression recommendations', 'Build your Petflame Streak', 'Monitor your strength gains'],
                          icon: Target
                        },
                        { 
                          number: 4, 
                          title: 'Adjust & Optimize Anytime', 
                          description: 'Swap exercises and adapt your plan to your needs',
                          details: ['Instantly swap exercises with alternatives', 'Adjust plan based on feedback', 'Adjust difficulty based on your performance', 'Unlock new Petflame pet versions with consistency'],
                          icon: Dumbbell
                        }
                      ][expandedStep].number}
                    </div>
                  </div>

                  {/* Title and Description */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(155, 139, 111, 0.2)' }}>
                        {[
                          { 
                            number: 1, 
                            title: 'Tell Us Your Schedule & Goals', 
                            description: 'Share your availability and fitness objectives in seconds',
                            details: ['Select 1-7 training days per week', 'Choose your fitness goal (muscle, strength, or fat loss)', 'Pick your experience level (beginner to advanced)', 'Set your session duration (30-90 minutes)'],
                            icon: Calendar
                          },
                          { 
                            number: 2, 
                            title: 'AI Generates Your Custom Plan', 
                            description: 'Our intelligent algorithm creates your perfect workout split',
                            details: ['Analyzes 300+ exercise variations', 'Generates optimal workout split', 'Assigns exercises with sets & reps', 'Creates progressive weekly schedule'],
                            icon: Sparkles
                          },
                          { 
                            number: 3, 
                            title: 'Log & Track Your Progress', 
                            description: 'Track every workout and build your consistency streak',
                            details: ['Log sets, reps, and weights easily', 'Get automatic progression recommendations', 'Build your Petflame Streak', 'Monitor your strength gains'],
                            icon: Target
                          },
                          { 
                            number: 4, 
                            title: 'Adjust & Optimize Anytime', 
                            description: 'Swap exercises and adapt your plan to your needs',
                            details: ['Instantly swap exercises with alternatives', 'Adjust plan based on feedback', 'Adjust difficulty based on your performance', 'Unlock new Petflame pet versions with consistency'],
                            icon: Dumbbell
                          }
                        ].map((step, idx) => expandedStep === idx && <step.icon key={idx} size={28} className="text-[#C4A962]" />)}
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black text-white">
                        {[
                          { 
                            number: 1, 
                            title: 'Tell Us Your Schedule & Goals', 
                            description: 'Share your availability and fitness objectives in seconds',
                            details: ['Select 1-7 training days per week', 'Choose your fitness goal (muscle, strength, or fat loss)', 'Pick your experience level (beginner to advanced)', 'Set your session duration (30-90 minutes)'],
                            icon: Calendar
                          },
                          { 
                            number: 2, 
                            title: 'AI Generates Your Custom Plan', 
                            description: 'Our intelligent algorithm creates your perfect workout split',
                            details: ['Analyzes 300+ exercise variations', 'Generates optimal workout split', 'Assigns exercises with sets & reps', 'Creates progressive weekly schedule'],
                            icon: Sparkles
                          },
                          { 
                            number: 3, 
                            title: 'Log & Track Your Progress', 
                            description: 'Track every workout and build your consistency streak',
                            details: ['Log sets, reps, and weights easily', 'Get automatic progression recommendations', 'Build your Petflame Streak', 'Monitor your strength gains'],
                            icon: Target
                          },
                          { 
                            number: 4, 
                            title: 'Adjust & Optimize Anytime', 
                            description: 'Swap exercises and adapt your plan to your needs',
                            details: ['Instantly swap exercises with alternatives', 'Adjust plan based on feedback', 'Adjust difficulty based on your performance', 'Unlock new Petflame pet versions with consistency'],
                            icon: Dumbbell
                          }
                        ][expandedStep].title}
                      </h3>
                    </div>
                    <p className="text-lg text-gray-300 leading-relaxed">
                      {[
                        { 
                          number: 1, 
                          title: 'Tell Us Your Schedule & Goals', 
                          description: 'Share your availability and fitness objectives in seconds',
                          details: ['Select 1-7 training days per week', 'Choose your fitness goal (muscle, strength, or fat loss)', 'Pick your experience level (beginner to advanced)', 'Set your session duration (30-90 minutes)'],
                          icon: Calendar
                        },
                        { 
                          number: 2, 
                          title: 'AI Generates Your Custom Plan', 
                          description: 'Our intelligent algorithm creates your perfect workout split',
                          details: ['Analyzes 300+ exercise variations', 'Generates optimal workout split', 'Assigns exercises with sets & reps', 'Creates progressive weekly schedule'],
                          icon: Sparkles
                        },
                        { 
                          number: 3, 
                          title: 'Log & Track Your Progress', 
                          description: 'Track every workout and build your consistency streak',
                          details: ['Log sets, reps, and weights easily', 'Get automatic progression recommendations', 'Build your Petflame Streak', 'Monitor your strength gains'],
                          icon: Target
                        },
                        { 
                          number: 4, 
                          title: 'Adjust & Optimize Anytime', 
                          description: 'Swap exercises and adapt your plan to your needs',
                          details: ['Instantly swap exercises with alternatives', 'Adjust plan based on feedback', 'Adjust difficulty based on your performance', 'Unlock new Petflame pet versions with consistency'],
                          icon: Dumbbell
                        }
                      ][expandedStep].description}
                    </p>
                  </div>
                </div>

                {/* Feature Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { 
                      number: 1, 
                      title: 'Tell Us Your Schedule & Goals', 
                      description: 'Share your availability and fitness objectives in seconds',
                      details: ['Select 1-7 training days per week', 'Choose your fitness goal (muscle, strength, or fat loss)', 'Pick your experience level (beginner to advanced)', 'Set your session duration (30-90 minutes)'],
                      icon: Calendar
                    },
                    { 
                      number: 2, 
                      title: 'AI Generates Your Custom Plan', 
                      description: 'Our intelligent algorithm creates your perfect workout split',
                      details: ['Analyzes 300+ exercise variations', 'Generates optimal workout split', 'Assigns exercises with sets & reps', 'Creates progressive weekly schedule'],
                      icon: Sparkles
                    },
                    { 
                      number: 3, 
                      title: 'Log & Track Your Progress', 
                      description: 'Track every workout and build your consistency streak',
                      details: ['Log sets, reps, and weights easily', 'Get automatic progression recommendations', 'Build your Petflame Streak', 'Monitor your strength gains'],
                      icon: Target
                    },
                    { 
                      number: 4, 
                      title: 'Adjust & Optimize Anytime', 
                      description: 'Swap exercises and adapt your plan to your needs',
                      details: ['Instantly swap exercises with alternatives', 'Adjust plan based on feedback', 'Adjust difficulty based on your performance', 'Unlock new Petflame pet versions with consistency'],
                      icon: Dumbbell
                    }
                  ][expandedStep].details.map((detail, i) => (
                    <div 
                      key={i} 
                      className="group flex items-start gap-4 p-5 rounded-xl backdrop-blur-sm border border-white/10 transition-all duration-300 hover:border-[#9B8B6F]/50 hover:shadow-lg hover:translate-x-1"
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: 'rgba(155, 139, 111, 0.25)' }}>
                        <span className="text-[#C4A962] text-xl">✓</span>
                      </div>
                      <span className="text-white leading-relaxed flex-1 drop-shadow-lg">{detail}</span>
                    </div>
                  ))}
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center gap-2 mt-10">
                  {[0, 1, 2, 3].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => setExpandedStep(idx)}
                      className="transition-all duration-300"
                    >
                      <div 
                        className="rounded-full transition-all duration-300"
                        style={{
                          width: expandedStep === idx ? '40px' : '12px',
                          height: '12px',
                          backgroundColor: expandedStep === idx ? '#9B8B6F' : 'rgba(255, 255, 255, 0.3)'
                        }}
                      ></div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-16">
              <Link
                href="/signup"
                className="inline-flex items-center gap-1 px-3 py-3 rounded-lg font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
                style={{ backgroundColor: '#9B8B6F', color: '#333' }}
              >
                <span>Get Started Free</span>
                <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 px-4 relative overflow-hidden" style={{ backgroundColor: '#E5E7EB' }}>
        {/* Static Wave Background */}
        <svg className="absolute inset-0 w-full h-full z-0" preserveAspectRatio="none" viewBox="0 0 1200 800" style={{ opacity: 0.25 }}>
          <defs>
            <linearGradient id="blendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'rgba(255, 255, 255, 0)', stopOpacity: 1 }} />
              <stop offset="70%" style={{ stopColor: 'rgba(173, 216, 230, 0)', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'rgba(173, 216, 230, 0.6)', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path fill="rgba(155, 139, 111, 0.6)" d="M0,400 Q300,375 600,400 T1200,400 L1200,800 L0,800 Z"/>
          <path fill="rgba(196, 169, 98, 0.5)" d="M0,420 Q300,405 600,420 T1200,420 L1200,800 L0,800 Z"/>
          <path fill="rgba(96, 165, 250, 0.4)" d="M0,450 Q300,435 600,450 T1200,450 L1200,800 L0,800 Z"/>
          <path fill="rgba(137, 168, 178, 0.35)" d="M0,480 Q300,465 600,480 T1200,480 L1200,800 L0,800 Z"/>
          <rect fill="url(#blendGradient)" width="1200" height="800" />
        </svg>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-6" style={{ backgroundColor: '#9B8B6F', color: '#FFFFFF', border: 'none' }}>
              Trusted by 50,000+ Users
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#1F2937' }}>
              Success Stories from <span style={{ color: '#9B8B6F' }}>FlexFit Users</span>
            </h2>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: '#4B5563' }}>
              Real people, real results. See how FlexFit has transformed thousands of fitness journeys.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Azzural',
                role: 'Game Developer',
                location: 'Poblacion',
                quote: 'FlexFit saved me hours. I used to spend forever planning my workouts. Now I get a perfect plan in 2 minutes. The results speak for themselves.',
                metric: '+45 lbs Muscle Gained',
                metricDesc: 'In 6 months of consistent training',
                rating: 5
              },
              {
                name: 'Grim',
                role: 'Software Engineer  ',
                location: 'Betag',
                quote: 'Finally, a workout plan that fits my hectic schedule! The algorithm understands that I only have 3 days to train. Best investment in my fitness.',
                metric: '+90% Consistency',
                metricDesc: 'Sticking to workouts compared to before',
                rating: 5
              },
              {
                name: 'Vanda Coerulea',
                role: 'Pro Gamer',
                location: 'Camp Dangwa',
                quote: 'The science behind FlexFit is solid. This is what evidence-based training should look like. No fluff, just results.',
                metric: '+60 lbs Strength',
                metricDesc: 'Squat 1RM improvement',
                rating: 5
              },
              {
                name: 'Eidderf',
                role: 'Fitness Blogger',
                location: 'Balili',
                quote: 'I recommend FlexFit to all my followers. The personalization is incredible. Everyone gets a different plan based on their unique situation.',
                metric: '+10K Followers',
                metricDesc: 'After recommending FlexFit',
                rating: 5
              },
              {
                name: 'Shinji',
                role: 'Personal Trainer',
                location: 'Bayabas',
                quote: 'I use FlexFit for my clients. It generates programs faster than I can, and they love the personalization. Game changer for my business.',
                metric: '40% More Clients',
                metricDesc: 'Due to better program quality',
                rating: 5
              },
              {
                name: 'Azzunari',
                role: 'Mom of 2',
                location: 'Poblacion',
                quote: 'As a busy mom, I don\'t have time for complicated fitness routines. FlexFit gets it. Simple, effective, and it actually fits my life.',
                metric: '+35 lbs Lost',
                metricDesc: 'Body composition improvement',
                rating: 5
              }
            ].map((testimonial, idx) => {
              const backgroundImages: Record<string, string> = {
                'Azzural': '/gameDev.jpg',
                'Grim': '/softwareEngr.jpg',
                'Vanda Coerulea': '/proGamer.jpg',
                'Eidderf': '/fitBlogger.jpg',
                'Shinji': '/personalTrainer.jpg',
                'Azzunari': '/mom.jpg'
              };
              
              const hasBackground = testimonial.name in backgroundImages;
              
              return (
                <div key={idx} className="p-8 rounded-lg flex flex-col transition transform hover:scale-105 hover:shadow-xl relative overflow-hidden" style={{ backgroundColor: '#F9FAFB', border: '2px solid #E5E7EB' }}>
                  {/* Background Image */}
                  {hasBackground && (
                    <>
                      <Image
                        src={backgroundImages[testimonial.name]}
                        alt={`${testimonial.role} Background`}
                        fill
                        className="object-cover opacity-60"
                        quality={90}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/75 to-black/70"></div>
                    </>
                  )}

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Stars */}
                    <div className="mb-4 flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} style={{ color: hasBackground ? '#e4bd5c' : '#917648' }} className="text-lg">★</span>
                      ))}
                    </div>

                    {/* Quote */}
                    <p style={{ color: hasBackground ? '#E5E7EB' : '#4B5563', minHeight: '120px' }} className="mb-8 italic text-base">
                      "{testimonial.quote}"
                    </p>

                    {/* Metric Callout */}
                    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: hasBackground ? 'rgba(255, 255, 255, 0.1)' : '#FFFFFF', border: hasBackground ? '2px solid rgba(255, 255, 255, 0.2)' : '2px solid #E5E7EB' }}>
                      <p className="font-bold text-lg" style={{ color: hasBackground ? '#C4A962' : '#9B8B6F' }}>{testimonial.metric}</p>
                      <p className="text-sm" style={{ color: hasBackground ? '#D1D5DB' : '#6B7280' }}>{testimonial.metricDesc}</p>
                    </div>

                    {/* Author */}
                    <div className="border-t pt-4" style={{ borderColor: hasBackground ? 'rgba(255, 255, 255, 0.2)' : '#E5E7EB' }}>
                      <p className="font-bold" style={{ color: hasBackground ? '#FFFFFF' : '#1F2937' }}>{testimonial.name}</p>
                      <p className="text-sm" style={{ color: hasBackground ? '#7BA3D4' : '#6B7280' }}>{testimonial.role}</p>
                      <p className="text-xs" style={{ color: '#dfe1e6' }}>{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Counter and View All Button */}
          <div className="mt-12 text-center">
            <p className="text-sm mb-6 font-bold" style={{ color: '#1F2937' }}>
              Showing 6 of <span style={{ color: '#9B8B6F' }}>1,000+</span> success stories
            </p>
            <button
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{ backgroundColor: '#9B8B6F' }}
            >
              <span>View All Stories</span>
              <span className="text-xl">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-4 pt-32 pb-12" style={{ backgroundColor: '#F9FAFB' }}>
        {/* Footer Content */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Side: Logo + Navigation Columns */}
            <div className="lg:col-span-7">
              <div className="mb-12">
                <Logo />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {/* Features Column */}
                <div>
                  <h4 className="font-bold mb-6 text-xs uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Features</h4>
                  <ul style={{ color: '#6B7280' }} className="space-y-3 text-sm">
                    <li>Smart Algorithm</li>
                    <li>Personalized Plans</li>
                    <li>Science-Based Training</li>
                    <li>Petflame Streak</li>
                    <li>Exercise Swaps</li>
                  </ul>
                </div>

                {/* Learn Column */}
                <div>
                  <h4 className="font-bold mb-6 text-xs uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Learn</h4>
                  <ul style={{ color: '#6B7280' }} className="space-y-3 text-sm">
                    <li>How It Works</li>
                    <li>Testimonials</li>
                    <li>Blog</li>
                    <li>Resources</li>
                    <li>Support</li>
                  </ul>
                </div>

                {/* Evaluate Column */}
                <div>
                  <h4 className="font-bold mb-6 text-xs uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Evaluate</h4>
                  <ul style={{ color: '#6B7280' }} className="space-y-3 text-sm">
                    <li>Pricing</li>
                    <li>Comparison</li>
                    <li>Case Study</li>
                    <li>FAQ</li>
                    <li>Contact</li>
                  </ul>
                </div>

                {/* Company Column */}
                <div>
                  <h4 className="font-bold mb-6 text-xs uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Company</h4>
                  <ul style={{ color: '#6B7280' }} className="space-y-3 text-sm">
                    <li>About</li>
                    <li>Careers</li>
                    <li>Free Trial</li>
                    <li>Contact Sales</li>
                    <li>Sign In</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Side: Start Your Streak CTA */}
            <div className="lg:col-span-5">
              <p className="text-xs uppercase tracking-[0.25em] font-semibold mb-3" style={{ color: '#9CA3AF' }}>
                Start Your Streak
              </p>
              <h4 className="text-2xl font-bold mb-3" style={{ color: '#1F2937' }}>Fuel Your Fire.</h4>
              <p className="text-sm leading-relaxed mb-6" style={{ color: '#6B7280' }}>
                Join the FlexFit community to start your streak and unlock exclusive rewards.
              </p>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-shrink-0">
                  <Flame 
                    size={64} 
                    strokeWidth={1.5}
                    style={{
                      fill: 'url(#fireGradient)',
                      stroke: 'url(#fireGradient)'
                    }}
                  />
                  <svg width="0" height="0">
                    <defs>
                      <linearGradient id="fireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#89A8B2', stopOpacity: 1 }} />
                        <stop offset="25%" style={{ stopColor: '#4A7BA7', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#9B8B6F', stopOpacity: 1 }} />
                        <stop offset="75%" style={{ stopColor: '#C4A962', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#89A8B2', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="flex-1">
                  <Link
                    href="/signup"
                    className="px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition-all duration-300 inline-flex items-center justify-center hover:scale-105 active:scale-95 hover:shadow-lg group"
                    style={{ backgroundColor: '#1F2937' }}
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-300">Build My Workout Plan</span>
                  </Link>
                </div>
              </div>

              {/* Social Media Icons */}
              <div className="flex gap-4">
                <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ color: '#1F2937' }}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </span>
                <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ color: '#1F2937' }}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 4.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm0 2A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5zm5.5-3.25a1.25 1.25 0 1 0 1.25 1.25 1.25 1.25 0 0 0-1.25-1.25z"/></svg>
                </span>
                <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ color: '#1F2937' }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.75 2h-2.6v12.4a3.3 3.3 0 1 1-2.3-3.14V8.6a5.9 5.9 0 1 0 4.9 5.8v-6.1a6.5 6.5 0 0 0 3.6 1.1V6.1a3.7 3.7 0 0 1-3.6-3.6z"/></svg>
                </span>
                <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ color: '#1F2937' }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2H21l-6.52 7.455L22.5 22h-6.6l-5.172-6.74L4.8 22H2l7.02-8.02L1.5 2h6.67l4.67 6.09L18.244 2zm-1.157 18h1.83L7.02 4h-1.9l11.967 16z"/></svg>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Large FlexFit Branding Text */}
        <div className="max-w-6xl mx-auto mb-16 mt-20">
          <h2 className="text-9xl md:text-[10rem] lg:text-[16rem] font-black tracking-[0.1em] leading-none" style={{
            background: 'linear-gradient(135deg, #89A8B2 0%, #4A7BA7 25%, #9B8B6F 50%, #C4A962 75%, #89A8B2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            FlexFit
          </h2>
        </div>

        {/* Bottom Footer */}
        <div className="border-t pt-8" style={{ borderColor: '#E5E7EB' }}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm" style={{ color: '#6B7280' }}>
              © 2026 FlexFit. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" style={{ color: '#6B7280' }} className="hover:text-[#9B8B6F] transition">Privacy Policy</a>
              <a href="#" style={{ color: '#6B7280' }} className="hover:text-[#9B8B6F] transition">Terms & Condition</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
