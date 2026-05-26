import { useState } from "react";
import { Lock, X } from "lucide-react";

interface ArchitecturePasswordModalProps {
  open: boolean;
  title: string;
  description: string;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: (password: string) => Promise<void>;
}

export function ArchitecturePasswordModal({
  open,
  title,
  description,
  submitLabel = "Continue",
  onClose,
  onSubmit,
}: ArchitecturePasswordModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Password is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit(password);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <div
        className="relative w-full max-w-md border-2 border-black bg-[#FFF8F0] p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="architecture-password-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 border border-black/20 p-1.5 text-black/70 transition-colors hover:bg-black hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={2.25} />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center border-2 border-black bg-white">
            <Lock className="h-5 w-5 text-[#8B4513]" strokeWidth={2} />
          </div>
          <div>
            <h2 id="architecture-password-title" className="font-display text-xl font-bold text-[#8B4513]">
              {title}
            </h2>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-black/55">
              {description}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="architecture-password" className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-black/70">
              Password
            </label>
            <input
              id="architecture-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="h-11 w-full border-2 border-black bg-white px-3 text-sm font-medium text-black placeholder:text-black/35 focus:outline-none focus:ring-0"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <p className="border border-red-600/30 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-black/25 bg-transparent px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-black transition-colors hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 border-2 border-black bg-black px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#8B4513] disabled:opacity-60"
            >
              {loading ? "Verifying…" : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
