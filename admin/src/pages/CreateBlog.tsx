import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Upload, Trash2, Link as LinkIcon, Settings, PenLine, Eye, Layout, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import config from '../config/config';

interface BlogLink {
  platform: string;
  url: string;
}

interface Asset {
  id: string;
  file: File | null;
  filename: string;
  assetName: string;
  preview?: string;
}

export default function CreateBlog() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [editorMode, setEditorMode] = useState<'split' | 'edit' | 'preview'>('split');
  
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [subject, setSubject] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [tags, setTags] = useState('');
  const [datetime, setDatetime] = useState(new Date().toISOString().split('T')[0]);
  const [footer, setFooter] = useState('');
  const [blogLinks, setBlogLinks] = useState<BlogLink[]>([{ platform: '', url: '' }]);
  const [mdContent, setMdContent] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const addBlogLink = () => setBlogLinks([...blogLinks, { platform: '', url: '' }]);
  const removeBlogLink = (index: number) => setBlogLinks(blogLinks.filter((_, i) => i !== index));
  const updateBlogLink = (index: number, field: 'platform' | 'url', value: string) => {
    const newLinks = [...blogLinks];
    newLinks[index][field] = value;
    setBlogLinks(newLinks);
  };

  const addAsset = () => {
    setAssets([...assets, { id: Math.random().toString(36).substring(2, 11), file: null, filename: '', assetName: '' }]);
  };

  const removeAsset = (id: string) => setAssets(assets.filter(a => a.id !== id));

  const updateAsset = (id: string, field: keyof Asset, value: any) => {
    setAssets(assets.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleFileChange = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      updateAsset(id, 'file', file);
      updateAsset(id, 'filename', file.name);
      updateAsset(id, 'preview', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCoverChange = (file: File) => {
    setCoverImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!title) {
      alert('Title is required');
      return;
    }
    
    // We prompt for ARCHITECTURE_PASSWORD since the backend route requires it
    const password = prompt("Enter architecture password to create blog:");
    if (!password) return;

    setUploading(true);
    try {
      const blogData = {
        blogId, title, tagline, subject, shortDescription,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        datetime, footer,
        blogLinks: blogLinks.filter(l => l.platform && l.url),
        assets: [], mdFiles: [], coverImage: '', password
      };

      const createRes = await fetch(config.api.endpoints.blogCreate, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogData)
      });
      if (!createRes.ok) throw new Error('Failed to create blog');

      if (coverImage) {
        const fd = new FormData(); fd.append('cover', coverImage);
        await fetch(config.api.endpoints.blogCover(blogId!), { method: 'POST', body: fd });
      }

      const assetsWithFiles = assets.filter(a => a.file);
      if (assetsWithFiles.length > 0) {
        const fd = new FormData();
        const assetNames: string[] = [];
        assetsWithFiles.forEach(a => {
          fd.append('assets', a.file!);
          assetNames.push(a.assetName);
        });
        fd.append('assetNames', JSON.stringify(assetNames));
        await fetch(config.api.endpoints.blogAssets(blogId!), { method: 'POST', body: fd });
      }

      if (mdContent) {
        const mdBlob = new Blob([mdContent], { type: 'text/markdown' });
        const fd = new FormData();
        fd.append('mdFile', mdBlob, `${blogId}.md`);
        await fetch(config.api.endpoints.blogMdFile(blogId!), { method: 'POST', body: fd });
      }

      alert('Blog created successfully!');
      navigate('/blogs');
    } catch (error) {
      console.error('Error creating blog:', error);
      alert('Failed to create blog');
    } finally {
      setUploading(false);
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
          <button onClick={() => navigate('/blogs')} className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/[0.05] transition">
            <X className="w-5 h-5" />
          </button>
          <div className="h-4 w-px bg-white/20 mx-1"></div>
          <div>
            <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{blogId} (NEW)</div>
            <div className="text-sm font-semibold truncate max-w-[200px] sm:max-w-md">{title || 'Untitled Blog'}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex bg-white/[0.03] border border-white/[0.06] rounded-none">
            <button onClick={() => setEditorMode('edit')} className={`p-1.5 ${editorMode === 'edit' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}><PenLine className="w-4 h-4" /></button>
            <button onClick={() => setEditorMode('split')} className={`p-1.5 ${editorMode === 'split' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}><Layout className="w-4 h-4" /></button>
            <button onClick={() => setEditorMode('preview')} className={`p-1.5 ${editorMode === 'preview' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}><Eye className="w-4 h-4" /></button>
          </div>

          <div className="h-4 w-px bg-white/20 mx-2 hidden sm:block"></div>

          <button onClick={() => setShowSidebar(!showSidebar)} className={`flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition border ${showSidebar ? 'bg-white/[0.1] border-white/20 text-white' : 'bg-transparent border-transparent text-white/60 hover:text-white hover:bg-white/[0.05]'}`}>
            <Settings className="w-4 h-4" /><span className="hidden sm:inline">Settings</span>
          </button>
          <button onClick={handleSave} disabled={uploading} className="flex items-center gap-2 px-4 py-1.5 bg-white text-black font-semibold text-[11px] uppercase tracking-wider hover:bg-white/90 transition disabled:opacity-50">
            <Save className="w-4 h-4" /><span className="hidden sm:inline">{uploading ? 'Saving' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative transition-all duration-300">
          {(editorMode === 'edit' || editorMode === 'split') && (
            <div className={`flex-1 flex flex-col ${editorMode === 'split' ? 'border-r border-white/[0.06]' : ''}`}>
              <div className="h-10 bg-[#0a0a0a] border-b border-white/[0.06] flex items-center px-4 flex-shrink-0">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Markdown</span>
              </div>
              <textarea ref={textareaRef} value={mdContent} onChange={(e) => setMdContent(e.target.value)} onKeyDown={handleTabPress} placeholder="# Start writing your blog..." className="flex-1 w-full bg-transparent text-white p-6 resize-none focus:outline-none font-mono text-sm leading-relaxed custom-scrollbar" spellCheck="false" />
            </div>
          )}
          {(editorMode === 'preview' || editorMode === 'split') && (
            <div className="flex-1 flex flex-col bg-[#0d0d0d] overflow-hidden">
              <div className="h-10 border-b border-white/[0.06] flex items-center px-4 flex-shrink-0">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Preview</span>
              </div>
              <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                <div className="max-w-3xl mx-auto prose prose-invert prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-img:rounded-none w-full">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{mdContent || '*Preview will appear here*'}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className={`absolute top-0 right-0 bottom-0 w-80 sm:w-96 bg-[#0d0d0d] border-l border-white/[0.06] transform transition-transform duration-300 ease-in-out z-40 flex flex-col shadow-2xl ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-14 border-b border-white/[0.06] flex items-center justify-between px-6 flex-shrink-0 bg-[#0a0a0a]">
            <span className="text-xs font-semibold uppercase tracking-wider">Blog Metadata</span>
            <button onClick={() => setShowSidebar(false)} className="p-1.5 text-white/40 hover:text-white transition"><X className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            <div className="space-y-4">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-white/40 border-b border-white/[0.06] pb-2">Basic Info</h3>
              <div><label className="block text-[10px] font-mono uppercase text-white/60 mb-1.5">Title *</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-none text-xs text-white focus:outline-none focus:border-white/30" placeholder="Blog Title" /></div>
              <div><label className="block text-[10px] font-mono uppercase text-white/60 mb-1.5">Tagline</label><input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-none text-xs text-white focus:outline-none focus:border-white/30" placeholder="Short tagline" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[10px] font-mono uppercase text-white/60 mb-1.5">Subject</label><input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-none text-xs text-white focus:outline-none focus:border-white/30" /></div>
                <div><label className="block text-[10px] font-mono uppercase text-white/60 mb-1.5">Date</label><input type="date" value={datetime} onChange={(e) => setDatetime(e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-none text-xs text-white focus:outline-none focus:border-white/30 [&::-webkit-calendar-picker-indicator]:invert" /></div>
              </div>
              <div><label className="block text-[10px] font-mono uppercase text-white/60 mb-1.5">Description</label><textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={3} className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-none text-xs text-white focus:outline-none focus:border-white/30 resize-none custom-scrollbar" /></div>
              <div><label className="block text-[10px] font-mono uppercase text-white/60 mb-1.5">Tags (comma separated)</label><input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-none text-xs text-white focus:outline-none focus:border-white/30" /></div>
              <div><label className="block text-[10px] font-mono uppercase text-white/60 mb-1.5">Footer</label><input type="text" value={footer} onChange={(e) => setFooter(e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/[0.1] rounded-none text-xs text-white focus:outline-none focus:border-white/30" /></div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-white/40 border-b border-white/[0.06] pb-2">Cover Image</h3>
              <label className="block">
                <div className="w-full py-2 bg-transparent border border-white/20 text-center text-xs font-semibold text-white/80 cursor-pointer hover:bg-white/[0.05] transition">{coverImage ? 'Change Cover' : 'Upload Cover'}</div>
                <input type="file" onChange={(e) => e.target.files && handleCoverChange(e.target.files[0])} className="hidden" accept="image/*" />
              </label>
              {coverPreview && <img src={coverPreview} alt="Cover" className="w-full h-32 object-cover border border-white/[0.1]" />}
            </div>

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
                  {blogLinks.length > 1 && <button onClick={() => removeBlogLink(index)} className="p-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 transition mt-1"><Trash2 className="w-4 h-4" /></button>}
                </div>
              ))}
            </div>

            <div className="space-y-4 pb-10">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-white/40">Assets</h3>
                <button onClick={addAsset} className="text-[10px] text-white hover:underline flex items-center gap-1 cursor-pointer"><Upload className="w-3 h-3"/> Add Asset</button>
              </div>
              <div className="space-y-3">
                {assets.length === 0 && <p className="text-[10px] text-white/30 font-mono text-center">No assets uploaded</p>}
                {assets.map((asset) => (
                  <div key={asset.id} className="bg-black/40 border border-white/[0.06] p-2 space-y-2">
                    <label className="block">
                      <div className="w-full p-2 bg-transparent border border-white/20 text-center font-bold text-xs cursor-pointer hover:bg-white/[0.05] text-white/80">Choose File</div>
                      <input type="file" onChange={(e) => e.target.files && handleFileChange(asset.id, e.target.files[0])} className="hidden" accept="image/*" />
                    </label>
                    {asset.preview && <img src={asset.preview} alt="Preview" className="w-full h-20 object-cover border border-white/10" />}
                    <div>
                      <label className="text-[9px] font-mono uppercase text-white/40">Reference Name</label>
                      <input type="text" value={asset.assetName} onChange={(e) => updateAsset(asset.id, 'assetName', e.target.value)} placeholder="e.g. image-1" className="w-full px-2 py-1 bg-black text-xs border border-white/[0.1] focus:outline-none focus:border-white/30 text-white" />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <code className="text-[9px] font-mono text-white/70 bg-white/5 px-1 py-0.5">{asset.assetName ? `{{${asset.assetName}}}` : 'Set name first'}</code>
                      <button onClick={() => removeAsset(asset.id)} className="text-red-500 hover:text-red-400 p-1"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
