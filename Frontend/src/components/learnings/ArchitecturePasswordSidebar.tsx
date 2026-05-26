import { useState } from "react";
import { Lock, X } from "lucide-react";

interface ArchitecturePasswordSidebarProps {
  open: boolean;
  title?: string;
  description?: string;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: (password: string) => Promise<void>;
}

export function ArchitecturePasswordSidebar({
  open,
  title = "Unlock editor",
  description = "Enter password to edit this architecture",
  submitLabel = "Unlock edit",
  onClose,
  onSubmit,
}: ArchitecturePasswordSidebarProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <>
      <div
        className={`fixed inset-0 z-[200] bg-black/35 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={`fixed left-0 top-0 z-[210] flex h-full w-full max-w-[min(100vw,22rem)] flex-col border-r-2 border-black bg-[#FFF8F0] shadow-[8px_0_0_0_rgba(0,0,0,1)] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="architecture-password-sidebar-title"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-black/15 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white">
              <Lock className="h-5 w-5 text-[#8B4513]" strokeWidth={2} />
            </div>
            <div>
              <h2 id="architecture-password-sidebar-title" className="font-display text-lg font-bold text-[#8B4513]">
                {title}
              </h2>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-black/55">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-black/20 p-1.5 text-black/70 transition-colors hover:bg-black hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-5 py-6">
          <div className="flex-1">
            <label
              htmlFor="architecture-sidebar-password"
              className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-black/70"
            >
              Password
            </label>
            <input
              id="architecture-sidebar-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus={open}
              className="h-12 w-full border-2 border-black bg-white px-3 text-sm font-medium text-black placeholder:text-black/35 focus:outline-none focus:ring-0"
              placeholder="Enter password"
            />

            {error && (
              <p className="mt-3 border border-red-600/30 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {error}
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-2 border-t border-black/10 pt-5">
            <button
              type="submit"
              disabled={loading}
              className="w-full border-2 border-black bg-black py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#8B4513] disabled:opacity-60"
            >
              {loading ? "Verifying…" : submitLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full border-2 border-black/25 bg-transparent py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-black transition-colors hover:bg-black/5"
            >
              Cancel
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
