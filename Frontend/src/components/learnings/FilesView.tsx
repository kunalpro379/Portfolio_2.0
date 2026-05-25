import { useQuery } from '@tanstack/react-query';
import { Folder } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { config } from '@/config/config';

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

export function FilesView({ search = '' }: FilesViewProps) {
  // Fetch folders from API
  const { data, isLoading, error } = useQuery<FoldersResponse>({
    queryKey: ['folders'],
    queryFn: async () => {
      const response = await fetch(`${config.apiUrl}/notes/folders`);
      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }
      return response.json();
    },
  });

  // Filter folders based on search
  const filteredFolders = useMemo(() => {
    if (!data?.folders) return [];
    
    if (!search) return data.folders;
    
    return data.folders.filter((folder) =>
      folder.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [data?.folders, search]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="h-32 animate-pulse border-b border-black/10 bg-black/5" />
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
        <p className="text-xl text-foreground/60">No folders found</p>
        {search && <p className="mt-2 text-sm text-foreground/40">Try a different search term</p>}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {filteredFolders.map((folder) => {
          const createdDate = new Date(folder.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

          return (
            <Link
              key={folder._id}
              to="/learnings/files/$folderId"
              params={{ folderId: folder.folderId }}
              className="group cursor-pointer border-b border-black/10 pb-4 pr-3 transition-all duration-200 hover:border-[#8B4513]/35 hover:bg-[#8B4513]/5 hover:pl-3 hover:pr-2 block"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center border border-black/10 bg-white text-black transition-all duration-200 group-hover:border-[#8B4513]/35 group-hover:bg-[#8B4513]/8 group-hover:text-[#8B4513] group-hover:shadow-[0_8px_18px_rgba(139,69,19,0.08)]">
                  <Folder className="h-6 w-6" strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate cursor-pointer text-[15px] font-semibold leading-tight text-black transition-colors group-hover:text-[#111111] group-hover:underline group-hover:underline-offset-4">
                    {folder.name}
                  </h3>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-black/45">Folder</p>
                </div>
              </div>

              <div className="space-y-1 text-[12px] text-black/65">
                <div>{createdDate}</div>
                <div className="font-medium text-black">{folder.path}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}