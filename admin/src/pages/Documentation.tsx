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
    <div className="p-8 bg-premium-gradient min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-premium-brown-900 mb-2">
              Documentation
            </h1>
            <p className="text-premium-brown-600 font-medium">Create and manage your documentation</p>
          </div>
          <button
            onClick={() => navigate('/documentation/create')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-premium-brown-700 to-premium-brown-800 text-white font-semibold hover:from-premium-brown-800 hover:to-premium-brown-900 transition-all shadow-premium-lg hover:shadow-premium-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" strokeWidth={2} />
            New Document
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white/80 backdrop-blur-sm border border-premium-brown-200/50 p-2 mb-6 shadow-premium">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-6 py-3 font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-premium-brown-700 to-premium-brown-800 text-white shadow-premium'
                  : 'bg-transparent text-premium-brown-700 hover:bg-premium-brown-50'
              }`}
            >
              All ({docs.length})
            </button>
            <button
              onClick={() => setFilter('public')}
              className={`flex-1 px-6 py-3 font-semibold transition-all ${
                filter === 'public'
                  ? 'bg-gradient-to-r from-premium-brown-700 to-premium-brown-800 text-white shadow-premium'
                  : 'bg-transparent text-premium-brown-700 hover:bg-premium-brown-50'
              }`}
            >
              Public ({docs.filter(d => d.isPublic).length})
            </button>
            <button
              onClick={() => setFilter('private')}
              className={`flex-1 px-6 py-3 font-semibold transition-all ${
                filter === 'private'
                  ? 'bg-gradient-to-r from-premium-brown-700 to-premium-brown-800 text-white shadow-premium'
                  : 'bg-transparent text-premium-brown-700 hover:bg-premium-brown-50'
              }`}
            >
              Private ({docs.filter(d => !d.isPublic).length})
            </button>
          </div>
        </div>

        {/* Documentation List */}
        {filteredDocs.length === 0 ? (
          <div className="bg-gray-50 border border-premium-brown-200/30 p-12 text-center shadow-premium">
            <FileText className="w-16 h-16 text-premium-brown-400 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-2xl font-serif font-bold text-premium-brown-900 mb-2">No documentation yet</h3>
            <p className="text-premium-brown-600 mb-6">Create your first document to get started</p>
            <button
              onClick={() => navigate('/documentation/create')}
              className="px-6 py-3 bg-gradient-to-r from-premium-brown-700 to-premium-brown-800 text-white font-semibold hover:from-premium-brown-800 hover:to-premium-brown-900 transition-all shadow-premium-lg"
            >
              Create Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDocs.map((doc, index) => (
              <div
                key={doc._id}
                className="bg-gray-50 border border-premium-brown-200/30 overflow-hidden shadow-premium hover:shadow-premium-lg transition-all duration-300 group relative"
              >
                {/* Premium shimmer effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </div>

                {/* Doc Number Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-white/90 backdrop-blur-sm border border-premium-brown-300 px-3 py-1.5 shadow-sm">
                    <span className="text-xs font-bold text-premium-brown-700">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Cover Image */}
                {doc.coverImage && (
                  <div className="h-48 border-b border-premium-brown-200/30 overflow-hidden bg-premium-brown-100/20">
                    <img 
                      src={doc.coverImage} 
                      alt={doc.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                <div className="p-6 relative">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold text-premium-brown-500 uppercase tracking-wider">
                          DOCS
                        </span>
                      </div>
                      <h3 className="text-xl font-serif font-bold text-premium-brown-900 mb-2 line-clamp-2 group-hover:text-premium-brown-700 transition-colors">
                        {doc.title}
                      </h3>
                    </div>
                  </div>

                  {/* Subject */}
                  {doc.subject && (
                    <div className="mb-4">
                      <p className="text-sm text-premium-brown-600 line-clamp-2">
                        {doc.subject}
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-premium-brown-200/30">
                    <div className="flex items-center gap-2 text-sm text-premium-brown-500">
                      <Calendar className="w-4 h-4" strokeWidth={2} />
                      <span>{formatDate(doc.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.isPublic ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 border border-green-200">
                          <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                          Public
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 border border-red-200">
                          <EyeOff className="w-3.5 h-3.5" strokeWidth={2} />
                          Private
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/documentation/edit/${doc.docId}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-premium-brown-700 text-white font-semibold hover:bg-premium-brown-800 transition-all shadow-sm hover:shadow-md"
                    >
                      <Edit className="w-4 h-4" strokeWidth={2} />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteDoc(doc.docId)}
                      className="flex items-center justify-center px-4 py-2.5 bg-red-600 text-white font-semibold hover:bg-red-700 transition-all shadow-sm hover:shadow-md"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
