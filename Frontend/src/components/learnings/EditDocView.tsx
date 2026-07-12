import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { config } from "@/config/config";
import { Header } from "./Header";
import { PremiumLoader } from "./PremiumLoader";

const tabs = [
  { label: "Blogs", value: "blogs" },
  { label: "Docs", value: "docs", bold: true },
  { label: "Guide", value: "guide" },
  { label: "Files", value: "files" },
  { label: "Diary", value: "diary" },
  { label: "Code", value: "code" },
  { label: "Architectures", value: "architectures" },
  { label: "Projects", value: "projects" },
];

interface EditDocViewProps {
  docId: string;
  password: string;
}

export function EditDocView({ docId, password }: EditDocViewProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState(false);

  const { data: docData, isLoading } = useQuery({
    queryKey: ["doc-detail", docId],
    queryFn: async () => {
      const res = await fetch(`${config.apiUrl}/documentation/${docId}`);
      if (!res.ok) throw new Error("Failed to fetch documentation");
      const data = await res.json();
      return data.doc;
    },
  });

  // Fetch first markdown file content
  const firstMarkdown = docData?.files?.find((f: any) => f.type === "markdown");
  const { data: fileContentData, isLoading: loadingContent } = useQuery({
    queryKey: ["doc-file-content", firstMarkdown?.fileId],
    queryFn: async () => {
      const res = await fetch(`${config.apiUrl}/documentation/${docData._id}/files/${firstMarkdown.fileId}`);
      if (!res.ok) return { content: "" };
      const d = await res.json();
      return { content: d.file?.content || d.content || "" };
    },
    enabled: !!firstMarkdown && !!docData,
  });

  useEffect(() => {
    if (docData && !initialized) {
      setTitle(docData.title || "");
      setSubject(docData.subject || "");
      setDescription(docData.description || "");
      setTagsInput((docData.tags || []).join(", "));
      setIsPublic(docData.isPublic ?? true);
      setInitialized(true);
    }
  }, [docData, initialized]);

  useEffect(() => {
    if (fileContentData?.content) {
      setContent(fileContentData.content);
    }
  }, [fileContentData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) { setError("Title and subject are required"); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${config.apiUrl}/documentation/${docData.docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subject,
          description,
          tags: tagsInput,
          content,
          isPublic,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update documentation");

      // Update the markdown file content if there's a first markdown file
      if (firstMarkdown && content.trim()) {
        await fetch(`${config.apiUrl}/documentation/${docData._id}/files/${firstMarkdown.fileId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, password }),
        });
      }

      queryClient.invalidateQueries({ queryKey: ["docs"] });
      queryClient.invalidateQueries({ queryKey: ["doc-detail", docId] });
      queryClient.invalidateQueries({ queryKey: ["doc-file-content", firstMarkdown?.fileId] });
      navigate({ to: `/learnings/docs/${docId}` });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update documentation");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loadingContent) {
    return (
      <div className="h-screen flex flex-col bg-[#FFF8F0]">
        <Header activeTab="docs" onTabChange={(tab) => navigate({ to: "/learnings", search: { tab } })} tabs={tabs} />
        <div className="flex-1 flex items-center justify-center">
          <PremiumLoader />
        </div>
      </div>
    );
  }

  if (!docData) {
    return (
      <div className="h-screen flex flex-col bg-[#FFF8F0]">
        <Header activeTab="docs" onTabChange={(tab) => navigate({ to: "/learnings", search: { tab } })} tabs={tabs} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-600 font-bold">Documentation not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <Header activeTab="docs" onTabChange={(tab) => navigate({ to: "/learnings", search: { tab } })} tabs={tabs} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate({ to: `/learnings/docs/${docId}` })}
          className="flex items-center gap-1.5 text-black/60 hover:text-black font-semibold text-xs mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Doc
        </button>

        <h1 className="text-2xl font-bold text-black mb-6">Edit Documentation</h1>

        {error && (
          <div className="mb-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Title *">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-base" placeholder="Documentation title" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Subject *">
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="input-base" placeholder="e.g. System Design" />
            </Field>
            <Field label="Tags (comma-separated)">
              <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="input-base" placeholder="redis, cache, ..." />
            </Field>
          </div>
          <Field label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-base min-h-[72px] resize-y" placeholder="Brief description" />
          </Field>
          <Field label="Content (Markdown)">
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="input-base font-mono text-sm min-h-[300px] resize-y" placeholder="# Your documentation content here..." />
          </Field>
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium uppercase tracking-wider text-black/70">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="h-4 w-4 border-2 border-black" />
            Public (visible to all)
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate({ to: `/learnings/docs/${docId}` })} className="flex-1 border-2 border-black/25 py-3 text-sm font-semibold uppercase tracking-wide hover:bg-black/5">
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
