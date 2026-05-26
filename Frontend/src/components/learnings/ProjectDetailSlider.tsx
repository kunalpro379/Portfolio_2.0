import { useEffect, useState, useMemo, useRef } from "react";
import { marked } from "marked";
import mermaid from "mermaid";
import { config } from "@/config/config";
import { Github, ExternalLink, ArrowLeft, FileText, Tag, Link as LinkIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ProjectDetailSliderProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
}

interface MermaidDiagramProps {
  code: string;
}

const MermaidDiagram = ({ code }: MermaidDiagramProps) => {
  const [diagramId] = useState(() => `mermaid-${Math.random().toString(36).slice(2, 10)}`);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: 'base',
          themeVariables: {
            fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
            primaryColor: '#FDFBF7',
            primaryTextColor: '#2C1810',
            primaryBorderColor: '#8B4513',
            lineColor: '#8B4513',
            secondaryColor: '#F5F0E8',
            tertiaryColor: '#FFF9F3',
          },
        });

        const result = await mermaid.render(diagramId, code);

        if (isMounted) {
          setSvg(result.svg);
          setError('');
        }
      } catch (renderError) {
        if (isMounted) {
          setSvg('');
          setError(renderError instanceof Error ? renderError.message : 'Unable to render diagram');
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [code, diagramId]);

  if (error) {
    return (
      <div className="my-8 overflow-hidden rounded-2xl border border-[#8B4513]/20 bg-[#FBF6EE] shadow-sm">
        <div className="border-b border-[#8B4513]/15 bg-white/70 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[#8B4513]">
          Diagram preview unavailable
        </div>
        <pre className="overflow-x-auto p-4 text-[13px] leading-6 text-[#2C1810]">
          {code}
        </pre>
      </div>
    );
  }

  return (
    <figure className="my-8 overflow-hidden rounded-2xl border border-[#8B4513]/20 bg-[#FBF6EE] shadow-sm">
      <figcaption className="border-b border-[#8B4513]/15 bg-white/70 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[#8B4513]">
        Mermaid diagram
      </figcaption>
      <div className="overflow-x-auto p-4 sm:p-6">
        {svg ? (
          <div className="flex min-w-max justify-center" dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-[#8B4513]/20 bg-white/50 px-6 text-sm text-[#8B4513]/70">
            Rendering diagram...
          </div>
        )}
      </div>
    </figure>
  );
};

export function ProjectDetailSlider({ isOpen, onClose, project }: ProjectDetailSliderProps) {
  const [markdownContent, setMarkdownContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const markdownContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchMarkdown = async () => {
      if (project?.projectId) {
        setIsLoading(true);
        try {
          const response = await fetch(`${config.apiUrl}/projects/${project.projectId}/md-content`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('MD content response:', data);
          
          if (data.exists && data.content) {
            let processedContent = data.content.replace(/\r/g, '');
            if (project?.assets && project.assets.length > 0) {
              project.assets.forEach((asset: any) => {
                if (asset && asset.name && asset.url) {
                  const escapedName = asset.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  const placeholder = new RegExp(`\\{\\{${escapedName}\\}\\}`, 'g');
                  processedContent = processedContent.replace(placeholder, asset.url);
                }
              });
            }
            setMarkdownContent(processedContent);
          } else {
            console.log('No MD content available for this project');
            setMarkdownContent("");
          }
        } catch (error) {
          console.error('Failed to fetch markdown:', error);
          setMarkdownContent("");
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('No projectId available');
        setMarkdownContent("");
      }
    };

    if (project) {
      fetchMarkdown();
    }
  }, [project]);

  // Extract headings from markdown
  const headings = useMemo(() => {
    if (!markdownContent) return [];
    
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const matches = [...markdownContent.matchAll(headingRegex)];
    
    return matches.map((match, index) => ({
      id: `heading-${index}`,
      text: match[2].replace(/\{\{.*?\}\}/g, '').trim(),
      level: match[1].length
    }));
  }, [markdownContent]);

  const renderedMarkdown = useMemo(() => {
    if (!markdownContent) return '';

    const diagramReadyMarkdown = markdownContent.replace(
      /```mermaid\s*([\s\S]*?)```/g,
      (_match, diagramCode) => {
        const encodedDiagram = encodeURIComponent(String(diagramCode).trim());
        return `<div class="my-8 rounded-2xl border border-[#8B4513]/20 bg-[#FBF6EE] p-4 shadow-sm" data-mermaid-diagram="${encodedDiagram}"></div>`;
      }
    );

    const parsedHtml = marked.parse(diagramReadyMarkdown, {
      gfm: true,
      breaks: false,
    }) as string;

    let headingIndex = 0;
    return parsedHtml.replace(/<h([1-3])>(.*?)<\/h\1>/g, (_match, level, innerHtml) => {
      const heading = headings[headingIndex];
      const headingId = heading?.id || `heading-${headingIndex}`;
      headingIndex += 1;
      return `<h${level} id="${headingId}" class="scroll-mt-28 font-display">${innerHtml}</h${level}>`;
    });
  }, [headings, markdownContent]);

  useEffect(() => {
    const container = markdownContainerRef.current;
    if (!container || !renderedMarkdown) return;

    let isActive = true;

    const renderDiagrams = async () => {
      const diagramNodes = Array.from(container.querySelectorAll<HTMLElement>('[data-mermaid-diagram]'));

      for (const node of diagramNodes) {
        const diagramCode = decodeURIComponent(node.dataset.mermaidDiagram || '');
        if (!diagramCode) continue;

        try {
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'loose',
            theme: 'base',
            themeVariables: {
              fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
              primaryColor: '#FDFBF7',
              primaryTextColor: '#2C1810',
              primaryBorderColor: '#8B4513',
              lineColor: '#8B4513',
              secondaryColor: '#F5F0E8',
              tertiaryColor: '#FFF9F3',
            },
          });

          const diagramId = `diagram-${Math.random().toString(36).slice(2, 10)}`;
          const result = await mermaid.render(diagramId, diagramCode);

          if (isActive) {
            node.innerHTML = result.svg;
            node.classList.add('overflow-x-auto', 'px-2', 'py-3');
          }
        } catch {
          if (isActive) {
            node.innerHTML = `<pre class="overflow-x-auto rounded-xl bg-white p-4 text-[13px] leading-6 text-[#2C1810]">${diagramCode}</pre>`;
          }
        }
      }
    };

    renderDiagrams();

    return () => {
      isActive = false;
    };
  }, [renderedMarkdown]);

  const scrollToSection = (headingId: string) => {
    const element = document.getElementById(headingId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(headingId);
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSidebarOpen(window.innerWidth >= 768);
    }
  }, [isOpen, project?.projectId]);

  useEffect(() => {
    const container = document.getElementById('project-slider-content');
    if (!container || !isOpen) return;

    const handleScroll = () => {
      const containerBounds = container.getBoundingClientRect();
      const containerTop = containerBounds.top;

      let currentActive = '';
      for (const heading of headings) {
        const el = document.getElementById(heading.id);
        if (el) {
          const elBounds = el.getBoundingClientRect();
          if (elBounds.top - containerTop <= 120) {
            currentActive = heading.id;
          } else {
            break;
          }
        }
      }
      if (currentActive) {
        setActiveSection(currentActive);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [headings, isOpen]);

  if (!project) return null;

  const getTags = () => project.tags || [];
  const getLinks = () => {
    const links = project.links;
    if (!links) return [];
    if (Array.isArray(links)) return links;
    return [
      links.github ? { name: "GitHub", url: links.github } : null,
      links.live ? { name: "Live Demo", url: links.live } : null,
    ].filter(Boolean);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Panel — full screen on mobile (like blog detail), drawer sidebar from left */}
      <div className={`fixed inset-0 z-[101] w-full transform transition-transform duration-500 ease-out md:inset-y-0 md:left-auto md:right-0 md:max-w-6xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex h-full flex-col overflow-hidden bg-white shadow-2xl md:bg-[#FDFBF7]">
          {/* Header — compact on mobile */}
          <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-[#8B4513]/20 bg-white px-3 py-3 md:border-b-2 md:bg-[#FDFBF7] md:px-8 md:py-4">
            <button
              type="button"
              onClick={onClose}
              className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-black transition-colors hover:text-[#8B4513] md:gap-2 md:text-sm md:font-bold md:text-[#8B4513] md:hover:text-[#2C1810]"
            >
              <ArrowLeft size={16} strokeWidth={2.5} className="md:h-[18px] md:w-[18px]" />
              <span>Back to Projects</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#8B4513]/20 text-[#8B4513] transition-colors hover:bg-[#8B4513] hover:text-white md:h-10 md:w-10"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 flex-row overflow-hidden">
            {sidebarOpen && (
              <button
                type="button"
                aria-label="Close sidebar"
                className="absolute inset-0 z-20 bg-black/40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Left sidebar — drawer on mobile, column on desktop (matches BlogDetailView) */}
            <aside
              className={`absolute inset-y-0 left-0 z-30 h-full shrink-0 border-r border-[#8B4513]/30 bg-[#FFF8F0] shadow-xl transition-all duration-300 ease-in-out md:relative md:shadow-none ${
                sidebarOpen ? "w-[280px] translate-x-0 md:w-80" : "w-0 -translate-x-full overflow-hidden md:translate-x-0"
              }`}
            >
              <div className="scrollbar-none h-full w-[280px] space-y-4 overflow-y-auto p-4 md:w-full md:space-y-6 md:p-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-black hover:text-[#8B4513] md:hidden"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Projects
                </button>

                <div className="rounded-xl border-2 border-[#8B4513]/25 bg-[#8B4513]/5 p-4 md:p-6">
                  <div className="mb-2">
                    <span className="rounded-lg border border-[#8B4513]/30 bg-[#8B4513]/10 px-2.5 py-1 text-[10px] font-bold uppercase text-[#8B4513] md:rounded-md md:px-3 md:text-xs">
                      {project.tags?.[0] || "Project"}
                    </span>
                  </div>
                  <h2 className="font-display text-lg font-bold leading-tight text-black md:mb-2 md:text-2xl md:text-[#2C1810]">
                    {project.title || project.name}
                  </h2>
                  {project.tagline && (
                    <p className="mt-1 text-xs leading-relaxed text-black/70 md:text-foreground/75">{project.tagline}</p>
                  )}
                </div>

                {getTags().length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-[#8B4513]" />
                      <h3 className="text-xs font-bold uppercase text-[#8B4513]">Tech Stack</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {getTags().map((tech: string, idx: number) => (
                        <span
                          key={idx}
                          className="rounded border border-[#8B4513]/30 bg-white px-2 py-1 text-[10px] font-semibold text-black md:rounded-md md:px-3 md:text-[11px] md:text-[#2C1810]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {getLinks().length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <LinkIcon className="h-3.5 w-3.5 text-[#8B4513]" />
                      <h3 className="text-xs font-bold uppercase text-[#8B4513]">Links</h3>
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                      {getLinks().map((link: any, idx: number) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 rounded-lg border border-[#8B4513]/30 bg-white p-2 transition-all hover:bg-[#8B4513]/10 md:border-[#8B4513]/20 md:p-3 md:hover:bg-[#8B4513]/5"
                        >
                          {link.name.toLowerCase().includes("github") ? (
                            <Github size={12} className="text-[#8B4513] md:h-[15px] md:w-[15px]" />
                          ) : (
                            <ExternalLink size={12} className="text-[#8B4513] md:h-[15px] md:w-[15px]" />
                          )}
                          <span className="flex-1 truncate text-xs font-semibold text-black group-hover:text-[#8B4513] md:text-[13px] md:font-bold md:text-[#2C1810]">
                            {link.name}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {headings.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-[#8B4513]" />
                      <h3 className="text-xs font-bold uppercase">Contents</h3>
                    </div>
                    <div className="space-y-1">
                      {headings.map((heading) => (
                        <button
                          key={heading.id}
                          type="button"
                          onClick={() => scrollToSection(heading.id)}
                          className={`w-full cursor-pointer rounded-lg p-2 text-left text-xs transition-all ${
                            activeSection === heading.id
                              ? "border border-[#8B4513] bg-[#8B4513]/20 font-bold text-[#8B4513]"
                              : "hover:bg-[#8B4513]/10 text-[#3A3A3A]"
                          }`}
                          style={{ paddingLeft: `${heading.level * 8 + 8}px` }}
                        >
                          {heading.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Minimize sidebar" : "Open sidebar"}
              className={`absolute top-1/2 z-40 -translate-y-1/2 rounded-r-lg bg-[#8B4513] p-2 text-white shadow-lg transition-all duration-300 hover:bg-[#6B3410] ${
                sidebarOpen ? "left-[280px] md:left-[calc(20rem-1px)]" : "left-0"
              }`}
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>

            {/* Main content */}
            <div
              id="project-slider-content"
              className="scrollbar-none min-w-0 flex-1 overflow-y-auto scroll-smooth bg-white px-3 py-4 md:px-10 md:py-12"
            >
              {/* About This Project */}
              {(project.description || project.shortDescription) && (
                <div className="mx-auto mb-6 max-w-4xl border-b border-[#8B4513]/15 pb-6 md:mb-10 md:pb-8">
                  <h3 className="mb-2 font-display text-lg font-bold text-black md:mb-3 md:text-xl md:text-[#2C1810]">
                    About This Project
                  </h3>
                  <p className="text-sm leading-relaxed text-black/80 md:font-serif md:text-[1.15rem] md:leading-[1.8] md:text-[#3A3A3A] md:italic">
                    {project.description || project.shortDescription}
                  </p>
                </div>
              )}

              {/* Markdown Content */}
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin border-4 border-solid border-[#8B4513] border-r-transparent"></div>
                    <p className="mt-4 font-serif text-[#4A4A4A]">Loading detailed content...</p>
                  </div>
                </div>
              ) : markdownContent ? (
                <article className="prose prose-slate mx-auto w-full max-w-none md:max-w-4xl md:prose-lg premium-markdown">
                  <div
                    ref={markdownContainerRef}
                    className="max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
                  />
                </article>
              ) : (
                <div className="text-center py-12">
                  <p className="font-serif text-[#8B4513]/60 italic">No additional documentation available</p>
                </div>
              )}

              {/* Project Assets / Screenshots */}
              {project.assets && project.assets.length > 0 && (
                <div className="mt-8 border-t border-[#8B4513]/20 pt-8 md:mt-16 md:pt-10">
                  <h3 className="mb-4 font-display text-lg font-bold uppercase tracking-wider text-black md:mb-6 md:text-2xl md:text-[#2C1810]">
                    Project Screenshots & Assets
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                    {project.assets.map((asset: any, idx: number) => {
                      const assetUrl = typeof asset === 'string' ? asset : asset.url;
                      const assetName = typeof asset === 'string' ? `Asset ${idx + 1}` : (asset.name || asset.filename);
                      return (
                        <div key={idx} className="overflow-hidden rounded border border-[#8B4513]/20 shadow-sm bg-white flex flex-col">
                          <div className="flex-1 overflow-hidden bg-gray-50 flex items-center justify-center min-h-[180px]">
                            <img 
                              src={assetUrl} 
                              alt={assetName} 
                              className="max-h-[300px] w-full object-contain hover:scale-[1.02] transition-transform duration-500" 
                            />
                          </div>
                          <div className="p-3 border-t border-[#8B4513]/15 bg-[#FDFBF7]">
                            <p className="font-mono text-[11px] text-[#8B4513] font-bold uppercase tracking-wider">{assetName}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
