interface ComingSoonViewProps {
  title: string;
}

export function ComingSoonView({ title }: ComingSoonViewProps) {
  return (
    <div className="text-center py-32">
      <div className="inline-block bg-black text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-6">
        {title}
      </div>
      <h2 className="font-display text-4xl font-bold text-foreground mb-4">Coming Soon</h2>
      <p className="text-foreground/60 text-lg max-w-xl mx-auto">
        This section is under development. Check back soon for updates!
      </p>
    </div>
  );
}
