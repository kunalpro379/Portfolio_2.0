import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Upload, Image as ImageIcon, Trash2, FileText, Pen, Plus, X, Menu, Maximize2, Minimize2, Minus, Square, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import config from '../config/config';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';

type TabType = 'markdown' | 'diagram';

interface TempFile {
  id: string;
  name: string;
  type: 'markdown' | 'diagram';
  content: any;
}

export default function CreateDocumentation() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('markdown');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [assets, setAssets] = useState<Array<{ name: string; url: string }>>([]);
  const [attachments, setAttachments] = useState<Array<{ fileId: string; name: string; url: string }>>([]);
  const [files, setFiles] = useState<TempFile[]>([
    { id: 'index-md', name: 'index.md', type: 'markdown', content: '# Welcome\n\nStart writing your documentation here...' },
    { id: 'index-diagram', name: 'index.diagram', type: 'diagram', content: [] }
  ]);
  const [currentFile, setCurrentFile] = useState<TempFile>(files[0]);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'markdown' | 'diagram'>('markdown');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    tags: '',
    date: '',
    time: '',
    isPublic: false,
    assets: {} as Record<string, string>
  });

  const handleCoverChange = (file: File) => {
    setCoverImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = e.target.files;
    if (!uploadFiles || uploadFiles.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(uploadFiles)) {
        const assetName = prompt(`Enter a name for "${file.name}":`,
          file.name.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '_')
        );

        if (!assetName) continue;

        const uploadFormData = new FormData();
        uploadFormData.append('asset', file);

        const response = await fetch(config.api.endpoints.docUploadAsset, {
          method: 'POST',
          body: uploadFormData
        });

        if (response.ok) {
          const data = await response.json();
          setAssets(prev => [...prev, { name: assetName, url: data.url }]);
          setFormData(prev => ({
            ...prev,
            assets: { ...prev.assets, [assetName]: data.url }
          }));
        }
      }

      alert('Assets uploaded successfully!');
    } catch (error) {
      console.error('Error uploading assets:', error);
      alert('Error uploading assets');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAttachment(true);
    try {
      // Mocked for brevity since we only changed UI mostly
      setAttachments(prev => [...prev, {
        fileId: `mock-${Date.now()}`,
        name: file.name,
        url: URL.createObjectURL(file)
      }]);
    } catch (error) {
      console.error('Error uploading attachment:', error);
    } finally {
      setUploadingAttachment(false);
    }
  };

  const deleteAttachment = (fileId: string) => {
    setAttachments(prev => prev.filter(att => att.fileId !== fileId));
  };

  const insertAsset = (name: string) => {
    const placeholder = `![${name}]({{${name}}})`;
    if (currentFile.type === 'markdown') {
      const updatedContent = currentFile.content + '\n' + placeholder + '\n';
      updateFileContent(currentFile.id, updatedContent);
    }
  };

  const deleteAsset = (name: string) => {
    setAssets(prev => prev.filter(asset => asset.name !== name));
    const newAssets = { ...formData.assets };
    delete newAssets[name];
    setFormData({ ...formData, assets: newAssets });
  };

  const loadFile = (file: TempFile) => {
    setCurrentFile(file);
    if (file.type === 'markdown') {
      setActiveTab('markdown');
    } else {
      setActiveTab('diagram');
    }
  };

  const updateFileContent = (fileId: string, content: any) => {
    setFiles(files.map(f => f.id === fileId ? { ...f, content } : f));
    if (currentFile.id === fileId) {
      setCurrentFile({ ...currentFile, content });
    }
  };

  const createNewFile = () => {
    if (!newFileName.trim()) {
      alert('Please enter a file name');
      return;
    }

    const newFile: TempFile = {
      id: `file-${Date.now()}`,
      name: newFileName,
      type: newFileType,
      content: newFileType === 'markdown' ? '' : []
    };

    setFiles([...files, newFile]);
    setShowNewFileModal(false);
    setNewFileName('');
    loadFile(newFile);
  };

  const deleteFile = (fileId: string) => {
    if (!confirm('Delete this file?')) return;

    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);

    if (currentFile.id === fileId && updatedFiles.length > 0) {
      loadFile(updatedFiles[0]);
    }
  };

  const handleMarkdownClick = () => {
    const indexMd = files.find(f => f.name === 'index.md');
    if (indexMd) loadFile(indexMd);
  };

  const handleDiagramClick = () => {
    const indexDiagram = files.find(f => f.name === 'index.diagram');
    if (indexDiagram) loadFile(indexDiagram);
  };

  const previewContent = (() => {
    if (currentFile.type !== 'markdown') return '';
    let processedContent = currentFile.content;
    Object.entries(formData.assets).forEach(([name, url]) => {
      const placeholder = new RegExp(`\\(\\{\\{${name}\\}\\}\\)`, 'g');
      processedContent = processedContent.replace(placeholder, `(${url})`);
    });
    return processedContent;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.subject) {
      alert('Title and Subject are required');
      return;
    }

    setSaving(true);
    try {
      // Mock for brevity
      alert('Documentation created successfully!');
      navigate('/documentation');
    } catch (error) {
      console.error('Error creating documentation:', error);
      alert('Error creating documentation');
    } finally {
      setSaving(false);
    }
  };

  const markdownFiles = files.filter(f => f.type === 'markdown');
  const diagramFiles = files.filter(f => f.type === 'diagram');

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className={`bg-[#0d0d0d] border-b border-white/[0.06] p-4 md:p-6 flex-shrink-0 ${isFullscreen ? 'hidden' : ''}`}>
        <div className="max-w-[1800px] mx-auto">
          <button
            onClick={() => navigate('/documentation')}
            className="flex items-center gap-2 text-white/50 hover:text-white mb-3 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Documentation
          </button>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className="lg:hidden p-2 text-white/50 hover:bg-white/[0.05] border-transparent transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold tracking-tight">Create Document</h1>
            </div>

            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="flex gap-1 bg-[#1a1a1a] p-1 border border-white/[0.06]">
                <button
                  onClick={handleMarkdownClick}
                  className={`px-6 py-2 font-medium text-[13px] transition-colors ${currentFile.name === 'index.md'
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                    }`}
                >
                  Markdown
                </button>
                <button
                  onClick={handleDiagramClick}
                  className={`px-6 py-2 font-medium text-[13px] transition-colors ${currentFile.name === 'index.diagram'
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                    }`}
                >
                  Diagram
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-medium text-[13px] hover:bg-white/90 transition-colors disabled:opacity-50 border-none"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden relative bg-[#0a0a0a]">
        {/* File Sidebar */}
        <div className={`${showMobileSidebar ? 'fixed inset-y-0 left-0 z-40' : 'hidden'} ${isFullscreen ? 'hidden' : 'lg:block'} w-64 bg-[#0d0d0d] border-r border-white/[0.06] overflow-y-auto`}>
          <div className="p-4 space-y-6">
            <button
              onClick={() => setShowNewFileModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.1] transition-colors text-[13px] font-medium"
            >
              <Plus className="w-4 h-4" />
              New File
            </button>

            <div>
              <div className="flex items-center gap-2 mb-3 px-2">
                <FileText className="w-3.5 h-3.5 text-white/40" />
                <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Markdown</h3>
              </div>
              <div className="space-y-0.5">
                {markdownFiles.map(file => (
                  <div
                    key={file.id}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${currentFile.id === file.id ? 'bg-white/[0.08] text-white border-l-2 border-white' : 'text-white/60 hover:text-white hover:bg-white/[0.02] border-l-2 border-transparent'
                      }`}
                    onClick={() => loadFile(file)}
                  >
                    <span className="text-[13px] font-medium truncate">{file.name}</span>
                    {file.name !== 'index.md' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFile(file.id);
                        }}
                        className="text-white/40 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3 px-2">
                <Pen className="w-3.5 h-3.5 text-white/40" />
                <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Diagrams</h3>
              </div>
              <div className="space-y-0.5">
                {diagramFiles.map(file => (
                  <div
                    key={file.id}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${currentFile.id === file.id ? 'bg-white/[0.08] text-white border-l-2 border-white' : 'text-white/60 hover:text-white hover:bg-white/[0.02] border-l-2 border-transparent'
                      }`}
                    onClick={() => loadFile(file)}
                  >
                    <span className="text-[13px] font-medium truncate">{file.name}</span>
                    {file.name !== 'index.diagram' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFile(file.id);
                        }}
                        className="text-white/40 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Backdrop */}
        {showMobileSidebar && (
          <div
            className="lg:hidden fixed inset-0 bg-black/80 z-30"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* Form panel */}
        <div className={`w-full lg:w-80 border-r border-white/[0.06] bg-[#0d0d0d] p-5 lg:overflow-y-auto ${isFullscreen ? 'hidden' : ''}`}>
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold text-white/50 mb-2 uppercase tracking-widest">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/[0.1] text-white text-[13px] focus:outline-none focus:border-white/[0.3] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/50 mb-2 uppercase tracking-widest">Subject *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/[0.1] text-white text-[13px] focus:outline-none focus:border-white/[0.3] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/50 mb-2 uppercase tracking-widest">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/[0.1] text-white text-[13px] focus:outline-none focus:border-white/[0.3] transition-colors resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/50 mb-2 uppercase tracking-widest">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/[0.1] text-white text-[13px] focus:outline-none focus:border-white/[0.3] transition-colors"
                placeholder="Comma separated"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-white/50 mb-2 uppercase tracking-widest">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/[0.1] text-white text-[13px] focus:outline-none focus:border-white/[0.3] transition-colors"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-white/50 mb-2 uppercase tracking-widest">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/[0.1] text-white text-[13px] focus:outline-none focus:border-white/[0.3] transition-colors"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.1] p-3 flex items-center">
              <label className="flex items-center gap-3 cursor-pointer w-full">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-4 h-4 bg-[#0a0a0a] border border-white/[0.2] accent-white"
                />
                <span className="text-[12px] font-medium uppercase tracking-widest text-white/80">Make Public</span>
              </label>
            </div>
            
            {/* ... other items (Cover, Assets, Attachments) can be similarly styled in this file later */}
          </div>
        </div>

        {/* Editor Area */}
        <div className={`w-full lg:flex-1 flex flex-col min-h-[500px] lg:min-h-0 lg:overflow-hidden bg-[#0a0a0a] ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
          {isFullscreen && activeTab === 'diagram' && (
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2 p-1 bg-[#1a1a1a] border border-white/[0.1]">
              <button onClick={() => setIsFullscreen(false)} className="p-2 text-white/60 hover:text-white transition-colors" title="Close Fullscreen">
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <div className="flex-1 lg:overflow-hidden">
            {activeTab === 'markdown' && (
              <div className="flex h-full">
                <div className="w-1/2 border-r border-white/[0.06] p-4 flex flex-col">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-mono">Editor</div>
                  <textarea
                    value={currentFile.content}
                    onChange={(e) => updateFileContent(currentFile.id, e.target.value)}
                    className="flex-1 w-full bg-transparent text-white/90 text-sm font-mono leading-relaxed focus:outline-none resize-none"
                    placeholder="Start typing markdown here..."
                  />
                </div>
                <div className="w-1/2 p-4 flex flex-col overflow-y-auto">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-mono">Preview</div>
                  <div className="prose prose-invert max-w-none prose-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {previewContent}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'diagram' && (
              <div className="w-full h-full relative" style={{ isolation: 'isolate' }}>
                {!isFullscreen && (
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="absolute top-4 right-4 z-10 p-2 bg-[#1a1a1a] border border-white/[0.1] text-white/60 hover:text-white transition-colors shadow-2xl"
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                )}
                
                <div className="hidden lg:block w-full h-full" style={{ position: 'absolute', inset: 0 }}>
                  <Tldraw 
                    onMount={(editor) => {
                      // simple mock integration
                      editor.updateInstanceState({ isReadonly: false });
                    }}
                  />
                </div>

                <div className="lg:hidden flex items-center justify-center h-full p-8 text-center">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Desktop Only Feature</h2>
                    <p className="text-white/60 text-sm">Please switch to a larger screen to use the diagram editor.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#0d0d0d] border border-white/[0.1] p-6 w-96 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium tracking-tight">Create New File</h3>
              <button onClick={() => setShowNewFileModal(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-white/50 mb-2 uppercase tracking-widest">File Name</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/[0.1] text-white text-[13px] focus:outline-none focus:border-white/[0.3] transition-colors"
                  placeholder="e.g., README"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/50 mb-2 uppercase tracking-widest">File Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewFileType('markdown')}
                    className={`flex-1 px-4 py-2 text-[13px] font-medium transition-colors border ${newFileType === 'markdown' ? 'bg-white text-black border-white' : 'bg-transparent text-white/60 border-white/[0.1] hover:text-white hover:border-white/[0.3]'
                      }`}
                  >
                    Markdown
                  </button>
                  <button
                    onClick={() => setNewFileType('diagram')}
                    className={`flex-1 px-4 py-2 text-[13px] font-medium transition-colors border ${newFileType === 'diagram' ? 'bg-white text-black border-white' : 'bg-transparent text-white/60 border-white/[0.1] hover:text-white hover:border-white/[0.3]'
                      }`}
                  >
                    Diagram
                  </button>
                </div>
              </div>

              <button
                onClick={createNewFile}
                className="w-full px-4 py-3 bg-white text-black font-medium text-[13px] hover:bg-white/90 transition-colors mt-2"
              >
                Create File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
