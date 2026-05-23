import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpenText, Code2, DraftingCompass, FileText, FolderKanban, FolderOpen, Search, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { config } from "@/config/config";

export const Route = createFileRoute("/learnings")({ component: LearningsPage });

const API_BASE_URL = config.apiUrl;

const tabs = [
  { key: "home", label: "Home", icon: Sparkles },
  { key: "blogs", label: "Blogs", icon: BookOpenText },
  { key: "docs", label: "Docs", icon: FileText },
  { key: "guide", label: "Guide", icon: FolderOpen },
  { key: "files", label: "Files", icon: FolderKanban },
  { key: "diary", label: "Diary", icon: FileText },
  { key: "code", label: "Code", icon: Code2 },
  { key: "architectures", label: "Architectures", icon: DraftingCompass },
  { key: "projects", label: "Projects", icon: FolderKanban },
] as const;

type TabKey = (typeof tabs)[number]["key"];
type ContentTabKey = Exclude<TabKey, "home">;
type Collections = Record<ContentTabKey, any[]>;

const contentTabs: { key: ContentTabKey; endpoint: string; responseKeys: string[] }[] = [
  { key: "blogs", endpoint: "/blogs", responseKeys: ["blogs"] },
  { key: "docs", endpoint: "/documentation", responseKeys: ["docs", "documents"] },
  { key: "guide", endpoint: "/guide-notes/guides", responseKeys: ["guides"] },
  { key: "files", endpoint: "/notes/files/all", responseKeys: ["files"] },
  { key: "diary", endpoint: "/diary", responseKeys: ["entries"] },
  { key: "code", endpoint: "/code/files", responseKeys: ["files"] },
  { key: "architectures", endpoint: "/diagrams", responseKeys: ["canvases", "diagrams"] },
  { key: "projects", endpoint: "/projects", responseKeys: ["projects"] },
];

function pickArray(payload: unknown, keys: string[]) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }

  return [];
}

function safeText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function formatDate(value: unknown) {
  const raw = value instanceof Date ? value : new Date(String(value ?? ""));
  return Number.isNaN(raw.getTime())
    ? ""
    : new Intl.DateTimeFormat("en-IN", { month: "short", day: "2-digit", year: "numeric" }).format(raw);
}

function excerpt(value: unknown, maxLength = 180) {
  const text = safeText(value).replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function imageFrom(item: Record<string, any>) {
  const assets = item.assets;
  const assetUrl = Array.isArray(assets)
    ? assets[0]?.url || assets[0]?.src || ""
    : assets && typeof assets === "object"
      ? Object.values(assets)[0]
      : "";

  return (
    item.coverImage ||
    assetUrl ||
    item.diagramUrl ||
    item.thumbnail ||
    item.blobUrl ||
    ""
  );
}

function searchTextForTab(item: Record<string, any>, tab: ContentTabKey) {
  const fieldsByTab: Record<ContentTabKey, string[]> = {
    blogs: [item.title, item.subject, item.shortDescription, item.description, ...(item.tags || [])],
    docs: [item.title, item.subject, item.description, ...(item.tags || [])],
    guide: [item.name, item.topic, item.description, ...(item.titles || []).map((title: any) => title?.name || title?.description || "")],
    files: [item.filename, item.name, item.folderPath, item.fileType, item.path],
    diary: [item.date, item.content, item.leftContent, item.rightContent],
    code: [item.filename, item.name, item.folderPath, item.fileType, item.output, item.content],
    architectures: [item.name, item.canvasId, item.viewerId],
    projects: [item.title, item.description, item.tagline, ...(item.tags || [])],
  };

  return fieldsByTab[tab]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

async function fetchCollection(endpoint: string, responseKeys: string[]) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) return [];

    const payload = await response.json();
    return pickArray(payload, responseKeys);
  } catch {
    return [];
  }
}

async function loadCollections(): Promise<Collections> {
  const settled = await Promise.all(
    contentTabs.map(async ({ key, endpoint, responseKeys }) => [key, await fetchCollection(endpoint, responseKeys)] as const),
  );

  return settled.reduce((acc, [key, items]) => {
    acc[key] = items;
    return acc;
  }, {} as Collections);
}

function LearningsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["learnings-collections"],
    queryFn: loadCollections,
    staleTime: 60_000,
  });

  const collections = data ?? {
    blogs: [],
    docs: [],
    guide: [],
    files: [],
    diary: [],
    code: [],
    architectures: [],
    projects: [],
  } satisfies Collections;

  const counts = {
    blogs: collections.blogs.length,
    docs: collections.docs.length,
    guide: collections.guide.length,
    files: collections.files.length,
    diary: collections.diary.length,
    code: collections.code.length,
    architectures: collections.architectures.length,
    projects: collections.projects.length,
  };

  const currentItems = activeTab === "home" ? [] : collections[activeTab];
  const filteredItems = useMemo(() => {
    if (activeTab === "home") return [];
    const query = search.trim().toLowerCase();
    if (!query) return currentItems;
    return currentItems.filter((item) => searchTextForTab(item, activeTab).includes(query));
  }, [activeTab, currentItems, search]);

  const tabMeta = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];
  const ActiveIcon = tabMeta.icon;

  return (
    <main className="min-h-screen text-foreground">
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-[oklch(0.72_0.13_75/0.18)] blur-3xl" />
          <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-[oklch(0.6_0.16_35/0.14)] blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[oklch(0.18_0.005_60/0.10)] blur-3xl" />
        </div>

        <header className="sticky top-0 z-50 border-b border-white/15 bg-white/40 backdrop-blur-2xl">
          <div className="mx-auto max-w-[1440px] px-6 py-4 lg:px-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center justify-between gap-4">
                <Link to="/" className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-black/80 px-4 py-2 text-white shadow-2xl shadow-black/10 transition-transform hover:-translate-y-0.5">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="font-medium tracking-wide">Back to Portfolio</span>
                </Link>

                <div className="hidden items-center gap-3 rounded-full border border-white/20 bg-white/55 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-foreground/70 lg:flex">
                  <Sparkles className="h-4 w-4 text-accent" />
                  Learnings Atlas
                </div>
              </div>

              <div className="flex-1">
                <div className="relative max-w-2xl">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={`Search ${activeTab === "home" ? "all learnings" : activeTab}`}
                    className="h-12 rounded-full border-white/20 bg-white/60 pl-11 pr-4 text-[14px] shadow-lg shadow-black/5 backdrop-blur-xl placeholder:text-foreground/35"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto pb-1">
              <div className="flex min-w-max items-center gap-2 rounded-[1.5rem] border border-white/20 bg-black/55 p-2 text-white shadow-2xl shadow-black/10">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = tab.key === activeTab;
                  const tabCount = tab.key === "home" ? Object.values(counts).reduce((total, count) => total + count, 0) : counts[tab.key as ContentTabKey];

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] transition-all ${isActive ? "bg-white text-black shadow-lg shadow-black/20" : "text-white/75 hover:bg-white/10 hover:text-white"}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] ${isActive ? "bg-black/10 text-black" : "bg-white/10 text-white/70"}`}>
                        {tabCount.toString().padStart(2, "0")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] px-6 pb-20 pt-10 lg:px-10 lg:pt-12">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <Badge className="w-fit border-white/20 bg-white/55 text-foreground shadow-lg shadow-black/5 backdrop-blur-xl">Knowledge, notes, and work in one place</Badge>
              <h1 className="font-display max-w-4xl text-[clamp(2.5rem,6vw,5.5rem)] font-semibold leading-[1.02] tracking-tight">
                A premium workspace for blogs, docs, code, and everything I’m learning.
              </h1>
              <p className="max-w-2xl text-[16px] leading-[1.75] text-foreground/72 md:text-[18px]">
                Switch between curated tabs, search across the current collection, and skim the latest content in a clean two-column layout.
              </p>
            </div>

            <Card className="border-white/20 bg-white/45 p-6 shadow-2xl shadow-black/5 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="label-mono text-foreground/55">Active section</div>
                  <div className="mt-2 flex items-center gap-3">
                    <ActiveIcon className="h-5 w-5 text-accent" />
                    <h2 className="font-display text-2xl font-semibold">{tabMeta.label}</h2>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-black text-white">{isLoading ? "Loading" : "Live"}</Badge>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Blogs", counts.blogs],
                  ["Docs", counts.docs],
                  ["Projects", counts.projects],
                  ["Code", counts.code],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/20 bg-white/60 px-4 py-4 text-center">
                    <div className="font-display text-2xl font-semibold">{String(value).padStart(2, "0")}</div>
                    <div className="label-mono mt-1 text-[10px] text-foreground/55">{label}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="mt-10">
            {activeTab === "home" ? (
              <HomeView counts={counts} />
            ) : activeTab === "blogs" ? (
              <BlogsView items={filteredItems} search={search} onClearSearch={() => setSearch("")} />
            ) : activeTab === "docs" ? (
              <DocsView items={filteredItems} search={search} onClearSearch={() => setSearch("")} />
            ) : activeTab === "guide" ? (
              <GuideView items={filteredItems} search={search} onClearSearch={() => setSearch("")} />
            ) : activeTab === "files" ? (
              <FilesView items={filteredItems} search={search} onClearSearch={() => setSearch("")} />
            ) : activeTab === "diary" ? (
              <DiaryView items={filteredItems} search={search} onClearSearch={() => setSearch("")} />
            ) : activeTab === "code" ? (
              <CodeView items={filteredItems} search={search} onClearSearch={() => setSearch("")} />
            ) : activeTab === "architectures" ? (
              <ArchitectureView items={filteredItems} search={search} onClearSearch={() => setSearch("")} />
            ) : (
              <ProjectsView items={filteredItems} search={search} onClearSearch={() => setSearch("")} />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionTitle({ title, kicker, count }: { title: string; kicker: string; count: number }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="label-mono text-foreground/60">{kicker}</div>
        <h2 className="mt-2 font-display text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1.05]">{title}</h2>
      </div>
      <div className="label-mono text-foreground/55">{String(count).padStart(2, "0")} items</div>
    </div>
  );
}

function EmptyState({ title, subtitle, onClearSearch }: { title: string; subtitle: string; onClearSearch: () => void }) {
  return (
    <Card className="border-white/20 bg-white/50 p-8 text-center shadow-2xl shadow-black/5 backdrop-blur-xl">
      <h3 className="font-display text-2xl font-semibold">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-foreground/65">{subtitle}</p>
      <button
        type="button"
        onClick={onClearSearch}
        className="mt-6 rounded-full border border-black/10 bg-black px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-white transition-transform hover:-translate-y-0.5"
      >
        Clear search
      </button>
    </Card>
  );
}

function HomeView({ counts }: { counts: Record<string, number> }) {
  const cards = [
    { title: "Blogs", value: counts.blogs, copy: "Long-form thoughts, experiments, and reflections." },
    { title: "Docs", value: counts.docs, copy: "Structured notes, references, and project documentation." },
    { title: "Guide", value: counts.guide, copy: "Playbooks and tutorials that expand across multiple titles." },
    { title: "Files", value: counts.files, copy: "Uploaded files and assets from the knowledge base." },
    { title: "Diary", value: counts.diary, copy: "Short daily updates and personal logs." },
    { title: "Code", value: counts.code, copy: "Folders and files from code workspaces." },
    { title: "Architectures", value: counts.architectures, copy: "Diagram boards and visual system maps." },
    { title: "Projects", value: counts.projects, copy: "Product work and production builds." },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle title="Home" kicker="Overview" count={cards.length} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title} className="group border-white/20 bg-white/55 p-6 shadow-2xl shadow-black/5 backdrop-blur-xl transition-transform hover:-translate-y-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="label-mono text-foreground/50">Collection</div>
                <h3 className="mt-2 font-display text-2xl font-semibold">{card.title}</h3>
              </div>
              <div className="rounded-full border border-white/20 bg-black px-3 py-1 text-[12px] font-semibold text-white">{String(card.value).padStart(2, "0")}</div>
            </div>
            <p className="mt-4 text-sm leading-7 text-foreground/70">{card.copy}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BlogsView({ items, search, onClearSearch }: { items: any[]; search: string; onClearSearch: () => void }) {
  const filtered = items;

  return (
    <div className="space-y-6">
      <SectionTitle title="Blogs" kicker="Long-form writing" count={filtered.length} />
      {search && filtered.length === 0 ? (
        <EmptyState title="No blogs matched your search." subtitle="Try a different keyword or clear the search bar to browse everything again." onClearSearch={onClearSearch} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No blogs yet." subtitle="Once blog content is added to the backend, it will appear here in a two-column premium layout." onClearSearch={onClearSearch} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {filtered.map((blog) => (
            <Card key={blog._id || blog.blogId || blog.slug || blog.title} className="group overflow-hidden border-white/20 bg-white/55 shadow-2xl shadow-black/5 backdrop-blur-xl transition-transform hover:-translate-y-1">
              <div className="grid h-full grid-cols-1 lg:grid-cols-[240px_1fr]">
                <div className="relative min-h-[220px] overflow-hidden bg-gradient-to-br from-amber-100 via-white to-stone-200">
                  {imageFrom(blog) ? (
                    <img src={imageFrom(blog)} alt={blog.title || "Blog cover"} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-foreground/30">
                      <BookOpenText className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <div className="p-6 lg:p-7">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Badge variant="secondary" className="bg-black text-white">{blog.subject || "Blog"}</Badge>
                    <span className="label-mono text-[11px] text-foreground/55">{formatDate(blog.datetime || blog.created_at)}</span>
                  </div>
                  <h3 className="mt-4 font-display text-[1.9rem] font-semibold leading-[1.1]">{blog.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-foreground/70">{blog.shortDescription || blog.description || "Read the full blog for the complete breakdown."}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {(blog.tags || []).slice(0, 5).map((tag: string) => (
                      <span key={tag} className="rounded-full border border-white/20 bg-black/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/70">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function DocsView({ items, search, onClearSearch }: { items: any[]; search: string; onClearSearch: () => void }) {
  return (
    <div className="space-y-6">
      <SectionTitle title="Docs" kicker="Documentation and references" count={items.length} />
      {search && items.length === 0 ? (
        <EmptyState title="No docs matched your search." subtitle="Clear the filter or try another term." onClearSearch={onClearSearch} />
      ) : items.length === 0 ? (
        <EmptyState title="No docs available." subtitle="Documentation entries will appear here once the backend returns them." onClearSearch={onClearSearch} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((doc) => (
            <Card key={doc._id || doc.docId || doc.slug || doc.title} className="border-white/20 bg-white/55 p-6 shadow-2xl shadow-black/5 backdrop-blur-xl transition-transform hover:-translate-y-1">
              <Badge variant="secondary" className="bg-black text-white">{doc.subject || "Doc"}</Badge>
              <h3 className="mt-4 font-display text-2xl font-semibold">{doc.title}</h3>
              <p className="mt-3 text-sm leading-7 text-foreground/70">{doc.description || "Structured documentation with related files and references."}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {(doc.tags || []).slice(0, 4).map((tag: string) => (
                  <span key={tag} className="rounded-full border border-white/20 bg-black/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/70">
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function GuideView({ items, search, onClearSearch }: { items: any[]; search: string; onClearSearch: () => void }) {
  return (
    <div className="space-y-6">
      <SectionTitle title="Guide" kicker="Guides and title collections" count={items.length} />
      {search && items.length === 0 ? (
        <EmptyState title="No guides matched your search." subtitle="Try a different keyword or clear the search bar." onClearSearch={onClearSearch} />
      ) : items.length === 0 ? (
        <EmptyState title="No guides available." subtitle="Guide collections will appear here once the backend responds with data." onClearSearch={onClearSearch} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((guide) => (
            <Card key={guide._id || guide.guideId || guide.guideSlug || guide.name} className="border-white/20 bg-white/55 p-6 shadow-2xl shadow-black/5 backdrop-blur-xl transition-transform hover:-translate-y-1">
              <div className="flex items-center justify-between gap-3">
                <Badge className="bg-black text-white">{guide.topic || "Guide"}</Badge>
                <span className="label-mono text-[11px] text-foreground/55">{(guide.titles || []).length} titles</span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-semibold">{guide.name}</h3>
              <p className="mt-3 text-sm leading-7 text-foreground/70">{guide.description || "Guides with nested titles and documents."}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FilesView({ items, search, onClearSearch }: { items: any[]; search: string; onClearSearch: () => void }) {
  return (
    <div className="space-y-6">
      <SectionTitle title="Files" kicker="Uploads and assets" count={items.length} />
      {search && items.length === 0 ? (
        <EmptyState title="No files matched your search." subtitle="Try another filename, folder, or file type." onClearSearch={onClearSearch} />
      ) : items.length === 0 ? (
        <EmptyState title="No files available." subtitle="Uploaded files will appear here once the backend returns them." onClearSearch={onClearSearch} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((file) => (
            <Card key={file._id || file.fileId || file.filename} className="border-white/20 bg-white/55 p-6 shadow-2xl shadow-black/5 backdrop-blur-xl transition-transform hover:-translate-y-1">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="secondary" className="bg-black text-white">{file.fileType || "file"}</Badge>
                <span className="label-mono text-[11px] text-foreground/55">{formatDate(file.uploadedAt || file.createdAt)}</span>
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">{file.filename || file.name}</h3>
              <p className="mt-2 text-sm leading-7 text-foreground/70">{file.folderPath || file.path || "Root folder"}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function DiaryView({ items, search, onClearSearch }: { items: any[]; search: string; onClearSearch: () => void }) {
  return (
    <div className="space-y-6">
      <SectionTitle title="Diary" kicker="Daily notes" count={items.length} />
      {search && items.length === 0 ? (
        <EmptyState title="No diary entries matched your search." subtitle="Try a date or phrase from the entry." onClearSearch={onClearSearch} />
      ) : items.length === 0 ? (
        <EmptyState title="No diary entries available." subtitle="Diary entries will appear here once the backend returns them." onClearSearch={onClearSearch} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((entry) => (
            <Card key={entry._id || entry.date} className="border-white/20 bg-white/55 p-6 shadow-2xl shadow-black/5 backdrop-blur-xl transition-transform hover:-translate-y-1">
              <div className="flex items-center justify-between gap-3">
                <Badge className="bg-black text-white">Diary</Badge>
                <span className="label-mono text-[11px] text-foreground/55">{entry.date}</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-foreground/70">{excerpt(entry.content || entry.leftContent || entry.rightContent, 220) || "No diary content available."}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CodeView({ items, search, onClearSearch }: { items: any[]; search: string; onClearSearch: () => void }) {
  return (
    <div className="space-y-6">
      <SectionTitle title="Code" kicker="Code files and folders" count={items.length} />
      {search && items.length === 0 ? (
        <EmptyState title="No code files matched your search." subtitle="Try another filename, folder path, or extension." onClearSearch={onClearSearch} />
      ) : items.length === 0 ? (
        <EmptyState title="No code files available." subtitle="Code files will appear here once the backend returns them." onClearSearch={onClearSearch} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((file) => (
            <Card key={file._id || file.fileId || file.filename} className="border-white/20 bg-white/55 p-6 shadow-2xl shadow-black/5 backdrop-blur-xl transition-transform hover:-translate-y-1">
              <div className="flex items-center justify-between gap-3">
                <Badge className="bg-black text-white">Code</Badge>
                <span className="label-mono text-[11px] text-foreground/55">{file.fileType || "text"}</span>
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">{file.filename || file.name}</h3>
              <p className="mt-2 text-sm leading-7 text-foreground/70">{file.folderPath || file.path || "Workspace root"}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ArchitectureView({ items, search, onClearSearch }: { items: any[]; search: string; onClearSearch: () => void }) {
  return (
    <div className="space-y-6">
      <SectionTitle title="Architectures" kicker="Diagrams and systems" count={items.length} />
      {search && items.length === 0 ? (
        <EmptyState title="No architectures matched your search." subtitle="Try another diagram name or ID." onClearSearch={onClearSearch} />
      ) : items.length === 0 ? (
        <EmptyState title="No architectures available." subtitle="Diagram canvases will appear here once the backend returns them." onClearSearch={onClearSearch} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((diagram) => (
            <Card key={diagram._id || diagram.canvasId || diagram.name} className="overflow-hidden border-white/20 bg-white/55 shadow-2xl shadow-black/5 backdrop-blur-xl transition-transform hover:-translate-y-1">
              <div className="aspect-[16/10] bg-gradient-to-br from-stone-900 via-black to-amber-900/70 p-5 text-white">
                <div className="label-mono text-white/70">Architecture</div>
                <div className="mt-3 text-2xl font-display font-semibold leading-tight">{diagram.name}</div>
                <div className="mt-4 text-sm text-white/70">{diagram.canvasId || diagram.viewerId || "Diagram canvas"}</div>
              </div>
              <div className="p-6">
                <p className="text-sm leading-7 text-foreground/70">{diagram.thumbnail ? "Thumbnail available" : "Canvas available via the diagrams route."}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectsView({ items, search, onClearSearch }: { items: any[]; search: string; onClearSearch: () => void }) {
  return (
    <div className="space-y-6">
      <SectionTitle title="Projects" kicker="Shipped work" count={items.length} />
      {search && items.length === 0 ? (
        <EmptyState title="No projects matched your search." subtitle="Try another project title, tag, or description term." onClearSearch={onClearSearch} />
      ) : items.length === 0 ? (
        <EmptyState title="No projects available." subtitle="Project cards will appear here once the backend returns them." onClearSearch={onClearSearch} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((project) => (
            <Card key={project._id || project.projectId || project.slug || project.title} className="group overflow-hidden border-white/20 bg-white/55 shadow-2xl shadow-black/5 backdrop-blur-xl transition-transform hover:-translate-y-1">
              <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-amber-100 via-white to-stone-200">
                {imageFrom(project) ? (
                  <img src={imageFrom(project)} alt={project.title} className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center text-foreground/30">
                    <FolderKanban className="h-12 w-12" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <Badge className="bg-black text-white">Project</Badge>
                <h3 className="mt-4 font-display text-2xl font-semibold leading-tight">{project.title}</h3>
                <p className="mt-3 text-sm leading-7 text-foreground/70">{project.description || project.tagline || "Project details and links."}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {(project.tags || []).slice(0, 4).map((tag: string) => (
                    <span key={tag} className="rounded-full border border-white/20 bg-black/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/70">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}