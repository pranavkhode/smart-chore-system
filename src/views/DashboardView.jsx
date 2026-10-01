import React from 'react';
import {
  Calendar,
  Users,
  UserCheck,
  CheckSquare,
  CheckCircle2,
  Clock,
  Percent,
  CalendarOff,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  RotateCw,
  Flame,
  Check
} from 'lucide-react';
import { DifficultyBadge } from '../components/DifficultyBadge.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { ChoreIcon } from '../components/ChoreIcon.jsx';

export function DashboardView({
  week,
  flatmates,
  chores,
  assignments,
  onToggleChoreDone,
  onToggleLeave,
  onNextWeek,
  onRebalance,
  onNavigate,
  assignmentWarning,
  assignmentError
}) {
  // Statistics calculations
  const totalFlatmates = flatmates.length;
  const availableFlatmates = flatmates.filter(f => !f.onLeave).length;
  const totalChores = chores.length;

  const totalAssigned = assignments.length;
  const completedChores = assignments.filter(a => a.status === 'DONE').length;
  const pendingChores = assignments.filter(a => a.status !== 'DONE').length;
  const completionPercentage = totalAssigned > 0 
    ? Math.round((completedChores / totalAssigned) * 100) 
    : 0;

  // Map chores by ID for quick lookup
  const choreMap = {};
  for (const c of chores) choreMap[c.id] = c;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Banner / Current Week Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/20">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Smart Workload Balancing</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Week {week} Chore Roster
            </h1>
            <p className="text-sm sm:text-base text-indigo-200/90 leading-relaxed">
              Household chores distributed fairly based on difficulty ratings and consecutive-week rotation. Keep the house spotless together!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onRebalance}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-white text-xs sm:text-sm font-semibold rounded-xl border border-slate-600/60 shadow-sm transition-all cursor-pointer backdrop-blur-xs"
              title="Recalculate fair distribution"
            >
              <RotateCw className="w-4 h-4 text-indigo-300" />
              <span>Rebalance Roster</span>
            </button>
            <button
              onClick={onNextWeek}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all cursor-pointer"
            >
              <span>Next Week</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Warning / Error notice if any */}
      {assignmentError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Chore Assignment Notice</h4>
            <p className="text-xs text-rose-700 mt-0.5">{assignmentError}</p>
          </div>
        </div>
      )}

      {assignmentWarning && !assignmentError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Notice</h4>
            <p className="text-xs text-amber-700 mt-0.5">{assignmentWarning}</p>
          </div>
        </div>
      )}

      {/* 7 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        {/* Current Week */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Current</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900">Week {week}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Active rotation</p>
          </div>
        </div>

        {/* Total Flatmates */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Flatmates</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900">{totalFlatmates}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Household members</p>
          </div>
        </div>

        {/* Available Flatmates */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Available</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-600">{availableFlatmates}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Active on duty</p>
          </div>
        </div>

        {/* Total Chores */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Chores</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900">{totalChores}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Configured duties</p>
          </div>
        </div>

        {/* Completed Chores */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Completed</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-600">{completedChores}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Marked done</p>
          </div>
        </div>

        {/* Pending Chores */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-amber-600">{pendingChores}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Awaiting completion</p>
          </div>
        </div>

        {/* Overall Completion % */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-3 lg:col-span-1 hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Overall Done</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-indigo-600">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Flatmates Individual Cards Grid (Soham, Pranay, Pranav, Himanshu) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Flatmate Duty Cards
            </h2>
            <p className="text-xs text-slate-500">
              Current weekly assignments, difficulty points, and completion actions
            </p>
          </div>
          <button
            onClick={() => onNavigate('flatmates')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Manage Flatmates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {flatmates.map((flatmate) => {
            const flatmateAssignments = assignments.filter(a => a.flatmateId === flatmate.id);
            const totalDiff = flatmateAssignments.reduce((acc, a) => {
              const chore = choreMap[a.choreId];
              return acc + (chore?.difficulty || 0);
            }, 0);

            const allDone = flatmateAssignments.length > 0 && flatmateAssignments.every(a => a.status === 'DONE');

            return (
              <div
                key={flatmate.id}
                className={`relative rounded-2xl bg-white border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  flatmate.onLeave
                    ? 'border-purple-200 bg-purple-50/20 opacity-80'
                    : allDone
                    ? 'border-emerald-200 shadow-emerald-500/5 shadow-md'
                    : 'border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Flatmate Header */}
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shadow-inner border border-slate-200/60">
                        {flatmate.avatar}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          {flatmate.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {flatmateAssignments.length} {flatmateAssignments.length === 1 ? 'chore' : 'chores'} · {totalDiff} pts
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {flatmate.onLeave ? (
                      <StatusBadge status="ON_LEAVE" size="sm" />
                    ) : flatmateAssignments.length === 0 ? (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        Off Duty
                      </span>
                    ) : allDone ? (
                      <StatusBadge status="DONE" size="sm" />
                    ) : (
                      <StatusBadge status="PENDING" size="sm" />
                    )}
                  </div>

                  {/* Completed chores all-time stat */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <span>Total Completed Chores:</span>
                    <span className="font-bold font-mono text-indigo-700">
                      {flatmate.totalCompleted || 0}
                    </span>
                  </div>
                </div>

                {/* Assigned Chores Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Assigned This Week:
                    </span>

                    {flatmate.onLeave ? (
                      <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200 text-purple-800 text-xs flex items-center gap-2">
                        <CalendarOff className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>On leave this week. No chores assigned per fairness policy.</span>
                      </div>
                    ) : flatmateAssignments.length === 0 ? (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs italic">
                        No chores assigned this week (Rest rotation).
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {flatmateAssignments.map((a) => {
                          const chore = choreMap[a.choreId] || { title: 'Unknown Chore', difficulty: 1, icon: 'CheckSquare' };
                          const isDone = a.status === 'DONE';

                          return (
                            <div
                              key={a.id}
                              className={`p-3 rounded-xl border transition-all ${
                                isDone
                                  ? 'bg-emerald-50/70 border-emerald-200'
                                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className={`p-1.5 rounded-lg ${isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-600'}`}>
                                    <ChoreIcon name={chore.icon} className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <h4 className={`text-xs font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                      {chore.title}
                                    </h4>
                                    <div className="mt-1">
                                      <DifficultyBadge difficulty={chore.difficulty} showStars={false} size="sm" />
                                    </div>
                                  </div>
                                </div>

                                {/* Mark Done Action Button */}
                                <button
                                  type="button"
                                  onClick={() => onToggleChoreDone(a.id)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                                    isDone
                                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs'
                                  }`}
                                  title={isDone ? 'Click to mark pending' : 'Click to mark done'}
                                >
                                  {isDone ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      Done
                                    </>
                                  ) : (
                                    <>Mark Done</>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Leave Toggle Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Leave Status:</span>
                    <button
                      type="button"
                      onClick={() => onToggleLeave(flatmate.id)}
                      className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                        flatmate.onLeave
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {flatmate.onLeave ? 'Return from Leave' : 'Set On Leave'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Weekly Roster Table Preview */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Current Week {week} Roster Master View
            </h3>
            <p className="text-xs text-slate-500">
              Live status of each chore assigned for this rotation
            </p>
          </div>
          <button
            onClick={() => onNavigate('roster')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Open Dedicated Roster</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {assignments.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No active assignments. Click "Rebalance Roster" or check flatmate leave statuses.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Chore</th>
                  <th className="py-3 px-4">Assigned Flatmate</th>
                  <th className="py-3 px-4">Difficulty Level</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((a) => {
                  const chore = choreMap[a.choreId] || { title: 'Unknown', difficulty: 1, icon: 'CheckSquare' };
                  const flatmate = flatmates.find(f => f.id === a.flatmateId) || { name: 'Unknown', avatar: '👤' };
                  const isDone = a.status === 'DONE';

                  return (
                    <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                          <ChoreIcon name={chore.icon} className="w-4 h-4" />
                        </div>
                        <span className={isDone ? 'line-through text-slate-400' : ''}>
                          {chore.title}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{flatmate.avatar}</span>
                          <span className="font-medium text-slate-800">{flatmate.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <DifficultyBadge difficulty={chore.difficulty} size="sm" />
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={isDone ? 'DONE' : 'PENDING'} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onToggleChoreDone(a.id)}
                          className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                            isDone
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                          }`}
                        >
                          {isDone ? 'Mark Pending' : 'Mark Done'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
