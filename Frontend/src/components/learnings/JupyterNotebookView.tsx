import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Play,
  RotateCcw,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderPlus,
  FilePlus,
  Save,
  Download,
  Upload,
  Maximize2,
  Minimize2,
  Code2,
  FileText,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  Search,
  RefreshCw,
  FolderOpen,
  Sparkles,
  AlertCircle,
  Terminal,
  ExternalLink,
  Printer
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { config } from "@/config/config";
import { JupyterIcon } from "./JupyterIcon";
import { runPythonCode, PythonExecutionResult } from "./pyodideRunner";
import { PremiumLoaderFullScreen } from "./PremiumLoader";
import { PromptModal } from "../ui/PromptModal";

const API_BASE_URL = config.apiUrl;

// ── Standard Jupyter Notebook Interface ──────────────────────────────────────
export interface NotebookCell {
  id: string;
  cell_type: "code" | "markdown";
  source: string;
  execution_count: number | null;
  outputs: Array<{
    output_type: string;
    text?: string | string[];
    data?: Record<string, any>;
    name?: string;
    ename?: string;
    evalue?: string;
    traceback?: string[];
  }>;
  isRunning?: boolean;
}

export interface JupyterNotebook {
  cells: NotebookCell[];
  metadata: {
    language_info?: {
      name: string;
      version?: string;
    };
    orig_nbformat?: number;
    [key: string]: any;
  };
  nbformat: number;
  nbformat_minor: number;
}

const DEFAULT_STARTER_NOTEBOOK: JupyterNotebook = {
  cells: [
    {
      id: "c1",
      cell_type: "markdown",
      source:
        "# 🪐 Interactive Jupyter Notebook\n\nWelcome to your browser-powered **Jupyter Notebook**! Runs Python directly with full support for loops, functions, data structures, and prints.\n\n- Click **▶ Run** or press **Shift + Enter** to execute cells.\n- Click **+ Code** or **+ Markdown** to insert cells.\n- Changes are synchronized to **Azure Blob Storage** and maintained in **MongoDB**.",
      execution_count: null,
      outputs: []
    },
    {
      id: "c2",
      cell_type: "code",
      source:
        "# Let's test Python calculations\nimport math\n\nprint('Python environment ready! 🚀')\nfact = math.factorial(6)\nprint(f'Calculated factorial of 6: {fact}')\nfact",
      execution_count: 1,
      outputs: [
        {
          name: "stdout",
          output_type: "stream",
          text: "Python environment ready! 🚀\nCalculated factorial of 6: 720\n"
        }
      ]
    },
    {
      id: "c3",
      cell_type: "markdown",
      source: "### 📊 Data Processing & Analysis"
    },
    {
      id: "c4",
      cell_type: "code",
      source:
        "numbers = list(range(1, 11))\nsquares = [x**2 for x in numbers]\n\nprint('Numbers:', numbers)\nprint('Sum:', sum(numbers))\nprint('Average:', sum(numbers) / len(numbers))\nprint('Squares:', squares)",
      execution_count: 2,
      outputs: [
        {
          name: "stdout",
          output_type: "stream",
          text:
            "Numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\nSum: 55\nAverage: 5.5\nSquares: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]\n"
        }
      ]
    }
  ],
  metadata: {
    language_info: {
      name: "python",
      version: "3.11"
    }
  },
  nbformat: 4,
  nbformat_minor: 5
};

function parseNotebookContent(rawContent: string): JupyterNotebook {
  if (!rawContent || !rawContent.trim()) {
    return DEFAULT_STARTER_NOTEBOOK;
  }
  try {
    const parsed = JSON.parse(rawContent);
    if (parsed && Array.isArray(parsed.cells)) {
      return {
        ...parsed,
        cells: parsed.cells.map((cell: any, idx: number) => ({
          ...cell,
          id: cell.id || `cell_${idx}_${Date.now()}`,
          source: Array.isArray(cell.source) ? cell.source.join("") : cell.source || "",
          outputs: Array.isArray(cell.outputs) ? cell.outputs : []
        }))
      };
    }
  } catch (e) {
    console.warn("Failed to parse notebook JSON, returning starter template:", e);
  }
  return DEFAULT_STARTER_NOTEBOOK;
}

function serializeNotebook(notebook: JupyterNotebook): string {
  const exportable = {
    cells: notebook.cells.map(c => ({
      cell_type: c.cell_type,
      metadata: {},
      execution_count: c.cell_type === "code" ? c.execution_count : undefined,
      outputs: c.cell_type === "code" ? c.outputs : undefined,
      source: c.source.split("\n").map((line, i, arr) => (i < arr.length - 1 ? line + "\n" : line))
    })),
    metadata: notebook.metadata || {
      language_info: { name: "python", version: "3.11" }
    },
    nbformat: notebook.nbformat || 4,
    nbformat_minor: notebook.nbformat_minor || 5
  };
  return JSON.stringify(exportable, null, 2);
}

// ── API Fetchers ─────────────────────────────────────────────────────────────
async function fetchFolders(parentPath = "") {
  const params = new URLSearchParams({ parentPath, source: "ipynb" });
  const res = await fetch(`${API_BASE_URL}/apps/coding/folders?${params}`);
  if (!res.ok) throw new Error("Failed to fetch folders");
  return (await res.json()).folders || [];
}

async function fetchNotebookFiles(folderPath = "") {
  const res = await fetch(
    `${API_BASE_URL}/apps/coding/files?folderPath=${encodeURIComponent(folderPath)}&extension=ipynb`
  );
  if (!res.ok) throw new Error("Failed to fetch files");
  return (await res.json()).files || [];
}

export function JupyterNotebookView() {
  const queryClient = useQueryClient();

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Folder & File navigation state
  const [currentFolderPath, setCurrentFolderPath] = useState("");
  const [currentFolderName, setCurrentFolderName] = useState("Root");
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [searchFilter, setSearchFilter] = useState("");

  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [activeFileName, setActiveFileName] = useState("Notebook.ipynb");
  const [promptModal, setPromptModal] = useState<{
    isOpen: boolean;
    title: string;
    placeholder: string;
    initialValue: string;
    type: "notebook" | "folder";
  }>({ isOpen: false, title: "", placeholder: "", initialValue: "", type: "notebook" });
  const [notebook, setNotebook] = useState<JupyterNotebook>(DEFAULT_STARTER_NOTEBOOK);
  const [activeCellId, setActiveCellId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [kernelStatus, setKernelStatus] = useState<"idle" | "busy" | "ready">("ready");
  const [selectedEngine, setSelectedEngine] = useState<"pyodide" | "server">("pyodide");
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Editing markdown state
  const [editingMarkdownId, setEditingMarkdownId] = useState<string | null>(null);

  // Load root folders
  const { data: rootFolders = [], isLoading: loadingFolders } = useQuery({
    queryKey: ["notebook-folders-root"],
    queryFn: () => fetchFolders(""),
    staleTime: 15_000
  });

  // Load notebook files for current folder
  const { data: folderFiles = [], isLoading: loadingFiles, refetch: refetchFiles } = useQuery({
    queryKey: ["notebook-files", currentFolderPath],
    queryFn: () => fetchNotebookFiles(currentFolderPath),
    staleTime: 15_000
  });

  // When files load, if none active, pick first or prompt
  useEffect(() => {
    if (!activeFileId && folderFiles.length > 0) {
      const first = folderFiles[0];
      selectNotebook(first);
    }
  }, [folderFiles]);

  const selectNotebook = (file: any) => {
    setActiveFileId(file.fileId);
    setActiveFileName(file.filename);
    const parsed = parseNotebookContent(file.content);
    setNotebook(parsed);
    if (parsed.cells.length > 0) {
      setActiveCellId(parsed.cells[0].id);
    }
    setIsSaved(true);
  };

  // ── Save Notebook mutation (Blob Storage + MongoDB) ─────────────────────────
  const saveNotebookMut = useMutation({
    mutationFn: async () => {
      setIsSaving(true);
      const content = serializeNotebook(notebook);

      if (activeFileId) {
        // Update existing file in Azure Blob + MongoDB
        const res = await fetch(`${API_BASE_URL}/apps/coding/file/update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileId: activeFileId,
            filename: activeFileName,
            folderPath: currentFolderPath,
            content
          })
        });
        if (!res.ok) throw new Error("Failed to save notebook");
        return await res.json();
      } else {
        // Create new notebook file in Azure Blob + MongoDB
        const res = await fetch(`${API_BASE_URL}/apps/coding/file/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: activeFileName.endsWith(".ipynb") ? activeFileName : `${activeFileName}.ipynb`,
            folderPath: currentFolderPath,
            content,
            language: "ipynb"
          })
        });
        if (!res.ok) throw new Error("Failed to create notebook");
        const data = await res.json();
        if (data.file?.fileId) {
          setActiveFileId(data.file.fileId);
        }
        return data;
      }
    },
    onSuccess: () => {
      setIsSaving(false);
      setIsSaved(true);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 2500);
      queryClient.invalidateQueries({ queryKey: ["notebook-files", currentFolderPath] });
    },
    onError: (err: any) => {
      setIsSaving(false);
      alert(`Save failed: ${err.message}`);
    }
  });

  // ── Autosave ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isSaved || !activeFileId || isSaving) return;

    const timer = setTimeout(() => {
      saveNotebookMut.mutate();
    }, 2500);

    return () => clearTimeout(timer);
  }, [notebook, isSaved, activeFileId, isSaving]);

  // ── Create New Notebook (.ipynb) ───────────────────────────────────────────
  const createNotebookMut = useMutation({
    mutationFn: async (name: string) => {
      const cleanName = name.trim().endsWith(".ipynb") ? name.trim() : `${name.trim()}.ipynb`;
      const initialJson = serializeNotebook(DEFAULT_STARTER_NOTEBOOK);

      const res = await fetch(`${API_BASE_URL}/apps/coding/file/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: cleanName,
          folderPath: currentFolderPath,
          content: initialJson,
          language: "ipynb"
        })
      });
      if (!res.ok) throw new Error("Failed to create notebook");
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notebook-files", currentFolderPath] });
      if (data?.file) {
        selectNotebook(data.file);
      }
    },
    onError: (err: any) => alert(`Error creating notebook: ${err.message}`)
  });

  // ── Create New Folder ──────────────────────────────────────────────────────
  const createFolderMut = useMutation({
    mutationFn: async (folderName: string) => {
      const res = await fetch(`${API_BASE_URL}/apps/coding/folder/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: folderName.trim(),
          parentPath: currentFolderPath,
          source: "ipynb"
        })
      });
      if (!res.ok) throw new Error("Failed to create folder");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebook-folders-root"] });
      queryClient.invalidateQueries({ queryKey: ["notebook-folders-sub"] });
    },
    onError: (err: any) => alert(`Error creating folder: ${err.message}`)
  });

  // ── Delete File ────────────────────────────────────────────────────────────
  const deleteFileMut = useMutation({
    mutationFn: async (fileId: string) => {
      const res = await fetch(`${API_BASE_URL}/apps/coding/file/${fileId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete notebook");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebook-files", currentFolderPath] });
      if (activeFileId) {
        setActiveFileId(null);
        setNotebook(DEFAULT_STARTER_NOTEBOOK);
      }
    }
  });

  // ── Delete Folder ──────────────────────────────────────────────────────────
  const deleteFolderMut = useMutation({
    mutationFn: async (folderId: string) => {
      const res = await fetch(`${API_BASE_URL}/apps/coding/folder/${folderId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete folder");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebook-folders-root"] });
      setCurrentFolderPath("");
      setCurrentFolderName("Root");
    }
  });

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveNotebookMut.mutate();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [notebook, activeFileName, activeFileId, currentFolderPath]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      try {
        if (containerRef.current?.requestFullscreen) {
          containerRef.current.requestFullscreen();
        }
      } catch (e) {
        // Fallback to css fixed full viewport
      }
    } else {
      setIsFullscreen(false);
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      } catch (e) {
        // Fallback
      }
    }
  };

  // Sync fullscreen change from browser ESC key
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // ── Cell operations ────────────────────────────────────────────────────────
  const updateCellSource = (id: string, source: string) => {
    setNotebook(prev => ({
      ...prev,
      cells: prev.cells.map(c => (c.id === id ? { ...c, source } : c))
    }));
    setIsSaved(false);
  };

  const addCell = (type: "code" | "markdown", afterId?: string) => {
    const newCell: NotebookCell = {
      id: `cell_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      cell_type: type,
      source: type === "code" ? "# New Python Code Cell\n" : "### Markdown Note\nDouble click to edit.",
      execution_count: null,
      outputs: []
    };

    setNotebook(prev => {
      if (!afterId) {
        return { ...prev, cells: [...prev.cells, newCell] };
      }
      const idx = prev.cells.findIndex(c => c.id === afterId);
      if (idx === -1) return { ...prev, cells: [...prev.cells, newCell] };
      const next = [...prev.cells];
      next.splice(idx + 1, 0, newCell);
      return { ...prev, cells: next };
    });
    setActiveCellId(newCell.id);
    if (type === "markdown") {
      setEditingMarkdownId(newCell.id);
    }
    setIsSaved(false);
  };

  const deleteCell = (id: string) => {
    setNotebook(prev => {
      if (prev.cells.length <= 1) {
        alert("A notebook must have at least one cell.");
        return prev;
      }
      return { ...prev, cells: prev.cells.filter(c => c.id !== id) };
    });
    setIsSaved(false);
  };

  const moveCell = (id: string, direction: "up" | "down") => {
    setNotebook(prev => {
      const idx = prev.cells.findIndex(c => c.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.cells.length) return prev;
      const copy = [...prev.cells];
      const [item] = copy.splice(idx, 1);
      copy.splice(targetIdx, 0, item);
      return { ...prev, cells: copy };
    });
    setIsSaved(false);
  };

  const changeCellType = (id: string, type: "code" | "markdown") => {
    setNotebook(prev => ({
      ...prev,
      cells: prev.cells.map(c => (c.id === id ? { ...c, cell_type: type, outputs: [] } : c))
    }));
    setIsSaved(false);
  };

  const clearOutputs = () => {
    setNotebook(prev => ({
      ...prev,
      cells: prev.cells.map(c => ({ ...c, outputs: [], execution_count: null }))
    }));
    setIsSaved(false);
  };

  // ── Run Cell Execution ─────────────────────────────────────────────────────
  const runCell = async (cellId: string) => {
    const targetCell = notebook.cells.find(c => c.id === cellId);
    if (!targetCell) return;

    if (targetCell.cell_type === "markdown") {
      setEditingMarkdownId(null);
      return;
    }

    setKernelStatus("busy");
    setNotebook(prev => ({
      ...prev,
      cells: prev.cells.map(c => (c.id === cellId ? { ...c, isRunning: true } : c))
    }));

    try {
      const executionResult: PythonExecutionResult = await runPythonCode(targetCell.source, selectedEngine);

      // Determine next execution count
      const highestCount = notebook.cells.reduce(
        (max, c) => Math.max(max, c.execution_count || 0),
        0
      );
      const nextCount = highestCount + 1;

      const outputs: any[] = [];
      if (executionResult.stdout) {
        outputs.push({
          output_type: "stream",
          name: "stdout",
          text: executionResult.stdout
        });
      }
      if (executionResult.result) {
        outputs.push({
          output_type: "execute_result",
          data: { "text/plain": executionResult.result },
          execution_count: nextCount
        });
      }
      if (executionResult.error || executionResult.stderr) {
        outputs.push({
          output_type: "error",
          ename: "ExecutionError",
          evalue: executionResult.error || executionResult.stderr,
          traceback: [executionResult.stderr || executionResult.error || ""]
        });
      }

      setNotebook(prev => ({
        ...prev,
        cells: prev.cells.map(c =>
          c.id === cellId
            ? {
                ...c,
                isRunning: false,
                execution_count: nextCount,
                outputs
              }
            : c
        )
      }));
      setIsSaved(false);
    } catch (err: any) {
      setNotebook(prev => ({
        ...prev,
        cells: prev.cells.map(c =>
          c.id === cellId
            ? {
                ...c,
                isRunning: false,
                outputs: [
                  {
                    output_type: "error",
                    ename: "Error",
                    evalue: err?.message || String(err),
                    traceback: [err?.message || String(err)]
                  }
                ]
              }
            : c
        )
      }));
    } finally {
      setKernelStatus("ready");
    }
  };

  // Run all cells sequentially
  const runAllCells = async () => {
    for (const cell of notebook.cells) {
      if (cell.cell_type === "code") {
        await runCell(cell.id);
      }
    }
  };

  // ── Download .ipynb ────────────────────────────────────────────────────────
  const handleDownload = () => {
    const jsonStr = serializeNotebook(notebook);
    const blob = new Blob([jsonStr], { type: "application/x-ipynb+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeFileName.endsWith(".ipynb") ? activeFileName : `${activeFileName}.ipynb`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Upload local .ipynb file ───────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      const parsed = parseNotebookContent(content);
      const filename = file.name.endsWith(".ipynb") ? file.name : `${file.name}.ipynb`;

      // Upload to Azure Blob + MongoDB
      try {
        const res = await fetch(`${API_BASE_URL}/apps/coding/file/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename,
            folderPath: currentFolderPath,
            content,
            language: "ipynb"
          })
        });
        const data = await res.json();
        queryClient.invalidateQueries({ queryKey: ["notebook-files", currentFolderPath] });
        if (data?.file) {
          selectNotebook(data.file);
        } else {
          setActiveFileName(filename);
          setNotebook(parsed);
          setIsSaved(false);
        }
      } catch (err) {
        setActiveFileName(filename);
        setNotebook(parsed);
        setIsSaved(false);
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = "";
  };

  // Filtered files for search
  const filteredFiles = folderFiles.filter((f: any) =>
    f.filename.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div
      ref={containerRef}
      className={`flex h-full w-full font-sans antialiased ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-[#f1f3f5] w-screen h-screen flex flex-col"
          : "bg-[#f1f3f5] text-slate-800"
      }`}
    >
      {/* ── LEFT SIDEBAR: FOLDERS & NOTEBOOKS EXPLORER (Light Gray Theme) ── */}
      <div className="w-64 bg-[#f8fafc] border-r border-[#e2e8f0] flex flex-col shrink-0 select-none shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
        {/* Header */}
        <div className="px-3.5 py-3 border-b border-[#e2e8f0] flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-2">
            <JupyterIcon className="h-4 w-4 text-[#f37626]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Notebooks
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              title="New Notebook in folder"
              onClick={() => setPromptModal({ isOpen: true, title: "Create Notebook", placeholder: "Notebook name", initialValue: "analysis.ipynb", type: "notebook" })}
              className="p-1 rounded-none text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors"
            >
              <FilePlus className="h-3.5 w-3.5" />
            </button>
            <button
              title="New Folder"
              onClick={() => setPromptModal({ isOpen: true, title: "Create Folder", placeholder: "Folder name", initialValue: "", type: "folder" })}
              className="p-1 rounded-none text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors"
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </button>
            <button
              title="Refresh"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["notebook-folders-root"] });
                queryClient.invalidateQueries({ queryKey: ["notebook-files", currentFolderPath] });
              }}
              className="p-1 rounded-none text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-2 border-b border-[#e2e8f0] bg-white/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search notebooks..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full bg-white border border-[#e2e8f0] pl-8 pr-2.5 py-1 text-xs rounded-none text-slate-700 placeholder-slate-400 outline-none focus:border-[#f37626] focus:ring-1 focus:ring-[#f37626]/20 transition-all"
            />
          </div>
        </div>

        {/* Storage Location Badge */}
        <div className="px-3 py-1.5 bg-slate-100/70 border-b border-[#e2e8f0] text-[10px] text-slate-500 flex items-center justify-between">
          <span className="truncate">
            Location: <strong className="text-slate-700">{currentFolderName}</strong>
          </span>
          {currentFolderPath && (
            <button
              onClick={() => {
                setCurrentFolderPath("");
                setCurrentFolderName("Root");
              }}
              className="text-[#f37626] hover:underline font-medium"
            >
              Go Root
            </button>
          )}
        </div>

        {/* Folder List & Files */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* Folders */}
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1 pt-1">
            Folders
          </div>
          {loadingFolders ? (
            <div className="py-2 text-center text-xs text-slate-400">Loading folders...</div>
          ) : rootFolders.length === 0 ? (
            <div className="text-[11px] text-slate-400 italic px-2 py-1">No custom folders yet</div>
          ) : (
            rootFolders.map((folder: any) => {
              const isSelected = currentFolderPath === folder.path;
              return (
                <div
                  key={folder.folderId}
                  onClick={() => {
                    setCurrentFolderPath(folder.path);
                    setCurrentFolderName(folder.name);
                  }}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-none text-xs cursor-pointer group transition-colors ${
                    isSelected
                      ? "bg-orange-100/70 text-[#ea580c] font-medium"
                      : "text-slate-600 hover:bg-slate-200/50"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Folder className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-[#ea580c]" : "text-amber-500"}`} />
                    <span className="truncate">{folder.name}</span>
                  </div>
                </div>
              );
            })
          )}

          {/* Files Header */}
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1 pt-3">
            .ipynb Files ({filteredFiles.length})
          </div>

          {loadingFiles ? (
            <div className="py-4 text-center text-xs text-slate-400">Loading notebooks...</div>
          ) : filteredFiles.length === 0 ? (
            <div className="px-2 py-3 text-center">
              <p className="text-[11px] text-slate-400 italic mb-2">No notebooks in this folder</p>
              <button
                onClick={() => setPromptModal({ isOpen: true, title: "Create Notebook", placeholder: "Notebook name", initialValue: "analysis.ipynb", type: "notebook" })}
                className="text-xs bg-[#f37626]/10 text-[#ea580c] hover:bg-[#f37626]/20 font-medium px-2.5 py-1 rounded-none transition-colors inline-flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Create Notebook
              </button>
            </div>
          ) : (
            filteredFiles.map((file: any) => {
              const isSelected = activeFileId === file.fileId;
              return (
                <div
                  key={file.fileId}
                  onClick={() => selectNotebook(file)}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-none text-xs cursor-pointer group transition-all ${
                    isSelected
                      ? "bg-white text-slate-900 font-semibold shadow-xs border border-[#e2e8f0] border-l-2 border-l-[#f37626]"
                      : "text-slate-600 hover:bg-slate-200/50"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <JupyterIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{file.filename}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Upload Section */}
        <div className="p-3 border-t border-[#e2e8f0] bg-white/70">
          <label className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-none border border-dashed border-slate-300 hover:border-[#f37626] bg-slate-50 hover:bg-orange-50/50 text-slate-600 hover:text-[#ea580c] cursor-pointer text-xs font-medium transition-all">
            <Upload className="h-3.5 w-3.5" />
            <span>Upload .ipynb</span>
            <input
              type="file"
              accept=".ipynb,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* ── RIGHT MAIN WORKSPACE: NOTEBOOK CANVAS (Premium Light Theme) ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f1f3f5]">
        {/* Top Notebook Toolbar */}
        <header className="h-13 bg-white border-b border-[#e2e8f0] px-4 flex items-center justify-between shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.03)] z-10">
          {/* Left Title and status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <JupyterIcon className="h-5 w-5 text-[#f37626]" />
              <input
                type="text"
                value={activeFileName}
                onChange={e => {
                  setActiveFileName(e.target.value);
                  setIsSaved(false);
                }}
                className="font-semibold text-slate-800 text-sm bg-transparent hover:bg-slate-100 focus:bg-white px-2 py-0.5 rounded-none border border-transparent hover:border-slate-200 focus:border-slate-300 outline-none transition-all"
                title="Click to rename notebook"
              />
            </div>

            {/* Save Status Badge */}
            {isSaving ? (
              <span className="text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <RefreshCw className="h-2.5 w-2.5 animate-spin" /> Saving...
              </span>
            ) : saveSuccessNotice ? (
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="h-2.5 w-2.5" /> Saved to Blob & Mongo
              </span>
            ) : !isSaved ? (
              <span className="text-[11px] font-medium text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                Unsaved changes
              </span>
            ) : (
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Saved
              </span>
            )}
          </div>

          {/* Center / Right Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Kernel Selector */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-none px-2 py-1 mr-1 border border-slate-200">
              <Terminal className="h-3.5 w-3.5 text-slate-500" />
              <select
                value={selectedEngine}
                onChange={(e) => setSelectedEngine(e.target.value as "pyodide" | "server")}
                className="bg-transparent text-xs font-medium text-slate-700 outline-none cursor-pointer"
                title="Select execution kernel"
              >
                <option value="pyodide">Browser (Pyodide)</option>
                <option value="server">Server (Node.js)</option>
              </select>
            </div>

            {/* Run All */}
            <button
              onClick={runAllCells}
              title="Run all notebook cells"
              className="px-2.5 py-1.5 rounded-none bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Play className="h-3 w-3 text-emerald-600 fill-emerald-600" />
              <span>Run All</span>
            </button>

            {/* Restart / Clear */}
            <button
              onClick={clearOutputs}
              title="Clear all outputs"
              className="p-1.5 rounded-none hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            {/* Add Code Cell */}
            <button
              onClick={() => addCell("code", activeCellId || undefined)}
              title="Insert Code Cell below"
              className="px-2.5 py-1.5 rounded-none border border-[#e2e8f0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors shadow-xs"
            >
              <Code2 className="h-3.5 w-3.5 text-blue-600" />
              <span>+ Code</span>
            </button>

            {/* Add Markdown Cell */}
            <button
              onClick={() => addCell("markdown", activeCellId || undefined)}
              title="Insert Markdown Cell below"
              className="px-2.5 py-1.5 rounded-none border border-[#e2e8f0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors shadow-xs"
            >
              <FileText className="h-3.5 w-3.5 text-slate-500" />
              <span>+ Text</span>
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            {/* Save Button */}
            <button
              onClick={() => saveNotebookMut.mutate()}
              disabled={isSaving}
              title="Save to Azure Blob Storage & MongoDB (Ctrl+S)"
              className="px-3 py-1.5 rounded-none bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save</span>
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              title="Download as standard .ipynb file"
              className="p-1.5 rounded-none hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Download className="h-4 w-4" />
            </button>

            {/* Print/Download as PDF */}
            <button
              onClick={() => window.print()}
              title="Save as PDF (Print)"
              className="p-1.5 rounded-none hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Printer className="h-4 w-4" />
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Full Screen Mode"}
              className="p-1.5 rounded-none hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4 text-[#ea580c]" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </header>

        {/* Notebook Cells Container (Centered Document Sheet) */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="w-full max-w-none space-y-4 pb-20">
            {/* Top document breadcrumb & info bar */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span className="flex items-center gap-1.5">
                <span>{currentFolderName}</span>
                <span>/</span>
                <strong className="text-slate-700">{activeFileName}</strong>
              </span>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      kernelStatus === "busy"
                        ? "bg-amber-500 animate-ping"
                        : "bg-emerald-500"
                    }`}
                  />
                  <span className="text-[11px] font-mono text-slate-600">
                    Python 3 (Pyodide WASM / Kernel)
                  </span>
                </span>
              </div>
            </div>

            {/* Render Cells */}
            {notebook.cells.map((cell, index) => {
              const isActive = activeCellId === cell.id;
              const isMarkdownEditing = editingMarkdownId === cell.id;

              return (
                <div
                  key={cell.id}
                  onClick={() => setActiveCellId(cell.id)}
                  className={`group relative rounded-none border transition-all duration-150 ${
                    isActive
                      ? "border-blue-400 ring-2 ring-blue-500/15 shadow-sm bg-white"
                      : "border-[#e2e8f0] hover:border-[#cbd5e1] bg-white shadow-xs"
                  }`}
                >
                  {/* Left Active Accent Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-[#f37626]" />
                  )}

                  {/* Cell Header / Quick Controls on Hover */}
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 text-[11px] text-slate-400 bg-slate-50/50 rounded-t-xl">
                    <div className="flex items-center gap-2">
                      <select
                        value={cell.cell_type}
                        onChange={e => changeCellType(cell.id, e.target.value as any)}
                        className="bg-transparent font-medium text-slate-600 border-none outline-none cursor-pointer hover:text-slate-900"
                      >
                        <option value="code">Code</option>
                        <option value="markdown">Markdown</option>
                      </select>

                      <span className="text-slate-300">|</span>

                      <span className="font-mono text-[10px] text-slate-400">
                        Cell #{index + 1}
                      </span>
                    </div>

                    {/* Cell Actions Toolbar */}
                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      {cell.cell_type === "code" && (
                        <button
                          onClick={() => runCell(cell.id)}
                          disabled={cell.isRunning}
                          title="Execute Cell (Shift+Enter)"
                          className="px-2 py-0.5 rounded-none bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[10px] flex items-center gap-1"
                        >
                          {cell.isRunning ? (
                            <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                          ) : (
                            <Play className="h-2.5 w-2.5 fill-emerald-600" />
                          )}
                          <span>Run</span>
                        </button>
                      )}

                      {cell.cell_type === "markdown" && !isMarkdownEditing && (
                        <button
                          onClick={() => setEditingMarkdownId(cell.id)}
                          className="px-2 py-0.5 rounded-none bg-slate-100 text-slate-700 hover:bg-slate-200 text-[10px]"
                        >
                          Edit
                        </button>
                      )}

                      {cell.cell_type === "markdown" && isMarkdownEditing && (
                        <button
                          onClick={() => setEditingMarkdownId(null)}
                          className="px-2 py-0.5 rounded-none bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-[10px]"
                        >
                          Render
                        </button>
                      )}

                      <button
                        onClick={() => moveCell(cell.id, "up")}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1 rounded-none hover:bg-slate-100 text-slate-500 disabled:opacity-20"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>

                      <button
                        onClick={() => moveCell(cell.id, "down")}
                        disabled={index === notebook.cells.length - 1}
                        title="Move Down"
                        className="p-1 rounded-none hover:bg-slate-100 text-slate-500 disabled:opacity-20"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>

                      <button
                        onClick={() => deleteCell(cell.id)}
                        title="Delete Cell"
                        className="p-1 rounded-none hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* ── Cell Body ── */}
                  <div className="p-3">
                    {/* CODE CELL */}
                    {cell.cell_type === "code" && (
                      <div className="flex gap-3">
                        {/* Prompt gutter */}
                        <div className="w-14 shrink-0 flex flex-col items-start pt-1">
                          <span className="font-mono text-xs font-semibold text-blue-600 select-none">
                            {cell.isRunning
                              ? "In [*]:"
                              : cell.execution_count !== null
                              ? `In [${cell.execution_count}]:`
                              : "In [ ]:"}
                          </span>
                        </div>

                        {/* Code Editor Area */}
                        <div className="flex-1">
                          <div className="rounded-none border border-[#e2e8f0] bg-[#f8fafc] overflow-hidden focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400/20 transition-all">
                            <textarea
                              value={cell.source}
                              onChange={e => updateCellSource(cell.id, e.target.value)}
                              onKeyDown={e => {
                                if (e.key === "Enter" && e.shiftKey) {
                                  e.preventDefault();
                                  runCell(cell.id);
                                }
                              }}
                              rows={Math.max(2, cell.source.split("\n").length)}
                              className="w-full bg-transparent px-3 py-2 text-xs font-mono text-slate-900 resize-none outline-none leading-relaxed"
                              placeholder="Type Python code here..."
                              spellCheck={false}
                            />
                          </div>

                          {/* Cell Output Area */}
                          {cell.outputs && cell.outputs.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-slate-100 flex gap-3">
                              <div className="w-14 shrink-0 select-none text-right pr-2">
                                <span className="font-mono text-xs font-semibold text-[#ea580c]">
                                  {cell.execution_count !== null
                                    ? `Out [${cell.execution_count}]:`
                                    : "Out [ ]:"}
                                </span>
                              </div>

                              <div className="flex-1 overflow-x-auto space-y-2">
                                {cell.outputs.map((out, outIdx) => {
                                  if (out.output_type === "stream") {
                                    return (
                                      <pre
                                        key={outIdx}
                                        className="bg-[#f8fafc] border border-slate-200 text-slate-800 p-2.5 rounded-none text-xs font-mono whitespace-pre-wrap leading-relaxed"
                                      >
                                        {Array.isArray(out.text) ? out.text.join("") : out.text}
                                      </pre>
                                    );
                                  }

                                  if (out.output_type === "execute_result" && out.data) {
                                    return (
                                      <pre
                                        key={outIdx}
                                        className="bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-none text-xs font-mono whitespace-pre-wrap leading-relaxed"
                                      >
                                        {out.data["text/plain"]}
                                      </pre>
                                    );
                                  }

                                  if (out.output_type === "error") {
                                    return (
                                      <div
                                        key={outIdx}
                                        className="bg-red-50/70 border border-red-200 p-3 rounded-none text-xs font-mono text-red-700 whitespace-pre-wrap leading-relaxed"
                                      >
                                        <div className="font-bold mb-1 flex items-center gap-1.5 text-red-800">
                                          <AlertCircle className="h-3.5 w-3.5" />
                                          {out.ename}: {out.evalue}
                                        </div>
                                        {out.traceback && (
                                          <div>{out.traceback.join("\n")}</div>
                                        )}
                                      </div>
                                    );
                                  }

                                  return null;
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* MARKDOWN CELL */}
                    {cell.cell_type === "markdown" && (
                      <div className="px-2 py-1">
                        {isMarkdownEditing ? (
                          <div className="space-y-2">
                            <textarea
                              value={cell.source}
                              onChange={e => updateCellSource(cell.id, e.target.value)}
                              onKeyDown={e => {
                                if (e.key === "Enter" && e.shiftKey) {
                                  e.preventDefault();
                                  setEditingMarkdownId(null);
                                }
                              }}
                              rows={Math.max(3, cell.source.split("\n").length)}
                              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-none p-3 text-xs font-mono text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 leading-relaxed"
                              placeholder="Write Markdown here... (Shift+Enter to render)"
                              autoFocus
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingMarkdownId(null)}
                                className="px-3 py-1 rounded-none bg-[#f37626] hover:bg-[#ea580c] text-white text-xs font-medium"
                              >
                                Done (Render)
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onDoubleClick={() => setEditingMarkdownId(cell.id)}
                            className="prose prose-sm max-w-none text-slate-800 cursor-text py-1"
                            title="Double-click to edit Markdown"
                          >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {cell.source || "_Empty Markdown Cell (double click to edit)_"}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Cell In-Between Insert Divider */}
                  <div className="relative h-2 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="absolute inset-x-0 h-px bg-slate-200" />
                    <div className="relative z-10 flex items-center gap-2 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addCell("code", cell.id);
                        }}
                        className="text-[10px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <Plus className="h-2.5 w-2.5" /> Code
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addCell("markdown", cell.id);
                        }}
                        className="text-[10px] text-slate-600 hover:text-slate-800 font-medium flex items-center gap-1"
                      >
                        <Plus className="h-2.5 w-2.5" /> Text
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Bottom Add Cell Buttons */}
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                onClick={() => addCell("code")}
                className="px-4 py-2 rounded-none bg-white border border-[#e2e8f0] hover:border-blue-400 hover:bg-blue-50/40 text-blue-600 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Plus className="h-4 w-4" /> Add Code Cell
              </button>
              <button
                onClick={() => addCell("markdown")}
                className="px-4 py-2 rounded-none bg-white border border-[#e2e8f0] hover:border-slate-400 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Plus className="h-4 w-4" /> Add Markdown Cell
              </button>
            </div>
          </div>
        </div>
      </div>

      <PromptModal
        isOpen={promptModal.isOpen}
        title={promptModal.title}
        placeholder={promptModal.placeholder}
        initialValue={promptModal.initialValue}
        onCancel={() => setPromptModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={(name) => {
          if (promptModal.type === "notebook") {
            createNotebookMut.mutate(name);
          } else {
            createFolderMut.mutate(name);
          }
          setPromptModal(prev => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
}

