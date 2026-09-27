const fs = require('fs');
const path = require('path');

const notesPath = path.join(__dirname, 'src/pages/Notes.tsx');

const newNotesContent = `import { useState, useEffect, useRef } from 'react';
import { FolderPlus, Upload, Folder, File, Trash2, ExternalLink, ChevronRight, ChevronLeft, LayoutGrid, List, Search, HardDrive, Clock, CheckSquare } from 'lucide-react';
import TodoList from '../components/TodoList';
import config from '../config/config';

interface FolderType {
  _id: string;
  folderId: string;
  name: string;
  path: string;
  parentPath: string;
  createdAt: string;
}

interface FileType {
  _id: string;
  fileId: string;
  filename: string;
  folderPath: string;
  cloudinaryPath: string;
  cloudinaryUrl: string;
  fileType: string;
  size: number;
  uploadedAt: string;
}

export default function Notes() {
  const [activeTab, setActiveTab] = useState<'files' | 'todos'>('files');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [files, setFiles] = useState<FileType[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ 
    current: 0, total: 0, currentFile: '', currentFileProgress: 0, currentFileTotal: 0, totalBytesUploaded: 0, totalBytes: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFolders();
    fetchFiles();
  }, [currentPath]);

  const fetchFolders = async () => {
    try {
      const response = await fetch(config.api.endpoints.notesFolders(currentPath), { credentials: 'include' });
      const data = await response.json();
      setFolders(data.folders);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      if (!currentPath && activeTab !== 'files') {
        setFiles([]);
        return;
      }
      const response = await fetch(config.api.endpoints.notesFiles(currentPath), { credentials: 'include' });
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const navigateTo = (path: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(path);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPath(path);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentPath(history[historyIndex - 1]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentPath(history[historyIndex + 1]);
    }
  };

  const createFolder = async () => {
    if (!newFolderName) return;
    setLoading(true);
    try {
      const response = await fetch(config.api.endpoints.notesCreateFolder, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newFolderName, parentPath: currentPath })
      });
      if (response.ok) {
        setNewFolderName('');
        setShowCreateFolderModal(false);
        fetchFolders();
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFiles = async (fileList: FileList) => {
    if (!currentPath) {
      alert('Please select a folder first');
      return;
    }
    
    let totalBytes = 0;
    for (let i = 0; i < fileList.length; i++) totalBytes += fileList[i].size;
    
    setUploading(true);
    setUploadProgress({ current: 0, total: fileList.length, currentFile: '', currentFileProgress: 0, currentFileTotal: 0, totalBytesUploaded: 0, totalBytes });
    let totalBytesUploaded = 0;

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadProgress(prev => ({ ...prev, currentFile: file.name, currentFileProgress: 0, currentFileTotal: file.size, current: i }));
        await uploadSingleFile(file, (chunkProgress, chunkTotal) => {
          setUploadProgress(prev => {
            const fileProgressDiff = chunkProgress - prev.currentFileProgress;
            const newTotal = prev.totalBytesUploaded + fileProgressDiff;
            return { ...prev, currentFileProgress: Math.min(chunkProgress, file.size), totalBytesUploaded: Math.min(newTotal, totalBytes) };
          });
        });
        totalBytesUploaded += file.size;
        setUploadProgress(prev => ({ ...prev, current: i + 1, currentFileProgress: file.size, totalBytesUploaded }));
      }
      setTimeout(() => { setUploading(false); fetchFiles(); }, 1000);
    } catch (error) {
      setUploading(false);
      alert('Upload failed: ' + (error as Error).message);
    }
  };

  const uploadSingleFile = async (file: File, onProgress?: (uploaded: number, total: number) => void) => {
    const formData = new FormData();
    formData.append('folderPath', currentPath);
    formData.append('files', file);

    const response = await fetch(config.api.endpoints.notesUploadFiles, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Upload failed');
    if (onProgress) onProgress(file.size, file.size);
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Delete this file?')) return;
    try {
      const response = await fetch(config.api.endpoints.notesFileById(fileId), { method: 'DELETE', credentials: 'include' });
      if (response.ok) fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (!confirm('Delete this folder and all its contents?')) return;
    try {
      const response = await fetch(config.api.endpoints.notesFolderById(folderId), { method: 'DELETE', credentials: 'include' });
      if (response.ok) fetchFolders();
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const breadcrumbs = currentPath ? currentPath.split('/') : [];

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col bg-[#0a0a0a] text-white">
      {/* Top Toolbar - Finder Style */}
      <div className="flex-shrink-0 h-14 bg-[#0d0d0d] border-b border-white/[0.06] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button 
              onClick={goBack} 
              disabled={historyIndex <= 0}
              className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/[0.05] disabled:opacity-30 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={goForward} 
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/[0.05] disabled:opacity-30 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm font-medium">
            <h1 className="font-display font-semibold tracking-wide">
              {activeTab === 'todos' ? 'To-Do Lists' : currentPath ? currentPath.split('/').pop() : 'Root Directory'}
            </h1>
          </div>
        </div>

        {activeTab === 'files' && (
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-[#1a1a1a] border border-white/[0.06] rounded-md overflow-hidden">
              <button 
                onClick={() => setViewMode('grid')}
                className={\`p-1.5 \${viewMode === 'grid' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}\`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={\`p-1.5 \${viewMode === 'list' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}\`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <div className="h-4 w-px bg-white/20 mx-1"></div>

            <button
              onClick={() => setShowCreateFolderModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-white/20 hover:border-white/50 text-xs font-semibold uppercase tracking-wider transition rounded-md"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Folder</span>
            </button>
            
            {currentPath && (
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-white/90 text-xs font-semibold uppercase tracking-wider transition cursor-pointer rounded-md">
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Upload</span>
                <input type="file" multiple onChange={(e) => e.target.files && uploadFiles(e.target.files)} className="hidden" />
              </label>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Finder Sidebar */}
        <div className="w-48 sm:w-56 bg-[#0a0a0a] border-r border-white/[0.06] flex-shrink-0 py-4 px-2 hidden sm:block">
          <div className="mb-6">
            <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-2 px-3">Locations</div>
            <button
              onClick={() => { setActiveTab('files'); navigateTo(''); }}
              className={\`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition \${activeTab === 'files' && !currentPath ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'}\`}
            >
              <HardDrive className="w-4 h-4 text-white/60" />
              Root Directory
            </button>
            <button
              onClick={() => setActiveTab('todos')}
              className={\`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition \${activeTab === 'todos' ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'}\`}
            >
              <CheckSquare className="w-4 h-4 text-white/60" />
              To-Do Lists
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-[#0d0d0d] p-6">
          {uploading && (
            <div className="bg-[#1a1a1a] border border-white/[0.06] p-4 mb-6">
              <div className="flex items-center justify-between text-xs font-mono text-white/60 mb-2">
                <span>Uploading {uploadProgress.currentFile}</span>
                <span>{Math.round((uploadProgress.totalBytesUploaded / Math.max(uploadProgress.totalBytes, 1)) * 100)}%</span>
              </div>
              <div className="h-1 bg-white/10 w-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: \`\${(uploadProgress.totalBytesUploaded / Math.max(uploadProgress.totalBytes, 1)) * 100}%\` }}
                />
              </div>
            </div>
          )}

          {activeTab === 'todos' ? (
            <TodoList />
          ) : (
            <div className="space-y-6">
              {/* Breadcrumbs for content area */}
              {currentPath && (
                <div className="flex items-center gap-1 text-[11px] font-mono text-white/50 mb-4">
                  <button onClick={() => navigateTo('')} className="hover:text-white transition">Root</button>
                  {breadcrumbs.map((part, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <ChevronRight className="w-3 h-3" />
                      <button 
                        onClick={() => navigateTo(breadcrumbs.slice(0, idx + 1).join('/'))}
                        className="hover:text-white transition"
                      >
                        {part}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {folders.length === 0 && files.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/30">
                  <Folder className="w-16 h-16 mb-4" strokeWidth={1} />
                  <p className="text-sm font-medium">This folder is empty</p>
                </div>
              ) : viewMode === 'grid' ? (
                // GRID VIEW
                <div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
                    {/* Folders */}
                    {folders.map(folder => (
                      <div 
                        key={folder._id} 
                        className="group flex flex-col items-center text-center cursor-pointer p-2 hover:bg-white/[0.05] rounded-lg transition"
                        onClick={() => navigateTo(folder.path)}
                      >
                        <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                          <Folder className="w-14 h-14 text-[#60a5fa] fill-[#60a5fa]/20" strokeWidth={1.5} />
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteFolder(folder.folderId); }}
                            className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-medium text-white/90 break-words w-full line-clamp-2">{folder.name}</span>
                      </div>
                    ))}
                    
                    {/* Files */}
                    {files.map(file => (
                      <div 
                        key={file._id} 
                        className="group flex flex-col items-center text-center cursor-pointer p-2 hover:bg-white/[0.05] rounded-lg transition relative"
                        onClick={() => window.open(file.cloudinaryUrl, '_blank')}
                      >
                        <div className="relative w-16 h-16 flex items-center justify-center mb-2 bg-white/5 border border-white/10 shadow-sm rounded-sm">
                          {file.fileType.startsWith('image/') ? (
                            <img src={file.cloudinaryUrl} alt={file.filename} className="w-full h-full object-cover rounded-sm" />
                          ) : (
                            <File className="w-8 h-8 text-white/60" strokeWidth={1.5} />
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteFile(file.fileId); }}
                            className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg z-10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-medium text-white/90 break-words w-full line-clamp-2">{file.filename}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // LIST VIEW
                <div className="w-full text-left">
                  <div className="grid grid-cols-12 gap-4 pb-2 border-b border-white/[0.06] text-[10px] uppercase tracking-widest text-white/40 font-semibold px-2">
                    <div className="col-span-6 sm:col-span-7">Name</div>
                    <div className="col-span-3 sm:col-span-2 text-right">Size</div>
                    <div className="col-span-3 text-right">Action</div>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    {/* Folders List */}
                    {folders.map(folder => (
                      <div 
                        key={folder._id}
                        className="grid grid-cols-12 gap-4 items-center p-2 hover:bg-white/[0.05] rounded-md cursor-pointer transition group"
                        onClick={() => navigateTo(folder.path)}
                      >
                        <div className="col-span-6 sm:col-span-7 flex items-center gap-3">
                          <Folder className="w-5 h-5 text-[#60a5fa] fill-[#60a5fa]/20" />
                          <span className="text-sm text-white/90 truncate">{folder.name}</span>
                        </div>
                        <div className="col-span-3 sm:col-span-2 text-right text-xs text-white/40">--</div>
                        <div className="col-span-3 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteFolder(folder.folderId); }}
                            className="p-1.5 text-white/40 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Files List */}
                    {files.map(file => (
                      <div 
                        key={file._id}
                        className="grid grid-cols-12 gap-4 items-center p-2 hover:bg-white/[0.05] rounded-md cursor-pointer transition group"
                        onClick={() => window.open(file.cloudinaryUrl, '_blank')}
                      >
                        <div className="col-span-6 sm:col-span-7 flex items-center gap-3">
                          <File className="w-5 h-5 text-white/60" />
                          <span className="text-sm text-white/90 truncate">{file.filename}</span>
                        </div>
                        <div className="col-span-3 sm:col-span-2 text-right text-xs text-white/40 font-mono">
                          {formatFileSize(file.size)}
                        </div>
                        <div className="col-span-3 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteFile(file.fileId); }}
                            className="p-1.5 text-white/40 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3 backdrop-blur-sm">
          <div className="bg-[#0d0d0d] border border-white/[0.1] p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-medium tracking-tight mb-4">New Folder</h3>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/[0.1] text-white text-[13px] focus:outline-none focus:border-white/[0.3] transition-colors"
                  placeholder="untitled folder"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button
                  onClick={() => setShowCreateFolderModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-white/60 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createFolder}
                  disabled={loading || !newFolderName}
                  className="px-4 py-2 bg-white text-black font-semibold text-xs hover:bg-white/90 transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(notesPath, newNotesContent);
console.log('Fixed Notes.tsx macOS Finder theme!');
