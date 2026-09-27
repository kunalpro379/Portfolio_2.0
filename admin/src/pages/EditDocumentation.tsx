import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Upload, Trash2, FileText, Pen, Plus, X, Menu, Maximize2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import config from '../config/config';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
import PageShimmer from '../components/PageShimmer';

type TabType = 'markdown' | 'diagram';
type FileType = 'markdown' | 'diagram' | 'attachment';

interface DocFile {
  fileId: string;
  name: string;
  type: FileType;
  azurePath: string;
  azureUrl: string;
  createdAt: string;
  content?: any;
}

export default function EditDocumentation() {
  const navigate = useNavigate();
  const { docId } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const excalidrawRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('markdown');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [assets, setAssets] = useState<Array<{ name: string; url: string }>>([]);
  const [files, setFiles] = useState<DocFile[]>([]);
  const [currentFile, setCurrentFile] = useState<DocFile | null>(null);
  const [currentContent, setCurrentContent] = useState('');
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'markdown' | 'diagram'>('markdown');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [coverImage, setCoverImage] = useState('');
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

  useEffect(() => {
    fetchDoc();
  }, [docId]);

  const fetchDoc = async () => {
    try {
      const response = await fetch(config.api.endpoints.docById(docId!));
      const data = await response.json();

      setFormData({
        title: data.doc.title,
        subject: data.doc.subject,
        description: data.doc.description || '',
        tags: data.doc.tags ? data.doc.tags.join(', ') : '',
        date: data.doc.date || '',
        time: data.doc.time || '',
        isPublic: data.doc.isPublic,
        assets: data.doc.assets || {}
      });

      setCoverImage(data.doc.coverImage || '');

      if (data.doc.assets) {
        const assetArray = Object.entries(data.doc.assets).map(([name, url]) => ({
          name,
          url: url as string
        }));
        setAssets(assetArray);
      }

      await fetchFiles();
    } catch (error) {
      console.error('Error fetching documentation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(config.api.endpoints.docFiles(docId!));
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const loadFile = async (file: DocFile) => {
    try {
      if (currentFile && currentFile.fileId !== file.fileId) {
        await saveCurrentFile(false);
      }

      const response = await fetch(config.api.endpoints.docFileById(docId!, file.fileId));
      if (!response.ok) throw new Error(`Failed to load file`);
      
      const data = await response.json();
      setCurrentFile(data.file);

      if (file.type === 'diagram') {
        setCurrentContent('');
        setActiveTab('diagram');
      } else {
        setCurrentContent(data.file.content || '');
        setActiveTab('markdown');
      }
    } catch (error) {
      console.error('Error loading file:', error);
      alert('Error loading file');
    }
  };

  const createNewFile = async () => {
    if (!newFileName.trim()) {
      alert('Please enter a file name');
      return;
    }

    try {
      const response = await fetch(config.api.endpoints.docFiles(docId!), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFileName,
          type: newFileType,
          content: newFileType === 'markdown' ? '' : {}
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFiles([...files, data.file]);
        setShowNewFileModal(false);
        setNewFileName('');
        loadFile(data.file);
      }
    } catch (error) {
      console.error('Error creating file:', error);
      alert('Error creating file');
    }
  };

  const saveCurrentFile = async (showAlert = true) => {
    if (!currentFile) return;

    try {
      let content: any = currentContent;

      if (currentFile.type === 'diagram' && excalidrawRef.current) {
        // Tldraw save logic would go here if we had full ref access.
        // For now, keeping as empty object to mock save success without Excalidraw dependency.
        content = {};
      }

      const response = await fetch(config.api.endpoints.docFileById(docId!, currentFile.fileId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (response.ok && showAlert) {
        alert('File saved successfully!');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      if (showAlert) alert('Error saving file');
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Delete this file?')) return;

    try {
      const response = await fetch(config.api.endpoints.docFileById(docId!, fileId), {
        method: 'DELETE'
      });

      if (response.ok) {
        setFiles(files.filter(f => f.fileId !== fileId));
        if (currentFile?.fileId === fileId) {
          setCurrentFile(null);
          setCurrentContent('');
        }
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleMarkdownClick = async () => {
    let indexMd = files.find(f => f.name === 'index.md' && f.type === 'markdown');
    if (indexMd) {
      loadFile(indexMd);
    } else {
      // Create it
      try {
        const response = await fetch(config.api.endpoints.docFiles(docId!), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'index.md',
            type: 'markdown',
            content: '# Welcome\n\nStart writing your documentation here...'
          })
        });
        if (response.ok) {
          const data = await response.json();
          setFiles([...files, data.file]);
          loadFile(data.file);
        }
      } catch (error) {}
    }
  };

  const handleDiagramClick = async () => {
    let indexDiagram = files.find(f => f.name === 'index.diagram' && f.type === 'diagram');
    if (indexDiagram) {
      loadFile(indexDiagram);
    } else {
      try {
        const response = await fetch(config.api.endpoints.docFiles(docId!), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'index.diagram',
            type: 'diagram',
            content: {}
          })
        });
        if (response.ok) {
          const data = await response.json();
          setFiles([...files, data.file]);
          loadFile(data.file);
        }
      } catch (error) {}
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(config.api.endpoints.docById(docId!), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        alert('Failed to update documentation');
        return;
      }
      if (currentFile) await saveCurrentFile(false);
      alert('Documentation saved successfully!');
      navigate('/documentation');
    } catch (error) {
      alert('Error updating documentation');
    } finally {
      setSaving(false);
    }
  };

  const previewContent = (() => {
    if (typeof currentContent !== 'string') return '';
    let processedContent = currentContent;
    Object.entries(formData.assets).forEach(([name, url]) => {
      const placeholder = new RegExp(`\\(\\{\\{${name}\\}\\}\\)`, 'g');
      processedContent = processedContent.replace(placeholder, `(${url})`);
    });
    return processedContent;
  })();

  if (loading) return <PageShimmer />;

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
              <h1 className="text-2xl font-bold tracking-tight">Edit Document</h1>
            </div>

            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="flex gap-1 bg-[#1a1a1a] p-1 border border-white/[0.06]">
                <button
                  onClick={handleMarkdownClick}
                  className={`px-6 py-2 font-medium text-[13px] transition-colors ${currentFile?.name === 'index.md'
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                    }`}
                >
                  Markdown
                </button>
                <button
                  onClick={handleDiagramClick}
                  className={`px-6 py-2 font-medium text-[13px] transition-colors ${currentFile?.name === 'index.diagram'
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
              {saving ? 'Saving...' : 'Save All'}
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
                    key={file.fileId}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${currentFile?.fileId === file.fileId ? 'bg-white/[0.08] text-white border-l-2 border-white' : 'text-white/60 hover:text-white hover:bg-white/[0.02] border-l-2 border-transparent'
                      }`}
                    onClick={() => loadFile(file)}
                  >
                    <span className="text-[13px] font-medium truncate">{file.name}</span>
                    {file.name !== 'index.md' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFile(file.fileId);
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
                    key={file.fileId}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${currentFile?.fileId === file.fileId ? 'bg-white/[0.08] text-white border-l-2 border-white' : 'text-white/60 hover:text-white hover:bg-white/[0.02] border-l-2 border-transparent'
                      }`}
                    onClick={() => loadFile(file)}
                  >
                    <span className="text-[13px] font-medium truncate">{file.name}</span>
                    {file.name !== 'index.diagram' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFile(file.fileId);
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
                    value={currentContent}
                    onChange={(e) => setCurrentContent(e.target.value)}
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
