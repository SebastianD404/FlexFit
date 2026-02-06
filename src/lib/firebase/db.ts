// Get all progress logs for a user
export async function getUserProgressLogs(userId: string) {
  const q = query(collection(db, 'progress'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
}

// Get all PR logs for a user
export async function getUserPRLogs(userId: string) {
  const q = query(collection(db, 'prs'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
}
// Save or update user progress (weight, measurements)
export async function saveUserProgress(userId: string, progress: {
  weight: number;
  chest: number;
  waist: number;
  arms: number;
  date: string;
}) {
  // Use a unique timestamp for each log
  const timestamp = new Date().toISOString();
  const progressRef = doc(collection(db, 'progress'), `${userId}_${timestamp}`);
  await setDoc(progressRef, { userId, ...progress, timestamp });
}

// Save or update user PRs
export async function saveUserPRs(userId: string, prs: {
  bench: number;
  squat: number;
  deadlift: number;
  date: string;
}) {
  const prRef = doc(collection(db, 'prs'), `${userId}_${prs.date}`);
  await setDoc(prRef, { userId, ...prs }, { merge: true });
}
import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './config';
import { WorkoutPlan, User } from '@/types';

export async function getUser(userId: string): Promise<User | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return null;
    const data = userSnap.data();
    return {
      ...(data as Omit<User, 'id'>),
      id: userSnap.id,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
    } as User;
  } catch (err) {
    console.error('getUser error', err);
    throw err;
  }
}

export async function getUserWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
  try {
    const q = query(collection(db, 'workoutPlans'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      } as WorkoutPlan;
    });
  } catch (err) {
    console.error('getUserWorkoutPlans error', err);
    throw err;
  }
}

export async function getWorkoutPlan(planId: string): Promise<WorkoutPlan | null> {
  try {
    console.log('Getting workout plan with ID:', planId);
    const planRef = doc(db, 'workoutPlans', planId);
    const planSnap = await getDoc(planRef);
    
    if (!planSnap.exists()) {
      console.warn('Workout plan not found:', planId);
      return null;
    }
    
    const data = planSnap.data();
    console.log('Retrieved plan data:', data);
    
    return {
      ...data,
      id: planSnap.id,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
    } as WorkoutPlan;
  } catch (err) {
    console.error('getWorkoutPlan error', err);
    throw err;
  }
}

export async function saveWorkoutPlan(plan: Omit<WorkoutPlan, 'id'>): Promise<string> {
  try {
    console.log('Saving workout plan:', plan);
    
    // Convert createdAt to Timestamp if it's a Date
    const planToSave = {
      ...plan,
      createdAt: plan.createdAt instanceof Date ? Timestamp.fromDate(plan.createdAt) : plan.createdAt,
    };
    
    console.log('Plan to save (processed):', planToSave);
    
    const docRef = await addDoc(collection(db, 'workoutPlans'), planToSave);
    console.log('Plan saved successfully with ID:', docRef.id);
    return docRef.id;
  } catch (err) {
    console.error('saveWorkoutPlan error', err);
    throw err;
  }
}

export async function updateWorkoutPlan(planId: string, updates: Partial<WorkoutPlan>): Promise<void> {
  const planRef = doc(db, 'workoutPlans', planId);
  await updateDoc(planRef, updates);
}

export async function deleteWorkoutPlan(planId: string): Promise<void> {
  await deleteDoc(doc(db, 'workoutPlans', planId));
}
