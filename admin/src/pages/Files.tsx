import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Folder, File, ChevronRight, FileText, Image as ImageIcon, FileCode, Download, Loader } from 'lucide-react';
import config from '../config/config';

interface FolderType {
  _id: string;
  folderId: string;
  name: string;
  path: string;
  parentPath: string;
  createdAt: string;
  fileCount?: number;
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

export default function Files() {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [files, setFiles] = useState<FileType[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const [currentFolder, setCurrentFolder] = useState<FolderType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (folderId) {
      fetchFolderDetails();
    } else {
      fetchRootFolders();
    }
  }, [folderId]);

  const fetchRootFolders = async () => {
    setLoading(true);
    try {
      const response = await fetch(config.api.endpoints.notesFolders(''), {
        credentials: 'include'
      });
      const data = await response.json();
      console.log('Root folders from API:', data);
      setFolders(data.folders || []);
      setFiles([]);
      setCurrentFolder(null);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error fetching folders:', error);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolderDetails = async () => {
    if (!folderId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${config.api.baseUrl}/api/notes/folders/${folderId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      console.log('Folder details from API:', data);
      
      setCurrentFolder(data.folder);
      setFolders(data.folder.subfolders || []);
      setFiles(data.folder.files || []);
      
      if (data.folder.files && data.folder.files.length > 0) {
        setSelectedFile(data.folder.files[0]);
      } else {
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error fetching folder details:', error);
      setFolders([]);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
      return <ImageIcon className="w-5 h-5" strokeWidth={2} />;
    }
    if (['pdf'].includes(ext || '')) {
      return <FileText className="w-5 h-5" strokeWidth={2} />;
    }
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'java', 'cpp'].includes(ext || '')) {
      return <FileCode className="w-5 h-5" strokeWidth={2} />;
    }
    return <File className="w-5 h-5" strokeWidth={2} />;
  };

  const renderFilePreview = (file: FileType) => {
    const ext = file.filename.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 p-8">
          <img 
            src={file.cloudinaryUrl} 
            alt={file.filename}
            className="max-w-full max-h-full object-contain shadow-premium-lg"
          />
        </div>
      );
    }
    
    if (ext === 'pdf') {
      return (
        <iframe
          src={file.cloudinaryUrl}
          className="w-full h-full border-0"
          title={file.filename}
        />
      );
    }
    
    if (['txt', 'md', 'json', 'xml', 'csv'].includes(ext || '')) {
      return (
        <div className="w-full h-full overflow-auto p-8 bg-white">
          <pre className="text-sm text-premium-brown-900 font-mono whitespace-pre-wrap">
            Loading content...
          </pre>
        </div>
      );
    }
    
    if (['ppt', 'pptx'].includes(ext || '')) {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.cloudinaryUrl)}`}
          className="w-full h-full border-0"
          title={file.filename}
        />
      );
    }
    
    if (['doc', 'docx'].includes(ext || '')) {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.cloudinaryUrl)}`}
          className="w-full h-full border-0"
          title={file.filename}
        />
      );
    }
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <File className="w-24 h-24 text-premium-brown-400 mx-auto mb-6" strokeWidth={1.5} />
          <h3 className="text-2xl font-serif font-bold text-premium-brown-900 mb-3">
            {file.filename}
          </h3>
          <p className="text-premium-brown-600 mb-6">
            Preview not available for this file type
          </p>
          <a
            href={file.cloudinaryUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-premium-brown-700 to-premium-brown-800 text-white font-semibold hover:from-premium-brown-800 hover:to-premium-brown-900 transition-all shadow-premium-lg hover:shadow-premium-xl"
          >
            <Download className="w-5 h-5" strokeWidth={2} />
            Download File
          </a>
        </div>
      </div>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getBreadcrumbs = () => {
    if (!currentFolder) return [];
    const parts = currentFolder.path.split('/').filter(Boolean);
    return parts;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-premium-gradient flex items-center justify-center">
        <Loader className="w-12 h-12 text-premium-brown-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-premium-gradient">
      {/* Breadcrumbs */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-premium-brown-200/50 px-8 py-4 shadow-premium">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => navigate('/files')}
            className="text-premium-brown-700 hover:text-premium-brown-900 font-semibold transition-colors"
          >
            Files
          </button>
          {getBreadcrumbs().map((part, index) => (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-premium-brown-400" />
              <span className="text-premium-brown-900 font-semibold">{part}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white/90 backdrop-blur-sm border-r border-premium-brown-200/50 overflow-y-auto shadow-premium-lg">
          {/* Folders Section - ONLY FROM API */}
          {folders.length > 0 && (
            <div className="p-4 border-b border-premium-brown-200/30">
              <h3 className="text-sm font-bold text-premium-brown-700 uppercase tracking-wider mb-3">
                Folders ({folders.length})
              </h3>
              <div className="space-y-2">
                {folders.map((folder) => (
                  <button
                    key={folder._id}
                    onClick={() => navigate(`/files/${folder.folderId}`)}
                    className="w-full flex items-start gap-3 px-4 py-3 bg-gray-50 hover:bg-premium-brown-50 border border-premium-brown-200/30 transition-all group text-left"
                  >
                    <Folder className="w-5 h-5 text-premium-brown-600 group-hover:text-premium-brown-800 transition-colors flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-premium-brown-900 truncate">
                        {folder.name}
                      </p>
                      <p className="text-xs text-premium-brown-500 mt-1">
                        {new Date(folder.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Files Section - ONLY FROM API */}
          {files.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-bold text-premium-brown-700 uppercase tracking-wider mb-3">
                Files ({files.length})
              </h3>
              <div className="space-y-1">
                {files.map((file) => (
                  <button
                    key={file._id}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-all border-l-4 ${
                      selectedFile?._id === file._id
                        ? 'bg-premium-brown-100 border-premium-brown-700 shadow-sm'
                        : 'bg-transparent border-transparent hover:bg-premium-brown-50 hover:border-premium-brown-300'
                    }`}
                  >
                    <div className={`${selectedFile?._id === file._id ? 'text-premium-brown-800' : 'text-premium-brown-600'}`}>
                      {getFileIcon(file.filename)}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className={`text-sm font-semibold truncate ${
                        selectedFile?._id === file._id ? 'text-premium-brown-900' : 'text-premium-brown-800'
                      }`}>
                        {file.filename}
                      </p>
                      <p className="text-xs text-premium-brown-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {folders.length === 0 && files.length === 0 && (
            <div className="p-8 text-center">
              <Folder className="w-16 h-16 text-premium-brown-300 mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-sm text-premium-brown-600 font-medium">
                No folders or files found
              </p>
            </div>
          )}
        </div>

        {/* File Viewer */}
        <div className="flex-1 bg-white overflow-hidden">
          {selectedFile ? (
            <div className="h-full flex flex-col">
              <div className="bg-white border-b border-premium-brown-200/30 px-8 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-premium-brown-700">
                      {getFileIcon(selectedFile.filename)}
                    </div>
                    <div>
                      <h2 className="text-lg font-serif font-bold text-premium-brown-900">
                        {selectedFile.filename}
                      </h2>
                      <p className="text-sm text-premium-brown-600">
                        {formatFileSize(selectedFile.size)} • {new Date(selectedFile.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <a
                    href={selectedFile.cloudinaryUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-premium-brown-700 text-white font-semibold hover:bg-premium-brown-800 transition-all shadow-sm hover:shadow-md"
                  >
                    <Download className="w-4 h-4" strokeWidth={2} />
                    Download
                  </a>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                {renderFilePreview(selectedFile)}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <File className="w-24 h-24 text-premium-brown-300 mx-auto mb-6" strokeWidth={1.5} />
                <h3 className="text-2xl font-serif font-bold text-premium-brown-900 mb-3">
                  No File Selected
                </h3>
                <p className="text-premium-brown-600">
                  Select a file from the sidebar to view it
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
