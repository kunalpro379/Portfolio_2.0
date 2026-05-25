import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, FileText, File, FileImage, FileVideo, FileArchive, ChevronLeft, ChevronRight } from 'lucide-react';
import { Header } from './Header';
import { config } from '@/config/config';

interface FileData {
  _id: string;
  fileId: string;
  filename: string;
  folderPath: string;
  cloudinaryUrl: string;
  fileType: string;
  size: number;
  uploadedAt: string;
  content?: string;
}

interface FilesResponse {
  files: FileData[];
}

interface FolderFilesViewProps {
  folderId: string;
}

const tabs = [
  { label: "Blogs", value: "blogs", bold: true },
  { label: "Docs", value: "docs" },
  { label: "Guide", value: "guide" },
  { label: "Files", value: "files" },
  { label: "Diary", value: "diary" },
  { label: "Code", value: "code" },
  { label: "Architectures", value: "architectures" },
  { label: "Projects", value: "projects" },
];

export function FolderFilesView({ folderId }: FolderFilesViewProps) {
  const navigate = useNavigate();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [activeTab] = useState("files");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  console.log('FolderFilesView rendered with folderId:', folderId);
  console.log('API URL:', config.apiUrl);

  const handleTabChange = (tab: string) => {
    navigate({ to: '/learnings', search: { tab } });
  };

  // Fetch folder with files
  const { data: folderData, isLoading, error } = useQuery({
    queryKey: ['folder-details', folderId],
    queryFn: async () => {
      const url = `${config.apiUrl}/notes/folders/${folderId}`;
      console.log('Fetching folder details from:', url);
      const response = await fetch(url);
      if (!response.ok) {
        console.error('Failed to fetch folder:', response.status, response.statusText);
        throw new Error('Failed to fetch folder');
      }
      const result = await response.json();
      console.log('Folder response:', result);
      return result.folder;
    },
  });

  const data = folderData ? { files: folderData.files || [] } : undefined;

  console.log('Component state:', { isLoading, error, filesCount: data?.files?.length, folderData });

  const getFileIcon = (fileType: string) => {
    if (!fileType) return <File className="h-5 w-5" />;
    if (fileType.startsWith('image/')) return <FileImage className="h-5 w-5" />;
    if (fileType.startsWith('video/')) return <FileVideo className="h-5 w-5" />;
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <FileArchive className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const selectedFile = data?.files.find((f: FileData) => f.fileId === selectedFileId);

  const renderFilePreview = () => {
    if (!selectedFile) {
      return (
        <div className="flex h-full items-center justify-center text-foreground/40">
          <div className="text-center">
            <FileText className="mx-auto h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg">Select a file to preview</p>
          </div>
        </div>
      );
    }

    const { fileType, cloudinaryUrl, filename } = selectedFile;

    if (fileType && fileType.startsWith('image/')) {
      return (
        <div className="h-full overflow-auto p-6">
          <img src={cloudinaryUrl} alt={filename} className="mx-auto max-w-full" />
        </div>
      );
    }

    if (fileType === 'application/pdf') {
      return (
        <iframe
          src={cloudinaryUrl}
          className="h-full w-full border-0"
          title={filename}
        />
      );
    }

    if (fileType && fileType.startsWith('video/')) {
      return (
        <div className="flex h-full items-center justify-center p-6">
          <video controls className="max-w-full max-h-full">
            <source src={cloudinaryUrl} type={fileType} />
          </video>
        </div>
      );
    }

    if (fileType && (fileType.startsWith('text/') || fileType.includes('json'))) {
      return (
        <iframe
          src={cloudinaryUrl}
          className="h-full w-full border-0"
          title={filename}
        />
      );
    }

    return (
      <div className="flex h-full items-center justify-center text-foreground/60">
        <div className="text-center">
          <File className="mx-auto h-16 w-16 mb-4 opacity-40" />
          <p className="text-lg mb-4">Preview not available for this file type</p>
          <a
            href={cloudinaryUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-[#8B4513] px-6 py-3 text-sm font-semibold text-white hover:bg-[#6B3410]"
          >
            <div className="h-4 w-4" />
            Download File
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <Header activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 relative">
        {/* Left Sidebar - File List (1/5 width) - Scrollable with slide animation */}
        <div 
          className={`border-r border-[#8B4513]/30 bg-[#FFF8F0] overflow-y-auto transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'w-full md:w-1/5' : 'w-0'
          }`}
          style={{ flexShrink: 0 }}
        >
          <div className={`${sidebarOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
            <div className="sticky top-0 z-10 bg-[#FFF8F0] border-b border-[#8B4513]/30 px-4 py-3">
              <button
                onClick={() => navigate({ to: '/learnings' })}
                className="flex items-center gap-1.5 text-black hover:text-[#8B4513] font-semibold text-xs mb-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Folders
              </button>
              <h2 className="font-display text-lg font-bold text-black">
                {folderData?.name || 'Loading...'}
              </h2>
              <p className="text-xs text-black/60 mt-0.5">
                {data?.files.length || 0} files
              </p>
            </div>

            {isLoading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 animate-pulse bg-[#8B4513]/10 rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-600">
                <p className="font-semibold text-xs">Failed to load files</p>
              </div>
            ) : !data?.files || data.files.length === 0 ? (
              <div className="p-4 text-center text-black/60">
                <FileText className="mx-auto h-10 w-10 mb-2 opacity-30" />
                <p className="font-medium text-xs">No files in this folder</p>
              </div>
            ) : (
              <div className="p-3 space-y-1.5">
                {data.files.map((file: FileData) => (
                  <button
                    key={file._id}
                    onClick={() => setSelectedFileId(file.fileId)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                      selectedFileId === file.fileId
                        ? 'bg-[#8B4513]/20 border-2 border-[#8B4513]'
                        : 'bg-transparent hover:bg-[#8B4513]/10'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`mt-0.5 ${selectedFileId === file.fileId ? 'text-[#8B4513]' : 'text-black/60'}`}>
                        {getFileIcon(file.fileType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-xs text-black truncate leading-tight">
                          {file.filename}
                        </h3>
                        <p className="text-[10px] text-black/50 mt-0.5">
                          {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button - Fixed on left side of preview */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-[#8B4513] text-white p-2 rounded-r-lg shadow-lg hover:bg-[#6B3410] transition-all duration-200"
          style={{ left: sidebarOpen ? 'calc(20% - 1px)' : '0' }}
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Right Section - File Preview (4/5 width) - Fixed */}
        <div className="flex-1 bg-white overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden">
            {renderFilePreview()}
          </div>
        </div>
      </div>
    </div>
  );
}
