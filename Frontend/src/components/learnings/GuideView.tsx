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
              <div 
                key={card} 
                className="h-72 border border-black/10 bg-black/[0.04] relative overflow-hidden"
                style={{ animationDelay: `${(row - 1) * 3 + card * 0.15}s` }}
              >
                {/* Premium shimmer effect */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-black/10 to-transparent"></div>
                
                {/* Content skeleton */}
                <div className="p-6 space-y-4">
                  {/* Badge */}
                  <div className="h-4 w-16 bg-black/[0.08] relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-black/10 to-transparent"></div>
                  </div>
                  
                  {/* Title */}
                  <div className="space-y-2">
                    <div className="h-6 w-full bg-black/[0.08] relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-black/10 to-transparent"></div>
                    </div>
                    <div className="h-6 w-3/4 bg-black/[0.08] relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-black/10 to-transparent"></div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-black/[0.08] relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-black/10 to-transparent"></div>
                    </div>
                    <div className="h-4 w-5/6 bg-black/[0.08] relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-black/10 to-transparent"></div>
                    </div>
                    <div className="h-4 w-2/3 bg-black/[0.08] relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-black/10 to-transparent"></div>
                    </div>
                  </div>
                  
                  {/* Metadata */}
                  <div className="flex items-center justify-between pt-4 border-t border-black/10">
                    <div className="h-4 w-24 bg-black/[0.08] relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-black/10 to-transparent"></div>
                    </div>
                    <div className="h-6 w-16 bg-black/[0.08] relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-black/10 to-transparent"></div>
                    </div>
                  </div>
                </div>
              </div>
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