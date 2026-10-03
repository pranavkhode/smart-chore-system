import { useState } from 'react';
import { Home, KeyRound, LogOut, Users } from 'lucide-react';

export function HouseholdSetup({ user, error, isLoading, onCreate, onJoin, onRetry, onLogout }) {
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const handleCreate = async event => {
    event.preventDefault();
    await onCreate(householdName);
  };

  const handleJoin = async event => {
    event.preventDefault();
    await onJoin(inviteCode);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
              <Users className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Connect your flatmates</h1>
            <p className="mt-2 text-sm text-slate-400">
              Signed in as {user.email}. Create a household or join one with an invite code.
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-slate-700 px-3 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-5 flex flex-col gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={onRetry}
              className="min-h-9 shrink-0 rounded-lg border border-rose-300/30 px-3 text-xs font-bold text-rose-100 hover:bg-rose-500/20"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <form onSubmit={handleCreate} className="rounded-2xl border border-slate-700 bg-slate-950/60 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Home className="h-5 w-5 text-indigo-400" />
              <h2 className="font-bold">Create a household</h2>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-slate-400">
              Starts with an empty roster. You’ll get a private invite code to share with flatmates.
            </p>
            <label className="mb-4 block">
              <span className="mb-1.5 block text-xs font-medium text-slate-300">Household name</span>
              <input
                type="text"
                value={householdName}
                onChange={event => setHouseholdName(event.target.value)}
                maxLength={60}
                required
                placeholder="e.g. Maple Street Flat"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              />
            </label>
            <button
              type="submit"
              disabled={isLoading}
              className="min-h-11 w-full rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-60"
            >
              {isLoading ? 'Connecting…' : 'Create household'}
            </button>
          </form>

          <form onSubmit={handleJoin} className="rounded-2xl border border-slate-700 bg-slate-950/60 p-5">
            <div className="mb-4 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-emerald-400" />
              <h2 className="font-bold">Join a household</h2>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-slate-400">
              Ask a flatmate to send you the invite code from their household dashboard.
            </p>
            <label className="mb-4 block">
              <span className="mb-1.5 block text-xs font-medium text-slate-300">Invite code</span>
              <input
                type="text"
                value={inviteCode}
                onChange={event => setInviteCode(event.target.value.trim())}
                maxLength={36}
                minLength={36}
                required
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="Paste the 36-character code"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              />
            </label>
            <button
              type="submit"
              disabled={isLoading}
              className="min-h-11 w-full rounded-xl border border-slate-600 bg-slate-800 px-4 text-sm font-bold text-white hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
            >
              {isLoading ? 'Connecting…' : 'Join household'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
