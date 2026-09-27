import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Bold, Italic, List, ListOrdered, Quote, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface NotepadEditorProps {
  content: string;
  onSave: (content: string) => void;
  placeholder?: string;
  onEditorReady?: (editor: any) => void;
  suggestion?: string;
  onAcceptSuggestion?: () => void;
  onTextChange?: (text: string) => void;
}

export function NotepadEditor({ content, onSave, placeholder = "Start writing...", onEditorReady, suggestion, onAcceptSuggestion, onTextChange }: NotepadEditorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      setIsSaving(true);
      
      // Make new text bold by default
      if (!editor.isActive('bold')) {
        editor.chain().focus().toggleBold().run();
      }
      
      // Notify parent about text changes for AI completion
      if (onTextChange) {
        onTextChange(text);
      }
      
      // Debounce save
      setTimeout(() => {
        onSave(html);
        setIsSaving(false);
      }, 1000);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base lg:prose-lg max-w-none focus:outline-none min-h-[300px] p-4",
      },
      handleKeyDown: (view, event) => {
        // Handle Tab key to accept suggestion
        if (event.key === 'Tab' && suggestion) {
          event.preventDefault();
          const currentPos = editor?.state.selection.from || 0;
          editor?.chain().focus().insertContent(suggestion).run();
          // Make the AI text bold instead of blue
          const newPos = editor?.state.selection.from || 0;
          editor?.commands.setTextSelection({ from: currentPos, to: newPos });
          editor?.chain().focus().toggleBold().run();
          if (onAcceptSuggestion) {
            onAcceptSuggestion();
          }
          return true;
        }
        return false;
      },
    },
    onSelectionUpdate: ({ editor }) => {
      // Notify parent about editor instance
      if (onEditorReady) {
        onEditorReady(editor);
      }
    },
  });

  // Notify parent when editor is ready
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  if (!editor) {
    return null;
  }

  const handleClear = () => {
    editor.commands.clearContent();
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("bold") ? "bg-gray-200" : ""
          }`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("italic") ? "bg-gray-200" : ""
          }`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("bulletList") ? "bg-gray-200" : ""
          }`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("orderedList") ? "bg-gray-200" : ""
          }`}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("blockquote") ? "bg-gray-200" : ""
          }`}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleClear}
          className="p-2 rounded hover:bg-red-100 text-red-600 transition-colors"
          title="Clear"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Status */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
        {isSaving ? "Saving..." : "All changes saved"}
      </div>
    </div>
  );
}