'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage';

// This function is now the single source of truth for initialization.
export function initializeFirebase() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  
  // Directly initialize all services here.
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  // CRITICAL: Explicitly pass the bucket URL to getStorage.
  const storage = getStorage(app, `gs://${firebaseConfig.storageBucket}`);

  return {
    firebaseApp: app,
    auth,
    firestore,
    storage
  };
}
