import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Upload, Trash2, Link as LinkIcon, Settings, PenLine, Eye, Layout, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import config from '../config/config';
import PageShimmer from '../components/PageShimmer';

interface BlogLink {
  platform: string;
  url: string;
}

interface Asset {
  name: string;
  url: string;
  filename: string;
}

export default function EditBlog() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [editorMode, setEditorMode] = useState<'split' | 'edit' | 'preview'>('split');
  
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [subject, setSubject] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [tags, setTags] = useState('');
  const [datetime, setDatetime] = useState('');
  const [footer, setFooter] = useState('');
  const [blogLinks, setBlogLinks] = useState<BlogLink[]>([{ platform: '', url: '' }]);
  const [mdContent, setMdContent] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [coverImage, setCoverImage] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchBlog();
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      const isCreate = window.location.pathname.includes('/create/');
      if (isCreate) {
        setTitle('');
        setLoading(false);
        return;
      }

      const response = await fetch(config.api.endpoints.blogById(blogId!));
      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Blog not found, initializing empty form');
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch');
      }

      const data = await response.json();
      const blog = data.blog || {};

      setTitle(blog.title || '');
      setTagline(blog.tagline || '');
      setSubject(blog.subject || '');
      setShortDescription(blog.shortDescription || '');
      setTags(blog.tags?.join(', ') || '');
      setDatetime(blog.datetime ? new Date(blog.datetime).toISOString().split('T')[0] : '');
      setFooter(blog.footer || '');
      setBlogLinks(blog.blogLinks?.length > 0 ? blog.blogLinks : [{ platform: '', url: '' }]);
      setAssets(blog.assets || []);
      setCoverImage(blog.coverImage || '');

      if (blog.mdFiles && blog.mdFiles.length > 0) {
        const mdResponse = await fetch(config.api.endpoints.blogMdContent(blogId!));
        if (mdResponse.ok) {
          const mdData = await mdResponse.json();
          if (mdData.exists) {
            setMdContent(mdData.content);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBlogLink = () => setBlogLinks([...blogLinks, { platform: '', url: '' }]);
  const removeBlogLink = (index: number) => setBlogLinks(blogLinks.filter((_, i) => i !== index));
  const updateBlogLink = (index: number, field: 'platform' | 'url', value: string) => {
    const newLinks = [...blogLinks];
    newLinks[index][field] = value;
    setBlogLinks(newLinks);
  };

  const handleSave = async () => {
    setUploading(true);
    try {
      const updateData = {
        title, tagline, subject, shortDescription,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        datetime, footer,
        blogLinks: blogLinks.filter(l => l.platform && l.url)
      };

      await fetch(config.api.endpoints.blogById(blogId!), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (mdContent !== undefined) {
        let processedContent = mdContent;
        assets.forEach(asset => {
          if (typeof asset !== 'string' && asset.name) {
            const escapedName = asset.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const placeholder = new RegExp(`\\{\\{${escapedName}\\}\\}`, 'g');
            processedContent = processedContent.replace(placeholder, asset.url);
          }
        });

        const mdBlob = new Blob([processedContent], { type: 'text/markdown' });
        const mdFormData = new FormData();
        mdFormData.append('mdFile', mdBlob, `${blogId}.md`);

        await fetch(config.api.endpoints.blogMdFile(blogId!), {
          method: 'POST',
          body: mdFormData
        });
      }

      alert('Blog updated successfully!');
      navigate('/blogs');
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Failed to save blog');
    } finally {
      setUploading(false);
    }
  };

  const uploadAssets = async (files: FileList) => {
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => formData.append('assets', file));

      const response = await fetch(config.api.endpoints.blogAssets(blogId!), {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setAssets(data.blog.assets);
      }
    } catch (error) {
      console.error('Error uploading assets:', error);
    } finally {
      setUploading(false);
    }
  };

  const uploadCover = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('cover', file);

      const response = await fetch(config.api.endpoints.blogCover(blogId!), {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setCoverImage(data.url);
      }
    } catch (error) {
      console.error('Error uploading cover:', error);
    } finally {
      setUploading(false);
    }
  };

  const deleteAsset = async (index: number) => {
    if (!confirm('Delete this asset?')) return;
    try {
      const response = await fetch(config.api.endpoints.blogAssetByIndex(blogId!, index), { method: 'DELETE' });
      if (response.ok) {
        const data = await response.json();
        setAssets(data.blog.assets);
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const updateAssetName = async (index: number, newName: string) => {
    try {
      const response = await fetch(config.api.endpoints.blogAssetName(blogId!, index), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      if (response.ok) {
        const data = await response.json();
        setAssets(data.blog.assets);
      }
    } catch (error) {
      console.error('Error updating asset name:', error);
    }
  };

  const handleTabPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textareaRef.current!.selectionStart;
      const end = textareaRef.current!.selectionEnd;
      setMdContent(mdContent.substring(0, start) + '  ' + mdContent.substring(end));
      setTimeout(() => {
        textareaRef.current!.selectionStart = textareaRef.current!.selectionEnd = start + 2;
      }, 0);
    }
  };

  if (loading) return <PageShimmer />;

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0a0a0a]/90 backdrop-blur-md text-white overflow-hidden z-10">
      {uploading && (
        <div className="absolute top-0 left-0 right-0 z-[100] h-1 bg-white/10 overflow-hidden">
          <div className="h-full bg-white animate-pulse" style={{ width: '100%' }} />
        </div>
      )}

      {/* Editor Topbar */}
      <div className="flex-shrink-0 h-14 bg-[#0d0d0d] border-b border-white/[0.06] flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/blogs')}
            className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/[0.05] transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="h-4 w-px bg-white/20 mx-1"></div>
          <div>
            <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{blogId}</div>
            <div className="text-sm font-semibold truncate max-w-[200px] sm:max-w-md">{title || 'Untitled Blog'}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Modes */}
          <div className="hidden md:flex bg-white/[0.03] border border-white/[0.06] rounded-none">
            <button onClick={() => setEditorMode('edit')} className={`p-1.5 ${editorMode === 'edit' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`} title="Edit Only">
              <PenLine className="w-4 h-4" />
            </button>
            <button onClick={() => setEditorMode('split')} className={`p-1.5 ${editorMode === 'split' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`} title="Split View">
              <Layout className="w-4 h-4" />
            </button>
            <button onClick={() => setEditorMode('preview')} className={`p-1.5 ${editorMode === 'preview' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`} title="Preview Only">
              <Eye className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-white/20 mx-2 hidden sm:block"></div>

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition border ${showSidebar ? 'bg-white/[0.1] border-white/20 text-white' : 'bg-transparent border-transparent text-white/60 hover:text-white hover:bg-white/[0.05]'}`}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <button
            onClick={handleSave}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-1.5 bg-white text-black font-semibold text-[11px] uppercase tracking-wider hover:bg-white/90 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">{uploading ? 'Saving' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative transition-all duration-300">
          {/* Markdown Input */}
          {(editorMode === 'edit' || editorMode === 'split') && (
            <div className={`flex-1 flex flex-col ${editorMode === 'split' ? 'border-r border-white/[0.06]' : ''}`}>
              <div className="h-10 bg-[#0a0a0a] border-b border-white/[0.06] flex items-center px-4 flex-shrink-0">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Markdown</span>
              </div>
              <textarea
                ref={textareaRef}
                value={mdContent}
                onChange={(e) => setMdContent(e.target.value)}
                onKeyDown={handleTabPress}
                placeholder="# Start writing your blog..."
                className="flex-1 w-full bg-transparent text-white p-6 resize-none focus:outline-none font-mono text-sm leading-relaxed custom-scrollbar"
                spellCheck="false"
              />
            </div>
          )}

          {/* Live Preview */}
          {(editorMode === 'preview' || editorMode === 'split') && (
            <div className="flex-1 flex flex-col bg-[#0d0d0d] overflow-hidden">
              <div className="h-10 border-b border-white/[0.06] flex items-center px-4 flex-shrink-0">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Preview</span>
              </div>
              <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                <div className="max-w-3xl mx-auto prose prose-invert prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-img:rounded-none w-full">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {mdContent || '*Preview will appear here*'}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sliding Settings Sidebar */}
        <div 
          className={`absolute top-0 right-0 bottom-0 w-80 sm:w-96 bg-[#0d0d0d] border-l border-white/[0.06] transform transition-transform duration-300 ease-in-out z-40 flex flex-col shadow-2xl ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="h-14 border-b border-white/[0.06] flex items-center justify-between px-6 flex-shrink-0 bg-[#0a0a0a]">
            <span className="text-xs font-semibold uppercase tracking-wider">Blog Metadata</span>
            <button onClick={() => setShowSidebar(false)} className="p-1.5 text-white/40 hover:text-white transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-white/40 border-b border-white/[0.06] pb-2">Basic Info</h3>
              
              <div>
                <label className="block text-[10px] font-mono uppercase text-white/60 mb-1.5">Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-none text-xs text-white focus:outline-none focus:border-white/30" placeholder="Blog Title" />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-white/60 mb-1.5">Tagline</label>
                <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-none text-xs text-white focus:outline-none focus:border-white/30" placeholder="Short tagline" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/60 mb-1.5">Subject</label>
                  <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-none text-xs text-white focus:outline-none focus:border-white/30" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/60 mb-1.5">Date</label>
                  <input type="date" value={datetime} onChange={(e) => setDatetime(e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-none text-xs text-white focus:outline-none focus:border-white/30 [&::-webkit-calendar-picker-indicator]:invert" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-white/60 mb-1.5">Description</label>
                <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={3} className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-none text-xs text-white focus:outline-none focus:border-white/30 resize-none custom-scrollbar" />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-white/60 mb-1.5">Tags (comma separated)</label>
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-none text-xs text-white focus:outline-none focus:border-white/30" />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-white/60 mb-1.5">Footer</label>
                <input type="text" value={footer} onChange={(e) => setFooter(e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-none text-xs text-white focus:outline-none focus:border-white/30" />
              </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-white/40 border-b border-white/[0.06] pb-2">Cover Image</h3>
              <label className="block">
                <div className="w-full py-2 bg-transparent border border-white/20 text-center text-xs font-semibold text-white/80 cursor-pointer hover:bg-white/[0.05] transition">
                  {coverImage ? 'Change Cover' : 'Upload Cover'}
                </div>
                <input type="file" onChange={(e) => e.target.files && uploadCover(e.target.files[0])} className="hidden" accept="image/*" />
              </label>
              {coverImage && (
                <img src={coverImage} alt="Cover" className="w-full h-32 object-cover border border-white/[0.1]" />
              )}
            </div>

            {/* Blog Links */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-white/40">Links</h3>
                <button onClick={addBlogLink} className="text-[10px] text-white hover:underline flex items-center gap-1"><LinkIcon className="w-3 h-3"/> Add</button>
              </div>
              {blogLinks.map((link, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <input type="text" value={link.platform} onChange={(e) => updateBlogLink(index, 'platform', e.target.value)} placeholder="Platform" className="w-full px-3 py-1.5 bg-black/40 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-white/30" />
                    <input type="url" value={link.url} onChange={(e) => updateBlogLink(index, 'url', e.target.value)} placeholder="URL" className="w-full px-3 py-1.5 bg-black/40 border border-white/[0.1] text-xs text-white focus:outline-none focus:border-white/30" />
                  </div>
                  {blogLinks.length > 1 && (
                    <button onClick={() => removeBlogLink(index)} className="p-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 transition mt-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Assets */}
            <div className="space-y-4 pb-10">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-white/40">Assets</h3>
                <label className="text-[10px] text-white hover:underline flex items-center gap-1 cursor-pointer">
                  <Upload className="w-3 h-3"/> Upload
                  <input type="file" multiple onChange={(e) => e.target.files && uploadAssets(e.target.files)} className="hidden" />
                </label>
              </div>
              
              <div className="space-y-3">
                {assets.length === 0 && <p className="text-[10px] text-white/30 font-mono text-center">No assets uploaded</p>}
                {assets.map((asset, index) => {
                  const assetUrl = typeof asset === 'string' ? asset : asset.url;
                  const assetName = typeof asset === 'string' ? '' : asset.name;
                  return (
                    <div key={index} className="bg-black/40 border border-white/[0.06] p-2 space-y-2">
                      <img src={assetUrl} alt="Asset" className="w-full h-20 object-cover border border-white/10" />
                      <div>
                        <label className="text-[9px] font-mono uppercase text-white/40">Reference Name</label>
                        <input type="text" value={assetName} onChange={(e) => updateAssetName(index, e.target.value)} placeholder="e.g. image-1" className="w-full px-2 py-1 bg-black text-xs border border-white/[0.1] focus:outline-none focus:border-white/30" />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <code className="text-[9px] font-mono text-white/70 bg-white/5 px-1 py-0.5">{assetName ? `{{${assetName}}}` : 'Set name first'}</code>
                        <button onClick={() => deleteAsset(index)} className="text-red-500 hover:text-red-400 p-1"><Trash2 className="w-3.5 h-3.5"/></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
        
        {/* Overlay when sidebar is open on mobile */}
        {showSidebar && (
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </div>
    </div>
  );
}
