import { useState } from 'react';
import { LockKeyhole, UserPlus, LogIn, ShieldCheck } from 'lucide-react';

export function LoginPage({ onSubmit, authError }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ ...form, mode });
  };

  const isSignup = mode === 'signup';

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-indigo-950/30 backdrop-blur-sm">
          <div className="flex items-center justify-center mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/40">
              <ShieldCheck className="h-7 w-7" />
            </div>
          </div>

          <div className="mb-6 flex rounded-xl border border-slate-700 bg-slate-800/80 p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                !isSignup
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span className="inline-flex items-center gap-2 justify-center">
                <LogIn className="h-4 w-4" />
                Login
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                isSignup
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span className="inline-flex items-center gap-2 justify-center">
                <UserPlus className="h-4 w-4" />
                Sign Up
              </span>
            </button>
          </div>

          <div className="mb-6 text-center">
            <h1 className="text-3xl font-black tracking-tight text-white">Household Hub</h1>
            <p className="mt-2 text-sm text-slate-400">
              {isSignup
                ? 'Create your account to manage your home chores.'
                : 'Sign in to view your chore roster and household data.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-200">Full name</span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-200">Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-200">Password</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              />
            </label>

            {authError && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
            >
              {isSignup ? <UserPlus className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
              {isSignup ? 'Create account' : 'Login to dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
