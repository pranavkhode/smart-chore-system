import React from 'react';
import { Menu, Calendar, ChevronRight, Sparkles, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

export function Navbar({
  activeView,
  week,
  completionRate,
  onNextWeek,
  onOpenTests,
  onReset,
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
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            type="button"
            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {current.title}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Week {week}
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {current.desc}
            </p>
          </div>
        </div>

        {/* Right: Quick actions & Completion pill */}
        <div className="flex items-center gap-2.5 sm:gap-4">
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
            title="Open 7-Point Hackathon Test Suite"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden xs:inline">Test Suite</span>
          </button>

          {/* Next Week Button */}
          <button
            onClick={onNextWeek}
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <span>Next Week</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
