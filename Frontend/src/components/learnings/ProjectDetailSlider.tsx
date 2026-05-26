import { useEffect, useState, useMemo, useRef } from "react";
import { marked } from "marked";
import mermaid from "mermaid";
import { config } from "@/config/config";
import { Github, ExternalLink, ArrowLeft, FileText, Tag, Link as LinkIcon, Image as ImageIcon, X } from 'lucide-react';

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
    }
  };

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

      {/* Slider */}
      <div className={`fixed inset-y-0 right-0 z-[101] w-full max-w-full transform transition-transform duration-500 ease-out sm:max-w-6xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full bg-[#FDFBF7] shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#FDFBF7] border-b-2 border-[#8B4513]/20 px-8 py-4 flex items-center justify-between flex-shrink-0">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-[#8B4513] hover:text-[#2C1810] font-bold text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
              <span>Back to Projects</span>
            </button>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center border border-[#8B4513]/20 text-[#8B4513] hover:bg-[#8B4513] hover:text-white transition-colors rounded-full cursor-pointer"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Body Container */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar */}
            <div className="scrollbar-none w-full md:w-80 bg-[#FDFBF7] border-b-2 md:border-b-0 md:border-r-2 border-[#8B4513]/20 overflow-y-auto p-8 space-y-6 flex-shrink-0">
              {/* Project Card */}
              <div className="bg-[#8B4513]/5 border-2 border-[#8B4513]/25 rounded-xl p-6">
                <div className="mb-3">
                  <span className="px-3 py-1 bg-[#8B4513]/10 border border-[#8B4513]/20 rounded-md text-xs font-bold text-[#8B4513] uppercase">
                    {project.tags?.[0] || 'Project'}
                  </span>
                </div>
                <h2 className="font-display text-2xl font-bold text-[#2C1810] mb-2 leading-tight">
                  {project.title || project.name}
                </h2>
                {project.tagline && (
                  <p className="text-xs text-foreground/75 font-medium leading-relaxed">{project.tagline}</p>
                )}
              </div>

              {/* Tech Stack */}
              {getTags().length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag size={15} className="text-[#8B4513]" />
                    <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#8B4513]">Tech Stack</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getTags().map((tech: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-[11px] bg-white border border-[#8B4513]/20 rounded-md font-medium text-[#2C1810]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {getLinks().length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <LinkIcon size={15} className="text-[#8B4513]" />
                    <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#8B4513]">Links</h3>
                  </div>
                  <div className="space-y-2">
                    {getLinks().map((link: any, idx: number) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-white border border-[#8B4513]/20 rounded-lg hover:bg-[#8B4513]/5 hover:border-[#8B4513]/50 transition-all group"
                      >
                        {link.name.toLowerCase().includes('github') ? (
                          <Github size={15} className="text-[#8B4513]" />
                        ) : (
                          <ExternalLink size={15} className="text-[#8B4513]" />
                        )}
                        <span className="text-[13px] font-bold text-[#2C1810] truncate flex-1 group-hover:text-[#8B4513]">{link.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Table of Contents */}
              {headings.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={15} className="text-[#8B4513]" />
                    <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#8B4513]">Table of Contents</h3>
                  </div>
                  <div className="space-y-1 pr-2">
                    {headings.map((heading) => (
                      <button
                        key={heading.id}
                        onClick={() => scrollToSection(heading.id)}
                        className={`w-full text-left py-1.5 px-3 rounded-md transition-all text-xs font-medium hover:bg-[#8B4513]/5 cursor-pointer ${
                          activeSection === heading.id 
                            ? 'bg-[#8B4513]/10 border border-[#8B4513]/30 text-[#8B4513] font-bold shadow-sm' 
                            : 'text-[#3A3A3A]'
                        }`}
                        style={{ paddingLeft: `${heading.level * 10}px` }}
                      >
                        {heading.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div id="project-slider-content" className="scrollbar-none flex-1 overflow-y-auto bg-white px-6 py-8 md:px-10 md:py-12 scroll-smooth">
              {/* About This Project */}
              {(project.description || project.shortDescription) && (
                <div className="mx-auto mb-10 max-w-4xl pb-8 border-b border-[#8B4513]/15">
                  <h3 className="font-display text-xl font-bold text-[#2C1810] mb-3">About This Project</h3>
                  <p className="font-serif text-[1.15rem] leading-[1.8] text-[#3A3A3A] italic">
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
                <article className="mx-auto w-full max-w-4xl">
                  <div
                    ref={markdownContainerRef}
                    className="premium-markdown prose prose-slate prose-lg max-w-none"
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
                <div className="mt-16 pt-10 border-t border-[#8B4513]/20">
                  <h3 className="font-display text-2xl font-bold text-[#2C1810] mb-6 uppercase tracking-wider">
                    Project Screenshots & Assets
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
