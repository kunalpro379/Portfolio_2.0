import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import {
  ChevronRight, ChevronDown, FileText, Folder, FolderOpen,
  FilePlus, FolderPlus, Files, Github, GitBranch, Plus,
  RefreshCw, Container, Send, Bot, User as UserIcon, Sparkles,
  MoreHorizontal, FolderGit2
} from "lucide-react";
import { PremiumLoaderFullScreen } from "./PremiumLoader";
import { EC2Terminal, EC2TerminalRef } from "./EC2Terminal";
import { config } from "@/config/config";
import { CodeEditor } from "./CodeEditor";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { JupyterIcon } from "./JupyterIcon";
import { JupyterNotebookView } from "./JupyterNotebookView";
import { PromptModal } from "../ui/PromptModal";

const API_BASE_URL = config.apiUrl;

// ── API helpers ───────────────────────────────────────────────────────────────
async function fetchFolders(parentPath = "", source: string | null = null) {
  const params = new URLSearchParams({ parentPath });
  if (source) params.set("source", source);
  const res = await fetch(`${API_BASE_URL}/apps/coding/folders?${params}`);
  if (!res.ok) throw new Error("Failed to fetch folders");
  return (await res.json()).folders || [];
}

async function fetchFiles(folderPath = "") {
  const res = await fetch(`${API_BASE_URL}/apps/coding/files?folderPath=${encodeURIComponent(folderPath)}`);
  if (!res.ok) throw new Error("Failed to fetch files");
  return (await res.json()).files || [];
}

// ── File icon by extension ────────────────────────────────────────────────────
function getFileColor(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  const colors: Record<string, string> = {
    ts: "text-blue-400", tsx: "text-blue-300", js: "text-yellow-400", jsx: "text-yellow-300",
    py: "text-green-400", java: "text-orange-400", cpp: "text-purple-400", c: "text-purple-300",
    go: "text-cyan-400", rs: "text-orange-300", json: "text-yellow-300", md: "text-slate-700",
    ipynb: "text-orange-400",
    css: "text-pink-400", html: "text-orange-400", sh: "text-green-300", yml: "text-red-300",
    yaml: "text-red-300", env: "text-slate-600", txt: "text-slate-600",
  };
  return colors[ext || ""] || "text-slate-600";
}

// ── Recursive Tree Node ───────────────────────────────────────────────────────
interface TreeNodeProps {
  folder: any;
  depth: number;
  openFolders: Set<string>;
  toggleFolder: (id: string) => void;
  selectedFileId: string;
  onFileSelect: (fileId: string, filePath: string) => void;
  onCreateFile: (path: string) => void;
  onCreateFolder: (path: string) => void;
}

function FolderTreeNode({
  folder, depth, openFolders, toggleFolder,
  selectedFileId, onFileSelect, onCreateFile, onCreateFolder
}: TreeNodeProps) {
  const isOpen = openFolders.has(folder.folderId);

  const { data: subFolders = [], isLoading: loadingFolders } = useQuery({
    queryKey: ["tree-folders", folder.path, folder.source],
    queryFn: () => fetchFolders(folder.path, folder.source || null),
    enabled: isOpen,
    staleTime: 30_000,
  });

  const { data: subFiles = [], isLoading: loadingFiles } = useQuery({
    queryKey: ["tree-files", folder.path],
    queryFn: () => fetchFiles(folder.path),
    enabled: isOpen,
    staleTime: 30_000,
  });

  const indent = depth * 12;

  return (
    <div>
      {/* Folder row */}
      <div
        className="flex items-center gap-1 py-[3px] hover:bg-slate-200/50 cursor-pointer group select-none relative"
        style={{ paddingLeft: `${8 + indent}px` }}
        onClick={() => toggleFolder(folder.folderId)}
      >
        {/* Expand arrow */}
        <span className="w-3 h-3 flex items-center justify-center shrink-0">
          {isOpen
            ? <ChevronDown className="h-2.5 w-2.5 text-slate-500" />
            : <ChevronRight className="h-2.5 w-2.5 text-slate-500" />
          }
        </span>

        {/* Folder icon */}
        {isOpen
          ? <FolderOpen className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          : <Folder className="h-3.5 w-3.5 text-amber-500 shrink-0" />
        }

        {/* Name */}
        <span className="flex-1 text-xs text-slate-700 font-mono truncate">{folder.name}</span>

        {/* Hover actions */}
        <div className="hidden group-hover:flex items-center gap-0.5 pr-2 shrink-0">
          <button
            title="New File"
            onClick={e => { e.stopPropagation(); onCreateFile(folder.path); }}
            className="p-0.5 rounded hover:bg-slate-300/50 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <FilePlus className="h-3 w-3" />
          </button>
          <button
            title="New Folder"
            onClick={e => { e.stopPropagation(); onCreateFolder(folder.path); }}
            className="p-0.5 rounded hover:bg-slate-300/50 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <FolderPlus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Children */}
      {isOpen && (
        <div>
          {(loadingFolders || loadingFiles) && (
            <div style={{ paddingLeft: `${8 + indent + 20}px` }} className="py-1 text-[10px] text-slate-500">
              Loading…
            </div>
          )}

          {/* Sub-folders */}
          {subFolders.map((sf: any) => (
            <FolderTreeNode
              key={sf.folderId}
              folder={sf}
              depth={depth + 1}
              openFolders={openFolders}
              toggleFolder={toggleFolder}
              selectedFileId={selectedFileId}
              onFileSelect={onFileSelect}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
            />
          ))}

          {/* Files */}
          {subFiles.map((file: any) => (
            <div
              key={file.fileId}
              className={`flex items-center gap-1.5 py-[3px] hover:bg-slate-200/50 cursor-pointer text-xs font-mono group ${
                selectedFileId === file.fileId
                  ? "bg-orange-50 border-l-2 border-[#ea580c] text-slate-800 shadow-sm font-semibold"
                  : "text-slate-600"
              }`}
              style={{ paddingLeft: `${8 + indent + 24}px` }}
              onClick={() => onFileSelect(file.fileId, file.folderPath)}
            >
              <FileText className={`h-3.5 w-3.5 shrink-0 ${getFileColor(file.filename)}`} />
              <span className="truncate">{file.filename}</span>
            </div>
          ))}

          {/* Empty folder msg */}
          {!loadingFolders && !loadingFiles && subFolders.length === 0 && subFiles.length === 0 && (
            <div
              className="py-1 text-[10px] text-slate-400 italic"
              style={{ paddingLeft: `${8 + indent + 20}px` }}
            >
              Empty
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Chat Sidebar ──────────────────────────────────────────────────────────────
function ChatSidebar({ currentFileContext, onToolAction, getDynamicContext }: { currentFileContext?: any; onToolAction?: () => void; getDynamicContext?: () => string | null }) {
  const [messages, setMessages] = useState<any[]>([
    { role: "assistant", content: "Hey! I'm your AI coding assistant. Ask me anything about your code." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/apps/agent/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.filter(m => m.role !== "assistant" || m.content !== "Hey! I'm your AI coding assistant. Ask me anything about your code.").map(m => ({ role: m.role, content: m.content })),
          currentFileContext: currentFileContext ? {
            fileId: currentFileContext.fileId,
            filename: currentFileContext.filename,
            folderPath: currentFileContext.folderPath,
            content: currentFileContext.content
          } : getDynamicContext ? {
            fileId: "terminal",
            filename: "EC2 Terminal",
            folderPath: "/",
            content: getDynamicContext() || "Terminal is empty"
          } : null
        }),
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Add a placeholder message for the assistant
      setMessages(m => [...m, { role: "assistant", content: "", toolOperations: [] }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // keep the incomplete line in the buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (!dataStr.trim()) continue;
            try {
              const event = JSON.parse(dataStr);
              if (event.type === 'tool') {
                setMessages(m => {
                  const newM = [...m];
                  const lastMsg = newM[newM.length - 1];
                  lastMsg.toolOperations = [...(lastMsg.toolOperations || []), event];
                  return newM;
                });
                // If it edited or created a file, refresh the file tree
                if (onToolAction && (event.action === 'edit' || event.action === 'write')) {
                  onToolAction();
                }
              } else if (event.type === 'done') {
                setMessages(m => {
                  const newM = [...m];
                  const lastMsg = newM[newM.length - 1];
                  lastMsg.content = event.message;
                  return newM;
                });
              }
            } catch (e) {
              console.error("Failed to parse event", e);
            }
          }
        }
      }
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "⚠️ Failed to reach AI service." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/70 border-l border-[#e2e8f0] font-mono text-[11px]">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#e2e8f0] shrink-0 bg-white/70">
        <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center">
          <Sparkles className="h-3 w-3 text-slate-400" />
        </div>
        <span className="font-semibold text-slate-800">AI Assistant</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col gap-1`}>
            {msg.toolOperations && msg.toolOperations.length > 0 && (
              <div className="flex flex-col gap-1 mb-1 pl-6">
                {msg.toolOperations.map((tool: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded-sm border border-white/10 self-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
                    <span>{tool.details}</span>
                  </div>
                ))}
              </div>
            )}
            <div className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${msg.role === "user" ? "bg-slate-200" : "bg-slate-100"}`}>
                {msg.role === "user" ? <UserIcon className="h-3 w-3 text-slate-700" /> : <Bot className="h-3 w-3 text-slate-600" />}
              </div>
              <div className={`leading-relaxed rounded-md px-2 py-1 max-w-[90%] whitespace-pre-wrap ${
                msg.role === "user" ? "bg-slate-200 text-slate-800 rounded-tr-none px-3 py-2" : "text-slate-700 w-full"
              }`}>
                {msg.role === "user" ? (
                  msg.content
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus as any}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{ margin: '4px 0', padding: '10px', borderRadius: '4px', background: '#0a0a0a', fontSize: '10px', border: '1px solid #1a1a1a' }}
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800" {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <Bot className="h-3 w-3 text-slate-600" />
            </div>
            <div className="bg-transparent border border-[#e2e8f0] rounded-md rounded-tl-none px-3 py-2 text-slate-500 flex items-center gap-1">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce delay-75">●</span>
              <span className="animate-bounce delay-150">●</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 bg-white/70 border-t border-[#e2e8f0] shrink-0">
        <div className="relative flex items-end bg-white border border-[#e2e8f0] rounded-md focus-within:border-gray-500 transition-colors p-1">
          <textarea
            className="flex-1 bg-transparent border-none px-2 py-1.5 text-[11px] text-slate-700 placeholder:text-slate-500 focus:outline-none resize-none min-h-[28px] max-h-[120px]"
            placeholder="Ask AI to code..."
            value={input}
            rows={1}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            style={{ scrollbarWidth: "none" }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="p-1.5 mb-0.5 mr-0.5 rounded-sm bg-slate-200 hover:bg-slate-300 disabled:opacity-30 disabled:bg-slate-200 flex items-center justify-center transition-colors shrink-0"
          >
            <Send className="h-3 w-3 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main CodeView ─────────────────────────────────────────────────────────────
export function CodeView({ search }: { search: string }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"explorer" | "github" | "terminal" | "ipynb">("explorer");
  const [repoInput, setRepoInput] = useState("");
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [selectedFileId, setSelectedFileId] = useState("");
  const [selectedFilePath, setSelectedFilePath] = useState("");
  const terminalRef = useRef<EC2TerminalRef>(null);

  const [promptModal, setPromptModal] = useState<{
    isOpen: boolean;
    title: string;
    placeholder: string;
    type: "file" | "folder";
    path: string;
  }>({ isOpen: false, title: "", placeholder: "", type: "file", path: "" });

  // Persist URL state
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : search);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (selectedFileId) url.searchParams.set("file", selectedFileId);
    else url.searchParams.delete("file");
    window.history.replaceState({}, "", url.toString());
  }, [selectedFileId]);

  // ── Root-level LOCAL folders (Explorer: shows everything) ──────────────
  const { data: localRootFolders = [], isLoading: loadingLocal, refetch: refetchLocal } = useQuery({
    queryKey: ["tree-folders-root-local"],
    queryFn: () => fetchFolders("", "local"),

    enabled: activeTab === "explorer",
    staleTime: 10_000,
  });

  // ── Root-level GitHub repos (all root folders) ───────────────────────────
  const { data: githubRootFolders = [], isLoading: loadingGithub } = useQuery({
    queryKey: ["tree-folders-root-github"],
    queryFn: () => fetchFolders("", "github"),

    enabled: activeTab === "github",
    staleTime: 10_000,
  });

  // ── Selected file content ──────────────────────────────────────────────
  const { data: currentFolderFiles = [] } = useQuery({
    queryKey: ["tree-files", selectedFilePath],
    queryFn: () => fetchFiles(selectedFilePath),
    enabled: !!selectedFilePath,
  });
  const selectedFile = currentFolderFiles.find((f: any) => f.fileId === selectedFileId);

  // ── Toggle folder open/close ───────────────────────────────────────────
  const toggleFolder = (folderId: string) => {
    setOpenFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  // ── Create file in a given path ────────────────────────────────────────
  const createFileMut = useMutation({
    mutationFn: async ({ filename, folderPath }: { filename: string; folderPath: string }) => {
      const res = await fetch(`${API_BASE_URL}/apps/coding/file/create`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, folderPath, content: `// ${filename}\n` })
      });
      return await res.json();
    },
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["tree-files", vars.folderPath] });
      if (data?.file?.fileId) {
        setSelectedFileId(data.file.fileId);
        setSelectedFilePath(vars.folderPath);
      }
    }
  });

  // ── Create folder at given path ────────────────────────────────────────
  const createFolderMut = useMutation({
    mutationFn: async ({ name, parentPath }: { name: string; parentPath: string }) => {
      const res = await fetch(`${API_BASE_URL}/apps/coding/folder/create`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parentPath, source: "local" })
      });
      return await res.json();
    },
    onSuccess: (_, vars) => {
      // Invalidate tree for the parent path and root
      queryClient.invalidateQueries({ queryKey: ["tree-folders", vars.parentPath] });
      queryClient.invalidateQueries({ queryKey: ["tree-folders-root-local"] });
    }
  });

  // ── GitHub import ──────────────────────────────────────────────────────
  const importRepoMut = useMutation({
    mutationFn: async (repoUrl: string) => {
      const res = await fetch(`${API_BASE_URL}/apps/coding/github/import`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl })
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.details || e.error || "Import failed"); }
      return await res.json();
    },
    onSuccess: () => {
      // Refresh both Explorer and GitHub tab
      queryClient.invalidateQueries({ queryKey: ["tree-folders-root-local"] });
      queryClient.invalidateQueries({ queryKey: ["tree-folders-root-github"] });
      setRepoInput("");
    },
    onError: (err: any) => alert(`Import failed: ${err.message}`)
  });

  const handleCreateFile = (folderPath: string) => {
    setPromptModal({ isOpen: true, title: "Create File", placeholder: "File name (e.g. main.py)", type: "file", path: folderPath });
  };

  const handleCreateFolder = (parentPath: string) => {
    setPromptModal({ isOpen: true, title: "Create Folder", placeholder: "Folder name", type: "folder", path: parentPath });
  };

  const handleImport = () => {
    if (!repoInput.trim()) return;
    let url = repoInput.trim();
    if (!url.includes("github.com") && url.includes("/")) url = `https://github.com/${url}`;
    importRepoMut.mutate(url);
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ height: "100%", width: "100%" }} className="bg-[#f8fafc] overflow-hidden flex">

      {/* ── ACTIVITY BAR ── */}
      <div className="w-14 bg-white/70 border-r border-[#e2e8f0] flex flex-col items-center py-3 gap-4 shrink-0">
        {[
          { id: "explorer", icon: Files, label: "Explorer", activeColor: "text-slate-800 border-slate-800" },
          { id: "github", icon: FolderGit2, label: "GitHub", activeColor: "text-slate-800 border-slate-800" },
          { id: "terminal", icon: Container, label: "Terminal", activeColor: "text-emerald-600 border-emerald-600" },
          { id: "ipynb", icon: JupyterIcon, label: "ipynb", activeColor: "text-[#f37626] border-[#f37626]" },
        ].map(({ id, icon: Icon, label, activeColor }) => (
          <button
            key={id}
            title={label}
            onClick={() => setActiveTab(id as any)}
            className={`flex flex-col items-center gap-1 w-full py-1.5 border-l-2 transition-all ${
              activeTab === id ? activeColor : "text-slate-500 hover:text-slate-700 border-transparent"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={1.5} />
            <span className="text-[8px] uppercase tracking-wider">{label}</span>
          </button>
        ))}
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      {activeTab === "ipynb" ? (
        <div className="flex-1 h-full overflow-hidden">
          <JupyterNotebookView />
        </div>
      ) : activeTab === "terminal" ? (
        <PanelGroup orientation="horizontal" className="flex-1">
          <Panel defaultSize={77} minSize={30} className="bg-[#f8fafc]">
            <EC2Terminal ref={terminalRef} />
          </Panel>
          <PanelResizeHandle className="w-px bg-[#21262d] hover:bg-[#f37626] transition-colors cursor-col-resize" />
          <Panel defaultSize={23} minSize={16}>
            <ChatSidebar 
              getDynamicContext={() => terminalRef.current?.getContext() || null}
              onToolAction={() => queryClient.invalidateQueries({ queryKey: ["tree-files"] })} 
            />
          </Panel>
        </PanelGroup>
      ) : (
        <PanelGroup orientation="horizontal" className="flex-1">

          {/* LEFT PANEL */}
          <Panel defaultSize={22} minSize={14} className="flex flex-col bg-[#f8fafc] border-r border-[#e2e8f0]">

            {/* ─── EXPLORER TAB ─── */}
            {activeTab === "explorer" ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-[#e2e8f0] shrink-0">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Explorer</span>
                  <div className="flex items-center gap-1">
                    <button
                      title="New File at Root"
                      onClick={() => handleCreateFile("")}
                      className="p-0.5 text-slate-500 hover:text-slate-800 transition-colors rounded"
                    >
                      <FilePlus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      title="New Folder at Root"
                      onClick={() => handleCreateFolder("")}
                      className="p-0.5 text-slate-500 hover:text-slate-800 transition-colors rounded"
                    >
                      <FolderPlus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      title="Refresh"
                      onClick={() => { queryClient.invalidateQueries({ queryKey: ["tree-folders-root-local"] }); }}
                      className="p-0.5 text-slate-500 hover:text-slate-800 transition-colors rounded"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Tree */}
                <div className="flex-1 overflow-auto py-1">
                  {loadingLocal ? (
                    <div className="flex items-center justify-center py-10">
                      <PremiumLoaderFullScreen />
                    </div>
                  ) : localRootFolders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-[#e2e8f0] flex items-center justify-center">
                        <Files className="h-5 w-5 text-slate-500" />
                      </div>
                      <p className="text-[10px] text-slate-500">No local files yet.</p>
                      <button
                        onClick={() => handleCreateFolder("")}
                        className="text-[10px] text-blue-500 hover:text-blue-400 border border-blue-500/30 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1.5"
                      >
                        <FolderPlus className="h-3 w-3" /> New Folder
                      </button>
                    </div>
                  ) : (
                    localRootFolders.map((folder: any) => (
                      <FolderTreeNode
                        key={folder.folderId}
                        folder={folder}
                        depth={0}
                        openFolders={openFolders}
                        toggleFolder={toggleFolder}
                        selectedFileId={selectedFileId}
                        onFileSelect={(id, path) => { setSelectedFileId(id); setSelectedFilePath(path); }}
                        onCreateFile={handleCreateFile}
                        onCreateFolder={handleCreateFolder}
                      />
                    ))
                  )}
                </div>
              </>

            ) : (
              /* ─── GITHUB TAB ─── */
              <>
                <div className="flex items-center justify-between px-3 py-2 border-b border-[#e2e8f0] shrink-0">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                    <Github className="h-3 w-3" /> GitHub Repos
                  </span>
                  <button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ["tree-folders-root-github"] })}
                    className="p-0.5 text-slate-500 hover:text-slate-800 transition-colors rounded"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                </div>

                {/* Import form */}
                <div className="px-3 py-3 border-b border-[#e2e8f0] bg-white/70 shrink-0">
                  <p className="text-[10px] text-slate-500 mb-2">Import a public GitHub repository</p>
                  <input
                    type="text"
                    placeholder="owner/repo or full URL"
                    value={repoInput}
                    onChange={e => setRepoInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleImport()}
                    className="w-full bg-slate-50 border border-[#e2e8f0] text-slate-800 px-2.5 py-1.5 rounded-lg text-xs focus:outline-none focus:border-emerald-500 transition-colors placeholder-gray-700 mb-2 font-mono"
                  />
                  <button
                    onClick={handleImport}
                    disabled={importRepoMut.isPending || !repoInput.trim()}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-bold text-slate-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {importRepoMut.isPending
                      ? <><RefreshCw className="h-3 w-3 animate-spin" /> Importing…</>
                      : <><Plus className="h-3 w-3" /> Add Repository</>
                    }
                  </button>
                </div>

                {/* Repo list — GitHub only, with tree */}
                <div className="flex-1 overflow-auto py-1">
                  {loadingGithub ? (
                    <div className="flex items-center justify-center py-8"><PremiumLoaderFullScreen /></div>
                  ) : githubRootFolders.length === 0 ? (
                    <div className="px-3 py-8 text-center">
                      <Github className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-[10px] text-slate-500 italic">No repos imported yet</p>
                    </div>
                  ) : (
                    githubRootFolders.map((folder: any) => (
                      <FolderTreeNode
                        key={folder.folderId}
                        folder={folder}
                        depth={0}
                        openFolders={openFolders}
                        toggleFolder={toggleFolder}
                        selectedFileId={selectedFileId}
                        onFileSelect={(id, path) => { setSelectedFileId(id); setSelectedFilePath(path); }}
                        onCreateFile={handleCreateFile}
                        onCreateFolder={handleCreateFolder}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </Panel>

          <PanelResizeHandle className="w-px bg-[#21262d] hover:bg-[#f37626] transition-colors cursor-col-resize" />

          {/* CODE EDITOR */}
          <Panel defaultSize={55} minSize={30} className="bg-[#f8fafc]">
            {selectedFile ? (
              <CodeEditor
                key={selectedFile.fileId}
                initialCode={selectedFile.content}
                initialLanguage={
                  selectedFile.language === "python" ? 71 :
                  selectedFile.language === "javascript" ? 63 :
                  selectedFile.language === "typescript" ? 74 :
                  selectedFile.language === "cpp" ? 54 :
                  selectedFile.language === "java" ? 62 : 63
                }
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center space-y-2 opacity-40">
                  <FileText className="h-12 w-12 mx-auto text-slate-500" />
                  <p className="text-sm text-slate-500">Select a file to edit</p>
                </div>
              </div>
            )}
          </Panel>

          <PanelResizeHandle className="w-px bg-[#21262d] hover:bg-[#f37626] transition-colors cursor-col-resize" />

          {/* CHAT SIDEBAR */}
          <Panel defaultSize={23} minSize={16}>
            <ChatSidebar 
              currentFileContext={selectedFile} 
              onToolAction={() => queryClient.invalidateQueries({ queryKey: ["tree-files"] })} 
            />
          </Panel>

        </PanelGroup>
      )}

      <PromptModal
        isOpen={promptModal.isOpen}
        title={promptModal.title}
        placeholder={promptModal.placeholder}
        onCancel={() => setPromptModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={(name) => {
          if (promptModal.type === "file") {
            createFileMut.mutate({ filename: name, folderPath: promptModal.path });
          } else {
            createFolderMut.mutate({ name, parentPath: promptModal.path });
          }
          setPromptModal(prev => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
}