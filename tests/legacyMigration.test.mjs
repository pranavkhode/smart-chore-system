import test from 'node:test';
import assert from 'node:assert/strict';

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
    clear() {
      values.clear();
    }
  };
}

globalThis.localStorage = createMemoryStorage();

const { getStateStorageKey } = await import('../src/utils/storage.js');
const { getLegacyAccountForCredentials, removeLegacyAccount } = await import('../src/utils/legacyMigration.js');

test('legacy local data is selected only for the matching email and password', () => {
  const state = {
    week: 4,
    flatmates: [{ id: 'flatmate-1', name: 'Alex' }],
    chores: [],
    assignments: [],
    history: [],
    stats: {}
  };
  localStorage.setItem('smart_chore_roster_users_db', JSON.stringify([
    { id: 'old-user-1', email: 'alex@example.com', password: 'correct-password' }
  ]));
  localStorage.setItem(getStateStorageKey('old-user-1'), JSON.stringify(state));

  assert.equal(getLegacyAccountForCredentials('alex@example.com', 'wrong-password'), null);
  assert.deepEqual(
    getLegacyAccountForCredentials('alex@example.com', 'correct-password').state,
    state
  );
});

test('legacy migration cleanup removes only the migrated account and its data', () => {
  localStorage.setItem('smart_chore_roster_users_db', JSON.stringify([
    { id: 'old-user-1', email: 'alex@example.com', password: 'correct-password' },
    { id: 'old-user-2', email: 'sam@example.com', password: 'another-password' }
  ]));
  localStorage.setItem(getStateStorageKey('old-user-1'), JSON.stringify({ week: 1 }));
  localStorage.setItem(getStateStorageKey('old-user-2'), JSON.stringify({ week: 2 }));
  localStorage.setItem('smart_chore_roster_active_user', JSON.stringify({ id: 'old-user-1' }));

  removeLegacyAccount('old-user-1');

  assert.deepEqual(JSON.parse(localStorage.getItem('smart_chore_roster_users_db')), [
    { id: 'old-user-2', email: 'sam@example.com', password: 'another-password' }
  ]);
  assert.equal(localStorage.getItem(getStateStorageKey('old-user-1')), null);
  assert.notEqual(localStorage.getItem(getStateStorageKey('old-user-2')), null);
  assert.equal(localStorage.getItem('smart_chore_roster_active_user'), null);
});
