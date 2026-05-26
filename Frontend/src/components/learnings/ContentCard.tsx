interface ContentCardProps {
  item: any;
  type: string;
  onClick?: () => void;
  displayNumber?: number;
}

export function ContentCard({ item, type, onClick, displayNumber }: ContentCardProps) {
  const isTextOnly = type === 'docs' || type === 'guide';
  const isGrayBackground = type === 'docs' || type === 'guide';

  const getImage = () => {
    if (type === 'blogs') return item.coverImage || item.assets?.[0]?.url || '';
    if (type === 'docs') return item.thumbnail || '';
    if (type === 'projects') return item.cardasset?.[0] || item.cardImage || '';
    return '';
  };

  const getTitle = () => item.title || item.name || 'Untitled';
  const getDescription = () => item.shortDescription || item.description || 'No description available';
  const getTags = () => {
    if (Array.isArray(item.tags) && item.tags.length > 0) return item.tags;

    if (type === 'guide') {
      const guideTags = [item.topic, item.titles?.length ? `${item.titles.length} titles` : ''];
      return guideTags.filter(Boolean);
    }

    const fallbackTags = [item.category, item.type].filter(Boolean);
    return fallbackTags;
  };
  const getDate = () => {
    const date = item.datetime || item.created_at || item.createdAt || item.updatedAt;
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const getTime = () => {
    const date = item.datetime || item.created_at || item.createdAt || item.updatedAt;
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const dateLabel = getDate();
  const timeLabel = getTime();

  return (
    <article 
      className={`group relative h-full border border-black/15 ${isGrayBackground ? 'bg-gray-100 hover:bg-gray-200' : 'bg-transparent'} transition-all duration-200 hover:border-black hover:shadow-[0_0_0_1px_rgba(0,0,0,0.12)] ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={onClick}
    >
      {isTextOnly ? (
        <div className="relative flex h-full flex-col p-2.5 sm:p-4">
          <div className="mb-2 flex items-center gap-2 text-[8px] uppercase tracking-[0.14em] text-black/55 sm:mb-3 sm:gap-3 sm:text-[10px] sm:tracking-[0.18em]">
            {typeof displayNumber === 'number' && (
              <span className="inline-flex items-center justify-center font-bold text-black/80">
                {String(displayNumber).padStart(2, '0')}
              </span>
            )}
            <span className="font-bold text-black/80">{type === 'guide' ? 'GUIDE' : type.toUpperCase()}</span>
            {dateLabel && (
              <span className="font-semibold tracking-[0.16em] text-black/45">{dateLabel}</span>
            )}
          </div>

          <h3 className="mb-1.5 font-display text-[0.58rem] font-semibold leading-tight text-black transition-colors duration-200 group-hover:underline group-hover:decoration-black group-hover:underline-offset-4 sm:mb-2 sm:text-[1.15rem]">
            {getTitle()}
          </h3>

          <p className="text-[10px] leading-[1.5] text-black/68 line-clamp-3 sm:text-[12px] sm:leading-[1.6]">
            {getDescription()}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.14em] text-black/55">
            {getTags().slice(0, 4).map((tag: string, idx: number) => (
              <span key={idx}>{tag}</span>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="overflow-hidden border-b border-black/10">
            {getImage() ? (
              <img 
                src={getImage()} 
                alt={getTitle()} 
                loading="lazy" 
                className="aspect-[4/3] w-full object-cover grayscale transition-transform duration-700 group-hover:scale-[1.01] group-hover:grayscale-0 sm:aspect-[16/10]" 
              />
            ) : (
              <div className="aspect-[4/3] w-full bg-white sm:aspect-[16/10]" />
            )}
          </div>

          <div className="flex flex-1 flex-col p-2.5 sm:p-4">
            <div className="mb-2 flex items-start justify-between gap-2 sm:mb-3 sm:gap-3">
              <div className="label-mono text-[8px] uppercase tracking-[0.14em] text-black/55 sm:text-[10px] sm:tracking-[0.22em]">{type.toUpperCase()}</div>
              {dateLabel && (
                <div className="label-mono shrink-0 text-[8px] uppercase tracking-[0.12em] text-black/45 sm:text-[10px] sm:tracking-[0.18em]">{dateLabel}</div>
              )}
            </div>

            <h3 className="cursor-pointer font-display text-[0.58rem] font-semibold leading-tight text-black transition-colors group-hover:underline group-hover:decoration-black group-hover:underline-offset-4 sm:text-[1.15rem]">
              {getTitle()}
            </h3>
            
            <p className="mt-1.5 text-[10px] leading-[1.5] text-black/68 line-clamp-3 sm:mt-3 sm:text-[12px] sm:leading-[1.6]">
              {getDescription()}
            </p>

            <div className="mt-2 flex flex-wrap gap-x-1.5 gap-y-1 text-[8px] uppercase tracking-[0.12em] text-black/55 sm:mt-4 sm:gap-x-3 sm:text-[10px] sm:tracking-[0.14em]">
              {getTags().slice(0, 4).map((tag: string, idx: number) => (
                <span key={idx}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
