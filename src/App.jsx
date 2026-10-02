import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar.jsx';
import { Navbar } from './components/Navbar.jsx';
import { LoginPage } from './components/LoginPage.jsx';
import { DashboardView } from './views/DashboardView.jsx';
import { FlatmatesView } from './views/FlatmatesView.jsx';
import { ChoresView } from './views/ChoresView.jsx';
import { WeeklyRosterView } from './views/WeeklyRosterView.jsx';
import { StatisticsView } from './views/StatisticsView.jsx';
import { HistoryView } from './views/HistoryView.jsx';
import { TestScenariosModal } from './components/TestScenariosModal.jsx';
import {
  loadStateFromStorage,
  saveStateToStorage,
  resetStorageToDefaults
} from './utils/storage.js';
import {
  authenticateUser,
  clearCurrentUser,
  getCurrentUser,
  registerUser,
  setCurrentUser
} from './utils/userStorage.js';
import {
  generateFairRoster,
  rebalanceCurrentWeek
} from './utils/fairRosterAlgorithm.js';
import { fireSuccessConfetti, fireGrandCelebration } from './utils/confetti.js';
import { DEFAULT_FLATMATES, DEFAULT_CHORES } from './constants/defaultData.js';
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from 'lucide-react';

export function App() {
  const currentUser = getCurrentUser();

  // App state
  const [appState, setAppState] = useState(() => loadStateFromStorage(currentUser?.id));
  const [activeView, setActiveView] = useState('dashboard');
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [sessionUser, setSessionUser] = useState(currentUser);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (sessionUser) {
      setCurrentUser(sessionUser);
      setAppState(loadStateFromStorage(sessionUser.id));
    } else {
      clearCurrentUser();
    }
  }, [sessionUser]);

  // Sync to localStorage whenever appState changes
  useEffect(() => {
    if (sessionUser) {
      saveStateToStorage(appState, sessionUser.id);
    }
  }, [appState, sessionUser]);

  const handleAuthSubmit = ({ mode, name, email, password }) => {
    if (mode === 'signup') {
      const result = registerUser({ name, email, password });
      if (result.error) {
        setAuthError(result.error);
        return;
      }

      setSessionUser(result.user);
      setAuthError('');
      return;
    }

    const result = authenticateUser({ email, password });
    if (result.error) {
      setAuthError(result.error);
      return;
    }

    setSessionUser(result.user);
    setAuthError('');
  };

  const handleLogout = () => {
    clearCurrentUser();
    setSessionUser(null);
    setAuthError('');
  };

  // Show auto-dismissing toast notifications
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(current => (current?.id ? null : current));
    }, 3500);
  }, []);

  const { week, flatmates, chores, assignments, history, stats } = appState;

  // Active chore and flatmate metrics
  const availableFlatmates = flatmates.filter(f => !f.onLeave);
  const totalAssigned = assignments.length;
  const completedChores = assignments.filter(a => a.status === 'DONE').length;
  const pendingChores = totalAssigned - completedChores;
  const completionRate = totalAssigned > 0 ? Math.round((completedChores / totalAssigned) * 100) : 0;

  // --- ACTIONS ---

  /**
   * Toggle a chore status between DONE and PENDING
   */
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

      // Update flatmate's completion stats
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

      // Update overall stats
      const newStats = {
        ...prev.stats,
        totalChoresEverCompleted: Math.max(0, (prev.stats.totalChoresEverCompleted || 0) + (toggledToDone ? 1 : -1)),
        totalDifficultyPointsCompleted: Math.max(0, (prev.stats.totalDifficultyPointsCompleted || 0) + (toggledToDone ? choreDiff : -choreDiff))
      };

      if (toggledToDone) {
        fireSuccessConfetti();
        showToast('Chore marked as DONE! Statistics updated.');
      } else {
        showToast('Chore marked as PENDING.', 'info');
      }

      return {
        ...prev,
        assignments: newAssignments,
        flatmates: newFlatmates,
        stats: newStats
      };
    });
  };

  /**
   * Toggle flatmate leave status and automatically redistribute active chores
   */
  const handleToggleLeave = (flatmateId) => {
    setAppState(prev => {
      const flatmate = prev.flatmates.find(f => f.id === flatmateId);
      if (!flatmate) return prev;

      const willBeOnLeave = !flatmate.onLeave;
      const updatedFlatmates = prev.flatmates.map(f => 
        f.id === flatmateId ? { ...f, onLeave: willBeOnLeave } : f
      );

      // Rebalance current week assignments
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
        showToast(`${flatmate.name} marked ON LEAVE. Chores automatically redistributed among available flatmates.`, 'info');
      } else {
        showToast(`${flatmate.name} returned from leave and is available for upcoming chores!`, 'success');
      }

      return {
        ...prev,
        flatmates: updatedFlatmates,
        assignments: rebalanced.assignments || []
      };
    });
  };

  /**
   * Advance to the NEXT WEEK
   * - Archive current week into history
   * - Increment week
   * - Generate new fair assignment with consecutive-week anti-repeat rule
   */
  const handleNextWeek = () => {
    setAppState(prev => {
      const currentWeekRecord = {
        week: prev.week,
        completedAt: new Date().toISOString(),
        assignments: prev.assignments.map(a => {
          const chore = prev.chores.find(c => c.id === a.choreId);
          const flatmate = prev.flatmates.find(f => f.id === a.flatmateId);
          return {
            ...a,
            choreTitle: chore?.title || 'Chore',
            difficulty: chore?.difficulty || 1,
            flatmateName: flatmate?.name || 'Flatmate'
          };
        })
      };

      const newHistory = [...prev.history, currentWeekRecord];
      const nextWeekNumber = prev.week + 1;

      // Run fair assignment algorithm for next week
      const result = generateFairRoster({
        flatmates: prev.flatmates,
        chores: prev.chores,
        previousWeekAssignments: prev.assignments,
        history: newHistory,
        targetWeek: nextWeekNumber
      });

      if (result.success) {
        fireGrandCelebration();
        showToast(`Moved to Week ${nextWeekNumber}! Fair assignments generated without consecutive repeats.`, 'success');
        return {
          ...prev,
          week: nextWeekNumber,
          assignments: result.assignments,
          history: newHistory
        };
      } else {
        showToast(`Moved to Week ${nextWeekNumber}, but: ${result.message}`, 'error');
        return {
          ...prev,
          week: nextWeekNumber,
          assignments: [],
          history: newHistory
        };
      }
    });
  };

  /**
   * Rebalance current week
   */
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
        showToast(`Week ${prev.week} roster rebalanced fairly!`, 'success');
        return {
          ...prev,
          assignments: result.assignments
        };
      } else {
        showToast(result.message, 'error');
        return prev;
      }
    });
  };

  /**
   * Flatmate CRUD Handlers
   */
  const handleAddFlatmate = (flatmateData) => {
    setAppState(prev => {
      const newFlatmate = {
        id: `f-${Date.now().toString(36)}`,
        ...flatmateData,
        onLeave: false,
        totalCompleted: 0,
        totalDifficultyPoints: 0,
        joinedDate: new Date().toISOString()
      };

      const updatedFlatmates = [...prev.flatmates, newFlatmate];

      // Auto-rebalance
      const rebalanced = rebalanceCurrentWeek({
        currentAssignments: prev.assignments,
        flatmates: updatedFlatmates,
        chores: prev.chores,
        previousWeekAssignments: prev.history[prev.history.length - 1]?.assignments || [],
        history: prev.history,
        currentWeek: prev.week
      });

      showToast(`Added ${newFlatmate.name} to flatmates!`);
      return {
        ...prev,
        flatmates: updatedFlatmates,
        assignments: rebalanced.assignments || prev.assignments
      };
    });
  };

  const handleEditFlatmate = (flatmateId, updatedData) => {
    setAppState(prev => {
      const updatedFlatmates = prev.flatmates.map(f =>
        f.id === flatmateId ? { ...f, ...updatedData } : f
      );
      showToast('Flatmate updated successfully!');
      return { ...prev, flatmates: updatedFlatmates };
    });
  };

  const handleDeleteFlatmate = (flatmateId) => {
    setAppState(prev => {
      const updatedFlatmates = prev.flatmates.filter(f => f.id !== flatmateId);
      const rebalanced = rebalanceCurrentWeek({
        currentAssignments: prev.assignments.filter(a => a.flatmateId !== flatmateId),
        flatmates: updatedFlatmates,
        chores: prev.chores,
        previousWeekAssignments: prev.history[prev.history.length - 1]?.assignments || [],
        history: prev.history,
        currentWeek: prev.week
      });

      showToast('Flatmate removed and chores rebalanced.');
      return {
        ...prev,
        flatmates: updatedFlatmates,
        assignments: rebalanced.assignments || []
      };
    });
  };

  /**
   * Chores CRUD Handlers
   */
  const handleAddChore = (choreData) => {
    setAppState(prev => {
      const newChore = {
        id: `c-${Date.now().toString(36)}`,
        ...choreData
      };
      const updatedChores = [...prev.chores, newChore];

      const rebalanced = rebalanceCurrentWeek({
        currentAssignments: prev.assignments,
        flatmates: prev.flatmates,
        chores: updatedChores,
        previousWeekAssignments: prev.history[prev.history.length - 1]?.assignments || [],
        history: prev.history,
        currentWeek: prev.week
      });

      showToast(`Added chore "${newChore.title}" with difficulty ${newChore.difficulty}!`);
      return {
        ...prev,
        chores: updatedChores,
        assignments: rebalanced.assignments || prev.assignments
      };
    });
  };

  const handleEditChore = (choreId, updatedData) => {
    setAppState(prev => {
      const updatedChores = prev.chores.map(c =>
        c.id === choreId ? { ...c, ...updatedData } : c
      );
      showToast('Chore details updated!');
      return { ...prev, chores: updatedChores };
    });
  };

  const handleDeleteChore = (choreId) => {
    setAppState(prev => {
      const updatedChores = prev.chores.filter(c => c.id !== choreId);
      const updatedAssignments = prev.assignments.filter(a => a.choreId !== choreId);
      showToast('Chore deleted.');
      return {
        ...prev,
        chores: updatedChores,
        assignments: updatedAssignments
      };
    });
  };

  /**
   * Clear History
   */
  const handleClearHistory = () => {
    setAppState(prev => ({
      ...prev,
      history: []
    }));
    showToast('Assignment history log cleared.', 'info');
  };

  /**
   * Reset Defaults
   */
  const handleResetDefaults = () => {
    const fresh = resetStorageToDefaults(sessionUser?.id);
    setAppState(fresh);
    showToast(sessionUser ? 'Fresh state created for your account. Add your flatmates and chores to begin.' : 'Reset all data to default flatmates & chores (Week 1).', 'info');
  };

  /**
   * Apply Hackathon Preset Scenarios
   */
  const handleApplyPresetScenario = (scenarioNumber) => {
    if (scenarioNumber === 1) {
      // 4 flatmates + 4 chores
      const freshFlatmates = DEFAULT_FLATMATES.map(f => ({ ...f, onLeave: false }));
      const result = generateFairRoster({
        flatmates: freshFlatmates,
        chores: DEFAULT_CHORES,
        previousWeekAssignments: [],
        history: [],
        targetWeek: 1
      });
      setAppState({
        week: 1,
        flatmates: freshFlatmates,
        chores: DEFAULT_CHORES,
        assignments: result.assignments,
        history: [],
        stats: { totalChoresEverCompleted: 0, totalDifficultyPointsCompleted: 0 }
      });
      showToast('Applied Test 1: 4 Flatmates + 4 Chores (Balanced 1:1)');
    } else if (scenarioNumber === 2) {
      // 4 flatmates + 6 chores
      const freshFlatmates = DEFAULT_FLATMATES.map(f => ({ ...f, onLeave: false }));
      const sixChores = [
        ...DEFAULT_CHORES,
        { id: 'c-groceries', title: 'Grocery Run', difficulty: 2, icon: 'ShoppingCart', category: 'Supplies', description: 'Restock milk, bread, veggies, and essentials.' },
        { id: 'c-bathroom', title: 'Bathroom Deep Clean', difficulty: 4, icon: 'ShowerHead', category: 'Housekeeping', description: 'Scrub tiles, shower glass, and disinfect toilet.' }
      ];
      const result = generateFairRoster({
        flatmates: freshFlatmates,
        chores: sixChores,
        previousWeekAssignments: [],
        history: [],
        targetWeek: 1
      });
      setAppState(prev => ({
        ...prev,
        flatmates: freshFlatmates,
        chores: sixChores,
        assignments: result.assignments
      }));
      showToast('Applied Test 2: 4 Flatmates + 6 Chores (Multi-chore assignment)');
    } else if (scenarioNumber === 3) {
      // 4 flatmates + 2 chores
      const freshFlatmates = DEFAULT_FLATMATES.map(f => ({ ...f, onLeave: false }));
      const twoChores = DEFAULT_CHORES.slice(0, 2);
      const result = generateFairRoster({
        flatmates: freshFlatmates,
        chores: twoChores,
        previousWeekAssignments: [],
        history: [],
        targetWeek: 1
      });
      setAppState(prev => ({
        ...prev,
        flatmates: freshFlatmates,
        chores: twoChores,
        assignments: result.assignments
      }));
      showToast('Applied Test 3: 4 Flatmates + 2 Chores (2 flatmates get rest rotation)');
    } else if (scenarioNumber === 4) {
      // 1 flatmate on leave
      const flatmates1OnLeave = DEFAULT_FLATMATES.map((f, i) => ({
        ...f,
        onLeave: i === 0 // Soham on leave
      }));
      const result = generateFairRoster({
        flatmates: flatmates1OnLeave,
        chores: DEFAULT_CHORES,
        previousWeekAssignments: [],
        history: [],
        targetWeek: 1
      });
      setAppState(prev => ({
        ...prev,
        flatmates: flatmates1OnLeave,
        chores: DEFAULT_CHORES,
        assignments: result.assignments
      }));
      showToast('Applied Test 4: Soham is On Leave. 4 chores distributed among remaining 3.');
    } else if (scenarioNumber === 5) {
      // 3 flatmates on leave
      const flatmates3OnLeave = DEFAULT_FLATMATES.map((f, i) => ({
        ...f,
        onLeave: i < 3 // Soham, Pranay, Pranav on leave; Himanshu available
      }));
      const result = generateFairRoster({
        flatmates: flatmates3OnLeave,
        chores: DEFAULT_CHORES,
        previousWeekAssignments: [],
        history: [],
        targetWeek: 1
      });
      setAppState(prev => ({
        ...prev,
        flatmates: flatmates3OnLeave,
        chores: DEFAULT_CHORES,
        assignments: result.assignments
      }));
      showToast('Applied Test 5: 3 Flatmates on Leave. All chores safely assigned to Himanshu.');
    } else if (scenarioNumber === 6) {
      // All flatmates on leave
      const flatmatesAllOnLeave = DEFAULT_FLATMATES.map(f => ({ ...f, onLeave: true }));
      setAppState(prev => ({
        ...prev,
        flatmates: flatmatesAllOnLeave,
        chores: DEFAULT_CHORES,
        assignments: []
      }));
      showToast('Applied Test 6: All Flatmates on Leave (Safe zero-crash warning).', 'info');
    }
  };

  // Check assignment edge case messaging
  let assignmentError = null;
  let assignmentWarning = null;
  if (flatmates.length === 0) {
    assignmentError = 'No flatmates registered. Please add flatmates to enable chore assignment.';
  } else if (chores.length === 0) {
    assignmentError = 'No household chores defined. Please add chores in the Chores tab.';
  } else if (availableFlatmates.length === 0) {
    assignmentError = 'All flatmates are currently marked "On Leave". Chores are paused until a flatmate returns.';
  } else if (availableFlatmates.length === 1) {
    assignmentWarning = `High Workload Alert: Only ${availableFlatmates[0].name} is active. All active household chores have been assigned to them.`;
  }

  if (!sessionUser) {
    return <LoginPage onSubmit={handleAuthSubmit} authError={authError} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        week={week}
        flatmatesCount={flatmates.length}
        availableCount={availableFlatmates.length}
        choresCount={chores.length}
        pendingCount={pendingChores}
        onOpenTests={() => setIsTestModalOpen(true)}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <Navbar
          activeView={activeView}
          week={week}
          completionRate={completionRate}
          currentUser={sessionUser}
          onNextWeek={handleNextWeek}
          onOpenTests={() => setIsTestModalOpen(true)}
          onReset={handleResetDefaults}
          onLogout={handleLogout}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* View Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeView === 'dashboard' && (
            <DashboardView
              week={week}
              flatmates={flatmates}
              chores={chores}
              assignments={assignments}
              onToggleChoreDone={handleToggleChoreDone}
              onToggleLeave={handleToggleLeave}
              onNextWeek={handleNextWeek}
              onRebalance={handleRebalance}
              onNavigate={setActiveView}
              assignmentWarning={assignmentWarning}
              assignmentError={assignmentError}
            />
          )}

          {activeView === 'flatmates' && (
            <FlatmatesView
              flatmates={flatmates}
              chores={chores}
              assignments={assignments}
              onAddFlatmate={handleAddFlatmate}
              onEditFlatmate={handleEditFlatmate}
              onDeleteFlatmate={handleDeleteFlatmate}
              onToggleLeave={handleToggleLeave}
              onToggleChoreDone={handleToggleChoreDone}
            />
          )}

          {activeView === 'chores' && (
            <ChoresView
              chores={chores}
              assignments={assignments}
              flatmates={flatmates}
              onAddChore={handleAddChore}
              onEditChore={handleEditChore}
              onDeleteChore={handleDeleteChore}
            />
          )}

          {activeView === 'roster' && (
            <WeeklyRosterView
              week={week}
              flatmates={flatmates}
              chores={chores}
              assignments={assignments}
              onToggleChoreDone={handleToggleChoreDone}
              onNextWeek={handleNextWeek}
              onRebalance={handleRebalance}
              assignmentWarning={assignmentWarning}
              assignmentError={assignmentError}
            />
          )}

          {activeView === 'statistics' && (
            <StatisticsView
              week={week}
              flatmates={flatmates}
              chores={chores}
              assignments={assignments}
              history={history}
            />
          )}

          {activeView === 'history' && (
            <HistoryView
              history={history}
              flatmates={flatmates}
              chores={chores}
              currentWeek={week}
              onClearHistory={handleClearHistory}
            />
          )}
        </main>
      </div>

      {/* Test Scenarios & Preset Runner Modal */}
      <TestScenariosModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        onApplyScenario={handleApplyPresetScenario}
        onResetDefaults={handleResetDefaults}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold border ${
              toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : toast.type === 'info'
                ? 'bg-slate-900 text-white border-slate-700'
                : 'bg-emerald-900 text-white border-emerald-700'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : toast.type === 'info' ? (
              <Info className="w-5 h-5 text-indigo-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
