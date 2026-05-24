import { useQuery } from "@tanstack/react-query";
import { config } from "@/config/config";
import { ContentCard } from "./ContentCard";

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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[16/10] bg-black/10 mb-4"></div>
            <div className="h-6 bg-black/10 mb-3 w-3/4"></div>
            <div className="h-4 bg-black/10 mb-2"></div>
            <div className="h-4 bg-black/10 w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredDocs.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-foreground/60 text-xl">No documentation found</p>
        {search && (
          <p className="text-foreground/40 text-sm mt-2">Try a different search term</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {filteredDocs.map((item: any, idx: number) => (
        <ContentCard key={item._id || item.id || idx} item={item} type="docs" />
      ))}
    </div>
  );
}
