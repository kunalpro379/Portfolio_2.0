import { create, all, type EvalFunction } from "mathjs";

const math = create(all);

export type EqKind = "y" | "x" | "parametric";

export interface Equation {
  id: string;
  expr: string;
  kind: EqKind;
  color: string;
  enabled: boolean;
  tMin?: number;
  tMax?: number;
}

function safeNum(v: unknown): number {
  if (typeof v === "number" && isFinite(v)) return v;
  return NaN;
}

function safeCompile(expr: string): EvalFunction | null {
  try {
    // Normalize the expression
    let normalized = expr
      .replace(/\s+/g, '') // Remove spaces
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/²/g, '^2')
      .replace(/³/g, '^3')
      .replace(/−/g, '-')
      .replace(/\^/g, '^')
      .replace(/π/g, 'pi');
    
    return math.compile(normalized);
  } catch (e) {
    console.error('Equation compile error:', e);
    return null;
  }
}

export function sampleEquation(
  eq: Equation,
  win: { xMin: number; xMax: number; yMin: number; yMax: number },
  steps = 700
): Array<Array<[number, number]>> {
  const expr = eq.expr.trim();
  if (!expr) return [];

  const lines: Array<Array<[number, number]>> = [];
  const pushSplit = (pts: Array<[number, number]>, jumpThreshold: number) => {
    let cur: Array<[number, number]> = [];
    let lastY = NaN;
    let lastX = NaN;
    for (const p of pts) {
      if (!isFinite(p[0]) || !isFinite(p[1])) {
        if (cur.length > 1) lines.push(cur);
        cur = [];
        lastY = NaN;
        lastX = NaN;
        continue;
      }
      if (isFinite(lastY) && (Math.abs(p[1] - lastY) > jumpThreshold || Math.abs(p[0] - lastX) > jumpThreshold)) {
        if (cur.length > 1) lines.push(cur);
        cur = [];
      }
      cur.push(p);
      lastY = p[1];
      lastX = p[0];
    }
    if (cur.length > 1) lines.push(cur);
  };

  try {
    if (eq.kind === "y") {
      const f = safeCompile(expr);
      if (!f) return [];
      const pts: Array<[number, number]> = [];
      const pad = (win.xMax - win.xMin) * 0.1;
      const xMin = win.xMin - pad;
      const xMax = win.xMax + pad;
      const dx = (xMax - xMin) / steps;
      for (let i = 0; i <= steps; i++) {
        const x = xMin + i * dx;
        try {
          const y = safeNum(f.evaluate({ x, pi: Math.PI, e: Math.E }));
          pts.push([x, y]);
        } catch {
          pts.push([x, NaN]);
        }
      }
      pushSplit(pts, Math.max(50, (win.yMax - win.yMin) * 2));
    } else if (eq.kind === "x") {
      const f = safeCompile(expr);
      if (!f) return [];
      const pts: Array<[number, number]> = [];
      const pad = (win.yMax - win.yMin) * 0.1;
      const yMin = win.yMin - pad;
      const yMax = win.yMax + pad;
      const dy = (yMax - yMin) / steps;
      for (let i = 0; i <= steps; i++) {
        const y = yMin + i * dy;
        try {
          const x = safeNum(f.evaluate({ y, pi: Math.PI, e: Math.E }));
          pts.push([x, y]);
        } catch {
          pts.push([NaN, y]);
        }
      }
      pushSplit(pts, Math.max(50, (win.xMax - win.xMin) * 2));
    } else if (eq.kind === "parametric") {
      const idx = splitParametric(expr);
      if (idx < 0) return [];
      const fxStr = expr.slice(0, idx).trim();
      const fyStr = expr.slice(idx + 1).trim();
      const fx = safeCompile(fxStr);
      const fy = safeCompile(fyStr);
      if (!fx || !fy) return [];
      const tMin = eq.tMin ?? -Math.PI * 2;
      const tMax = eq.tMax ?? Math.PI * 2;
      const dt = (tMax - tMin) / steps;
      const pts: Array<[number, number]> = [];
      for (let i = 0; i <= steps; i++) {
        const t = tMin + i * dt;
        try {
          const x = safeNum(fx.evaluate({ t, pi: Math.PI, e: Math.E }));
          const y = safeNum(fy.evaluate({ t, pi: Math.PI, e: Math.E }));
          pts.push([x, y]);
        } catch {
          pts.push([NaN, NaN]);
        }
      }
      pushSplit(pts, Math.max(
        (win.xMax - win.xMin),
        (win.yMax - win.yMin)
      ) * 2);
    }
  } catch (e) {
    console.error('Equation evaluation error:', e);
  }
  return lines;
}

function splitParametric(s: string): number {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    else if (c === "," && depth === 0) return i;
  }
  return -1;
}
