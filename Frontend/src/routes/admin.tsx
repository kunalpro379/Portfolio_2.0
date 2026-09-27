import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { config } from '@/config/config';

export const Route = createFileRoute('/admin')({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Both fields are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid credentials');
      navigate({ to: '/learnings', search: { tab: 'blogs' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0a]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative w-full max-w-[380px] px-4">
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border border-white/20 bg-white/5">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-white/40">Admin Portal</span>
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-white">Sign in</h1>
          <p className="mt-1.5 text-[13px] text-white/35">Enter your admin credentials to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus autoComplete="username" placeholder="Enter your username" className="h-11 w-full border border-white/10 bg-white/5 px-3.5 text-[13px] font-medium text-white placeholder:text-white/20 focus:border-white/30 focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="Enter your password" className="h-11 w-full border border-white/10 bg-white/5 px-3.5 text-[13px] font-medium text-white placeholder:text-white/20 focus:border-white/30 focus:outline-none transition-colors" />
          </div>

          {error && (
            <div className="border border-red-500/20 bg-red-500/10 px-3.5 py-2.5">
              <p className="font-mono text-[11px] text-red-400">{error}</p>
            </div>
          )}

          <div className="pt-2">
            <button type="submit" disabled={loading} className="h-11 w-full bg-white text-[11px] font-bold uppercase tracking-[0.22em] text-black transition-all hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-10 border-t border-white/5 pt-5">
          <p className="font-mono text-[10px] tracking-widest text-white/20 text-center uppercase">Kunal Patil · Admin Console</p>
        </div>
      </div>
    </div>
  );
}
