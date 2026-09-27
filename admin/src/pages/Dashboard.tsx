import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, FolderOpen, BookOpen, StickyNote, Plus, Edit, FileEdit, RefreshCw, Trash2, Monitor, Globe, MonitorSmartphone } from 'lucide-react';
import config from '../config/config';
import DashboardShimmer from '../components/DashboardShimmer';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // keep false for now to see UI quickly
  const [stats, setStats] = useState({
    projects: 12,
    blogs: 8,
    documentation: 15,
    notes: 24,
    views: 3843
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Welcome Hero Banner */}
      <div className="bg-[#0d0d0d] border border-white/[0.06] p-6 md:p-10 relative overflow-hidden">
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 font-semibold">
          Overview & Insights
        </span>
        <h2 className="text-2xl md:text-4xl font-bold text-white mt-2 mb-2 tracking-tight">
          Welcome back, {user?.username || 'Admin'}!
        </h2>
        <p className="text-white/60 text-sm md:text-base max-w-xl leading-relaxed">
          Here is your portfolio management overview. Control your project showcases, write tech breakdown blogs, publish documentation, and organize files.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-mono uppercase tracking-widest text-white/40">Portfolio Snapshot</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Projects', value: stats.projects, icon: FolderOpen },
            { label: 'Blogs', value: stats.blogs, icon: FileText },
            { label: 'Docs', value: stats.documentation, icon: BookOpen },
            { label: 'Notes', value: stats.notes, icon: StickyNote },
          ].map((item, idx) => (
            <div key={idx} className="bg-[#0d0d0d] border border-white/[0.06] p-5 hover:border-white/[0.2] transition-colors group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono uppercase text-white/40 tracking-widest">{item.label}</span>
                <div className="text-white/40 group-hover:text-white transition-colors">
                  <item.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-4xl font-light text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Visitor Analytics */}
      <div className="space-y-3 mt-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white tracking-tight">Visitor Analytics</h3>
            <p className="text-xs text-white/40 mt-1">Track and analyze your website traffic and user engagement (kunalpatil.in)</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-white/[0.06] text-[11px] uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
            <button className="px-3 py-1.5 border border-white/[0.06] text-[11px] uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors">
              Clear All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-[#0d0d0d] border border-white/[0.06] p-6">
            <div className="flex items-center gap-8 mb-8">
              <div>
                <p className="text-[10px] font-mono uppercase text-white/40 tracking-widest mb-1">Total Views</p>
                <p className="text-3xl font-light text-white">3,843</p>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-white/40 tracking-widest mb-1">Unique Visitors</p>
                <p className="text-3xl font-light text-white">1,105</p>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-white/40 tracking-widest mb-1">Last 24 Hours</p>
                <p className="text-3xl font-light text-white/40">24h</p>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-white/40 tracking-widest mb-1">Last 7 Days</p>
                <p className="text-3xl font-light text-white/40">7d</p>
              </div>
            </div>

            <div className="h-64 border border-white/[0.06] flex items-end px-4 gap-2 relative bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:2rem_2rem]">
              {/* Dummy Graph Bars */}
              {[40, 70, 45, 90, 65, 85, 110, 60, 80, 50, 100, 120].map((h, i) => (
                <div key={i} className="flex-1 bg-white/[0.1] hover:bg-white/[0.3] transition-colors relative group" style={{ height: `${h}%` }}>
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] py-1 px-2 font-mono">
                    {h * 15}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-[#0d0d0d] border border-white/[0.06] p-5 flex-1">
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-white/40 mb-4">Top Pages</h4>
              <div className="space-y-3">
                {[
                  { path: '/', views: 1888 },
                  { path: '/learnings', views: 1012 },
                  { path: '/learnings/guide/xrjp...', views: 67 },
                  { path: '/learnings/dsa/aywi...', views: 51 },
                  { path: '/learnings/code-editor', views: 38 },
                ].map((page, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-white/80 font-mono truncate max-w-[200px]">{page.path}</span>
                    <span className="text-[13px] text-white/40">{page.views}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0d0d0d] border border-white/[0.06] p-5 flex-1">
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-white/40 mb-4">Devices & Browsers</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-white/40 mb-2 uppercase tracking-widest">Devices</p>
                  <div className="flex items-center justify-between text-sm text-white/80 mb-2">
                    <span className="flex items-center gap-2"><Monitor className="w-3.5 h-3.5"/> Desktop</span>
                    <span>3233</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-white/80">
                    <span className="flex items-center gap-2"><MonitorSmartphone className="w-3.5 h-3.5"/> Mobile</span>
                    <span>610</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 mb-2 uppercase tracking-widest mt-4">Browsers</p>
                  <div className="flex items-center justify-between text-sm text-white/80 mb-2">
                    <span>Chrome</span>
                    <span>1400</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-white/80 mb-2">
                    <span>Safari</span>
                    <span>117</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-white/80">
                    <span>Firefox</span>
                    <span>64</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions List */}
      <div className="bg-[#0d0d0d] border border-white/[0.06] p-6 space-y-5">
        <div>
          <h3 className="text-lg font-medium text-white tracking-tight">Quick Actions</h3>
          <p className="text-xs text-white/40 mt-1">Streamlined workflows to create and publish new content.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: 'New Project', desc: 'Add project showcase', icon: Plus, path: '/projects/create' },
            { title: 'Write Blog', desc: 'Publish article breakdown', icon: Edit, path: '/blogs/create' },
            { title: 'New Documentation', desc: 'Create technical docs', icon: FileEdit, path: '/documentation/create' },
            { title: 'New Note', desc: 'Store quick notes', icon: Plus, path: '/notes/create' },
          ].map((action, i) => (
            <button 
              key={i}
              onClick={() => navigate(action.path)}
              className="flex items-center gap-4 p-4 bg-[#0a0a0a] border border-white/[0.06] hover:border-white/[0.2] transition-colors text-left group"
            >
              <div className="w-10 h-10 bg-white/[0.05] text-white flex items-center justify-center flex-shrink-0">
                <action.icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-medium text-white text-[13px] group-hover:text-white/80 transition-colors">{action.title}</h4>
                <p className="text-white/40 text-[11px] mt-0.5 truncate">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
