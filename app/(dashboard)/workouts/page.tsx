"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, RotateCcw, ClipboardList, Trophy, Sparkles } from 'lucide-react';
import { ExerciseCard } from '@/components/scheduler/ExerciseCard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardCard } from '@/components/layout/DashboardCard';
import { StreakTracker } from '@/components/common/StreakTracker';
import { useAuth } from '@/lib/hooks';
import { getUserWorkoutPlans, getWorkoutPlan, updateWorkoutPlan } from '@/lib/firebase/db';
import { WorkoutPlan, Exercise } from '@/types';
import { generalizeFocus } from '@/lib/algorithms/scheduler';
import congratulationsMessages from '@/data/congratulations.json';

export default function WorkoutsPage() {
  const { user, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [exerciseStatus, setExerciseStatus] = useState<Record<string, { exerciseId: string; completed: boolean; completedDate?: Date; timesCompleted: number }>>({});
  const [streakCount, setStreakCount] = useState(0);
  const [consecutiveSkips, setConsecutiveSkips] = useState(0);
  const [triggerStreakAnimation, setTriggerStreakAnimation] = useState(false);
  const [showWeekCompleteCelebration, setShowWeekCompleteCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState({ title: '', message: '' });
  const [addingExerciseForDay, setAddingExerciseForDay] = useState<string | null>(null);

  // Check for skipped days when workout loads
  useEffect(() => {
    const checkSkippedDays = async () => {
      if (!workout?.id || !user) return;

      const todayKey = getLocalDateKey(new Date());
      const lastActivityDate = workout.lastActivityDate || workout.lastStreakDate;

      // If there's a lastActivityDate and it's not today
      if (lastActivityDate && lastActivityDate !== todayKey) {
        const lastDate = new Date(lastActivityDate);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        // If more than 1 day has passed (skipped days)
        if (daysDiff >= 1) {
          let newConsecutiveSkips = (workout.consecutiveSkips || 0) + daysDiff;
          let newStreakCount;

          // Reset streak if 3 or more consecutive skips
          if (newConsecutiveSkips >= 3) {
            newStreakCount = 0;
            newConsecutiveSkips = 3; // Cap at 3
          } else {
            newStreakCount = workout.streakCount || 0;
          }

          setConsecutiveSkips(newConsecutiveSkips);
          setStreakCount(newStreakCount);

          // Update in database
          try {
            await updateWorkoutPlan(workout.id, {
              consecutiveSkips: newConsecutiveSkips,
              streakCount: newStreakCount,
              lastActivityDate: todayKey,
            });
            setWorkout({ ...workout, consecutiveSkips: newConsecutiveSkips, streakCount: newStreakCount, lastActivityDate: todayKey });
          } catch (error) {
            console.error('Failed to update skip count:', error);
          }
        }
      } else if (!lastActivityDate) {
        // First time setup
        try {
          await updateWorkoutPlan(workout.id, {
            lastActivityDate: todayKey,
          });
        } catch (error) {
          console.error('Failed to set initial activity date:', error);
        }
      }
    };

    checkSkippedDays();
  }, [workout?.id, user]);

  useEffect(() => {
    const loadPlans = async () => {
      if (!user) {
        setPlans([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Prefer the plan created in the current browser session
        const sessionPlanId = typeof window !== 'undefined' ? sessionStorage.getItem('lastSavedPlanId') : null;
        if (sessionPlanId) {
          try {
            const sessionPlan = await getWorkoutPlan(sessionPlanId);
            // Ensure the session-stored plan actually belongs to the current user
            if (sessionPlan && sessionPlan.userId === user.id) {
              setPlans([sessionPlan]);
              setWorkout(sessionPlan);
              return;
            } else if (sessionPlan) {
              console.warn('Session plan does not belong to current user - ignoring sessionPlanId');
            }
          } catch (e) {
            console.warn('Failed to load session plan:', e);
            // fallthrough to loading all plans
          }
        }

        const data = await getUserWorkoutPlans(user.id);
        setPlans(data || []);
        setWorkout((data && data.length > 0) ? data[0] : null);
      } catch (err) {
        console.error('Failed to load workout plans:', err);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [user?.id]);

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
      setPlans([{ ...workout, plan: dedupedPlan }]);
      updateWorkoutPlan(workout.id, { plan: dedupedPlan }).catch((err) =>
        console.error('Failed to save deduplicated plan:', err)
      );
    }
  }, [workout?.id]);

  // Load exercise status from workout plan
  useEffect(() => {
    if (workout?.exerciseStatus) {
      setExerciseStatus(workout.exerciseStatus);
    } else {
      setExerciseStatus({});
    }
  }, [workout?.exerciseStatus]);

  useEffect(() => {
    setStreakCount(workout?.streakCount ?? 0);
    setConsecutiveSkips(workout?.consecutiveSkips ?? 0);
  }, [workout?.id, workout?.streakCount, workout?.consecutiveSkips]);

  const getLocalDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getYesterdayKey = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getLocalDateKey(d);
  };

  const handleMarkComplete = async (exerciseId: string, dayName: string) => {
    if (!workout?.id) return;
    const statusKey = `${dayName}-${exerciseId}`;
    const newStatus = {
      ...exerciseStatus,
      [statusKey]: {
        exerciseId,
        completed: true,
        completedDate: new Date(),
        timesCompleted: (exerciseStatus[statusKey]?.timesCompleted || 0) + 1,
      } as { exerciseId: string; completed: boolean; completedDate: Date; timesCompleted: number },
    };
    setExerciseStatus(newStatus);

    // Save to Firestore
    try {
      await updateWorkoutPlan(workout.id, {
        exerciseStatus: newStatus,
      });

      // Check if all exercises for this day are completed
      checkDayExercisesCompleted(newStatus, dayName);
    } catch (error) {
      console.error('Failed to save completion status:', error);
    }
  };

  const handleUnmarkExercise = async (exerciseId: string, dayName: string) => {
    if (!workout?.id) return;
    const statusKey = `${dayName}-${exerciseId}`;
    const newStatus = { ...exerciseStatus };
    delete newStatus[statusKey];
    setExerciseStatus(newStatus);

    // Save to Firestore
    try {
      await updateWorkoutPlan(workout.id, {
        exerciseStatus: newStatus,
      });
    } catch (error) {
      console.error('Failed to unmark exercise:', error);
    }
  };

  const checkDayExercisesCompleted = (status: Record<string, any>, dayName: string) => {
    if (!workout) return;

    const workoutPlan = workout.plan;
    const dayPlan = workoutPlan[dayName];

    if (!dayPlan) return;

    // Check if all exercises for this specific day are completed
    const dayExercises = dayPlan.exercises;
    const allDayCompleted = dayExercises.every(exercise => status[`${dayName}-${exercise.id}`]?.completed);

    console.log('🔍 Day:', dayName, 'All completed:', allDayCompleted);

    if (allDayCompleted && dayExercises.length > 0) {
      console.log('✅ All exercises completed for', dayName, '- TRIGGERING ANIMATION');

      const streakSection = document.getElementById('streak-tracker-section');
      if (streakSection) {
        streakSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const todayKey = getLocalDateKey(new Date());
      const lastKey = workout.lastStreakDate;
      let nextCount = workout.streakCount || 0;
      let shouldUpdateStreak = false;

      if (lastKey === todayKey) {
        // Already completed a workout today, keep the same streak
        nextCount = workout.streakCount || 0;
      } else if (lastKey === getYesterdayKey()) {
        // Completed yesterday, increment streak
        nextCount = (workout.streakCount || 0) + 1;
        shouldUpdateStreak = true;
      } else {
        // Detect if streak was just reset by skip detection (3+ consecutive skips)
        if (consecutiveSkips >= 3 && streakCount === 0) {
          // Keep streak at 0 on the day skips are detected; don't increment to 1 yet
          nextCount = 0;
          shouldUpdateStreak = false;
        } else {
          // First workout or gap in streak, start at 1
          nextCount = 1;
          shouldUpdateStreak = true;
        }
      }

      // Always trigger animation when a day is completed
      console.log('🚀 Calling setTriggerStreakAnimation(true)');
      setTriggerStreakAnimation(true);
      setTimeout(() => {
        console.log('🛑 Calling setTriggerStreakAnimation(false)');
        setTriggerStreakAnimation(false);

        // Check if all days of the week are completed
        checkWeekCompletion(status);
      }, 3500); // Wait for animation to finish (3s for glow + 0.5s buffer)

      // Only update database if streak actually changed
      if (shouldUpdateStreak) {
        setStreakCount(nextCount);
        setConsecutiveSkips(0); // Reset skips when user completes workout
        const updatedWorkout = { ...workout, streakCount: nextCount, lastStreakDate: todayKey, consecutiveSkips: 0, lastActivityDate: todayKey };
        setWorkout(updatedWorkout);
        setPlans([{ ...updatedWorkout }]);
        updateWorkoutPlan(workout.id!, {
          streakCount: nextCount,
          lastStreakDate: todayKey,
          consecutiveSkips: 0,
          lastActivityDate: todayKey,
        }).catch((error) => console.error('Failed to update streak:', error));
      }

    }
  };

  const checkWeekCompletion = (status: Record<string, any>) => {
    if (!workout) return;

    const workoutPlan = workout.plan;
    const allDays = Object.keys(workoutPlan);

    // Check if all exercises for all days are completed
    const allWeekCompleted = allDays.every(dayName => {
      const dayPlan = workoutPlan[dayName];
      const dayExercises = dayPlan.exercises;
      return dayExercises.every(exercise => status[`${dayName}-${exercise.id}`]?.completed);
    });

    if (allWeekCompleted) {
      // Show congratulatory message
      const randomMessage = congratulationsMessages[Math.floor(Math.random() * congratulationsMessages.length)];
      setCelebrationMessage(randomMessage);
      setShowWeekCompleteCelebration(true);
    }
  };

  const handleResetProgress = async () => {
    if (!workout?.id) return;
    if (confirm('Are you sure you want to reset all progress? This will unmark all completed exercises.')) {
      setExerciseStatus({});

      // Save to Firestore
      try {
        await updateWorkoutPlan(workout.id, {
          exerciseStatus: {},
        });
      } catch (error) {
        console.error('Failed to reset progress:', error);
      }
    }
  };

  const handleKeepGoing = async () => {
    if (!workout?.id) return;

    // Close celebration modal
    setShowWeekCompleteCelebration(false);

    // Reset all exercise status
    setExerciseStatus({});

    // Save to Firestore
    try {
      await updateWorkoutPlan(workout.id, {
        exerciseStatus: {},
      });
    } catch (error) {
      console.error('Failed to reset progress:', error);
    }

    // Scroll to the first workout day
    const firstWorkoutDay = document.getElementById('workout-days-section');
    if (firstWorkoutDay) {
      firstWorkoutDay.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sortDaysByWeek = (days: [string, any][]) => {
    const dayOrder: Record<string, number> = {
      monday: 0,
      tuesday: 1,
      wednesday: 2,
      thursday: 3,
      friday: 4,
      saturday: 5,
      sunday: 6,
    };
    return days.sort((a, b) => (dayOrder[a[0].toLowerCase()] ?? 7) - (dayOrder[b[0].toLowerCase()] ?? 7));
  };

  const handleChangeExercise = async (dayName: string, oldExerciseId: string, newExercise: Exercise) => {
    if (!workout?.id) return;

    // Update local state
    const updatedPlan = { ...workout.plan };
    if (updatedPlan[dayName]) {
      updatedPlan[dayName].exercises = updatedPlan[dayName].exercises.map((ex) =>
        ex.id === oldExerciseId ? newExercise : ex
      );
    }

    setWorkout({ ...workout, plan: updatedPlan });
    setPlans([{ ...workout, plan: updatedPlan }]);

    // Save to Firestore
    try {
      await updateWorkoutPlan(workout.id, {
        plan: updatedPlan,
      });
    } catch (error) {
      console.error('Failed to change exercise:', error);
    }
  };

  const handleAddExercise = async (dayName: string, afterExerciseId: string, newExercise: Exercise) => {
    if (!workout?.id) return;

    const updatedPlan = { ...workout.plan };
    if (updatedPlan[dayName]) {
      const exercises = [...updatedPlan[dayName].exercises];

      // Check if exercise already exists in this day
      if (exercises.some((ex) => ex.id === newExercise.id)) {
        console.warn(`Exercise ${newExercise.id} already exists in ${dayName}`);
        return;
      }

      const insertIndex = exercises.findIndex((ex) => ex.id === afterExerciseId);
      const nextIndex = insertIndex >= 0 ? insertIndex + 1 : exercises.length;
      exercises.splice(nextIndex, 0, newExercise);
      updatedPlan[dayName].exercises = exercises;
    }

    setWorkout({ ...workout, plan: updatedPlan });
    setPlans([{ ...workout, plan: updatedPlan }]);

    try {
      await updateWorkoutPlan(workout.id, {
        plan: updatedPlan,
      });
    } catch (error) {
      console.error('Failed to add exercise:', error);
    }
  };

  const handleDeleteExercise = async (dayName: string, exerciseId: string) => {
    if (!workout?.id) return;

    const updatedPlan = { ...workout.plan };
    if (updatedPlan[dayName]) {
      updatedPlan[dayName].exercises = updatedPlan[dayName].exercises.filter((ex) => ex.id !== exerciseId);
    }

    const statusKey = `${dayName}-${exerciseId}`;
    const updatedStatus = { ...exerciseStatus };
    delete updatedStatus[statusKey];

    setExerciseStatus(updatedStatus);
    setWorkout({ ...workout, plan: updatedPlan });
    setPlans([{ ...workout, plan: updatedPlan }]);

    try {
      await updateWorkoutPlan(workout.id, {
        plan: updatedPlan,
        exerciseStatus: updatedStatus,
      });
    } catch (error) {
      console.error('Failed to delete exercise:', error);
    }
  };

  return (
    <DashboardLayout
      title="My Workout Plans"
      subtitle="All your saved workout plans are displayed below. Create a new plan to get started!"
    >

      {authLoading || loading ? (
        <div className="flex items-center justify-center py-20" style={{ background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.85) 0%, rgba(20, 20, 30, 0.9) 100%)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(196, 169, 98, 0.2)', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)' }}>
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mb-4 mx-auto" style={{ color: '#E6C878' }} />
            <p className="text-lg font-medium" style={{ color: '#C0C0C0' }}>Loading your workout plans...</p>
          </div>
        </div>
      ) : plans.length === 0 ? (
        <div className="relative overflow-hidden group" style={{
          background: 'linear-gradient(135deg, rgba(20,20,24,0.96) 0%, rgba(26,26,26,0.95) 25%, rgba(18,18,20,0.98) 50%, rgba(12,12,12,1) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(40, 36, 32, 0.4)',
          borderRadius: '20px',
          padding: '2.5rem 2rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.55), 0 8px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.02)'
        }}>
          {/* Animated gradient meshes */}
          <div className="absolute inset-0 opacity-20" style={{
            background: 'radial-gradient(ellipse at top left, rgba(0,0,0,0.6) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(0,0,0,0.5) 0%, transparent 50%), radial-gradient(circle at center, rgba(0,0,0,0.45) 0%, transparent 70%)'
          }}></div>

          <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            {/* Floating decorative orbs with animation */}
            <div
              className="absolute -right-16 -top-16 w-48 h-48 opacity-12 blur-3xl animate-pulse transition-all duration-700 group-hover:opacity-20 group-hover:scale-110"
              style={{ background: 'radial-gradient(circle, rgba(230,200,120,0.12) 0%, rgba(184,147,94,0.08) 50%, transparent 75%)', animationDuration: '4s' }}
            ></div>
            <div
              className="absolute -left-16 -bottom-16 w-56 h-56 opacity-8 blur-3xl animate-pulse transition-all duration-700 group-hover:opacity-12 group-hover:scale-110"
              style={{ background: 'radial-gradient(circle, rgba(138,111,61,0.08) 0%, rgba(90,74,50,0.06) 50%, transparent 75%)', animationDuration: '5s', animationDelay: '1s' }}
            ></div>

            {/* Icon container with glow effect */}
            <div
              className="mb-5 p-4 rounded-xl relative transform transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(230, 200, 120, 0.18) 0%, rgba(184, 147, 94, 0.12) 100%)',
                border: '1.5px solid rgba(230, 200, 120, 0.35)',
                boxShadow: '0 10px 40px rgba(230, 200, 120, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 30px rgba(230, 200, 120, 0.1)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              <ClipboardList className="w-12 h-12 mx-auto" style={{ color: '#E6C878', filter: 'drop-shadow(0 2px 8px rgba(230, 200, 120, 0.4))' }} />
            </div>

            <h3
              className="text-2xl font-black mb-2 uppercase tracking-wide"
              style={{
                color: '#FFFFFF',
                letterSpacing: '0.03em',
                textShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 30px rgba(230, 200, 120, 0.3)',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #E6C878 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              No Plans Yet
            </h3>

            <p
              className="text-sm leading-relaxed mb-5 px-4"
              style={{ color: 'rgba(230, 200, 120, 0.85)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}
            >
              Create your first personalized workout plan in under 2 minutes.
            </p>

            {/* CTA Button with enhanced styling */}
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 font-bold text-xs uppercase tracking-widest transition-all duration-300 group/btn transform"
              style={{
                background: 'linear-gradient(135deg, #E6C878 0%, #F0D699 100%)',
                color: '#1a1510',
                boxShadow: '0 10px 30px rgba(230, 200, 120, 0.4), 0 4px 12px rgba(0, 0, 0, 0.25)',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '10px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 14px 40px rgba(230, 200, 120, 0.5), 0 6px 16px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(230, 200, 120, 0.4), 0 4px 12px rgba(0, 0, 0, 0.25)';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
              }}
            >
              <Sparkles size={16} />
              Get Started
            </Link>
          </div>
        </div>
      ) : (
        // Show only the most recently created plan for this user
        (() => {
          const sorted = [...plans].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          const latest = sorted[0];
          return latest || workout ? (
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Header Section with Premium Styling */}
              <div className="text-center p-8 rounded-2xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.85) 0%, rgba(20, 20, 30, 0.9) 100%)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(196, 169, 98, 0.2)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)' }}>
                {/* Background gradient orb */}
                <div className="absolute top-0 right-0 w-64 h-64 opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #E6C878 0%, transparent 70%)' }}></div>

                <div className="relative z-10">
                  <h2 className="text-4xl font-black mb-3 uppercase tracking-wide" style={{ background: 'linear-gradient(135deg, #E6C878 0%, #B8935E 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{(workout || latest)?.name}</h2>
                  <div className="flex items-center justify-center gap-4 text-sm mb-6" style={{ color: '#A0A0A0' }}>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#E6C878' }}></span>
                      Created {new Date((workout || latest)!.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider" style={{ background: 'linear-gradient(135deg, rgba(196, 169, 98, 0.15) 0%, rgba(230, 200, 120, 0.2) 100%)', color: '#E6C878', border: '1px solid rgba(196, 169, 98, 0.3)' }}>
                      {(workout || latest)!.difficulty}
                    </span>
                  </div>
                  <div className="mt-6" id="streak-tracker-section">
                    <StreakTracker streakCount={streakCount} consecutiveSkips={consecutiveSkips} triggerAnimation={triggerStreakAnimation} />
                  </div>
                </div>
              </div>

              {/* Workout Days Section */}
              <div className="space-y-6" id="workout-days-section">
                {sortDaysByWeek(Object.entries((workout || latest)!.plan)).map(([dayName, dayPlan]) => (
                  <div
                    key={dayName}
                    className="rounded-2xl p-6 relative overflow-hidden group transition-all duration-500"
                    style={{ background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.85) 0%, rgba(20, 20, 30, 0.9) 100%)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(196, 169, 98, 0.2)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)' }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 12px 40px rgba(196, 169, 98, 0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)'}
                  >
                    {/* Subtle gradient overlay on hover */}
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
                        {dayPlan.exercises.map((exercise: Exercise, index: number) => (
                          <ExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            dayName={dayName}
                            isCompleted={exerciseStatus[`${dayName}-${exercise.id}`]?.completed || false}
                            workoutId={(workout || latest)!.id!}
                            onMarkComplete={async () => {
                              await handleMarkComplete(exercise.id, dayName);
                            }}
                            onUnmark={async () => {
                              await handleUnmarkExercise(exercise.id, dayName);
                            }}
                            onChangeExercise={async (newExercise) => handleChangeExercise(dayName, exercise.id, newExercise)}
                            onAddExercise={addingExerciseForDay === dayName && index === 0 ? async (newExercise) => {
                              await handleAddExercise(dayName, exercise.id, newExercise);
                              setAddingExerciseForDay(null);
                            } : undefined}
                            onDeleteExercise={async () => {
                              await handleDeleteExercise(dayName, exercise.id);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <DashboardCard variant="accent" className="py-12 text-center">
              <p className="text-[#E5E1DA]">No workout plans available.</p>
            </DashboardCard>
          );
        })()
      )}

      {/* Week Completion Celebration Modal */}
      {showWeekCompleteCelebration && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 px-4">
          <div className="rounded-3xl p-10 max-w-lg w-full relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 30, 0.98) 100%)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', border: '2px solid rgba(196, 169, 98, 0.3)', boxShadow: '0 20px 60px rgba(196, 169, 98, 0.2), 0 8px 24px rgba(0, 0, 0, 0.3)' }}>
            {/* Animated background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle at top, #E6C878 0%, transparent 70%)' }}></div>

            <div className="text-center space-y-6 relative z-10">
              {/* Trophy Icon with sparkle effect */}
              <div className="flex justify-center mb-2">
                <div className="relative">
                  <div className="absolute inset-0 blur-xl opacity-50" style={{ background: 'radial-gradient(circle, #E6C878 0%, transparent 70%)' }}></div>
                  <Trophy className="w-20 h-20 relative z-10" style={{ color: 'transparent', fill: 'url(#trophyGradient)', stroke: 'url(#trophyGradient)', strokeWidth: 0.5 }} />
                  <svg width="0" height="0">
                    <defs>
                      <linearGradient id="trophyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#E6C878', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#B8935E', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Sparkles around trophy */}
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
                  <Sparkles className="absolute -bottom-2 -left-2 w-5 h-5 text-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
              </div>

              <h2 className="text-4xl font-black uppercase tracking-wide" style={{ background: 'linear-gradient(135deg, #E6C878 0%, #B8935E 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{celebrationMessage.title}</h2>
              <p className="text-lg leading-relaxed" style={{ color: '#C0C0C0' }}>{celebrationMessage.message}</p>
              <div className="pt-6">
                <button
                  onClick={handleKeepGoing}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base uppercase tracking-wider transition-all duration-300 transform hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #E6C878 0%, #B8935E 100%)', color: '#000000', boxShadow: '0 8px 24px rgba(196, 169, 98, 0.3)' }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 12px 32px rgba(196, 169, 98, 0.5)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 8px 24px rgba(196, 169, 98, 0.3)'}
                >
                  Keep Going! Start Fresh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}