import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { createEmptyUserState } from './storage.js';
import { firestore } from './firebase.js';

function getUserStateDocument(userId) {
  if (!firestore) {
    throw new Error('Firebase is not configured. Cannot access cloud storage.');
  }

  return doc(firestore, 'users', userId);
}

function normalizeState(state) {
  const emptyState = createEmptyUserState();

  return {
    week: Number.isInteger(state?.week) && state.week > 0 ? state.week : 1,
    flatmates: Array.isArray(state?.flatmates) ? state.flatmates : emptyState.flatmates,
    chores: Array.isArray(state?.chores) ? state.chores : emptyState.chores,
    assignments: Array.isArray(state?.assignments) ? state.assignments : emptyState.assignments,
    history: Array.isArray(state?.history) ? state.history : emptyState.history,
    stats: state?.stats && typeof state.stats === 'object' ? state.stats : emptyState.stats
  };
}

export function subscribeToUserState(userId, onState, onError) {
  return onSnapshot(getUserStateDocument(userId), snapshot => {
    onState(snapshot.exists() ? normalizeState(snapshot.data().state) : null);
  }, onError);
}

export function saveUserState(userId, state) {
  return setDoc(getUserStateDocument(userId), {
    state: normalizeState(state),
    updatedAt: serverTimestamp()
  });
}
