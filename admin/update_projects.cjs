const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/Projects.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace Header section backgrounds
content = content.replace(/bg-card border border-border/g, 'bg-[#0d0d0d] border border-white/[0.06]');
content = content.replace(/bg-cream-soft hover:bg-cream-deep border border-border text-foreground/g, 'bg-transparent border border-white/20 text-white/80 hover:text-white hover:bg-white/[0.05]');
content = content.replace(/bg-accent text-cream hover:bg-accent\/90/g, 'bg-white text-black border border-white/20 hover:bg-white/90');
content = content.replace(/bg-foreground text-background hover:bg-accent/g, 'bg-white text-black border border-white/20 hover:bg-white/90');

// Replace Reorder mode items
content = content.replace(/border-border bg-cream-soft/g, 'border-white/[0.06] bg-white/[0.05]');
content = content.replace(/bg-cream-deep/g, 'bg-white/[0.03]');

// Update empty state
content = content.replace(/bg-card border border-border rounded-xl p-12 text-center shadow-sm/g, 'bg-[#0d0d0d] border border-white/[0.06] rounded-none p-12 text-center shadow-sm');
content = content.replace(/px-5 py-2.5 bg-foreground text-background hover:bg-accent/g, 'px-5 py-2.5 bg-white text-black border border-white/20 hover:bg-white/90');

// Grid items (Projects)
// The container
content = content.replace(/className="bg-card border border-border rounded-none overflow-hidden hover:border-accent\/40 transition-all shadow-xs flex flex-col justify-between"/g, 'className="bg-[#0d0d0d] border border-white/[0.06] rounded-none overflow-hidden hover:border-white/[0.2] transition-all shadow-xs flex flex-col justify-between"');

// Image
content = content.replace(/className="w-full h-44 object-cover border-b border-border"/g, 'className="w-full h-28 object-cover border-b border-white/[0.06]"');
content = content.replace(/className="w-full h-44 bg-cream-deep border-b border-border flex items-center justify-center"/g, 'className="w-full h-28 bg-[#0a0a0a] border-b border-white/[0.06] flex items-center justify-center"');

// Typography
content = content.replace(/className="text-lg font-display font-bold text-foreground mb-1.5 line-clamp-1"/g, 'className="text-sm font-semibold text-white mb-1 line-clamp-1"');
content = content.replace(/className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed"/g, 'className="text-[11px] text-white/50 mb-3 line-clamp-2 leading-relaxed"');
content = content.replace(/className="px-2 py-0.5 bg-cream-deep border border-border rounded text-\[10px\] label-mono font-medium text-foreground"/g, 'className="px-2 py-0.5 bg-white/[0.03] border border-white/[0.06] rounded-none text-[9px] uppercase tracking-wider font-mono text-white/70"');

// Padding inside card
content = content.replace(/<div className="p-5">/g, '<div className="p-4">');
content = content.replace(/<div className="p-5 pt-0 flex items-center gap-2">/g, '<div className="p-4 pt-0 flex items-center gap-2">');

// Edit Button
const oldEditBtn = `className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-surface hover:bg-cream-dark border border-border rounded-none text-xs font-semibold text-ink transition"`;
const newEditBtn = `className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-white/90 border border-white/20 rounded-none text-[10px] uppercase tracking-widest font-semibold transition"`;
content = content.replace(oldEditBtn, newEditBtn);

// Delete Button
const oldDelBtn = `className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60 rounded-none text-xs font-semibold transition"`;
const newDelBtn = `className="px-3 py-1.5 bg-transparent text-white/40 border border-white/20 hover:text-red-500 hover:border-red-500/50 rounded-none text-[10px] font-semibold transition flex items-center justify-center"`;
content = content.replace(oldDelBtn, newDelBtn);

// Remove specific rounded corners from buttons that might have them
content = content.replace(/rounded-lg/g, 'rounded-none');
content = content.replace(/rounded-xl/g, 'rounded-none');

fs.writeFileSync(filePath, content);
console.log('Fixed Projects.tsx premium theme!');
