'use client';

import { WorkoutDay } from '@/types';

interface WorkoutPlanDisplayProps {
  plan: Record<string, WorkoutDay>;
}

// Helper function to get split pattern name based on day index and total days
function getSplitName(dayIndex: number, totalDays: number): string {
  if (totalDays === 1) return 'Full Body';
  if (totalDays === 2) return 'Full Body';
  if (totalDays === 3) {
    const patterns = ['Full Body', 'Upper Body', 'Lower Body'];
    return patterns[dayIndex];
  }
  if (totalDays === 4) {
    const patterns = ['Upper Body', 'Lower Body', 'Upper Body', 'Lower Body'];
    return patterns[dayIndex];
  }
  if (totalDays === 5) {
    const patterns = ['Push', 'Pull', 'Legs', 'Upper Body', 'Lower Body'];
    return patterns[dayIndex];
  }
  // 6+ days: Push Pull Legs cycle
  const patterns = ['Push', 'Pull', 'Legs'];
  return patterns[dayIndex % 3];
}

export function WorkoutPlanDisplay({ plan }: WorkoutPlanDisplayProps) {
  const days = Object.keys(plan);
  const totalDays = days.length;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {days.map((day, index) => {
          const workout = plan[day];
          const splitName = getSplitName(index, totalDays);
          
          return (
            <div
              key={day}
              className="rounded-lg p-6 border transition-all hover:shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.6) 0%, rgba(20, 20, 30, 0.7) 100%)',
                backdropFilter: 'blur(10px)',
                borderColor: 'rgba(196, 169, 98, 0.15)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
              } as any}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>{day}</h3>
                  <p className="text-sm" style={{ color: 'rgba(230, 200, 120, 0.7)' }}>Day {index + 1} of {totalDays}</p>
                </div>
                <span className="px-4 py-2 rounded-lg text-sm font-bold" style={{ backgroundColor: 'rgba(230, 200, 120, 0.2)', color: '#E6C878', border: '1px solid rgba(230, 200, 120, 0.4)' }}>
                  {splitName}
                </span>
              </div>

              <p className="mb-4" style={{ color: 'rgba(230, 200, 120, 0.8)' }}>
                Focus: <span className="font-semibold" style={{ color: '#E6C878' }}>{workout.focus.join(', ')}</span>
              </p>

              <div className="space-y-3">
                {workout.exercises.map((ex, idx) => (
                  <div
                    key={ex.id}
                    className="rounded-lg p-4 flex justify-between items-center transition-all hover:shadow-md border"
                    style={{ 
                      backgroundColor: 'rgba(60, 60, 70, 0.6)',
                      borderColor: 'rgba(230, 200, 120, 0.15)'
                    }}
                  >
                    <div>
                      <p className="font-semibold" style={{ color: '#FFFFFF' }}>{idx + 1}. {ex.name}</p>
                      <p className="text-sm" style={{ color: 'rgba(230, 200, 120, 0.6)' }}>{ex.muscleGroup}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold" style={{ color: '#E6C878' }}>{ex.sets}×{ex.reps}</p>
                      <p className="text-xs" style={{ color: 'rgba(230, 200, 120, 0.6)' }}>{ex.equipment.join(', ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
