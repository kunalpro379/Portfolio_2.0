export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alive: boolean;
  trail: Array<[number, number]>;
}

export interface Star {
  x: number;
  y: number;
  collected: boolean;
}

export const BALL_RADIUS = 0.25;
export const STAR_RADIUS = 0.45;
export const GRAVITY = -18; // Reduced for better control
export const RESTITUTION = 0.75; // Increased for better bouncing
export const FRICTION = 0.96; // Reduced friction for smoother movement
export const AIR_RESISTANCE = 0.998; // Slight air resistance
export const MIN_VELOCITY = 0.05; // Minimum velocity threshold

function collideSegment(
  ball: Ball,
  p1: [number, number],
  p2: [number, number]
): boolean {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const sx = x2 - x1;
  const sy = y2 - y1;
  const segLen2 = sx * sx + sy * sy;
  if (segLen2 < 1e-9) return false;

  // Find closest point on segment
  const t = Math.max(0, Math.min(1, ((ball.x - x1) * sx + (ball.y - y1) * sy) / segLen2));
  const cx = x1 + t * sx;
  const cy = y1 + t * sy;
  const dx = ball.x - cx;
  const dy = ball.y - cy;
  const dist2 = dx * dx + dy * dy;
  const r = BALL_RADIUS;
  
  if (dist2 > r * r) return false;

  const dist = Math.sqrt(dist2) || 1e-6;
  let nx = dx / dist;
  let ny = dy / dist;

  // Push ball out of segment with extra margin
  const overlap = r - dist + 0.01;
  ball.x += nx * overlap;
  ball.y += ny * overlap;

  // Calculate relative velocity
  const vDotN = ball.vx * nx + ball.vy * ny;

  // Only bounce if moving into the surface
  if (vDotN < 0) {
    // Reflect velocity with restitution
    const normalImpulse = -(1 + RESTITUTION) * vDotN;
    ball.vx += normalImpulse * nx;
    ball.vy += normalImpulse * ny;
    
    // Apply friction to tangential velocity
    const tx = -ny;
    const ty = nx;
    const vT = ball.vx * tx + ball.vy * ty;
    ball.vx -= (1 - FRICTION) * vT * tx;
    ball.vy -= (1 - FRICTION) * vT * ty;
    
    return true;
  }
  return false;
}

export function stepBall(
  ball: Ball,
  dt: number,
  polylines: Array<Array<[number, number]>>,
  stars: Star[],
  worldBounds: { xMin: number; xMax: number; yMin: number },
  onCollect: () => void
) {
  if (!ball.alive) return;

  // Apply gravity
  ball.vy += GRAVITY * dt;
  
  // Apply air resistance
  ball.vx *= AIR_RESISTANCE;
  ball.vy *= AIR_RESISTANCE;
  
  // Stop very slow balls to prevent jitter
  if (Math.abs(ball.vx) < MIN_VELOCITY && Math.abs(ball.vy) < MIN_VELOCITY && ball.y < worldBounds.yMin + 2) {
    ball.vx = 0;
    ball.vy = 0;
  }
  
  // Update position
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // Collision detection with curves
  let collisionCount = 0;
  for (const line of polylines) {
    for (let i = 0; i < line.length - 1; i++) {
      const p1 = line[i];
      const p2 = line[i + 1];
      if (!isFinite(p1[0]) || !isFinite(p1[1]) || !isFinite(p2[0]) || !isFinite(p2[1])) continue;
      
      // Broad phase collision check
      const minY = Math.min(p1[1], p2[1]) - BALL_RADIUS * 2;
      const maxY = Math.max(p1[1], p2[1]) + BALL_RADIUS * 2;
      if (ball.y < minY || ball.y > maxY) continue;
      
      const minX = Math.min(p1[0], p2[0]) - BALL_RADIUS * 2;
      const maxX = Math.max(p1[0], p2[0]) + BALL_RADIUS * 2;
      if (ball.x < minX || ball.x > maxX) continue;
      
      // Narrow phase collision
      if (collideSegment(ball, p1, p2)) {
        collisionCount++;
        if (collisionCount > 3) break; // Prevent stuck balls
      }
    }
    if (collisionCount > 3) break;
  }

  // Star collection
  for (const s of stars) {
    if (s.collected) continue;
    const dx = ball.x - s.x;
    const dy = ball.y - s.y;
    const dist2 = dx * dx + dy * dy;
    const collectDist = (BALL_RADIUS + STAR_RADIUS) * (BALL_RADIUS + STAR_RADIUS);
    if (dist2 < collectDist) {
      s.collected = true;
      onCollect();
    }
  }

  // Update trail
  ball.trail.push([ball.x, ball.y]);
  if (ball.trail.length > 80) ball.trail.shift();

  // Check if ball is out of bounds
  if (ball.y < worldBounds.yMin - 8 || ball.x < worldBounds.xMin - 15 || ball.x > worldBounds.xMax + 15) {
    ball.alive = false;
  }
}
