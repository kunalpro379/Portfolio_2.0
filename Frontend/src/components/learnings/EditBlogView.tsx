import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { config } from "@/config/config";
import { Header } from "./Header";
import { PremiumLoader } from "./PremiumLoader";

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

interface EditBlogViewProps {
  blogId: string;
  password: string;
}

export function EditBlogView({ blogId, password }: EditBlogViewProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [subject, setSubject] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [footer, setFooter] = useState("");
  const [content, setContent] = useState("");
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [blogLinks, setBlogLinks] = useState<Array<{ name: string; url: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState(false);

  const { data: blog, isLoading: loadingBlog } = useQuery({
    queryKey: ["blog-detail", blogId],
    queryFn: async () => {
      const res = await fetch(`${config.apiUrl}/blogs/${blogId}`);
      if (!res.ok) throw new Error("Failed to fetch blog");
      const data = await res.json();
      return data.blog;
    },
  });

  const { data: contentData, isLoading: loadingContent } = useQuery({
    queryKey: ["blog-content", blogId],
    queryFn: async () => {
      const res = await fetch(`${config.apiUrl}/blogs/${blogId}/md-content`);
      if (!res.ok) return { content: "" };
      return res.json();
    },
    enabled: !!blog,
  });

  useEffect(() => {
    if (blog && !initialized) {
      setTitle(blog.title || "");
      setTagline(blog.tagline || "");
      setSubject(blog.subject || "");
      setShortDescription(blog.shortDescription || "");
      setTagsInput((blog.tags || []).join(", "));
      setFooter(blog.footer || "");
      setBlogLinks(blog.blogLinks || []);
      setInitialized(true);
    }
  }, [blog, initialized]);

  useEffect(() => {
    if (contentData?.content) {
      setContent(contentData.content);
    }
  }, [contentData]);

  const handleAddLink = () => {
    if (linkName.trim() && linkUrl.trim()) {
      setBlogLinks([...blogLinks, { name: linkName.trim(), url: linkUrl.trim() }]);
      setLinkName("");
      setLinkUrl("");
    }
  };

  const handleRemoveLink = (i: number) => {
    setBlogLinks(blogLinks.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required"); return; }
    setSubmitting(true);
    setError("");
    try {
      const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);

      // Update blog metadata
      const res = await fetch(`${config.apiUrl}/blogs/${blog.blogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, tagline, subject, shortDescription, tags, footer, blogLinks, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update blog");

      // Update content
      if (content.trim()) {
        const blob = new Blob([content], { type: "text/markdown" });
        const formData = new FormData();
        formData.append("mdFile", blob, `${blog.blogId}-content.md`);
        await fetch(`${config.apiUrl}/blogs/${blog.blogId}/md-file`, {
          method: "POST",
          body: formData,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog-detail", blogId] });
      queryClient.invalidateQueries({ queryKey: ["blog-content", blogId] });
      navigate({ to: `/learnings/blogs/${blogId}` });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update blog");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingBlog || loadingContent) {
    return (
      <div className="h-screen flex flex-col bg-[#FFF8F0]">
        <Header activeTab="blogs" onTabChange={(tab) => navigate({ to: "/learnings", search: { tab } })} tabs={tabs} />
        <div className="flex-1 flex items-center justify-center">
          <PremiumLoader />
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="h-screen flex flex-col bg-[#FFF8F0]">
        <Header activeTab="blogs" onTabChange={(tab) => navigate({ to: "/learnings", search: { tab } })} tabs={tabs} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-600 font-bold">Blog not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <Header activeTab="blogs" onTabChange={(tab) => navigate({ to: "/learnings", search: { tab } })} tabs={tabs} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate({ to: `/learnings/blogs/${blogId}` })}
          className="flex items-center gap-1.5 text-black/60 hover:text-black font-semibold text-xs mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Blog
        </button>

        <h1 className="text-2xl font-bold text-black mb-6">Edit Blog</h1>

        {error && (
          <div className="mb-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Title *">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-base" placeholder="Blog title" />
          </Field>
          <Field label="Tagline">
            <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className="input-base" placeholder="Short tagline" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Subject">
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="input-base" placeholder="e.g. Engineering" />
            </Field>
            <Field label="Tags (comma-separated)">
              <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="input-base" placeholder="react, typescript, ..." />
            </Field>
          </div>
          <Field label="Short Description">
            <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="input-base min-h-[72px] resize-y" placeholder="Brief description" />
          </Field>
          <Field label="Content (Markdown)">
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="input-base font-mono text-sm min-h-[280px] resize-y" placeholder="# Your blog content here..." />
          </Field>
          <Field label="Footer">
            <input type="text" value={footer} onChange={(e) => setFooter(e.target.value)} className="input-base" placeholder="Footer text" />
          </Field>
          <Field label="Links">
            <div className="space-y-2">
              {blogLinks.map((link, i) => (
                <div key={i} className="flex items-center gap-2 bg-white border border-black/15 px-3 py-2">
                  <span className="text-xs font-semibold flex-1 truncate">{link.name}</span>
                  <span className="text-xs text-black/40 truncate flex-1">{link.url}</span>
                  <button type="button" onClick={() => handleRemoveLink(i)} className="text-black/40 hover:text-red-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input type="text" value={linkName} onChange={(e) => setLinkName(e.target.value)} className="input-base flex-1" placeholder="Link name" />
                <input type="text" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="input-base flex-1" placeholder="https://..." />
                <button type="button" onClick={handleAddLink} className="border-2 border-black bg-black px-3 text-white hover:bg-[#8B4513]">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Field>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate({ to: `/learnings/blogs/${blogId}` })} className="flex-1 border-2 border-black/25 py-3 text-sm font-semibold uppercase tracking-wide hover:bg-black/5">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 border-2 border-black bg-black py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#8B4513] disabled:opacity-60">
              {submitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-black/60">{label}</label>
      {children}
    </div>
  );
}
