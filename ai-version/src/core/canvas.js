/**
 * Canvas Rendering Engine
 */

import { lineRect, distSq } from './geometry.js';
import { renderConfidenceBadge } from '../ui/components.js';

/**
 * Canvas Manager - handles all rendering
 */
export class CanvasManager {
  constructor(canvas, container, state) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.container = container;
    this.state = state;
  }

  /**
   * Main render function
   */
  render() {
    const { canvas, ctx, container, state } = this;
    const { image, imageSize, lines, vpPos, view, tool, drawPt, mousePos, selectedId, draggingVP } =
      state;

    // Resize canvas to container
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Clear and fill background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply view transform
    ctx.save();
    ctx.translate(view.x, view.y);
    ctx.scale(view.scale, view.scale);

    // Draw image
    if (image) {
      ctx.drawImage(image, 0, 0);
    }

    // Calculate drawing rect with margin
    const dr = {
      left: -view.x / view.scale - 200,
      top: -view.y / view.scale - 200,
      right: (canvas.width - view.x) / view.scale + 200,
      bottom: (canvas.height - view.y) / view.scale + 200
    };

    // Render AI suggestion previews (semi-transparent)
    const aiSuggestions = state.aiState.detectedSuggestions;
    if (aiSuggestions.length > 0) {
      for (const suggestion of aiSuggestions) {
        const seg = lineRect(suggestion.geo, dr);
        if (!seg) continue;

        ctx.beginPath();
        ctx.moveTo(seg[0].x, seg[0].y);
        ctx.lineTo(seg[1].x, seg[1].y);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.lineWidth = 3 / view.scale;
        ctx.setLineDash([12 / view.scale, 6 / view.scale]);
        ctx.stroke();

        // Show confidence badge
        renderConfidenceBadge(ctx, suggestion, view);
      }
      ctx.setLineDash([]);
    }

    // Render committed lines
    for (const l of lines) {
      if (l.isPlumb) {
        // Plumb line (vertical projection segment)
        const p1 = l.geo.p1;
        const p2 = l.geo.p2;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2 / view.scale;
        ctx.setLineDash([2 / view.scale, 3 / view.scale]);
        ctx.stroke();

        // Marker top (body)
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, 4 / view.scale, 0, Math.PI * 2);
        ctx.fillStyle = '#22d3ee';
        ctx.fill();

        // Marker bottom (ground crosshair)
        const cs = 5 / view.scale;
        ctx.beginPath();
        ctx.moveTo(p2.x - cs, p2.y - cs);
        ctx.lineTo(p2.x + cs, p2.y + cs);
        ctx.moveTo(p2.x + cs, p2.y - cs);
        ctx.lineTo(p2.x - cs, p2.y + cs);
        ctx.strokeStyle = '#22d3ee';
        ctx.setLineDash([]);
        ctx.lineWidth = 2 / view.scale;
        ctx.stroke();
      } else {
        // Infinite line (ref lines and VP lines)
        const seg = lineRect(l.geo, dr);
        if (!seg) continue;

        ctx.beginPath();
        ctx.moveTo(seg[0].x, seg[0].y);
        ctx.lineTo(seg[1].x, seg[1].y);
        ctx.strokeStyle = l.id === selectedId ? '#fff' : l.color;
        ctx.lineWidth = (l.id === selectedId ? 4 : 3) / view.scale;
        ctx.setLineDash(l.isVP ? [12 / view.scale, 6 / view.scale] : []);
        ctx.shadowColor = l.color;
        ctx.shadowBlur = (l.id === selectedId ? 10 : 5) / view.scale;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
    ctx.setLineDash([]);

    // Drawing preview
    if (drawPt && mousePos) {
      const previewPt = tool === 'player' ? { x: drawPt.x, y: mousePos.y } : mousePos;

      if (tool === 'player') {
        // Horizontal guide line
        ctx.beginPath();
        ctx.moveTo(dr.left, mousePos.y);
        ctx.lineTo(dr.right, mousePos.y);
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
        ctx.lineWidth = 1 / view.scale;
        ctx.setLineDash([8 / view.scale, 4 / view.scale]);
        ctx.stroke();

        // Vertical preview line
        ctx.beginPath();
        ctx.moveTo(drawPt.x, drawPt.y);
        ctx.lineTo(previewPt.x, previewPt.y);
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2 / view.scale;
        ctx.setLineDash([2 / view.scale, 3 / view.scale]);
        ctx.stroke();

        // Marker top (body)
        ctx.beginPath();
        ctx.arc(drawPt.x, drawPt.y, 4 / view.scale, 0, Math.PI * 2);
        ctx.fillStyle = '#22d3ee';
        ctx.fill();

        // Marker bottom (ground crosshair)
        const cs = 5 / view.scale;
        ctx.beginPath();
        ctx.moveTo(previewPt.x - cs, previewPt.y - cs);
        ctx.lineTo(previewPt.x + cs, previewPt.y + cs);
        ctx.moveTo(previewPt.x + cs, previewPt.y - cs);
        ctx.lineTo(previewPt.x - cs, previewPt.y + cs);
        ctx.strokeStyle = '#22d3ee';
        ctx.setLineDash([]);
        ctx.lineWidth = 2 / view.scale;
        ctx.stroke();

        // Ghost offside line preview
        if (vpPos) {
          ctx.beginPath();
          ctx.moveTo(previewPt.x, previewPt.y);
          ctx.lineTo(vpPos.x, vpPos.y);
          ctx.strokeStyle = 'rgba(249, 115, 22, 0.4)';
          ctx.setLineDash([]);
          ctx.stroke();
        }
      } else {
        // Normal line preview
        ctx.beginPath();
        ctx.moveTo(drawPt.x, drawPt.y);
        ctx.lineTo(previewPt.x, previewPt.y);
        ctx.strokeStyle = 'rgba(0, 255, 135, 0.6)';
        ctx.lineWidth = 2 / view.scale;
        ctx.setLineDash([8 / view.scale, 4 / view.scale]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(drawPt.x, drawPt.y, 4 / view.scale, 0, Math.PI * 2);
        ctx.fillStyle = '#00ff87';
        ctx.fill();
      }
    }

    // Render VP marker
    if (vpPos) {
      const sz = 20 / view.scale;
      ctx.shadowColor = '#00ff87';
      ctx.shadowBlur = 20 / view.scale;
      ctx.strokeStyle = '#00ff87';
      ctx.lineWidth = 3 / view.scale;
      ctx.beginPath();
      ctx.moveTo(vpPos.x - sz * 2, vpPos.y);
      ctx.lineTo(vpPos.x + sz * 2, vpPos.y);
      ctx.moveTo(vpPos.x, vpPos.y - sz * 2);
      ctx.lineTo(vpPos.x, vpPos.y + sz * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(vpPos.x, vpPos.y, sz, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(vpPos.x, vpPos.y, 4 / view.scale, 0, Math.PI * 2);
      ctx.fillStyle = '#00ff87';
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();

    // Render magnifier
    if (
      image &&
      mousePos &&
      (tool === 'draw' || tool === 'vpLine' || tool === 'player' || (tool === 'select' && draggingVP))
    ) {
      this.renderMagnifier();
    }
  }

  /**
   * Render magnifier overlay
   */
  renderMagnifier() {
    const { canvas, ctx, state } = this;
    const { image, mousePos, view } = state;

    const magSize = 140;
    const zoom = 4;
    const margin = 20;

    const rawMouseX = mousePos.x * view.scale + view.x;
    const rawMouseY = mousePos.y * view.scale + view.y;

    let mx = margin;
    let my = margin;
    if (rawMouseX < magSize + margin * 2 && rawMouseY < magSize + margin * 2) {
      mx = canvas.width - magSize - margin;
    }

    ctx.save();
    ctx.fillStyle = '#000';
    ctx.fillRect(mx, my, magSize, magSize);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(mx, my, magSize, magSize);

    ctx.beginPath();
    ctx.rect(mx, my, magSize, magSize);
    ctx.clip();

    let srcW = magSize / zoom;
    let srcH = magSize / zoom;
    let srcX = mousePos.x - srcW / 2;
    let srcY = mousePos.y - srcH / 2;
    let dstX = 0;
    let dstY = 0;

    if (srcX < 0) {
      dstX = -srcX * zoom;
      srcW += srcX;
      srcX = 0;
    }
    if (srcY < 0) {
      dstY = -srcY * zoom;
      srcH += srcY;
      srcY = 0;
    }
    if (srcX + srcW > image.width) srcW = image.width - srcX;
    if (srcY + srcH > image.height) srcH = image.height - srcY;

    if (srcW > 0 && srcH > 0) {
      ctx.drawImage(image, srcX, srcY, srcW, srcH, mx + dstX, my + dstY, srcW * zoom, srcH * zoom);
    }

    // Crosshair
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mx + magSize / 2, my);
    ctx.lineTo(mx + magSize / 2, my + magSize);
    ctx.moveTo(mx, my + magSize / 2);
    ctx.lineTo(mx + magSize, my + magSize / 2);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Fit view to show entire image
   */
  fitToView() {
    const { canvas, container, state } = this;
    const { image, imageSize } = state;

    if (!image) return;

    const padding = 40;
    const sx = (container.clientWidth - padding * 2) / imageSize.width;
    const sy = (container.clientHeight - padding * 2) / imageSize.height;

    state.view.scale = Math.min(sx, sy, 1);
    state.view.x = (container.clientWidth - imageSize.width * state.view.scale) / 2;
    state.view.y = (container.clientHeight - imageSize.height * state.view.scale) / 2;

    this.render();
  }

  /**
   * Convert screen coordinates to canvas coordinates
   */
  toCanvas(sx, sy) {
    const rect = this.canvas.getBoundingClientRect();
    const { view } = this.state;
    return {
      x: (sx - rect.left - view.x) / view.scale,
      y: (sy - rect.top - view.y) / view.scale
    };
  }

  /**
   * Find line at position
   */
  findLine(pos) {
    const threshold = 12 / this.state.view.scale;
    for (const l of this.state.lines) {
      if (Math.abs(l.geo.a * pos.x + l.geo.b * pos.y + l.geo.c) < threshold) {
        return l;
      }
    }
    return null;
  }
}

/**
 * Export image with lines
 */
export function exportImage(state, extended = false) {
  const { image, imageSize, lines, vpPos } = state;

  if (!image) return;

  let w = imageSize.width;
  let h = imageSize.height;
  let ox = 0;
  let oy = 0;

  if (extended && vpPos) {
    const minX = Math.min(0, vpPos.x - 50);
    const minY = Math.min(0, vpPos.y - 50);
    const maxX = Math.max(w, vpPos.x + 50);
    const maxY = Math.max(h, vpPos.y + 50);
    w = maxX - minX;
    h = maxY - minY;
    ox = -minX;
    oy = -minY;
  }

  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d');

  x.fillStyle = '#1e293b';
  x.fillRect(0, 0, w, h);
  x.drawImage(image, ox, oy);

  const rect = { left: -ox, top: -oy, right: w - ox, bottom: h - oy };

  for (const l of lines) {
    if (l.isPlumb) {
      const p1 = { x: l.geo.p1.x + ox, y: l.geo.p1.y + oy };
      const p2 = { x: l.geo.p2.x + ox, y: l.geo.p2.y + oy };
      x.beginPath();
      x.moveTo(p1.x, p1.y);
      x.lineTo(p2.x, p2.y);
      x.strokeStyle = '#22d3ee';
      x.lineWidth = 2;
      x.setLineDash([2, 3]);
      x.stroke();
      x.setLineDash([]);
      x.beginPath();
      x.arc(p1.x, p1.y, 4, 0, Math.PI * 2);
      x.fillStyle = '#22d3ee';
      x.fill();
      x.beginPath();
      x.moveTo(p2.x - 5, p2.y - 5);
      x.lineTo(p2.x + 5, p2.y + 5);
      x.moveTo(p2.x + 5, p2.y - 5);
      x.lineTo(p2.x - 5, p2.y + 5);
      x.stroke();
    } else {
      const seg = lineRect(l.geo, rect);
      if (!seg) continue;
      x.beginPath();
      x.moveTo(seg[0].x + ox, seg[0].y + oy);
      x.lineTo(seg[1].x + ox, seg[1].y + oy);
      x.strokeStyle = l.color;
      x.lineWidth = 3;
      x.setLineDash(l.isVP ? [12, 6] : []);
      x.stroke();
    }
  }
  x.setLineDash([]);

  if (vpPos) {
    const vx = vpPos.x + ox;
    const vy = vpPos.y + oy;
    x.strokeStyle = '#00ff87';
    x.lineWidth = 3;
    x.beginPath();
    x.moveTo(vx - 40, vy);
    x.lineTo(vx + 40, vy);
    x.moveTo(vx, vy - 40);
    x.lineTo(vx, vy + 40);
    x.stroke();
    x.beginPath();
    x.arc(vx, vy, 20, 0, Math.PI * 2);
    x.stroke();
  }

  // Watermark
  const wmText = 'github.com/maverde73/offside-calculator';
  x.font = '14px Montserrat, sans-serif';
  const wmWidth = x.measureText(wmText).width;
  const wmPadding = 12;
  const wmX = w - wmWidth - wmPadding * 2 - 10;
  const wmY = h - 30;
  x.fillStyle = 'rgba(0, 0, 0, 0.7)';
  x.fillRect(wmX - wmPadding, wmY - 18, wmWidth + wmPadding * 2, 28);
  x.fillStyle = '#00ff87';
  x.fillText(wmText, wmX, wmY);

  // Download
  const a = document.createElement('a');
  a.download = 'offside_analysis_ai.png';
  a.href = c.toDataURL('image/png');
  a.click();
}
