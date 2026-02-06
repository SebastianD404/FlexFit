'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardCard } from '@/components/layout/DashboardCard';
import { ExerciseCard } from '@/components/scheduler/ExerciseCard';
import { DifficultyAdjuster } from '@/components/scheduler/DifficultyAdjuster';
import { useAuth } from '@/lib/hooks';
import { WorkoutPlan, Exercise } from '@/types';
import { getWorkoutPlan, updateWorkoutPlan } from '@/lib/firebase/db';
import { generalizeFocus } from '@/lib/algorithms/scheduler';

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const workoutId = params.id as string;

  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [addingExerciseForDay, setAddingExerciseForDay] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkout = async () => {
      try {
        if (!workoutId) return;
        const data = await getWorkoutPlan(workoutId);
        if (!data) {
          setError('Workout plan not found. It may have been deleted.');
        } else {
          setWorkout(data);
        }
      } catch (err) {
        setError((err as Error).message);
        console.error('Failed to load workout:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWorkout();
  }, [workoutId]);

  // Deduplicate exercises when workout loads
  useEffect(() => {
    if (!workout?.plan || !workout?.id) return;

    const dedupedPlan = { ...workout.plan };
    let hasDuplicates = false;

    Object.keys(dedupedPlan).forEach((dayName) => {
      const day = dedupedPlan[dayName];
      const seenIds = new Set<string>();
      const originalLength = day.exercises.length;

      day.exercises = day.exercises.filter((exercise) => {
        if (seenIds.has(exercise.id)) {
          console.warn(`Removing duplicate exercise ${exercise.id} from ${dayName}`);
          hasDuplicates = true;
          return false;
        }
        seenIds.add(exercise.id);
        return true;
      });

      if (day.exercises.length < originalLength) {
        hasDuplicates = true;
      }
    });

    // Update state and Firestore if duplicates were found
    if (hasDuplicates) {
      setWorkout({ ...workout, plan: dedupedPlan });
      updateWorkoutPlan(workoutId, { plan: dedupedPlan }).catch((err) =>
        console.error('Failed to save deduplicated plan:', err)
      );
    }
  }, [workout?.id, workoutId]);

  const handleMarkComplete = async (exerciseId: string) => {
    if (!workout) return;
    try {
      setUpdating(true);
      const updatedStatus = {
        ...workout.exerciseStatus,
        [exerciseId]: {
          ...(workout.exerciseStatus?.[exerciseId] || {
            exerciseId,
            completed: false,
            timesCompleted: 0,
          }),
          completed: true,
          completedDate: new Date(),
          timesCompleted: (workout.exerciseStatus?.[exerciseId]?.timesCompleted || 0) + 1,
        },
      };

      await updateWorkoutPlan(workoutId, {
        exerciseStatus: updatedStatus,
      });

      setWorkout({ ...workout, exerciseStatus: updatedStatus });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  const handleChangeExercise = async (oldExerciseId: string, newExercise: Exercise) => {
    if (!workout) return;
    try {
      setUpdating(true);
      // Update local state - replace exercise in plan
      const updatedPlan = { ...workout.plan };
      for (const day in updatedPlan) {
        updatedPlan[day].exercises = updatedPlan[day].exercises.map((ex) =>
          ex.id === oldExerciseId ? newExercise : ex
        );
      }

      await updateWorkoutPlan(workoutId, {
        plan: updatedPlan,
      });

      setWorkout({ ...workout, plan: updatedPlan });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddExercise = async (dayName: string, afterExerciseId: string, newExercise: Exercise) => {
    if (!workout) return;
    try {
      setUpdating(true);
      const updatedPlan = { ...workout.plan };
      if (updatedPlan[dayName]) {
        const exercises = [...updatedPlan[dayName].exercises];
        
        // Check if exercise already exists in this day
        if (exercises.some((ex) => ex.id === newExercise.id)) {
          setError(`Exercise already exists in ${dayName}`);
          return;
        }
        
        const insertIndex = exercises.findIndex((ex) => ex.id === afterExerciseId);
        const nextIndex = insertIndex >= 0 ? insertIndex + 1 : exercises.length;
        exercises.splice(nextIndex, 0, newExercise);
        updatedPlan[dayName].exercises = exercises;
      }

      await updateWorkoutPlan(workoutId, {
        plan: updatedPlan,
      });

      setWorkout({ ...workout, plan: updatedPlan });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteExercise = async (dayName: string, exerciseId: string) => {
    if (!workout) return;
    try {
      setUpdating(true);
      const updatedPlan = { ...workout.plan };
      if (updatedPlan[dayName]) {
        updatedPlan[dayName].exercises = updatedPlan[dayName].exercises.filter((ex) => ex.id !== exerciseId);
      }

      const updatedStatus = { ...(workout.exerciseStatus || {}) };
      delete updatedStatus[`${dayName}-${exerciseId}`];

      await updateWorkoutPlan(workoutId, {
        plan: updatedPlan,
        exerciseStatus: updatedStatus,
      });

      setWorkout({ ...workout, plan: updatedPlan, exerciseStatus: updatedStatus });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDifficultyChange = async (newDifficulty: 'beginner' | 'intermediate' | 'advanced') => {
    if (!workout) return;
    try {
      setUpdating(true);
      await updateWorkoutPlan(workoutId, {
        difficulty: newDifficulty,
      });

      setWorkout({ ...workout, difficulty: newDifficulty });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Loading..." subtitle="Fetching your workout plan...">
        <DashboardCard variant="accent" className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mb-4 mx-auto" color="#d4c4a0" />
            <p className="text-amber-100 text-lg">Loading workout details...</p>
          </div>
        </DashboardCard>
      </DashboardLayout>
    );
  }

  if (!workout) {
    return (
      <DashboardLayout title="Workout Not Found" subtitle={error || "This workout plan doesn't exist"}>
        <DashboardCard variant="accent" className="text-center py-12">
          {error && (
            <div className="bg-red-900/20 border border-red-600/50 text-red-200 px-6 py-4 rounded-xl flex items-center gap-3 mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-amber-950 rounded-lg font-semibold hover:from-amber-700 hover:to-yellow-600 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </DashboardCard>
      </DashboardLayout>
    );
  }

  const workoutDays = Object.entries(workout.plan);

  return (
    <DashboardLayout
      title={workout.name || 'My Workout Plan'}
      subtitle={`Created on ${new Date(workout.createdAt).toLocaleDateString()}`}
    >
      {error && (
        <div className="bg-red-900/20 border border-red-600/50 text-red-200 px-6 py-4 rounded-xl flex items-center gap-3 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Difficulty Adjuster */}
      <DifficultyAdjuster
        currentDifficulty={workout.difficulty || 'intermediate'}
        workoutId={workoutId}
        onDifficultyChange={handleDifficultyChange}
      />

      {/* Workout Days */}
      <div className="grid gap-6">
        {workoutDays.map(([dayName, dayPlan]) => (
          <div 
            key={dayName}
            className="rounded-2xl p-6 relative overflow-hidden group transition-all duration-500"
            style={{ background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.85) 0%, rgba(20, 20, 30, 0.9) 100%)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(196, 169, 98, 0.2)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)' }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 12px 40px rgba(196, 169, 98, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)'}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at top right, rgba(196, 169, 98, 0.05) 0%, transparent 60%)' }}></div>
            
            <div className="relative z-10">
              {/* Day Header */}
              <div className="mb-6 pb-4 border-b flex justify-between items-start" style={{ borderColor: 'rgba(196, 169, 98, 0.2)' }}>
                <div>
                  <h3 className="text-2xl font-bold mb-2 uppercase tracking-wide" style={{ color: '#FFFFFF' }}>{dayName.charAt(0).toUpperCase()}{dayName.slice(1)} Workout</h3>
                  <p className="text-sm" style={{ color: '#A0A0A0' }}>Focus: <span style={{ color: '#E6C878' }}>{generalizeFocus(dayPlan.focus).join(', ')}</span></p>
                </div>
                <button
                  onClick={() => setAddingExerciseForDay(dayName)}
                  className="px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ml-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(110, 231, 183, 0.2) 0%, rgba(52, 211, 153, 0.15) 100%)',
                    color: '#6EE7B7',
                    border: '1px solid rgba(110, 231, 183, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(110, 231, 183, 0.3) 0%, rgba(52, 211, 153, 0.25) 100%)';
                    e.currentTarget.style.borderColor = 'rgba(110, 231, 183, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(110, 231, 183, 0.2) 0%, rgba(52, 211, 153, 0.15) 100%)';
                    e.currentTarget.style.borderColor = 'rgba(110, 231, 183, 0.3)';
                  }}
                >
                  + Add Exercise
                </button>
              </div>

              {/* Exercises */}
              <div className="space-y-4">
                {dayPlan.exercises.map((exercise, index) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    dayName={dayName}
                    isCompleted={workout.exerciseStatus?.[exercise.id]?.completed || false}
                    onMarkComplete={() => handleMarkComplete(exercise.id)}
                    onChangeExercise={(newExercise) => handleChangeExercise(exercise.id, newExercise)}
                    onAddExercise={addingExerciseForDay === dayName && index === 0 ? async (newExercise) => {
                      await handleAddExercise(dayName, exercise.id, newExercise);
                      setAddingExerciseForDay(null);
                    } : undefined}
                    onDeleteExercise={() => handleDeleteExercise(dayName, exercise.id)}
                    workoutId={workoutId}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Back Button */}
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all mt-8 mx-auto"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>
    </DashboardLayout>
  );
}
