import { DEFAULT_FLATMATES, DEFAULT_CHORES } from '../constants/defaultData.js';
import { generateFairRoster } from './fairRosterAlgorithm.js';

const STORAGE_KEY = 'smart_chore_roster_state_v1';

/**
 * Initializes and returns the initial state with default flatmates and chores,
 * and generates the Week 1 roster automatically.
 */
export function getInitialState() {
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
 * Loads state from localStorage, falling back to initialized state.
 */
export function loadStateFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialState();
      saveStateToStorage(initial);
      return initial;
    }

    const parsed = JSON.parse(raw);
    
    // Ensure all critical properties exist
    return {
      week: parsed.week || 1,
      flatmates: Array.isArray(parsed.flatmates) && parsed.flatmates.length > 0 ? parsed.flatmates : DEFAULT_FLATMATES,
      chores: Array.isArray(parsed.chores) && parsed.chores.length > 0 ? parsed.chores : DEFAULT_CHORES,
      assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [],
      history: Array.isArray(parsed.history) ? parsed.history : [],
      stats: parsed.stats || {
        totalChoresEverCompleted: 0,
        totalDifficultyPointsCompleted: 0,
      }
    };
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return getInitialState();
  }
}

/**
 * Saves full application state to localStorage.
 */
export function saveStateToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
}

/**
 * Resets storage back to initial defaults.
 */
export function resetStorageToDefaults() {
  const initial = getInitialState();
  saveStateToStorage(initial);
  return initial;
}
