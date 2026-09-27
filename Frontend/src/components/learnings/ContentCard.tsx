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
      className={`group relative h-full overflow-hidden border border-black/15 ${isGrayBackground ? 'bg-white/60 backdrop-blur-sm hover:bg-white' : 'bg-transparent'} transition-all duration-500 ease-out hover:-translate-y-1 hover:border-black/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={onClick}
    >
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-black/0 via-black/0 to-black/[0.02] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative z-10 flex h-full flex-col">
      {isTextOnly ? (
        <div className="relative flex h-full flex-col p-4 sm:p-6">
          <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-black/50 sm:mb-4 sm:gap-3 sm:text-[11px]">
            {typeof displayNumber === 'number' && (
              <span className="inline-flex items-center justify-center font-bold text-[#742308]">
                {String(displayNumber).padStart(2, '0')}
              </span>
            )}
            <span className="font-bold text-black/80">{type === 'guide' ? 'GUIDE' : type.toUpperCase()}</span>
            {dateLabel && (
              <>
                <span className="h-1 w-1 rounded-full bg-black/20" />
                <span className="font-semibold tracking-[0.16em] text-black/50">{dateLabel}</span>
              </>
            )}
          </div>

          <h3 className="mb-2 font-display text-[1.1rem] font-bold leading-[1.2] text-black transition-colors duration-300 group-hover:text-[#742308] sm:mb-3 sm:text-[1.35rem] lg:text-[1.5rem] line-clamp-3">
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

            <h3 className="cursor-pointer font-display text-[0.95rem] font-semibold leading-snug text-black transition-colors group-hover:underline group-hover:decoration-black group-hover:underline-offset-4 sm:text-[1rem] lg:text-[1.1rem] line-clamp-2">
              {getTitle()}
            </h3>
            
            <p className="mt-2 text-[11px] leading-[1.6] text-black/70 line-clamp-3 sm:mt-3 sm:text-[13px]">
              {getDescription()}
            </p>

            <div className="mt-4 flex flex-wrap gap-x-2 gap-y-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-black/50 sm:mt-5 sm:gap-x-3 sm:text-[10px]">
              {getTags().slice(0, 4).map((tag: string, idx: number) => (
                <span key={idx} className="border-b border-black/10 pb-0.5">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </article>
  );
}
