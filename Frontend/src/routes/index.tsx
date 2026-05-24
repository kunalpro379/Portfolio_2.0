import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import kunalSketch from "/kunalpatilsketch.png";
import heroImage from "/hero.png";
import workDebt from "@/assets/work-debt.jpg";
import workMars from "@/assets/work-mars.jpg";
import workEdu from "@/assets/work-edu.jpg";
import lifeTravel from "@/assets/life-travel.jpg";
import { config } from "@/config/config";

export const Route = createFileRoute("/")({ component: Index });

const API_BASE_URL = config.apiUrl;

interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  cardImage?: string;
  createdAt: string;
  order?: number;
}

const nav = [
  { label: "HOME", href: "#home" },
  { label: "EXPERIENCE", href: "#lab" },
  { label: "PROJECTS", href: "#work" },
  { label: "LEARNINGS", href: "/learnings" },
  { label: "RESUME", href: "https://notesportfolio.blob.core.windows.net/notes/Resume.kunal.pdf" },
];

function Header() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-white backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6 lg:px-10">
          <a href="#home" className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-secondary">
              <img src={kunalSketch} alt="" className="h-full w-full object-cover" />
            </span>
            <span className="flex items-baseline gap-3">
              <span className="font-display text-[14px] font-semibold tracking-tight text-foreground">Kunal Patil</span>
              <span className="label-mono hidden sm:inline text-[11px] text-foreground">AI/ML Engineer</span>
            </span>
          </a>

          <div className="hidden items-center gap-3 md:flex flex-1 justify-center">
            <nav className="flex items-center bg-black text-white">
              {nav.map((n, i) => (
                <a
                  key={n.href}
                  href={n.href}
                  target={n.label === "RESUME" ? "_blank" : undefined}
                  rel={n.label === "RESUME" ? "noopener noreferrer" : undefined}
                  className={`px-6 py-2 text-[12px] font-semibold tracking-wide transition-colors hover:bg-gray-800 ${i === 0 ? "outline outline-2 outline-white outline-offset-[-2px]" : ""}`}
                >
                  {n.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <a href="https://github.com/kunalpro379" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-foreground hover:text-accent transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <span className="label-mono text-[11px] text-foreground">Mumbai · {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })} IST</span>
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
                <svg className="h-5 w-5 mt-1 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="text-[12px] text-white/60 mb-1">AVAILABILITY</div>
                  <p className="text-[15px] font-medium">Monday - Sunday</p>
                  <p className="text-[13px] text-white/70">10:00 AM - 10:00 PM</p>
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

function Hero() {
  return (
    <section id="home" className="relative overflow-hidden border-b border-border">
      {/* Texture Background */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        backgroundImage: 'url(/page5.png)',
        backgroundSize: '60px 60px',
        backgroundPosition: '0 0',
        backgroundRepeat: 'repeat',
        opacity: 0.4,
        filter: 'grayscale(100%) contrast(1.8) brightness(0.2)'
      }} />

      {/* Decorative background overlay */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-cream/30 z-[1]">
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-[oklch(0.72_0.13_75/0.12)] blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-[oklch(0.6_0.16_35/0.10)] blur-3xl" />
      </div>

      <div className="relative z-[2] mx-auto grid max-w-[1400px] grid-cols-1 gap-8 px-6 py-12 lg:grid-cols-[1.4fr_1fr] lg:gap-12 lg:px-10 lg:py-16">
        <div>
          <div className="flex items-center gap-2 label-mono">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="text-foreground">Open to </span>
            <span className="text-accent font-semibold">interesting </span>
            <span className="text-foreground">opportunities — let's </span>
            <span className="text-accent font-semibold">build </span>
            <span className="text-foreground">something</span>
          </div>

          <h1 className="font-display mt-4 text-[clamp(3rem,8vw,7.5rem)] font-medium leading-[1.1] tracking-tight">
            <span className="block">
              <span className="text-foreground">Building </span>
              <span className="text-accent">Ideas</span>
            </span>
            <span className="block">
              <span className="text-foreground">Into </span>
              <span className="text-accent">Reality</span>
            </span>
          </h1>
          
          <div className="mt-4">
            <span className="font-display block text-[clamp(2rem,5vw,4rem)] font-bold tracking-tight text-[#8B4513]">
              KUNAL PATIL
            </span>
          </div>

          <p className="mt-4 max-w-xl text-[19px] leading-[1.6] text-foreground/75">
            I build <span className="text-accent font-semibold">scalable </span>
            <span className="text-foreground font-medium">backends, </span>
            <span className="text-accent font-semibold">automate </span>
            <span className="text-foreground font-medium">the cloud, and bring </span>
            <span className="text-accent font-semibold">AI </span>
            <span className="text-foreground font-medium">ideas to life.</span>
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <a href="#work" className="rounded-md bg-foreground px-6 py-3 text-[14px] font-medium text-background transition-colors hover:bg-foreground/90">
              See My Work
            </a>
            <a href="#writing" className="rounded-md border-2 border-foreground px-6 py-3 text-[14px] font-medium text-foreground transition-colors hover:bg-foreground hover:text-background">
              Learn With Me
            </a>
            <a href="#contact" className="rounded-md border-2 border-foreground px-6 py-3 text-[14px] font-medium text-foreground transition-colors hover:bg-foreground hover:text-background">
              Contact Me
            </a>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="badge-gold">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/70" /> 
              <span className="text-accent">AI/ML </span>
              <span className="text-foreground">Engineer</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground/80">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--sage)]" /> 
              <span className="text-foreground">Open to </span>
              <span className="text-accent font-semibold">opportunities</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground/80">
              <span className="text-accent font-semibold">Agentic AI</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6">
          <div className="relative w-full max-w-[380px]">
            <div className="absolute -inset-4 rounded-full bg-[oklch(0.72_0.13_75/0.18)] blur-2xl" />
            <img src={kunalSketch} alt="Portrait of Kunal Patil" width={600} height={600} className="relative w-full" />
          </div>
          
          <div className="relative w-full max-w-[320px] mt-4">
            <img src={heroImage} alt="Hero illustration" width={800} height={400} className="w-full" />
          </div>
          
          <div className="grid w-full grid-cols-3 gap-6 border-t border-border pt-6">
            {[
              { n: "04", l: "Years building" },
              { n: "50+", l: "Projects shipped" },
              { n: "10+", l: "Technologies" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-[2.25rem] font-semibold leading-none text-accent">
                  {s.n}
                </div>
                <div className="label-mono mt-3 text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tech stack strip */}
      <div className="relative border-t border-border bg-[var(--cream-soft)]/60">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-6 px-6 py-5 lg:px-10">
          <span className="label-mono text-foreground">Tech Stack</span>
          {[
            { text: "AI/ML", accent: true },
            { text: "GenAI", accent: false },
            { text: "DevOps", accent: true },
            { text: "Java", accent: false },
            { text: "SpringBoot", accent: true },
            { text: "Backend", accent: false },
            { text: "Deep Learning", accent: true }
          ].map((item) => (
            <span key={item.text} className={`font-display text-[17px] font-semibold tracking-tight ${item.accent ? 'text-accent' : 'text-foreground/70'}`}>
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}


function SectionLabel({ index, title, kicker }: { index: string; title: string; kicker: string }) {
  return (
    <div className="label-mono flex items-center gap-3">
      <span>{index}</span>
      <span className="text-foreground/50">/</span>
      <span>{title}</span>
      <span className="text-accent">{kicker}</span>
    </div>
  );
}

/*
function Currently() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-10">
        <SectionLabel index="01" title="Now" kicker="Currently" />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <p className="max-w-2xl text-[17px] leading-[1.65] text-foreground/75">
            I'm an AI/ML engineer who builds scalable, production-ready AI systems. I specialize in <em className="font-serif text-foreground">agentic AI systems</em>, LLMs, and deploying AI at scale with Node.js and AWS.
          </p>
          <span className="label-mono">Updated May 2026</span>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {[
            { tag: "AI/ML", title: "Building production-ready AI systems", body: "I specialize in agentic AI systems, LLMs, and generative AI. My focus is on making AI production-ready with scalable deployment architectures." },
            { tag: "Deployment", title: "Scalable AI infrastructure", body: "Deploying AI systems at scale using Node.js, AWS, and modern DevOps practices. I design for fault tolerance and performance from the start." },
          ].map((c) => (
            <article key={c.tag} className="card-premium relative overflow-hidden rounded-xl p-8">
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-[oklch(0.72_0.13_75/0.18)] blur-2xl" />
              <div className="flex items-center justify-between">
                <span className="badge-gold">{c.tag}</span>
                <span className="label-mono">Live</span>
              </div>
              <h3 className="font-display mt-7 text-[1.7rem] font-medium leading-tight">{c.title}</h3>
              <p className="mt-4 text-[16px] leading-[1.65] text-foreground/70">{c.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6">
          <article className="card-premium relative overflow-hidden rounded-xl p-8">
            <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-[oklch(0.72_0.13_75/0.18)] blur-2xl" />
            <div className="flex items-center justify-between">
              <span className="badge-gold">Exploring</span>
              <span className="label-mono">Current Focus</span>
            </div>
            <h3 className="font-display mt-7 text-[1.7rem] font-medium leading-tight">Agentic AI systems and real-time infrastructure</h3>
            <p className="mt-4 text-[16px] leading-[1.65] text-foreground/70">Right now I'm exploring how agentic AI, multi-agent systems, and real-time infrastructure can combine into practical, scalable production systems.</p>
          </article>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <article className="card-premium rounded-xl p-8">
            <div className="flex items-center justify-between">
              <div className="label-mono text-accent">Coffee</div>
              <div className="label-mono">Daily</div>
            </div>
            <h4 className="font-display mt-5 text-[1.45rem] font-medium">Vienna Roast</h4>
            <p className="mt-2 text-[14px] text-foreground/65">Third Wave Coffee · Blend</p>
            <div className="mt-10 flex flex-col items-center">
              <div className="flex items-center gap-3">
                <span className="flex gap-1">
                  <span className="h-3 w-3 rounded-full bg-foreground" />
                  <span className="h-3 w-3 rounded-full bg-foreground" />
                  <span className="h-3 w-3 rounded-full bg-foreground" />
                </span>
                <span className="label-mono">3 shots today</span>
              </div>
              <div className="mt-5 text-center">
                <div className="font-display text-[17px] font-semibold">Vienna Roast</div>
                <div className="label-mono mt-1">Third Wave · Blend</div>
                <div className="label-mono mt-3">Espresso · Moka pot on slow days</div>
              </div>
            </div>
          </article>

          <article className="card-premium rounded-xl p-8">
            <div className="flex items-center justify-between">
              <div className="label-mono text-accent">Kombucha</div>
              <div className="label-mono">Day 7</div>
            </div>
            <h4 className="font-display mt-5 text-[1.45rem] font-medium">Batch #43</h4>
            <p className="mt-2 text-[14px] text-foreground/65">Falsa & Ginger Lemon</p>
            <div className="mt-6 flex flex-col items-center">
              <div className="relative mt-3 h-32 w-20 rounded-b-2xl rounded-t-md border-2 border-foreground/80">
                <div className="absolute inset-x-0 top-0 h-3 -translate-y-2 rounded-md border-2 border-foreground/80 bg-card" />
                <div className="absolute inset-x-0 bottom-0 h-[78%] rounded-b-xl bg-gradient-to-t from-accent/70 to-accent/30" />
              </div>
              <div className="label-mono mt-4">Almost ready</div>
              <div className="mt-3 flex gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-border" />
                <span className="h-1.5 w-1.5 rounded-full bg-border" />
                <span className="h-1.5 w-4 rounded-full bg-accent" />
                <span className="h-1.5 w-1.5 rounded-full bg-border" />
              </div>
            </div>
          </article>

          <article className="card-premium rounded-xl p-8">
            <div className="flex items-center justify-between">
              <div className="label-mono text-accent">Books</div>
              <div className="label-mono">Nightstand</div>
            </div>
            <div className="label-mono mt-5">Om Swami</div>
            <h4 className="font-display mt-2 text-[1.35rem] font-medium leading-tight">If Truth Be Told: A Monk's Memoir</h4>
            <p className="mt-3 text-[14px] leading-[1.65] text-foreground/70">
              An honest, gripping account of the path to monkhood — less about religion, more about what it takes to commit completely.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="flex h-44 w-32 flex-col justify-between rounded-sm bg-[oklch(0.32_0.05_40)] p-3 text-cream shadow-lg">
                <span className="label-mono text-cream/70">Reading</span>
                <div>
                  <div className="font-serif text-[15px] leading-tight">If Truth Be Told</div>
                  <div className="label-mono mt-2 text-cream/70">Om Swami</div>
                </div>
              </div>
            </div>
          </article>
        </div>

      </div>
    </section>
  );
}
*/

function Work() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      try {
        console.log('Fetching from:', `${API_BASE_URL}/projects`);
        const response = await fetch(`${API_BASE_URL}/projects`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Raw API Response:', data);
        console.log('Projects array:', data.projects);
        console.log('Projects length:', data.projects?.length);
        
        // API returns { projects: [...] }, extract the array
        return data.projects || [];
      } catch (err) {
        console.error('Fetch error:', err);
        throw err;
      }
    },
  });

  const projects = data || [];
  console.log('Final projects to render:', projects);

  return (
    <section id="work" className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10">
        <SectionLabel index="02" title="Projects" kicker="Selected work" />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-8">
          <h2 className="font-display max-w-3xl text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold leading-[1.05]">
            4 years of building.{" "}
            <span className="text-muted-foreground">From ideas to production.</span>
          </h2>
          <a href="#" className="link-underline text-sm">View all projects ↗</a>
        </div>

        {isLoading ? (
          <div className="mt-16 text-center text-muted-foreground">Loading projects...</div>
        ) : error ? (
          <div className="mt-16 text-center text-muted-foreground">Failed to load projects. Please try again later.</div>
        ) : !projects || projects.length === 0 ? (
          <div className="mt-16 text-center text-muted-foreground">No projects found.</div>
        ) : (
          <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {projects.map((project, idx) => (
              <article key={project._id} className="group relative transition-all">
                <a 
                  href={project.links?.live || project.links?.github || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="overflow-hidden">
                    {project.cardasset && project.cardasset.length > 0 ? (
                      <img 
                        src={project.cardasset[0]} 
                        alt={project.title} 
                        loading="lazy" 
                        className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" 
                      />
                    ) : (
                      <div className="aspect-[16/10] w-full bg-gradient-to-br from-accent/20 to-accent/5" />
                    )}
                  </div>
                  <div className="py-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="label-mono text-[11px] text-muted-foreground">{String(idx + 1).padStart(2, '0')} · {project.projectId?.toUpperCase() || 'PROJECT'}</div>
                      <div className="label-mono text-[11px] text-muted-foreground">{new Date(project.created_at).getFullYear()}</div>
                    </div>
                    <h3 className="font-display text-[1.5rem] font-semibold leading-tight mb-3 group-hover:text-accent transition-colors">{project.title}</h3>
                    <p className="text-[13px] leading-[1.6] text-foreground/60 mb-4 line-clamp-3">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags?.slice(0, 4).map((tag) => (
                        <span key={tag} className="border border-border px-3 py-1 text-[11px] font-medium text-foreground/70 uppercase tracking-wide">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {(project.links?.github || project.links?.live) && (
                      <div className="flex items-center gap-4 pt-3 border-t border-border">
                        {project.links?.github && (
                          <span className="text-[11px] font-medium text-foreground/60 group-hover:text-accent uppercase tracking-wide transition-colors">
                            GitHub ↗
                          </span>
                        )}
                        {project.links?.live && (
                          <span className="text-[11px] font-medium text-accent uppercase tracking-wide">
                            Live Demo →
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </a>
              </article>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

function Lab() {
  const experiences = [
    { 
      tag: "Current", 
      cat: "Agentic AI Specialist", 
      company: "Idolize Business Solutions",
      period: "Present",
      title: "Building intelligent AI agent systems", 
      body: "Developing agentic AI systems and multi-agent workflows for production environments. Focus on autonomous decision-making, tool integration, and scalable AI architectures.",
      accent: true,
      skills: ["Agentic AI", "Multi-Agent Systems", "LLMs", "Production AI"]
    },
    { 
      tag: "2025", 
      cat: "Data & Full-Stack Intern", 
      company: "ProSmart Concepts & Hydralite",
      period: "Dec 2024 - Jan 2025",
      title: "Full-stack development and data engineering", 
      body: "Built n8n workflows to automate data extraction, cleaning, and validation. Designed admin dashboard for product handling and client-facing website with seamless data consistency.",
      accent: false,
      skills: ["JavaScript", "SQL", "Node.js", "n8n", "Data Engineering"]
    },
    { 
      tag: "2025", 
      cat: "AQI Prediction & Analytics", 
      company: "Panache Digilife Pvt. Ltd.",
      period: "Feb 2025 - Apr 2025",
      title: "Time series forecasting with hybrid ML models", 
      body: "Implemented ARIMA-LSTM hybrid model for air quality forecasting under Dr. Kanchan Chavan. Deployed real-time prediction system using Firebase listeners for live data updates.",
      accent: false,
      skills: ["Python", "ARIMA", "LSTM", "Time Series", "Firebase"]
    },
    { 
      tag: "2024", 
      cat: "Freelance DevOps Engineer", 
      company: "SignalMint (Plasma)",
      period: "December 2024",
      title: "AWS infrastructure and CI/CD deployment", 
      body: "Deployed production platform on AWS using ECS, EC2, and ECR. Configured autoscaling, ALB with GoDaddy DNS, and implemented CI/CD pipelines with GitHub Actions for automated deployments.",
      accent: false,
      skills: ["AWS ECS", "Docker", "CI/CD", "GitHub Actions", "ALB"]
    },
  ];
  
  return (
    <section id="lab" className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10">
        <SectionLabel index="03" title="Experience" kicker="Work history" />
        <div className="mt-6">
          <h2 className="font-display text-[clamp(2.25rem,4.5vw,3.5rem)] font-bold leading-[1.05]">
            Work History
          </h2>
        </div>

        <ul className="mt-14 divide-y divide-border border-y border-border">
          {experiences.map((e) => (
            <li key={e.company} className={`grid grid-cols-[1fr] gap-6 py-10 md:grid-cols-[160px_1fr] md:items-start ${e.accent ? 'bg-accent/5' : ''}`}>
              <div className="flex flex-col gap-2">
                <div className={`label-mono flex items-center gap-2 font-semibold ${e.accent ? "text-accent" : "text-muted-foreground"}`}>
                  <span className={`inline-block h-2 w-2 rounded-full ${e.accent ? "bg-accent animate-pulse" : "bg-muted-foreground"}`} />
                  {e.tag}
                </div>
                <div className="label-mono text-[12px] text-muted-foreground">{e.period}</div>
              </div>
              <div>
                <div className="flex flex-col gap-2 mb-4">
                  <h3 className={`font-display text-[1.75rem] font-semibold leading-tight ${e.accent ? 'text-foreground' : 'text-foreground'}`}>{e.company}</h3>
                  <div className={`text-[15px] font-semibold ${e.accent ? 'text-accent' : 'text-foreground'}`}>{e.cat}</div>
                  <div className="label-mono text-[13px] text-muted-foreground">{e.title}</div>
                </div>
                <p className={`max-w-3xl text-[15px] leading-[1.7] ${e.accent ? 'text-foreground/80' : 'text-foreground/70'}`}>{e.body}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {e.skills.map((skill) => (
                    <span key={skill} className={`border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide ${e.accent ? 'border-accent/30 bg-accent/10 text-accent' : 'border-border bg-card text-foreground/70'}`}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/*
function Capabilities() {
  const caps = [
    { k: "01", title: "Product & UX Strategy", body: "End-to-end product thinking — research, IA, flows, prototypes, and the launch playbook to support them.", tags: ["Research", "Flows", "Systems"] },
    { k: "02", title: "Conversion Engineering", body: "Funnel rebuilds, landing-page systems, A/B engines and analytics that move real revenue numbers.", tags: ["CRO", "Analytics", "Growth"] },
    { k: "03", title: "AI & Automation", body: "Agentic workflows, MCP tooling, and content / ops pipelines that compound team velocity.", tags: ["MCP", "Agents", "Pipelines"] },
    { k: "04", title: "CRM & Ops Architecture", body: "Decision engines, integrations across 100+ services, and operational clarity at scale.", tags: ["CRM", "APIs", "Ops"] },
  ];
  return (
    <section className="relative border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10">
        <SectionLabel index="0A" title="Capabilities" kicker="What I do" />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-8">
          <h2 className="font-display max-w-3xl text-[clamp(2.25rem,4.5vw,3.5rem)] font-medium leading-[1.05]">
            A full studio inside one operator. <span className="font-serif italic text-foreground/60">Strategy to ship.</span>
          </h2>
          <span className="label-mono">Four pillars · 09 years</span>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          {caps.map((c) => (
            <article key={c.k} className="card-premium group relative overflow-hidden rounded-xl p-8">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[oklch(0.72_0.13_75/0.10)] blur-2xl transition-opacity group-hover:opacity-80" />
              <div className="flex items-start justify-between">
                <span className="font-display text-[2.5rem] font-medium leading-none text-foreground/25">{c.k}</span>
                <span className="label-mono">Pillar</span>
              </div>
              <h3 className="font-display mt-6 text-[1.75rem] font-medium leading-tight">{c.title}</h3>
              <p className="mt-3 text-[16px] leading-[1.65] text-foreground/70">{c.body}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {c.tags.map((t) => (
                  <span key={t} className="rounded-full border border-border bg-[var(--cream-soft)] px-3 py-1 text-[12px] font-medium text-foreground/70">{t}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
*/


function Testimonials() {
  const education = [
    { 
      period: "2022 - 2026", 
      degree: "Bachelor of Technology", 
      field: "Artificial Intelligence and Data Science, Mumbai",
      score: "CGPA: 8.1",
      institution: "Vivekanand Education Society Institute of Technology",
      initials: "BT"
    },
    { 
      period: "2019 - 2021", 
      degree: "Higher Secondary Certificate", 
      field: "Science Stream (PCM)",
      score: "89.67% | CET: 96.19 Percentile",
      institution: "Chandibai Himathmaal Mansukhani Collage, Ulhasnagar",
      initials: "HS"
    },
    { 
      period: "2018 - 2019", 
      degree: "Secondary School Certificate", 
      field: "10th grade",
      score: "91%",
      institution: "Bhausaheb Paranjpe Vidyalaya, Ambernath, Thane",
      initials: "SS"
    },
  ];

  return (
    <section className="relative border-b border-border bg-[var(--cream-soft)]/50">
      <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10">
        <SectionLabel index="0B" title="Education" kicker="Academic journey" />
        <h2 className="font-display mt-6 max-w-3xl text-[clamp(2.25rem,4.5vw,3.5rem)] font-medium leading-[1.05]">
          Learning never stops.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {education.map((edu) => (
            <figure key={edu.institution} className="card-premium relative p-8 flex flex-col h-[320px]">
              <span className="font-display absolute -top-4 left-6 text-7xl leading-none text-accent/40">"</span>
              <blockquote className="relative font-serif text-[1.25rem] leading-[1.45] text-foreground/85 flex-grow">
                {edu.degree} in {edu.field}.
                <br />
                <br />
                Achieved {edu.score} during {edu.period}.
              </blockquote>
              <figcaption className="mt-8 flex items-start gap-3 border-t border-border pt-5">
                <span className="flex h-2 w-2 bg-accent mt-2" />
                <div className="flex-1">
                  <div className="inline-block bg-accent/10 px-3 py-1 text-[12px] font-semibold text-accent mb-2">{edu.period}</div>
                  <div className="text-[14px] font-medium leading-relaxed text-foreground/90">{edu.institution}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}



function Writing() {
  const { data: blogsData } = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/blogs`);
      if (!response.ok) return { blogs: [] };
      const data = await response.json();
      return data;
    },
  });

  const allBlogs = blogsData?.blogs || [];
  const topBlogs = allBlogs.slice(0, 2);
  const bottomBlogs = allBlogs.slice(2, 6);
  
  return (
    <section id="writing" className="border-b border-white/10 bg-black text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10">
        {/* Section Header */}
        <div className="mb-16">
          <div className="label-mono flex items-center gap-3 text-white/70 mb-8">
            <span className="text-white text-[14px]">04</span>
            <span className="text-white/40">/</span>
            <span className="text-white text-[14px]">Readings</span>
          </div>
          <h2 className="font-display text-[clamp(3.5rem,7vw,6rem)] font-bold leading-[1] text-white">
            Readings
          </h2>
        </div>
        
        {/* Top 2 Blogs - Large Cards */}
        <div className="mb-12">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {topBlogs.map((blog: any) => (
              <article key={blog._id} className="border-t border-white/20 pt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="label-mono text-[12px] text-white/60 uppercase tracking-wider">{blog.subject || 'Blog'}</div>
                  <div className="label-mono text-[12px] text-white/50">{new Date(blog.datetime || blog.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                </div>
                <h3 className="font-display text-[2rem] font-bold leading-[1.2] text-white mb-4 hover:text-white/80 transition-colors cursor-pointer">{blog.title}</h3>
                <p className="text-[15px] leading-[1.7] text-white/70 line-clamp-2 mb-5">{blog.shortDescription || blog.description || 'Read more about this topic...'}</p>
                <div className="flex flex-wrap items-center gap-3">
                  {blog.tags?.slice(0, 4).map((tag: string) => (
                    <span key={tag} className="label-mono text-[11px] text-white/50 uppercase tracking-wider">{tag}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Bottom 4 Blogs - Smaller Cards */}
        <div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {bottomBlogs.map((blog: any) => (
              <article key={blog._id} className="bg-white text-black p-6 rounded-lg hover:shadow-xl transition-shadow cursor-pointer">
                <div className="mb-4">
                  <span className="inline-block bg-black text-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wide">
                    {blog.subject || 'BLOG'}
                  </span>
                </div>
                <h3 className="font-display text-[1.25rem] font-semibold leading-tight mb-3 hover:text-black/70 transition-colors">
                  {blog.title}
                </h3>
                <p className="text-[13px] leading-[1.6] text-black/70 line-clamp-3 mb-4">
                  {blog.shortDescription || blog.description || 'Explore this blog...'}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {blog.tags?.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-[10px] text-black/60 uppercase tracking-wide">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-black/80">
                  <span>VIEW DETAILS</span>
                  <span>→</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Life() {
  return (
    <section id="life" className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10">
        <SectionLabel index="05" title="Projects" kicker="" />
        <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-[1fr_1.5fr] md:items-center">
          <div className="relative overflow-hidden">
            <img src="/debate.png" alt="AI Battleground Debate Platform" loading="lazy" className="w-full object-cover" />
          </div>
          <div>
            <h3 className="font-display text-[2rem] font-semibold mb-4">AI Battleground</h3>
            <p className="text-[16px] leading-[1.7] text-foreground/80">
              Battleground is an AI-powered multi-agent debate platform where two intelligent AI teams engage in structured argumentative battles on dynamic topics. The system simulates real-time debates with multiple AI personas, role-based reasoning, live dialogue streaming, scoring mechanisms, and a judge model that evaluates logical consistency, rebuttal strength, ethical reasoning, and overall performance to declare the winning team.
            </p>
            <a href="#" className="mt-6 inline-block rounded-md bg-accent px-6 py-3 text-[14px] font-semibold text-background transition-colors hover:bg-accent/90">
              Read More →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 py-28 lg:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-[clamp(3rem,7vw,6.5rem)] font-bold leading-[0.95]">
              Got an<br />
              <span className="text-accent">interesting<br />problem?</span><br />
              Let's talk about it.
            </h2>
            <p className="mt-8 max-w-md text-[17px] leading-[1.65] text-foreground/75">
              I'm always open to conversations about AI/ML systems, agentic AI, and scalable deployment. Whether it's a challenging AI problem or an interesting project idea, let's talk.
            </p>
            <a href="mailto:kunaldp379@gmail.com" className="font-display mt-6 inline-block border-b border-foreground pb-2 text-xl font-medium">
              kunaldp379@gmail.com →
            </a>

            {/* Social Links */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="https://github.com/kunalpro379" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent transition-colors" aria-label="GitHub">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              
              <a href="https://www.instagram.com/kunal_patil379/" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent transition-colors" aria-label="Instagram">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              
              <a href="https://www.linkedin.com/in/kunal-patil-0357a5259/" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent transition-colors" aria-label="LinkedIn">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              
              <a href="https://x.com/KunalPa40651307" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent transition-colors" aria-label="Twitter">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              
              <a href="https://www.threads.com/@kunal_patil379" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent transition-colors" aria-label="Threads">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142l-.126 1.974a11.881 11.881 0 0 0-2.588-.12c-1.014.058-1.84.355-2.458.885-.558.48-.831 1.074-.789 1.718.04.628.356 1.16.914 1.539.607.413 1.417.587 2.347.502 1.048-.096 1.834-.466 2.335-1.098.331-.417.574-.98.725-1.684l.014-.066c.005-.02.01-.041.015-.062a6.317 6.317 0 0 0-.417-.02c-1.318-.07-2.485-.453-3.47-1.14-1.214-.847-1.895-2.073-1.895-3.446 0-1.447.748-2.754 2.104-3.677 1.222-.832 2.812-1.29 4.475-1.29 1.816 0 3.43.515 4.668 1.49 1.36 1.072 2.148 2.635 2.148 4.277v.054c0 2.854-1.337 5.136-3.868 6.604-1.416.822-3.04 1.239-4.828 1.239zm1.48-8.885c.823.562 1.784.84 2.856.826.845-.011 1.622-.18 2.311-.5.897 1.256.794 2.638-.308 4.11-1.218 1.625-3.239 2.456-6.01 2.475-3.878-.03-6.866-1.469-8.392-4.047-1.379-2.329-2.08-5.874-2.08-10.538 0-4.662.701-8.207 2.08-10.538C7.644 1.469 10.632.03 14.51 0c3.876.03 6.865 1.469 8.392 4.047 1.379 2.329 2.08 5.874 2.08 10.538 0 4.662-.701 8.207-2.08 10.538-1.527 2.578-4.516 4.017-8.392 4.047-2.771-.019-4.792-.85-6.01-2.475-1.102-1.472-1.205-2.854-.308-4.11.689.32 1.466.489 2.311.5 1.072.014 2.033-.264 2.856-.826z"/></svg>
              </a>
              
              <a href="https://kunaldp379.medium.com/" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent transition-colors" aria-label="Medium">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>
              </a>

              <a href="https://wa.me/919892885090" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent transition-colors" aria-label="WhatsApp">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              </a>

              <a href="tel:+919892885090" className="text-foreground hover:text-accent transition-colors" aria-label="Phone">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </a>

              <a href="mailto:kunaldp379@gmail.com" className="text-foreground hover:text-accent transition-colors" aria-label="Email">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </a>

              <a href="https://notesportfolio.blob.core.windows.net/notes/Resume.kunal.pdf" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent transition-colors" aria-label="Resume">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </a>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="flex items-center">
            <div className="card-premium w-full p-8 rounded-xl">
              <h3 className="font-display text-[1.75rem] font-semibold mb-4">Contact Information</h3>
              <p className="text-[14px] text-foreground/70 mb-6">If you have any questions, feel free to get in touch with us.</p>
              
              <div className="space-y-5">
                <div>
                  <div className="label-mono text-accent mb-1">PHONE</div>
                  <a href="tel:+919892885090" className="text-[16px] font-medium hover:text-accent">+91 9892885090</a>
                </div>
                
                <div>
                  <div className="label-mono text-accent mb-1">EMAIL</div>
                  <a href="mailto:kunaldp379@gmail.com" className="text-[16px] font-medium hover:text-accent break-all">kunaldp379@gmail.com</a>
                </div>
                
                <div>
                  <div className="label-mono text-accent mb-1">LOCATION</div>
                  <p className="text-[16px] font-medium">Mumbai, Maharashtra, India</p>
                </div>
                
                <div>
                  <div className="label-mono text-accent mb-1">AVAILABILITY</div>
                  <p className="text-[16px] font-medium">Monday - Sunday</p>
                  <p className="text-[14px] text-foreground/70">10:00 AM - 10:00 PM</p>
                </div>
                
                <div>
                  <div className="label-mono text-accent mb-1">GITHUB</div>
                  <a href="https://github.com/kunalpro379" target="_blank" rel="noopener noreferrer" className="text-[16px] font-medium hover:text-accent">github.com/kunalpro379</a>
                </div>
                
                <div>
                  <div className="label-mono text-accent mb-1">RESUME</div>
                  <a href="https://notesportfolio.blob.core.windows.net/notes/Resume.kunal.pdf" target="_blank" rel="noopener noreferrer" className="text-[16px] font-medium text-accent hover:underline">View Resume →</a>
                </div>
              </div>

              <div className="mt-6 p-4 bg-accent/10 border-l-4 border-accent rounded">
                <p className="text-[14px] leading-[1.6] text-foreground">
                  <span className="font-semibold text-accent">Open for full-time roles</span> in AI/ML, DevOps, and Backend Development. Also available for <span className="font-semibold">freelance projects</span> and <span className="font-semibold">remote work opportunities</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    { h: "Work", items: ["My Debt Plan", "Emirates Mars Mission", "Skillstrainer", "Calypsu"] },
    { h: "Writing", items: ["Design", "Development", "Management", "Philosophy"] },
    { h: "More", items: ["Books", "Events"] },
  ];
  return (
    <footer>
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
        <div>
          <div className="label-mono">© 2026 Kunal Patil</div>
          <p className="mt-3 text-[14px] text-muted-foreground">AI/ML Engineer. Building scalable AI systems with agentic workflows and production deployment.</p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <div className="label-mono">{c.h}</div>
            <ul className="mt-4 space-y-2 text-[14px]">
              {c.items.map((i) => (<li key={i}><a href="#" className="hover:text-accent">{i}</a></li>))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}

function Index() {
  return (
    <main className="min-h-screen text-foreground">
      <Header />
      <Hero />
      {/* <Currently /> */}
      <Work />
      {/* <Capabilities /> */}
      <Lab />
      <Life />
      <Writing />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}
