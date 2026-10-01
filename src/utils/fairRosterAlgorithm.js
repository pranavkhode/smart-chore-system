/**
 * Smart Fair Chore Assignment Algorithm
 * 
 * Rules:
 * 1. Distribute chores fairly among available flatmates (never someone on leave).
 * 2. Consider chore difficulty (1-5) to balance workload evenly.
 * 3. Never assign the same person the same chore for two consecutive weeks (unless mathematically impossible).
 * 4. Balance current week workload and historical cumulative workload.
 * 5. Handle uneven counts: more chores than flatmates (multi-chores) or fewer chores (some get 0 chores).
 * 6. Avoid giving one person multiple high-difficulty chores.
 * 7. Safely handle edge cases: 0 flatmates, 0 chores, all on leave, 1 available flatmate, etc.
 */

/**
 * Calculates variance of an array of numbers
 */
function calculateVariance(numbers) {
  if (numbers.length <= 1) return 0;
  const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  return numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
}

/**
 * Helper to shuffle array with Fisher-Yates
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Evaluates an assignment mapping: { flatmateId: [choreObj, ...] }
 */
function scoreAssignment(
  assignmentMap,
  availableFlatmates,
  prevWeekMap,
  cumulativeStatsMap,
  choresTotalCount
) {
  let penalty = 0;
  let consecutiveRepeats = 0;
  const difficulties = [];
  const cumulativeDifficulties = [];
  const choreCounts = [];

  for (const flatmate of availableFlatmates) {
    const assigned = assignmentMap[flatmate.id] || [];
    choreCounts.push(assigned.length);

    let flatmateDifficulty = 0;
    let highDifficultyCount = 0;

    for (const chore of assigned) {
      flatmateDifficulty += chore.difficulty;
      if (chore.difficulty >= 4) {
        highDifficultyCount++;
      }

      // Check consecutive repeat
      const prevChores = prevWeekMap[flatmate.id] || [];
      if (prevChores.includes(chore.id)) {
        consecutiveRepeats++;
      }
    }

    difficulties.push(flatmateDifficulty);
    const pastDiff = cumulativeStatsMap[flatmate.id]?.totalDifficulty || 0;
    cumulativeDifficulties.push(pastDiff + flatmateDifficulty);

    // Penalize clustering of multiple very hard chores on one person
    if (highDifficultyCount > 1 && availableFlatmates.length > 1) {
      penalty += (highDifficultyCount - 1) * 8000;
    }
  }

  // Heavy penalty for consecutive repeats (if more than 1 flatmate available)
  if (availableFlatmates.length > 1) {
    penalty += consecutiveRepeats * 500000;
  }

  // Penalty for chore count disparity
  const maxCount = Math.max(...choreCounts);
  const minCount = Math.min(...choreCounts);
  const maxAllowedSpread = availableFlatmates.length >= choresTotalCount ? 1 : Math.ceil(choresTotalCount / availableFlatmates.length) - Math.floor(choresTotalCount / availableFlatmates.length);
  if (maxCount - minCount > Math.max(1, maxAllowedSpread)) {
    penalty += (maxCount - minCount) * 15000;
  }

  // Workload difficulty variance within current week
  const diffVariance = calculateVariance(difficulties);
  penalty += diffVariance * 1200;

  // Cumulative historical balance
  const cumulativeVariance = calculateVariance(cumulativeDifficulties);
  penalty += cumulativeVariance * 300;

  return {
    penalty,
    consecutiveRepeats,
    diffVariance,
    difficulties,
    choreCounts
  };
}

/**
 * Generate Smart Fair Assignments
 * 
 * @param {Array} flatmates All flatmates
 * @param {Array} chores All chores
 * @param {Array} previousWeekAssignments Assignments from the immediate previous week (week - 1)
 * @param {Array} history Full history for cumulative balancing
 * @param {number} targetWeek The week number being generated
 * @returns {Object} { success: boolean, reason?: string, message?: string, assignments: Array }
 */
export function generateFairRoster({
  flatmates = [],
  chores = [],
  previousWeekAssignments = [],
  history = [],
  targetWeek = 1
}) {
  // Edge Case 1: No flatmates
  if (!flatmates || flatmates.length === 0) {
    return {
      success: false,
      reason: 'NO_FLATMATES',
      message: 'No flatmates registered. Please add at least one flatmate to generate assignments.',
      assignments: []
    };
  }

  // Edge Case 2: No chores
  if (!chores || chores.length === 0) {
    return {
      success: false,
      reason: 'NO_CHORES',
      message: 'No chores registered. Please add at least one chore to generate assignments.',
      assignments: []
    };
  }

  // Filter available flatmates (not on leave)
  const availableFlatmates = flatmates.filter(f => !f.onLeave);

  // Edge Case 3: All flatmates are on leave
  if (availableFlatmates.length === 0) {
    return {
      success: false,
      reason: 'ALL_ON_LEAVE',
      message: 'All flatmates are currently marked "On Leave". Chores cannot be assigned until at least one flatmate is active.',
      assignments: []
    };
  }

  // Map of previous week chores: { flatmateId: [choreId, ...] }
  const prevWeekMap = {};
  for (const f of flatmates) {
    prevWeekMap[f.id] = [];
  }
  if (Array.isArray(previousWeekAssignments)) {
    for (const a of previousWeekAssignments) {
      if (a.flatmateId && a.choreId) {
        if (!prevWeekMap[a.flatmateId]) prevWeekMap[a.flatmateId] = [];
        prevWeekMap[a.flatmateId].push(a.choreId);
      }
    }
  }

  // Compute cumulative historical difficulty per flatmate
  const cumulativeStatsMap = {};
  for (const f of flatmates) {
    cumulativeStatsMap[f.id] = { totalDifficulty: 0, totalChores: 0 };
  }
  if (Array.isArray(history)) {
    for (const weekRecord of history) {
      if (Array.isArray(weekRecord.assignments)) {
        for (const item of weekRecord.assignments) {
          if (item.flatmateId && cumulativeStatsMap[item.flatmateId]) {
            cumulativeStatsMap[item.flatmateId].totalDifficulty += (item.difficulty || 0);
            cumulativeStatsMap[item.flatmateId].totalChores += 1;
          }
        }
      }
    }
  }

  // Edge Case 8: Only one available flatmate
  if (availableFlatmates.length === 1) {
    const loneFlatmate = availableFlatmates[0];
    const assignments = chores.map(chore => ({
      id: `assign-w${targetWeek}-${chore.id}-${loneFlatmate.id}-${Date.now().toString(36)}`,
      week: targetWeek,
      choreId: chore.id,
      flatmateId: loneFlatmate.id,
      status: 'PENDING',
      completedAt: null,
      difficulty: chore.difficulty
    }));

    return {
      success: true,
      reason: 'SINGLE_FLATMATE',
      warning: `Only ${loneFlatmate.name} is available. All household chores have been assigned to them.`,
      assignments
    };
  }

  // Chores sorted by difficulty descending (hardest first to balance nicely)
  const sortedChores = [...chores].sort((a, b) => b.difficulty - a.difficulty);

  let bestAssignmentMap = null;
  let bestScore = Infinity;

  // Run combinatorial search with multi-start heuristics
  // 1. Try systematic shift rotation based on targetWeek
  // 2. Try greedy least-loaded with anti-consecutive constraint
  // 3. Try randomized trials (1200 runs takes ~2ms)
  const numIterations = 1500;

  for (let iter = 0; iter < numIterations; iter++) {
    const candidateMap = {};
    for (const f of availableFlatmates) {
      candidateMap[f.id] = [];
    }

    // Determine chore ordering for this trial
    let choreOrder;
    if (iter === 0) {
      // Deterministic sorted
      choreOrder = [...sortedChores];
    } else if (iter === 1) {
      // Shifted by week number
      const shift = targetWeek % availableFlatmates.length;
      choreOrder = [...sortedChores];
      choreOrder = choreOrder.map((c, i) => choreOrder[(i + shift) % choreOrder.length]);
    } else {
      // Shuffled
      choreOrder = shuffleArray(sortedChores);
    }

    // Assign each chore to the best candidate available
    let possible = true;
    for (const chore of choreOrder) {
      // Candidate flatmates sorted by:
      // 1. Did not have this chore last week (if possible)
      // 2. Lowest current assigned difficulty
      // 3. Lowest chore count
      // 4. Lowest cumulative historical difficulty
      const scoredFlatmates = availableFlatmates.map(f => {
        const currentList = candidateMap[f.id] || [];
        const currentDiff = currentList.reduce((acc, c) => acc + c.difficulty, 0);
        const hadLastWeek = prevWeekMap[f.id]?.includes(chore.id) || false;
        const cumDiff = cumulativeStatsMap[f.id]?.totalDifficulty || 0;

        let weight = currentDiff * 100 + currentList.length * 50 + cumDiff * 2;
        if (hadLastWeek && availableFlatmates.length > 1) {
          // strong penalty to avoid repeating
          weight += 100000;
        }

        // Add small jitter for randomized trials
        if (iter > 1) {
          weight += Math.random() * 20;
        }

        return { flatmate: f, weight, hadLastWeek };
      });

      scoredFlatmates.sort((a, b) => a.weight - b.weight);
      const chosen = scoredFlatmates[0].flatmate;
      candidateMap[chosen.id].push(chore);
    }

    const evaluation = scoreAssignment(
      candidateMap,
      availableFlatmates,
      prevWeekMap,
      cumulativeStatsMap,
      chores.length
    );

    if (evaluation.penalty < bestScore) {
      bestScore = evaluation.penalty;
      bestAssignmentMap = candidateMap;

      // If we found a zero-repeat, perfectly balanced solution early, we can exit early
      if (evaluation.consecutiveRepeats === 0 && evaluation.diffVariance <= 1.0 && iter > 200) {
        break;
      }
    }
  }

  // Convert bestAssignmentMap to assignment records
  const resultAssignments = [];
  for (const flatmate of availableFlatmates) {
    const assignedChores = bestAssignmentMap[flatmate.id] || [];
    for (const chore of assignedChores) {
      resultAssignments.push({
        id: `assign-w${targetWeek}-${chore.id}-${flatmate.id}-${Math.random().toString(36).substring(2, 7)}`,
        week: targetWeek,
        choreId: chore.id,
        flatmateId: flatmate.id,
        status: 'PENDING',
        completedAt: null,
        difficulty: chore.difficulty
      });
    }
  }

  return {
    success: true,
    targetWeek,
    assignments: resultAssignments,
    availableCount: availableFlatmates.length,
    totalChoresCount: chores.length
  };
}

/**
 * Rebalances active assignments for the current week when a flatmate's leave status changes
 * or flatmates/chores are updated.
 */
export function rebalanceCurrentWeek({
  currentAssignments = [],
  flatmates = [],
  chores = [],
  previousWeekAssignments = [],
  history = [],
  currentWeek = 1,
  preserveCompleted = true
}) {
  const availableFlatmates = flatmates.filter(f => !f.onLeave);

  if (availableFlatmates.length === 0) {
    return {
      success: false,
      reason: 'ALL_ON_LEAVE',
      message: 'All flatmates are on leave. Current assignments cannot be completed until someone returns.',
      assignments: []
    };
  }

  // Keep completed assignments if preserveCompleted is true and flatmate is still available
  const completedToKeep = [];
  const choresNeedingAssignment = [];

  if (preserveCompleted) {
    const completedMap = {};
    for (const a of currentAssignments) {
      const flatmate = flatmates.find(f => f.id === a.flatmateId);
      if (a.status === 'DONE' && flatmate && !flatmate.onLeave) {
        completedToKeep.push(a);
        completedMap[a.choreId] = true;
      }
    }

    for (const chore of chores) {
      if (!completedMap[chore.id]) {
        choresNeedingAssignment.push(chore);
      }
    }
  } else {
    choresNeedingAssignment.push(...chores);
  }

  if (choresNeedingAssignment.length === 0) {
    return {
      success: true,
      assignments: completedToKeep
    };
  }

  const generated = generateFairRoster({
    flatmates,
    chores: choresNeedingAssignment,
    previousWeekAssignments,
    history,
    targetWeek: currentWeek
  });

  if (!generated.success) {
    return generated;
  }

  return {
    success: true,
    assignments: [...completedToKeep, ...generated.assignments]
  };
}
