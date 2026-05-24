import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/learnings/Header";
import { BlogsView } from "@/components/learnings/BlogsView";
import { DocsView } from "@/components/learnings/DocsView";
import { ProjectsView } from "@/components/learnings/ProjectsView";
import { ComingSoonView } from "@/components/learnings/ComingSoonView";

export const Route = createFileRoute("/learnings")({ component: LearningsPage });

const tabs = [
  { label: "Blogs", value: "blogs", bold: true },
  { label: "Docs", value: "docs" },
  { label: "Guide", value: "guide" },
  { label: "Files", value: "files" },
  { label: "Diary", value: "diary" },
  { label: "Code", value: "code" },
  { label: "Architectures", value: "architectures" },
  { label: "Projects", value: "projects" },
];

function LearningsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("blogs");

  const getActiveLabel = () => {
    const tab = tabs.find(n => n.value === activeTab);
    return tab?.label || "Content";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "blogs":
        return <BlogsView search={search} />;
      case "docs":
        return <DocsView search={search} />;
      case "projects":
        return <ProjectsView search={search} />;
      case "guide":
        return <ComingSoonView title="Guide" />;
      case "files":
        return <ComingSoonView title="Files" />;
      case "diary":
        return <ComingSoonView title="Diary" />;
      case "code":
        return <ComingSoonView title="Code" />;
      case "architectures":
        return <ComingSoonView title="Architectures" />;
      default:
        return <ComingSoonView title={getActiveLabel()} />;
    }
  };

  return (
    <main className="min-h-screen">
      <Header activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
      
      {/* Page Content with Search Bar and Title in Same Row */}
      <div className="mx-auto max-w-[1400px] px-6 py-2 lg:px-10">
        <div className="flex items-center justify-between gap-4 mb-3">
          {/* Selected Tab Title - Bold and Large with Brown Premium Color */}
          <h1 className="font-display text-[3.5rem] font-bold leading-tight text-[#8B4513] whitespace-nowrap">
            {getActiveLabel()}
          </h1>
          
          {/* Premium Search Bar */}
          <div className="relative flex-1 max-w-2xl">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blogs, docs, guides..."
              className="w-full h-14 pl-14 pr-6 rounded-2xl border-2 border-black/10 bg-cream/50 text-[15px] font-medium text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent focus:bg-white transition-all shadow-lg hover:shadow-xl"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-6">
          {renderContent()}
        </div>
      </div>
    </main>
  );
}
