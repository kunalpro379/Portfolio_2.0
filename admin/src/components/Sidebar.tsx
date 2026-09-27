import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, FileText, BookOpen, StickyNote, Code2, Eye, LogOut, X, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps { onClose?: () => void; }

export default function Sidebar({ onClose }: SidebarProps) {
  const { logout } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderOpen, label: 'Projects' },
    { to: '/blogs', icon: FileText, label: 'Blogs' },
    { to: '/documentation', icon: BookOpen, label: 'Documentation' },
    { to: '/notes', icon: StickyNote, label: 'Notes' },
    { to: '/code', icon: Code2, label: 'Code' },
    { to: '/ai-knowledge-base', icon: Database, label: 'AI Knowledge Base' },
    { to: '/views', icon: Eye, label: 'Views' },
  ];

  return (
    <aside
      className="w-60 bg-black/40 backdrop-blur-md border-r border-white/[0.06] h-screen flex flex-col flex-shrink-0"
    >
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white flex items-center justify-center">
            <span className="text-black font-bold text-sm">K</span>
          </div>
          <div>
            <p className="text-white text-[13px] font-semibold leading-none">Kunal Patil</p>
            <p className="label-mono text-[9px] text-white/30 uppercase tracking-[0.2em] mt-0.5">Admin</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 text-white/40 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              'flex items-center gap-3 px-5 py-2.5 text-[12.5px] font-medium transition-all border-l-2 ' +
              (isActive
                ? 'bg-white/[0.08] text-white border-white'
                : 'text-white/40 hover:text-white hover:bg-white/[0.04] border-transparent')
            }
          >
            <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/6">
        <button
          onClick={() => { logout(); if (onClose) onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-medium text-red-400/70 hover:text-red-400 hover:bg-red-400/5 border border-red-400/10 hover:border-red-400/20 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
