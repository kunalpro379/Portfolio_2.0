import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Calendar, ExternalLink, FileText, Link as LinkIcon, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Header } from './Header';
import { config } from '@/config/config';
import { PremiumLoader } from './PremiumLoader';

interface Blog {
  blogId: string;
  title: string;
  slug: string;
  tagline: string;
  subject: string;
  shortDescription: string;
  content: string;
  tags: string[];
  datetime: string;
  footer: string;
  coverImage: string;
  blogLinks: Array<{ name: string; url: string }>;
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface BlogDetailViewProps {
  blogId: string;
}

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

export function BlogDetailView({ blogId }: BlogDetailViewProps) {
  const navigate = useNavigate();
  const [activeTab] = useState("blogs");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('');

  const handleTabChange = (tab: string) => {
    navigate({ to: '/learnings', search: { tab } });
  };

  // Fetch blog data
  const { data: blog, isLoading, error } = useQuery<Blog>({
    queryKey: ['blog-detail', blogId],
    queryFn: async () => {
      const url = `${config.apiUrl}/blogs/${blogId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch blog');
      }
      const result = await response.json();
      return result.blog;
    },
  });

  // Fetch markdown content separately
  const { data: contentData } = useQuery({
    queryKey: ['blog-content', blogId],
    queryFn: async () => {
      const url = `${config.apiUrl}/blogs/${blogId}/md-content`;
      const response = await fetch(url);
      if (!response.ok) return { content: '' };
      return response.json();
    },
    enabled: !!blog,
  });

  const content = contentData?.content || '';

  // Extract headings from markdown
  const headings = useMemo(() => {
    if (!content) return [];
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const matches = [...content.matchAll(headingRegex)];
    return matches.map((match, index) => ({
      id: `heading-${index}`,
      text: match[2],
      level: match[1].length
    }));
  }, [content]);

  const scrollToSection = (headingId: string) => {
    const element = document.getElementById(headingId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(headingId);
    }
  };

  // Custom markdown components
  const components = {
    h1: ({ children, ...props }: any) => {
      const index = headings.findIndex(h => h.text === children);
      const id = index >= 0 ? headings[index].id : '';
      return <h1 id={id} className="text-3xl font-bold text-black mb-4 mt-8" {...props}>{children}</h1>;
    },
    h2: ({ children, ...props }: any) => {
      const index = headings.findIndex(h => h.text === children);
      const id = index >= 0 ? headings[index].id : '';
      return <h2 id={id} className="text-2xl font-semibold text-black mb-3 mt-6" {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }: any) => {
      const index = headings.findIndex(h => h.text === children);
      const id = index >= 0 ? headings[index].id : '';
      return <h3 id={id} className="text-xl font-semibold text-black mb-2 mt-4" {...props}>{children}</h3>;
    },
    p: ({ children, ...props }: any) => <p className="text-black/80 mb-4 leading-7" {...props}>{children}</p>,
    ul: ({ children, ...props }: any) => <ul className="list-disc list-inside mb-4 space-y-1 text-black/80" {...props}>{children}</ul>,
    ol: ({ children, ...props }: any) => <ol className="list-decimal list-inside mb-4 space-y-1 text-black/80" {...props}>{children}</ol>,
    code: ({ inline, children, ...props }: any) => 
      inline ? (
        <code className="px-1.5 py-0.5 bg-black/5 border border-black/10 rounded text-sm font-mono" {...props}>{children}</code>
      ) : (
        <code className="block p-4 bg-black text-white rounded-lg overflow-x-auto font-mono text-sm" {...props}>{children}</code>
      ),
    pre: ({ children, ...props }: any) => <pre className="mb-4 rounded-lg overflow-hidden" {...props}>{children}</pre>,
    a: ({ href, children, ...props }: any) => (
      <a href={href} className="text-[#8B4513] font-semibold underline hover:text-[#6B3410]" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
    ),
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-white">
        <Header activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />
        <div className="flex-1 flex items-center justify-center">
          <PremiumLoader />
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="h-screen flex flex-col bg-white">
        <Header activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-xl mb-4 font-bold">Blog not found</p>
            <button
              onClick={() => navigate({ to: '/learnings' })}
              className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-black/90"
            >
              Back to Blogs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <Header activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 relative">
        {/* Left Sidebar - Blog Info */}
        <div 
          className={`border-r border-[#8B4513]/30 bg-[#FFF8F0] overflow-y-auto transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'w-full md:w-1/5' : 'w-0'
          }`}
          style={{ flexShrink: 0 }}
        >
          <div className={`${sidebarOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 p-4 space-y-4`}>
            <button
              onClick={() => navigate({ to: '/learnings' })}
              className="flex items-center gap-1.5 text-black hover:text-[#8B4513] font-semibold text-xs mb-3"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Blogs
            </button>

            {/* Subject Badge */}
            <div>
              <span className="px-3 py-1 bg-[#8B4513]/10 border border-[#8B4513]/30 rounded-lg text-xs font-bold text-[#8B4513]">
                {blog.subject}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold text-black leading-tight">
              {blog.title}
            </h2>

            {/* Tagline */}
            {blog.tagline && (
              <p className="text-xs text-black/70">{blog.tagline}</p>
            )}

            {/* Date */}
            <div className="flex items-center gap-2 text-xs text-black/60">
              <Calendar size={12} />
              <span>
                {new Date(blog.datetime).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>

            <div className="border-t border-[#8B4513]/20"></div>

            {/* Table of Contents */}
            {headings.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-3.5 h-3.5" />
                  <h3 className="font-bold text-xs uppercase">Contents</h3>
                </div>
                <div className="space-y-1">
                  {headings.map((heading) => (
                    <button
                      key={heading.id}
                      onClick={() => scrollToSection(heading.id)}
                      className={`w-full text-left p-2 rounded-lg transition-all text-xs cursor-pointer ${
                        activeSection === heading.id
                          ? 'bg-[#8B4513]/20 border border-[#8B4513]'
                          : 'hover:bg-[#8B4513]/10'
                      }`}
                      style={{ paddingLeft: `${heading.level * 8}px` }}
                    >
                      {heading.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-3.5 h-3.5" />
                  <h3 className="font-bold text-xs uppercase">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {blog.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 text-[10px] bg-white border border-[#8B4513]/30 rounded font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* External Links */}
            {blog.blogLinks && blog.blogLinks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon className="w-3.5 h-3.5" />
                  <h3 className="font-bold text-xs uppercase">Links</h3>
                </div>
                <div className="space-y-1.5">
                  {blog.blogLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-white border border-[#8B4513]/30 rounded-lg hover:bg-[#8B4513]/10 transition-all"
                    >
                      <ExternalLink size={12} />
                      <span className="text-xs font-semibold truncate flex-1">{link.name || 'Link'}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-[#8B4513] text-white p-2 rounded-r-lg shadow-lg hover:bg-[#6B3410] transition-all duration-200"
          style={{ left: sidebarOpen ? 'calc(20% - 1px)' : '0' }}
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {/* Right Section - Markdown Content */}
        <div className="flex-1 bg-white overflow-y-auto">
          <div className="max-w-5xl mx-auto px-3 py-4">
            <article className="prose prose-slate max-w-none">
              {content ? (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={components}
                >
                  {content}
                </ReactMarkdown>
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 mb-3 opacity-20" />
                  <p className="text-black/60">No content available</p>
                </div>
              )}

              {/* Footer */}
              {blog.footer && (
                <footer className="border-t border-[#8B4513]/20 pt-6 mt-8">
                  <p className="text-black/70 text-sm">{blog.footer}</p>
                </footer>
              )}
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
