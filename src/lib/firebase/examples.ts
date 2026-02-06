/**
 * Firebase Integration Examples
 * 
 * This file shows how to use Firebase services in your FlexFit app.
 * Copy these patterns into your components and hooks.
 */

import { db, auth } from './config';
import { 
  getUser, 
  getUserWorkoutPlans, 
  getWorkoutPlan, 
  saveWorkoutPlan, 
  updateWorkoutPlan, 
  deleteWorkoutPlan 
} from './db';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

// ============================================
// 1. AUTHENTICATION EXAMPLES
// ============================================

/**
 * Sign up a new user
 */
export async function signupExample(email: string, password: string, name: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('User created:', user.uid, email);
    return user;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

/**
 * Login an existing user
 */
export async function loginExample(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('User logged in:', user.uid);
    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Logout current user
 */
export async function logoutExample() {
  try {
    await signOut(auth);
    console.log('User logged out');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

/**
 * Listen to auth state changes (use in useEffect)
 */
export function setupAuthListener(callback: (userId: string | null) => void) {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('User logged in:', user.uid);
      callback(user.uid);
    } else {
      console.log('User logged out');
      callback(null);
    }
  });
  return unsubscribe; // Call this to unsubscribe
}

// ============================================
// 2. FIRESTORE DATA EXAMPLES
// ============================================

/**
 * Get a user's profile
 */
export async function getUserExample(userId: string) {
  try {
    const user = await getUser(userId);
    console.log('User profile:', user);
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

/**
 * Get all workout plans for a user
 */
export async function getWorkoutPlansExample(userId: string) {
  try {
    const plans = await getUserWorkoutPlans(userId);
    console.log('User workout plans:', plans);
    return plans;
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    throw error;
  }
}

/**
 * Get a single workout plan
 */
export async function getSingleWorkoutPlanExample(planId: string) {
  try {
    const plan = await getWorkoutPlan(planId);
    console.log('Workout plan:', plan);
    return plan;
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    throw error;
  }
}

/**
 * Save a new workout plan
 */
export async function saveWorkoutPlanExample(userId: string, planName: string) {
  try {
    const planId = await saveWorkoutPlan({
      userId,
      name: planName,
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      minutesPerSession: 60,
      plan: {
        Monday: {
          name: 'Push Day',
          focus: ['chest', 'shoulders', 'triceps'],
          exercises: []
        }
      },
      createdAt: new Date(),
      isActive: true,
      difficulty: 'beginner'
    });
    console.log('Plan saved with ID:', planId);
    return planId;
  } catch (error) {
    console.error('Error saving plan:', error);
    throw error;
  }
}

/**
 * Update an existing workout plan
 */
export async function updateWorkoutPlanExample(planId: string) {
  try {
    await updateWorkoutPlan(planId, {
      isActive: false,
      name: 'Updated Plan Name'
    });
    console.log('Plan updated');
  } catch (error) {
    console.error('Error updating plan:', error);
    throw error;
  }
}

/**
 * Delete a workout plan
 */
export async function deleteWorkoutPlanExample(planId: string) {
  try {
    await deleteWorkoutPlan(planId);
    console.log('Plan deleted');
  } catch (error) {
    console.error('Error deleting plan:', error);
    throw error;
  }
}

// ============================================
// 3. USAGE IN COMPONENTS
// ============================================

/**
 * Example: Using Firebase in a React component
 * 
 * 'use client'; // Mark as client component
 * 
 * import { useEffect, useState } from 'react';
 * import { setupAuthListener, getWorkoutPlansExample } from '@/lib/firebase/examples';
 * 
 * export default function MyComponent() {
 *   const [userId, setUserId] = useState<string | null>(null);
 *   const [plans, setPlans] = useState([]);
 * 
 *   useEffect(() => {
 *     // Listen to auth changes
 *     const unsubscribe = setupAuthListener(async (uid) => {
 *       if (uid) {
 *         setUserId(uid);
 *         // Load user's workout plans
 *         const userPlans = await getWorkoutPlansExample(uid);
 *         setPlans(userPlans);
 *       } else {
 *         setUserId(null);
 *         setPlans([]);
 *       }
 *     });
 * 
 *     return () => unsubscribe();
 *   }, []);
 * 
 *   return (
 *     <div>
 *       {userId ? (
 *         <div>
 *           <h1>Welcome back!</h1>
 *           <ul>
 *             {plans.map(plan => (
 *               <li key={plan.id}>{plan.name}</li>
 *             ))}
 *           </ul>
 *         </div>
 *       ) : (
 *         <p>Please log in</p>
 *       )}
 *     </div>
 *   );
 * }
 */
