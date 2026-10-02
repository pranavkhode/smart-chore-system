import React from 'react';
import { Menu, Calendar, ChevronRight, Sparkles, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

export function Navbar({
  activeView,
  week,
  completionRate,
  currentUser,
  onNextWeek,
  onOpenTests,
  onReset,
  onLogout,
  setIsMobileOpen
}) {
  const viewTitles = {
    dashboard: { title: 'Dashboard Overview', desc: 'Household chore distribution and live status' },
    flatmates: { title: 'Flatmate Management', desc: 'Manage household members and availability status' },
    chores: { title: 'Chore Management', desc: 'Define chores, categories, and difficulty levels (1–5)' },
    roster: { title: 'Weekly Roster', desc: 'Current week assignments with automated fair rotation' },
    statistics: { title: 'Fairness Statistics', desc: 'Objective workload balance and historical metrics' },
    history: { title: 'Assignment History', desc: 'Audit log of past weeks and chore rotations' },
  };

  const current = viewTitles[activeView] || viewTitles.dashboard;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-8 py-2.5 sm:py-3.5 transition-all">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {/* Left: Mobile Toggle & Title */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            type="button"
            className="p-2.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden min-h-[44px] min-w-[44px]"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                {current.title}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                Week {week}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block truncate">
              {current.desc}
            </p>
          </div>
        </div>

        {/* Right: Quick actions & Completion pill */}
        <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end sm:gap-3.5">
          {/* Week Completion Mini Bar */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-semibold text-slate-600">Week {week} Done:</span>
            <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <span className="text-xs font-bold font-mono text-emerald-700">
              {completionRate}%
            </span>
          </div>

          {/* Test Scenarios Quick Button */}
          <button
            onClick={onOpenTests}
            type="button"
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer sm:min-h-[40px] sm:flex-none sm:px-3 sm:text-xs"
            title="Open 7-Point Hackathon Test Suite"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Test Suite</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
              {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="text-left leading-tight">
              <div className="text-[9px] uppercase tracking-[0.18em] text-slate-400">User</div>
              <div className="text-xs font-semibold text-slate-700">{currentUser?.name || 'Guest'}</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            type="button"
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer sm:min-h-[40px] sm:flex-none sm:text-sm"
          >
            Logout
          </button>

          {/* Next Week Button */}
          <button
            onClick={onNextWeek}
            type="button"
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-600/20 transition-all cursor-pointer sm:min-h-[40px] sm:flex-none sm:text-sm"
          >
            <span>Next Week</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
