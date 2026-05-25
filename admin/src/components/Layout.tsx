import { ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { User, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Check if current route is Files page
  const isFilesPage = location.pathname.startsWith('/files');

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Header - Always visible */}
        <header className="bg-gradient-to-r from-premium-brown-900 to-premium-brown-800 border-b border-premium-brown-700/50 h-14 lg:h-16 flex items-center justify-between px-3 lg:px-8 flex-shrink-0 shadow-premium-lg z-10">
          {/* Left side - Menu button only on mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden flex items-center justify-center w-10 h-10 bg-premium-brown-700 hover:bg-premium-brown-600 rounded-lg shadow-premium transition-colors"
          >
            <Menu className="w-5 h-5 text-premium-cream-50" strokeWidth={2} />
          </button>

          {/* Desktop Logo - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-premium-cream-400 to-premium-cream-600 rounded-lg flex items-center justify-center shadow-premium relative overflow-hidden">
              <span className="text-lg font-serif font-bold text-premium-brown-900 relative z-10">K</span>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            </div>
            <span className="text-lg font-serif font-bold text-premium-cream-50">Admin</span>
            {window.location.hostname === 'localhost' && (
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-semibold">
                DEV
              </span>
            )}
          </div>

          {/* User Info - Right side - Compact on mobile */}
          <div className="flex items-center gap-1.5 lg:gap-3 px-2.5 lg:px-5 py-1.5 lg:py-2 bg-premium-brown-700/50 backdrop-blur-sm border border-premium-brown-600/50 rounded-full shadow-premium">
            <User className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-premium-cream-200" strokeWidth={2} />
            <span className="font-semibold text-premium-cream-50 text-xs lg:text-base whitespace-nowrap">{user?.username}</span>
          </div>
        </header>

        {/* Main Content - Scrollable or Full Height for Files */}
        <main className={isFilesPage ? 'flex-1 overflow-hidden' : 'flex-1 overflow-y-auto'}>
          {children}
        </main>
      </div>
    </div>
  );
}
