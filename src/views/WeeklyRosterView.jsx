import React, { useState } from 'react';
import {
  CalendarCheck,
  ArrowRight,
  RotateCw,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  Calendar,
  Sparkles,
  AlertTriangle,
  Printer,
  CalendarOff,
  Check
} from 'lucide-react';
import { DifficultyBadge } from '../components/DifficultyBadge.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { ChoreIcon } from '../components/ChoreIcon.jsx';

export function WeeklyRosterView({
  week,
  flatmates,
  chores,
  assignments,
  onToggleChoreDone,
  onNextWeek,
  onRebalance,
  assignmentWarning,
  assignmentError
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'PENDING' | 'DONE'

  const choreMap = {};
  for (const c of chores) choreMap[c.id] = c;

  const flatmateMap = {};
  for (const f of flatmates) flatmateMap[f.id] = f;

  const totalAssigned = assignments.length;
  const doneCount = assignments.filter(a => a.status === 'DONE').length;
  const pendingCount = totalAssigned - doneCount;
  const completionPercentage = totalAssigned > 0 
    ? Math.round((doneCount / totalAssigned) * 100) 
    : 0;

  // Filtered assignments
  const filteredAssignments = assignments.filter(a => {
    if (filterStatus === 'PENDING') return a.status !== 'DONE';
    if (filterStatus === 'DONE') return a.status === 'DONE';
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Prominent Next Week & Status Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Active Rotation Schedule
              </span>
              {completionPercentage === 100 && (
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All Done!
                </span>
              )}
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Weekly Roster — Week {week}
            </h1>
            
            <p className="text-sm text-slate-500 max-w-xl">
              Automatic rotation balances chore difficulties and guarantees flatmates rotate duties every week without consecutive repeats.
            </p>

            {/* Overall Week Completion Progress Bar */}
            <div className="pt-2 max-w-md">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
                <span>Week Completion Progress</span>
                <span className="font-mono text-indigo-600 font-bold">{doneCount}/{totalAssigned} Done ({completionPercentage}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* LARGE PROMINENT NEXT WEEK BUTTON */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onRebalance}
              type="button"
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              title="Reshuffle duties among available flatmates"
            >
              <RotateCw className="w-4 h-4 text-slate-600" />
              <span>Reshuffle Roster</span>
            </button>

            <button
              onClick={onNextWeek}
              type="button"
              className="group relative px-7 py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-500 hover:via-indigo-600 hover:to-violet-600 active:scale-98 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 transition-all cursor-pointer"
            >
              <span className="tracking-wide">NEXT WEEK</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Warning or Error Notices */}
      {assignmentError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Cannot Generate Assignments</h4>
            <p className="text-xs text-rose-700 mt-0.5">{assignmentError}</p>
          </div>
        </div>
      )}

      {assignmentWarning && !assignmentError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Roster Notice</h4>
            <p className="text-xs text-amber-700 mt-0.5">{assignmentWarning}</p>
          </div>
        </div>
      )}

      {/* Control Bar: Filters, Views, and Print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">Filter:</span>
          {['ALL', 'PENDING', 'DONE'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {status === 'ALL' && `All (${totalAssigned})`}
              {status === 'PENDING' && `Pending (${pendingCount})`}
              {status === 'DONE' && `Done (${doneCount})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handlePrint}
            type="button"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer hidden sm:block"
            title="Print weekly roster for fridge posting"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Roster Display */}
      {filteredAssignments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No assignments match your filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try switching filter to "All", or click "Reshuffle Roster" if assignments have not yet been generated.
          </p>
          <button
            onClick={() => setFilterStatus('ALL')}
            type="button"
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
          >
            Show All Chores
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW: Flatmate-grouped Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {flatmates.map((flatmate) => {
            const flatmateAssignments = filteredAssignments.filter(a => a.flatmateId === flatmate.id);
            const totalDiff = flatmateAssignments.reduce((acc, a) => {
              const chore = choreMap[a.choreId];
              return acc + (chore?.difficulty || 0);
            }, 0);

            return (
              <div
                key={flatmate.id}
                className={`rounded-2xl bg-white border transition-all duration-200 p-5 flex flex-col justify-between shadow-xs ${
                  flatmate.onLeave
                    ? 'border-purple-200 bg-purple-50/20 opacity-75'
                    : 'border-slate-200/90 hover:border-indigo-300'
                }`}
              >
                <div>
                  {/* Flatmate Header */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-2xl shadow-inner border border-slate-200">
                        {flatmate.avatar}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">
                          {flatmate.name}
                        </h3>
                        <span className="text-xs text-slate-500">
                          {flatmateAssignments.length} {flatmateAssignments.length === 1 ? 'task' : 'tasks'} · {totalDiff} pts
                        </span>
                      </div>
                    </div>

                    {flatmate.onLeave && (
                      <StatusBadge status="ON_LEAVE" size="sm" />
                    )}
                  </div>

                  {/* Tasks List */}
                  <div className="mt-4 space-y-2.5">
                    {flatmate.onLeave ? (
                      <div className="p-3 rounded-xl bg-purple-50 text-purple-800 text-xs flex items-center gap-2">
                        <CalendarOff className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>On leave. Protected from chore assignments.</span>
                      </div>
                    ) : flatmateAssignments.length === 0 ? (
                      <div className="p-3 rounded-xl bg-slate-50 text-slate-400 text-xs italic">
                        No chores assigned for this filter/week.
                      </div>
                    ) : (
                      flatmateAssignments.map((a) => {
                        const chore = choreMap[a.choreId] || { title: 'Unknown Chore', difficulty: 1, icon: 'CheckSquare' };
                        const isDone = a.status === 'DONE';

                        return (
                          <div
                            key={a.id}
                            className={`p-3 rounded-xl border transition-all ${
                              isDone
                                ? 'bg-emerald-50/70 border-emerald-200 shadow-xs'
                                : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2.5">
                                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                                  isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-600'
                                }`}>
                                  <ChoreIcon name={chore.icon} className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className={`text-xs font-bold leading-snug ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                    {chore.title}
                                  </h4>
                                  <div className="mt-1 flex items-center gap-1.5">
                                    <DifficultyBadge difficulty={chore.difficulty} showStars={false} size="sm" />
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => onToggleChoreDone(a.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                                  isDone
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs'
                                }`}
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
                      })
                    )}
                  </div>
                </div>

                {/* Subfooter */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Weekly Workload:</span>
                  <span className="font-mono font-bold text-slate-700">{totalDiff} Difficulty Pts</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-5">Week</th>
                  <th className="py-3.5 px-5">Assigned Flatmate</th>
                  <th className="py-3.5 px-5">Chore Task</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Difficulty</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Completion Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssignments.map((a) => {
                  const chore = choreMap[a.choreId] || { title: 'Unknown', difficulty: 1, icon: 'CheckSquare', category: 'General' };
                  const flatmate = flatmateMap[a.flatmateId] || { name: 'Unknown', avatar: '👤' };
                  const isDone = a.status === 'DONE';

                  return (
                    <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-bold font-mono text-indigo-700">
                        Week {week}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{flatmate.avatar}</span>
                          <span className="font-bold text-slate-900 text-sm">{flatmate.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                            <ChoreIcon name={chore.icon} className="w-4 h-4" />
                          </div>
                          <span className={isDone ? 'line-through text-slate-400' : ''}>
                            {chore.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {chore.category || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <DifficultyBadge difficulty={chore.difficulty} size="sm" />
                      </td>
                      <td className="py-3.5 px-5">
                        <StatusBadge status={isDone ? 'DONE' : 'PENDING'} size="sm" />
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => onToggleChoreDone(a.id)}
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                          }`}
                        >
                          {isDone ? 'Done ✓' : 'Mark Done'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
