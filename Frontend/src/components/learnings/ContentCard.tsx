interface ContentCardProps {
  item: any;
  type: string;
  onClick?: () => void;
}

export function ContentCard({ item, type, onClick }: ContentCardProps) {
  const getImage = () => {
    if (type === 'blogs') return item.coverImage || item.assets?.[0]?.url || '';
    if (type === 'docs') return item.thumbnail || '';
    if (type === 'projects') return item.cardasset?.[0] || item.cardImage || '';
    return '';
  };

  const getTitle = () => item.title || item.name || 'Untitled';
  const getDescription = () => item.shortDescription || item.description || 'No description available';
  const getTags = () => item.tags || [];
  const getDate = () => {
    const date = item.datetime || item.created_at || item.createdAt;
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  return (
    <article 
      className="group relative transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="overflow-hidden">
        {getImage() ? (
          <img 
            src={getImage()} 
            alt={getTitle()} 
            loading="lazy" 
            className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" 
          />
        ) : (
          <div className="aspect-[16/10] w-full bg-gradient-to-br from-accent/20 to-accent/5" />
        )}
      </div>
      <div className="py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="label-mono text-[11px] text-muted-foreground uppercase">{type}</div>
          {getDate() && (
            <div className="label-mono text-[11px] text-muted-foreground">{getDate()}</div>
          )}
        </div>
        <h3 className="font-display text-[1.1rem] font-semibold leading-tight mb-3 text-[#8B4513] group-hover:text-accent group-hover:underline transition-colors">{getTitle()}</h3>
        <p className="text-[13px] leading-[1.6] text-foreground/60 mb-4 line-clamp-3">{getDescription()}</p>
        <div className="flex flex-wrap gap-2">
          {getTags().slice(0, 4).map((tag: string, idx: number) => (
            <span key={idx} className="border border-border px-3 py-1 text-[11px] font-medium text-foreground/70 uppercase tracking-wide">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
