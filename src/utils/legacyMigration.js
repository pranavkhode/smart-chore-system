import { createEmptyUserState, getStateStorageKey } from './storage.js';

const LEGACY_USERS_KEY = 'smart_chore_roster_users_db';
const LEGACY_ACTIVE_USER_KEY = 'smart_chore_roster_active_user';

export function getLegacyAccountForCredentials(email, password) {
  const users = JSON.parse(localStorage.getItem(LEGACY_USERS_KEY) || '[]');
  const legacyUser = users.find(user =>
    user.email === email.trim().toLowerCase() && user.password === password.trim()
  );

  if (!legacyUser) return null;

  const rawState = localStorage.getItem(getStateStorageKey(legacyUser.id));
  if (!rawState) {
    return { id: legacyUser.id, email: legacyUser.email, state: createEmptyUserState() };
  }

  try {
    return {
      id: legacyUser.id,
      email: legacyUser.email,
      state: JSON.parse(rawState)
    };
  } catch (error) {
    console.error('Could not read the previous local chore data for migration:', error);
    return { id: legacyUser.id, email: legacyUser.email, state: createEmptyUserState() };
  }
}

export function removeLegacyAccount(legacyUserId) {
  const users = JSON.parse(localStorage.getItem(LEGACY_USERS_KEY) || '[]');
  localStorage.setItem(LEGACY_USERS_KEY, JSON.stringify(users.filter(user => user.id !== legacyUserId)));
  localStorage.removeItem(getStateStorageKey(legacyUserId));

  const activeUser = JSON.parse(localStorage.getItem(LEGACY_ACTIVE_USER_KEY) || 'null');
  if (activeUser?.id === legacyUserId) {
    localStorage.removeItem(LEGACY_ACTIVE_USER_KEY);
  }
}
