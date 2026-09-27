import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Edit, Trash2, Calendar, Tag, Check, X } from 'lucide-react';
import config, { buildUrl } from '../config/config';
import PageShimmer from '../components/PageShimmer';

interface Blog {
  _id: string;
  blogId: string;
  title: string;
  slug: string;
  tagline: string;
  subject: string;
  shortDescription: string;
  tags: string[];
  datetime: string;
  coverImage: string;
  created_at: string;
  isVisible: boolean;
}

export default function Blogs() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBlogId, setNewBlogId] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${config.api.endpoints.blogs}?admin=true`);
      const data = await response.json();
      setBlogs(data.blogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (blogId: string) => {
    if (!confirm('Delete this blog? This will remove all associated files from Azure.')) return;

    try {
      const response = await fetch(config.api.endpoints.blogById(blogId), {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchBlogs();
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  const toggleVisibility = async (blog: Blog) => {
    const newVisibility = blog.isVisible === false ? true : false;
    setTogglingId(blog.blogId);
    try {
      const url = `${config.api.baseUrl}/api/blogs/${blog.blogId}/visibility`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: newVisibility })
      });
      const data = await response.json();
      if (response.ok) {
        setBlogs(prev =>
          prev.map(b => b.blogId === blog.blogId ? { ...b, isVisible: newVisibility } : b)
        );
      } else {
        alert(`Failed: ${data.message || response.status}`);
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Network error — check console');
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreateBlog = () => {
    if (!newBlogId.trim()) {
      alert('Please enter a blog ID');
      return;
    }
    navigate(`/blogs/create/${newBlogId}`);
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d0d0d] border border-white/[0.06] rounded-none p-6 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
            Manage Blogs
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Write, edit, and publish blog articles</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-white/90 border border-white/20 rounded-none font-semibold text-xs uppercase tracking-wider transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Blog
        </button>
      </div>

      {/* Blogs Grid */}
      {blogs.length === 0 ? (
        <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-none p-12 text-center shadow-sm">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="text-xl font-display font-bold text-foreground mb-1">No blogs yet</h3>
          <p className="text-muted-foreground text-sm mb-5">Create your first blog post to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-white text-black hover:bg-white/90 border border-white/20 rounded-none font-semibold text-xs uppercase tracking-wider transition"
          >
            Create Blog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className={`bg-[#0d0d0d] border border-white/[0.06] rounded-none overflow-hidden hover:border-white/[0.2] transition-all shadow-sm flex flex-col justify-between ${
                blog.isVisible === false ? 'opacity-60' : ''
              }`}
            >
              <div>
                {/* Cover Image */}
                {blog.coverImage && (
                  <div className="h-28 border-b border-white/[0.06] overflow-hidden">
                    <img 
                      src={blog.coverImage} 
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  {blog.subject && (
                    <div className="mb-2">
                      <span className="inline-block px-2.5 py-0.5 bg-white/[0.05] text-white/70 border border-white/[0.1] rounded-none font-mono text-[9px] font-semibold uppercase">
                        {blog.subject}
                      </span>
                    </div>
                  )}

                  <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2">
                    {blog.title}
                  </h3>

                  {blog.shortDescription && (
                    <p className="text-[11px] text-white/50 mb-3 line-clamp-2 leading-relaxed">
                      {blog.shortDescription}
                    </p>
                  )}

                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {blog.tags.slice(0, 3).map((tag, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-0.5 bg-white/[0.03] border border-white/[0.06] rounded-none font-mono text-[9px] uppercase tracking-wider text-white/70 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 label-mono text-[10px] text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    <span>{formatDate(blog.datetime || blog.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 pt-0 flex items-center gap-2">
                <button
                  onClick={() => toggleVisibility(blog)}
                  disabled={togglingId === blog.blogId}
                  title={blog.isVisible === false ? 'Hidden — click to show' : 'Visible — click to hide'}
                  className={`flex items-center justify-center p-2 border border-border rounded-none text-xs font-semibold transition ${
                    blog.isVisible === false
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-cream-soft hover:bg-cream-deep text-foreground'
                  } ${togglingId === blog.blogId ? 'opacity-50' : ''}`}
                >
                  {togglingId === blog.blogId
                    ? <span className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin inline-block" />
                    : blog.isVisible === false
                      ? <X className="w-4 h-4" />
                      : <Check className="w-4 h-4 text-emerald-600" />
                  }
                </button>
                <button
                  onClick={() => navigate(`/blogs/edit/${blog.blogId}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-white/90 border border-white/20 rounded-none text-[10px] uppercase tracking-widest font-semibold transition"
                >
                  <Edit className="w-3.5 h-3.5 text-accent" />
                  Edit
                </button>
                <button
                  onClick={() => deleteBlog(blog.blogId)}
                  className="px-3 py-1.5 bg-transparent text-white/40 border border-white/20 hover:text-red-500 hover:border-red-500/50 rounded-none text-[10px] font-semibold transition flex items-center justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Blog Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-none p-6 shadow-2xl max-w-md w-full shadow-xl space-y-4 font-sans">
            <h2 className="text-xl font-display font-bold text-foreground tracking-tight">
              Create New Blog
            </h2>
            
            <div>
              <label className="label-mono block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Blog ID *
              </label>
              <input
                type="text"
                value={newBlogId}
                onChange={(e) => setNewBlogId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0a0a0a] border border-white/[0.1] rounded-none text-white focus:border-white/[0.3] text-sm font-medium focus:outline-none focus:border-accent"
                placeholder="e.g., kafka-system-design"
              />
              <p className="label-mono text-[10px] text-muted-foreground mt-1">
                Use lowercase with hyphens (e.g., kafka-system-design)
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewBlogId('');
                }}
                className="flex-1 px-4 py-2.5 bg-transparent border border-white/20 text-white/60 hover:text-white hover:bg-white/[0.05] rounded-none font-semibold text-xs uppercase tracking-wider transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBlog}
                className="flex-1 px-4 py-2.5 bg-white text-black hover:bg-white/90 border border-white/20 rounded-none font-semibold text-xs uppercase tracking-wider transition shadow-sm"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
