import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { FilePlus } from "lucide-react";
import { config } from "@/config/config";
import { LearningRhythmGrid } from "./LearningRhythmGrid";
import { ArchitecturePasswordSidebar } from "./ArchitecturePasswordSidebar";

const API_BASE_URL = config.apiUrl;

async function fetchDocs() {
  const response = await fetch(`${API_BASE_URL}/documentation`);
  if (!response.ok) throw new Error('Failed to fetch docs');
  const data = await response.json();
  return data.documentation || data.docs || [];
}

interface DocsViewProps {
  search: string;
}

export function DocsView({ search }: DocsViewProps) {
  const navigate = useNavigate();
  const [showPasswordSidebar, setShowPasswordSidebar] = useState(false);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["docs"],
    queryFn: fetchDocs,
  });

  const filteredDocs = docs.filter((item: any) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const title = (item.title || '').toLowerCase();
    const desc = (item.description || item.shortDescription || '').toLowerCase();
    const tags = (item.tags || []).join(' ').toLowerCase();
    return title.includes(searchLower) || desc.includes(searchLower) || tags.includes(searchLower);
  });

  const handlePasswordSubmit = async (password: string) => {
    // Verify password by attempting a create (we check only auth status)
    const res = await fetch(`${API_BASE_URL}/documentation/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "__verify__", subject: "__verify__", content: "__verify__", password }),
    });
    if (res.status === 401) {
      const data = await res.json();
      throw new Error(data.message || "Incorrect password");
    }
    setShowPasswordSidebar(false);
    navigate({ to: "/learnings/docs/create", search: { password } });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((row) => (
          <div key={row} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((card) => (
              <div key={card} className="h-72 animate-pulse border border-black/10 bg-black/[0.04]" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setShowPasswordSidebar(true)}
          className="flex items-center gap-2 border border-black/25 bg-transparent px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition-colors hover:bg-black hover:text-white"
        >
          <FilePlus className="h-3.5 w-3.5" strokeWidth={2} />
          New Doc
        </button>
      </div>

      {filteredDocs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-foreground/60 text-xl">No documentation found</p>
          {search && (
            <p className="text-foreground/40 text-sm mt-2">Try a different search term</p>
          )}
        </div>
      ) : (
        <LearningRhythmGrid
          items={filteredDocs}
          type="docs"
          onItemClick={(item) => {
            navigate({ to: `/learnings/docs/${item._id}` });
          }}
        />
      )}

      <ArchitecturePasswordSidebar
        open={showPasswordSidebar}
        title="New Documentation"
        description="Enter password to create documentation"
        submitLabel="Continue to editor"
        onClose={() => setShowPasswordSidebar(false)}
        onSubmit={handlePasswordSubmit}
      />
    </>
  );
}
