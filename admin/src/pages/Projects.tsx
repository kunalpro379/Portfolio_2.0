import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ExternalLink, ArrowUpDown, GripVertical, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import config, { buildUrl } from '../config/config';
import PageShimmer from '../components/PageShimmer';

interface Project {
  _id: string;
  projectId: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  tags: string[];
  cardasset: string[];
  created_at: string;
}

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(config.api.endpoints.projects);
      const data = await response.json();
      setProjects(data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateProjectId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 10; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };

  const handleCreateProject = () => {
    const projectId = generateProjectId();
    navigate(`/create/${projectId}`);
  };

  const handleEditProject = (projectId: string) => {
    navigate(`/edit/project/${projectId}`);
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(config.api.endpoints.projectById(projectId), {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchProjects();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(projects);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setProjects(items);
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      const projectIds = projects.map(p => p.projectId);
      
      const response = await fetch(config.api.endpoints.projectReorder, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectIds }),
      });

      if (response.ok) {
        alert('Projects reordered successfully!');
        setIsReorderMode(false);
        fetchProjects();
      } else {
        alert('Failed to reorder projects');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Error saving order');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageShimmer />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d0d0d] border border-white/[0.06] rounded-none p-6 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
              Portfolio Projects
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Manage, reorder, and showcase your featured projects</p>
          </div>
          <div className="flex items-center gap-3">
            {isReorderMode ? (
              <>
                <button 
                  onClick={() => setIsReorderMode(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-transparent border border-white/20 text-white/80 hover:text-white hover:bg-white/[0.05] rounded-none font-semibold text-xs uppercase tracking-wider transition">
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button 
                  onClick={handleSaveOrder}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black border border-white/20 hover:bg-white/90 rounded-none font-semibold text-xs uppercase tracking-wider transition disabled:opacity-50">
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Order'}
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setIsReorderMode(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-transparent border border-white/20 text-white/80 hover:text-white hover:bg-white/[0.05] rounded-none font-semibold text-xs uppercase tracking-wider transition">
                  <ArrowUpDown className="w-4 h-4 text-accent" />
                  Reorder
                </button>
                <button 
                  onClick={handleCreateProject}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black border border-white/20 hover:bg-white/90 rounded-none font-semibold text-xs uppercase tracking-wider transition shadow-sm">
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
              </>
            )}
          </div>
        </div>

        {/* Projects Grid or Reorder List */}
        {projects.length === 0 ? (
          <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-none p-12 text-center shadow-sm">
            <ExternalLink className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-xl font-display font-bold text-foreground mb-1">No Projects Yet</h3>
            <p className="text-muted-foreground text-sm mb-5">Start by creating your first project showcase</p>
            <button 
              onClick={handleCreateProject}
              className="px-5 py-2.5 bg-white text-black border border-white/20 hover:bg-white/90 rounded-none font-semibold text-xs uppercase tracking-wider transition">
              Create Project
            </button>
          </div>
        ) : isReorderMode ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="projects">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {projects.map((project, index) => (
                    <Draggable
                      key={project.projectId}
                      draggableId={project.projectId}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-[#0d0d0d] border border-white/[0.06] rounded-none p-4 shadow-sm transition-all ${
                            snapshot.isDragging ? 'border-accent bg-cream-soft shadow-md' : ''
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing p-1.5 text-muted-foreground hover:text-foreground rounded transition"
                            >
                              <GripVertical className="w-5 h-5" />
                            </div>

                            <div className="flex-shrink-0 w-9 h-9 rounded-none bg-white/[0.03] border border-border flex items-center justify-center label-mono font-bold text-sm text-foreground">
                              {index + 1}
                            </div>

                            {project.cardasset && project.cardasset.length > 0 ? (
                              <img
                                src={project.cardasset[0]}
                                alt={project.title}
                                className="w-12 h-12 object-cover rounded-none border border-border"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-white/[0.03] rounded-none border border-border flex items-center justify-center text-muted-foreground" />
                            )}

                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-foreground truncate">
                                {project.title}
                              </h3>
                              <p className="label-mono text-xs text-muted-foreground truncate">
                                {project.tagline || project.slug}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-[#0d0d0d] border border-white/[0.06] rounded-none overflow-hidden hover:border-accent/40 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  {project.cardasset && project.cardasset.length > 0 ? (
                    <img
                      src={project.cardasset[0]}
                      alt={project.title}
                      className="w-full h-28 object-cover border-b border-white/[0.06]"
                    />
                  ) : (
                    <div className="w-full h-44 bg-white/[0.03] border-b border-border flex items-center justify-center">
                      <ExternalLink className="w-8 h-8 text-muted-foreground opacity-40" />
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-white mb-1 line-clamp-1">{project.title}</h3>
                    <p className="text-[11px] text-white/50 mb-3 line-clamp-2 leading-relaxed">
                      {project.tagline || project.description}
                    </p>

                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.tags.slice(0, 4).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-white/[0.03] border border-border rounded text-[10px] label-mono font-medium text-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => handleEditProject(project.projectId)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-white/90 border border-white/20 rounded-none text-[10px] uppercase tracking-widest font-semibold transition"
                  >
                    <Edit className="w-3.5 h-3.5 text-accent" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProject(project.projectId)}
                    className="px-3 py-1.5 bg-transparent text-white/40 border border-white/20 hover:text-red-500 hover:border-red-500/50 rounded-none text-[10px] font-semibold transition flex items-center justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
