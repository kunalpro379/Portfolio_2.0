# Premium Notes with AI Inline Suggestions & Folders

This document outlines the implementation plan for the new Premium Notes feature, which includes Copilot-style inline ghost-text completions, folder support, images, diagrams, and a strictly minimalist black/white/light theme.

## Open Questions

> [!WARNING]
> Please review and answer these before I proceed:
> 1. **Data Model**: Should I create a new database schema specifically for `PremiumNote` that supports folders, or should I integrate this directly into your existing `Diary` or `GuideNote` models?
> 2. **Images**: Should uploaded images in the notes be saved to Azure Blob Storage (which is already configured in your backend) or somewhere else?
> 3. **Diagrams**: Do you want diagrams to be rendered via Mermaid.js inside the notes, or do you have another diagramming tool in mind?

## Proposed Changes

---

### Backend Components

#### [NEW] `server/models/PremiumNote.js`
- Create a new Mongoose schema that supports folders: `folderId`, `title`, `content` (HTML), `images`, `diagrams`.

#### [NEW] `server/routes/premium-notes.js`
- Build CRUD endpoints for the notes and folders.
- Build an image upload endpoint that streams images to Azure Blob Storage and returns the image URL.
- Expose the API to the frontend.

#### [MODIFY] `server/index.js`
- Mount the new `/api/premium-notes` route.

---

### Frontend Components (TipTap & UI)

#### [NEW] `Frontend/src/components/learnings/PremiumNotesView.tsx`
- The main UI container featuring a premium minimalist black/white/light theme.
- Sidebar for folder navigation and note selection.
- Main area for the TipTap editor.

#### [NEW] `Frontend/src/components/learnings/tiptap/GhostTextExtension.ts`
- A custom TipTap/ProseMirror extension using `DecorationSet` to render Copilot-style gray ghost text inline while the user is typing.
- Intercepts the `Tab` key to accept the completion.

#### [MODIFY] `Frontend/src/components/learnings/NotepadEditor.tsx` (or build a new `PremiumEditor.tsx`)
- Add the custom `GhostTextExtension`.
- Add `@tiptap/extension-image` for dragging/dropping pictures.
- Add logic to fetch AI completions silently in the background and feed them to the `GhostTextExtension`.
- Update the styling to be strictly black/white (e.g., removing any blue colored buttons, making them stark black/white).

#### [MODIFY] `Frontend/src/components/learnings/AICompletion.tsx`
- Refactor the current "blue text" insertion to instead feed text to the new Ghost Text extension.
- Update the AI prompt to recognize when a user wants a diagram and output a Mermaid diagram format if requested.

---

## Verification Plan

### Automated Tests
- N/A

### Manual Verification
1. I will ask you to open the Premium Notes UI and create a new folder and note.
2. I will ask you to start typing and wait for the ghost text to appear, then press `Tab` to accept it.
3. I will ask you to drag and drop an image into the editor.
4. I will ask you to verify that the theme looks completely premium (black/white/light).
