import { useState, useEffect } from 'react';
import { Eye, Trash2, RefreshCw, Monitor, Smartphone, Tablet, Globe } from 'lucide-react';
import config, { buildUrl } from '../config/config';
import PageShimmer from '../components/PageShimmer';

interface View {
  viewId: string;
  ipAddress: string;
  userAgent: string;
  path: string;
  referrer: string;
  browser: string;
  device: string;
  timestamp: string;
}

interface Stats {
  total: number;
  last24h: number;
  last7days: number;
  uniqueVisitors: number;
  topPages: Array<{ _id: string; count: number }>;
  deviceStats: Array<{ _id: string; count: number }>;
  browserStats: Array<{ _id: string; count: number }>;
}

export default function Views() {
  const [views, setViews] = useState<View[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchViews();
    fetchStats();
  }, [page]);

  const fetchViews = async () => {
    try {
      const response = await fetch(`${config.api.endpoints.views}?page=${page}&limit=50`);
      const data = await response.json();
      setViews(data.views);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching views:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(config.api.endpoints.viewsStats);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchViews();
    fetchStats();
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all views? This cannot be undone.')) return;

    try {
      const response = await fetch(config.api.endpoints.views, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('All views cleared successfully!');
        fetchViews();
        fetchStats();
      }
    } catch (error) {
      console.error('Error clearing views:', error);
      alert('Failed to clear views');
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" strokeWidth={2.5} />;
      case 'tablet':
        return <Tablet className="w-4 h-4" strokeWidth={2.5} />;
      default:
        return <Monitor className="w-4 h-4" strokeWidth={2.5} />;
    }
  };

  if (loading) {
    return <PageShimmer />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
            Visitor Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track and analyze your website traffic and user engagement</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-cream-soft hover:bg-cream-deep border border-border rounded-lg font-semibold text-foreground text-sm transition shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-accent" />
            Refresh
          </button>
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 rounded-lg font-semibold text-sm transition"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="label-mono text-xs uppercase text-muted-foreground font-semibold">Total Views</span>
              <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-4xl font-display font-bold text-foreground">{stats.total.toLocaleString()}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="label-mono text-xs uppercase text-muted-foreground font-semibold">Unique Visitors</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-700 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-4xl font-display font-bold text-foreground">{stats.uniqueVisitors.toLocaleString()}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="label-mono text-xs uppercase text-muted-foreground font-semibold">Last 24 Hours</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center">
                <span className="label-mono text-xs font-bold">24h</span>
              </div>
            </div>
            <p className="text-2xl sm:text-4xl font-display font-bold text-foreground">{stats.last24h.toLocaleString()}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="label-mono text-xs uppercase text-muted-foreground font-semibold">Last 7 Days</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-700 flex items-center justify-center">
                <span className="label-mono text-xs font-bold">7d</span>
              </div>
            </div>
            <p className="text-2xl sm:text-4xl font-display font-bold text-foreground">{stats.last7days.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Top Pages & Device Stats */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Pages */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-display font-bold text-foreground mb-4">Top Pages</h3>
            <div className="space-y-2">
              {stats.topPages.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                  <span className="label-mono font-medium text-xs sm:text-sm text-foreground truncate flex-1">{p._id}</span>
                  <span className="px-2.5 py-1 bg-accent/15 text-accent border border-accent/20 rounded label-mono text-xs font-bold ml-2">
                    {p.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Device & Browser Stats */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-display font-bold text-foreground mb-4">Devices & Browsers</h3>
            <div className="space-y-5">
              <div>
                <p className="label-mono text-xs uppercase text-muted-foreground font-semibold mb-2.5">Devices</p>
                <div className="space-y-2">
                  {stats.deviceStats.map((device, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-background border border-border rounded-lg">
                      <div className="flex items-center gap-2.5 text-foreground">
                        {getDeviceIcon(device._id)}
                        <span className="font-medium text-sm">{device._id}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-cream-deep border border-border rounded label-mono text-xs font-bold text-foreground">
                        {device.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="label-mono text-xs uppercase text-muted-foreground font-semibold mb-2.5">Browsers</p>
                <div className="space-y-2">
                  {stats.browserStats.map((browser, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-background border border-border rounded-lg">
                      <span className="font-medium text-sm text-foreground">{browser._id}</span>
                      <span className="px-2 py-0.5 bg-cream-deep border border-border rounded label-mono text-xs font-bold text-foreground">
                        {browser.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Views Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-cream-deep border-b border-border text-foreground">
              <tr>
                <th className="px-4 py-3 text-xs font-bold label-mono uppercase">Time</th>
                <th className="px-4 py-3 text-xs font-bold label-mono uppercase">IP Address</th>
                <th className="px-4 py-3 text-xs font-bold label-mono uppercase">Path</th>
                <th className="px-4 py-3 text-xs font-bold label-mono uppercase">Device</th>
                <th className="px-4 py-3 text-xs font-bold label-mono uppercase">Browser</th>
                <th className="px-4 py-3 text-xs font-bold label-mono uppercase">Referrer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {views.map((view) => (
                <tr key={view.viewId} className="hover:bg-cream-soft transition-colors">
                  <td className="px-4 py-3 text-xs label-mono text-muted-foreground whitespace-nowrap">
                    {new Date(view.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-3 text-xs label-mono font-semibold text-foreground whitespace-nowrap">{view.ipAddress}</td>
                  <td className="px-4 py-3 text-xs label-mono font-medium text-foreground">{view.path}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-foreground">
                      {getDeviceIcon(view.device)}
                      <span>{view.device}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground">{view.browser}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground truncate max-w-xs">
                    {view.referrer || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-border p-4 flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3.5 py-1.5 bg-background border border-border rounded-md text-xs font-semibold text-foreground hover:bg-cream-soft transition disabled:opacity-40"
            >
              Previous
            </button>
            <span className="label-mono text-xs text-muted-foreground font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3.5 py-1.5 bg-background border border-border rounded-md text-xs font-semibold text-foreground hover:bg-cream-soft transition disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
