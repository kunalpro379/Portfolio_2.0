import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, X } from "lucide-react";
import { aiService } from "@/services/aiService";
import { config } from "@/config/config";
import { Editor } from "@tiptap/react";

// Debug: Check if API key is configured
console.log("AICompletion component loaded. API Key configured:", !!config.openRouterApiKey, "Key length:", config.openRouterApiKey?.length);

interface AICompletionProps {
  content: string;
  onContentChange: (content: string) => void;
  editor: Editor | null;
  date: string;
  onSuggestionChange?: (suggestion: string) => void;
  editorText?: string;
}

export function AICompletion({ content, onContentChange, editor, date, onSuggestionChange, editorText = "" }: AICompletionProps) {
  const [suggestion, setSuggestion] = useState("");
  const [isSuggestionVisible, setIsSuggestionVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(config.defaultModel);
  const debounceRef = useRef<NodeJS.Timeout>();
  const lastTextRef = useRef("");

  // Get current text from TipTap editor
  const getCurrentText = useCallback(() => {
    try {
      if (!editor) {
        console.log("Editor is null in getCurrentText");
        return "";
      }
      if (!editor.view) {
        console.log("Editor.view is null in getCurrentText");
        return "";
      }
      if (!editor.isEditable) {
        console.log("Editor is not editable in getCurrentText");
        return "";
      }
      // Check if editor state is ready (has nodes)
      if (!editor.state || !editor.state.doc) {
        console.log("Editor state or doc is not ready in getCurrentText");
        return "";
      }
      // Check if schema is ready
      if (!editor.schema || !editor.schema.nodes) {
        console.log("Editor schema is not ready in getCurrentText");
        return "";
      }
      const text = editor.getText();
      console.log("Successfully got text from editor:", text.length);
      return text;
    } catch (error) {
      console.error("Error getting text from editor:", error);
      return "";
    }
  }, [editor]);

  // Handle typing with debounce
  const handleTyping = useCallback((text: string) => {
    console.log("AI handleTyping called:", { text: text.trim(), selectedModel, textLength: text.length });
    
    if (!text.trim()) {
      console.log("Empty text, clearing suggestion");
      setSuggestion("");
      setIsSuggestionVisible(false);
      return;
    }

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Check cache first
    const cached = aiService.getCachedCompletion(text, selectedModel);
    if (cached) {
      console.log("Using cached completion:", cached);
      setSuggestion(cached);
      setIsSuggestionVisible(true);
      return;
    }

    console.log("Scheduling AI call in 800ms...");
    // Debounce AI call
    debounceRef.current = setTimeout(async () => {
      console.log("Making AI API call...");
      setIsLoading(true);
      try {
        const completion = await aiService.getCompletion({
          text: text,
          model: selectedModel,
          useCache: true
        });
        
        console.log("AI completion received:", completion);
        if (completion) {
          setSuggestion(completion);
          setIsSuggestionVisible(true);
          if (onSuggestionChange) {
            onSuggestionChange(completion);
          }
          // Automatically insert the completion into the editor with blue color and normal (non-bold) text
          if (editor) {
            try {
              // Get current cursor position
              const from = editor.state.selection.from;
              // Insert the completion
              editor.chain().focus().insertContent(completion).run();
              // Calculate the range of inserted text
              const to = editor.state.selection.from;
              // Apply blue color to the inserted text (normal, non-bold)
              editor.commands.setTextSelection({ from, to });
              editor.chain().focus().setColor('#3b82f6').run();
              console.log("Successfully inserted and colored completion");
            } catch (error) {
              console.error("Error inserting completion:", error);
              // Fallback: just insert without color
              editor.chain().focus().insertContent(completion).run();
            }
          }
        } else {
          console.log("No completion received from AI");
        }
      } catch (error) {
        console.error("AI completion error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 800); // 800ms debounce
  }, [selectedModel]);

  // Handle tab key to make AI text bold
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Tab" && isSuggestionVisible && suggestion && editor) {
      e.preventDefault();
      // Make the last AI text bold (from blue/normal to bold)
      const from = editor.state.selection.from - suggestion.length;
      const to = editor.state.selection.from;
      editor.commands.setTextSelection({ from, to });
      editor.chain().focus().toggleBold().run();
      setSuggestion("");
      setIsSuggestionVisible(false);
      
      // Store the completed sentence in Mem0
      const currentText = getCurrentText();
      aiService.storeMemory([
        { role: "user", content: currentText },
        { role: "assistant", content: suggestion }
      ], `diary-${date}`);
    }
  }, [isSuggestionVisible, suggestion, editor, getCurrentText, date]);

  // Poll for text changes in the editor
  useEffect(() => {
    if (!editor) {
      console.log("Editor is null, skipping polling setup");
      return;
    }

    console.log("Setting up text change polling");
    
    const checkForChanges = () => {
      if (!editor) {
        console.log("Editor is null, skipping check");
        return;
      }
      try {
        const currentText = getCurrentText();
        if (currentText !== lastTextRef.current) {
          console.log("Text changed:", {
            old: lastTextRef.current,
            new: currentText,
            length: currentText.length
          });
          lastTextRef.current = currentText;
          handleTyping(currentText);
        }
      } catch (error) {
        console.error("Error in checkForChanges:", error);
      }
    };

    // Check for changes every 500ms
    const intervalId = setInterval(checkForChanges, 500);

    document.addEventListener("keydown", handleKeyDown);

    console.log("Text change polling set up successfully");
    return () => {
      console.log("Cleaning up text change polling");
      clearInterval(intervalId);
      document.removeEventListener("keydown", handleKeyDown);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [editor, handleTyping, handleKeyDown, getCurrentText]);

  // Clear suggestion when content changes externally
  useEffect(() => {
    setSuggestion("");
    setIsSuggestionVisible(false);
  }, [content]);

  // Don't render AI features if editor is not ready
  if (!editor) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 border-b border-black/10 bg-white/50">
        <div className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-gray-100 text-gray-400 border border-gray-200">
          <Sparkles className="h-3.5 w-3.5" />
          AI Loading...
        </div>
        <div className="text-xs text-red-500">
          Editor not ready
        </div>
      </div>
    );
  }

  const dismissSuggestion = () => {
    setSuggestion("");
    setIsSuggestionVisible(false);
    if (onSuggestionChange) {
      onSuggestionChange("");
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-black/10 bg-white/50">
        {/* AI Status */}
        <div className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[#8B4513]/10 text-[#8B4513] border border-[#8B4513]/30">
          <Sparkles className={`h-3.5 w-3.5 ${isLoading ? "animate-pulse" : ""}`} />
          AI
        </div>

        {/* Model Selector */}
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="text-xs bg-transparent border border-black/15 rounded px-2 py-1.5 text-black/70 hover:border-black/30 transition-colors"
        >
          {config.aiModels.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>

        {/* Status Indicator */}
        <div className="flex items-center gap-1.5">
          {isLoading ? (
            <span className="h-2 w-2 rounded-full bg-[#8B4513] animate-pulse" />
          ) : isSuggestionVisible ? (
            <span className="h-2 w-2 rounded-full bg-blue-500" />
          ) : !config.openRouterApiKey ? (
            <span className="h-2 w-2 rounded-full bg-red-500" />
          ) : (
            <span className="h-2 w-2 rounded-full bg-green-500" />
          )}
        </div>

        {/* Suggestion Display */}
        {isSuggestionVisible && suggestion && (
          <div className="flex-1 min-w-0 ml-4 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded text-sm text-blue-600 truncate" aria-live="polite">
            <span className="font-medium">AI:</span> {suggestion}
          </div>
        )}


      </div>
    </>
  );
}