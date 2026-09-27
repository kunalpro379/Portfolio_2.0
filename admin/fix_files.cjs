const fs = require('fs');

// Fix Sidebar.tsx
let sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
// Remove corrupt className block and replace with correct one
sidebar = sidebar.replace(
  /className=\{\(\{ isActive \}\) =>[\s\S]*?\}/,
  `className={({ isActive }) =>
              'flex items-center gap-3 px-5 py-2.5 text-[12.5px] font-medium transition-all border-l-2 ' +
              (isActive
                ? 'bg-white/[0.08] text-white border-white'
                : 'text-white/40 hover:text-white hover:bg-white/[0.04] border-transparent')
            }`
);
fs.writeFileSync('src/components/Sidebar.tsx', sidebar, 'utf8');
console.log('Sidebar fixed');

// Fix Layout.tsx
let layout = fs.readFileSync('src/components/Layout.tsx', 'utf8');
layout = layout.replace(
  /className=\{\\fixed top-0[^}]*\}/,
  'className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}'
);
fs.writeFileSync('src/components/Layout.tsx', layout, 'utf8');
console.log('Layout fixed');
