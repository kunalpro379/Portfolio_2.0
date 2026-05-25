import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/learnings/Header";
import { BlogsView } from "@/components/learnings/BlogsView";
import { DiaryView } from "@/components/learnings/DiaryView";
import { ArchitectureView } from "@/components/learnings/ArchitectureView";
import { CodeView } from "@/components/learnings/CodeView";
import { DocsView } from "@/components/learnings/DocsView";
import { GuideView } from "@/components/learnings/GuideView";
import { FilesView } from "@/components/learnings/FilesView";
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
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === "undefined") return "blogs";
    return new URLSearchParams(window.location.search).get("tab") || "blogs";
  });
  const isDiaryTab = activeTab === "diary";

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
        return <GuideView search={search} />;
      case "files":
        return <FilesView search={search} />;
      case "diary":
        return <DiaryView />;
      case "code":
        return <CodeView search={search} />;
      case "architectures":
        return <ArchitectureView search={search} />;
      default:
        return <ComingSoonView title={getActiveLabel()} />;
    }
  };

  return (
    <main className={isDiaryTab ? "flex h-screen flex-col overflow-hidden" : "min-h-screen"}>
      <Header activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
      {isDiaryTab ? (
        <div className="h-full min-h-0 overflow-hidden px-2 py-0 lg:px-3">
          {renderContent()}
        </div>
      ) : (
        <div className="mx-auto max-w-[1400px] px-6 py-2 lg:px-10">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h1 className="font-display text-[3.5rem] font-bold leading-tight text-[#8B4513] whitespace-nowrap">
              {getActiveLabel()}
            </h1>

            <div className="relative flex-1 max-w-2xl">
              <svg className="absolute left-5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-black/55" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search blogs, docs, guides..."
                className="h-12 w-full rounded-full border-2 border-black bg-white pl-14 pr-5 text-[14px] font-medium text-black placeholder:text-black/35 transition-all focus:outline-none focus:ring-0 hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.08)]"
              />
            </div>
          </div>

          <div className="mt-6">
            {renderContent()}
          </div>
        </div>
      )}
    </main>
  );
}
