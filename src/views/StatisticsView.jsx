import React, { useState } from 'react';
import {
  BarChart3,
  PieChart,
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  Scale,
  Award,
  Calendar,
  Layers
} from 'lucide-react';
import { DifficultyBadge } from '../components/DifficultyBadge.jsx';

export function StatisticsView({
  week,
  flatmates,
  chores,
  assignments,
  history
}) {
  const [scope, setScope] = useState('ALL_TIME'); // 'CURRENT_WEEK' | 'ALL_TIME'

  const choreMap = {};
  for (const c of chores) choreMap[c.id] = c;

  // Flatten all historical assignments together with current week for all-time stats
  const allHistoricalAssignments = [];
  for (const h of history) {
    if (Array.isArray(h.assignments)) {
      allHistoricalAssignments.push(...h.assignments);
    }
  }

  // Calculate per flatmate statistics
  const statsByFlatmate = flatmates.map((flatmate) => {
    let completedChoresCount = 0;
    let completedDifficultySum = 0;
    let pendingChoresCount = 0;
    let pendingDifficultySum = 0;

    if (scope === 'CURRENT_WEEK') {
      const currentFlatmateAssignments = assignments.filter(a => a.flatmateId === flatmate.id);
      for (const a of currentFlatmateAssignments) {
        const chore = choreMap[a.choreId];
        const diff = chore?.difficulty || a.difficulty || 1;
        if (a.status === 'DONE') {
          completedChoresCount++;
          completedDifficultySum += diff;
        } else {
          pendingChoresCount++;
          pendingDifficultySum += diff;
        }
      }
    } else {
      // All-Time
      // Historical
      for (const item of allHistoricalAssignments) {
        if (item.flatmateId === flatmate.id) {
          const diff = item.difficulty || choreMap[item.choreId]?.difficulty || 1;
          if (item.status === 'DONE') {
            completedChoresCount++;
            completedDifficultySum += diff;
          } else {
            pendingChoresCount++;
            pendingDifficultySum += diff;
          }
        }
      }
      // Plus current week
      const currentFlatmateAssignments = assignments.filter(a => a.flatmateId === flatmate.id);
      for (const a of currentFlatmateAssignments) {
        const chore = choreMap[a.choreId];
        const diff = chore?.difficulty || a.difficulty || 1;
        if (a.status === 'DONE') {
          completedChoresCount++;
          completedDifficultySum += diff;
        } else {
          pendingChoresCount++;
          pendingDifficultySum += diff;
        }
      }
    }

    const totalTasks = completedChoresCount + pendingChoresCount;
    const rate = totalTasks > 0 ? Math.round((completedChoresCount / totalTasks) * 100) : 0;

    return {
      flatmate,
      completedChoresCount,
      completedDifficultySum,
      pendingChoresCount,
      pendingDifficultySum,
      totalTasks,
      rate
    };
  });

  // Aggregated totals
  const totalCompleted = statsByFlatmate.reduce((acc, s) => acc + s.completedChoresCount, 0);
  const totalCompletedPoints = statsByFlatmate.reduce((acc, s) => acc + s.completedDifficultySum, 0);
  const totalPending = statsByFlatmate.reduce((acc, s) => acc + s.pendingChoresCount, 0);
  const totalTasksAll = totalCompleted + totalPending;
  const overallRate = totalTasksAll > 0 ? Math.round((totalCompleted / totalTasksAll) * 100) : 0;

  // Maximum difficulty points for relative bar widths
  const maxDifficultyPoints = Math.max(...statsByFlatmate.map(s => s.completedDifficultySum), 1);
  const maxChores = Math.max(...statsByFlatmate.map(s => s.completedChoresCount), 1);

  // Difficulty distribution of defined chores
  const diffCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const c of chores) {
    if (diffCounts[c.difficulty] !== undefined) {
      diffCounts[c.difficulty]++;
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Scope Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              Household Fairness & Completion Statistics
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Objective metrics tracking workload distribution and completed effort without subjective rankings.
          </p>
        </div>

        {/* Scope Pill Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setScope('ALL_TIME')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              scope === 'ALL_TIME'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All-Time History
          </button>
          <button
            type="button"
            onClick={() => setScope('CURRENT_WEEK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              scope === 'CURRENT_WEEK'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Week {week} Only
          </button>
        </div>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Chores</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{totalCompleted}</span>
            <span className="text-xs text-slate-400">tasks finished</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Done
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Difficulty Points Done</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-600">{totalCompletedPoints}</span>
            <span className="text-xs text-slate-400">workload pts</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 font-semibold">
            <Zap className="w-3.5 h-3.5" /> Total Energy Invested
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Chores</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{totalPending}</span>
            <span className="text-xs text-slate-400">tasks remaining</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
            <Clock className="w-3.5 h-3.5" /> In Progress
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completion Rate</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{overallRate}%</span>
            <span className="text-xs text-slate-400">overall ratio</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${overallRate}%` }} />
          </div>
        </div>
      </div>

      {/* Main Charts & Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Workload Difficulty Points Comparison */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-600" />
                Workload Balance: Completed Difficulty Points
              </h3>
              <p className="text-xs text-slate-500">
                Total difficulty rating points contributed per flatmate ({scope === 'CURRENT_WEEK' ? `Week ${week}` : 'All-Time'})
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {statsByFlatmate.map((item) => {
              const percentage = Math.round((item.completedDifficultySum / maxDifficultyPoints) * 100);

              return (
                <div key={item.flatmate.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2 text-slate-800">
                      <span className="text-base">{item.flatmate.avatar}</span>
                      <span>{item.flatmate.name}</span>
                    </div>
                    <span className="font-mono text-indigo-700">
                      {item.completedDifficultySum} Points
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-3 rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              The algorithm optimizes assignments so each flatmate's cumulative difficulty points stay within an equal, fair threshold over time.
            </span>
          </div>
        </div>

        {/* CHART 2: Completed vs Pending Chores Bar Comparison */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Task Completion Ratio by Flatmate
              </h3>
              <p className="text-xs text-slate-500">
                Ratio of completed vs pending chores for each individual
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed
              </span>
              <span className="flex items-center gap-1 text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Pending
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {statsByFlatmate.map((item) => {
              const completedPct = item.totalTasks > 0 ? (item.completedChoresCount / item.totalTasks) * 100 : 0;
              const pendingPct = item.totalTasks > 0 ? (item.pendingChoresCount / item.totalTasks) * 100 : 0;

              return (
                <div key={item.flatmate.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2 text-slate-800">
                      <span className="text-base">{item.flatmate.avatar}</span>
                      <span>{item.flatmate.name}</span>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {item.completedChoresCount} Done / {item.pendingChoresCount} Pending ({item.rate}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 flex overflow-hidden">
                    <div
                      className="bg-emerald-500 h-3 transition-all duration-700"
                      style={{ width: `${completedPct}%` }}
                    />
                    <div
                      className="bg-amber-400 h-3 transition-all duration-700"
                      style={{ width: `${pendingPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500">
            Factual breakdown of household responsibilities completed without ranking or scoring comparisons.
          </div>
        </div>
      </div>

      {/* Detailed Factual Statistics Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">
            Flatmate Performance Breakdown Table
          </h3>
          <p className="text-xs text-slate-500">
            Comprehensive tabular records of completed chores, difficulty points, and pending items
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-5">Flatmate</th>
                <th className="py-3.5 px-5">Completed Chores</th>
                <th className="py-3.5 px-5">Total Difficulty Points</th>
                <th className="py-3.5 px-5">Pending Chores</th>
                <th className="py-3.5 px-5">Total Assigned</th>
                <th className="py-3.5 px-5 text-right">Completion %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {statsByFlatmate.map((item) => (
                <tr key={item.flatmate.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-2.5">
                    <span className="text-xl">{item.flatmate.avatar}</span>
                    <div>
                      <span>{item.flatmate.name}</span>
                      {item.flatmate.onLeave && (
                        <span className="ml-2 text-[10px] text-purple-600 font-semibold bg-purple-50 px-1.5 py-0.5 rounded">
                          On Leave
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-bold text-emerald-600 font-mono text-sm">
                    {item.completedChoresCount}
                  </td>
                  <td className="py-3.5 px-5 font-bold text-indigo-600 font-mono text-sm">
                    {item.completedDifficultySum} pts
                  </td>
                  <td className="py-3.5 px-5 font-bold text-amber-600 font-mono text-sm">
                    {item.pendingChoresCount}
                  </td>
                  <td className="py-3.5 px-5 font-medium text-slate-700 font-mono">
                    {item.totalTasks}
                  </td>
                  <td className="py-3.5 px-5 text-right font-black text-slate-900 font-mono text-sm">
                    {item.rate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
