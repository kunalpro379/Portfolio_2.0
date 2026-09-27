import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Top edge line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {/* Bottom edge line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Icon + Brand */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 border border-white/15 bg-white/5 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="square" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <span className="label-mono text-[10px] uppercase tracking-[0.3em] text-white/35">Admin Portal</span>
          </div>
          <h1 className="text-[2.25rem] font-bold leading-none tracking-tight text-white mb-2">Sign in</h1>
          <p className="text-[13px] text-white/35 leading-relaxed">Enter your admin credentials to continue.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-mono block text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              placeholder="Enter your username"
              required
              className="w-full h-11 bg-white/5 border border-white/10 px-4 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/8 transition-colors"
            />
          </div>

          <div>
            <label className="label-mono block text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
              className="w-full h-11 bg-white/5 border border-white/10 px-4 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/8 transition-colors"
            />
          </div>

          {error && (
            <div className="border border-red-500/20 bg-red-500/8 px-4 py-3">
              <p className="label-mono text-[11px] text-red-400">{error}</p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-white text-black label-mono text-[11px] font-bold uppercase tracking-[0.22em] hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Authenticating...
                </span>
              ) : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-12 pt-5 border-t border-white/5">
          <p className="label-mono text-[10px] text-white/20 text-center uppercase tracking-widest">
            Kunal Patil &middot; Admin Console &middot; 2026
          </p>
        </div>
      </div>
    </div>
  );
}
