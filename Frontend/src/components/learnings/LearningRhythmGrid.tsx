import type { CSSProperties } from 'react';
import { ContentCard } from './ContentCard';

const ROW_PATTERN = [3, 4];

function chunkByPattern(items: any[]) {
  const rows: any[][] = [];
  let index = 0;
  let patternIndex = 0;

  while (index < items.length) {
    const size = ROW_PATTERN[patternIndex % ROW_PATTERN.length];
    rows.push(items.slice(index, index + size));
    index += size;
    patternIndex += 1;
  }

  return rows;
}

interface LearningRhythmGridProps {
  items: any[];
  type: 'docs' | 'guide';
}

export function LearningRhythmGrid({ items, type }: LearningRhythmGridProps) {
  const rows = chunkByPattern(items);
  let runningIndex = 0;

  return (
    <div className="space-y-3">
      {rows.map((row, rowIndex) => {
        const columns = row.length || 1;
        const rowStartIndex = runningIndex;
        const rowStyle = {
          '--row-cols': columns,
        } as CSSProperties;

        runningIndex += row.length;

        return (
          <div key={`${type}-row-${rowIndex}`} className="relative">
            <div
              className="grid gap-2 md:grid-cols-3 xl:[grid-template-columns:repeat(var(--row-cols),minmax(0,1fr))]"
              style={rowStyle}
            >
              {row.map((item: any, itemIndex: number) => (
                <ContentCard
                  key={item._id || item.id || `${rowIndex}-${itemIndex}`}
                  item={item}
                  type={type}
                  displayNumber={rowStartIndex + itemIndex + 1}
                />
              ))}
            </div>

            {rowIndex < rows.length - 1 && (
              <div className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-[#8B4513]/60 to-transparent" />
            )}
          </div>
        );
      })}
    </div>
  );
}