export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  targetMuscle?: string;
  difficulty: 1 | 2 | 3;
  sets: number;
  reps: string;
  equipment: string[];
  instructions: string;
  gifUrl?: string;
}

export interface WorkoutDay {
  name: string;
  focus: string[];
  exercises: Exercise[];
}

export interface ExerciseStatus {
  exerciseId: string;
  completed: boolean;
  completedDate?: Date;
  timesCompleted: number;
}

export interface ExerciseEntry extends Exercise {
  status?: ExerciseStatus;
}

export interface WorkoutDayWithStatus extends WorkoutDay {
  exercises: ExerciseEntry[];
}

export interface WorkoutPlan {
  id?: string;
  userId: string;
  name: string;
  availableDays: string[];
  minutesPerSession: number;
  plan: Record<string, WorkoutDay>;
  createdAt: Date;
  isActive: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exerciseStatus?: Record<string, ExerciseStatus>;
  streakCount?: number;
  lastStreakDate?: string;
  consecutiveSkips?: number;
  lastActivityDate?: string;
}

export interface SchedulerInput {
  availableDays: string[];
  experience: 'beginner' | 'intermediate' | 'advanced';
  goal: 'strength' | 'muscle' | 'Fat loss' | 'General Fitness';
  minutesPerSession: number;
}
