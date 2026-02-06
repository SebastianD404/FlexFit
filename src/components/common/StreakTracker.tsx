'use client';

import { useMemo, useEffect, useState } from 'react';
import { Target, Snowflake } from 'lucide-react';

interface StreakTrackerProps {
  streakCount: number;
  consecutiveSkips?: number;
  triggerAnimation?: boolean;
}

type StreakTier = 'none' | 'orange' | 'red' | 'violet' | 'blue';

const getTier = (count: number): StreakTier => {
  if (count >= 76) return 'blue';
  if (count >= 51) return 'violet';
  if (count >= 21) return 'red';
  if (count >= 5) return 'orange';
  return 'none';
};

export function StreakTracker({ streakCount, consecutiveSkips = 0, triggerAnimation = false }: StreakTrackerProps) {
  const tier = useMemo(() => getTier(streakCount), [streakCount]);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const snowflakes = useMemo(() => {
    if (consecutiveSkips === 0) return [];
    const count = consecutiveSkips * 15; 
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, 
      delay: Math.random() * 5, 
      duration: 3 + Math.random() * 4, 
      size: 4 + Math.random() * 8, 
      opacity: 0.4 + Math.random() * 0.6
    }));
  }, [consecutiveSkips]);

  useEffect(() => {
    if (triggerAnimation) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [triggerAnimation]);

  // --- Tier Style Helpers ---
  
  const getTierOrbColor = (tier: StreakTier) => {
    // Ice overrides everything if frozen
    if (consecutiveSkips >= 3) return 'rgba(180, 220, 255, 0.4)';

    switch (tier) {
      case 'orange': return 'rgba(251, 191, 36, 0.4)';
      case 'red': return 'rgba(239, 68, 68, 0.4)';
      case 'violet': return 'rgba(168, 85, 247, 0.4)';
      case 'blue': return 'rgba(59, 130, 246, 0.4)';
      // FIX: Changed default from dark slate to clear/white to match your "correct" image
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  };

  const getTierParticleColor = (tier: StreakTier) => {
    switch (tier) {
      case 'orange': return { gradient: 'radial-gradient(circle, #fbbf24 0%, #f59e0b 100%)', glow: 'rgba(251, 191, 36, 1)', shadow: 'rgba(251, 191, 36, 0.98)' };
      case 'red': return { gradient: 'radial-gradient(circle, #f87171 0%, #ef4444 100%)', glow: 'rgba(239, 68, 68, 1)', shadow: 'rgba(239, 68, 68, 0.98)' };
      case 'violet': return { gradient: 'radial-gradient(circle, #c084fc 0%, #a855f7 100%)', glow: 'rgba(168, 85, 247, 1)', shadow: 'rgba(168, 85, 247, 0.98)' };
      case 'blue': return { gradient: 'radial-gradient(circle, #60a5fa 0%, #3b82f6 100%)', glow: 'rgba(59, 130, 246, 1)', shadow: 'rgba(59, 130, 246, 0.98)' };
      default: return { gradient: 'radial-gradient(circle, #cbd5e1 0%, #94a3b8 100%)', glow: 'rgba(148, 163, 184, 1)', shadow: 'rgba(148, 163, 184, 0.98)' };
    }
  };

  const getTierGlowVariables = (tier: StreakTier) => {
    if (consecutiveSkips >= 3) {
      return { '--glow-light': 'rgba(190, 230, 255, 0.5)', '--glow-intense': 'rgba(200, 240, 255, 0.8)', '--glow-peak': 'rgba(255, 255, 255, 0.9)' } as any;
    }

    switch (tier) {
      case 'orange': return { '--glow-light': 'rgba(251, 191, 36, 0.85)', '--glow-intense': 'rgba(251, 191, 36, 1)', '--glow-peak': 'rgba(251, 191, 36, 0.8)' } as any;
      case 'red': return { '--glow-light': 'rgba(239, 68, 68, 0.85)', '--glow-intense': 'rgba(239, 68, 68, 1)', '--glow-peak': 'rgba(239, 68, 68, 0.8)' } as any;
      case 'violet': return { '--glow-light': 'rgba(168, 85, 247, 0.85)', '--glow-intense': 'rgba(168, 85, 247, 1)', '--glow-peak': 'rgba(168, 85, 247, 0.8)' } as any;
      case 'blue': return { '--glow-light': 'rgba(59, 130, 246, 0.85)', '--glow-intense': 'rgba(59, 130, 246, 1)', '--glow-peak': 'rgba(59, 130, 246, 0.8)' } as any;
      default: return { '--glow-light': 'rgba(255, 255, 255, 0.5)', '--glow-intense': 'rgba(255, 255, 255, 0.6)', '--glow-peak': 'rgba(255, 255, 255, 0.4)' } as any;
    }
  };

  const getTierEmojiFilter = (tier: StreakTier) => {
    // FIX: Removed the logic that desaturated low tiers. 
    // Now ALL tiers (including 'none') allow the natural orange flame color to show.
    switch (tier) {
      case 'orange': return 'saturate(1.2) hue-rotate(0deg) brightness(1.1)';
      case 'red': return 'saturate(1.6) hue-rotate(10deg) brightness(1.15)';
      case 'violet': return 'saturate(1.8) hue-rotate(260deg) brightness(1.2)';
      case 'blue': return 'saturate(1.8) hue-rotate(200deg) brightness(1.15)';
      // Default: Natural appearance (no greyscale)
      default: return 'saturate(1.0) brightness(1.0)';
    }
  };

  const progressToNext = Math.min((streakCount / (streakCount < 5 ? 5 : streakCount < 21 ? 21 : streakCount < 51 ? 51 : 76)) * 100, 100);

  // --- Freeze Calculation ---
  const iceHeight = consecutiveSkips >= 3 ? '100%' : consecutiveSkips === 2 ? '50%' : consecutiveSkips === 1 ? '25%' : '0%';
  const isFrozen = consecutiveSkips > 0;
  
  const borderColor = isFrozen 
    ? 'rgba(165, 243, 252, 0.5)' 
    : `rgba(${tier === 'orange' ? '251, 191, 36' : tier === 'red' ? '239, 68, 68' : tier === 'violet' ? '168, 85, 247' : tier === 'blue' ? '59, 130, 246' : '148, 163, 184'}, 0.3)`;

  const shadowColor = isFrozen
    ? 'rgba(165, 243, 252, 0.25)' 
    : `rgba(${tier === 'orange' ? '251, 191, 36' : tier === 'red' ? '239, 68, 68' : tier === 'violet' ? '168, 85, 247' : tier === 'blue' ? '59, 130, 246' : '0, 0, 0'}, ${tier === 'none' ? '0.12' : '0.15'})`;

  return (
    <div className="w-full max-w-2xl mx-auto relative" style={{ overflow: 'visible' }}>
      <div 
        className={`relative rounded-2xl border transition-all duration-500 p-6 shadow-2xl ${isAnimating ? 'streak-burst' : ''} ${isFrozen ? 'freeze-overlay' : ''}`} 
        style={{ 
          overflow: 'visible', 
          background: isFrozen 
            ? 'linear-gradient(135deg, rgba(20, 30, 45, 0.95) 0%, rgba(30, 45, 60, 0.95) 100%)' 
            : 'linear-gradient(135deg, rgba(26, 26, 26, 0.85) 0%, rgba(20, 20, 30, 0.9) 100%)',
          backdropFilter: 'blur(20px)', 
          WebkitBackdropFilter: 'blur(20px)', 
          borderColor: borderColor,
          boxShadow: `0 8px 32px ${shadowColor}` 
        }}
      >
        {isFrozen && <div className="absolute inset-0 rounded-2xl pointer-events-none frost-texture opacity-30 mix-blend-overlay"></div>}

        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
            {snowflakes.map((snow) => (
                <div 
                    key={snow.id} 
                    className="absolute text-white select-none animate-fall"
                    style={{
                        left: `${snow.left}%`,
                        top: '-20px',
                        opacity: snow.opacity,
                        fontSize: `${snow.size}px`,
                        animationDuration: `${snow.duration}s`,
                        animationDelay: `${snow.delay}s`,
                        textShadow: '0 0 5px rgba(255,255,255,0.8)'
                    }}
                >
                    ❄
                </div>
            ))}
        </div>

        <div 
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 animate-pulse" 
          style={{ background: getTierOrbColor(tier) }} 
        />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-3" style={{ color: '#888888' }}>Your Consistency</p>
            {isFrozen && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-400/30">
                    <Snowflake className="w-3 h-3 text-blue-300" />
                    <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Freezing</span>
                </div>
            )}
          </div>
          
          {consecutiveSkips > 0 && (
            <div className={`mb-4 p-3 rounded-xl relative overflow-hidden transition-all duration-500`} style={{ 
                background: consecutiveSkips >= 3 ? 'rgba(50, 70, 90, 0.8)' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.15) 100%)', 
                border: '1px solid rgba(147, 197, 253, 0.4)' 
            }}>
              <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at top right, rgba(96, 165, 250, 0.3) 0%, transparent 60%)' }}></div>
              <p className="text-sm font-semibold flex items-center justify-center gap-2.5 relative z-10 text-center" style={{ color: '#93C5FD' }}>
                {consecutiveSkips === 1 && "You missed 1 day - Your streak is cooling down! ❄️"}
                {consecutiveSkips === 2 && "You missed 2 days - Your streak is partially frozen! 🧊"}
                {consecutiveSkips >= 3 && "Streak Frozen! 🥶 Complete exercises to thaw."}
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-5 mb-4">
            <div className="relative overflow-visible" style={{ width: '72px', height: '72px' }}>
              <div className="absolute inset-0 blur-xl opacity-40 animate-pulse" style={{ background: getTierOrbColor(tier) }}></div>
              
              {isAnimating && (() => {
                const particleColor = getTierParticleColor(tier);
                return (
                  <>
                    {[...Array(8)].map((_, i) => (
                         <div key={`p${i}`} className="streak-particle" style={{ 
                             '--tx': `${Math.cos(i * 45 * Math.PI / 180) * 300}px`, 
                             '--ty': `${Math.sin(i * 45 * Math.PI / 180) * 300}px`, 
                             background: particleColor.gradient, 
                             boxShadow: `0 0 36px ${particleColor.glow}` 
                         } as any}></div>
                    ))}
                  </>
                );
              })()} 
              
              <div className={`streak-flame ${tier === 'orange' ? 'streak-orange' : tier === 'red' ? 'streak-red' : tier === 'violet' ? 'streak-violet' : tier === 'blue' ? 'streak-blue' : 'streak-none'} ${isAnimating ? 'animate-bounce' : ''}`} style={getTierGlowVariables(tier)}>
                {/* Fire emoji background */}
                <div className="streak-emoji" style={{ filter: getTierEmojiFilter(tier) }}>🔥</div>

                {consecutiveSkips > 0 && (
                    <div 
                        className="absolute bottom-0 left-0 right-0 z-20 rounded-full transition-all duration-700 ease-in-out border-t border-white/40"
                        style={{ 
                            height: iceHeight, 
                            width: '100%',
                            background: 'linear-gradient(to top, rgba(180, 230, 255, 0.85) 0%, rgba(220, 245, 255, 0.6) 100%)',
                            backdropFilter: 'blur(3px)',
                            boxShadow: 'inset 0 0 10px rgba(255,255,255,0.6), 0 0 15px rgba(100, 200, 255, 0.4)',
                            maskImage: 'linear-gradient(to top, black 90%, transparent 100%)',
                            clipPath: 'circle(42% at 50% 50%)'
                        }}
                    >
                        <div className="absolute top-2 left-2 w-3 h-3 bg-white opacity-60 rounded-full blur-[1px]"></div>
                    </div>
                )}
                
                {/* Cute face */}
                <div className="streak-face">
                  <div className="eye left"></div>
                  <div className="eye right"></div>
                  <svg className="mouth-svg" width="20" height="8" viewBox="0 0 20 8" fill="none">
                    <path d={consecutiveSkips > 0 ? "M2 6C2 6 6 2 10 2C14 2 18 6 18 6" : "M2 2C2 2 6 6 10 6C14 6 18 2 18 2"} stroke="#0f172a" strokeWidth="2" strokeLinecap="round" opacity="0.75"/>
                  </svg>
                </div>
                
                {/* Waving arms */}
                <div className="streak-arm left"></div>
                <div className="streak-arm right"></div>

                {/* Speech bubble */}
                {consecutiveSkips > 0 && (
                  <div className="speech-bubble">
                    Help
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 relative z-10">
              <div className="flex items-baseline gap-2.5">
                <h2 className={`text-5xl font-black drop-shadow-lg transition-all ${isAnimating ? 'scale-110' : ''}`} style={{ 
                    color: consecutiveSkips >= 3 
                        ? '#93C5FD' 
                        : tier === 'orange' ? '#FCD34D' : tier === 'red' ? '#F87171' : tier === 'violet' ? '#C084FC' : tier === 'blue' ? '#60A5FA' : '#94A3B8' 
                }}>
                    {streakCount}
                </h2>
                <span className="text-lg font-bold" style={{ color: '#C0C0C0' }}>day streak</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-1.5 w-fit relative z-10"> 
              <span className="text-[10px] uppercase font-bold tracking-widest leading-none" style={{ color: '#666666' }}>Tier</span>
              <span className={`px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-md`} style={{ 
                  background: isFrozen 
                    ? 'rgba(147, 197, 253, 0.1)' 
                    : `linear-gradient(135deg, ${tier === 'orange' ? 'rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.25)' : tier === 'red' ? 'rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.25)' : tier === 'violet' ? 'rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.25)' : tier === 'blue' ? 'rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.25)' : 'rgba(148, 163, 184, 0.2), rgba(100, 116, 139, 0.25)'})`, 
                  color: isFrozen ? '#93C5FD' : tier === 'orange' ? '#FCD34D' : tier === 'red' ? '#F87171' : tier === 'violet' ? '#C084FC' : tier === 'blue' ? '#60A5FA' : '#94A3B8', 
                  border: isFrozen ? '1px solid rgba(147, 197, 253, 0.3)' : `1px solid rgba(${tier === 'orange' ? '251, 191, 36' : tier === 'red' ? '239, 68, 68' : tier === 'violet' ? '168, 85, 247' : tier === 'blue' ? '59, 130, 246' : '148, 163, 184'}, 0.4)` 
              }}>
                {tier === 'none' ? 'New' : tier.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="mb-4 space-y-2 relative z-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold" style={{ color: '#C0C0C0' }}>Next Tier Progress</span>
              <span className="text-xs font-bold" style={{ color: '#888888' }}>{Math.floor(progressToNext)}%</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden relative" style={{ background: 'rgba(26, 26, 26, 0.6)', border: '1px solid rgba(100, 100, 110, 0.3)' }}>
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressToNext}%`,
                  background: isFrozen 
                    ? 'linear-gradient(90deg, #60A5FA 0%, #93C5FD 100%)' 
                    : tier === 'orange' 
                    ? 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)' 
                    : tier === 'red' 
                    ? 'linear-gradient(90deg, #DC2626 0%, #EF4444 100%)'
                    : tier === 'violet'
                    ? 'linear-gradient(90deg, #9333EA 0%, #A855F7 100%)'
                    : tier === 'blue'
                    ? 'linear-gradient(90deg, #2563EB 0%, #3B82F6 100%)'
                    : 'linear-gradient(90deg, #64748B 0%, #94A3B8 100%)',
                  boxShadow: `0 0 10px rgba(${isFrozen ? '147, 197, 253' : tier === 'orange' ? '251, 191, 36' : tier === 'red' ? '239, 68, 68' : tier === 'violet' ? '168, 85, 247' : tier === 'blue' ? '59, 130, 246' : '148, 163, 184'}, 0.4)`
                }}
              />
            </div>
          </div>

          <div className="mb-3 h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(100, 100, 110, 0.3) 50%, transparent 100%)' }} />

          <p className="text-xs leading-relaxed text-center flex items-center justify-center gap-2 relative z-10" style={{ color: '#888888' }}>
            <Target className="w-3.5 h-3.5" style={{ color: '#A0A0A0' }} />
            Complete all exercises to extend your streak and unlock new tiers
          </p>
        </div>
      </div>

      <style jsx>{`
        .streak-flame { position: relative; width:68px; height:70px; display:flex; align-items:center; justify-content:center; }
        .streak-emoji { font-size:38px; line-height:1; }
        .streak-face { position:absolute; display:flex; align-items:center; justify-content:center; flex-direction:row; pointer-events:none; gap: 0; }
        .streak-face .eye { width:7px; height:7px; border-radius:50%; background: #0f172a; margin: 0 5px; }
        .streak-arm { position:absolute; width:10px; height:24px; background: rgba(19, 18, 18, 0.6); border-radius: 8px; animation: wave 600ms ease-in-out infinite; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
        .streak-arm.left { left:-8px; top:15px; transform-origin: right center; animation-name: wave-left; }
        .streak-arm.right { right:-8px; top:15px; transform-origin: left center; animation-name: wave-right; }

        .streak-particle { position:absolute; width:12px; height:12px; border-radius:50%; opacity:0.95; transform:translate(0,0) scale(0.6); animation: particle-zoom 650ms ease-out forwards; }
        @keyframes particle-zoom { to { transform: translate(var(--tx), var(--ty)) scale(1.1); opacity: 0; } }

        @keyframes fall {
            0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
            50% { transform: translateY(100px) translateX(10px) rotate(180deg); }
            100% { transform: translateY(300px) translateX(-10px) rotate(360deg); }
        }
        
        .animate-fall {
            animation-name: fall;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
        }

        .frost-texture {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E");
            opacity: 0.15;
        }

        @keyframes wave-left {
            0% { transform: rotate(0deg); }
            50% { transform: rotate(-35deg); }
            100% { transform: rotate(0deg); }
        }

        @keyframes wave-right {
            0% { transform: rotate(0deg); }
            50% { transform: rotate(35deg); }
            100% { transform: rotate(0deg); }
        }

        .speech-bubble {
            position: absolute;
            top: -40px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            color: #0f172a;
            padding: 6px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            z-index: 50;
            animation: bubble-pop 2s ease-in-out infinite;
        }

        .speech-bubble::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 8px solid white;
        }

        @keyframes bubble-pop {
            0%, 100% { 
                transform: scale(1) translateY(0px);
                opacity: 1;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            }
            50% { 
                transform: scale(1.1) translateY(-5px);
                opacity: 0.9;
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
            }
        }
      `}</style>
    </div>
  );
}