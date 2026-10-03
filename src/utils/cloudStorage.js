import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { createEmptyUserState } from './storage.js';
import { firestore } from './firebase.js';

function requireFirestore() {
  if (!firestore) {
    throw new Error('Firebase is not configured. Cannot access cloud storage.');
  }

  return firestore;
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

function createInviteCode() {
  const bytes = new Uint8Array(18);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

function getUserHouseholdReference(userId) {
  return doc(requireFirestore(), 'userHouseholds', userId);
}

function getHouseholdReference(householdId) {
  return doc(requireFirestore(), 'households', householdId);
}

export async function getUserHouseholdId(userId) {
  const snapshot = await getDoc(getUserHouseholdReference(userId));
  return snapshot.exists() ? snapshot.data().householdId : null;
}

export async function createHousehold(user, name) {
  const database = requireFirestore();
  const householdId = createInviteCode();
  const inviteCode = createInviteCode();
  const batch = writeBatch(database);

  batch.set(doc(database, 'households', householdId), {
    name: name.trim(),
    ownerId: user.id,
    inviteCode,
    state: createEmptyUserState(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  batch.set(doc(database, 'householdInvites', inviteCode), {
    householdId,
    ownerId: user.id,
    createdAt: serverTimestamp()
  });
  batch.set(doc(database, 'households', householdId, 'members', user.id), {
    uid: user.id,
    name: user.name,
    email: user.email,
    role: 'owner',
    joinedAt: serverTimestamp()
  });
  batch.set(getUserHouseholdReference(user.id), {
    householdId,
    updatedAt: serverTimestamp()
  });

  await batch.commit();
  return householdId;
}

export async function joinHousehold(user, inviteCode) {
  const database = requireFirestore();
  const householdId = inviteCode.trim().toLowerCase();

  if (!/^[a-f0-9]{36}$/.test(householdId)) {
    throw new Error('Enter the 36-character household invite code.');
  }

  const inviteSnapshot = await getDoc(doc(database, 'householdInvites', householdId));
  if (!inviteSnapshot.exists() || typeof inviteSnapshot.data().householdId !== 'string') {
    throw new Error('That household invite code was not found. Check the code and try again.');
  }
  const targetHouseholdId = inviteSnapshot.data().householdId;

  const batch = writeBatch(database);
  batch.set(doc(database, 'households', targetHouseholdId, 'members', user.id), {
    uid: user.id,
    name: user.name,
    email: user.email,
    role: 'member',
    inviteCode: householdId,
    joinedAt: serverTimestamp()
  });
  batch.set(getUserHouseholdReference(user.id), {
    householdId: targetHouseholdId,
    updatedAt: serverTimestamp()
  });

  await batch.commit();
  return targetHouseholdId;
}

export function subscribeToUserHouseholdState(householdId, onState, onError) {
  return onSnapshot(getHouseholdReference(householdId), snapshot => {
    if (!snapshot.exists()) {
      onError(new Error('This household no longer exists.'));
      return;
    }

    const household = snapshot.data();
    onState({
      id: snapshot.id,
      name: household.name || 'My Household',
      inviteCode: household.inviteCode || snapshot.id,
      state: normalizeState(household.state)
    });
  }, onError);
}

export function saveHouseholdState(householdId, state) {
  return setDoc(getHouseholdReference(householdId), {
    state: normalizeState(state),
    updatedAt: serverTimestamp()
  }, { merge: true });
}
