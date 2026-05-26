import { config } from "@/config/config";

const API = `${config.apiUrl}/diagrams`;
const PASSWORD_SESSION_KEY = "architecture_edit_password";

export type DiagramCanvas = {
  canvasId: string;
  viewerId?: string;
  name: string;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
  thumbnail?: string;
};

export type DiagramScene = {
  elements: unknown[];
  appState?: Record<string, unknown>;
};

export function getStoredEditPassword(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(PASSWORD_SESSION_KEY);
}

export function setStoredEditPassword(password: string) {
  sessionStorage.setItem(PASSWORD_SESSION_KEY, password);
}

export function clearStoredEditPassword() {
  sessionStorage.removeItem(PASSWORD_SESSION_KEY);
}

export async function fetchDiagramList(): Promise<DiagramCanvas[]> {
  const response = await fetch(API);
  if (!response.ok) throw new Error("Failed to fetch diagrams");
  const data = await response.json();
  return data.canvases || [];
}

export async function fetchDiagram(canvasId: string): Promise<{
  data: DiagramScene;
  canvas: DiagramCanvas;
}> {
  const response = await fetch(`${API}/${canvasId}`);
  if (!response.ok) throw new Error("Failed to load architecture");
  const result = await response.json();
  return { data: result.data, canvas: result.canvas };
}

export async function fetchDiagramByViewer(viewerId: string): Promise<{
  data: DiagramScene;
  canvas: DiagramCanvas;
}> {
  const response = await fetch(`${API}/viewer/${viewerId}`);
  if (!response.ok) throw new Error("Failed to load architecture");
  const result = await response.json();
  return { data: result.data, canvas: result.canvas };
}

export async function verifyDiagramPassword(password: string): Promise<boolean> {
  const response = await fetch(`${API}/verify-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (response.status === 401) return false;
  if (!response.ok) throw new Error("Failed to verify password");
  return true;
}

export async function createDiagram(params: {
  name: string;
  isPublic: boolean;
  password: string;
}): Promise<{ canvasId: string; viewerId: string }> {
  const response = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: params.name,
      isPublic: params.isPublic,
      password: params.password,
      data: { elements: [], appState: {} },
    }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to create architecture");
  }
  return { canvasId: result.canvasId, viewerId: result.viewerId };
}

export async function saveDiagram(canvasId: string, data: DiagramScene, password: string) {
  const response = await fetch(`${API}/${canvasId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, password }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to save architecture");
  }
}
