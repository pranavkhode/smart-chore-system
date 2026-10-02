import test from 'node:test';
import assert from 'node:assert/strict';

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    }
  };
}

globalThis.localStorage = createMemoryStorage();

const { getInitialState, loadStateFromStorage } = await import('../src/utils/storage.js');

test('new user state starts empty until chores are added', () => {
  const state = getInitialState({ empty: true });

  assert.deepEqual(state.flatmates, []);
  assert.deepEqual(state.chores, []);
  assert.deepEqual(state.assignments, []);
  assert.deepEqual(state.history, []);
});

test('loadStateFromStorage returns an empty user state when no saved user data exists', () => {
  const userId = 'user-123';
  const state = loadStateFromStorage(userId);

  assert.deepEqual(state.flatmates, []);
  assert.deepEqual(state.chores, []);
  assert.deepEqual(state.assignments, []);
});
