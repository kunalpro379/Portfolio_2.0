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
import { PremiumLoader } from "@/components/learnings/PremiumLoader";
import { TechStackStrip } from "@/components/TechStackStrip";
import { ContactSidebar } from "@/components/ContactSidebar";
import { SocialLinks } from "@/components/SocialLinks";
import { SiteFooter } from "@/components/SiteFooter";
import { ProjectDetailSlider } from "@/components/learnings/ProjectDetailSlider";
import { ProjectCardsShimmer, ReadingsCardsShimmer } from "@/components/ui/Shimmer";

export const Route = createFileRoute("/")({ component: Index });

const API_BASE_URL = config.apiUrl;

async function fetchProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE_URL}/projects`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.projects || [];
}

interface Project {
  _id: string;
  title: string;
  description: string;
  technologies?: string[];
  tags?: string[];
  githubUrl?: string;
  liveUrl?: string;
  cardImage?: string;
  cardasset?: string[];
  projectId?: string;
  created_at?: string;
  createdAt?: string;
  links?: { github?: string; live?: string } | Array<{ name: string; url: string }>;
  order?: number;
  [key: string]: unknown;
}

const nav = [
  { label: "HOME", href: "#home" },
  { label: "EXPERIENCE", href: "#lab" },
  { label: "PROJECTS", href: "#work" },
  { label: "LEARNINGS", href: "/learnings" },
  { label: "RESUME", href: "https://notesportfolio.blob.core.windows.net/notes/Resume.kunal.pdf" },
];

function NavTabs({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const isMobile = variant === "mobile";

  return (
    <nav
      className={`flex bg-black text-white ${
        isMobile
          ? "min-h-[36px] w-full items-stretch overflow-x-auto scrollbar-none"
          : "items-center"
      }`}
    >
      {nav.map((n, i) => (
        <a
          key={n.href}
          href={n.href}
          target={n.label === "RESUME" ? "_blank" : undefined}
          rel={n.label === "RESUME" ? "noopener noreferrer" : undefined}
          className={`flex items-center justify-center whitespace-nowrap font-semibold tracking-wide transition-colors hover:bg-gray-800 ${
            isMobile
              ? "min-w-0 flex-1 border-r border-white/15 px-1 py-2 text-[8px] last:border-r-0 sm:px-2 sm:text-[10px]"
              : "px-6 py-2 text-[12px]"
          } ${!isMobile && i === 0 ? "outline outline-2 outline-white outline-offset-[-2px]" : ""}`}
        >
          {n.label}
        </a>
      ))}
    </nav>
  );
}

function Header({ onContactClick }: { onContactClick: () => void }) {
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-white backdrop-blur-md">
        {/* Main navbar */}
        <div className="page-container flex h-14 items-center justify-between">
          <a href="#home" className="flex items-center gap-3">
            <button 
              onClick={(e) => {
                e.preventDefault();
                setIsAvatarOpen(true);
              }}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-secondary cursor-pointer hover:ring-2 hover:ring-accent transition-all"
            >
              <img src="/kunalgta.png" alt="" className="h-full w-full object-cover" />
            </button>
            <span className="flex items-baseline gap-3">
              <span className="font-display text-[14px] font-semibold tracking-tight text-foreground">Kunal Patil</span>
              <span className="label-mono hidden sm:inline text-[11px] text-foreground">AI/ML Engineer</span>
            </span>
          </a>

          <div className="hidden flex-1 items-center justify-center md:flex">
            <NavTabs variant="desktop" />
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <a href="https://github.com/kunalpro379" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-foreground hover:text-accent transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <span className="label-mono text-[11px] text-foreground">Mumbai · {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })} IST</span>
            <button
              type="button"
              onClick={onContactClick}
              className="border-2 border-black px-6 py-2 text-[12px] font-semibold tracking-wide text-black transition-colors hover:bg-black hover:text-white"
            >
              CONTACT
            </button>
          </div>

          <div className="flex items-center gap-2.5 md:hidden">
            <a
              href="https://github.com/kunalpro379"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center text-foreground transition-colors hover:text-accent"
              aria-label="GitHub"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <button
              type="button"
              onClick={onContactClick}
              className="border-2 border-black px-3 py-1.5 text-[10px] font-semibold tracking-wide text-black"
            >
              CONTACT
            </button>
          </div>
        </div>

        {/* Mobile-only tabs — full-width black bar */}
        <div className="bg-black md:hidden">
          <NavTabs variant="mobile" />
        </div>
      </header>

      {/* Avatar Modal */}
      {isAvatarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
            onClick={() => setIsAvatarOpen(false)}
          >
            <div className="relative max-w-2xl w-full">
              <button 
                onClick={() => setIsAvatarOpen(false)}
                className="absolute -top-12 right-0 text-white hover:text-accent transition-colors"
              >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img 
                src="/kunalgta.png" 
                alt="Kunal Patil" 
                className="w-full h-auto rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}

function Hero({ onContactClick }: { onContactClick: () => void }) {
  return (
    <section id="home" className="relative overflow-hidden border-b border-border">
      {/* Decorative background overlay */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-cream/30 z-[1]">
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-[oklch(0.72_0.13_75/0.12)] blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-[oklch(0.6_0.16_35/0.10)] blur-3xl" />
      </div>

      <div className="page-container relative z-[2] grid grid-cols-1 gap-8 py-12 lg:grid-cols-[1.4fr_1fr] lg:gap-12 lg:py-16">
        <div>
          <p className="label-mono max-w-full text-[10px] leading-[1.5] tracking-wide sm:text-[11px]">
            <span className="inline-flex items-start gap-2">
              <span className="relative mt-1.5 flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span>
                <span className="text-foreground">Open to </span>
                <span className="text-accent font-semibold">interesting </span>
                <span className="text-foreground">opportunities — let&apos;s </span>
                <span className="text-accent font-semibold">build </span>
                <span className="text-foreground">something</span>
              </span>
            </span>
          </p>

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

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <a
              href="#work"
              className="rounded-md bg-foreground px-4 py-2.5 text-center text-[13px] font-semibold text-background transition-colors hover:bg-[#8B4513] sm:px-6 sm:py-3 sm:text-[15px] lg:px-8 lg:py-4 lg:text-[16px]"
            >
              Explore My Projects & Work
            </a>
            <a
              href="#writing"
              className="rounded-md border-2 border-foreground px-4 py-2.5 text-center text-[13px] font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background sm:px-6 sm:py-3 sm:text-[15px] lg:px-8 lg:py-4 lg:text-[16px]"
            >
              Read My Learnings & Blogs
            </a>
            <button
              type="button"
              onClick={onContactClick}
              className="rounded-md border-2 border-foreground px-4 py-2.5 text-center text-[13px] font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background sm:px-6 sm:py-3 sm:text-[15px] lg:px-8 lg:py-4 lg:text-[16px]"
            >
              Get In Touch With Me
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center border border-border px-3 py-1.5 text-[12px] font-medium text-foreground">
              <span className="text-foreground">AI/ML Engineer</span>
            </span>
            <span className="inline-flex items-center border border-border px-3 py-1.5 text-[12px] font-medium text-foreground">
              <span className="text-foreground">Open to opportunities</span>
            </span>
            <span className="inline-flex items-center border border-border px-3 py-1.5 text-[12px] font-medium text-foreground">
              <span className="text-foreground">Agentic AI</span>
            </span>
            <span className="inline-flex items-center border border-border px-3 py-1.5 text-[12px] font-medium text-foreground">
              <span className="text-foreground">Cloud & DevOps</span>
            </span>
            <span className="inline-flex items-center border border-border px-3 py-1.5 text-[12px] font-medium text-foreground">
              <span className="text-foreground">LLM</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 sm:gap-6">
          <div className="relative w-full max-w-[240px] sm:max-w-[380px]">
            <div className="absolute -inset-3 rounded-full bg-[oklch(0.72_0.13_75/0.18)] blur-2xl sm:-inset-4" />
            <img src={kunalSketch} alt="Portrait of Kunal Patil" width={600} height={600} className="relative w-full" />
          </div>

          <div className="relative mt-2 w-full max-w-[200px] sm:mt-4 sm:max-w-[320px]">
            <img src={heroImage} alt="Hero illustration" width={800} height={400} className="w-full" />
          </div>

          <div className="grid w-full max-w-[280px] grid-cols-3 gap-2 border-t border-border pt-4 sm:max-w-none sm:gap-6 sm:pt-6">
            {[
              { n: "04", l: "Years building" },
              { n: "50+", l: "Projects shipped" },
              { n: "10+", l: "Technologies" },
            ].map((s) => (
              <div key={s.l} className="text-center sm:text-left">
                <div className="font-display text-[1.15rem] font-semibold leading-none text-accent sm:text-[2.25rem]">
                  {s.n}
                </div>
                <div className="label-mono mt-1 text-[7px] leading-tight text-muted-foreground sm:mt-3 sm:text-[11px]">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TechStackStrip />
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
      <div className="page-container py-16 sm:py-20">
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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectOpen, setIsProjectOpen] = useState(false);

  const { data, isLoading, isError, isFetching, isSuccess } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const projects = data || [];
  const showShimmer = isLoading || isError || isFetching;

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setIsProjectOpen(true);
  };

  const closeProject = () => {
    setIsProjectOpen(false);
    setSelectedProject(null);
  };

  return (
    <section id="work" className="border-b border-border">
      <div className="page-container py-16 sm:py-24">
        {/* Other Projects Section */}
        <SectionLabel index="02" title="Projects" kicker="More work" />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-8">
          <h2 className="font-display max-w-3xl text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold leading-[1.05]">
            4 years of building.{" "}
            <span className="text-muted-foreground">""</span>
          </h2>
          <a href="#" className="link-underline text-sm">View all projects ↗</a>
        </div>

        {showShimmer ? (
          <ProjectCardsShimmer />
        ) : isSuccess && projects.length === 0 ? (
          <div className="mt-16 text-center text-muted-foreground">No projects found.</div>
        ) : (
          <div className="mt-16 grid grid-cols-2 gap-0 lg:grid-cols-5">
            {projects.map((project, idx) => {
              const links =
                project.links && !Array.isArray(project.links) ? project.links : null;
              const year = project.created_at || project.createdAt;

              return (
                <article
                  key={project._id}
                  className="group relative border border-black/15 bg-transparent transition-all duration-200 hover:border-black hover:shadow-[0_0_0_1px_rgba(0,0,0,0.12)]"
                >
                  <button
                    type="button"
                    onClick={() => openProject(project)}
                    className="block h-full w-full cursor-pointer text-left"
                  >
                    <div className="overflow-hidden border-b border-black/10">
                      {project.cardasset && project.cardasset.length > 0 ? (
                        <img
                          src={project.cardasset[0]}
                          alt={project.title}
                          loading="lazy"
                          className="aspect-[4/3] w-full object-cover grayscale transition-transform duration-700 group-hover:scale-[1.01] group-hover:grayscale-0 sm:aspect-[16/10]"
                        />
                      ) : (
                        <div className="aspect-[4/3] w-full bg-white sm:aspect-[16/10]" />
                      )}
                    </div>
                    <div className="flex h-full flex-col p-2.5 sm:p-4">
                      <div className="mb-2 flex items-start justify-between gap-2 sm:mb-3 sm:gap-3">
                        <div className="label-mono text-[8px] uppercase leading-tight tracking-[0.14em] text-black/55 sm:text-[10px] sm:tracking-[0.22em]">
                          {String(idx + 1).padStart(2, "0")} ·{" "}
                          {project.projectId?.toUpperCase() || "PROJECT"}
                        </div>
                        {year && (
                          <div className="label-mono shrink-0 text-[8px] uppercase tracking-[0.12em] text-black/45 sm:text-[10px]">
                            {new Date(year).getFullYear()}
                          </div>
                        )}
                      </div>
                      <h3 className="font-display text-[12px] font-semibold leading-tight text-black transition-colors group-hover:underline group-hover:decoration-black group-hover:underline-offset-2 sm:text-[1.15rem] sm:group-hover:underline-offset-4">
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="mt-2 text-[10px] leading-[1.55] text-black/68 line-clamp-4 sm:mt-3 sm:text-[12px] sm:leading-[1.6]">
                          {project.description}
                        </p>
                      )}
                      {project.tags && project.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-x-1.5 gap-y-1 text-[8px] uppercase tracking-[0.12em] text-black/55 sm:mt-4 sm:gap-x-3 sm:text-[10px] sm:tracking-[0.14em]">
                          {project.tags.slice(0, 4).map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </div>
                      )}
                      {(links?.github || links?.live) && (
                        <div className="mt-auto flex items-center gap-2 border-t border-black/10 pt-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-black/60 sm:mt-4 sm:gap-4 sm:pt-3 sm:text-[10px] sm:tracking-[0.18em]">
                          {links?.github && (
                            <span className="transition-colors group-hover:text-black group-hover:underline group-hover:underline-offset-2 sm:group-hover:underline-offset-4">
                              GitHub ↗
                            </span>
                          )}
                          {links?.live && (
                            <span className="transition-colors group-hover:text-black group-hover:underline group-hover:underline-offset-2 sm:group-hover:underline-offset-4">
                              Live Demo →
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                </article>
              );
            })}
          </div>
        )}

      </div>

      <ProjectDetailSlider
        isOpen={isProjectOpen}
        onClose={closeProject}
        project={selectedProject}
      />
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
      cat: "DevOps", 
      company: "Plasma X Valnee",
      period: "December 2024",
      title: "AWS infrastructure and CI/CD deployment", 
      body: "Deployed production platform on AWS using ECS, EC2, and ECR. Configured autoscaling, ALB with GoDaddy DNS, and implemented CI/CD pipelines with GitHub Actions for automated deployments.",
      accent: false,
      skills: ["AWS ECS", "Docker", "CI/CD", "GitHub Actions", "ALB"]
    },
  ];
  
  return (
    <section id="lab" className="border-b border-border">
      <div className="page-container py-16 sm:py-24">
        <SectionLabel index="03" title="Experience" kicker="Work history" />
        <div className="mt-6">
          <h2 className="font-display text-[clamp(2.25rem,4.5vw,3.5rem)] font-bold leading-[1.05]">
            Work History
          </h2>
        </div>

        <ul className="mt-8 divide-y divide-border border-y border-border sm:mt-14">
          {experiences.map((e) => (
            <li
              key={e.company}
              className={`grid grid-cols-[minmax(0,1fr)] gap-2 py-4 sm:grid-cols-[160px_1fr] sm:gap-6 sm:py-10 md:items-start ${e.accent ? "bg-accent/5" : ""}`}
            >
              <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-start sm:justify-start sm:gap-2">
                <div
                  className={`label-mono flex items-center gap-1.5 text-[10px] font-semibold sm:gap-2 sm:text-[11px] ${e.accent ? "text-accent" : "text-muted-foreground"}`}
                >
                  <span
                    className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full sm:h-2 sm:w-2 ${e.accent ? "animate-pulse bg-accent" : "bg-muted-foreground"}`}
                  />
                  {e.tag}
                </div>
                <div className="label-mono shrink-0 text-[9px] text-muted-foreground sm:text-[12px]">{e.period}</div>
              </div>
              <div className="min-w-0">
                <div className="mb-2 flex flex-col gap-0.5 sm:mb-4 sm:gap-2">
                  <h3 className="font-display truncate text-[1rem] font-semibold leading-tight sm:text-[1.75rem]">
                    {e.company}
                  </h3>
                  <div
                    className={`truncate text-[11px] font-semibold leading-tight sm:text-[15px] ${e.accent ? "text-accent" : "text-foreground"}`}
                  >
                    {e.cat}
                  </div>
                  <div className="label-mono truncate text-[10px] text-muted-foreground sm:text-[13px]">{e.title}</div>
                </div>
                <p
                  className={`line-clamp-2 max-w-3xl text-[11px] leading-snug sm:line-clamp-none sm:text-[15px] sm:leading-[1.7] ${e.accent ? "text-foreground/80" : "text-foreground/70"}`}
                >
                  {e.body}
                </p>
                <div className="mt-2 flex flex-wrap gap-1 sm:mt-5 sm:gap-2">
                  {e.skills.map((skill) => (
                    <span
                      key={skill}
                      className={`border px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide sm:px-3 sm:py-1.5 sm:text-[11px] ${e.accent ? "border-accent/30 bg-accent/10 text-accent" : "border-border bg-card text-foreground/70"}`}
                    >
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
      <div className="page-container py-16 sm:py-24">
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
      <div className="page-container py-16 sm:py-24">
        <SectionLabel index="0B" title="Education" kicker="Academic journey" />
        <h2 className="font-display mt-6 max-w-3xl text-[clamp(2.25rem,4.5vw,3.5rem)] font-medium leading-[1.05]">
          Learning never stops.
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-14 sm:gap-6 md:grid-cols-3">
          {education.map((edu) => (
            <figure
              key={edu.institution}
              className="card-premium relative flex min-h-0 flex-col p-4 sm:h-[320px] sm:p-8"
            >
              <span className="font-display absolute -top-3 left-4 text-5xl leading-none text-accent/40 sm:-top-4 sm:left-6 sm:text-7xl">
                "
              </span>
              <blockquote className="relative flex-grow font-serif text-[0.95rem] leading-snug text-foreground/85 sm:text-[1.25rem] sm:leading-[1.45]">
                {edu.degree} in {edu.field}. Achieved {edu.score} during {edu.period}.
              </blockquote>
              <figcaption className="mt-3 flex items-start gap-2 border-t border-border pt-3 sm:mt-8 sm:gap-3 sm:pt-5">
                <span className="mt-1.5 flex h-2 w-2 shrink-0 bg-accent sm:mt-2" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 inline-block bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent sm:mb-2 sm:px-3 sm:py-1 sm:text-[12px]">
                    {edu.period}
                  </div>
                  <div className="text-[12px] font-medium leading-snug text-foreground/90 sm:text-[14px] sm:leading-relaxed">
                    {edu.institution}
                  </div>
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
  const { data: blogsData, isLoading, isError, isFetching, isSuccess } = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/blogs`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
  });

  const showShimmer = isLoading || isError || isFetching;
  const allBlogs = blogsData?.blogs || [];
  const topBlogs = allBlogs.slice(0, 2);
  const bottomBlogs = allBlogs.slice(2, 6);
  
  return (
    <section id="writing" className="border-b border-white/10 bg-black text-white">
      <div className="page-container py-16 sm:py-24">
        <div className="mb-10 sm:mb-16">
          <div className="label-mono mb-6 flex items-center gap-3 text-white/70 sm:mb-8">
            <span className="text-[12px] text-white sm:text-[14px]">04</span>
            <span className="text-white/40">/</span>
            <span className="text-[12px] text-white sm:text-[14px]">Readings</span>
          </div>
          <h2 className="font-display text-[clamp(1.75rem,5vw,3.5rem)] font-bold leading-[1] text-white">
            Readings
          </h2>
        </div>

        {showShimmer ? (
          <ReadingsCardsShimmer />
        ) : isSuccess && allBlogs.length === 0 ? (
          <p className="text-center text-white/60">No readings yet.</p>
        ) : (
          <>
            {/* Top 2 Blogs - Large Cards */}
        <div className="mb-8 sm:mb-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
            {topBlogs.map((blog: any) => (
              <article key={blog._id} className="border-t border-white/20 pt-5 sm:pt-8">
                <div className="mb-3 flex items-center justify-between sm:mb-4">
                  <div className="label-mono text-[10px] uppercase tracking-wider text-white/60 sm:text-[12px]">{blog.subject || "Blog"}</div>
                  <div className="label-mono text-[10px] text-white/50 sm:text-[12px]">{new Date(blog.datetime || blog.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</div>
                </div>
                <h3 className="font-display mb-3 cursor-pointer text-[1.25rem] font-bold leading-[1.2] text-white transition-colors hover:text-white/80 sm:mb-4 sm:text-[2rem]">{blog.title}</h3>
                <p className="mb-4 line-clamp-2 text-[13px] leading-[1.6] text-white/70 sm:mb-5 sm:text-[15px] sm:leading-[1.7]">{blog.shortDescription || blog.description || "Read more about this topic..."}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {blog.tags?.slice(0, 4).map((tag: string) => (
                    <span key={tag} className="label-mono rounded-sm border border-white/30 px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/85 sm:text-[11px]">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Bottom 4 Blogs - Smaller Cards */}
        <div>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {bottomBlogs.map((blog: any) => (
              <article key={blog._id} className="cursor-pointer rounded-lg bg-white p-3 text-black transition-shadow hover:shadow-xl sm:p-6">
                <div className="mb-3 sm:mb-4">
                  <span className="inline-block rounded-sm border border-black/15 bg-black px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white sm:px-3 sm:py-1 sm:text-[10px]">
                    {blog.subject || "BLOG"}
                  </span>
                </div>
                <h3 className="font-display mb-2 text-[0.85rem] font-semibold leading-tight transition-colors hover:text-black/70 sm:mb-3 sm:text-[1.25rem]">
                  {blog.title}
                </h3>
                <p className="mb-2 line-clamp-2 text-[10px] leading-snug text-black/70 sm:mb-4 sm:line-clamp-3 sm:text-[13px] sm:leading-[1.6]">
                  {blog.shortDescription || blog.description || "Explore this blog..."}
                </p>
                <div className="mb-3 flex flex-wrap gap-1.5 sm:mb-4 sm:gap-2">
                  {blog.tags?.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="rounded-sm border border-black/20 px-1.5 py-0.5 text-[8px] uppercase tracking-wide text-black/70 sm:px-2 sm:text-[10px]">
                      {tag}
                    </span>
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
          </>
        )}
      </div>
    </section>
  );
}

function Life() {
  const featuredProjects = [
    {
      id: "curve-catch",
      title: "Curve Catch Game",
      description:
        "Star Catch is a fun physics-based puzzle game where balls travel across mathematical curves and dynamic paths. Your goal is to guide the ball, collect every glowing star, and complete each level using logic, timing, and precision. Every curve changes the movement, making each level a unique challenge blending math, strategy, and arcade gameplay.",
      image: "/game.png",
      link: "/game",
      ctaLabel: "Play Game",
    },
    {
      id: "ai-battleground",
      title: "AI Battleground",
      description:
        "An advanced AI agent competition platform where multiple AI models compete in real-time strategic battles. Features include multi-agent coordination, reinforcement learning, and live performance analytics. Built with cutting-edge ML frameworks and scalable cloud infrastructure.",
      image: "/debate.png",
      link: "/ai-battleground",
      ctaLabel: "Explore Project",
    },
  ];

  return (
    <section id="life" className="border-b border-border">
      <div className="page-container py-8 sm:py-12">
        <div className="space-y-12 sm:space-y-16">
          {featuredProjects.map((featured, idx) => (
            <article
              key={featured.id}
              className={`grid grid-cols-1 items-center gap-8 ${
                idx % 2 === 0
                  ? "lg:grid-cols-[1fr_300px] lg:gap-12"
                  : "lg:grid-cols-[300px_1fr] lg:gap-12"
              }`}
            >
              <div className={`flex flex-col justify-center ${idx % 2 === 0 ? "" : "lg:order-2"}`}>
                <div className="label-mono text-xs uppercase tracking-wider text-accent">Featured Project</div>
                <h3 className="font-display mt-3 text-[clamp(1.5rem,3vw,2rem)] font-bold leading-[1.1] tracking-tight text-foreground">
                  {featured.title}
                </h3>
                <p className="mt-4 text-[17px] leading-[1.65] text-foreground/75">{featured.description}</p>
                <div className="mt-6">
                  <a
                    href={featured.link}
                    className="inline-flex items-center gap-2 bg-foreground px-5 py-2 text-xs font-bold uppercase tracking-wider text-background transition-all hover:bg-foreground/90"
                  >
                    <span>{featured.id === "curve-catch" ? "Play Game" : featured.ctaLabel}</span>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>

              <div className={`flex items-center justify-center ${idx % 2 === 0 ? "" : "lg:order-1"}`}>
                <a href={featured.link} className="group block">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    loading="eager"
                    className="h-auto w-full max-h-[250px] object-contain grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                    onError={(e) => {
                      console.error(`Failed to load image: ${featured.image}`);
                      e.currentTarget.src = "/placeholder.png";
                    }}
                  />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden border-b border-border">
      <div className="page-container relative py-20 sm:py-28">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-10">
          <div className="relative z-10 max-w-xl">
            <h2 className="font-display text-[clamp(2.35rem,5.5vw,5rem)] font-bold leading-[0.95]">
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

            <div className="mt-7">
              <p className="label-mono mb-3 text-[9px] tracking-[0.18em] text-muted-foreground sm:text-[10px]">
                CONNECT
              </p>
              <SocialLinks variant="plain" size="xl" />
            </div>
          </div>

          <div className="relative z-10 flex justify-center lg:justify-end">
            <div className="relative max-w-md bg-white/90 px-8 py-10 text-[#1a1a1a] shadow-[0_18px_60px_-32px_rgba(0,0,0,0.60)] ring-1 ring-black/[0.04] backdrop-blur-sm sm:px-9 sm:py-12">
              <h3 className="font-display text-[1.1rem] font-semibold leading-tight sm:text-[1.25rem]">
                Contact Information
              </h3>
              <p className="mt-1.5 text-[11px] leading-snug text-black/60 sm:text-[12px]">
                If you have any questions, feel free to get in touch.
              </p>

              <div className="mt-4 h-px w-14 bg-black/12" />

              <div className="mt-4 space-y-3 text-left sm:space-y-3.5">
                <div>
                  <div className="label-mono mb-0.5 text-[9px] tracking-wider text-[#b85c38] sm:text-[10px]">PHONE</div>
                  <a href="tel:+919892885090" className="text-[11px] font-medium hover:text-[#b85c38] sm:text-[12px]">
                    +91 9892885090
                  </a>
                </div>
                <div>
                  <div className="label-mono mb-0.5 text-[9px] tracking-wider text-[#b85c38] sm:text-[10px]">EMAIL</div>
                  <a
                    href="mailto:kunaldp379@gmail.com"
                    className="break-all text-[11px] font-medium hover:text-[#b85c38] sm:text-[12px]"
                  >
                    kunaldp379@gmail.com
                  </a>
                </div>
                <div>
                  <div className="label-mono mb-0.5 text-[9px] tracking-wider text-[#b85c38] sm:text-[10px]">LOCATION</div>
                  <p className="text-[11px] font-medium sm:text-[12px]">Mumbai, Maharashtra, India</p>
                </div>
                <div>
                  <div className="label-mono mb-0.5 text-[9px] tracking-wider text-[#b85c38] sm:text-[10px]">AVAILABILITY</div>
                  <p className="text-[11px] font-medium sm:text-[12px]">Monday – Sunday</p>
                  <p className="text-[10px] text-black/55 sm:text-[11px]">10:00 AM – 10:00 PM</p>
                </div>
                <div>
                  <div className="label-mono mb-0.5 text-[9px] tracking-wider text-[#b85c38] sm:text-[10px]">GITHUB</div>
                  <a
                    href="https://github.com/kunalpro379"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-medium hover:text-[#b85c38] sm:text-[12px]"
                  >
                    github.com/kunalpro379
                  </a>
                </div>
                <div>
                  <div className="label-mono mb-0.5 text-[9px] tracking-wider text-[#b85c38] sm:text-[10px]">RESUME</div>
                  <a
                    href="https://notesportfolio.blob.core.windows.net/notes/Resume.kunal.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-[#b85c38] hover:underline sm:text-[12px]"
                  >
                    View Resume →
                  </a>
                </div>
              </div>

              <p className="mt-5 border-l-2 border-[#b85c38]/50 pl-3 text-left text-[9px] leading-[1.5] text-black/70 sm:text-[10px]">
                <span className="font-semibold text-[#b85c38]">Open for full-time roles</span> in AI/ML, DevOps, and Backend
                Development. Also available for{" "}
                <span className="font-semibold text-black/85">freelance projects</span> and{" "}
                <span className="font-semibold text-black/85">remote work</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Index() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const openContact = () => setIsContactOpen(true);

  return (
    <main className="min-h-screen text-foreground">
      <Header onContactClick={openContact} />
      <Hero onContactClick={openContact} />
      {/* <Currently /> */}
      <Work />
      {/* <Capabilities /> */}
      <Lab />
      <Life />
      <Writing />
      <Testimonials />
      <Contact />
      <SiteFooter />
      <ContactSidebar isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </main>
  );
}
