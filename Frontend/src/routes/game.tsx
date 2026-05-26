import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EquationSidebar } from "../components/game/EquationSidebar";
import { GraphGame } from "../components/game/GraphGame";
import type { Equation } from "../lib/equation";

export const Route = createFileRoute("/game")({
  component: GamePage,
});

const nav = [
  { label: "HOME", href: "/" },
  { label: "EXPERIENCE", href: "/#lab" },
  { label: "PROJECTS", href: "/#work" },
  { label: "LEARNINGS", href: "/learnings" },
  { label: "GAME", href: "/game" },
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
      {nav.map((n) => (
        <a
          key={n.href}
          href={n.href}
          className={`flex items-center justify-center whitespace-nowrap font-semibold tracking-wide transition-colors hover:bg-gray-800 ${
            isMobile
              ? "min-w-0 flex-1 border-r border-white/15 px-1 py-2 text-[8px] last:border-r-0 sm:px-2 sm:text-[10px]"
              : "px-6 py-2 text-[12px]"
          } ${!isMobile && n.label === "GAME" ? "outline outline-2 outline-white outline-offset-[-2px]" : ""}`}
        >
          {n.label}
        </a>
      ))}
    </nav>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-border bg-white backdrop-blur-md">
      <div className="flex h-12 items-center justify-between px-4 sm:h-14 sm:px-6">
        <a href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary sm:h-10 sm:w-10">
            <img src="/kunalgta.png" alt="" className="h-full w-full object-cover" />
          </div>
          <span className="flex min-w-0 items-baseline gap-2 sm:gap-3">
            <span className="truncate font-display text-[13px] font-semibold tracking-tight text-foreground sm:text-[14px]">
              Kunal Patil
            </span>
            <span className="label-mono hidden text-[11px] text-foreground sm:inline">AI/ML Engineer</span>
          </span>
        </a>

        <div className="hidden flex-1 items-center justify-center md:flex">
          <NavTabs variant="desktop" />
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="https://github.com/kunalpro379"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center text-foreground transition-colors hover:text-accent"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>

      <div className="bg-black md:hidden">
        <NavTabs variant="mobile" />
      </div>
    </header>
  );
}

function GamePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [equations, setEquations] = useState<Equation[]>([
    {
      id: "demo",
      expr: "-0.2*x^2 + 4",
      kind: "y",
      color: "#8B4513",
      enabled: true,
    },
  ]);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [level, setLevel] = useState(1);
  const [runToken, setRunToken] = useState(0);
  const [resetToken, setResetToken] = useState(0);
  const [dropPoint, setDropPoint] = useState({ x: 0, y: 8 });

  const onScore = useCallback((c: number, t: number) => {
    setScore(c);
    setTotal(t);
  }, []);

  const handleNextLevel = useCallback(() => {
    if (level < 5) {
      setLevel((l) => l + 1);
      setRunToken(0);
      setResetToken((t) => t + 1);
    }
  }, [level]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => {
      if (mq.matches) setSidebarOpen(true);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((o) => !o);

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-background">
      <Header />

      <div className="relative flex min-h-0 flex-1 flex-row overflow-hidden">
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close equation panel"
            className="absolute inset-0 z-20 bg-black/40 md:hidden"
            onClick={closeSidebar}
          />
        )}

        <aside
          className={`absolute inset-y-0 left-0 z-30 h-full shrink-0 border-r border-border/80 bg-background shadow-xl transition-all duration-300 ease-in-out md:relative md:shadow-none ${
            sidebarOpen
              ? "w-[min(92vw,340px)] translate-x-0 md:w-[340px]"
              : "w-0 -translate-x-full overflow-hidden md:w-0 md:translate-x-0"
          }`}
        >
          <div className="h-full w-[min(92vw,340px)] md:w-[340px]">
            <EquationSidebar
              equations={equations}
              setEquations={setEquations}
              score={score}
              total={total}
              level={level}
              onDrop={() => {
                setRunToken((t) => t + 1);
                if (window.innerWidth < 768) closeSidebar();
              }}
              onReset={() => setResetToken((t) => t + 1)}
              onNextLevel={handleNextLevel}
            />
          </div>
        </aside>

        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Hide equation panel" : "Show equation panel"}
          className={`absolute top-1/2 z-40 -translate-y-1/2 rounded-r-lg bg-[#8B4513] p-2 text-white shadow-lg transition-all duration-300 hover:bg-[#6B3410] ${
            sidebarOpen ? "left-[min(92vw,340px)] md:left-[339px]" : "left-0"
          }`}
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <div className="relative min-h-0 min-w-0 flex-1">
          <GraphGame
            equations={equations}
            level={level}
            onScore={onScore}
            runToken={runToken}
            resetToken={resetToken}
            dropPoint={dropPoint}
            onDropPointChange={setDropPoint}
          />

          {!sidebarOpen && (
            <button
              type="button"
              onClick={openSidebar}
              className="absolute left-3 top-3 z-10 rounded-md border border-border bg-background/95 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-foreground shadow-sm backdrop-blur md:hidden"
            >
              Equations
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
