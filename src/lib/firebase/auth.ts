import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { User } from '@/types/user';

export async function registerUser(
  email: string,
  password: string,
  name: string,
  experience: 'beginner' | 'intermediate' | 'advanced'
): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // Update the Firebase Auth profile with the provided display name so UI can
  // immediately reflect the user's name even if Firestore document creation
  // is delayed or fails.
  try {
    await updateProfile(firebaseUser, { displayName: name });
  } catch (err) {
    console.warn('updateProfile failed:', err);
  }

  const now = new Date();
  const user: User = {
    id: firebaseUser.uid,
    email,
    name,
    experience,
    goal: 'balanced',
    createdAt: now,
    updatedAt: now,
  };

  try {
    // Save timestamps as Firestore Timestamps to ensure consistent retrieval
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...user,
      createdAt: Timestamp.fromDate(user.createdAt),
      updatedAt: Timestamp.fromDate(user.updatedAt),
    });
  } catch (err) {
    console.error('registerUser setDoc error', err);
    throw err;
  }

  return user;
}


export async function loginUser(email: string, password: string): Promise<FirebaseUser> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function loginWithGoogle(): Promise<User> {
  console.log('loginWithGoogle: Starting Google authentication...');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  console.log('loginWithGoogle: Opening popup...');
  const userCredential = await signInWithPopup(auth, provider);
  console.log('loginWithGoogle: Popup completed, user authenticated');
  const firebaseUser = userCredential.user;

  // Check if user already exists in Firestore
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  console.log('loginWithGoogle: User exists in Firestore:', userDoc.exists());
  
  if (userDoc.exists()) {
    // User exists, return the existing user data
    return userDoc.data() as User;
  } else {
    // New user, create user document
    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || 'User',
      experience: 'beginner',
      goal: 'balanced',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), user);
    console.log('loginWithGoogle: New user document created');
    return user;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}
