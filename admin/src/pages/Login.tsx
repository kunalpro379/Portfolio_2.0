import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, Shield, Sparkles } from 'lucide-react';

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
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-premium-gradient relative overflow-hidden flex items-center justify-center p-4">
      {/* Elegant background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #8b6f47 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Floating elegant elements */}
      <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-premium-brown-200/20 blur-3xl animate-float" 
           style={{ animationDelay: '0s', animationDuration: '8s' }}></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-premium-brown-300/20 blur-3xl animate-float"
           style={{ animationDelay: '2s', animationDuration: '10s' }}></div>
      <div className="absolute top-1/3 right-10 w-24 h-24 rounded-full bg-premium-cream-400/20 blur-2xl animate-float"
           style={{ animationDelay: '4s', animationDuration: '9s' }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Main card with premium design */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-premium-xl border border-premium-brown-200/50 overflow-hidden">
          {/* Elegant top accent */}
          <div className="h-1.5 bg-gradient-to-r from-premium-brown-600 via-premium-brown-500 to-premium-brown-600"></div>
          
          <div className="p-10">
            {/* Header with premium icon */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-premium-brown-500 to-premium-brown-700 rounded-2xl blur-xl opacity-30"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-premium-brown-600 to-premium-brown-800 rounded-2xl flex items-center justify-center shadow-premium-lg">
                  <Shield className="w-10 h-10 text-premium-cream-50" strokeWidth={1.5} />
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-premium-brown-500 animate-pulse" />
              </div>
              
              <h1 className="text-4xl font-serif font-bold text-premium-brown-900 mb-3 tracking-tight">
                Admin Panel
              </h1>
              <p className="text-premium-brown-600 font-medium">Sign in to access the dashboard</p>
              <div className="mt-3 h-0.5 w-16 bg-gradient-to-r from-transparent via-premium-brown-400 to-transparent mx-auto"></div>
            </div>

            {/* Error message with premium style */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl relative">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-premium-brown-800 mb-2.5">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-premium-brown-400 group-focus-within:text-premium-brown-600 transition-colors" strokeWidth={2} />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-white border border-premium-brown-200 rounded-xl text-premium-brown-900 placeholder-premium-brown-400 focus:outline-none focus:ring-2 focus:ring-premium-brown-500 focus:border-transparent transition-all font-medium shadow-sm hover:shadow-md"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-premium-brown-800 mb-2.5">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-premium-brown-400 group-focus-within:text-premium-brown-600 transition-colors" strokeWidth={2} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-white border border-premium-brown-200 rounded-xl text-premium-brown-900 placeholder-premium-brown-400 focus:outline-none focus:ring-2 focus:ring-premium-brown-500 focus:border-transparent transition-all font-medium shadow-sm hover:shadow-md"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-premium-brown-700 to-premium-brown-800 hover:from-premium-brown-800 hover:to-premium-brown-900 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-premium-lg hover:shadow-premium-xl transform hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </button>
            </form>
          </div>
        </div>

        {/* Footer with premium style */}
        <div className="text-center mt-8">
          <p className="text-premium-brown-600 text-sm font-medium">
            © 2026 Admin Panel. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
