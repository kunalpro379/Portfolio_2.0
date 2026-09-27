import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileText, Clock, Folder } from 'lucide-react';
import config from '../config/config';
// Using professional code editor with Prism.js
import ProfessionalCodeEditor from '../components/ProfessionalCodeEditor';

interface CodeFile {
  _id: string;
  fileId: string;
  filename: string;
  folderPath: string;
  content: string;
  language: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export default function CodeEditor() {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<CodeFile | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (fileId) {
      fetchFile();
    }
  }, [fileId]);

  useEffect(() => {
    // Auto-save every 30 seconds if there are unsaved changes
    const interval = setInterval(() => {
      if (hasUnsavedChanges && !saving) {
        saveFile();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [hasUnsavedChanges, saving]);

  const fetchFile = async () => {
    try {
      setLoading(true);
      console.log('Fetching file metadata for fileId:', fileId);
      
      // Get file metadata
      const fileResponse = await fetch(config.api.endpoints.codeFileById(fileId!), {
        credentials: 'include'
      });
      
      if (!fileResponse.ok) throw new Error('File not found');
      
      const fileData = await fileResponse.json();
      console.log('File metadata received:', fileData);
      
      // Get file content
      console.log('Fetching file content...');
      const contentResponse = await fetch(config.api.endpoints.codeFileContent(fileId!), {
        credentials: 'include'
      });
      
      if (!contentResponse.ok) throw new Error('Failed to fetch file content');
      
      const contentData = await contentResponse.json();
      console.log('File content received:', contentData);
      
      setFile(fileData.file);
      setContent(contentData.content || '');
      setHasUnsavedChanges(false);
      console.log('File loaded successfully');
    } catch (error) {
      console.error('Error fetching file:', error);
      alert('Failed to load file');
      navigate('/code');
    } finally {
      setLoading(false);
    }
  };

  const saveFile = async () => {
    if (!file || saving) return;

    try {
      setSaving(true);
      
      const response = await fetch(config.api.endpoints.codeFileById(file.fileId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content })
      });

      if (!response.ok) throw new Error('Failed to save file');
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Failed to save file');
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl+S or Cmd+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveFile();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getLanguageColor = (language: string): string => {
    const colorMap: { [key: string]: string } = {
      'javascript': 'bg-[#F7DF1E] text-black border-[#F7DF1E]',
      'typescript': 'bg-[#3178C6] text-white border-[#3178C6]',
      'python': 'bg-[#3776AB] text-white border-[#3776AB]',
      'java': 'bg-[#ED8B00] text-white border-[#ED8B00]',
      'cpp': 'bg-[#00599C] text-white border-[#00599C]',
      'c': 'bg-[#A8B9CC] text-black border-[#A8B9CC]',
      'html': 'bg-[#E34F26] text-white border-[#E34F26]',
      'css': 'bg-[#1572B6] text-white border-[#1572B6]',
      'json': 'bg-[#000000] text-white border-[#000000]',
      'markdown': 'bg-[#083FA1] text-white border-[#083FA1]',
      'php': 'bg-[#777BB4] text-white border-[#777BB4]',
      'ruby': 'bg-[#CC342D] text-white border-[#CC342D]',
      'go': 'bg-[#00ADD8] text-white border-[#00ADD8]',
      'rust': 'bg-[#000000] text-white border-[#000000]'
    };
    return colorMap[language] || 'bg-[#6C6C6C] text-white border-[#6C6C6C]';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <img src="/loading.gif" alt="Loading" className="w-10 h-10 object-contain mx-auto opacity-80" />
          <p className="text-ink font-display text-sm">Loading code editor...</p>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-ink text-xl font-display">File not found</p>
          <button
            onClick={() => navigate('/code')}
            className="px-4 py-2 bg-accent text-accent-contrast rounded-xl text-xs font-semibold hover:bg-accent-hover transition shadow-sm"
          >
            Back to Code Workspace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-card border-b border-border px-5 py-3.5 flex items-center justify-between flex-shrink-0 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/code')}
            className="flex items-center gap-2 text-ink-muted hover:text-ink transition-colors px-3 py-1.5 rounded-xl border border-border bg-surface text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-accent" />
            <div>
              <h1 className="text-ink font-display text-base leading-tight">{file.filename}</h1>
              <div className="flex items-center gap-3 text-xs text-ink-muted mt-0.5">
                <div className="flex items-center gap-1 font-mono">
                  <Folder className="w-3 h-3 text-accent" />
                  <span>{file.folderPath}</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider bg-surface border border-border text-ink rounded-md">
                  {file.language}
                </span>
                <span className="font-mono">{formatFileSize(file.size)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-lg text-xs font-medium">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
              <span>Unsaved changes</span>
            </div>
          )}
          
          {lastSaved && (
            <div className="flex items-center gap-1.5 text-ink-muted text-xs font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}

          <div className="hidden md:flex items-center gap-3 text-ink-muted text-xs font-mono border-l border-border pl-4">
            <span>Ln {content.split('\n').length}, Col 1</span>
            <span>UTF-8</span>
            <span>{content.split('\n').length} lines</span>
          </div>

          <button
            onClick={saveFile}
            disabled={saving || !hasUnsavedChanges}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-contrast rounded-xl hover:bg-accent-hover transition disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save File'}</span>
          </button>
        </div>
      </div>

      {/* Editor - Takes remaining screen height */}
      <div className="flex-1 min-h-0 bg-[#1E1E1E]">
        <ProfessionalCodeEditor
          value={content}
          onChange={handleContentChange}
          language={file.language}
          filename={file.filename}
        />
      </div>
    </div>
  );
}