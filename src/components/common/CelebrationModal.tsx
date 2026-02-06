'use client';

import { useState, useEffect } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { X, Sparkles } from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onKeepGoing?: () => void;
}

export function CelebrationModal({ isOpen, onClose, title, message, onKeepGoing }: CelebrationModalProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number }>>([]);

  useEffect(() => {
    if (isOpen) {
      // Generate confetti particles
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
      }));
      setConfetti(particles);
    }
  }, [isOpen]);

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onClose}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40" />
        <AlertDialog.Content className="celebration-shell fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-3xl rounded-3xl z-50 overflow-hidden">
          <div className="celebration-aurora" />
          <div className="celebration-border" />

          {/* Confetti */}
          {confetti.map((particle) => (
            <div
              key={particle.id}
              className="celebration-confetti"
              style={{
                left: `${particle.left}%`,
                animationDelay: `${particle.delay}s`,
                background: ['#fbbf24', '#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#a855f7'][
                  particle.id % 6
                ],
              }}
            />
          ))}

          {/* Close Button */}
          <div className="absolute top-5 right-5 z-10">
            <AlertDialog.Cancel asChild>
              <button className="celebration-close">
                <X className="w-5 h-5" />
              </button>
            </AlertDialog.Cancel>
          </div>

          {/* Floating Orbs */}
          <div className="celebration-orbs">
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />
          </div>

          {/* Content */}
          <div className="relative px-10 py-14 text-center space-y-6">
            {/* Icon + Ring */}
            <div className="flex justify-center mb-2">
              <div className="celebration-ring">
                <Sparkles className="w-14 h-14 text-amber-300" />
              </div>
            </div>

            {/* Title */}
            <AlertDialog.Title className="celebration-title">
              {title}
            </AlertDialog.Title>

            {/* Message */}
            <p className="text-lg text-slate-200/90 leading-relaxed max-w-xl mx-auto">
              {message}
            </p>

            {/* Stats */}
            <div className="celebration-stats">
              <div className="stat-block">
                <div className="stat-number">100%</div>
                <div className="stat-label">COMPLETION</div>
              </div>
              <div className="stat-divider" />
              <div className="stat-block">
                <div className="stat-number">🔥</div>
                <div className="stat-label">ON FIRE</div>
              </div>
              <div className="stat-divider" />
              <div className="stat-block">
                <div className="stat-number">+XP</div>
                <div className="stat-label">LEGENDARY</div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2">
              <AlertDialog.Cancel asChild>
                <button 
                  className="celebration-cta"
                  onClick={() => {
                    if (onKeepGoing) {
                      onKeepGoing();
                    }
                  }}
                >
                  Keep Going! 💪
                </button>
              </AlertDialog.Cancel>
            </div>
          </div>

          <div className="celebration-bottom" />
        </AlertDialog.Content>
      </AlertDialog.Portal>

      <style>{`
        @keyframes celebrationFall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes celebrationFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes celebrationPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes celebrationGlow {
          0%, 100% { box-shadow: 0 0 24px rgba(251, 191, 36, 0.25); }
          50% { box-shadow: 0 0 48px rgba(251, 191, 36, 0.5); }
        }
        @keyframes celebrationSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes celebrationShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .celebration-shell {
          background: linear-gradient(135deg, rgba(10,12,20,0.98), rgba(12,18,30,0.98));
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 30px 80px rgba(0,0,0,0.55), 0 0 60px rgba(251,191,36,0.15);
        }
        .celebration-aurora {
          position: absolute;
          inset: -40%;
          background: radial-gradient(circle at 20% 20%, rgba(251,191,36,0.18), transparent 45%),
                      radial-gradient(circle at 80% 30%, rgba(59,130,246,0.12), transparent 45%),
                      radial-gradient(circle at 50% 80%, rgba(168,85,247,0.12), transparent 45%);
          animation: celebrationShimmer 8s ease infinite;
        }
        .celebration-border {
          position: absolute;
          inset: 6px;
          border-radius: 1.5rem;
          border: 2px solid rgba(251,191,36,0.35);
          box-shadow: inset 0 0 30px rgba(251,191,36,0.1);
          pointer-events: none;
          animation: celebrationGlow 3s ease-in-out infinite;
        }
        .celebration-confetti {
          position: absolute;
          top: -10px;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          opacity: 0.9;
          animation: celebrationFall 3.2s linear infinite;
        }
        .celebration-close {
          padding: 0.5rem;
          border-radius: 0.75rem;
          background: rgba(15,23,42,0.7);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.7);
          transition: all 160ms ease;
        }
        .celebration-close:hover {
          color: white;
          background: rgba(30,41,59,0.9);
          transform: scale(1.05);
        }
        .celebration-orbs .orb {
          position: absolute;
          border-radius: 999px;
          filter: blur(20px);
          opacity: 0.6;
          animation: celebrationFloat 4s ease-in-out infinite;
        }
        .celebration-orbs .orb-1 {
          width: 120px; height: 120px; left: -30px; top: 40px;
          background: rgba(251,191,36,0.25);
        }
        .celebration-orbs .orb-2 {
          width: 160px; height: 160px; right: -40px; top: 140px;
          background: rgba(59,130,246,0.2);
          animation-delay: 0.8s;
        }
        .celebration-orbs .orb-3 {
          width: 140px; height: 140px; left: 30%; bottom: -40px;
          background: rgba(168,85,247,0.18);
          animation-delay: 1.4s;
        }
        .celebration-ring {
          width: 90px;
          height: 90px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(251,191,36,0.5);
          box-shadow: 0 0 30px rgba(251,191,36,0.3);
          animation: celebrationSpin 8s linear infinite;
          background: radial-gradient(circle at 30% 30%, rgba(251,191,36,0.25), transparent 60%);
        }
        .celebration-title {
          font-size: clamp(2rem, 4vw, 3.4rem);
          font-weight: 900;
          background: linear-gradient(90deg, #fbbf24, #fb923c, #f97316);
          -webkit-background-clip: text;
          color: transparent;
          text-shadow: 0 10px 30px rgba(251,191,36,0.25);
          letter-spacing: 0.04em;
          animation: celebrationPulse 2.2s ease-in-out infinite;
        }
        .celebration-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.75rem;
          align-items: center;
          margin-top: 0.5rem;
        }
        .stat-block {
          background: rgba(15,23,42,0.55);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 1rem;
          padding: 0.75rem 0.5rem;
        }
        .stat-number {
          font-size: 1.5rem;
          font-weight: 800;
          color: #fbbf24;
        }
        .stat-label {
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.5);
          margin-top: 0.25rem;
        }
        .stat-divider {
          width: 1px;
          height: 70%;
          background: rgba(255,255,255,0.1);
          justify-self: center;
        }
        .celebration-cta {
          padding: 0.85rem 2.5rem;
          border-radius: 0.9rem;
          font-weight: 800;
          color: #1f1304;
          background: linear-gradient(90deg, #fbbf24, #fb923c, #f97316);
          box-shadow: 0 12px 30px rgba(251,191,36,0.35);
          transition: transform 180ms ease, box-shadow 180ms ease;
        }
        .celebration-cta:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 18px 36px rgba(251,191,36,0.45);
        }
        .celebration-bottom {
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(251,191,36,0.6), transparent);
          opacity: 0.7;
        }
      `}</style>
    </AlertDialog.Root>
  );
}
