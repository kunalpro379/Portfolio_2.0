import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/learnings/Header";
import { BlogsView } from "@/components/learnings/BlogsView";
import { PremiumNotesView } from "@/components/learnings/PremiumNotesView";
import { ArchitectureView } from "@/components/learnings/ArchitectureView";
import { CodeView } from "@/components/learnings/CodeView";
import { DocsView } from "@/components/learnings/DocsView";
import { FilesView } from "@/components/learnings/FilesView";
import { ProjectsView } from "@/components/learnings/ProjectsView";
import { ComingSoonView } from "@/components/learnings/ComingSoonView";

export const Route = createFileRoute("/learnings")({ component: LearningsPage });

const tabs = [
  { label: "Blogs", value: "blogs", bold: true },
  { label: "Docs", value: "docs" },
  { label: "Files", value: "files" },
  { label: "Diary", value: "diary" },
  { label: "Code", value: "code" },
  { label: "Architectures", value: "architectures" },
  { label: "Projects", value: "projects" },
];

function LearningsPage() {
  // ALL HOOKS MUST BE AT THE TOP - before any conditional returns
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === "undefined") return "blogs";
    return new URLSearchParams(window.location.search).get("tab") || "blogs";
  });
  const matches = useMatches();
  
  const isFullViewTab = activeTab === "diary" || activeTab === "code" || activeTab === "files";
  
  // Check if we're on a child route
  const isOnChildRoute = matches.some(match =>
    match.routeId === '/learnings/files/$folderId' ||
    match.routeId === '/learnings/blogs/$blogId' ||
    match.routeId === '/learnings/docs/$docId' ||
    match.routeId === '/learnings/blogs/create' ||
    match.routeId === '/learnings/blogs/$blogId/edit' ||
    match.routeId === '/learnings/docs/create' ||
    match.routeId === '/learnings/docs/$docId/edit'
  );

  // If on child route, just render the outlet
  if (isOnChildRoute) {
    return <Outlet />;
  }

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
      case "files":
        return <FilesView search={search} setSearch={setSearch} />;
      case "diary":
        return <PremiumNotesView />;
      case "code":
        return <CodeView search={search} />;
      case "architectures":
        return <ArchitectureView search={search} />;
      default:
        return <ComingSoonView title={getActiveLabel()} />;
    }
  };

  return (
    <main 
      className={isFullViewTab ? "flex h-screen flex-col overflow-hidden" : "min-h-screen"}
      style={{ 
        backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.4), rgba(209, 213, 219, 0.5)), url('/page5.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      <Header activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
      {isFullViewTab ? (
        <div className="h-full w-full min-h-0 overflow-hidden px-0 py-0">
          {renderContent()}
        </div>
      ) : (
        <div className={`page-container py-4 sm:py-6 ${activeTab === "files" ? "flex flex-col h-[calc(100vh-60px)]" : ""}`}>
          <div className="mb-4 sm:mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              {getActiveLabel()}
            </h1>

            <div className="relative w-full sm:max-w-md">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="h-9 w-full rounded-md border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm font-medium text-gray-900 placeholder:text-gray-500 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              />
            </div>
          </div>

          <div className={`mt-2 sm:mt-4 ${activeTab === "files" ? "flex-1 min-h-0" : ""}`}>
            {renderContent()}
          </div>
        </div>
      )}
    </main>
  );
}
