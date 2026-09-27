import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Edit, Trash2, Eye, EyeOff, Calendar, Tag } from 'lucide-react';
import config, { buildUrl } from '../config/config';
import PageShimmer from '../components/PageShimmer';

interface Doc {
  _id: string;
  docId: string;
  title: string;
  subject: string;
  slug: string;
  azureBlobUrl: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
}

export default function Documentation() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const response = await fetch(config.api.endpoints.documentation);
      const data = await response.json();
      setDocs(data.docs);
    } catch (error) {
      console.error('Error fetching documentation:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDoc = async (docId: string) => {
    if (!confirm('Delete this documentation? This cannot be undone.')) return;

    try {
      const response = await fetch(config.api.endpoints.docById(docId), {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchDocs();
      }
    } catch (error) {
      console.error('Error deleting documentation:', error);
    }
  };

  const filteredDocs = docs.filter(doc => {
    if (filter === 'public') return doc.isPublic;
    if (filter === 'private') return !doc.isPublic;
    return true;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <PageShimmer />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d0d0d] border border-white/[0.06] p-6 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
            Documentation
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Create and manage technical documentation and guides</p>
        </div>
        <button
          onClick={() => navigate('/documentation/create')}
          className="flex items-center gap-2 px-4 py-2 bg-foreground text-background hover:bg-accent rounded-lg font-semibold text-xs uppercase tracking-wider transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Document
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition ${
            filter === 'all'
              ? 'bg-foreground text-background shadow-sm'
              : 'bg-card border border-border text-foreground hover:bg-cream-soft'
          }`}
        >
          All ({docs.length})
        </button>
        <button
          onClick={() => setFilter('public')}
          className={`px-4 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition ${
            filter === 'public'
              ? 'bg-foreground text-background shadow-sm'
              : 'bg-card border border-border text-foreground hover:bg-cream-soft'
          }`}
        >
          Public ({docs.filter(d => d.isPublic).length})
        </button>
        <button
          onClick={() => setFilter('private')}
          className={`px-4 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition ${
            filter === 'private'
              ? 'bg-foreground text-background shadow-sm'
              : 'bg-card border border-border text-foreground hover:bg-cream-soft'
          }`}
        >
          Private ({docs.filter(d => !d.isPublic).length})
        </button>
      </div>

      {/* Documentation List */}
      {filteredDocs.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="text-xl font-display font-bold text-foreground mb-1">No documentation yet</h3>
          <p className="text-muted-foreground text-sm mb-5">Create your first document to get started</p>
          <button
            onClick={() => navigate('/documentation/create')}
            className="px-5 py-2.5 bg-foreground text-background hover:bg-accent rounded-lg font-semibold text-xs uppercase tracking-wider transition"
          >
            Create Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc._id}
              className="bg-[#0d0d0d] border border-white/[0.06] overflow-hidden hover:border-accent/40 transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                {doc.coverImage && (
                  <div className="h-32 border-b border-border overflow-hidden">
                    <img 
                      src={doc.coverImage} 
                      alt={doc.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-block px-2.5 py-0.5 bg-accent/15 text-accent border border-accent/20 rounded label-mono text-[10px] font-semibold uppercase">
                      {doc.subject}
                    </span>
                    <span className={`label-mono text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      doc.isPublic ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' : 'bg-destructive/15 text-destructive border-destructive/30'
                    }`}>
                      {doc.isPublic ? 'PUBLIC' : 'PRIVATE'}
                    </span>
                  </div>

                  <h3 className="text-base font-display font-bold text-foreground mb-3 line-clamp-2">
                    {doc.title}
                  </h3>

                  <div className="flex items-center gap-1.5 label-mono text-[10px] text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    <span>Created: {formatDate(doc.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center gap-2">
                <button
                  onClick={() => navigate(`/documentation/edit/${doc.docId}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-cream-soft hover:bg-cream-deep border border-border rounded-lg text-xs font-semibold text-foreground transition"
                >
                  <Edit className="w-3.5 h-3.5 text-accent" />
                  Edit
                </button>
                <button
                  onClick={() => deleteDoc(doc.docId)}
                  className="px-3 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 rounded-lg text-xs font-semibold transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
