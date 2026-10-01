import React from 'react';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  CalendarCheck,
  BarChart3,
  History as HistoryIcon,
  Sparkles,
  HelpCircle,
  Home,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export function Sidebar({
  activeView,
  setActiveView,
  week,
  flatmatesCount,
  availableCount,
  choresCount,
  pendingCount,
  onOpenTests,
  isMobileOpen,
  setIsMobileOpen
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'flatmates', label: 'Flatmates', icon: Users, badge: `${availableCount}/${flatmatesCount}` },
    { id: 'chores', label: 'Chores', icon: CheckSquare, badge: choresCount },
    { id: 'roster', label: 'Weekly Roster', icon: CalendarCheck, badge: pendingCount > 0 ? `${pendingCount} due` : 'Done', badgeColor: pendingCount > 0 ? 'amber' : 'emerald' },
    { id: 'statistics', label: 'Statistics', icon: BarChart3, badge: null },
    { id: 'history', label: 'History', icon: HistoryIcon, badge: null },
  ];

  const handleNavClick = (viewId) => {
    setActiveView(viewId);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-black text-xl">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-tight text-white leading-tight">
                  SMART CHORE
                </h1>
                <p className="text-[11px] font-semibold tracking-wider uppercase text-indigo-400">
                  Roster & Fair Flatmates
                </p>
              </div>
            </div>
            
            <div className="mt-4 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-300">Active Roster</span>
              </div>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Week {week}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  type="button"
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeColor === 'emerald'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer / Hackathon Test Suite trigger */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <button
            onClick={() => {
              onOpenTests();
              if (setIsMobileOpen) setIsMobileOpen(false);
            }}
            type="button"
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 text-xs font-semibold transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Hackathon Test Suite</span>
            </div>
            <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-bold">
              7 Tests
            </span>
          </button>

          <div className="px-2 py-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Fair Workload Engine</span>
            <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
