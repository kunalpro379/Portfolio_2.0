import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ChevronRight, Code2, Github } from "lucide-react";
import { config } from "@/config/config";

type CodeFolder = {
  folderId?: string;
  name?: string;
  path?: string;
  language?: string;
  createdAt?: string;
  updatedAt?: string;
  files?: Array<unknown>;
  subfolders?: Array<CodeFolder>;
};

type GitHubRepo = {
  _id?: string;
  name?: string;
  fullName?: string;
  url?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  isPrivate?: boolean;
};

const API_BASE_URL = config.apiUrl;

async function fetchCodeData() {
  const [foldersResponse, reposResponse] = await Promise.all([
    fetch(`${API_BASE_URL}/code/folders?parentPath=`),
    fetch(`${API_BASE_URL}/github/repos`),
  ]);

  const foldersData = foldersResponse.ok ? await foldersResponse.json() : { folders: [] };
  const reposData = reposResponse.ok ? await reposResponse.json() : { repos: [] };

  return {
    folders: foldersData.folders || [],
    repos: reposData.repos || [],
  };
}

function formatDate(dateText?: string) {
  if (!dateText) return "";
  return new Date(dateText).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function getFolderKey(folder: CodeFolder) {
  return folder.path || folder.folderId || folder.name || "";
}

interface CodeViewProps {
  search: string;
}

export function CodeView({ search }: CodeViewProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["code-learning-content"],
    queryFn: fetchCodeData,
  });

  const folders = (data?.folders || []) as CodeFolder[];
  const repos = (data?.repos || []) as GitHubRepo[];

  const searchLower = search.toLowerCase();
  const filteredFolders = folders.filter((folder) => {
    if (!searchLower) return true;
    return [folder.name, folder.path, folder.language].some((value) =>
      (value || "").toLowerCase().includes(searchLower),
    );
  });

  const filteredRepos = repos.filter((repo) => {
    if (!searchLower) return true;
    return [repo.name, repo.fullName, repo.description].some((value) =>
      (value || "").toLowerCase().includes(searchLower),
    );
  });

  const selectedFolderKey = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("folder") || "";
  }, []);

  const titleTones = ["text-black", "text-[#8B4513]", "text-[#B8860B]", "text-stone-800"];
  const dateTones = ["text-black/55", "text-[#8B4513]/65", "text-amber-700/65", "text-stone-600"];

  function openFolder(folder: CodeFolder) {
    const folderKey = getFolderKey(folder);
    if (!folderKey || typeof window === "undefined") return;
    window.location.href = `/learnings?tab=code&folder=${encodeURIComponent(folderKey)}`;
  }

  function openRepo(repo: GitHubRepo) {
    if (!repo.url || typeof window === "undefined") return;
    window.open(repo.url, "_blank", "noopener,noreferrer");
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="flex min-h-[92px] animate-pulse flex-col gap-3 border-y border-black/10 px-4 py-5">
            <div className="h-5 w-3/4 rounded-full bg-black/10" />
            <div className="h-3 w-24 rounded-full bg-black/10" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-5">
      <section className="flex flex-col space-y-4">
        <div className="flex items-end justify-between gap-4 px-4 pt-1">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-black/80">
              Browse your code folders
            </div>
          </div>

          <div className="rounded-none border border-black/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/75">
            {filteredFolders.length} folders
          </div>
        </div>

        {filteredFolders.length === 0 ? (
          <div className="border-y border-black/10 px-4 py-12 text-center">
            <p className="font-display text-2xl font-semibold text-[#8B4513]">No code folders found</p>
          </div>
        ) : (
          <div className="flex flex-wrap border-y border-black/10 bg-transparent">
            {filteredFolders.map((folder, index) => {
              const toneIndex = index % titleTones.length;
              const updatedDate = formatDate(folder.updatedAt || folder.createdAt);
              const folderKey = getFolderKey(folder);
              const isSelected = selectedFolderKey === folderKey;

              return (
                <button
                  key={folderKey || `${index}`}
                  type="button"
                  onClick={() => openFolder(folder)}
                  className={`group flex w-full cursor-pointer flex-col gap-2 border-b border-black/10 px-3 py-4 text-left transition-colors hover:bg-white/30 hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] sm:px-4 sm:py-5 lg:w-1/4 lg:border-r ${index < 4 ? "border-t" : ""} ${(index + 1) % 4 === 0 ? "lg:border-r-0" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`font-display text-[clamp(0.92rem,1.25vw,1.15rem)] font-semibold leading-tight transition-all ${titleTones[toneIndex]} ${isSelected ? "underline decoration-current decoration-1 underline-offset-[6px]" : "group-hover:underline group-hover:decoration-black/25 group-hover:decoration-1 group-hover:underline-offset-[6px]"}`}>
                      <Github className="mr-2 inline-block h-4 w-4 -translate-y-[1px] text-black/70" strokeWidth={2.1} />
                      {folder.name || "Untitled folder"}
                    </div>

                    <div className={`shrink-0 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${dateTones[toneIndex]}`}>
                      {updatedDate || "No date"}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pl-0.5 text-black/40 transition-colors group-hover:text-black/65">
                    <ChevronRight className={`h-3.5 w-3.5 rotate-90 transition-transform ${isSelected ? "translate-y-0.5" : ""}`} strokeWidth={2.25} />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.2em]">
                      Open
                    </span>
                  </div>

                  {isSelected && folder.path && (
                    <div className="pl-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/45">
                      Path: {folder.path}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4 px-4 pt-1">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-black/80">
              GitHub repos
            </div>
          </div>

          <div className="rounded-none border border-black/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/75">
            {filteredRepos.length} repos
          </div>
        </div>

        {filteredRepos.length === 0 ? (
          <div className="border-y border-black/10 px-4 py-12 text-center">
            <p className="font-display text-2xl font-semibold text-[#8B4513]">No GitHub repos found</p>
          </div>
        ) : (
          <div className="flex flex-wrap border-y border-black/10 bg-transparent">
            {filteredRepos.map((repo, index) => {
              const toneIndex = index % titleTones.length;
              const updatedDate = formatDate(repo.updatedAt || repo.createdAt);
              const repoKey = repo._id || repo.fullName || repo.name || `${index}`;

              return (
                <button
                  key={repoKey}
                  type="button"
                  onClick={() => openRepo(repo)}
                  className={`group flex w-full cursor-pointer flex-col gap-2 border-b border-black/10 px-3 py-4 text-left transition-colors hover:bg-white/30 hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] sm:px-4 sm:py-5 lg:w-1/4 lg:border-r ${index < 4 ? "border-t" : ""} ${(index + 1) % 4 === 0 ? "lg:border-r-0" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`min-w-0 flex-1 font-display text-[clamp(0.82rem,1.05vw,1rem)] font-semibold leading-tight transition-all ${titleTones[toneIndex]} ${repo.url ? "group-hover:underline group-hover:decoration-black/25 group-hover:decoration-1 group-hover:underline-offset-[6px]" : ""}`}>
                      <Github className="mr-2 inline-block h-4 w-4 -translate-y-[1px] text-black/70" strokeWidth={2.1} />
                      <span className="break-words">
                        {repo.name || "Untitled repo"}
                      </span>
                    </div>

                    <div className={`shrink-0 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${dateTones[toneIndex]}`}>
                      {updatedDate || "No date"}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pl-0.5 text-black/40 transition-colors group-hover:text-black/65">
                    <ChevronRight className="h-3.5 w-3.5 rotate-90 transition-transform group-hover:translate-y-0.5" strokeWidth={2.25} />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.2em]">
                      Open
                    </span>
                  </div>

                  {repo.description && (
                    <div className="pl-0.5 text-[10px] font-medium leading-5 text-black/55 line-clamp-2 break-words">
                      {repo.description}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}