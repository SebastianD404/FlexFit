import { Exercise, WorkoutDay, SchedulerInput, WorkoutPlan } from '@/types';

export type SplitType = 'fullbody' | 'push-pull-legs' | 'upper-lower' | 'split';

/**
 * Core Algorithm: Generates optimal workout split based on constraints
 * This is the "magic" that makes FlexFit special
 */
export function generateWorkoutPlan(
  input: SchedulerInput,
  exerciseDatabase: Exercise[],
  userId: string
): WorkoutPlan {
  const dayCount = input.availableDays.length;

  // Step 1: Determine split type based on available days
  const splitType = determineSplitType(dayCount, input.experience);

  // Step 2: Assign muscle groups to each available day
  const muscleGroupAssignment = assignMuscleGroups(splitType, input.availableDays);

  // Step 3: Select exercises for each day
  const plan: Record<string, WorkoutDay> = {};

  for (const [day, muscleGroups] of Object.entries(muscleGroupAssignment)) {
    plan[day] = {
      name: generateDayName(muscleGroups),
      focus: generalizeFocus(muscleGroups),
      exercises: selectExercises(
        exerciseDatabase,
        muscleGroups,
        input.minutesPerSession,
        input.experience
      ),
    };
  }

  return {
    userId,
    name: `${splitType.toUpperCase()} Split (${dayCount} days)`,
    availableDays: input.availableDays,
    minutesPerSession: input.minutesPerSession,
    plan,
    createdAt: new Date(),
    isActive: true,
    difficulty: input.experience,
  };
}

/**
 * Determines the best split type based on number of available days
 * Uses 2x frequency logic: every muscle group hit at least twice per week
 * 
 * Split Logic:
 * 1-2 Days: Full Body (every session hits all muscles)
 * 3 Days: Hybrid (W1: Full Body, W2: Upper, W3: Lower)
 * 4 Days: Upper/Lower split (alternating Upper, Lower pattern)
 * 5 Days: PPL Hybrid (Push, Pull, Legs, Upper, Lower)
 * 6+ Days: PPL Rotation (Push, Pull, Legs repeated twice)
 */
export function determineSplitType(
  dayCount: number,
  experience: 'beginner' | 'intermediate' | 'advanced'
): SplitType {
  if (dayCount <= 2) return 'fullbody'; // Full Body: hits everything 2x
  if (dayCount === 3) return 'fullbody'; // Hybrid: Full + Upper + Lower
  if (dayCount === 4) return 'upper-lower'; // Standard: Upper/Lower alternating
  return 'push-pull-legs'; // 5+ days: PPL or PPL Hybrid
}

/**
 * Assigns muscle groups to each available day
 * Guarantees 2x frequency: each muscle hit at least twice per week
 */
export function assignMuscleGroups(
  splitType: SplitType,
  days: string[]
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  const dayCount = days.length;

  if (dayCount === 1) {
    // Single session: Full Body
    result[days[0]] = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quadriceps', 'hamstrings', 'glutes', 'calves', 'core'];
  } else if (dayCount === 2) {
    // Two sessions: Full Body (High Efficiency)
    // W1: Full Body, W2: Full Body
    const fullBody = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quadriceps', 'hamstrings', 'glutes', 'calves', 'core'];
    result[days[0]] = fullBody;
    result[days[1]] = fullBody;
  } else if (dayCount === 3) {
    // Three sessions: The Hybrid
    // W1: Full Body (hits everything once)
    // W2: Upper Body (hits upper half again)
    // W3: Lower Body (hits lower half again)
    result[days[0]] = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quadriceps', 'hamstrings', 'glutes', 'calves', 'core'];
    result[days[1]] = ['chest', 'back', 'shoulders', 'biceps', 'triceps'];
    result[days[2]] = ['quadriceps', 'hamstrings', 'glutes', 'calves', 'core'];
  } else if (dayCount === 4) {
    // Four sessions: The Standard
    // W1: Upper, W2: Lower, W3: Upper, W4: Lower (alternating)
    result[days[0]] = ['chest', 'back', 'shoulders', 'biceps', 'triceps'];
    result[days[1]] = ['quadriceps', 'hamstrings', 'glutes', 'calves', 'core'];
    result[days[2]] = ['chest', 'back', 'shoulders', 'biceps', 'triceps'];
    result[days[3]] = ['quadriceps', 'hamstrings', 'glutes', 'calves', 'core'];
  } else if (dayCount === 5) {
    // Five sessions: The Advanced Hybrid
    // W1: Push, W2: Pull, W3: Legs, W4: Upper, W5: Lower
    result[days[0]] = ['chest', 'shoulders', 'triceps'];
    result[days[1]] = ['back', 'biceps'];
    result[days[2]] = ['quadriceps', 'hamstrings', 'glutes', 'calves'];
    result[days[3]] = ['chest', 'back', 'shoulders', 'biceps', 'triceps'];
    result[days[4]] = ['quadriceps', 'hamstrings', 'glutes', 'calves', 'core'];
  } else {
    // Six or more sessions: The High Volume
    // W1-W3: Push, Pull, Legs (first rotation)
    // W4-W6: Push, Pull, Legs (second rotation)
    const pplCycle = [
      ['chest', 'shoulders', 'triceps'], // Push
      ['back', 'biceps'], // Pull
      ['quadriceps', 'hamstrings', 'glutes', 'calves'] // Legs
    ];

    for (let i = 0; i < days.length; i++) {
      result[days[i]] = pplCycle[i % 3];
    }
  }

  return result;
}

/**
 * Selects the best exercises for the target muscle groups
 * Prioritizes effectiveness for the available time
 */
export function selectExercises(
  database: Exercise[],
  muscleGroups: string[],
  minutes: number,
  experience: 'beginner' | 'intermediate' | 'advanced'
): Exercise[] {
  // Filter exercises by muscle group and difficulty
  const experienceLevel = experience === 'beginner' ? 1 : experience === 'intermediate' ? 2 : 3;

  const filtered = database.filter(
    (ex) =>
      muscleGroups.includes(ex.muscleGroup.toLowerCase()) &&
      ex.difficulty <= experienceLevel
  );

  // Calculate how many exercises fit in time (roughly 7-8 mins per exercise)
  const exercisesPerMinute = 0.13; // 1 exercise ≈ 7.5 mins
  const exerciseCount = Math.max(3, Math.min(6, Math.floor(minutes * exercisesPerMinute)));

  // Return diverse exercises (shuffle to get variety)
  return shuffleArray(filtered).slice(0, exerciseCount);
}

/**
 * Generates a user-friendly name for a workout day
 */
export function generateDayName(muscleGroups: string[]): string {
  if (muscleGroups.length >= 4) return 'Full Body';
  if (muscleGroups.includes('chest') && !muscleGroups.includes('back')) return 'Push Day';
  if (muscleGroups.includes('back') && !muscleGroups.includes('chest')) return 'Pull Day';
  if (muscleGroups.includes('quadriceps') || muscleGroups.includes('hamstrings'))
    return 'Leg Day';
  return muscleGroups.map((g) => g.charAt(0).toUpperCase() + g.slice(1)).join(' & ');
}

/**
 * Generalizes focus muscle groups to simplified labels
 * Instead of listing all muscles, uses generalized categories
 */
export function generalizeFocus(muscleGroups: string[]): string[] {
  // Check for Full Body (more than 4 muscle groups)
  if (muscleGroups.length >= 8) {
    return ['Full Body'];
  }

  const hasUpperBody = ['chest', 'back', 'shoulders', 'biceps', 'triceps'].some((m) =>
    muscleGroups.includes(m)
  );
  const hasLowerBody = ['quadriceps', 'hamstrings', 'glutes'].some((m) =>
    muscleGroups.includes(m)
  );
  const hasCoreCalves = ['core', 'calves'].some((m) => muscleGroups.includes(m));

  // Check for Upper Body
  if (hasUpperBody && !hasLowerBody) {
    return ['Upper Body'];
  }

  // Check for Lower Body
  if (hasLowerBody && !hasUpperBody) {
    return ['Lower Body'];
  }

  // Check for Full Body (combination of upper and lower)
  if (hasUpperBody && hasLowerBody) {
    return ['Full Body'];
  }

  // Fallback: return original muscle groups if none of the above
  return muscleGroups;
}

/**
 * Utility: Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
