import { useQuery } from '@tanstack/react-query';
import { Folder } from 'lucide-react';
import { config } from '@/config/config';

type KnowledgeBaseFile = {
  fileName?: string;
  fileType?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: {
    sourceType?: string;
    sourceTitle?: string;
    fileName?: string;
  };
};

type FileFolder = {
  title: string;
  date: string;
  fileCount: number;
  sortDate: number;
};

const API_BASE_URL = config.apiUrl;

async function fetchFiles() {
  const response = await fetch(`${API_BASE_URL}/knowledge-base/files`);
  if (!response.ok) throw new Error('Failed to fetch files');
  const data = await response.json();
  return data.files || [];
}

function getFolderTitle(file: KnowledgeBaseFile) {
  const sourceType = (file.metadata?.sourceType || '').toLowerCase();

  if (sourceType) {
    const titleMap: Record<string, string> = {
      project: 'Projects',
      projects: 'Projects',
      blog: 'Blogs',
      blogs: 'Blogs',
      documentation: 'Documentation',
      docs: 'Documentation',
      guide: 'Guides',
      guides: 'Guides',
      code: 'Code',
      architecture: 'Architectures',
      architectures: 'Architectures',
      note: 'Notes',
      notes: 'Notes',
      diagram: 'Diagrams',
      diagrams: 'Diagrams',
    };

    return titleMap[sourceType] || `${sourceType.charAt(0).toUpperCase()}${sourceType.slice(1)}`;
  }

  const extension = (file.fileType || '').toLowerCase();
  const extensionMap: Record<string, string> = {
    '.md': 'Markdown Files',
    '.json': 'JSON Files',
    '.txt': 'Text Files',
  };

  return extensionMap[extension] || 'Files';
}

function formatFolderDate(value: number) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

interface FilesViewProps {
  search: string;
}

export function FilesView({ search }: FilesViewProps) {
  const { data: files = [], isLoading } = useQuery({
    queryKey: ['knowledge-base-files'],
    queryFn: fetchFiles,
  });

  const folders = (files as KnowledgeBaseFile[]).reduce<Record<string, FileFolder>>((acc, file) => {
    const title = getFolderTitle(file);
    const fileDate = new Date(file.updatedAt || file.createdAt || Date.now()).getTime();
    const existing = acc[title];

    if (!existing) {
      acc[title] = {
        title,
        date: formatFolderDate(fileDate),
        fileCount: 1,
        sortDate: fileDate,
      };
      return acc;
    }

    existing.fileCount += 1;
    if (fileDate > existing.sortDate) {
      existing.sortDate = fileDate;
      existing.date = formatFolderDate(fileDate);
    }

    return acc;
  }, {});

  const filteredFolders = Object.values(folders)
    .sort((a, b) => b.sortDate - a.sortDate)
    .filter((item) => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchLower) ||
        item.date.toLowerCase().includes(searchLower) ||
        String(item.fileCount).includes(searchLower)
      );
    });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="h-32 animate-pulse border-b border-black/10 bg-black/5" />
        ))}
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
        {filteredFolders.map((folder, index) => (
          <div
            key={`${folder.title}-${index}`}
            className="group cursor-pointer border-b border-black/10 pb-4 pr-3 transition-all duration-200 hover:border-[#8B4513]/35 hover:bg-[#8B4513]/5 hover:pl-3 hover:pr-2"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center border border-black/10 bg-white text-black transition-all duration-200 group-hover:border-[#8B4513]/35 group-hover:bg-[#8B4513]/8 group-hover:text-[#8B4513] group-hover:shadow-[0_8px_18px_rgba(139,69,19,0.08)]">
                <Folder className="h-6 w-6" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <h3 className="truncate cursor-pointer text-[15px] font-semibold leading-tight text-black transition-colors group-hover:text-[#111111] group-hover:underline group-hover:underline-offset-4">
                  {folder.title}
                </h3>
                <p className="text-[11px] uppercase tracking-[0.18em] text-black/45">Folder</p>
              </div>
            </div>

            <div className="space-y-1 text-[12px] text-black/65">
              <div>{folder.date}</div>
              <div className="font-medium text-black">{folder.fileCount} files</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}