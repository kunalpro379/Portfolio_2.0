import { useState } from "react";
import type { Equation, EqKind } from "../../lib/equation";

interface Props {
  equations: Equation[];
  setEquations: (eqs: Equation[]) => void;
  score: number;
  total: number;
  level: number;
  onDrop: () => void;
  onReset: () => void;
  onNextLevel: () => void;
}

const COLORS = [
  "#8B4513",
  "#A0522D",
  "#D2691E",
  "#CD853F",
  "#DEB887",
  "#F5DEB3",
];

const KIND_LABEL: Record<EqKind, string> = {
  y: "y =",
  x: "x =",
  parametric: "(t)",
};

export function EquationSidebar({
  equations,
  setEquations,
  score,
  total,
  level,
  onDrop,
  onReset,
  onNextLevel,
}: Props) {
  const [draft, setDraft] = useState("");
  const [kind, setKind] = useState<EqKind>("y");

  const addEq = (expr: string, k: EqKind) => {
    if (!expr.trim()) return;
    const color = COLORS[equations.length % COLORS.length];
    const next: Equation = {
      id: crypto.randomUUID(),
      expr,
      kind: k,
      color,
      enabled: true,
    };
    setEquations([...equations, next]);
    setDraft("");
  };

  const update = (id: string, patch: Partial<Equation>) => {
    setEquations(equations.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const remove = (id: string) => {
    setEquations(equations.filter((e) => e.id !== id));
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-background">
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
        <header className="px-6 pb-5 pt-6">
          <h1 className="font-display text-[1.65rem] font-semibold leading-none tracking-tight text-foreground">
            Equation Master
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            Create equations, draw curves, and guide balls to collect stars.
          </p>
        </header>

        <div className="mx-6 h-px bg-border/70" />

        <section className="px-6 py-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="label-mono text-[10px] tracking-[0.14em] text-muted-foreground">
                LEVEL {String(level).padStart(2, "0")}
              </div>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-bold text-foreground">{score}</span>
                <span className="text-xl text-muted-foreground">/ {total}</span>
              </div>
              <div className="label-mono mt-1 text-[10px] text-muted-foreground">Stars collected</div>
            </div>
            {score === total && total > 0 && (
              <button
                type="button"
                onClick={onNextLevel}
                className="label-mono shrink-0 border-b border-accent pb-0.5 text-[11px] font-semibold text-accent transition-colors hover:text-accent/80"
              >
                Next level →
              </button>
            )}
          </div>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={onDrop}
              className="flex-1 bg-foreground py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-background transition-colors hover:bg-foreground/90"
            >
              Drop balls
            </button>
            <button
              type="button"
              onClick={onReset}
              className="border border-border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground transition-colors hover:bg-foreground/[0.04]"
            >
              Retry
            </button>
          </div>
        </section>

        <div className="mx-6 h-px bg-border/70" />

        <section className="px-6 py-5">
          <div className="label-mono text-[10px] tracking-[0.14em] text-muted-foreground">Add equation</div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addEq(draft, kind);
            }}
            className="mt-3 flex flex-col gap-3"
          >
            <div className="flex border-b border-border">
              {(["y", "x", "parametric"] as EqKind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`flex-1 border-b-2 py-2 font-mono text-[11px] transition-colors ${
                    kind === k
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {KIND_LABEL[k]}
                </button>
              ))}
            </div>
            <div className="flex gap-0 border-b border-foreground/25 focus-within:border-foreground">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={
                  kind === "y"
                    ? "sin(x) + 0.2*x^2"
                    : kind === "x"
                      ? "2*sin(y)"
                      : "3*cos(t), 3*sin(t)"
                }
                className="min-w-0 flex-1 bg-transparent py-2.5 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
              />
              <button
                type="submit"
                className="shrink-0 px-4 font-mono text-[11px] font-semibold uppercase tracking-wider text-foreground transition-opacity hover:opacity-70"
              >
                Add
              </button>
            </div>
          </form>
        </section>

        <div className="mx-6 h-px bg-border/70" />

        <section className="px-6 py-5">
          <div className="label-mono text-[10px] tracking-[0.14em] text-muted-foreground">Active curves</div>
          <ul className="mt-3 space-y-0">
            {equations.length === 0 && (
              <li className="py-6 text-center font-mono text-[11px] text-muted-foreground">
                No equations yet — add one above
              </li>
            )}
            {equations.map((eq, i) => (
              <li
                key={eq.id}
                className={`group flex items-center gap-2.5 border-border/60 py-2.5 ${
                  i > 0 ? "border-t" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => update(eq.id, { enabled: !eq.enabled })}
                  className="h-3 w-3 shrink-0 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: eq.enabled ? eq.color : "transparent",
                    borderColor: eq.color,
                  }}
                  aria-label={eq.enabled ? "Disable curve" : "Enable curve"}
                />
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{KIND_LABEL[eq.kind]}</span>
                <input
                  value={eq.expr}
                  onChange={(e) => update(eq.id, { expr: e.target.value })}
                  className="min-w-0 flex-1 bg-transparent font-mono text-[12px] text-foreground outline-none"
                />
                <button
                  type="button"
                  onClick={() => remove(eq.id)}
                  className="font-mono text-[11px] text-muted-foreground opacity-40 transition-all hover:text-foreground group-hover:opacity-100"
                  aria-label="Remove equation"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>

        <div className="mx-6 h-px bg-border/70" />

        <section className="px-6 py-5 pb-8">
          <div className="label-mono text-[10px] tracking-[0.14em] text-muted-foreground">Syntax guide</div>

          <div className="mt-4 space-y-4 text-[12px] leading-relaxed text-foreground/80">
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-foreground/50">
                Variables
              </div>
              <p className="mt-1 font-mono text-[13px] text-foreground">
                <span className="text-accent">x</span>, <span className="text-accent">y</span>,{" "}
                <span className="text-accent">t</span>
                <span className="text-muted-foreground"> — use </span>
                <span className="text-accent">t</span>
                <span className="text-muted-foreground"> for parametric curves</span>
              </p>
            </div>

            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-foreground/50">
                Functions
              </div>
              <p className="mt-1 font-mono text-[12px] leading-loose text-foreground/90">
                sin, cos, tan, log, sqrt, abs, exp
              </p>
            </div>

            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-foreground/50">
                Operators & constants
              </div>
              <p className="mt-1 font-mono text-[12px] text-foreground/90">
                + − × ÷ ^{" "}
                <span className="text-muted-foreground">·</span> pi, e
              </p>
            </div>

            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-foreground/50">
                Curve types
              </div>
              <ul className="mt-2 space-y-1.5 font-mono text-[11px] text-foreground/85">
                <li>
                  <span className="text-muted-foreground">y =</span> f(x) — vertical function
                </li>
                <li>
                  <span className="text-muted-foreground">x =</span> f(y) — horizontal function
                </li>
                <li>
                  <span className="text-muted-foreground">(t)</span> x(t), y(t) — parametric (comma-separated)
                </li>
              </ul>
            </div>

            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-foreground/50">
                Examples
              </div>
              <ul className="mt-2 space-y-1 font-mono text-[11px] text-foreground/75">
                <li>sin(x) * cos(x)</li>
                <li>x^2 + 2*x + 1</li>
                <li>sqrt(abs(x))</li>
                <li>exp(-x^2 / 10)</li>
                <li>4*cos(t), 4*sin(t)</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
