'use client';

import { useState } from 'react';
import { Exercise, WorkoutPlan, SchedulerInput } from '@/types';
import { generateWorkoutPlan } from '@/lib/algorithms/scheduler';
import { saveWorkoutPlan } from '@/lib/firebase/db';
import { auth } from '@/lib/firebase/config';

export function useWorkoutPlan(userId: string) {
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePlan = async (
    input: SchedulerInput,
    exercises: Exercise[]
  ) => {
    try {
      setLoading(true);
      setError(null);
      const plan = generateWorkoutPlan(input, exercises, userId);
      setCurrentPlan(plan);
      return plan;
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const savePlan = async () => {
    if (!currentPlan) throw new Error('No plan to save');
    try {
      setLoading(true);
      console.log('Starting save plan process. Current plan:', currentPlan);
      const { id, ...planWithoutId } = currentPlan;

      // Ensure userId is present on the saved plan. If generatePlan ran before
      // the auth user finished loading, `currentPlan.userId` might be empty.
      // Use the authenticated user's UID as a reliable fallback.
      const fallbackUserId = auth.currentUser?.uid || '';
      const planToSave = {
        ...planWithoutId,
        userId: planWithoutId.userId || fallbackUserId,
      } as Omit<WorkoutPlan, 'id'>;

      if (!planToSave.userId) {
        throw new Error('Unable to determine userId for workout plan. Please ensure you are logged in.');
      }

      console.log('Plan to be saved (processed):', planToSave);
      const planId = await saveWorkoutPlan(planToSave);
      console.log('Plan saved successfully. Plan ID:', planId);
      setCurrentPlan({ ...currentPlan, id: planId });

      // Persist the last saved plan id in this browser session so the Workouts
      // page can prefer showing the plan created in the current session.
      try {
        sessionStorage.setItem('lastSavedPlanId', planId);
      } catch (e) {
        console.warn('Unable to write lastSavedPlanId to sessionStorage', e);
      }

      return planId;
    } catch (err) {
      const message = (err as Error).message;
      console.error('Error saving plan:', message);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    currentPlan,
    loading,
    error,
    generatePlan,
    savePlan,
  };
}
