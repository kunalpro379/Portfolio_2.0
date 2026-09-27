const fs = require('fs');
const path = require('path');

const codePath = path.join(__dirname, 'src/pages/Code.tsx');
let codeContent = fs.readFileSync(codePath, 'utf8');

// Replace standard button classes with premium ones
codeContent = codeContent.replace(/bg-accent text-accent-contrast rounded-xl/g, 'bg-white text-black rounded-none');
codeContent = codeContent.replace(/hover:bg-accent-hover/g, 'hover:bg-white/90 border border-white/20');
codeContent = codeContent.replace(/bg-surface text-ink border border-border rounded-xl/g, 'bg-[#0a0a0a] text-white border border-white/[0.2] rounded-none');
codeContent = codeContent.replace(/hover:bg-cream-dark/g, 'hover:bg-white/[0.05]');

codeContent = codeContent.replace(/bg-card border border-border rounded-2xl/g, 'bg-[#0d0d0d] border border-white/[0.06] rounded-none');
codeContent = codeContent.replace(/bg-card border border-border rounded-xl/g, 'bg-[#0d0d0d] border border-white/[0.06] rounded-none');

codeContent = codeContent.replace(/text-ink-muted/g, 'text-white/40');
codeContent = codeContent.replace(/text-ink/g, 'text-white');
codeContent = codeContent.replace(/bg-surface/g, 'bg-[#0a0a0a]');
codeContent = codeContent.replace(/border-border\/80/g, 'border-white/[0.06]');
codeContent = codeContent.replace(/border-border\/50/g, 'border-white/[0.06]');
codeContent = codeContent.replace(/border-border/g, 'border-white/[0.06]');

fs.writeFileSync(codePath, codeContent);
console.log('Fixed Code.tsx buttons and theme!');
