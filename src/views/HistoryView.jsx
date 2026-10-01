import React, { useState } from 'react';
import {
  History as HistoryIcon,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  RotateCw,
  Trash2
} from 'lucide-react';
import { DifficultyBadge } from '../components/DifficultyBadge.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { ChoreIcon } from '../components/ChoreIcon.jsx';

export function HistoryView({
  history,
  flatmates,
  chores,
  currentWeek,
  onClearHistory
}) {
  const [selectedFlatmate, setSelectedFlatmate] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedWeek, setExpandedWeek] = useState(null);

  const choreMap = {};
  for (const c of chores) choreMap[c.id] = c;

  const flatmateMap = {};
  for (const f of flatmates) flatmateMap[f.id] = f;

  // Filter history records
  const filteredHistory = history.filter(weekRecord => {
    return true; // We filter inside assignments
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-indigo-600" />
            Weekly Assignment History & Rotation Audit
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Archived logs of past chore rosters demonstrating fair weekly rotations and non-consecutive assignments
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History Logs</span>
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search chore or flatmate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Filter Flatmate:</span>
          <select
            value={selectedFlatmate}
            onChange={(e) => setSelectedFlatmate(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Flatmates</option>
            {flatmates.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* History Timeline */}
      {history.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
          <HistoryIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No archived history yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            When you complete Week 1 and click "NEXT WEEK", the completed week will be automatically archived into this rotation audit log.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {history.map((record, index) => {
            const weekNumber = record.week;
            const weekAssignments = Array.isArray(record.assignments) ? record.assignments : [];

            // Apply filters
            const visibleItems = weekAssignments.filter(item => {
              const chore = choreMap[item.choreId] || { title: item.choreTitle || '' };
              const flatmate = flatmateMap[item.flatmateId] || { name: item.flatmateName || '' };

              if (selectedFlatmate !== 'ALL' && item.flatmateId !== selectedFlatmate) {
                return false;
              }
              if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchChore = chore.title?.toLowerCase().includes(q);
                const matchFlatmate = flatmate.name?.toLowerCase().includes(q);
                if (!matchChore && !matchFlatmate) return false;
              }
              return true;
            });

            if (visibleItems.length === 0 && (selectedFlatmate !== 'ALL' || searchQuery.trim())) {
              return null;
            }

            const isDoneAll = weekAssignments.length > 0 && weekAssignments.every(a => a.status === 'DONE');
            const totalWeekPoints = weekAssignments.reduce((sum, a) => sum + (a.difficulty || choreMap[a.choreId]?.difficulty || 1), 0);

            return (
              <div
                key={weekNumber}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
              >
                {/* Week Header */}
                <div className="p-5 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                      W{weekNumber}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        WEEK {weekNumber}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {weekAssignments.length} Chores Assigned · {totalWeekPoints} Total Difficulty Points
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isDoneAll ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        100% Completed
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Archived Rotation
                      </span>
                    )}

                    {record.completedAt && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(record.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Assignments List */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-5">Flatmate</th>
                        <th className="py-3 px-5">Rotation Mapping</th>
                        <th className="py-3 px-5">Assigned Chore</th>
                        <th className="py-3 px-5">Difficulty</th>
                        <th className="py-3 px-5 text-right">Completion Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleItems.map((item, idx) => {
                        const flatmate = flatmateMap[item.flatmateId] || { name: item.flatmateName || 'Flatmate', avatar: '👤' };
                        const chore = choreMap[item.choreId] || { title: item.choreTitle || 'Chore', difficulty: item.difficulty || 1, icon: 'CheckSquare' };
                        const isDone = item.status === 'DONE';

                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-5 font-bold text-slate-900">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{flatmate.avatar}</span>
                                <span>{flatmate.name}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-5 font-mono text-indigo-600 font-bold">
                              {flatmate.name} → {chore.title}
                            </td>
                            <td className="py-3.5 px-5 font-semibold text-slate-800">
                              <div className="flex items-center gap-2">
                                <div className="p-1 rounded bg-slate-100 text-slate-700">
                                  <ChoreIcon name={chore.icon} className="w-3.5 h-3.5" />
                                </div>
                                <span>{chore.title}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-5">
                              <DifficultyBadge difficulty={chore.difficulty} size="sm" />
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <StatusBadge status={isDone ? 'DONE' : 'PENDING'} size="sm" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
