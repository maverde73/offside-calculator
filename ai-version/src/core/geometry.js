/**
 * Geometry Engine for Offside Calculator
 * Line math and vanishing point calculation
 */

const EPS = 1e-9;

/**
 * Create a line from two points
 * Returns normalized line equation: ax + by + c = 0 where a² + b² = 1
 */
export function createLine(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  let a = -dy;
  let b = dx;
  let c = dy * p1.x - dx * p1.y;
  const n = Math.sqrt(a * a + b * b);
  return n < EPS ? null : { a: a / n, b: b / n, c: c / n, p1: { ...p1 }, p2: { ...p2 } };
}

/**
 * Find intersection of two lines
 */
export function intersect(l1, l2) {
  const d = l1.a * l2.b - l1.b * l2.a;
  return Math.abs(d) < EPS
    ? null
    : {
        x: (l1.b * l2.c - l2.b * l1.c) / d,
        y: (l2.a * l1.c - l1.a * l2.c) / d
      };
}

/**
 * Best fit vanishing point from multiple lines (least squares)
 */
export function bestFit(lines) {
  if (lines.length < 2) return null;
  if (lines.length === 2) return intersect(lines[0], lines[1]);

  let sAA = 0, sAB = 0, sBB = 0, sAC = 0, sBC = 0;
  for (const l of lines) {
    sAA += l.a * l.a;
    sAB += l.a * l.b;
    sBB += l.b * l.b;
    sAC += l.a * l.c;
    sBC += l.b * l.c;
  }
  const d = sAA * sBB - sAB * sAB;
  return Math.abs(d) < EPS
    ? null
    : {
        x: (sAB * sBC - sBB * sAC) / d,
        y: (sAB * sAC - sAA * sBC) / d
      };
}

/**
 * Get line segment clipped to rectangle bounds
 */
export function lineRect(line, rect) {
  const { a, b, c } = line;
  const { left, top, right, bottom } = rect;
  const pts = [];

  if (Math.abs(b) > EPS) {
    let y = -(a * left + c) / b;
    if (y >= top && y <= bottom) pts.push({ x: left, y });
    y = -(a * right + c) / b;
    if (y >= top && y <= bottom) pts.push({ x: right, y });
  }

  if (Math.abs(a) > EPS) {
    let x = -(b * top + c) / a;
    if (x >= left && x <= right) pts.push({ x, y: top });
    x = -(b * bottom + c) / a;
    if (x >= left && x <= right) pts.push({ x, y: bottom });
  }

  // Remove duplicates
  const u = pts.filter(
    (p, i) => !pts.slice(0, i).some((q) => Math.abs(p.x - q.x) < 1 && Math.abs(p.y - q.y) < 1)
  );
  return u.length >= 2 ? [u[0], u[1]] : null;
}

/**
 * Squared distance between two points
 */
export function distSq(a, b) {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

/**
 * Distance from point to line
 */
export function pointToLineDistance(point, line) {
  return Math.abs(line.a * point.x + line.b * point.y + line.c);
}
