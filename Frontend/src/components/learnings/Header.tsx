import { useState } from "react";
import kunalSketch from "/kunalpatilsketch.png";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{ label: string; value: string; bold?: boolean }>;
}

export function Header({ activeTab, onTabChange, tabs }: HeaderProps) {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-white backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6 lg:px-10">
          <a href="/" className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-secondary">
              <img src={kunalSketch} alt="" className="h-full w-full object-cover" />
            </span>
            <span className="flex items-baseline gap-3">
              <span className="font-display text-[14px] font-semibold tracking-tight text-foreground">Kunal Patil</span>
              <span className="label-mono hidden sm:inline text-[11px] text-foreground">AI/ML Engineer</span>
            </span>
          </a>

          <div className="hidden items-center gap-3 md:flex flex-1 justify-center">
            <nav className="flex items-center bg-black text-white rounded-md overflow-hidden">
              {tabs.map((n) => (
                <button
                  key={n.value}
                  onClick={() => onTabChange(n.value)}
                  className={`px-4 py-2 text-[12px] ${n.bold ? 'font-bold' : 'font-semibold'} tracking-wide transition-colors hover:bg-gray-800 ${activeTab === n.value ? "bg-[#8B4513]" : ""}`}
                >
                  {n.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <a href="https://github.com/kunalpro379" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-foreground hover:text-accent transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <button
              onClick={() => setIsContactOpen(true)}
              className="border-2 border-black px-6 py-2 text-[12px] font-semibold tracking-wide text-black transition-colors hover:bg-black hover:text-white"
            >
              CONTACT
            </button>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <span className="label-mono text-[11px] text-foreground">Mumbai</span>
          </div>
        </div>
      </header>

      {/* Contact Information Slider */}
      <div className={`fixed inset-y-0 right-0 z-[100] w-[400px] transform transition-transform duration-300 ease-in-out ${isContactOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full bg-black text-white rounded-tl-3xl rounded-bl-3xl shadow-2xl overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display text-[1.75rem] font-semibold">Contact Information</h3>
              <button onClick={() => setIsContactOpen(false)} className="text-white hover:text-accent transition-colors">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-[14px] text-white/70 mb-8">If you have any questions, feel free to get in touch with us.</p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <svg className="h-5 w-5 mt-1 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <div className="text-[12px] text-white/60 mb-1">PHONE</div>
                  <a href="tel:+919892885090" className="text-[15px] font-medium hover:text-accent">+91 9892885090</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <svg className="h-5 w-5 mt-1 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <div className="text-[12px] text-white/60 mb-1">EMAIL</div>
                  <a href="mailto:kunaldp379@gmail.com" className="text-[15px] font-medium hover:text-accent break-all">kunaldp379@gmail.com</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <svg className="h-5 w-5 mt-1 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <div className="text-[12px] text-white/60 mb-1">LOCATION</div>
                  <p className="text-[15px] font-medium">Mumbai, Maharashtra, India</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <svg className="h-5 w-5 mt-1 text-accent" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <div>
                  <div className="text-[12px] text-white/60 mb-1">GITHUB</div>
                  <a href="https://github.com/kunalpro379" target="_blank" rel="noopener noreferrer" className="text-[15px] font-medium hover:text-accent">github.com/kunalpro379</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <svg className="h-5 w-5 mt-1 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <div className="text-[12px] text-white/60 mb-1">RESUME</div>
                  <a href="https://notesportfolio.blob.core.windows.net/notes/Resume.kunal.pdf" target="_blank" rel="noopener noreferrer" className="text-[15px] font-medium text-accent hover:underline">View Resume →</a>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-accent/10 border-l-4 border-accent">
              <p className="text-[14px] leading-[1.6] text-white">
                <span className="font-semibold text-accent">Open for full-time roles</span> in AI/ML, DevOps, and Backend Development. Also available for <span className="font-semibold">freelance projects</span> and <span className="font-semibold">remote work opportunities</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isContactOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[99]"
          onClick={() => setIsContactOpen(false)}
        />
      )}
    </>
  );
}
