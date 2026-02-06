'use client';

import { useState } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DaySelectorProps {
  onDaysSelect: (days: string[]) => void;
}

export function DaySelector({ onDaysSelect }: DaySelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (day: string) => {
    const updated = selected.includes(day)
      ? selected.filter((d) => d !== day)
      : [...selected, day];
    setSelected(updated);
    onDaysSelect(updated);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-7 gap-3">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => toggle(day)}
            className={`
              py-3 px-3 rounded-2xl font-semibold transition-transform duration-200 text-sm flex items-center justify-center
              ${selected.includes(day) ? 'shadow-2xl scale-105' : 'hover:shadow-md hover:brightness-105 hover:-translate-y-1 active:scale-95'}
            `}
            style={{
              background: selected.includes(day)
                ? 'linear-gradient(135deg, rgba(230, 200, 120, 0.95) 0%, rgba(200, 160, 80, 1) 100%)'
                : 'linear-gradient(135deg, rgba(18,18,20,0.7) 0%, rgba(26,26,30,0.7) 100%)',
              border: selected.includes(day) ? '1px solid rgba(230,200,120,0.45)' : '1px solid rgba(196,169,98,0.12)',
              color: selected.includes(day) ? '#111' : '#E6C878',
            }}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      <div className="rounded-2xl p-4 border" style={{ background: 'linear-gradient(135deg, rgba(20,20,24,0.6) 0%, rgba(18,18,20,0.6) 100%)', borderColor: 'rgba(196,169,98,0.08)' }}>
        <p style={{ color: '#E6C878' }}>
          <span className="font-bold">{selected.length} day{selected.length !== 1 ? 's' : ''} selected</span>
          {selected.length > 0 && `: ${selected.join(', ')}`}
        </p>
      </div>
    </div>
  );
}
