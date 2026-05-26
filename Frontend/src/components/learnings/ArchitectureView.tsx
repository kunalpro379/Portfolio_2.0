import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Eye, Pencil, Workflow } from "lucide-react";
import { ArchitecturePasswordModal } from "./ArchitecturePasswordModal";
import { createDiagram, fetchDiagramList, setStoredEditPassword } from "@/lib/architectureApi";

interface ArchitectureViewProps {
  search: string;
}

export function ArchitectureView({ search }: ArchitectureViewProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createPublic, setCreatePublic] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: diagrams = [], isLoading } = useQuery({
    queryKey: ["architecture-learning-content"],
    queryFn: fetchDiagramList,
  });

  const createMutation = useMutation({
    mutationFn: createDiagram,
    onSuccess: ({ canvasId }, variables) => {
      setStoredEditPassword(variables.password);
      queryClient.invalidateQueries({ queryKey: ["architecture-learning-content"] });
      setShowCreatePassword(false);
      setShowCreateForm(false);
      setCreateName("");
      setCreatePublic(false);
      navigate({ to: "/architecture/$canvasId/edit", params: { canvasId } });
    },
  });

  const searchLower = search.toLowerCase();
  const filteredDiagrams = diagrams.filter((diagram) => {
    if (!searchLower) return true;
    return [diagram.name, diagram.canvasId].some((value) =>
      (value || "").toLowerCase().includes(searchLower),
    );
  });

  const titleTones = ["text-black", "text-[#8B4513]", "text-[#B8860B]", "text-stone-800"];
  const dateTones = ["text-black/55", "text-[#8B4513]/65", "text-amber-700/65", "text-stone-600"];

  const handleCreateClick = () => {
    setShowCreateForm(true);
  };

  const handleCreateSubmit = async (password: string) => {
    if (!createName.trim()) {
      throw new Error("Please enter a name");
    }
    await createMutation.mutateAsync({
      name: createName.trim(),
      isPublic: createPublic,
      password,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="flex min-h-[92px] animate-pulse flex-col gap-3 border-y border-black/10 px-4 py-5">
            <div className="h-5 w-3/4 rounded-full bg-black/10" />
            <div className="h-3 w-24 rounded-full bg-black/10" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-5">
      <section className="flex flex-col space-y-4">
        <div className="flex items-end justify-between gap-4 px-4 pt-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-black/15 bg-white text-black">
              <Workflow className="h-5 w-5" strokeWidth={1.9} />
            </div>
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-black/80">
                Draw your thoughts and design workflows
              </div>
            </div>
          </div>

          <button
            type="button"
            className="shrink-0 rounded-none border border-black/25 bg-transparent px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition-colors hover:bg-black hover:text-white"
            onClick={handleCreateClick}
          >
            <span className="mr-2 inline-flex align-middle">
              <Workflow className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            Create+
          </button>
        </div>

        {showCreateForm && (
          <div className="mx-4 border-2 border-black bg-[#FFF8F0] p-4 shadow-[4px_4px_0_0_#000]">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/60">New architecture</p>
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="Architecture name"
              className="mb-3 h-10 w-full border-2 border-black bg-white px-3 text-sm"
            />
            <label className="mb-4 flex cursor-pointer items-center gap-2 text-xs font-medium uppercase tracking-wider text-black/70">
              <input
                type="checkbox"
                checked={createPublic}
                onChange={(e) => setCreatePublic(e.target.checked)}
                className="h-4 w-4 border-2 border-black"
              />
              Public (viewable without password)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateName("");
                }}
                className="flex-1 border-2 border-black/25 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowCreatePassword(true)}
                disabled={!createName.trim()}
                className="flex-1 border-2 border-black bg-black py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white hover:bg-[#8B4513] disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {filteredDiagrams.length === 0 ? (
          <div className="border-y border-black/10 px-4 py-12 text-center">
            <p className="font-display text-2xl font-semibold text-[#8B4513]">No architectures found</p>
            <p className="mt-2 text-sm text-black/50">Create your first workflow diagram with Create+</p>
          </div>
        ) : (
          <div className="flex flex-wrap border-y border-black/10 bg-transparent">
            {filteredDiagrams.map((diagram, index) => {
              const toneIndex = index % titleTones.length;
              const updatedDate = diagram.updatedAt
                ? new Date(diagram.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })
                : "";
              const id = diagram.canvasId!;

              return (
                <article
                  key={id || diagram.name || `${index}`}
                  className={`group flex w-full flex-col gap-2 border-b border-black/10 px-3 py-4 transition-colors hover:bg-white/30 hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] sm:px-4 sm:py-5 lg:w-1/4 lg:border-r ${index < 4 ? "border-t" : ""} ${(index + 1) % 4 === 0 ? "lg:border-r-0" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/architecture/$canvasId", params: { canvasId: id } })}
                    className="flex w-full cursor-pointer flex-col gap-2 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={`flex items-start gap-2.5 font-display text-[clamp(0.92rem,1.25vw,1.15rem)] font-semibold leading-tight transition-all ${titleTones[toneIndex]} group-hover:underline group-hover:decoration-black/25 group-hover:decoration-1 group-hover:underline-offset-[6px]`}
                      >
                        <Workflow className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.9} />
                        <span>{diagram.name || "Untitled architecture"}</span>
                      </div>

                      <div className={`shrink-0 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${dateTones[toneIndex]}`}>
                        {updatedDate || "No date"}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pl-0.5 text-black/40 transition-colors group-hover:text-black/65">
                      <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.25} />
                      <span className="text-[9px] font-semibold uppercase tracking-[0.2em]">Open</span>
                    </div>
                  </button>

                  <div className="flex items-center gap-1 pl-0.5">
                    <button
                      type="button"
                      title="View"
                      onClick={() => navigate({ to: "/architecture/$canvasId", params: { canvasId: id } })}
                      className="flex items-center gap-1 border border-black/15 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-black/55 transition-colors hover:border-black hover:bg-white hover:text-black"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </button>
                    <button
                      type="button"
                      title="Edit"
                      onClick={() => navigate({ to: "/architecture/$canvasId/edit", params: { canvasId: id } })}
                      className="flex items-center gap-1 border border-black/15 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-black/55 transition-colors hover:border-black hover:bg-[#8B4513] hover:text-white"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <ArchitecturePasswordModal
        open={showCreatePassword}
        title="Create architecture"
        description="Password required to create new diagrams"
        submitLabel="Create & open editor"
        onClose={() => setShowCreatePassword(false)}
        onSubmit={handleCreateSubmit}
      />
    </div>
  );
}
