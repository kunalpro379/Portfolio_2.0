import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { PenLine } from "lucide-react";
import { config } from "@/config/config";
import { ContentCard } from "./ContentCard";
import { ArchitecturePasswordSidebar } from "./ArchitecturePasswordSidebar";

const API_BASE_URL = config.apiUrl;

async function fetchBlogs() {
  const response = await fetch(`${API_BASE_URL}/blogs`);
  if (!response.ok) throw new Error('Failed to fetch blogs');
  const data = await response.json();
  return data.blogs || [];
}

interface BlogsViewProps {
  search: string;
}

export function BlogsView({ search }: BlogsViewProps) {
  const navigate = useNavigate();
  const [showPasswordSidebar, setShowPasswordSidebar] = useState(false);

  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ["blogs"],
    queryFn: fetchBlogs,
  });

  const filteredBlogs = blogs.filter((item: any) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const title = (item.title || '').toLowerCase();
    const desc = (item.description || item.shortDescription || '').toLowerCase();
    const tags = (item.tags || []).join(' ').toLowerCase();
    return title.includes(searchLower) || desc.includes(searchLower) || tags.includes(searchLower);
  });

  const handlePasswordSubmit = async (password: string) => {
    // Verify password by making a lightweight test call
    const res = await fetch(`${API_BASE_URL}/blogs/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "__verify__", password }),
    });
    // We only care about auth — 401 = wrong password, anything else means it passed auth
    if (res.status === 401) {
      const data = await res.json();
      throw new Error(data.message || "Incorrect password");
    }
    // Password correct — navigate to create page with password in state
    setShowPasswordSidebar(false);
    navigate({ to: "/learnings/blogs/create", search: { password } });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-0 md:grid-cols-3 lg:grid-cols-5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[16/10] bg-black/10 mb-4"></div>
            <div className="h-6 bg-black/10 mb-3 w-3/4"></div>
            <div className="h-4 bg-black/10 mb-2"></div>
            <div className="h-4 bg-black/10 w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setShowPasswordSidebar(true)}
          className="flex items-center gap-2 border border-black/25 bg-transparent px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition-colors hover:bg-black hover:text-white"
        >
          <PenLine className="h-3.5 w-3.5" strokeWidth={2} />
          Write Blog
        </button>
      </div>

      {filteredBlogs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-foreground/60 text-xl">No blogs found</p>
          {search && (
            <p className="text-foreground/40 text-sm mt-2">Try a different search term</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-0 md:grid-cols-3 lg:grid-cols-5">
          {filteredBlogs.map((item: any, idx: number) => (
            <ContentCard
              key={item._id || item.id || idx}
              item={item}
              type="blogs"
              onClick={() => navigate({ to: `/learnings/blogs/${item._id}` })}
            />
          ))}
        </div>
      )}

      <ArchitecturePasswordSidebar
        open={showPasswordSidebar}
        title="Write Blog"
        description="Enter password to create a blog"
        submitLabel="Continue to editor"
        onClose={() => setShowPasswordSidebar(false)}
        onSubmit={handlePasswordSubmit}
      />
    </>
  );
}
