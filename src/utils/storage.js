import { DEFAULT_FLATMATES, DEFAULT_CHORES } from '../constants/defaultData.js';
import { generateFairRoster } from './fairRosterAlgorithm.js';

const STORAGE_KEY_PREFIX = 'smart_chore_roster_state_v1';

export function getStateStorageKey(userId = null) {
  return userId ? `${STORAGE_KEY_PREFIX}_${userId}` : `${STORAGE_KEY_PREFIX}_guest`;
}

export function createEmptyUserState() {
  return {
    week: 1,
    flatmates: [],
    chores: [],
    assignments: [],
    history: [],
    stats: {
      totalChoresEverCompleted: 0,
      totalDifficultyPointsCompleted: 0,
    }
  };
}

/**
 * Initializes and returns the initial state with default flatmates and chores,
 * and generates the Week 1 roster automatically.
 */
export function getInitialState({ empty = false } = {}) {
  if (empty) {
    return createEmptyUserState();
  }

  const defaultWeek = 1;
  const initialRoster = generateFairRoster({
    flatmates: DEFAULT_FLATMATES,
    chores: DEFAULT_CHORES,
    previousWeekAssignments: [],
    history: [],
    targetWeek: defaultWeek
  });

  return {
    week: defaultWeek,
    flatmates: DEFAULT_FLATMATES,
    chores: DEFAULT_CHORES,
    assignments: initialRoster.success ? initialRoster.assignments : [],
    history: [], // [{ week: 1, assignments: [...], completedAt: ... }]
    stats: {
      totalChoresEverCompleted: 0,
      totalDifficultyPointsCompleted: 0,
    }
  };
}

/**
 * Loads state from localStorage for the active user, falling back to a fresh empty state.
 */
export function loadStateFromStorage(userId = null) {
  const storageKey = getStateStorageKey(userId);

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      const initial = userId ? createEmptyUserState() : getInitialState();
      saveStateToStorage(initial, userId);
      return initial;
    }

    const parsed = JSON.parse(raw);

    return {
      week: parsed.week || 1,
      flatmates: Array.isArray(parsed.flatmates) ? parsed.flatmates : [],
      chores: Array.isArray(parsed.chores) ? parsed.chores : [],
      assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [],
      history: Array.isArray(parsed.history) ? parsed.history : [],
      stats: parsed.stats || {
        totalChoresEverCompleted: 0,
        totalDifficultyPointsCompleted: 0,
      }
    };
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return userId ? createEmptyUserState() : getInitialState();
  }
}

/**
 * Saves full application state to user-specific localStorage.
 */
export function saveStateToStorage(state, userId = null) {
  try {
    localStorage.setItem(getStateStorageKey(userId), JSON.stringify(state));
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
}

/**
 * Resets storage back to a fresh state for the active user.
 */
export function resetStorageToDefaults(userId = null) {
  const initial = userId ? createEmptyUserState() : getInitialState();
  saveStateToStorage(initial, userId);
  return initial;
}
