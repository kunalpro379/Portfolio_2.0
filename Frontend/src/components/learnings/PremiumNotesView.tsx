import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FileText, Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, Circle, Plus, Trash2, Image as ImageIcon, PenTool, Loader2, Wand2 } from 'lucide-react';
import { PremiumEditor, PremiumEditorRef } from './PremiumEditor';
import { format, subDays, addDays } from 'date-fns';
import { config } from '@/config/config';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';

export const PremiumNotesView = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeNote, setActiveNote] = useState<any>(null);
  const [todos, setTodos] = useState<any[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAiEnabled, setIsAiEnabled] = useState(true);

  // Editor Toolbar State
  const editorRef = useRef<PremiumEditorRef>(null);
  const [selectedModel, setSelectedModel] = useState(config.defaultModel);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showTldraw, setShowTldraw] = useState(false);
  const [tldrawEditor, setTldrawEditor] = useState<any>(null);
  const [isSavingDiagram, setIsSavingDiagram] = useState(false);
  const [canvasSaveStatus, setCanvasSaveStatus] = useState<'idle'|'saving'|'saved'>('idle');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const displayDate = format(selectedDate, 'MMMM d, yyyy');

  useEffect(() => {
    fetchNoteAndTodos();
  }, [dateStr]);

  const fetchNoteAndTodos = async () => {
    setIsLoading(true);
    try {
      const [noteRes, todosRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/premium-notes/note-by-date/${dateStr}`, { withCredentials: true }),
        axios.get(`http://localhost:5000/api/premium-notes/todos/${dateStr}`, { withCredentials: true })
      ]);
      setActiveNote(noteRes.data);
      setTodos(todosRes.data);
    } catch (err) {
      console.error("Error fetching diary data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNoteUpdate = async (content: string) => {
    if (!activeNote) return;
    try {
      const updatedNote = { ...activeNote, content };
      setActiveNote(updatedNote);
      
      await axios.put(`http://localhost:5000/api/premium-notes/note-by-date/${dateStr}`, 
        { content }, 
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Error saving note:", err);
    }
  };

  const handleTitleUpdate = async (title: string) => {
    if (!activeNote) return;
    try {
      setActiveNote({ ...activeNote, title });
      await axios.put(`http://localhost:5000/api/premium-notes/note-by-date/${dateStr}`, 
        { title }, 
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Error saving note title:", err);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    try {
      const res = await axios.post('http://localhost:5000/api/premium-notes/todo', 
        { text: newTodo.trim(), date: dateStr },
        { withCredentials: true }
      );
      setTodos([...todos, res.data]);
      setNewTodo('');
    } catch (err) {
      console.error("Error creating todo:", err);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      setTodos(todos.map(t => t._id === id ? { ...t, completed: !completed } : t));
      await axios.put(`http://localhost:5000/api/premium-notes/todo/${id}`, 
        { completed: !completed },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Error updating todo:", err);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      setTodos(todos.filter(t => t._id !== id));
      await axios.delete(`http://localhost:5000/api/premium-notes/todo/${id}`, { withCredentials: true });
    } catch (err) {
      console.error("Error deleting todo:", err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await axios.post('http://localhost:5000/api/premium-notes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      if (res.data.url && editorRef.current) {
        editorRef.current.insertImage(res.data.url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Load canvas from Azure blob for the current date
  const loadCanvas = async (editor: any) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/premium-notes/canvas/${dateStr}`, { withCredentials: true });
      if (res.data.canvasData) {
        editor.store.loadSnapshot(res.data.canvasData);
      }
    } catch (err) {
      console.warn('No saved canvas for this date:', err);
    }
  };

  // Auto-save canvas to Azure blob every 3s when editor is active
  const saveCanvas = async (editor: any) => {
    try {
      setCanvasSaveStatus('saving');
      const snapshot = editor.store.getSnapshot();
      await axios.put(`http://localhost:5000/api/premium-notes/canvas/${dateStr}`, 
        { canvasData: snapshot },
        { withCredentials: true }
      );
      setCanvasSaveStatus('saved');
      setTimeout(() => setCanvasSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Canvas auto-save failed:', err);
      setCanvasSaveStatus('idle');
    }
  };

  // Setup auto-save listener when tldraw editor mounts
  useEffect(() => {
    if (!tldrawEditor) return;
    // Load existing canvas first
    loadCanvas(tldrawEditor);
    // Subscribe to store changes and debounce auto-save
    const unsubscribe = tldrawEditor.store.listen(() => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        saveCanvas(tldrawEditor);
      }, 300000); // 5 minutes
    }, { source: 'user', scope: 'document' });
    return () => {
      unsubscribe();
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [tldrawEditor, dateStr]);

  const handleSaveDiagram = async () => {
    if (!tldrawEditor || !editorRef.current) return;
    try {
      setIsSavingDiagram(true);
      const shapeIds = tldrawEditor.getCurrentPageShapeIds();
      if (shapeIds.size === 0) {
        setShowTldraw(false);
        return;
      }

      const { blob } = await tldrawEditor.toImage([...shapeIds], {
        format: 'png',
        background: false,
      });

      const formData = new FormData();
      formData.append('image', blob, `diagram-${Date.now()}.png`);

      const res = await axios.post('http://localhost:5000/api/premium-notes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      if (res.data.url) {
        editorRef.current.insertImage(res.data.url);
      }
      if (tldrawEditor) {
        saveCanvas(tldrawEditor);
      }
      setShowTldraw(false);
    } catch (error) {
      console.error("Failed to save diagram", error);
      alert("Failed to save diagram");
    } finally {
      setIsSavingDiagram(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-100px)] bg-white text-black font-sans relative overflow-hidden">
      
      {/* Global Header (Title + Date + Toolbar) */}
      <div className="h-[60px] border-b border-black/10 flex items-center px-4 bg-[#FAFAFA] shrink-0 w-full">
        
        {/* Left: Note Title */}
        <div className="flex-1 flex items-center min-w-0 pr-4">
          <input 
            type="text" 
            value={activeNote?.title || ''}
            onChange={(e) => handleTitleUpdate(e.target.value)}
            className="font-display text-xl font-bold w-full bg-transparent text-black placeholder-gray-400 outline-none truncate"
            placeholder="Diary Note Title"
            disabled={!activeNote}
          />
        </div>

        {/* Center: Date Picker */}
        <div className="flex items-center gap-4 bg-white px-3 py-1.5 rounded-full border border-black/10 shadow-sm shrink-0">
          <button 
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="p-1 hover:bg-black/5 rounded-full transition-colors text-gray-500 hover:text-black"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#8B4513] min-w-[130px] justify-center">
            <CalendarIcon className="h-4 w-4" />
            {displayDate}
          </div>
          <button 
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-1 hover:bg-black/5 rounded-full transition-colors text-gray-500 hover:text-black"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Right: Editor Toolbar */}
        <div className="flex-1 flex items-center justify-end gap-3 pl-4">
          <button
            onClick={() => setIsAiEnabled(!isAiEnabled)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              isAiEnabled 
                ? 'bg-[#8B4513]/10 text-[#8B4513] border border-[#8B4513]/20' 
                : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            <Wand2 className={`h-3.5 w-3.5 ${isAiEnabled ? 'text-[#8B4513]' : 'text-gray-400'}`} />
            {isAiEnabled ? 'AI Copilot On' : 'AI Copilot Off'}
          </button>
          
          <div className="h-6 w-px bg-black/10 mx-1 hidden sm:block" />

          <div className="flex items-center gap-1">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || !activeNote}
              className="p-1.5 text-gray-500 hover:text-black hover:bg-black/5 rounded-md disabled:opacity-50 transition-colors"
              title="Insert Image (Resize by dragging corner)"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setShowTldraw(true)}
              disabled={!activeNote}
              className="p-1.5 text-gray-500 hover:text-black hover:bg-black/5 rounded-md disabled:opacity-50 transition-colors"
              title="Draw Diagram"
            >
              <PenTool className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Todos Sidebar */}
        <div className="w-80 border-r border-black/10 p-5 flex flex-col bg-[#FAFAFA]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Daily Tasks
          </h3>

          <form onSubmit={handleAddTodo} className="mb-4 relative">
            <input 
              type="text" 
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="w-full pl-3 pr-10 py-2.5 text-sm bg-white border border-black/10 rounded-lg focus:outline-none focus:border-[#8B4513] shadow-sm"
            />
            <button 
              type="submit"
              disabled={!newTodo.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-[#8B4513] text-white rounded-md disabled:opacity-50 hover:bg-[#A0522D] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {todos.length === 0 && (
              <p className="text-xs text-gray-400 italic text-center py-4">No tasks for today.</p>
            )}
            {todos.map(todo => (
              <div key={todo._id} className="group flex items-start gap-3 p-3 bg-white rounded-lg border border-black/5 shadow-sm hover:border-black/10 transition-colors">
                <button 
                  onClick={() => toggleTodo(todo._id, todo.completed)}
                  className="mt-0.5 text-gray-400 hover:text-[#8B4513] transition-colors shrink-0"
                >
                  {todo.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <span className={`flex-1 text-sm ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {todo.text}
                </span>
                <button 
                  onClick={() => deleteTodo(todo._id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative h-full">
          
          {/* Excalidraw Working Canvas */}
          {showTldraw && (
            <div className="absolute inset-0 z-50 bg-white flex flex-col h-full w-full">
              <div className="flex items-center justify-between p-3 border-b border-black/10 bg-[#FAFAFA] shrink-0">
                <h3 className="font-bold text-[#8B4513] flex items-center gap-2">
                  <PenTool className="h-4 w-4" /> Draw Diagram
                  {canvasSaveStatus === 'saving' && <span className="text-[10px] text-gray-400 font-normal ml-2 animate-pulse">Saving...</span>}
                  {canvasSaveStatus === 'saved' && <span className="text-[10px] text-green-500 font-normal ml-2">✓ Saved</span>}
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (tldrawEditor) {
                        saveCanvas(tldrawEditor);
                      }
                      setShowTldraw(false);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-black/5 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveDiagram}
                    disabled={isSavingDiagram}
                    className="px-4 py-1.5 text-xs font-semibold bg-[#8B4513] text-white rounded-md hover:bg-[#A0522D] transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSavingDiagram && <Loader2 className="h-3 w-3 animate-spin" />}
                    Insert Diagram
                  </button>
                </div>
              </div>
              <div style={{ width: '100%', height: '100%', minHeight: '500px', position: 'relative' }}>
                <Tldraw
                  onMount={(editor) => setTldrawEditor(editor)}
                />
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex h-full items-center justify-center text-gray-400">
              <span className="animate-pulse">Loading diary...</span>
            </div>
          ) : activeNote ? (
            <PremiumEditor 
              key={activeNote.date}
              ref={editorRef}
              aiEnabled={isAiEnabled}
              content={activeNote.content || ''}
              onUpdate={handleNoteUpdate}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400 flex-col">
              <FileText className="h-12 w-12 text-gray-200 mb-4" strokeWidth={1} />
              <p className="text-lg font-medium">Failed to load note</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumNotesView;
