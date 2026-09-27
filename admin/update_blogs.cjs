const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/Blogs.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace Header backgrounds
content = content.replace(/bg-card border border-border rounded-xl p-6/g, 'bg-[#0d0d0d] border border-white/[0.06] rounded-none p-6');
content = content.replace(/bg-foreground text-background hover:bg-accent rounded-lg/g, 'bg-white text-black hover:bg-white/90 border border-white/20 rounded-none');

// Empty State
content = content.replace(/bg-card border border-border rounded-xl p-12/g, 'bg-[#0d0d0d] border border-white/[0.06] rounded-none p-12');

// Grid structure (make it 4 cols on large screens to make cards smaller)
content = content.replace(/grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6/g, 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4');

// Grid items (Projects)
// The container
content = content.replace(/bg-card border border-border rounded-xl overflow-hidden hover:border-accent\/40/g, 'bg-[#0d0d0d] border border-white/[0.06] rounded-none overflow-hidden hover:border-white/[0.2]');

// Image
content = content.replace(/h-44 border-b border-border/g, 'h-28 border-b border-white/[0.06]');

// Typography
content = content.replace(/text-base font-display font-bold text-foreground mb-1.5/g, 'text-sm font-semibold text-white mb-1');
content = content.replace(/text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed/g, 'text-[11px] text-white/50 mb-3 line-clamp-2 leading-relaxed');

// Subject Tag
content = content.replace(/bg-accent\/15 text-accent border border-accent\/20 rounded label-mono text-\[10px\]/g, 'bg-white/[0.05] text-white/70 border border-white/[0.1] rounded-none font-mono text-[9px]');

// Tags
content = content.replace(/bg-cream-deep border border-border rounded label-mono text-\[10px\] text-foreground/g, 'bg-white/[0.03] border border-white/[0.06] rounded-none font-mono text-[9px] uppercase tracking-wider text-white/70');

// Padding inside card
content = content.replace(/<div className="p-5">/g, '<div className="p-4">');
content = content.replace(/<div className="p-5 pt-0 flex items-center gap-2">/g, '<div className="p-4 pt-0 flex items-center gap-2">');

// Visibility Button
const oldVisBtn = `className={\`flex items-center justify-center p-2 border border-border rounded-lg text-xs font-semibold transition \${
                    blog.isVisible === false
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-cream-soft hover:bg-cream-deep text-foreground'
                  } \${togglingId === blog.blogId ? 'opacity-50' : ''}\`}`;
const newVisBtn = `className={\`flex items-center justify-center p-1.5 border rounded-none text-xs font-semibold transition \${
                    blog.isVisible === false
                      ? 'bg-red-500/10 text-red-500 border-red-500/30'
                      : 'bg-transparent border-white/20 text-white/40 hover:text-white'
                  } \${togglingId === blog.blogId ? 'opacity-50' : ''}\`}`;
content = content.replace(oldVisBtn, newVisBtn);


// Edit Button
const oldEditBtn = `className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-cream-soft hover:bg-cream-deep border border-border rounded-lg text-xs font-semibold text-foreground transition"`;
const newEditBtn = `className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-white/90 border border-white/20 rounded-none text-[10px] uppercase tracking-widest font-semibold transition"`;
content = content.replace(oldEditBtn, newEditBtn);

// Delete Button
const oldDelBtn = `className="px-3 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 rounded-lg text-xs font-semibold transition"`;
const newDelBtn = `className="px-3 py-1.5 bg-transparent text-white/40 border border-white/20 hover:text-red-500 hover:border-red-500/50 rounded-none text-[10px] font-semibold transition flex items-center justify-center"`;
content = content.replace(oldDelBtn, newDelBtn);

// Modal
content = content.replace(/bg-card border border-border rounded-2xl p-6/g, 'bg-[#0d0d0d] border border-white/[0.06] rounded-none p-6 shadow-2xl');
content = content.replace(/bg-background border border-border rounded-lg text-foreground/g, 'bg-[#0a0a0a] border border-white/[0.1] rounded-none text-white focus:border-white/[0.3]');
content = content.replace(/bg-cream-soft hover:bg-cream-deep border border-border text-foreground/g, 'bg-transparent border border-white/20 text-white/60 hover:text-white hover:bg-white/[0.05]');

// Strip all other rounded corners
content = content.replace(/rounded-lg/g, 'rounded-none');
content = content.replace(/rounded-xl/g, 'rounded-none');
content = content.replace(/rounded-2xl/g, 'rounded-none');

fs.writeFileSync(filePath, content);
console.log('Fixed Blogs.tsx premium theme!');
