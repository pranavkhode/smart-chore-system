import { generateFairRoster, rebalanceCurrentWeek } from './fairRosterAlgorithm.js';
import { DEFAULT_FLATMATES, DEFAULT_CHORES } from '../constants/defaultData.js';

console.log('--- RUNNING SMART CHORE ROSTER ALGORITHM TESTS ---');

// TEST 1: 4 flatmates + 4 chores
const t1 = generateFairRoster({
  flatmates: DEFAULT_FLATMATES,
  chores: DEFAULT_CHORES,
  previousWeekAssignments: [],
  history: [],
  targetWeek: 1
});
console.log('Test 1 (4 flatmates, 4 chores):', t1.success ? 'PASSED' : 'FAILED', `(${t1.assignments.length} assignments)`);
if (!t1.success || t1.assignments.length !== 4) throw new Error('Test 1 Failed');

// TEST 2: 4 flatmates + 6 chores
const sixChores = [
  ...DEFAULT_CHORES,
  { id: 'c-groceries', title: 'Groceries', difficulty: 2 },
  { id: 'c-bathroom', title: 'Bathroom Deep Clean', difficulty: 4 }
];
const t2 = generateFairRoster({
  flatmates: DEFAULT_FLATMATES,
  chores: sixChores,
  previousWeekAssignments: [],
  history: [],
  targetWeek: 1
});
console.log('Test 2 (4 flatmates, 6 chores):', t2.success ? 'PASSED' : 'FAILED', `(${t2.assignments.length} assignments)`);
if (!t2.success || t2.assignments.length !== 6) throw new Error('Test 2 Failed');

// TEST 3: 4 flatmates + 2 chores
const twoChores = DEFAULT_CHORES.slice(0, 2);
const t3 = generateFairRoster({
  flatmates: DEFAULT_FLATMATES,
  chores: twoChores,
  previousWeekAssignments: [],
  history: [],
  targetWeek: 1
});
console.log('Test 3 (4 flatmates, 2 chores):', t3.success ? 'PASSED' : 'FAILED', `(${t3.assignments.length} assignments)`);
if (!t3.success || t3.assignments.length !== 2) throw new Error('Test 3 Failed');

// TEST 4: 1 flatmate on leave
const flatmates1OnLeave = DEFAULT_FLATMATES.map((f, i) => i === 0 ? { ...f, onLeave: true } : { ...f, onLeave: false });
const t4 = generateFairRoster({
  flatmates: flatmates1OnLeave,
  chores: DEFAULT_CHORES,
  previousWeekAssignments: [],
  history: [],
  targetWeek: 1
});
console.log('Test 4 (1 flatmate on leave):', t4.success ? 'PASSED' : 'FAILED', `(assigned to ${new Set(t4.assignments.map(a => a.flatmateId)).size} flatmates)`);
const assignedToLeavePerson = t4.assignments.some(a => a.flatmateId === flatmates1OnLeave[0].id);
if (assignedToLeavePerson) throw new Error('Test 4 Failed: Chore was assigned to someone on leave!');

// TEST 5: 3 flatmates on leave
const flatmates3OnLeave = DEFAULT_FLATMATES.map((f, i) => i < 3 ? { ...f, onLeave: true } : { ...f, onLeave: false });
const t5 = generateFairRoster({
  flatmates: flatmates3OnLeave,
  chores: DEFAULT_CHORES,
  previousWeekAssignments: [],
  history: [],
  targetWeek: 1
});
console.log('Test 5 (3 flatmates on leave):', t5.success ? 'PASSED' : 'FAILED', `(assigned to ${t5.assignments[0]?.flatmateId})`);
if (!t5.success || t5.assignments.length !== 4) throw new Error('Test 5 Failed');

// TEST 6: All flatmates on leave
const flatmatesAllOnLeave = DEFAULT_FLATMATES.map(f => ({ ...f, onLeave: true }));
const t6 = generateFairRoster({
  flatmates: flatmatesAllOnLeave,
  chores: DEFAULT_CHORES,
  previousWeekAssignments: [],
  history: [],
  targetWeek: 1
});
console.log('Test 6 (All flatmates on leave):', !t6.success && t6.reason === 'ALL_ON_LEAVE' ? 'PASSED (Safely handled)' : 'FAILED');
if (t6.success) throw new Error('Test 6 Failed: Should not succeed when all are on leave');

// TEST 7: Week 1 and Week 2 rotation (NO consecutive repeat)
const week1 = generateFairRoster({
  flatmates: DEFAULT_FLATMATES,
  chores: DEFAULT_CHORES,
  previousWeekAssignments: [],
  history: [],
  targetWeek: 1
});

const week2 = generateFairRoster({
  flatmates: DEFAULT_FLATMATES,
  chores: DEFAULT_CHORES,
  previousWeekAssignments: week1.assignments,
  history: [{ week: 1, assignments: week1.assignments }],
  targetWeek: 2
});

let repeatedChores = 0;
for (const a2 of week2.assignments) {
  const match = week1.assignments.find(a1 => a1.flatmateId === a2.flatmateId && a1.choreId === a2.choreId);
  if (match) {
    repeatedChores++;
    console.error(`Repeated chore found: Flatmate ${a2.flatmateId} has chore ${a2.choreId} in both weeks!`);
  }
}
console.log('Test 7 (Consecutive Week Rotation Check):', repeatedChores === 0 ? 'PASSED (0 consecutive repeats)' : 'FAILED');
if (repeatedChores > 0) throw new Error('Test 7 Failed: Repeated chores in consecutive weeks!');

console.log('--- ALL 7 TESTS PASSED SUCCESSFULLY! ---');
