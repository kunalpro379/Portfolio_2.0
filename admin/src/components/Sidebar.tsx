import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, FileText, BookOpen, StickyNote, Code2, Eye, LogOut, X, Database, FolderTree } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { logout } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderOpen, label: 'Projects' },
    { to: '/blogs', icon: FileText, label: 'Blogs' },
    { to: '/documentation', icon: BookOpen, label: 'Documentation' },
    { to: '/notes', icon: StickyNote, label: 'Notes' },
    { to: '/files', icon: FolderTree, label: 'Files' },
    { to: '/code', icon: Code2, label: 'Code' },
    { to: '/ai-knowledge-base', icon: Database, label: 'AI Knowledge Base' },
    { to: '/views', icon: Eye, label: 'Views' },
  ];

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-premium-brown-900 to-premium-brown-800 h-screen flex flex-col relative flex-shrink-0 shadow-premium-xl">
      {/* Elegant decorative elements */}
      <div className="absolute top-20 right-0 w-32 h-32 bg-premium-brown-700/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 left-0 w-32 h-32 bg-premium-brown-600/20 rounded-full blur-3xl"></div>

      {/* Logo Section */}
      <div className="p-6 border-b border-premium-brown-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-premium-cream-400 to-premium-cream-600 rounded-xl flex items-center justify-center shadow-premium-lg relative overflow-hidden">
              <span className="text-2xl font-serif font-bold text-premium-brown-900 relative z-10">K</span>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-premium-cream-50">
                Kunal
              </h2>
              <p className="text-xs text-premium-cream-400 font-medium">Admin Panel</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-premium-brown-700/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-premium-cream-200" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 group ${
                isActive
                  ? 'bg-premium-cream-500 text-premium-brown-900 shadow-premium'
                  : 'text-premium-cream-200 hover:bg-premium-brown-700/50 hover:text-premium-cream-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-premium-brown-900' : 'text-premium-cream-300'
                  }`} 
                  strokeWidth={2} 
                />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-premium-brown-700/50">
        <button
          onClick={() => {
            logout();
            if (onClose) onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold bg-red-900/30 hover:bg-red-900/50 text-red-200 hover:text-red-100 transition-all duration-200 border border-red-800/30 hover:border-red-700/50 shadow-sm hover:shadow-md group"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={2} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
