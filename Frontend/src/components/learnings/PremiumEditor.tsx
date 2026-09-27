import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { GhostTextExtension } from "./tiptap/GhostTextExtension";
import { aiService } from "@/services/aiService";

interface PremiumEditorProps {
  content: string;
  onUpdate: (content: string) => void;
  aiEnabled: boolean;
}

export interface PremiumEditorRef {
  insertImage: (url: string) => void;
}

export const PremiumEditor = forwardRef<PremiumEditorRef, PremiumEditorProps>(
  ({ content, onUpdate, aiEnabled }, ref) => {
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const CustomImage = Image.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          style: {
            default:
              "resize: both; overflow: hidden; max-width: 100%; display: block; border: 1px solid transparent;",
            parseHTML: (element) => element.getAttribute("style"),
            renderHTML: (attributes) => {
              return {
                style: attributes.style,
              };
            },
          },
        };
      },
    });

    const editor = useEditor({
      extensions: [StarterKit, CustomImage, GhostTextExtension],
      content,
      editorProps: {
        attributes: {
          class:
            "prose prose-lg max-w-none focus:outline-none min-h-[500px] pb-32 px-6 md:px-10 py-6",
        },
      },
      onUpdate: ({ editor }) => {
        onUpdate(editor.getHTML());

        const text = editor.getText();
        if (!text.trim() || !aiEnabled) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (editor.storage as any).ghostText.ghostText = "";
          editor.view.dispatch(editor.state.tr);
          return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
          try {
            const completion = await aiService.getCompletion({
              text: text,
              useCache: true,
            });

            if (completion && editor) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (editor.storage as any).ghostText.ghostText = completion;
              editor.view.dispatch(editor.state.tr);
            }
          } catch (error) {
            console.error("AI Ghost Text Error:", error);
          }
        }, 800);
      },
    });

    useImperativeHandle(ref, () => ({
      insertImage: (url: string) => {
        editor?.chain().focus().setImage({ src: url }).run();
      },
    }));


    return (
      <div className="flex-1 overflow-auto bg-white">
        <style>{`
        .ProseMirror img {
          display: block;
          border: 2px solid transparent;
          transition: border-color 0.2s;
          cursor: pointer;
        }
        .ProseMirror img:hover {
          border-color: #8B4513;
        }
        .ProseMirror img.ProseMirror-selectednode {
          border-color: #8B4513;
          outline: none;
        }
      `}</style>
        <EditorContent editor={editor} />
      </div>
    );
  },
);

PremiumEditor.displayName = "PremiumEditor";
