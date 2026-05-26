import { useQuery } from "@tanstack/react-query";
import { Folder, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { config } from "@/config/config";

interface FolderData {
  _id: string;
  folderId: string;
  name: string;
  path: string;
  parentPath: string;
  createdAt: string;
  __v: number;
}

interface FoldersResponse {
  folders: FolderData[];
}

interface FilesViewProps {
  search?: string;
}

function formatFolderDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function FilesView({ search = "" }: FilesViewProps) {
  const { data, isLoading, error } = useQuery<FoldersResponse>({
    queryKey: ["folders"],
    queryFn: async () => {
      const response = await fetch(`${config.apiUrl}/notes/folders`);
      if (!response.ok) throw new Error("Failed to fetch folders");
      return response.json();
    },
  });

  const filteredFolders = useMemo(() => {
    if (!data?.folders) return [];
    const list = search
      ? data.folders.filter((folder) =>
          folder.name.toLowerCase().includes(search.toLowerCase()),
        )
      : [...data.folders];
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [data?.folders, search]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-[108px] animate-pulse border border-black/10 bg-black/[0.04]"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-xl text-red-600">Failed to load folders</p>
        <p className="mt-2 text-sm text-foreground/40">Please try again later</p>
      </div>
    );
  }

  if (filteredFolders.length === 0) {
    return (
      <div className="py-20 text-center">
        <Folder className="mx-auto mb-4 h-12 w-12 text-black/15" strokeWidth={1.5} />
        <p className="text-xl text-foreground/60">No folders found</p>
        {search && <p className="mt-2 text-sm text-foreground/40">Try a different search term</p>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {filteredFolders.map((folder) => (
        <Link
          key={folder._id}
          to="/learnings/files/$folderId"
          params={{ folderId: folder.folderId }}
          className="group flex min-h-[108px] flex-col justify-between border border-black/12 bg-white p-3.5 transition-all duration-200 hover:border-[#8B4513]/45 hover:bg-[#FFF8F0] hover:shadow-[4px_4px_0_0_rgba(139,69,19,0.1)] sm:p-4"
        >
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#8B4513]/20 bg-[#FFF8F0] text-[#8B4513] transition-colors group-hover:border-[#8B4513]/40 group-hover:bg-[#8B4513]/10 sm:h-11 sm:w-11">
              <Folder className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 font-display text-[13px] font-bold leading-snug text-black transition-colors group-hover:text-[#8B4513] sm:text-[15px]">
                {folder.name}
              </h3>
              <span className="label-mono mt-1.5 inline-block text-[8px] font-semibold uppercase tracking-[0.2em] text-black/40 sm:text-[9px]">
                Folder
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-black/8 pt-2.5">
            <span className="text-[11px] font-medium text-black/55 sm:text-[12px]">
              {formatFolderDate(folder.createdAt)}
            </span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-black/25 transition-transform group-hover:translate-x-0.5 group-hover:text-[#8B4513]" />
          </div>
        </Link>
      ))}
    </div>
  );
}
