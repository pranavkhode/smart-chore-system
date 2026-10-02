import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { firebaseAuth, firebaseConfigured, firebaseSetupMessage } from './firebase.js';

function requireAuth() {
  if (!firebaseConfigured || !firebaseAuth) {
    throw new Error(firebaseSetupMessage);
  }

  return firebaseAuth;
}

function toSessionUser(user) {
  return {
    id: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'Household member',
    email: user.email || ''
  };
}

export async function createAccount({ name, email, password }) {
  const auth = requireAuth();
  if (!name?.trim() || !email?.trim() || !password) {
    throw new Error('Please complete all fields.');
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const credential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  await updateProfile(credential.user, { displayName: name.trim() });
  return toSessionUser(credential.user);
}

export async function signIn({ email, password }) {
  const auth = requireAuth();
  const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  return toSessionUser(credential.user);
}

export function observeAuth(callback, onError) {
  return onAuthStateChanged(requireAuth(), user => callback(user ? toSessionUser(user) : null), onError);
}

export async function signOutUser() {
  await signOut(requireAuth());
}

export function getAuthErrorMessage(error) {
  const messages = {
    'auth/email-already-in-use': 'An account with this email already exists. Please log in instead.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Email/Password sign-in is disabled in Firebase Authentication settings.',
    'auth/weak-password': 'Password must be at least 6 characters long.',
    'auth/user-disabled': 'This account has been disabled. Contact the Firebase project administrator.',
    'auth/too-many-requests': 'Too many attempts. Please wait a little and try again.',
    'auth/network-request-failed': 'Could not reach Firebase. Check your internet connection and try again.'
  };

  return messages[error?.code] || error?.message || 'Authentication failed. Please try again.';
}
