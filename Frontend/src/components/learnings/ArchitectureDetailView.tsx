import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PremiumLoaderFullScreen } from "./PremiumLoader";
import { ArchitecturePasswordSidebar } from "./ArchitecturePasswordSidebar";
import {
  clearStoredEditPassword,
  fetchDiagram,
  fetchDiagramByViewer,
  getStoredEditPassword,
  saveDiagram,
  setStoredEditPassword,
  verifyDiagramPassword,
  type DiagramScene,
} from "@/lib/architectureApi";

const ExcalidrawCanvas = lazy(() =>
  import("@/components/ExcalidrawCanvas").then((m) => ({ default: m.ExcalidrawCanvas })),
);

interface ArchitectureDetailViewProps {
  canvasId?: string;
  viewerId?: string;
  mode: "view" | "edit";
}

export function ArchitectureDetailView({ canvasId, viewerId, mode }: ArchitectureDetailViewProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sceneData, setSceneData] = useState<DiagramScene | null>(null);
  const [meta, setMeta] = useState<{ canvasId: string; viewerId?: string; name: string; isPublic?: boolean } | null>(null);
  const [editUnlocked, setEditUnlocked] = useState(mode === "view");
  const [sidebarOpen, setSidebarOpen] = useState(mode === "edit");

  const loadDiagram = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = viewerId ? await fetchDiagramByViewer(viewerId) : await fetchDiagram(canvasId!);
      setSceneData(result.data);
      setMeta({
        canvasId: result.canvas.canvasId,
        viewerId: result.canvas.viewerId,
        name: result.canvas.name,
        isPublic: result.canvas.isPublic,
      });
    } catch {
      setError("Architecture not found or failed to load.");
    } finally {
      setLoading(false);
    }
  }, [canvasId, viewerId]);

  useEffect(() => {
    loadDiagram();
  }, [loadDiagram]);

  useEffect(() => {
    if (mode !== "edit") return;

    const stored = getStoredEditPassword();
    if (stored) {
      verifyDiagramPassword(stored)
        .then((ok) => {
          if (ok) {
            setEditUnlocked(true);
            setSidebarOpen(false);
          } else {
            clearStoredEditPassword();
            setEditUnlocked(false);
            setSidebarOpen(true);
          }
        })
        .catch(() => {
          setEditUnlocked(false);
          setSidebarOpen(true);
        });
    } else {
      setEditUnlocked(false);
      setSidebarOpen(true);
    }
  }, [mode]);

  const handlePasswordSubmit = async (password: string) => {
    const ok = await verifyDiagramPassword(password);
    if (!ok) throw new Error("Incorrect password");
    setStoredEditPassword(password);
    setEditUnlocked(true);
    setSidebarOpen(false);
  };

  const handleSidebarClose = () => {
    if (mode === "edit" && !editUnlocked) {
      navigate({ to: "/architecture/$canvasId", params: { canvasId: meta?.canvasId || canvasId! } });
      return;
    }
    setSidebarOpen(false);
  };

  const handleClose = () => {
    navigate({ to: "/learnings", search: { tab: "architectures" } });
  };

  const handleSave = async (data: DiagramScene) => {
    const password = getStoredEditPassword();
    if (!password || !meta?.canvasId) {
      setSidebarOpen(true);
      throw new Error("Password required");
    }
    await saveDiagram(meta.canvasId, data, password);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FFF8F0]">
        <PremiumLoaderFullScreen />
      </div>
    );
  }

  if (error || !sceneData || !meta) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF8F0] px-4">
        <p className="font-display text-2xl font-semibold text-[#8B4513]">{error || "Not found"}</p>
        <button
          type="button"
          onClick={handleClose}
          className="mt-6 border-2 border-black bg-black px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-[#8B4513]"
        >
          Back to architectures
        </button>
      </div>
    );
  }

  const isViewOnly = mode === "view" || !!viewerId || (mode === "edit" && !editUnlocked);
  const needsPassword = mode === "edit" && !editUnlocked;

  return (
    <>
      <Suspense
        fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FFF8F0]">
            <PremiumLoaderFullScreen />
          </div>
        }
      >
        <ExcalidrawCanvas
          key={isViewOnly ? `view-${meta.canvasId}` : `edit-${meta.canvasId}`}
          canvasId={meta.canvasId}
          canvasName={meta.name}
          viewerId={meta.viewerId}
          isPublic={meta.isPublic}
          initialData={sceneData}
          viewOnly={isViewOnly}
          onClose={handleClose}
          onSave={handleSave}
          editCanvasId={meta.canvasId}
        />
      </Suspense>

      <ArchitecturePasswordSidebar
        open={needsPassword && sidebarOpen}
        onClose={handleSidebarClose}
        onSubmit={handlePasswordSubmit}
      />
    </>
  );
}
