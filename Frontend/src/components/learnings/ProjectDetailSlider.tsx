import { useEffect, useState } from "react";

// Simple markdown to HTML converter
function parseMarkdown(markdown: string): string {
  if (!markdown) return "";
  
  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Code blocks
  html = html.replace(/```([^`]+)```/gim, '<pre><code>$1</code></pre>');
  
  // Inline code
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
  
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  
  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<')) {
    html = '<p>' + html + '</p>';
  }
  
  return html;
}

interface ProjectDetailSliderProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
}

export function ProjectDetailSlider({ isOpen, onClose, project }: ProjectDetailSliderProps) {
  const [markdownContent, setMarkdownContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
          // Use the API endpoint to fetch markdown content
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const response = await fetch(`${apiUrl}/api/projects/${project.projectId}/md-content`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('MD content response:', data);
          
          if (data.exists && data.content) {
            const html = parseMarkdown(data.content);
            setMarkdownContent(html);
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

  if (!project) return null;

  const getTags = () => project.tags || [];
  const getLinks = () => project.links || [];

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
      <div className={`fixed inset-y-0 right-0 z-[101] w-full max-w-4xl transform transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full bg-[#FDFBF7] shadow-2xl overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#FDFBF7] border-b-2 border-[#8B4513]/20 px-12 py-8">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <h1 className="font-serif text-[2.75rem] font-bold leading-[1.1] text-[#2C1810] mb-4">
                  {project.title || project.name}
                </h1>
                
                {/* Tags */}
                {getTags().length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-6">
                    {getTags().map((tag: string, idx: number) => (
                      <span 
                        key={idx} 
                        className="inline-block border-2 border-[#8B4513] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#8B4513]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Links at Top */}
                {getLinks().length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {getLinks().map((link: any, idx: number) => (
                      <a 
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 border-2 border-[#8B4513] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8B4513] hover:bg-[#8B4513] hover:text-white transition-colors"
                      >
                        <span>{link.name}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={onClose}
                className="flex-shrink-0 w-12 h-12 flex items-center justify-center border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-12 py-10">
            {/* Description - Always Show First */}
            {(project.description || project.shortDescription) && (
              <div className="mb-10 pb-10 border-b-2 border-[#8B4513]/20">
                <p className="font-serif text-[1.15rem] leading-[1.8] text-[#3A3A3A]">
                  {project.description || project.shortDescription}
                </p>
              </div>
            )}

            {/* Markdown Content - Shows Below Description */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#8B4513] border-r-transparent"></div>
                  <p className="mt-4 font-serif text-[#4A4A4A]">Loading detailed content...</p>
                </div>
              </div>
            ) : markdownContent ? (
              <article 
                className="prose prose-lg max-w-none
                  prose-headings:font-serif prose-headings:text-[#2C1810] prose-headings:font-bold
                  prose-h1:text-4xl prose-h1:mb-6 prose-h1:border-b-2 prose-h1:border-[#8B4513]/20 prose-h1:pb-4
                  prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-10
                  prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-8
                  prose-p:font-serif prose-p:text-[1.05rem] prose-p:leading-[1.8] prose-p:text-[#3A3A3A] prose-p:mb-6
                  prose-a:text-[#8B4513] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-[#2C1810] prose-strong:font-bold
                  prose-em:text-[#4A4A4A] prose-em:italic
                  prose-code:bg-[#F5F5F0] prose-code:text-[#8B4513] prose-code:px-2 prose-code:py-1 prose-code:font-mono prose-code:text-sm prose-code:before:content-[''] prose-code:after:content-['']
                  prose-pre:bg-[#2C1810] prose-pre:text-[#FDFBF7] prose-pre:border-2 prose-pre:border-[#8B4513] prose-pre:p-4 prose-pre:overflow-x-auto
                  prose-blockquote:border-l-4 prose-blockquote:border-[#8B4513] prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-[#4A4A4A]
                  prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6
                  prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6
                  prose-li:font-serif prose-li:text-[1.05rem] prose-li:leading-[1.8] prose-li:text-[#3A3A3A] prose-li:mb-2
                  prose-img:border-2 prose-img:border-[#8B4513]/20 prose-img:shadow-lg prose-img:w-full prose-img:rounded
                  prose-hr:border-[#8B4513]/20 prose-hr:my-10
                  prose-table:border-2 prose-table:border-[#8B4513]/20 prose-table:w-full
                  prose-th:bg-[#8B4513]/10 prose-th:border prose-th:border-[#8B4513]/20 prose-th:p-3 prose-th:font-bold
                  prose-td:border prose-td:border-[#8B4513]/20 prose-td:p-3
                "
                dangerouslySetInnerHTML={{ __html: markdownContent }}
              />
            ) : (
              <div className="text-center py-10">
                <p className="font-serif text-[#8B4513]/60 italic">No additional content available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
