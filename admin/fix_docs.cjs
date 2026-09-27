const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/Documentation.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// replace height of cover image
content = content.replace(/className="h-44 border-b border-border overflow-hidden"/g, 'className="h-32 border-b border-white/[0.06] overflow-hidden"');

// replace buttons
const oldButtons = `<div className="p-5 pt-0 flex items-center gap-2">
                <button
                  onClick={() => navigate(\`/documentation/edit/\${doc.docId}\`)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-cream-soft hover:bg-cream-deep border border-border rounded-lg text-xs font-semibold text-foreground transition"
                >
                  <Edit className="w-3.5 h-3.5 text-accent" />
                  Edit
                </button>
                <button
                  onClick={() => deleteDoc(doc.docId)}
                  className="px-3 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 rounded-lg text-xs font-semibold transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>`;

const newButtons = `<div className="p-5 pt-0 flex items-center gap-2">
                <button
                  onClick={() => navigate(\`/documentation/edit/\${doc.docId}\`)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-black hover:bg-white/90 border border-white/20 rounded-none text-[11px] uppercase tracking-widest font-semibold transition"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => deleteDoc(doc.docId)}
                  className="px-3 py-2 bg-white text-black hover:bg-white/90 border border-white/20 rounded-none text-xs font-semibold transition flex items-center justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>`;

content = content.replace(oldButtons, newButtons);
content = content.replace(/bg-card border border-border rounded-xl overflow-hidden/g, 'bg-[#0d0d0d] border border-white/[0.06] overflow-hidden');
content = content.replace(/bg-card border border-border rounded-xl p-6/g, 'bg-[#0d0d0d] border border-white/[0.06] p-6');

fs.writeFileSync(filePath, content);
console.log('Fixed buttons and height!');
