import { useQuery } from "@tanstack/react-query";
import { Folder, ChevronRight, Info, FileText, Calendar, X, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { config } from "@/config/config";

interface FolderData {
  _id: string;
  folderId: string;
  name: string;
  path: string;
  parentPath: string;
  createdAt: string;
  __v: number;
  fileCount?: number;
  files?: string[];
  totalSize?: number;
}

interface FoldersResponse {
  folders: FolderData[];
}

interface FilesViewProps {
  search?: string;
  setSearch?: (s: string) => void;
}

function formatFolderDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatSize(bytes?: number) {
  if (bytes === undefined || bytes === null || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function FilesView({ search = "", setSearch }: FilesViewProps) {
  const navigate = useNavigate();
  const [hoveredFolderId, setHoveredFolderId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<FoldersResponse>({
    queryKey: ["folders"],
    queryFn: async () => {
      const response = await fetch(`${config.apiUrl}/notes/folders`);
      if (!response.ok) throw new Error("Failed to fetch folders");
      return response.json();
    },
  });

  const filteredFolders = useMemo(() => {
    if (!data?.folders) return [];
    const list = search
      ? data.folders.filter((folder) =>
          folder.name.toLowerCase().includes(search.toLowerCase()),
        )
      : [...data.folders];
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [data?.folders, search]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 p-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-[108px] animate-pulse border border-black/10 bg-black/[0.04]"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-xl text-red-600">Failed to load folders</p>
        <p className="mt-2 text-sm text-foreground/40">Please try again later</p>
      </div>
    );
  }

  if (filteredFolders.length === 0) {
    return (
      <div className="py-20 text-center">
        <Folder className="mx-auto mb-4 h-12 w-12 text-black/15" strokeWidth={1.5} />
        <p className="text-xl text-foreground/60">No folders found</p>
        {search && <p className="mt-2 text-sm text-foreground/40">Try a different search term</p>}
      </div>
    );
  }

  const selectedFolder = filteredFolders.find(f => f.folderId === hoveredFolderId);

  return (
    <div className="flex flex-1 flex-col md:flex-row overflow-hidden bg-transparent relative h-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Fixed Title & Search Header for Left Pane */}
        <div className="p-4 md:px-6 md:pt-6 md:pb-2 shrink-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-start">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl sm:mr-4">
            Files
          </h1>
          <div className="relative w-full sm:max-w-xs">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch?.(e.target.value)}
              placeholder="Search..."
              className="h-9 w-full rounded-md border border-gray-200 bg-white/50 pl-9 pr-4 text-sm font-medium text-gray-900 placeholder:text-gray-500 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>

        {/* Scrollable Folders Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 md:pt-2">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredFolders.map((folder) => {
            const isSelected = hoveredFolderId === folder.folderId;
            return (
              <button
                key={folder._id}
                onClick={() => navigate({ to: "/learnings/files/$folderId", params: { folderId: folder.folderId } })}
                onMouseEnter={() => {
                  if (window.innerWidth >= 768) setHoveredFolderId(folder.folderId);
                }}
                className={`relative group text-left flex min-h-[108px] flex-col justify-between rounded-none bg-transparent p-3.5 transition-all duration-200 sm:p-4 focus:outline-none ${
                  isSelected 
                    ? "border-2 border-dotted border-black/30" 
                    : "border-2 border-transparent hover:border-dotted hover:border-black/20"
                }`}
              >
                {/* Info Button for Mobile */}
                <div className="absolute top-2 right-2 md:hidden">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFolderId(folder.folderId);
                    }}
                    className="p-1.5 rounded-full bg-black/5 hover:bg-black/10 text-gray-500 transition-colors"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center border transition-colors sm:h-11 sm:w-11 ${
                    isSelected ? "border-[#8B4513]/40 bg-[#8B4513]/10 text-[#8B4513]" : "border-[#8B4513]/20 bg-[#FFF8F0] text-[#8B4513] group-hover:border-[#8B4513]/40 group-hover:bg-[#8B4513]/10"
                  }`}>
                    <Folder className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1 pr-4 md:pr-0">
                    <h3 className={`line-clamp-2 font-display text-[13px] font-bold leading-snug transition-colors sm:text-[15px] ${
                      isSelected ? "text-[#8B4513]" : "text-black group-hover:text-[#8B4513]"
                    }`}>
                      {folder.name}
                    </h3>
                    <span className="label-mono mt-1.5 inline-block text-[8px] font-semibold uppercase tracking-[0.2em] text-black/40 sm:text-[9px]">
                      Folder
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 border-t border-black/8 pt-2.5">
                  <span className="text-[11px] font-medium text-black/55 sm:text-[12px]">
                    {formatFolderDate(folder.createdAt)}
                  </span>
                  <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                    isSelected ? "text-slate-800 translate-x-0.5" : "text-black/25 group-hover:text-slate-700"
                  }`} />
                </div>


              </button>
            );
          })}
        </div>
      </div>
    </div>

    {/* Right Metadata Sidebar */}
      <aside className="hidden md:flex absolute inset-y-0 right-0 z-20 w-[320px] shrink-0 border-l border-black/10 bg-white flex-col md:relative shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
        {selectedFolder ? (
          <>
            {/* Actions */}
            <div className="flex items-center justify-between md:justify-end gap-2 p-5 border-b border-black/10">
              <button 
                onClick={() => setHoveredFolderId(null)}
                className="md:hidden p-2 text-slate-500 hover:bg-slate-200 rounded-none"
              >
              <X className="h-5 w-5" />
            </button>
            <button 
              onClick={() => navigate({ to: "/learnings/files/$folderId", params: { folderId: selectedFolder.folderId } })}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-black/5 hover:bg-black/10 rounded-none transition-colors"
            >
              Open Folder <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
          
          {/* Preview Thumbnail */}
          <div className="p-8 flex flex-col items-center border-b border-black/10">
            <div className="relative mb-6 flex h-24 w-32 items-center justify-center">
              <div className="absolute top-0 left-0 w-1/2 h-full bg-slate-300" style={{ clipPath: 'polygon(0 0, 80% 0, 100% 15%, 100% 100%, 0 100%)' }}></div>
              <div className="absolute bottom-0 w-full h-[85%] bg-slate-400 shadow-sm"></div>
              <Folder className="relative z-10 h-10 w-10 text-white/90 drop-shadow-sm" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-black text-slate-800 text-center break-words w-full font-display leading-tight tracking-tight">{selectedFolder.name}</h3>
            <p className="text-[11px] text-slate-500 mt-2 uppercase font-bold tracking-widest">{formatSize(selectedFolder.totalSize)}</p>
          </div>
          
          {/* Information */}
          <div className="p-6 flex-1 overflow-y-auto">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Information</h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center gap-4 group">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-2"><Calendar className="h-3.5 w-3.5 group-hover:text-slate-700 transition-colors" /> Created</span>
                <span className="text-xs text-slate-800 font-semibold">{formatFolderDate(selectedFolder.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center gap-4 group">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-2"><Folder className="h-3.5 w-3.5 group-hover:text-slate-700 transition-colors" /> Kind</span>
                <span className="text-xs text-slate-800 font-semibold">Folder</span>
              </div>
              <div className="flex justify-between items-center gap-4 group">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-2"><FileText className="h-3.5 w-3.5 group-hover:text-slate-700 transition-colors" /> Content</span>
                <span className="text-xs text-slate-800 font-semibold">{selectedFolder.fileCount !== undefined ? `${selectedFolder.fileCount} File${selectedFolder.fileCount === 1 ? '' : 's'}` : 'Unknown'}</span>
              </div>
            </div>

            {selectedFolder.files && selectedFolder.files.length > 0 && (
              <div className="mt-8">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Contents</h4>
                <ul className="space-y-2.5">
                  {selectedFolder.files.map((filename, i) => (
                    <li key={i} className="text-[11px] font-medium text-slate-600 truncate flex items-center gap-2.5 hover:text-slate-900 transition-colors cursor-default">
                      <div className="p-1 rounded-none bg-black/5 border border-black/10">
                        <FileText className="h-3 w-3 text-slate-500 shrink-0" />
                      </div>
                      {filename}
                    </li>
                  ))}
                  {(selectedFolder.fileCount || 0) > 5 && (
                    <li className="text-[10px] text-slate-400 font-bold italic mt-2 pt-3 border-t border-black/10">
                      + {(selectedFolder.fileCount || 0) - 5} more files...
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
            <Folder className="h-16 w-16 text-slate-400 mb-4" strokeWidth={1} />
            <p className="text-sm font-medium text-slate-500">Hover over a folder to view details</p>
          </div>
        )}
      </aside>
    </div>
  );
}
