import { useState, useCallback, useEffect, useRef } from "react";
import { Excalidraw, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { Save, Share2, Lock, Unlock, X, ZoomIn, Pencil } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface ExcalidrawCanvasProps {
  canvasId: string;
  canvasName?: string;
  viewerId?: string;
  isPublic?: boolean;
  onClose: () => void;
  onSave: (data: { elements: unknown[]; appState: Record<string, unknown> }) => Promise<void>;
  initialData?: { elements?: unknown[]; appState?: Record<string, unknown> };
  viewOnly?: boolean;
  editCanvasId?: string;
}

export function ExcalidrawCanvas({
  canvasId,
  canvasName,
  viewerId,
  isPublic = false,
  onClose,
  onSave,
  initialData,
  viewOnly = false,
  editCanvasId,
}: ExcalidrawCanvasProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<{
    getSceneElements: () => unknown[];
    getAppState: () => Record<string, unknown>;
    scrollToContent: (elements: unknown[], opts?: { fitToContent?: boolean; animate?: boolean }) => void;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareViewLink, setShareViewLink] = useState("");
  const [shareEditLink, setShareEditLink] = useState("");
  const [showControls, setShowControls] = useState(true);
  const hasUnsavedChangesRef = useRef(false);
  const isSavingRef = useRef(false);

  useEffect(() => {
    isSavingRef.current = isSaving;
  }, [isSaving]);

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) return;

    const preventDefaultTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };

    document.addEventListener("touchstart", preventDefaultTouch, { passive: false });
    document.addEventListener("touchmove", preventDefaultTouch, { passive: false });

    return () => {
      document.removeEventListener("touchstart", preventDefaultTouch);
      document.removeEventListener("touchmove", preventDefaultTouch);
    };
  }, []);

  const saveCanvas = useCallback(
    async (showSuccessMessage: boolean) => {
      if (!excalidrawAPI || viewOnly) return;

      try {
        setIsSaving(true);
        const elements = excalidrawAPI.getSceneElements();
        const appState = excalidrawAPI.getAppState();

        const canvasData = {
          elements,
          appState: {
            viewBackgroundColor: appState.viewBackgroundColor,
            currentItemFontFamily: appState.currentItemFontFamily,
            currentItemFontSize: appState.currentItemFontSize,
            currentItemStrokeColor: appState.currentItemStrokeColor,
            currentItemBackgroundColor: appState.currentItemBackgroundColor,
          },
        };

        await onSave(canvasData);
        hasUnsavedChangesRef.current = false;

        if (showSuccessMessage) {
          const successMsg = document.createElement("div");
          successMsg.textContent = "Saved";
          successMsg.className =
            "fixed top-1/2 left-1/2 z-[9999] -translate-x-1/2 -translate-y-1/2 border-2 border-black bg-white px-8 py-4 text-sm font-bold uppercase tracking-wider shadow-[4px_4px_0_0_#000]";
          document.body.appendChild(successMsg);
          setTimeout(() => successMsg.remove(), 1800);
        }
      } catch {
        alert("Failed to save architecture");
      } finally {
        setIsSaving(false);
      }
    },
    [excalidrawAPI, onSave, viewOnly],
  );

  const handleSave = useCallback(async () => {
    await saveCanvas(true);
  }, [saveCanvas]);

  useEffect(() => {
    if (viewOnly) return;
    const autoSaveInterval = setInterval(async () => {
      if (!hasUnsavedChangesRef.current || isSavingRef.current) return;
      await saveCanvas(false);
    }, 60000);
    return () => clearInterval(autoSaveInterval);
  }, [saveCanvas, viewOnly]);

  const handleShare = () => {
    const baseUrl = window.location.origin;
    setShareViewLink(`${baseUrl}/architecture/${canvasId}`);
    setShareEditLink(`${baseUrl}/architecture/${canvasId}/edit`);
    if (viewerId) {
      setShareViewLink(`${baseUrl}/architecture/view/${viewerId}`);
    }
    setShowShareModal(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const optimizeMobileZoom = useCallback(() => {
    if (!excalidrawAPI) return;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) return;
    try {
      const elements = excalidrawAPI.getSceneElements();
      if (elements.length > 0) {
        excalidrawAPI.scrollToContent(elements, { fitToContent: true, animate: true });
      }
    } catch {
      /* ignore */
    }
  }, [excalidrawAPI]);

  return (
    <div className="fixed inset-0 z-50 bg-white" onMouseMove={() => setShowControls(true)}>
      <div
        className={`pointer-events-none fixed z-[60] transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"} top-[100px] left-2 flex flex-col items-start gap-1.5 md:top-4 md:left-4 md:right-4 md:flex-row md:items-center md:justify-between`}
      >
        <div className="pointer-events-auto flex flex-col items-start gap-1.5 md:flex-row md:items-center md:gap-2 md:rounded-none md:border-2 md:border-black md:bg-white/95 md:p-2 md:shadow-[4px_4px_0_0_#000]">
          <button
            type="button"
            onClick={onClose}
            className="border-2 border-black bg-white/95 p-1.5 shadow-md backdrop-blur-sm transition-all hover:bg-[#FFF8F0] md:p-2"
            title="Close"
          >
            <X size={18} strokeWidth={2.5} />
          </button>

          {canvasName && (
            <span className="hidden max-w-[200px] truncate border-2 border-black bg-[#FFF8F0] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8B4513] md:inline">
              {canvasName}
            </span>
          )}

          <button
            type="button"
            onClick={optimizeMobileZoom}
            className="border-2 border-black bg-white/95 p-1.5 shadow-md backdrop-blur-sm md:hidden"
            title="Fit to screen"
          >
            <ZoomIn size={18} strokeWidth={2.5} />
          </button>

          <div
            className={`flex items-center justify-center border-2 border-black p-1.5 shadow-md backdrop-blur-sm md:px-3 md:py-1.5 ${
              viewOnly ? "bg-red-50" : isPublic ? "bg-emerald-50" : "bg-[#FFF8F0]"
            }`}
          >
            {viewOnly ? (
              <>
                <Lock size={18} className="text-red-700" strokeWidth={2.5} />
                <span className="ml-2 hidden text-xs font-bold uppercase tracking-wider text-red-700 md:inline">
                  View only
                </span>
              </>
            ) : isPublic ? (
              <>
                <Unlock size={18} className="text-emerald-700" strokeWidth={2.5} />
                <span className="ml-2 hidden text-xs font-bold uppercase tracking-wider text-emerald-700 md:inline">
                  Public
                </span>
              </>
            ) : (
              <>
                <Lock size={18} strokeWidth={2.5} />
                <span className="ml-2 hidden text-xs font-bold uppercase tracking-wider md:inline">Private</span>
              </>
            )}
          </div>
        </div>

        <div className="pointer-events-auto flex flex-col items-stretch gap-1.5 md:flex-row md:items-center md:gap-2 md:border-2 md:border-black md:bg-white/95 md:p-2 md:shadow-[4px_4px_0_0_#000]">
          {viewOnly && editCanvasId && (
            <Link
              to="/architecture/$canvasId/edit"
              params={{ canvasId: editCanvasId }}
              className="flex items-center justify-center gap-2 border-2 border-black bg-[#8B4513] p-1.5 text-white shadow-md transition-all hover:bg-black md:px-4 md:py-2"
              title="Edit architecture"
            >
              <Pencil size={18} strokeWidth={2.5} />
              <span className="hidden text-xs font-bold uppercase tracking-wider md:inline">Edit</span>
            </Link>
          )}

          {!viewOnly && (
            <>
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center justify-center gap-2 border-2 border-black bg-white p-1.5 font-bold shadow-md transition-all hover:bg-[#FFF8F0] md:px-4 md:py-2"
                title="Share links"
              >
                <Share2 size={18} strokeWidth={2.5} />
                <span className="hidden text-xs uppercase tracking-wider md:inline">Share</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 border-2 border-black bg-black p-1.5 font-bold text-white shadow-md transition-all hover:bg-[#8B4513] disabled:opacity-50 md:px-4 md:py-2"
                title="Save"
              >
                <Save size={18} strokeWidth={2.5} />
                <span className="hidden text-xs uppercase tracking-wider md:inline">{isSaving ? "Saving…" : "Save"}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {viewOnly && (
        <div className="pointer-events-none fixed left-1/2 top-20 z-[60] -translate-x-1/2 border-2 border-black bg-[#FFF8F0] px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8B4513] shadow-[3px_3px_0_0_#000]">
          View only
        </div>
      )}

      <div
        className="absolute inset-0 z-10"
        style={{ touchAction: "none", userSelect: "none" }}
      >
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          initialData={initialData}
          onChange={() => {
            if (!viewOnly) hasUnsavedChangesRef.current = true;
          }}
          viewModeEnabled={viewOnly}
          zenModeEnabled={false}
          gridModeEnabled={false}
          theme="light"
        >
          <MainMenu>
            <MainMenu.DefaultItems.ClearCanvas />
            <MainMenu.DefaultItems.SaveAsImage />
            <MainMenu.DefaultItems.ChangeCanvasBackground />
          </MainMenu>
          <WelcomeScreen>
            <WelcomeScreen.Hints.MenuHint />
            <WelcomeScreen.Hints.ToolbarHint />
          </WelcomeScreen>
        </Excalidraw>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg border-2 border-black bg-[#FFF8F0] p-5 shadow-[8px_8px_0_0_#000]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-[#8B4513]">Share architecture</h3>
              <button type="button" onClick={() => setShowShareModal(false)} className="p-1 hover:bg-black/5">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/60">View link</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input readOnly value={shareViewLink} className="flex-1 border-2 border-black bg-white px-3 py-2 font-mono text-xs" />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(shareViewLink)}
                    className="border-2 border-black bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#8B4513]"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/60">Edit link (password required)</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input readOnly value={shareEditLink} className="flex-1 border-2 border-black bg-white px-3 py-2 font-mono text-xs" />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(shareEditLink)}
                    className="border-2 border-black bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#8B4513]"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
