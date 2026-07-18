import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, X, Upload, Trash2, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
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

interface BlogLink { platform: string; url: string; }
interface Asset { name: string; url: string; filename: string; }

interface EditBlogViewProps {
  blogId: string;
  password: string;
}

export function EditBlogView({ blogId, password }: EditBlogViewProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mdRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [subject, setSubject] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [datetime, setDatetime] = useState("");
  const [footer, setFooter] = useState("");
  const [content, setContent] = useState("");
  const [blogLinks, setBlogLinks] = useState<BlogLink[]>([{ platform: "", url: "" }]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [coverImage, setCoverImage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
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
      setDatetime(blog.datetime ? new Date(blog.datetime).toISOString().split("T")[0] : "");
      setFooter(blog.footer || "");
      setBlogLinks(blog.blogLinks?.length > 0 ? blog.blogLinks : [{ platform: "", url: "" }]);
      setAssets(blog.assets || []);
      setCoverImage(blog.coverImage || "");
      setInitialized(true);
    }
  }, [blog, initialized]);

  useEffect(() => {
    if (contentData?.content !== undefined) {
      setContent(contentData.content || "");
    }
  }, [contentData]);

  const insertAssetPlaceholder = (assetName: string) => {
    const placeholder = `{{${assetName}}}`;
    const ta = mdRef.current;
    if (!ta) { setContent(c => c + `\n![](${placeholder})`); return; }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newContent = content.slice(0, start) + `![](${placeholder})` + content.slice(end);
    setContent(newContent);
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + `![](${placeholder})`.length; ta.focus(); }, 0);
  };

  const addBlogLink = () => setBlogLinks([...blogLinks, { platform: "", url: "" }]);
  const removeBlogLink = (i: number) => setBlogLinks(blogLinks.filter((_, idx) => idx !== i));
  const updateBlogLink = (i: number, field: "platform" | "url", value: string) => {
    const nl = [...blogLinks]; nl[i][field] = value; setBlogLinks(nl);
  };

  const handleUploadCover = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("cover", file);
      const res = await fetch(`${config.apiUrl}/blogs/${blog.blogId}/cover`, { method: "POST", body: formData });
      if (res.ok) { const d = await res.json(); setCoverImage(d.url || d.coverImage || ""); }
    } catch { /* silent */ } finally { setUploading(false); }
  };

  const handleUploadAssets = async (files: FileList) => {
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append("assets", f));
      const res = await fetch(`${config.apiUrl}/blogs/${blog.blogId}/assets`, { method: "POST", body: formData });
      if (res.ok) { const d = await res.json(); setAssets(d.blog.assets || []); }
    } catch { /* silent */ } finally { setUploading(false); }
  };

  const handleDeleteAsset = async (index: number) => {
    if (!confirm("Delete this asset?")) return;
    try {
      const res = await fetch(`${config.apiUrl}/blogs/${blog.blogId}/assets/${index}`, { method: "DELETE" });
      if (res.ok) { const d = await res.json(); setAssets(d.blog.assets || []); }
    } catch { /* silent */ }
  };

  const handleRenameAsset = async (index: number, newName: string) => {
    const updated = [...assets];
    updated[index] = { ...updated[index], name: newName };
    setAssets(updated);
    try {
      await fetch(`${config.apiUrl}/blogs/${blog.blogId}/assets/${index}/name`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
    } catch { /* silent */ }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required"); return; }
    setSubmitting(true);
    setError("");
    try {
      const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
      let processedContent = content;
      assets.forEach(asset => {
        if (asset.name) {
          const re = new RegExp(`\\{\\{${asset.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\}\\}`, "g");
          processedContent = processedContent.replace(re, asset.url);
        }
      });

      const res = await fetch(`${config.apiUrl}/blogs/${blog.blogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, tagline, subject, shortDescription, tags, datetime, footer, blogLinks: blogLinks.filter(l => l.platform && l.url), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update blog");

      if (content.trim()) {
        const blob = new Blob([processedContent], { type: "text/markdown" });
        const formData = new FormData();
        formData.append("mdFile", blob, `${blog.blogId}.md`);
        await fetch(`${config.apiUrl}/blogs/${blog.blogId}/md-file`, { method: "POST", body: formData });
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
        <div className="flex-1 flex items-center justify-center"><PremiumLoader /></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="h-screen flex flex-col bg-[#FFF8F0]">
        <Header activeTab="blogs" onTabChange={(tab) => navigate({ to: "/learnings", search: { tab } })} tabs={tabs} />
        <div className="flex-1 flex items-center justify-center"><p className="text-red-600 font-bold">Blog not found</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <Header activeTab="blogs" onTabChange={(tab) => navigate({ to: "/learnings", search: { tab } })} tabs={tabs} />

      {uploading && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-black text-white text-center py-2 text-xs font-semibold tracking-widest uppercase">
          Uploading…
        </div>
      )}

      {/* Top bar */}
      <div className="border-b border-black/10 bg-[#FFF8F0] px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: `/learnings/blogs/${blogId}` })}
            className="flex items-center gap-1.5 text-black/50 hover:text-black text-xs font-semibold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <span className="text-black/20">|</span>
          <span className="text-xs font-mono text-black/40">Edit Blog</span>
          <span className="text-xs font-mono text-black/30">{blogId}</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate({ to: `/learnings/blogs/${blogId}` })}
            className="px-4 py-1.5 border border-black/20 text-xs font-semibold uppercase tracking-wide hover:bg-black/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit as any}
            disabled={submitting}
            className="px-5 py-1.5 bg-black text-white text-xs font-semibold uppercase tracking-wide hover:bg-[#8B4513] disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-3 border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      {/* Main split layout */}
      <div className="flex h-[calc(100vh-105px)]">
        {/* LEFT — 30% metadata panel */}
        <div className="w-[30%] min-w-[260px] border-r border-black/10 overflow-y-auto bg-[#FDFAF5]">
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <MetaSection label="Basic Information">
              <MetaField label="Title *">
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="meta-input" placeholder="Blog title" />
              </MetaField>
              <MetaField label="Tagline">
                <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} className="meta-input" placeholder="Short tagline" />
              </MetaField>
              <MetaField label="Subject">
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="meta-input" placeholder="e.g. Engineering" />
              </MetaField>
              <MetaField label="Date">
                <input type="date" value={datetime} onChange={e => setDatetime(e.target.value)} className="meta-input" />
              </MetaField>
              <MetaField label="Short Description">
                <textarea value={shortDescription} onChange={e => setShortDescription(e.target.value)} className="meta-input min-h-[64px] resize-y" placeholder="Brief description" />
              </MetaField>
              <MetaField label="Tags (comma-separated)">
                <input type="text" value={tagsInput} onChange={e => setTagsInput(e.target.value)} className="meta-input" placeholder="react, kafka, ..." />
              </MetaField>
              <MetaField label="Footer">
                <input type="text" value={footer} onChange={e => setFooter(e.target.value)} className="meta-input" placeholder="Footer text" />
              </MetaField>
            </MetaSection>

            {/* Blog Links */}
            <MetaSection label="Blog Links">
              <div className="space-y-2">
                {blogLinks.map((link, i) => (
                  <div key={i} className="flex gap-1.5 items-center">
                    <input type="text" value={link.platform} onChange={e => updateBlogLink(i, "platform", e.target.value)} className="meta-input flex-1 min-w-0" placeholder="Platform" />
                    <input type="url" value={link.url} onChange={e => updateBlogLink(i, "url", e.target.value)} className="meta-input flex-1 min-w-0" placeholder="URL" />
                    {blogLinks.length > 1 && (
                      <button type="button" onClick={() => removeBlogLink(i)} className="text-black/30 hover:text-red-500 shrink-0">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addBlogLink}
                  className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-black/40 hover:text-black"
                >
                  <Plus className="h-3 w-3" /> Add Link
                </button>
              </div>
            </MetaSection>

            {/* Cover Image */}
            <MetaSection label="Cover Image">
              <label className="block cursor-pointer">
                <div className="border border-dashed border-black/20 rounded p-3 text-center text-xs font-semibold text-black/40 hover:border-black/40 hover:text-black/60 transition flex items-center justify-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  {coverImage ? "Change Cover" : "Upload Cover"}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUploadCover(e.target.files[0])} />
              </label>
              {coverImage && (
                <img src={coverImage} alt="Cover" className="mt-2 w-full h-28 object-cover rounded border border-black/10" />
              )}
            </MetaSection>

            {/* Assets */}
            <MetaSection label="Assets">
              <label className="block cursor-pointer mb-2">
                <div className="border border-dashed border-black/20 rounded p-2.5 text-center text-xs font-semibold text-black/40 hover:border-black/40 hover:text-black/60 transition flex items-center justify-center gap-2">
                  <Upload className="h-3.5 w-3.5" /> Add Assets
                </div>
                <input type="file" multiple accept="image/*" className="hidden" onChange={e => e.target.files && handleUploadAssets(e.target.files)} />
              </label>

              {assets.length === 0 ? (
                <p className="text-[11px] text-black/30 text-center py-2">No assets yet</p>
              ) : (
                <div className="space-y-2">
                  {assets.map((asset, idx) => (
                    <div key={idx} className="border border-black/10 rounded p-2 bg-white space-y-1.5">
                      <img src={asset.url} alt={asset.filename} className="w-full h-20 object-cover rounded border border-black/10" />
                      <div>
                        <label className="label-tiny">Filename</label>
                        <input type="text" value={asset.filename} readOnly className="meta-input bg-black/5 text-[10px]" />
                      </div>
                      <div>
                        <label className="label-tiny">Asset Name *</label>
                        <input
                          type="text"
                          value={asset.name}
                          onChange={e => handleRenameAsset(idx, e.target.value)}
                          className="meta-input text-[11px]"
                          placeholder="e.g. diagram-1"
                        />
                        <p className="text-[9px] text-black/30 mt-0.5">Use: <code>{`{{${asset.name || "name"}}}`}</code></p>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => insertAssetPlaceholder(asset.name)}
                          className="flex-1 text-[10px] font-semibold py-1 border border-black/20 hover:bg-black hover:text-white transition rounded text-center"
                        >
                          Insert into MD
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAsset(idx)}
                          className="text-[10px] font-semibold py-1 px-2 border border-red-200 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </MetaSection>
          </form>
        </div>

        {/* RIGHT — 70% markdown editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-2 border-b border-black/10 flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-black/40">Markdown</span>
            {assets.length > 0 && (
              <span className="text-[10px] text-black/30">— use <code className="font-mono">{`{{asset-name}}`}</code> to reference assets</span>
            )}
          </div>
          <textarea
            ref={mdRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            className="flex-1 resize-none font-mono text-sm bg-[#FDFAF5] p-4 focus:outline-none text-black/80 leading-relaxed"
            placeholder={"# Your blog title\n\nStart writing your blog here...\n\nReference assets with {{asset-name}}\n![Alt text]({{asset-name}})"}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}

function MetaSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-black/30 mb-2 border-b border-black/8 pb-1">{label}</p>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function MetaField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-tiny">{label}</label>
      {children}
    </div>
  );
}
