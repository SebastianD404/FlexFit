'use client';

import { useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { User, AuthState } from '@/types/user';
import { getUser } from '@/lib/firebase/db';
import { loginUser, registerUser, logoutUser, loginWithGoogle } from '@/lib/firebase/auth';
import { setDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await getUser(firebaseUser.uid);
          if (user) {
            setAuthState({ user, loading: false, error: null });
          } else {
            // Firestore user doc missing — fall back to auth profile so UI shows
            // the display name immediately. Also attempt to create the Firestore
            // document asynchronously.
            const fallbackUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'User',
              experience: 'beginner',
              goal: 'balanced',
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            setAuthState({ user: fallbackUser, loading: false, error: null });

            // Try to create the Firestore user doc in background.
            (async () => {
              try {
                await setDoc(doc(db, 'users', fallbackUser.id), {
                  ...fallbackUser,
                  createdAt: Timestamp.fromDate(fallbackUser.createdAt),
                  updatedAt: Timestamp.fromDate(fallbackUser.updatedAt),
                });
                console.log('Created missing Firestore user doc for', fallbackUser.id);
              } catch (err) {
                console.warn('Failed to create missing Firestore user doc:', err);
              }
            })();
          }
        } catch (error) {
          setAuthState({ user: null, loading: false, error: (error as Error).message });
        }
      } else {
        setAuthState({ user: null, loading: false, error: null });
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      await loginUser(email, password);
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: (error as Error).message,
        loading: false,
      }));
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    experience: 'beginner' | 'intermediate' | 'advanced'
  ) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const created = await registerUser(email, password, name, experience);
      // Optionally set the auth state with the created user; onAuthStateChanged
      // will also sync when the auth state changes. We set it here to reflect
      // successful creation immediately.
      setAuthState({ user: created, loading: false, error: null });
      return created;
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: (error as Error).message,
        loading: false,
      }));
      // Re-throw so callers (signup page) can handle errors and avoid
      // proceeding (e.g., logout or redirect) when registration fails.
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setAuthState({ user: null, loading: false, error: null });
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: (error as Error).message,
      }));
    }
  };

  const loginGoogle = async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      await loginWithGoogle();
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: (error as Error).message,
        loading: false,
      }));
    }
  };

  return { ...authState, login, register, logout, loginGoogle };
}
