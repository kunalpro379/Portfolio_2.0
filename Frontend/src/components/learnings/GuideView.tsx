import { useQuery } from '@tanstack/react-query';
import { config } from '@/config/config';
import { LearningRhythmGrid } from './LearningRhythmGrid';

const API_BASE_URL = config.apiUrl;

async function fetchGuides() {
  const response = await fetch(`${API_BASE_URL}/guide-notes/guides`);
  if (!response.ok) throw new Error('Failed to fetch guides');
  const data = await response.json();
  return data.guides || [];
}

interface GuideViewProps {
  search: string;
}

export function GuideView({ search }: GuideViewProps) {
  const { data: guides = [], isLoading } = useQuery({
    queryKey: ['guides'],
    queryFn: fetchGuides,
  });

  const filteredGuides = guides.filter((item: any) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const title = (item.name || item.title || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const topic = (item.topic || '').toLowerCase();
    const titles = (item.titles || []).map((entry: any) => entry.name || entry.title || '').join(' ').toLowerCase();
    return title.includes(searchLower) || desc.includes(searchLower) || topic.includes(searchLower) || titles.includes(searchLower);
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((row) => (
          <div key={row} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((card) => (
              <div key={card} className="h-72 animate-pulse rounded-[28px] border border-[#8B4513]/10 bg-white/70" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (filteredGuides.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-xl text-foreground/60">No guides found</p>
        {search && <p className="mt-2 text-sm text-foreground/40">Try a different search term</p>}
      </div>
    );
  }

  return <LearningRhythmGrid items={filteredGuides} type="guide" />;
}