import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import { User, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps { children: ReactNode; }

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-transparent text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-12 bg-black/40 backdrop-blur-md border-b border-white/[0.06] flex items-center justify-between px-5 flex-shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden w-8 h-8 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="hidden lg:flex items-center gap-2.5">
            <div className="w-6 h-6 bg-white flex items-center justify-center">
              <span className="text-black font-bold text-xs">K</span>
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">Kunal Admin</span>
            {window.location.hostname === 'localhost' && (
              <span className="label-mono text-[9px] bg-white/8 text-white/40 px-2 py-0.5 border border-white/10 uppercase tracking-widest">
                DEV
              </span>
            )}
          </div>

          {/* User badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/8">
            <div className="w-5 h-5 bg-white/15 flex items-center justify-center">
              <User className="w-3 h-3 text-white/60" />
            </div>
            <span className="label-mono text-[11px] text-white/60 uppercase tracking-wider">{user?.username}</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-transparent p-5 lg:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
