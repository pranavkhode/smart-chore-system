import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  RotateCw,
  ArrowRight,
  UserCheck,
  CalendarOff,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  BarChart2,
  History as HistoryIcon,
  CheckSquare,
  Users,
  AlertTriangle,
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import { DifficultyBadge } from './components/DifficultyBadge.jsx';
import { StatusBadge } from './components/StatusBadge.jsx';
import { ChoreIcon, AVAILABLE_CHORE_ICONS } from './components/ChoreIcon.jsx';
import { Modal } from './components/Modal.jsx';
import { TestScenariosModal } from './components/TestScenariosModal.jsx';
import {
  loadStateFromStorage,
  saveStateToStorage,
  resetStorageToDefaults
} from './utils/storage.js';
import {
  generateFairRoster,
  rebalanceCurrentWeek
} from './utils/fairRosterAlgorithm.js';
import { fireSuccessConfetti, fireGrandCelebration } from './utils/confetti.js';
import { DEFAULT_FLATMATES, DEFAULT_CHORES, DIFFICULTY_LEVELS } from './constants/defaultData.js';

export function App() {
  const [appState, setAppState] = useState(() => loadStateFromStorage());
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'chores' | 'flatmates' | 'stats' | 'history'
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Modals for adding/editing
  const [isAddChoreOpen, setIsAddChoreOpen] = useState(false);
  const [editingChore, setEditingChore] = useState(null);
  const [isAddFlatmateOpen, setIsAddFlatmateOpen] = useState(false);
  const [editingFlatmate, setEditingFlatmate] = useState(null);

  // Form states
  const [choreForm, setChoreForm] = useState({ title: '', difficulty: 3, icon: 'Sparkles', category: 'Housekeeping' });
  const [flatmateForm, setFlatmateForm] = useState({ name: '', avatar: '👨‍💻' });

  // Sync to localStorage
  useEffect(() => {
    saveStateToStorage(appState);
  }, [appState]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(curr => (curr?.id ? null : curr));
    }, 3000);
  }, []);

  const { week, flatmates, chores, assignments, history } = appState;

  // Map helpers
  const choreMap = {};
  for (const c of chores) choreMap[c.id] = c;
  const flatmateMap = {};
  for (const f of flatmates) flatmateMap[f.id] = f;

  // Key stats
  const availableFlatmates = flatmates.filter(f => !f.onLeave);
  const totalAssigned = assignments.length;
  const completedChores = assignments.filter(a => a.status === 'DONE').length;
  const pendingChores = totalAssigned - completedChores;
  const completionPercentage = totalAssigned > 0 ? Math.round((completedChores / totalAssigned) * 100) : 0;

  // --- ACTIONS ---

  const handleToggleChoreDone = (assignmentId) => {
    setAppState(prev => {
      let toggledToDone = false;
      let choreDiff = 0;
      let targetFlatmateId = null;

      const newAssignments = prev.assignments.map(a => {
        if (a.id === assignmentId) {
          const isNowDone = a.status !== 'DONE';
          toggledToDone = isNowDone;
          targetFlatmateId = a.flatmateId;
          const choreObj = prev.chores.find(c => c.id === a.choreId);
          choreDiff = choreObj?.difficulty || 1;

          return {
            ...a,
            status: isNowDone ? 'DONE' : 'PENDING',
            completedAt: isNowDone ? new Date().toISOString() : null
          };
        }
        return a;
      });

      const newFlatmates = prev.flatmates.map(f => {
        if (f.id === targetFlatmateId) {
          return {
            ...f,
            totalCompleted: Math.max(0, (f.totalCompleted || 0) + (toggledToDone ? 1 : -1)),
            totalDifficultyPoints: Math.max(0, (f.totalDifficultyPoints || 0) + (toggledToDone ? choreDiff : -choreDiff))
          };
        }
        return f;
      });

      if (toggledToDone) {
        fireSuccessConfetti();
        showToast('Chore marked as Done!');
      } else {
        showToast('Chore marked as Pending.', 'info');
      }

      return {
        ...prev,
        assignments: newAssignments,
        flatmates: newFlatmates
      };
    });
  };

  const handleToggleLeave = (flatmateId) => {
    setAppState(prev => {
      const flatmate = prev.flatmates.find(f => f.id === flatmateId);
      if (!flatmate) return prev;

      const willBeOnLeave = !flatmate.onLeave;
      const updatedFlatmates = prev.flatmates.map(f =>
        f.id === flatmateId ? { ...f, onLeave: willBeOnLeave } : f
      );

      const rebalanced = rebalanceCurrentWeek({
        currentAssignments: prev.assignments,
        flatmates: updatedFlatmates,
        chores: prev.chores,
        previousWeekAssignments: prev.history[prev.history.length - 1]?.assignments || [],
        history: prev.history,
        currentWeek: prev.week,
        preserveCompleted: true
      });

      if (willBeOnLeave) {
        showToast(`${flatmate.name} is on leave. Chores redistributed.`, 'info');
      } else {
        showToast(`${flatmate.name} returned from leave!`, 'success');
      }

      return {
        ...prev,
        flatmates: updatedFlatmates,
        assignments: rebalanced.assignments || []
      };
    });
  };

  const handleNextWeek = () => {
    setAppState(prev => {
      const currentWeekRecord = {
        week: prev.week,
        completedAt: new Date().toISOString(),
        assignments: prev.assignments.map(a => ({
          ...a,
          choreTitle: choreMap[a.choreId]?.title || 'Chore',
          difficulty: choreMap[a.choreId]?.difficulty || 1,
          flatmateName: flatmateMap[a.flatmateId]?.name || 'Flatmate'
        }))
      };

      const newHistory = [...prev.history, currentWeekRecord];
      const nextWeekNumber = prev.week + 1;

      const result = generateFairRoster({
        flatmates: prev.flatmates,
        chores: prev.chores,
        previousWeekAssignments: prev.assignments,
        history: newHistory,
        targetWeek: nextWeekNumber
      });

      if (result.success) {
        fireGrandCelebration();
        showToast(`Advanced to Week ${nextWeekNumber}! Rotated fairly with 0 consecutive repeats.`);
        return {
          ...prev,
          week: nextWeekNumber,
          assignments: result.assignments,
          history: newHistory
        };
      } else {
        showToast(`Advanced to Week ${nextWeekNumber}, but: ${result.message}`, 'error');
        return {
          ...prev,
          week: nextWeekNumber,
          assignments: [],
          history: newHistory
        };
      }
    });
  };

  const handleRebalance = () => {
    setAppState(prev => {
      const result = generateFairRoster({
        flatmates: prev.flatmates,
        chores: prev.chores,
        previousWeekAssignments: prev.history[prev.history.length - 1]?.assignments || [],
        history: prev.history,
        targetWeek: prev.week
      });

      if (result.success) {
        showToast(`Week ${prev.week} roster rebalanced fairly!`);
        return { ...prev, assignments: result.assignments };
      } else {
        showToast(result.message, 'error');
        return prev;
      }
    });
  };

  // Add/Edit Chore
  const handleSaveChore = (e) => {
    e.preventDefault();
    if (!choreForm.title.trim()) return;

    if (editingChore) {
      setAppState(prev => ({
        ...prev,
        chores: prev.chores.map(c => c.id === editingChore.id ? { ...c, ...choreForm, difficulty: Number(choreForm.difficulty) } : c)
      }));
      showToast('Chore updated!');
      setEditingChore(null);
    } else {
      const newChore = {
        id: `c-${Date.now().toString(36)}`,
        title: choreForm.title.trim(),
        difficulty: Number(choreForm.difficulty),
        icon: choreForm.icon || 'Sparkles',
        category: choreForm.category || 'Housekeeping'
      };
      setAppState(prev => {
        const updatedChores = [...prev.chores, newChore];
        const rebalanced = rebalanceCurrentWeek({
          currentAssignments: prev.assignments,
          flatmates: prev.flatmates,
          chores: updatedChores,
          previousWeekAssignments: prev.history[prev.history.length - 1]?.assignments || [],
          history: prev.history,
          currentWeek: prev.week
        });
        return {
          ...prev,
          chores: updatedChores,
          assignments: rebalanced.assignments || prev.assignments
        };
      });
      showToast(`Added chore "${newChore.title}"!`);
      setIsAddChoreOpen(false);
    }
  };

  const handleDeleteChore = (choreId) => {
    setAppState(prev => ({
      ...prev,
      chores: prev.chores.filter(c => c.id !== choreId),
      assignments: prev.assignments.filter(a => a.choreId !== choreId)
    }));
    showToast('Chore removed.');
  };

  // Add/Edit Flatmate
  const handleSaveFlatmate = (e) => {
    e.preventDefault();
    if (!flatmateForm.name.trim()) return;

    if (editingFlatmate) {
      setAppState(prev => ({
        ...prev,
        flatmates: prev.flatmates.map(f => f.id === editingFlatmate.id ? { ...f, name: flatmateForm.name.trim(), avatar: flatmateForm.avatar } : f)
      }));
      showToast('Flatmate updated!');
      setEditingFlatmate(null);
    } else {
      const newF = {
        id: `f-${Date.now().toString(36)}`,
        name: flatmateForm.name.trim(),
        avatar: flatmateForm.avatar || '👨‍💻',
        onLeave: false,
        totalCompleted: 0,
        totalDifficultyPoints: 0
      };
      setAppState(prev => {
        const updated = [...prev.flatmates, newF];
        const rebalanced = rebalanceCurrentWeek({
          currentAssignments: prev.assignments,
          flatmates: updated,
          chores: prev.chores,
          previousWeekAssignments: prev.history[prev.history.length - 1]?.assignments || [],
          history: prev.history,
          currentWeek: prev.week
        });
        return {
          ...prev,
          flatmates: updated,
          assignments: rebalanced.assignments || prev.assignments
        };
      });
      showToast(`Added ${newF.name}!`);
      setIsAddFlatmateOpen(false);
    }
  };

  const handleDeleteFlatmate = (flatmateId) => {
    setAppState(prev => {
      const updated = prev.flatmates.filter(f => f.id !== flatmateId);
      const rebalanced = rebalanceCurrentWeek({
        currentAssignments: prev.assignments.filter(a => a.flatmateId !== flatmateId),
        flatmates: updated,
        chores: prev.chores,
        previousWeekAssignments: prev.history[prev.history.length - 1]?.assignments || [],
        history: prev.history,
        currentWeek: prev.week
      });
      return {
        ...prev,
        flatmates: updated,
        assignments: rebalanced.assignments || []
      };
    });
    showToast('Flatmate removed.');
  };

  const handleResetDefaults = () => {
    const fresh = resetStorageToDefaults();
    setAppState(fresh);
    showToast('Reset to default flatmates & chores (Week 1).', 'info');
  };

  const handleApplyPreset = (num) => {
    if (num === 1) {
      const f = DEFAULT_FLATMATES.map(x => ({ ...x, onLeave: false }));
      const r = generateFairRoster({ flatmates: f, chores: DEFAULT_CHORES, targetWeek: 1 });
      setAppState({ week: 1, flatmates: f, chores: DEFAULT_CHORES, assignments: r.assignments, history: [] });
      showToast('Loaded Test 1: 4 Flatmates + 4 Chores');
    } else if (num === 2) {
      const f = DEFAULT_FLATMATES.map(x => ({ ...x, onLeave: false }));
      const six = [
        ...DEFAULT_CHORES,
        { id: 'c-groceries', title: 'Groceries', difficulty: 2, icon: 'ShoppingCart' },
        { id: 'c-bathroom', title: 'Bathroom Scrub', difficulty: 4, icon: 'ShowerHead' }
      ];
      const r = generateFairRoster({ flatmates: f, chores: six, targetWeek: 1 });
      setAppState(prev => ({ ...prev, flatmates: f, chores: six, assignments: r.assignments }));
      showToast('Loaded Test 2: 4 Flatmates + 6 Chores (Multi-chores)');
    } else if (num === 3) {
      const f = DEFAULT_FLATMATES.map(x => ({ ...x, onLeave: false }));
      const two = DEFAULT_CHORES.slice(0, 2);
      const r = generateFairRoster({ flatmates: f, chores: two, targetWeek: 1 });
      setAppState(prev => ({ ...prev, flatmates: f, chores: two, assignments: r.assignments }));
      showToast('Loaded Test 3: 4 Flatmates + 2 Chores');
    } else if (num === 4) {
      const f = DEFAULT_FLATMATES.map((x, i) => ({ ...x, onLeave: i === 0 }));
      const r = generateFairRoster({ flatmates: f, chores: DEFAULT_CHORES, targetWeek: 1 });
      setAppState(prev => ({ ...prev, flatmates: f, chores: DEFAULT_CHORES, assignments: r.assignments }));
      showToast('Loaded Test 4: Soham on leave');
    } else if (num === 5) {
      const f = DEFAULT_FLATMATES.map((x, i) => ({ ...x, onLeave: i < 3 }));
      const r = generateFairRoster({ flatmates: f, chores: DEFAULT_CHORES, targetWeek: 1 });
      setAppState(prev => ({ ...prev, flatmates: f, chores: DEFAULT_CHORES, assignments: r.assignments }));
      showToast('Loaded Test 5: 3 on leave (Himanshu solo)');
    } else if (num === 6) {
      const f = DEFAULT_FLATMATES.map(x => ({ ...x, onLeave: true }));
      setAppState(prev => ({ ...prev, flatmates: f, chores: DEFAULT_CHORES, assignments: [] }));
      showToast('Loaded Test 6: All flatmates on leave (safe pause)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16 selection:bg-indigo-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
              🧹
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                Smart Chore Roster
              </h1>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Fair household chore balancing & weekly rotation
              </p>
            </div>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsTestModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Test Suite (7 Tests)"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Hackathon</span> Test Suite
            </button>

            <button
              onClick={handleNextWeek}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Next Week</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Simple Week Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold font-mono">
                WEEK {week}
              </span>
              <span className="text-xs text-slate-500">
                {availableFlatmates.length} active flatmates · {chores.length} total chores
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Current Week's Roster
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Chores are balanced by difficulty and rotated automatically to prevent consecutive repeats.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Completion Meter */}
            <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-600">Progress:</span>
              <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-xs font-bold text-emerald-700 font-mono">
                {completedChores}/{totalAssigned} ({completionPercentage}%)
              </span>
            </div>

            <button
              onClick={handleRebalance}
              type="button"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
              title="Reshuffle assignments"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-600" />
              <span>Reshuffle</span>
            </button>
          </div>
        </div>

        {/* Safe notice if all on leave */}
        {availableFlatmates.length === 0 && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs sm:text-sm flex items-start gap-3">
            <CalendarOff className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">All flatmates are on leave.</span>
              <p className="mt-0.5 text-xs text-purple-700">Toggle any flatmate back to active to assign household chores.</p>
            </div>
          </div>
        )}

        {/* 4 FLATMATES DUTY CARDS (Soham, Pranay, Pranav, Himanshu) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {flatmates.map(flatmate => {
            const flatmateAssignments = assignments.filter(a => a.flatmateId === flatmate.id);
            const totalDiff = flatmateAssignments.reduce((sum, a) => sum + (choreMap[a.choreId]?.difficulty || 0), 0);
            const isAllDone = flatmateAssignments.length > 0 && flatmateAssignments.every(a => a.status === 'DONE');

            return (
              <div
                key={flatmate.id}
                className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between shadow-xs ${
                  flatmate.onLeave
                    ? 'border-purple-200 bg-purple-50/20'
                    : isAllDone
                    ? 'border-emerald-300 shadow-emerald-500/5'
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div>
                  {/* Flatmate Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-2xl shadow-inner border border-slate-200/60">
                        {flatmate.avatar || '👨‍💻'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-tight">
                          {flatmate.name}
                        </h3>
                        <span className="text-xs text-slate-500">
                          {flatmateAssignments.length} {flatmateAssignments.length === 1 ? 'chore' : 'chores'} · {totalDiff} pts
                        </span>
                      </div>
                    </div>

                    {flatmate.onLeave ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                        On Leave
                      </span>
                    ) : isAllDone ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Done ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Assigned Chore(s) */}
                  <div className="mt-4 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Assigned Chore:
                    </span>

                    {flatmate.onLeave ? (
                      <div className="p-3 rounded-xl bg-purple-50 text-purple-800 text-xs flex items-center gap-2">
                        <CalendarOff className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>On leave (no chores assigned).</span>
                      </div>
                    ) : flatmateAssignments.length === 0 ? (
                      <div className="p-3 rounded-xl bg-slate-50 text-slate-400 text-xs italic">
                        Rest rotation (0 chores this week).
                      </div>
                    ) : (
                      flatmateAssignments.map(a => {
                        const chore = choreMap[a.choreId] || { title: 'Chore', difficulty: 1, icon: 'CheckSquare' };
                        const isDone = a.status === 'DONE';

                        return (
                          <div
                            key={a.id}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                              isDone
                                ? 'bg-emerald-50/70 border-emerald-200'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="min-w-0">
                              <h4 className={`text-xs font-bold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                {chore.title}
                              </h4>
                              <div className="mt-1">
                                <DifficultyBadge difficulty={chore.difficulty} size="sm" showStars={false} />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleChoreDone(a.id)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                                isDone
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs'
                              }`}
                            >
                              {isDone ? (
                                <>
                                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Done
                                </>
                              ) : (
                                <>Mark Done</>
                              )}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Card Bottom: Leave Toggle & Lifetime Done */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Done total: <strong className="text-slate-700">{flatmate.totalCompleted || 0}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleLeave(flatmate.id)}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                      flatmate.onLeave
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {flatmate.onLeave ? 'Available' : 'Set Leave'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tab Controls to switch between Chores, Flatmates, Stats, and History */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'roster' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              📋 Roster Table
            </button>
            <button
              onClick={() => setActiveTab('chores')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'chores' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🧹 Manage Chores ({chores.length})
            </button>
            <button
              onClick={() => setActiveTab('flatmates')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'flatmates' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              👥 Manage Flatmates ({flatmates.length})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'stats' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              📊 Statistics
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'history' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              📜 History ({history.length} weeks)
            </button>
          </div>

          <button
            onClick={handleResetDefaults}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg flex items-center gap-1 cursor-pointer font-medium"
            title="Reset to 4 default flatmates & 4 chores"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* TAB 1: ROSTER TABLE */}
        {activeTab === 'roster' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Week {week} Full Chore Assignment Table
                </h3>
                <p className="text-xs text-slate-500">Live assignments for each household task</p>
              </div>
              <button
                onClick={handleNextWeek}
                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <span>Rotate to Next Week</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Chore</th>
                    <th className="py-3 px-4">Assigned To</th>
                    <th className="py-3 px-4">Difficulty</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignments.map(a => {
                    const chore = choreMap[a.choreId] || { title: 'Chore', difficulty: 1, icon: 'CheckSquare' };
                    const flatmate = flatmateMap[a.flatmateId] || { name: 'Flatmate', avatar: '👤' };
                    const isDone = a.status === 'DONE';

                    return (
                      <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                          <ChoreIcon name={chore.icon} className="w-4 h-4 text-indigo-600" />
                          <span className={isDone ? 'line-through text-slate-400' : ''}>{chore.title}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          <span className="mr-1.5">{flatmate.avatar}</span>
                          {flatmate.name}
                        </td>
                        <td className="py-3 px-4">
                          <DifficultyBadge difficulty={chore.difficulty} size="sm" />
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={isDone ? 'DONE' : 'PENDING'} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleChoreDone(a.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isDone
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
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
          </div>
        )}

        {/* TAB 2: CHORES CATALOG */}
        {activeTab === 'chores' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Household Chores</h3>
                <p className="text-xs text-slate-500">Add, edit, or set difficulty (1 = Easy, 5 = Very Hard)</p>
              </div>
              <button
                onClick={() => {
                  setChoreForm({ title: '', difficulty: 3, icon: 'Sparkles', category: 'Housekeeping' });
                  setIsAddChoreOpen(true);
                }}
                className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Chore
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {chores.map(chore => (
                <div key={chore.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <ChoreIcon name={chore.icon} className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-bold text-slate-900 text-sm">{chore.title}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingChore(chore);
                          setChoreForm({ title: chore.title, difficulty: chore.difficulty, icon: chore.icon || 'Sparkles', category: chore.category || 'Housekeeping' });
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteChore(chore.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <DifficultyBadge difficulty={chore.difficulty} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: FLATMATES MANAGEMENT */}
        {activeTab === 'flatmates' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Household Flatmates</h3>
                <p className="text-xs text-slate-500">Manage flatmate roster and toggle leave status</p>
              </div>
              <button
                onClick={() => {
                  setFlatmateForm({ name: '', avatar: '👨‍💻' });
                  setIsAddFlatmateOpen(true);
                }}
                className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Flatmate
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {flatmates.map(f => (
                <div key={f.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{f.avatar}</span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{f.name}</h4>
                        <span className="text-[11px] text-slate-400">Done: {f.totalCompleted || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingFlatmate(f);
                          setFlatmateForm({ name: f.name, avatar: f.avatar || '👨‍💻' });
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFlatmate(f.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-500">{f.onLeave ? 'On Leave' : 'Active'}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleLeave(f.id)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                        f.onLeave ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {f.onLeave ? 'Return' : 'Set Leave'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SIMPLE STATISTICS */}
        {activeTab === 'stats' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Factual Statistics</h3>
              <p className="text-xs text-slate-500">Objective workload and completion metrics without rankings</p>
            </div>

            <div className="space-y-3">
              {flatmates.map(f => {
                const fAssignments = assignments.filter(a => a.flatmateId === f.id);
                const done = fAssignments.filter(a => a.status === 'DONE').length;
                const total = fAssignments.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;

                return (
                  <div key={f.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{f.avatar}</span>
                        <span className="text-slate-800">{f.name}</span>
                        {f.onLeave && <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">On Leave</span>}
                      </div>
                      <span className="text-slate-600 font-mono">
                        {done}/{total} done ({pct}%) · Lifetime: {f.totalCompleted || 0} chores
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Weekly Assignment History</h3>
              <p className="text-xs text-slate-500">Log of past weekly rotations showing non-consecutive assignments</p>
            </div>

            {history.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No past weeks archived yet. Advance to Week 2 to see Week 1 saved here!
              </div>
            ) : (
              <div className="space-y-4">
                {history.map(record => (
                  <div key={record.week} className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 font-bold text-xs text-slate-700 flex items-center justify-between">
                      <span>WEEK {record.week}</span>
                      <span className="text-slate-400 font-normal">
                        {record.completedAt ? new Date(record.completedAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <div className="p-3 divide-y divide-slate-100">
                      {record.assignments.map((item, idx) => (
                        <div key={idx} className="py-2 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800">
                            {item.flatmateName} → {item.choreTitle}
                          </span>
                          <span className="text-slate-500">
                            {item.status === 'DONE' ? 'Done ✓' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Chore Modal */}
      <Modal
        isOpen={isAddChoreOpen || !!editingChore}
        onClose={() => { setIsAddChoreOpen(false); setEditingChore(null); }}
        title={editingChore ? 'Edit Chore' : 'Add New Chore'}
      >
        <form onSubmit={handleSaveChore} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Chore Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Balcony Sweep, Grocery Run"
              value={choreForm.title}
              onChange={e => setChoreForm({ ...choreForm, title: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Difficulty (1 = Easy, 5 = Very Hard)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setChoreForm({ ...choreForm, difficulty: lvl })}
                  className={`py-2 rounded-xl text-center text-xs font-bold border cursor-pointer ${
                    Number(choreForm.difficulty) === lvl
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lvl} - {DIFFICULTY_LEVELS[lvl].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { setIsAddChoreOpen(false); setEditingChore(null); }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
            >
              Save Chore
            </button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Flatmate Modal */}
      <Modal
        isOpen={isAddFlatmateOpen || !!editingFlatmate}
        onClose={() => { setIsAddFlatmateOpen(false); setEditingFlatmate(null); }}
        title={editingFlatmate ? 'Edit Flatmate' : 'Add New Flatmate'}
      >
        <form onSubmit={handleSaveFlatmate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Sneha, Amit"
              value={flatmateForm.name}
              onChange={e => setFlatmateForm({ ...flatmateForm, name: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Choose Avatar</label>
            <div className="flex flex-wrap gap-2">
              {['👨‍💻', '🧑‍🔬', '🧑‍🎨', '🧑‍🚀', '👩‍💼', '🧑‍🍳', '👩‍🎓', '🧕'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFlatmateForm({ ...flatmateForm, avatar: emoji })}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border cursor-pointer ${
                    flatmateForm.avatar === emoji
                      ? 'bg-indigo-100 border-indigo-600 scale-105'
                      : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { setIsAddFlatmateOpen(false); setEditingFlatmate(null); }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
            >
              Save Flatmate
            </button>
          </div>
        </form>
      </Modal>

      {/* 7-Point Test Scenarios Modal */}
      <TestScenariosModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        onApplyScenario={handleApplyPreset}
        onResetDefaults={handleResetDefaults}
      />

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5">
          <div className="px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-lg flex items-center gap-2">
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
