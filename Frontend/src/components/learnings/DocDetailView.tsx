import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Calendar, Clock, FileText, Image as ImageIcon, Paperclip, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Header } from './Header';
import { config } from '@/config/config';
import { PremiumLoader, PremiumLoaderFullScreen } from './PremiumLoader';

interface DocFile {
  fileId: string;
  name: string;
  type: 'markdown' | 'diagram';
  azurePath: string;
  azureUrl: string;
  createdAt: string;
  _id: string;
}

interface Documentation {
  _id: string;
  docId: string;
  title: string;
  subject: string;
  description: string;
  tags: string[];
  date: string;
  time: string;
  slug: string;
  files: DocFile[];
  coverImage?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DocDetailViewProps {
  docId: string;
}

const tabs = [
  { label: "Blogs", value: "blogs" },
  { label: "Docs", value: "docs", bold: true },
  { label: "Guide", value: "guide" },
  { label: "Files", value: "files" },
  { label: "Diary", value: "diary" },
  { label: "Code", value: "code" },
  { label: "Architectures", value: "architectures" },
  { label: "Projects", value: "projects" },
];

export function DocDetailView({ docId }: DocDetailViewProps) {
  const navigate = useNavigate();
  const [activeTab] = useState("docs");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedFile, setSelectedFile] = useState<DocFile | null>(null);

  const handleTabChange = (tab: string) => {
    navigate({ to: '/learnings', search: { tab } });
  };

  // Fetch doc data
  const { data: doc, isLoading, error } = useQuery<Documentation>({
    queryKey: ['doc-detail', docId],
    queryFn: async () => {
      const url = `${config.apiUrl}/documentation/${docId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch documentation');
      }
      const result = await response.json();
      return result.doc;
    },
  });

  // Fetch file content when a file is selected
  const { data: fileContent, isLoading: isLoadingContent, error: contentError } = useQuery({
    queryKey: ['doc-file-content', selectedFile?.fileId],
    queryFn: async () => {
      if (!selectedFile || !doc) return '';
      // Fetch through server API to avoid CORS issues
      const url = `${config.apiUrl}/documentation/${doc._id}/files/${selectedFile.fileId}`;
      console.log('Fetching file content from:', url);
      const response = await fetch(url);
      if (!response.ok) {
        console.error('Failed to fetch file content:', response.status);
        throw new Error('Failed to fetch file content');
      }
      const data = await response.json();
      console.log('File content received:', data);
      return data.file?.content || data.content || '';
    },
    enabled: !!selectedFile && selectedFile.type === 'markdown' && !!doc,
    retry: 2,
  });

  // Auto-select first markdown file when doc loads
  useEffect(() => {
    if (doc && doc.files.length > 0 && !selectedFile) {
      const firstMarkdown = doc.files.find(f => f.type === 'markdown');
      if (firstMarkdown) {
        setSelectedFile(firstMarkdown);
      }
    }
  }, [doc, selectedFile]);

  // Custom markdown components
  const components = {
    h1: ({ children, ...props }: any) => <h1 className="text-3xl font-bold text-black mb-4 mt-8" {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 className="text-2xl font-semibold text-black mb-3 mt-6" {...props}>{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 className="text-xl font-semibold text-black mb-2 mt-4" {...props}>{children}</h3>,
    p: ({ children, ...props }: any) => <p className="text-black/80 mb-4 leading-7" {...props}>{children}</p>,
    ul: ({ children, ...props }: any) => <ul className="list-disc list-inside mb-4 space-y-1 text-black/80" {...props}>{children}</ul>,
    ol: ({ children, ...props }: any) => <ol className="list-decimal list-inside mb-4 space-y-1 text-black/80" {...props}>{children}</ol>,
    code: ({ inline, children, ...props }: any) => 
      inline ? (
        <code className="px-1.5 py-0.5 bg-black/5 border border-black/10 rounded text-sm font-mono" {...props}>{children}</code>
      ) : (
        <code className="block p-4 bg-black text-white rounded-lg overflow-x-auto font-mono text-sm" {...props}>{children}</code>
      ),
    pre: ({ children, ...props }: any) => <pre className="mb-4 rounded-lg overflow-hidden" {...props}>{children}</pre>,
    a: ({ href, children, ...props }: any) => (
      <a href={href} className="text-[#8B4513] font-semibold underline hover:text-[#6B3410]" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
    ),
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-white">
        <Header activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />
        <div className="flex-1 flex items-center justify-center">
          <PremiumLoader />
        </div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="h-screen flex flex-col bg-white">
        <Header activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-xl mb-4 font-bold">Documentation not found</p>
            <button
              onClick={() => navigate({ to: '/learnings?tab=docs' })}
              className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-black/90"
            >
              Back to Docs
            </button>
          </div>
        </div>
      </div>
    );
  }

  const markdownFiles = doc.files.filter(f => f.type === 'markdown');
  const diagramFiles = doc.files.filter(f => f.type === 'diagram');

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <Header activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />
      
      <div className="relative flex min-h-0 flex-1 flex-row overflow-hidden">
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 z-20 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`absolute inset-y-0 left-0 z-30 h-full shrink-0 border-r border-[#8B4513]/30 bg-[#FFF8F0] shadow-xl transition-all duration-300 ease-in-out md:relative md:shadow-none ${
            sidebarOpen ? "w-[280px] translate-x-0 md:w-1/5" : "w-0 -translate-x-full overflow-hidden md:translate-x-0"
          }`}
        >
          <div className="h-full w-[280px] overflow-y-auto p-4 space-y-4 md:w-full">
            <button
              onClick={() => navigate({ to: '/learnings?tab=docs' })}
              className="flex items-center gap-1.5 text-black hover:text-[#8B4513] font-semibold text-xs mb-3"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Docs
            </button>

            {/* Title */}
            <h2 className="text-lg font-bold text-black leading-tight">
              {doc.title}
            </h2>

            {/* Subject */}
            <div>
              <span className="px-3 py-1 bg-[#8B4513]/10 border border-[#8B4513]/30 rounded-lg text-xs font-bold text-[#8B4513]">
                {doc.subject}
              </span>
            </div>

            {/* Date & Time */}
            {doc.date && (
              <div className="flex items-center gap-2 text-xs text-black/60">
                <Calendar size={12} />
                <span>Date: {doc.date}</span>
              </div>
            )}
            {doc.time && (
              <div className="flex items-center gap-2 text-xs text-black/60">
                <Clock size={12} />
                <span>Time: {doc.time}</span>
              </div>
            )}

            <div className="border-t border-[#8B4513]/20"></div>

            {/* Markdown Files */}
            {markdownFiles.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-3.5 h-3.5" />
                  <h3 className="font-bold text-xs uppercase">Markdown</h3>
                </div>
                <div className="space-y-1">
                  {markdownFiles.map((file) => (
                    <button
                      key={file.fileId}
                      onClick={() => setSelectedFile(file)}
                      className={`w-full text-left p-2 rounded-lg transition-all text-xs cursor-pointer ${
                        selectedFile?.fileId === file.fileId
                          ? 'bg-[#8B4513]/20 border border-[#8B4513] font-semibold'
                          : 'hover:bg-[#8B4513]/10'
                      }`}
                    >
                      {file.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Diagram Files */}
            {diagramFiles.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <h3 className="font-bold text-xs uppercase">Diagrams</h3>
                </div>
                <div className="space-y-1">
                  {diagramFiles.map((file) => (
                    <button
                      key={file.fileId}
                      onClick={() => setSelectedFile(file)}
                      className={`w-full text-left p-2 rounded-lg transition-all text-xs cursor-pointer ${
                        selectedFile?.fileId === file.fileId
                          ? 'bg-[#8B4513]/20 border border-[#8B4513] font-semibold'
                          : 'hover:bg-[#8B4513]/10'
                      }`}
                    >
                      {file.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Paperclip className="w-3.5 h-3.5" />
                <h3 className="font-bold text-xs uppercase">Attachments</h3>
              </div>
              <p className="text-xs text-black/60">No attachments</p>
            </div>
          </div>
        </aside>

        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Minimize sidebar" : "Open sidebar"}
          className={`absolute top-1/2 z-40 -translate-y-1/2 rounded-r-lg bg-[#8B4513] p-2 text-white shadow-lg transition-all duration-300 hover:bg-[#6B3410] ${
            sidebarOpen ? "left-[280px] md:left-[calc(20%-1px)]" : "left-0"
          }`}
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <div className="min-w-0 flex-1 overflow-y-auto bg-white">
          <div className="max-w-5xl mx-auto px-3 py-4">
            {selectedFile?.type === 'markdown' ? (
              <article className="prose prose-slate max-w-none">
                {contentError ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 mb-3 opacity-20 text-red-500" />
                    <p className="text-red-600 mb-2">Failed to load content</p>
                    <p className="text-xs text-black/40">Please try again later</p>
                  </div>
                ) : isLoadingContent ? (
                  <PremiumLoaderFullScreen showText={true} />
                ) : fileContent ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={components}
                  >
                    {fileContent}
                  </ReactMarkdown>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 mb-3 opacity-20" />
                    <p className="text-black/60">No content available</p>
                  </div>
                )}
              </article>
            ) : selectedFile?.type === 'diagram' ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-16 w-16 mb-4 opacity-20" />
                  <p className="text-black/60 mb-2">Diagram viewer coming soon</p>
                  <p className="text-xs text-black/40">Excalidraw integration will be added</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 mb-3 opacity-20" />
                <p className="text-black/60">Select a file to view</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
