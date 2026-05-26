import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { config } from "@/config/config";
import { ContentCard } from "./ContentCard";
import { ProjectDetailSlider } from "./ProjectDetailSlider";

const API_BASE_URL = config.apiUrl;

async function fetchProjects() {
  const response = await fetch(`${API_BASE_URL}/projects`);
  if (!response.ok) throw new Error('Failed to fetch projects');
  const data = await response.json();
  return data.projects || [];
}

interface ProjectsViewProps {
  search: string;
}

export function ProjectsView({ search }: ProjectsViewProps) {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const filteredProjects = projects.filter((item: any) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const title = (item.title || '').toLowerCase();
    const desc = (item.description || item.shortDescription || '').toLowerCase();
    const tags = (item.tags || []).join(' ').toLowerCase();
    return title.includes(searchLower) || desc.includes(searchLower) || tags.includes(searchLower);
  });

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setIsSliderOpen(true);
  };

  const handleCloseSlider = () => {
    setIsSliderOpen(false);
    setTimeout(() => setSelectedProject(null), 500);
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

  if (filteredProjects.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-foreground/60 text-xl">No projects found</p>
        {search && (
          <p className="text-foreground/40 text-sm mt-2">Try a different search term</p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-0 md:grid-cols-3 lg:grid-cols-5">
        {filteredProjects.map((item: any, idx: number) => (
          <ContentCard 
            key={item._id || item.id || idx} 
            item={item} 
            type="projects"
            onClick={() => handleProjectClick(item)}
          />
        ))}
      </div>

      <ProjectDetailSlider 
        isOpen={isSliderOpen}
        onClose={handleCloseSlider}
        project={selectedProject}
      />
    </>
  );
}
