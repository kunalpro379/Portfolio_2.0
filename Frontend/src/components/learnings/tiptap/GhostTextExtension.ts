import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

const GhostTextPluginKey = new PluginKey('ghostText');

export const GhostTextExtension = Extension.create({
  name: 'ghostText',

  addStorage() {
    return {
      ghostText: '',
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: GhostTextPluginKey,
        state: {
          init: () => DecorationSet.empty,
          apply: (tr, oldState) => {
            const ghostText = this.storage.ghostText;
            if (!ghostText) return DecorationSet.empty;

            const { selection } = tr;
            if (!selection.empty) return DecorationSet.empty;

            const decoration = Decoration.widget(selection.to, () => {
              const span = document.createElement('span');
              span.className = 'text-gray-400 pointer-events-none select-none';
              span.textContent = ghostText;
              return span;
            });

            return DecorationSet.create(tr.doc, [decoration]);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
          handleKeyDown: (view, event) => {
            if (event.key === 'Tab' && this.storage.ghostText) {
              const { state, dispatch } = view;
              const { tr, selection } = state;
              
              tr.insertText(this.storage.ghostText, selection.to);
              
              this.storage.ghostText = '';
              
              dispatch(tr);
              return true; // Prevent default tab behavior
            }
            
            // Clear ghost text on any other keypress
            if (this.storage.ghostText && event.key !== 'Tab' && !event.ctrlKey && !event.metaKey) {
              this.storage.ghostText = '';
              // Force update to remove decoration
              view.dispatch(view.state.tr);
            }
            
            return false;
          },
        },
      }),
    ];
  },
});
