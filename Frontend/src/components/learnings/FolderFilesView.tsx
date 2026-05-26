import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  FileText,
  File,
  FileImage,
  FileVideo,
  FileArchive,
  ChevronLeft,
  ChevronRight,
  Download,
  Presentation,
} from "lucide-react";
import { Header } from "./Header";
import { config } from "@/config/config";
import { PremiumLoader } from "./PremiumLoader";

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

interface FolderFilesViewProps {
  folderId: string;
}

const tabs = [
  { label: "Blogs", value: "blogs" },
  { label: "Docs", value: "docs" },
  { label: "Guide", value: "guide" },
  { label: "Files", value: "files", bold: true },
  { label: "Diary", value: "diary" },
  { label: "Code", value: "code" },
  { label: "Architectures", value: "architectures" },
  { label: "Projects", value: "projects" },
];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatFileDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

function getFileIcon(filename: string, fileType: string) {
  const lower = filename.toLowerCase();
  if (fileType?.startsWith("image/")) return FileImage;
  if (fileType?.startsWith("video/")) return FileVideo;
  if (lower.endsWith(".pdf") || fileType?.includes("pdf")) return FileText;
  if (lower.endsWith(".pptx") || lower.endsWith(".ppt")) return Presentation;
  if (lower.endsWith(".zip") || lower.endsWith(".rar")) return FileArchive;
  return File;
}

export function FolderFilesView({ folderId }: FolderFilesViewProps) {
  const navigate = useNavigate();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [activeTab] = useState("files");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleTabChange = (tab: string) => {
    navigate({ to: "/learnings", search: { tab } });
  };

  const { data: folderData, isLoading, error } = useQuery({
    queryKey: ["folder-details", folderId],
    queryFn: async () => {
      const response = await fetch(`${config.apiUrl}/notes/folders/${folderId}`);
      if (!response.ok) throw new Error("Failed to fetch folder");
      const result = await response.json();
      return result.folder;
    },
  });

  const files: FileData[] = folderData?.files ?? [];

  const sortedFiles = [...files].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );

  useEffect(() => {
    if (sortedFiles.length === 0) {
      setSelectedFileId(null);
      return;
    }
    setSelectedFileId((prev) => {
      if (prev && sortedFiles.some((f) => f.fileId === prev)) return prev;
      return sortedFiles[0].fileId;
    });
  }, [folderId, folderData]);

  const selectedFile = sortedFiles.find((f) => f.fileId === selectedFileId);

  const renderFilePreview = () => {
    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <PremiumLoader />
        </div>
      );
    }

    if (!selectedFile) {
      return (
        <div className="flex h-full items-center justify-center text-foreground/40">
          <div className="text-center">
            <FileText className="mx-auto mb-4 h-16 w-16 opacity-20" />
            <p className="text-lg font-medium">Select a file to preview</p>
          </div>
        </div>
      );
    }

    const { fileType, cloudinaryUrl, filename } = selectedFile;

    if (fileType?.startsWith("image/")) {
      return (
        <div className="h-full overflow-auto p-4 sm:p-6">
          <img src={cloudinaryUrl} alt={filename} className="mx-auto max-w-full" />
        </div>
      );
    }

    if (fileType === "application/pdf") {
      return (
        <iframe src={cloudinaryUrl} className="h-full w-full border-0" title={filename} />
      );
    }

    if (fileType?.startsWith("video/")) {
      return (
        <div className="flex h-full items-center justify-center p-6">
          <video controls className="max-h-full max-w-full">
            <source src={cloudinaryUrl} type={fileType} />
          </video>
        </div>
      );
    }

    if (fileType?.startsWith("text/") || fileType?.includes("json")) {
      return (
        <iframe src={cloudinaryUrl} className="h-full w-full border-0" title={filename} />
      );
    }

    return (
      <div className="flex h-full items-center justify-center text-foreground/60">
        <div className="text-center px-6">
          <File className="mx-auto mb-4 h-16 w-16 opacity-40" />
          <p className="mb-1 text-lg font-semibold text-black">{filename}</p>
          <p className="mb-6 text-sm text-black/50">Preview not available for this file type</p>
          <a
            href={cloudinaryUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-[#8B4513] px-6 py-3 text-sm font-semibold text-white hover:bg-[#6B3410]"
          >
            <Download className="h-4 w-4" />
            Download file
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <Header activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />

      <div className="relative flex min-h-0 flex-1 flex-row overflow-hidden">
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close file list"
            className="absolute inset-0 z-20 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`absolute inset-y-0 left-0 z-30 flex h-full shrink-0 flex-col border-r border-[#8B4513]/25 bg-[#FFF8F0] shadow-xl transition-all duration-300 ease-in-out md:relative md:shadow-none ${
            sidebarOpen
              ? "w-[min(88vw,300px)] translate-x-0 md:w-[min(320px,28vw)]"
              : "w-0 -translate-x-full overflow-hidden md:translate-x-0"
          }`}
        >
          <div className="flex h-full w-[min(88vw,300px)] flex-col md:w-full">
            <div className="shrink-0 border-b border-[#8B4513]/20 bg-[#FFF8F0] px-4 py-3">
              <button
                type="button"
                onClick={() => navigate({ to: "/learnings", search: { tab: "files" } })}
                className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-black transition-colors hover:text-[#8B4513]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Folders
              </button>
              <h2 className="font-display text-base font-bold leading-tight text-black sm:text-lg">
                {folderData?.name ?? "Loading…"}
              </h2>
              <p className="mt-0.5 text-[11px] font-medium text-black/55">
                {isLoading ? "…" : `${sortedFiles.length} file${sortedFiles.length === 1 ? "" : "s"}`}
              </p>
            </div>

            <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-2 p-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-14 animate-pulse rounded-md bg-[#8B4513]/10" />
                  ))}
                </div>
              ) : error ? (
                <div className="p-4 text-center text-sm font-semibold text-red-600">
                  Failed to load files
                </div>
              ) : sortedFiles.length === 0 ? (
                <div className="p-6 text-center text-black/55">
                  <FileText className="mx-auto mb-2 h-10 w-10 opacity-30" />
                  <p className="text-xs font-medium">No files in this folder</p>
                </div>
              ) : (
                <ul className="divide-y divide-[#8B4513]/12 p-2">
                  {sortedFiles.map((file) => {
                    const Icon = getFileIcon(file.filename, file.fileType);
                    const isActive = selectedFileId === file.fileId;
                    return (
                      <li key={file._id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFileId(file.fileId);
                            if (window.innerWidth < 768) setSidebarOpen(false);
                          }}
                          className={`flex w-full items-start gap-3 rounded-md px-3 py-3 text-left transition-all ${
                            isActive
                              ? "bg-white shadow-[inset_3px_0_0_0_#8B4513] ring-1 ring-[#8B4513]/20"
                              : "hover:bg-white/70"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border ${
                              isActive
                                ? "border-[#8B4513]/30 bg-[#8B4513]/10 text-[#8B4513]"
                                : "border-black/10 bg-white text-black/50"
                            }`}
                          >
                            <Icon className="h-4 w-4" strokeWidth={2} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13px] font-semibold leading-snug text-black">
                              {file.filename}
                            </span>
                            <span className="mt-1 block text-[11px] text-black/50">
                              {formatFileSize(file.size)} • {formatFileDate(file.uploadedAt)}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </aside>

        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Minimize file list" : "Open file list"}
          className={`absolute top-1/2 z-40 -translate-y-1/2 rounded-r-lg bg-[#8B4513] p-2 text-white shadow-lg transition-all duration-300 hover:bg-[#6B3410] ${
            sidebarOpen
              ? "left-[min(88vw,300px)] md:left-[min(320px,28vw)]"
              : "left-0"
          }`}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
          {selectedFile && (
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/10 px-4 py-2.5 sm:px-6">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-black">{selectedFile.filename}</p>
                <p className="text-[11px] text-black/50">
                  {formatFileSize(selectedFile.size)} • {formatFileDate(selectedFile.uploadedAt)}
                </p>
              </div>
              <a
                href={selectedFile.cloudinaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="flex shrink-0 items-center gap-1.5 rounded-md border border-black/15 px-3 py-1.5 text-[11px] font-semibold text-black transition-colors hover:border-[#8B4513]/40 hover:bg-[#FFF8F0]"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </a>
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-hidden">{renderFilePreview()}</div>
        </div>
      </div>
    </div>
  );
}
