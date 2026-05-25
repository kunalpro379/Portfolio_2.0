import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronRight, Workflow } from "lucide-react";
import { config } from "@/config/config";

type DiagramItem = {
  canvasId?: string;
  name?: string;
  updatedAt?: string;
  isPublic?: boolean;
};

const API_BASE_URL = config.apiUrl;

async function fetchDiagrams() {
  const response = await fetch(`${API_BASE_URL}/diagrams`);
  if (!response.ok) throw new Error("Failed to fetch diagrams");
  const data = await response.json();
  return data.canvases || data.diagrams || [];
}

interface ArchitectureViewProps {
  search: string;
}

export function ArchitectureView({ search }: ArchitectureViewProps) {
  const [expandedCanvasId, setExpandedCanvasId] = useState<string | null>(null);

  const { data: diagrams = [], isLoading } = useQuery({
    queryKey: ["architecture-learning-content"],
    queryFn: fetchDiagrams,
  });

  const searchLower = search.toLowerCase();
  const filteredDiagrams = (diagrams as DiagramItem[]).filter((diagram) => {
    if (!searchLower) return true;
    return [diagram.name, diagram.canvasId].some((value) => (value || "").toLowerCase().includes(searchLower));
  });

  const titleTones = ["text-black", "text-[#8B4513]", "text-[#B8860B]", "text-stone-800"];
  const dateTones = ["text-black/55", "text-[#8B4513]/65", "text-amber-700/65", "text-stone-600"];

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
            onClick={() => window.alert("Create flow is coming soon.")}
          >
            <span className="mr-2 inline-flex align-middle">
              <Workflow className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            Create+
          </button>
        </div>

        {filteredDiagrams.length === 0 ? (
          <div className="border-y border-black/10 px-4 py-12 text-center">
            <p className="font-display text-2xl font-semibold text-[#8B4513]">No architectures found</p>
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

              return (
                <button
                  key={diagram.canvasId || diagram.name || `${index}`}
                  type="button"
                  onClick={() => setExpandedCanvasId((current) => (current === diagram.canvasId ? null : diagram.canvasId || null))}
                  className={`group flex w-full cursor-pointer flex-col gap-2 border-b border-black/10 px-3 py-4 text-left transition-colors hover:bg-white/30 hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] sm:px-4 sm:py-5 lg:w-1/4 lg:border-r ${index < 4 ? "border-t" : ""} ${(index + 1) % 4 === 0 ? "lg:border-r-0" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex items-start gap-2.5 cursor-pointer font-display text-[clamp(0.92rem,1.25vw,1.15rem)] font-semibold leading-tight transition-all ${titleTones[toneIndex]} ${expandedCanvasId === diagram.canvasId ? "underline decoration-current decoration-1 underline-offset-[6px]" : "group-hover:underline group-hover:decoration-black/25 group-hover:decoration-1 group-hover:underline-offset-[6px]"}`}>
                      <Workflow className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.9} />
                      <span>{diagram.name || "Untitled architecture"}</span>
                    </div>

                    <div className={`shrink-0 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${dateTones[toneIndex]}`}>
                      {updatedDate || "No date"}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pl-0.5 text-black/40 transition-colors group-hover:text-black/65">
                    <ChevronRight className={`h-3.5 w-3.5 rotate-90 transition-transform ${expandedCanvasId === diagram.canvasId ? "translate-y-0.5" : ""}`} strokeWidth={2.25} />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.2em]">
                      {expandedCanvasId === diagram.canvasId ? "Close" : "Open"}
                    </span>
                  </div>

                  {expandedCanvasId === diagram.canvasId && diagram.canvasId && (
                    <div className="pl-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/45">
                      Canvas: {diagram.canvasId}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}