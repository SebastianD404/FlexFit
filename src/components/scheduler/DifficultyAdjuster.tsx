'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Loader2 } from 'lucide-react';

interface DifficultyAdjusterProps {
  currentDifficulty: 'beginner' | 'intermediate' | 'advanced';
  workoutId: string;
  onDifficultyChange?: (newDifficulty: 'beginner' | 'intermediate' | 'advanced') => Promise<void>;
}

export function DifficultyAdjuster({
  currentDifficulty,
  workoutId,
  onDifficultyChange,
}: DifficultyAdjusterProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const difficulties: ('beginner' | 'intermediate' | 'advanced')[] = ['beginner', 'intermediate', 'advanced'];
  const currentIndex = difficulties.indexOf(currentDifficulty);

  const handleEasier = async () => {
    if (currentIndex === 0) return;
    const newDifficulty = difficulties[currentIndex - 1];
    await updateDifficulty(newDifficulty);
  };

  const handleHarder = async () => {
    if (currentIndex === difficulties.length - 1) return;
    const newDifficulty = difficulties[currentIndex + 1];
    await updateDifficulty(newDifficulty);
  };

  const updateDifficulty = async (newDifficulty: 'beginner' | 'intermediate' | 'advanced') => {
    if (!onDifficultyChange) return;
    try {
      setLoading(true);
      setError(null);
      await onDifficultyChange(newDifficulty);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-2xl p-6 border transition-all"
      style={{
        background: 'linear-gradient(135deg, rgba(26,26,26,0.8) 0%, rgba(20,20,30,0.9) 100%)',
        borderColor: 'rgba(196,169,98,0.12)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.02)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Adjust Difficulty</h3>
        <span
          className="px-4 py-2 rounded-full text-sm font-semibold capitalize"
          style={{
            background: 'linear-gradient(135deg, rgba(230,200,120,0.15) 0%, rgba(184,147,94,0.12) 100%)',
            color: '#E6C878',
          }}
        >
          {currentDifficulty}
        </span>
      </div>

      <p className="text-gray-400 text-sm mb-6">
        {currentDifficulty === 'beginner' &&
          'You are on beginner level. Increase intensity as you progress!'}
        {currentDifficulty === 'intermediate' &&
          'You are on intermediate level. Push harder or take it easier!'}
        {currentDifficulty === 'advanced' &&
          'You are on advanced level. Great progress! Consider increasing volume or intensity.'}
      </p>

      <div className="flex gap-3">
        <button
          onClick={handleEasier}
          disabled={currentIndex === 0 || loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: currentIndex === 0 ? 'linear-gradient(135deg, rgba(36,36,36,0.6) 0%, rgba(30,30,34,0.6) 100%)' : 'linear-gradient(135deg, rgba(30,30,40,0.6) 0%, rgba(40,40,50,0.65) 100%)',
            color: currentIndex === 0 ? '#8b7f6f' : '#CDE3FF',
            border: `1px solid ${currentIndex === 0 ? 'rgba(139, 127, 111, 0.12)' : 'rgba(100,120,160,0.12)'}`,
          }}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingDown className="w-5 h-5" />}
          Easier
        </button>

        <button
          onClick={handleHarder}
          disabled={currentIndex === difficulties.length - 1 || loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: currentIndex === difficulties.length - 1 ? 'linear-gradient(135deg, rgba(36,36,36,0.6) 0%, rgba(30,30,34,0.6) 100%)' : 'linear-gradient(135deg, rgba(230,200,120,0.12) 0%, rgba(184,147,94,0.12) 100%)',
            color: currentIndex === difficulties.length - 1 ? '#8b7f6f' : '#E6C878',
            border: `1px solid ${currentIndex === difficulties.length - 1 ? 'rgba(139,127,111,0.12)' : 'rgba(230,200,120,0.18)'}`,
          }}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
          Harder
        </button>
      </div>

      {error && (
        <div className="flex gap-2 text-red-300 text-sm p-3 bg-red-600/20 rounded mt-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
