import { useEffect, useRef, useState, useCallback } from "react";
import { sampleEquation, type Equation } from "../../lib/equation";
import {
  type Ball,
  type Star,
  BALL_RADIUS,
  STAR_RADIUS,
  stepBall,
} from "../../lib/physics";

interface Props {
  equations: Equation[];
  level: number;
  onScore: (collected: number, total: number) => void;
  runToken: number;
  resetToken: number;
  dropPoint: { x: number; y: number };
  onDropPointChange: (p: { x: number; y: number }) => void;
}

interface View {
  cx: number;
  cy: number;
  scale: number;
}

/** Pick a nice world-unit step so grid lines stay ~28px apart on screen */
function pickGridStep(scale: number): number {
  const targetPx = 28;
  const raw = targetPx / scale;
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / exp;
  if (norm <= 1) return exp;
  if (norm <= 2) return 2 * exp;
  if (norm <= 5) return 5 * exp;
  return 10 * exp;
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  v: View,
  worldToScreen: (x: number, y: number) => [number, number],
) {
  const xMinW = (-W / 2 - v.cx) / v.scale;
  const xMaxW = (W / 2 - v.cx) / v.scale;
  const yMinW = -(H / 2 - v.cy) / v.scale;
  const yMaxW = -(-H / 2 - v.cy) / v.scale;

  const majorStep = pickGridStep(v.scale);
  const minorStep = majorStep / 5;
  const fineStep = majorStep / 10;

  const drawLines = (step: number, stroke: string, width: number) => {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.beginPath();
    const xs = Math.floor(xMinW / step) * step;
    const xe = Math.ceil(xMaxW / step) * step;
    const ys = Math.floor(yMinW / step) * step;
    const ye = Math.ceil(yMaxW / step) * step;
    for (let x = xs; x <= xe + step * 0.01; x += step) {
      const [sx] = worldToScreen(x, 0);
      if (sx < -2 || sx > W + 2) continue;
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, H);
    }
    for (let y = ys; y <= ye + step * 0.01; y += step) {
      const [, sy] = worldToScreen(0, y);
      if (sy < -2 || sy > H + 2) continue;
      ctx.moveTo(0, sy);
      ctx.lineTo(W, sy);
    }
    ctx.stroke();
  };

  // Graph paper: 10 fine lines per major square, 5×5 minor emphasis
  drawLines(fineStep, "#F0F0F0", 0.5);
  drawLines(minorStep, "#E0E0E0", 0.85);
  drawLines(majorStep, "#C8C8C8", 1.25);

  // Axes
  const [, ay] = worldToScreen(0, 0);
  const [ax] = worldToScreen(0, 0);
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (ay >= 0 && ay <= H) {
    ctx.moveTo(0, ay);
    ctx.lineTo(W, ay);
  }
  if (ax >= 0 && ax <= W) {
    ctx.moveTo(ax, 0);
    ctx.lineTo(ax, H);
  }
  ctx.stroke();

  // Axis tick labels on major lines
  ctx.fillStyle = "#737373";
  ctx.font = "10px 'JetBrains Mono', ui-monospace, monospace";
  const labelStep = majorStep;
  const fmt = (n: number) => {
    if (Math.abs(n) < 1e-9) return "0";
    if (Math.abs(n - Math.round(n)) < 1e-6) return String(Math.round(n));
    return n.toFixed(1).replace(/\.0$/, "");
  };

  for (let x = Math.floor(xMinW / labelStep) * labelStep; x <= xMaxW; x += labelStep) {
    if (Math.abs(x) < labelStep * 0.01) continue;
    const [sx] = worldToScreen(x, 0);
    if (sx < 8 || sx > W - 20) continue;
    ctx.fillText(fmt(x), sx + 3, Math.min(H - 4, Math.max(14, ay + 14)));
  }
  for (let y = Math.floor(yMinW / labelStep) * labelStep; y <= yMaxW; y += labelStep) {
    if (Math.abs(y) < labelStep * 0.01) continue;
    const [, sy] = worldToScreen(0, y);
    if (sy < 12 || sy > H - 8) continue;
    ctx.fillText(fmt(y), Math.min(W - 28, Math.max(4, ax + 5)), sy - 3);
  }
}

function makeStars(level: number, xMin: number, xMax: number): Star[] {
  const count = 5 + level * 2;
  const stars: Star[] = [];
  let seed = level * 9301 + 49297;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < count; i++) {
    const x = xMin + 2 + rand() * (xMax - xMin - 4);
    const y = -5 + rand() * 9;
    stars.push({ x, y, collected: false });
  }
  return stars;
}

export function GraphGame({
  equations,
  level,
  onScore,
  runToken,
  resetToken,
  dropPoint,
  onDropPointChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ cx: 0, cy: 0, scale: 44 });
  const viewRef = useRef(view);
  viewRef.current = view;

  const ballsRef = useRef<Ball[]>([]);
  const starsRef = useRef<Star[]>(makeStars(level, -15, 15));
  const polylinesRef = useRef<Array<Array<[number, number]>>>([]);
  const equationsRef = useRef<Equation[]>(equations);
  equationsRef.current = equations;
  const dropRef = useRef(dropPoint);
  dropRef.current = dropPoint;

  const collectedRef = useRef(0);

  useEffect(() => {
    starsRef.current = makeStars(level, -15, 15);
    ballsRef.current = [];
    collectedRef.current = 0;
    onScore(0, starsRef.current.length);
  }, [level, resetToken, onScore]);

  useEffect(() => {
    if (runToken === 0) return;
    const balls: Ball[] = [];
    const dp = dropRef.current;
    for (let i = 0; i < 5; i++) {
      balls.push({
        x: dp.x + (Math.random() - 0.5) * 0.2,
        y: dp.y - i * 0.7,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 0.3,
        alive: true,
        trail: [],
      });
    }
    ballsRef.current = balls;
    starsRef.current = makeStars(level, -15, 15);
    collectedRef.current = 0;
    onScore(0, starsRef.current.length);
  }, [runToken, level, onScore]);

  useEffect(() => {
    const v = viewRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    const xMin = (-W / 2 - v.cx) / v.scale;
    const xMax = (W / 2 - v.cx) / v.scale;
    const yMin = -(H / 2 - v.cy) / v.scale;
    const yMax = -(-H / 2 - v.cy) / v.scale;
    const lines: Array<Array<[number, number]>> = [];
    for (const eq of equations) {
      if (!eq.enabled) continue;
      const segs = sampleEquation(eq, { xMin, xMax, yMin, yMax });
      for (const s of segs) lines.push(s);
    }
    polylinesRef.current = lines;
  }, [equations, view]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.025, (t - last) / 1000);
      last = t;
      const canvas = canvasRef.current;
      if (!canvas) {
        raf = requestAnimationFrame(loop);
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        raf = requestAnimationFrame(loop);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      const v = viewRef.current;

      const sub = 10; // More substeps for better collision detection
      const sdt = dt / sub;
      const bounds = {
        xMin: (-W / 2 - v.cx) / v.scale - 8,
        xMax: (W / 2 - v.cx) / v.scale + 8,
        yMin: -(H / 2 - v.cy) / v.scale - 8,
      };
      for (let s = 0; s < sub; s++) {
        for (const b of ballsRef.current) {
          stepBall(b, sdt, polylinesRef.current, starsRef.current, bounds, () => {
            collectedRef.current++;
            onScore(collectedRef.current, starsRef.current.length);
          });
        }
      }

      // White background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, W, H);

      const worldToScreen = (x: number, y: number): [number, number] => [
        W / 2 + v.cx + x * v.scale,
        H / 2 + v.cy - y * v.scale,
      ];

      drawGrid(ctx, W, H, v, worldToScreen);

      // Curves
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const win = {
        xMin: (-W / 2 - v.cx) / v.scale,
        xMax: (W / 2 - v.cx) / v.scale,
        yMin: -(H / 2 - v.cy) / v.scale,
        yMax: -(-H / 2 - v.cy) / v.scale,
      };
      for (const eq of equationsRef.current) {
        if (!eq.enabled) continue;
        const segs = sampleEquation(eq, win, 900);
        ctx.strokeStyle = eq.color;
        ctx.shadowColor = eq.color;
        ctx.shadowBlur = 8;
        for (const seg of segs) {
          ctx.beginPath();
          for (let i = 0; i < seg.length; i++) {
            const [sx, sy] = worldToScreen(seg[i][0], seg[i][1]);
            if (i === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.stroke();
        }
      }
      ctx.shadowBlur = 0;

      // Drop point marker
      {
        const dp = dropRef.current;
        const [dx, dy] = worldToScreen(dp.x, dp.y);
        ctx.strokeStyle = "#000000";
        ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(dx, dy, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
        // Arrow down
        ctx.beginPath();
        ctx.moveTo(dx, dy + 5);
        ctx.lineTo(dx, dy + 22);
        ctx.moveTo(dx - 6, dy + 16);
        ctx.lineTo(dx, dy + 22);
        ctx.lineTo(dx + 6, dy + 16);
        ctx.stroke();
      }

      // Stars
      for (const s of starsRef.current) {
        if (s.collected) continue;
        const [sx, sy] = worldToScreen(s.x, s.y);
        const r = STAR_RADIUS * v.scale;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.shadowColor = "#FFD700";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "#FFD700"; // Gold
        ctx.strokeStyle = "#FFA500"; // Orange
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const ang = (Math.PI * 2 * i) / 10 - Math.PI / 2;
          const rad = i % 2 === 0 ? r : r * 0.42;
          const px = Math.cos(ang) * rad;
          const py = Math.sin(ang) * rad;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      ctx.shadowBlur = 0;

      // Balls
      for (const b of ballsRef.current) {
        if (!b.alive) continue;
        if (b.trail.length > 1) {
          ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let i = 0; i < b.trail.length; i++) {
            const [tx, ty] = worldToScreen(b.trail[i][0], b.trail[i][1]);
            if (i === 0) ctx.moveTo(tx, ty);
            else ctx.lineTo(tx, ty);
          }
          ctx.stroke();
        }
        const [bx, by] = worldToScreen(b.x, b.y);
        const br = BALL_RADIUS * v.scale;
        const grad = ctx.createRadialGradient(bx - br * 0.35, by - br * 0.35, br * 0.1, bx, by, br);
        grad.addColorStop(0, "#FFFFFF");
        grad.addColorStop(0.5, "#E0E0E0");
        grad.addColorStop(1, "#999999");
        ctx.fillStyle = grad;
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
        
        // Ball highlight
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.beginPath();
        ctx.arc(bx - br * 0.3, by - br * 0.3, br * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [onScore]);

  const interactionRef = useRef<{ kind: "pan" | "drop"; x: number; y: number } | null>(null);

  const screenToWorld = (cx: number, cy: number): [number, number] => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const px = cx - rect.left;
    const py = cy - rect.top;
    const W = rect.width;
    const H = rect.height;
    const v = viewRef.current;
    const wx = (px - W / 2 - v.cx) / v.scale;
    const wy = -(py - H / 2 - v.cy) / v.scale;
    return [wx, wy];
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const [wx, wy] = screenToWorld(e.clientX, e.clientY);
    const dp = dropRef.current;
    const dist = Math.hypot(wx - dp.x, wy - dp.y);
    if (e.shiftKey || dist < 0.6) {
      interactionRef.current = { kind: "drop", x: e.clientX, y: e.clientY };
      onDropPointChange({ x: wx, y: wy });
    } else {
      interactionRef.current = { kind: "pan", x: e.clientX, y: e.clientY };
    }
  };
  
  const onMouseMove = (e: React.MouseEvent) => {
    const it = interactionRef.current;
    if (!it) return;
    if (it.kind === "pan") {
      const dx = e.clientX - it.x;
      const dy = e.clientY - it.y;
      interactionRef.current = { ...it, x: e.clientX, y: e.clientY };
      setView((v) => ({ ...v, cx: v.cx + dx, cy: v.cy + dy }));
    } else {
      const [wx, wy] = screenToWorld(e.clientX, e.clientY);
      onDropPointChange({ x: wx, y: wy });
    }
  };
  
  const onMouseUp = () => {
    interactionRef.current = null;
  };

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setView((v) => {
      const factor = Math.exp(-e.deltaY * 0.001);
      const newScale = Math.max(10, Math.min(200, v.scale * factor));
      return { ...v, scale: newScale };
    });
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.addEventListener("wheel", onWheel, { passive: false });
    return () => c.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-white">
      <canvas
        ref={canvasRef}
        className="block h-full w-full cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      />
      <div className="pointer-events-none absolute bottom-6 right-6 rounded-md border border-border bg-white/95 px-4 py-2 text-xs font-mono tracking-wide text-muted-foreground backdrop-blur shadow-sm">
        drag · scroll zoom · shift+click drop
      </div>
    </div>
  );
}
