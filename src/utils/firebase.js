import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const firebaseConfigured = Object.values(config).every(Boolean);
export const firebaseSetupMessage =
  'Firebase is not configured yet. Add the Firebase web app values to .env.local and enable Email/Password sign-in.';

const app = firebaseConfigured ? initializeApp(config) : null;

export const firebaseAuth = app ? getAuth(app) : null;
export const firestore = app ? getFirestore(app) : null;
