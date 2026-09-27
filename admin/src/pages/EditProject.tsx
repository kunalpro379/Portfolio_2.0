import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Upload, Trash2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import config from '../config/config';
import PageShimmer from '../components/PageShimmer';

interface Link {
  name: string;
  url: string;
}

interface Asset {
  name: string;
  url: string;
  filename: string;
}

export default function EditProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'metadata' | 'markdown'>('metadata');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Project data
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [footer, setFooter] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [links, setLinks] = useState<Link[]>([{ name: '', url: '' }]);
  const [mdContent, setMdContent] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [cardAssets, setCardAssets] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);

  // Compute preview markdown with replaced asset URLs
  const getPreviewMarkdown = () => {
    let preview = mdContent;
    assets.forEach(asset => {
      if (typeof asset !== 'string' && asset.name && asset.url) {
        // Escape special regex characters in asset name
        const escapedName = asset.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const placeholder = new RegExp(`\\{\\{${escapedName}\\}\\}`, 'g');
        preview = preview.replace(placeholder, asset.url);
      }
    });
    return preview;
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(config.api.endpoints.projectById(projectId!));
      const data = await response.json();
      const project = data.project;

      setTitle(project.title || '');
      setTagline(project.tagline || '');
      setFooter(project.footer || '');
      setDescription(project.description || '');
      setTechStack(project.tags?.join(', ') || '');
      setLinks(project.links?.length > 0 ? project.links : [{ name: '', url: '' }]);
      setAssets(project.assets || []);
      setCardAssets(project.cardasset || []);
      setFeatured(project.featured || false);

      // Fetch MD content if exists
      if (project.mdFiles && project.mdFiles.length > 0) {
        const mdResponse = await fetch(config.api.endpoints.projectMdContent(projectId!));
        const mdData = await mdResponse.json();
        if (mdData.exists) {
          setMdContent(mdData.content);
        }
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLink = () => {
    setLinks([...links, { name: '', url: '' }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: 'name' | 'url', value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const handleSave = async () => {
    setUploading(true);
    try {
      // Update project metadata
      const updateData = {
        title,
        tagline,
        footer,
        description,
        tags: techStack.split(',').map(t => t.trim()).filter(t => t),
        links: links.filter(l => l.name && l.url),
        featured
      };

      await fetch(config.api.endpoints.projectById(projectId!), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      // Save MD file if content exists
      if (mdContent) {
        // Replace asset placeholders with actual URLs
        let processedContent = mdContent;
        assets.forEach(asset => {
          if (typeof asset !== 'string' && asset.name) {
            // Escape special regex characters in asset name
            const escapedName = asset.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Replace {{asset-name}} with just the URL
            const placeholder = new RegExp(`\\{\\{${escapedName}\\}\\}`, 'g');
            processedContent = processedContent.replace(placeholder, asset.url);
          }
        });

        const mdBlob = new Blob([processedContent], { type: 'text/markdown' });
        const mdFormData = new FormData();
        mdFormData.append('mdFile', mdBlob, `${projectId}.md`);

        await fetch(config.api.endpoints.projectMdFile(projectId!), {
          method: 'POST',
          body: mdFormData
        });
      }

      alert('Project updated successfully!');
      navigate('/projects');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    } finally {
      setUploading(false);
    }
  };

  const uploadAssets = async (files: FileList) => {
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('assets', file);
      });

      const response = await fetch(config.api.endpoints.projectAssets(projectId!), {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setAssets(data.project.assets);
      }
    } catch (error) {
      console.error('Error uploading assets:', error);
    } finally {
      setUploading(false);
    }
  };

  const uploadCardAssets = async (files: FileList) => {
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('cardassets', file);
      });

      const response = await fetch(config.api.endpoints.projectCardAssets(projectId!), {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setCardAssets(data.project.cardasset);
      }
    } catch (error) {
      console.error('Error uploading card assets:', error);
    } finally {
      setUploading(false);
    }
  };

  const deleteAsset = async (index: number) => {
    if (!confirm('Delete this asset?')) return;

    try {
      const response = await fetch(config.api.endpoints.projectAssetByIndex(projectId!, index), {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        setAssets(data.project.assets);
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const updateAssetName = async (index: number, newName: string) => {
    try {
      const response = await fetch(config.api.endpoints.projectAssetName(projectId!, index), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });

      if (response.ok) {
        const data = await response.json();
        setAssets(data.project.assets);
      }
    } catch (error) {
      console.error('Error updating asset name:', error);
    }
  };

  const deleteCardAsset = async (index: number) => {
    if (!confirm('Delete this card asset?')) return;

    try {
      const response = await fetch(config.api.endpoints.projectCardAssetByIndex(projectId!, index), {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        setCardAssets(data.project.cardasset);
      }
    } catch (error) {
      console.error('Error deleting card asset:', error);
    }
  };

  if (loading) {
    return <PageShimmer />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {uploading && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-accent text-accent-contrast text-center py-2 text-xs font-mono uppercase tracking-wider font-semibold shadow-md">
            Uploading... Please wait
          </div>
        )}

        {/* Header */}
        <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-semibold">Project Management</span>
              <h1 className="text-2xl md:text-3xl font-display text-ink leading-tight mt-0.5">
                Edit Project
              </h1>
              <p className="text-xs text-ink-muted mt-1 font-mono">
                Project ID: <span className="text-accent font-semibold">{projectId}</span>
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate('/projects')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-lg text-xs font-semibold text-ink hover:bg-cream-dark transition shadow-xs"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={uploading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-accent-contrast rounded-lg text-xs font-semibold hover:bg-accent-hover transition shadow-xs disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Section */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Tabs */}
            <div className="bg-card border border-border rounded-xl p-1.5 shadow-xs flex w-full gap-2">
              <button
                onClick={() => setActiveTab('metadata')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold tracking-wider transition ${
                  activeTab === 'metadata'
                    ? 'bg-accent text-accent-contrast shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface'
                }`}
              >
                METADATA
              </button>
              <button
                onClick={() => setActiveTab('markdown')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold tracking-wider transition ${
                  activeTab === 'markdown'
                    ? 'bg-accent text-accent-contrast shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface'
                }`}
              >
                MARKDOWN CONTENT
              </button>
            </div>

            {/* Metadata Tab */}
            {activeTab === 'metadata' && (
              <>
                {/* Basic Info Card */}
                <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-xs">
                  <h2 className="text-lg font-display font-semibold text-ink mb-4">
                    Basic Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5">Title *</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg text-sm text-ink font-medium focus:outline-none focus:border-accent shadow-xs"
                        placeholder="Enter project title"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5">Tagline</label>
                      <input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg text-sm text-ink font-medium focus:outline-none focus:border-accent shadow-xs"
                        placeholder="Short catchy tagline"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg text-sm text-ink font-medium focus:outline-none focus:border-accent shadow-xs resize-none"
                        placeholder="Project description"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5">Tech Stack</label>
                      <input
                        type="text"
                        value={techStack}
                        onChange={(e) => setTechStack(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg text-sm text-ink font-medium focus:outline-none focus:border-accent shadow-xs"
                        placeholder="React, Node.js, MongoDB (comma separated)"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5">Footer</label>
                      <input
                        type="text"
                        value={footer}
                        onChange={(e) => setFooter(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg text-sm text-ink font-medium focus:outline-none focus:border-accent shadow-xs"
                        placeholder="Footer text"
                      />
                    </div>

                    {/* Featured Toggle */}
                    <div className="pt-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={featured}
                          onChange={(e) => setFeatured(e.target.checked)}
                          className="w-4 h-4 rounded border-border text-accent focus:ring-accent cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-ink uppercase tracking-wider">
                          Show on Homepage (Featured)
                        </span>
                      </label>
                      <p className="text-[11px] text-ink-muted mt-1 ml-7">
                        Enable this to display the project on your portfolio homepage
                      </p>
                    </div>
                  </div>
                </div>

                {/* Links Card */}
                <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-display font-semibold text-ink">
                      Links
                    </h2>
                    <button
                      onClick={addLink}
                      className="flex items-center gap-2 px-3.5 py-2 bg-surface border border-border rounded-lg font-semibold text-ink hover:bg-cream-dark transition text-xs shadow-xs"
                    >
                      <LinkIcon className="w-3.5 h-3.5 text-accent" />
                      Add Link
                    </button>
                  </div>

                  <div className="space-y-3">
                    {links.map((link, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={link.name}
                            onChange={(e) => updateLink(index, 'name', e.target.value)}
                            className="px-3.5 py-2 bg-surface border border-border rounded-lg text-sm text-ink font-medium focus:outline-none focus:border-accent shadow-xs"
                            placeholder="Link name"
                          />
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateLink(index, 'url', e.target.value)}
                            className="px-3.5 py-2 bg-surface border border-border rounded-lg text-sm text-ink font-medium focus:outline-none focus:border-accent shadow-xs"
                            placeholder="URL"
                          />
                        </div>
                        {links.length > 1 && (
                          <button
                            onClick={() => removeLink(index)}
                            className="p-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition shadow-xs flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Markdown Tab */}
            {activeTab === 'markdown' && (
              <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-xs">
                <h2 className="text-lg font-display font-semibold text-ink mb-4">
                  Content Editor
                </h2>
                <div className="border border-border rounded-lg overflow-hidden shadow-xs">
                  <MDEditor
                    value={mdContent}
                    onChange={(val) => setMdContent(val || '')}
                    height={600}
                    preview="live"
                  />
                </div>
                <div className="mt-4 p-4 bg-surface border border-border rounded-lg">
                  <p className="text-xs font-mono uppercase text-accent font-semibold mb-1">How to use assets:</p>
                  <ol className="text-xs text-ink-muted space-y-1 ml-4 list-decimal">
                    <li>Upload assets in the right panel</li>
                    <li>Give each asset a unique name (e.g., "hero-image")</li>
                    <li>Use {`{{asset-name}}`} in markdown: {`![Alt]({{hero-image}})`}</li>
                    <li>Placeholders will be replaced with actual URLs when you save</li>
                  </ol>
                  {assets.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-[10px] font-mono uppercase text-ink-muted mb-2">Available Assets:</p>
                      <div className="flex flex-wrap gap-2">
                        {assets.map((asset, idx) => {
                          const assetName = typeof asset === 'string' ? '' : asset.name;
                          return assetName ? (
                            <code key={idx} className="px-2 py-1 bg-card border border-border rounded text-xs font-mono text-ink">
                              {`{{${assetName}}}`}
                            </code>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Section - Assets */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
            {/* Assets */}
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-xs flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4 gap-3">
                <h2 className="text-lg font-display font-semibold text-ink">
                  Assets
                </h2>
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-accent-contrast rounded-lg font-semibold hover:bg-accent-hover transition shadow-xs cursor-pointer text-xs">
                  <Upload className="w-3.5 h-3.5" />
                  Add
                  <input
                    type="file"
                    multiple
                    onChange={(e) => e.target.files && uploadAssets(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {assets.length === 0 ? (
                  <p className="text-center text-ink-muted py-8 text-xs font-mono">No assets uploaded</p>
                ) : (
                  assets.map((asset, index) => {
                    const assetUrl = typeof asset === 'string' ? asset : asset.url;
                    const assetName = typeof asset === 'string' ? '' : asset.name;
                    const assetFilename = typeof asset === 'string' ? '' : asset.filename;

                    return (
                      <div key={index} className="border border-border rounded-lg p-3 bg-surface space-y-2">
                        <img src={assetUrl} alt="Asset" className="w-full h-24 object-cover rounded border border-border" />
                        
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-ink-muted mb-1">Filename</label>
                          <input
                            type="text"
                            value={assetFilename}
                            readOnly
                            className="w-full px-2.5 py-1 bg-card border border-border rounded text-xs text-ink-muted font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-ink-muted mb-1">Asset Name *</label>
                          <input
                            type="text"
                            value={assetName}
                            onChange={(e) => updateAssetName(index, e.target.value)}
                            className="w-full px-2.5 py-1 bg-card border border-border rounded text-xs text-ink font-medium focus:outline-none focus:border-accent"
                            placeholder="e.g., hero-image"
                          />
                          <p className="text-[10px] text-accent font-mono mt-1">Use: {`{{${assetName || 'name'}}}`}</p>
                        </div>

                        <button
                          onClick={() => deleteAsset(index)}
                          className="w-full flex items-center justify-center gap-1 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 font-semibold text-xs transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Card Assets */}
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-xs flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4 gap-3">
                <h2 className="text-lg font-display font-semibold text-ink">
                  Card Assets
                </h2>
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-accent-contrast rounded-lg font-semibold hover:bg-accent-hover transition shadow-xs cursor-pointer text-xs">
                  <Upload className="w-3.5 h-3.5" />
                  Add
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && uploadCardAssets(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {cardAssets.length === 0 ? (
                  <p className="text-center text-ink-muted py-8 text-xs font-mono">No card assets uploaded</p>
                ) : (
                  cardAssets.map((url, index) => (
                    <div key={index} className="border border-border rounded-lg p-3 bg-surface">
                      <img src={url} alt="Card" className="w-full h-24 object-cover rounded border border-border mb-2" />
                      <button
                        onClick={() => deleteCardAsset(index)}
                        className="w-full py-1.5 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 font-semibold text-xs transition flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
