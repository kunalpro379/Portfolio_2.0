export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-[var(--cream-soft)]/40">
      <div className="page-container py-10 sm:py-12">
        <div className="font-display text-lg font-semibold text-foreground">Kunal Patil</div>
        <div className="label-mono mt-1 text-[11px] text-muted-foreground">© {year} · AI/ML Engineer</div>
        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
          Building scalable backends, production AI systems, and agentic workflows. Based in Mumbai,
          open to full-time and freelance opportunities.
        </p>
      </div>
    </footer>
  );
}
