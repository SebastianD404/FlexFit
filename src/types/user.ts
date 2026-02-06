export interface User {
  id: string;
  email: string;
  name: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  goal: 'strength' | 'muscle' | 'cardio' | 'balanced';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
