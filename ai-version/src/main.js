/**
 * Offside Calculator Pro AI v4.0
 * Main Application Entry Point
 */

import './style.css';
import { AppState } from './core/state.js';
import { CanvasManager, exportImage } from './core/canvas.js';
import { createLine, bestFit, distSq, lineRect } from './core/geometry.js';
import { LineDetector } from './ai/line-detector.js';
import { DetectionPanel } from './ui/components.js';
import { filterByConfidence, calculateAverageConfidence, getTopNLines } from './ai/confidence.js';
import { t, setLang, getLang, updateUI } from './ui/i18n.js';

class OffsideCalculatorAI {
  constructor() {
    this.state = new AppState();
    this.canvas = null;
    this.canvasManager = null;
    this.lineDetector = new LineDetector();
    this.detectionPanel = null;

    this.init();
  }

  init() {
    // Get DOM elements
    this.canvasEl = document.getElementById('canvas');
    this.container = document.getElementById('canvasContainer');

    // Initialize canvas manager
    this.canvasManager = new CanvasManager(this.canvasEl, this.container, this.state);

    // Setup UI
    this.setupDetectionPanel();
    this.setupEventHandlers();
    this.updateStatus();

    // Initial render
    this.canvasManager.render();
  }

  setupDetectionPanel() {
    const panelContainer = document.getElementById('aiPanelContainer');
    this.detectionPanel = new DetectionPanel(panelContainer, {
      onAccept: (selected) => this.acceptSuggestions(selected),
      onReject: () => this.rejectSuggestions(),
      onToggle: (enabled) => this.toggleAI(enabled),
      onRunDetection: () => this.runAutoDetection()
    });
    this.detectionPanel.showIdle();
  }

  setupEventHandlers() {
    // File input
    document.getElementById('btnOpen').onclick = () => {
      document.getElementById('fileInput').click();
    };

    document.getElementById('fileInput').onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) this.loadImage(file);
    };

    // Tool buttons
    document.querySelectorAll('.tool-btn[data-tool]').forEach((btn) => {
      btn.onclick = () => {
        this.state.tool = btn.dataset.tool;
        this.state.drawPt = null;
        this.updateStatus();
        this.canvasManager.render();
      };
    });

    // Undo/Redo
    document.getElementById('btnUndo').onclick = () => {
      if (this.state.undo()) {
        this.state.vpManual = false;
        this.state.vpPos = this.calcVP();
        this.canvasManager.render();
      }
    };

    document.getElementById('btnRedo').onclick = () => {
      if (this.state.redo()) {
        this.canvasManager.render();
      }
    };

    // Zoom
    document.getElementById('btnZoomIn').onclick = () => {
      this.state.view.scale *= 1.25;
      this.canvasManager.render();
      this.updateStatus();
    };

    document.getElementById('btnZoomOut').onclick = () => {
      this.state.view.scale *= 0.8;
      this.canvasManager.render();
      this.updateStatus();
    };

    document.getElementById('btnFit').onclick = () => {
      this.canvasManager.fitToView();
      this.updateStatus();
    };

    // Recalculate VP
    document.getElementById('btnRecalc').onclick = () => {
      this.state.vpManual = false;
      this.state.vpPos = this.calcVP();
      this.canvasManager.render();
      this.updateStatus();
    };

    // Export
    document.getElementById('btnExport').onclick = () => exportImage(this.state, false);
    document.getElementById('btnExportExt').onclick = () => exportImage(this.state, true);

    // Language toggle
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.onclick = () => {
        const lang = btn.dataset.lang;
        setLang(lang);
        this.state.lang = lang;
        updateUI();
        document.querySelectorAll('.lang-btn').forEach((b) => {
          b.classList.toggle('active', b.dataset.lang === lang);
        });
        this.updateStatus();
        this.detectionPanel.updateLanguage();
        this.setupDetectionPanel();
        if (this.state.aiState.detectedSuggestions.length > 0) {
          const avg = calculateAverageConfidence(this.state.aiState.detectedSuggestions);
          this.detectionPanel.showResults(this.state.aiState.detectedSuggestions, avg);
        }
      };
    });

    // Help modal
    document.getElementById('btnHelp').onclick = () => this.openHelp();
    document.getElementById('btnCloseHelp').onclick = () => this.closeHelp();
    document.getElementById('helpModal').onclick = (e) => {
      if (e.target.id === 'helpModal') this.closeHelp();
    };
    document.querySelectorAll('.modal-tab').forEach((tab) => {
      tab.onclick = () => this.showTab(tab.dataset.tab);
    });
    document.getElementById('btnTutorial').onclick = () => this.openHelp();

    // Canvas events
    this.setupCanvasEvents();

    // Keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Drag and drop
    this.container.addEventListener('dragover', (e) => e.preventDefault());
    this.container.addEventListener('drop', (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.loadImage(file);
      }
    });

    // Resize
    window.addEventListener('resize', () => this.canvasManager.render());
  }

  setupCanvasEvents() {
    const canvas = this.canvasEl;

    canvas.addEventListener('mousedown', (e) => {
      const pos = this.canvasManager.toCanvas(e.clientX, e.clientY);
      const { state } = this;

      // Check if clicking on VP
      if (
        state.vpPos &&
        state.tool === 'select' &&
        Math.sqrt(distSq(pos, state.vpPos)) < 25 / state.view.scale
      ) {
        state.draggingVP = true;
        return;
      }

      // Pan tool
      if (state.tool === 'pan' || e.button === 1) {
        state.isPanning = true;
        state.panStart = { x: e.clientX - state.view.x, y: e.clientY - state.view.y };
        this.container.style.cursor = 'grabbing';
        return;
      }

      // Tool-specific actions
      if (state.tool === 'draw') {
        if (!state.drawPt) {
          state.drawPt = pos;
        } else {
          const g = createLine(state.drawPt, pos);
          if (g) {
            state.lines.push({ id: Date.now(), geo: g, isVP: false, color: '#3b82f6' });
            if (!state.vpManual) state.vpPos = this.calcVP();
            state.saveHistory();
          }
          state.drawPt = null;
        }
      } else if (state.tool === 'vpLine' && state.vpPos) {
        const g = createLine(state.vpPos, pos);
        if (g) {
          state.lines.push({ id: Date.now(), geo: g, isVP: true, srcPt: pos, color: '#f97316' });
          state.saveHistory();
        }
      } else if (state.tool === 'player') {
        if (!state.drawPt) {
          state.drawPt = pos;
        } else {
          // Vertical projection
          const groundPt = { x: state.drawPt.x, y: pos.y };
          const plumb = createLine(state.drawPt, groundPt);
          if (plumb) {
            state.lines.push({
              id: Date.now(),
              geo: plumb,
              isVP: false,
              isPlumb: true,
              color: '#22d3ee'
            });
            if (state.vpPos) {
              const vpL = createLine(state.vpPos, groundPt);
              if (vpL) {
                state.lines.push({
                  id: Date.now() + 1,
                  geo: vpL,
                  isVP: true,
                  srcPt: groundPt,
                  color: '#f97316'
                });
              }
            }
            state.saveHistory();
          }
          state.drawPt = null;
        }
      } else if (state.tool === 'delete') {
        const line = this.canvasManager.findLine(pos);
        if (line) {
          state.lines = state.lines.filter((l) => l.id !== line.id);
          if (!state.vpManual) state.vpPos = this.calcVP();
          state.saveHistory();
        }
      } else if (state.tool === 'select') {
        state.selectedId = this.canvasManager.findLine(pos)?.id || null;
      }

      this.updateStatus();
      this.canvasManager.render();
    });

    canvas.addEventListener('mousemove', (e) => {
      const pos = this.canvasManager.toCanvas(e.clientX, e.clientY);
      const { state } = this;

      state.mousePos = pos;

      if (state.draggingVP) {
        state.vpManual = true;
        state.vpPos = pos;
        this.updateVPLines(pos);
      }

      if (state.isPanning) {
        state.view.x = e.clientX - state.panStart.x;
        state.view.y = e.clientY - state.panStart.y;
      }

      this.canvasManager.render();
    });

    canvas.addEventListener('mouseup', () => {
      const { state } = this;
      if (state.draggingVP) {
        state.saveHistory();
      }
      state.draggingVP = false;
      state.isPanning = false;
      if (state.tool === 'pan') {
        this.container.style.cursor = 'grab';
      }
    });

    canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const pos = this.canvasManager.toCanvas(e.clientX, e.clientY);
        const factor = e.deltaY > 0 ? 0.9 : 1.1;
        const { state } = this;

        state.view.scale = Math.max(0.05, Math.min(20, state.view.scale * factor));

        const rect = canvas.getBoundingClientRect();
        state.view.x = e.clientX - pos.x * state.view.scale - rect.left;
        state.view.y = e.clientY - pos.y * state.view.scale - rect.top;

        this.updateStatus();
        this.canvasManager.render();
      },
      { passive: false }
    );
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      const { state } = this;

      if (e.key === 'Escape') {
        state.drawPt = null;
        state.tool = 'select';
      } else if (e.key === 'F1') {
        e.preventDefault();
        this.openHelp();
      } else if (e.key === 'v') {
        state.tool = 'select';
      } else if (e.key === 'l') {
        state.tool = 'draw';
      } else if (e.key === 'p') {
        state.tool = 'vpLine';
      } else if (e.key === 'y') {
        state.tool = 'player';
      } else if (e.key === 'd') {
        state.tool = 'delete';
      } else if (e.key === 'h') {
        state.tool = 'pan';
      } else if (e.key === ' ') {
        e.preventDefault();
        state.tool = 'pan';
      } else if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        if (state.undo()) {
          state.vpManual = false;
          state.vpPos = this.calcVP();
        }
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        state.redo();
      } else if (e.key === 'Delete' && state.selectedId) {
        state.lines = state.lines.filter((l) => l.id !== state.selectedId);
        if (!state.vpManual) state.vpPos = this.calcVP();
        state.saveHistory();
        state.selectedId = null;
      } else if (state.vpPos && e.key.startsWith('Arrow')) {
        const d = e.shiftKey ? 10 : 1;
        let dx = 0,
          dy = 0;
        if (e.key === 'ArrowLeft') dx = -d / state.view.scale;
        if (e.key === 'ArrowRight') dx = d / state.view.scale;
        if (e.key === 'ArrowUp') dy = -d / state.view.scale;
        if (e.key === 'ArrowDown') dy = d / state.view.scale;
        if (dx || dy) {
          e.preventDefault();
          state.vpManual = true;
          state.vpPos = { x: state.vpPos.x + dx, y: state.vpPos.y + dy };
          this.updateVPLines(state.vpPos);
        }
      }

      this.updateStatus();
      this.canvasManager.render();
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === ' ') {
        this.state.tool = 'select';
        this.updateStatus();
        this.canvasManager.render();
      }
    });
  }

  async loadImage(file) {
    const { state } = this;

    // Check for existing lines
    if (state.lines.length > 0) {
      const message =
        state.lang === 'it'
          ? "Ci sono già delle linee disegnate. Vuoi mantenerle per la nuova immagine?\n\n• OK = Mantieni le linee\n• Annulla = Cancella tutto e ricomincia"
          : "There are existing lines. Do you want to keep them for the new image?\n\n• OK = Keep lines\n• Cancel = Clear all and start fresh";

      const keepLines = confirm(message);
      state.reset(!keepLines);
    } else {
      state.reset(false);
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = async () => {
        state.image = img;
        state.imageSize = { width: img.width, height: img.height };

        document.getElementById('emptyState').style.display = 'none';

        this.canvasManager.fitToView();
        this.updateStatus();

        // Trigger AI detection if enabled
        if (state.aiState.autoDetectEnabled) {
          await this.runAutoDetection();
        } else {
          this.detectionPanel.showReadyForDetection();
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  async runAutoDetection() {
    const { state } = this;

    if (!state.image) {
      return;
    }

    try {
      state.aiState.isDetecting = true;
      this.detectionPanel.showLoading();

      // Run detection
      const suggestions = await this.lineDetector.detect(state.image);

      // Filter and get top lines
      const filtered = filterByConfidence(suggestions, 0.5);
      const top = getTopNLines(filtered, 6);

      // Calculate average confidence
      const avgConf = calculateAverageConfidence(top);

      // Store suggestions
      state.aiState.detectedSuggestions = top;
      state.aiState.isDetecting = false;

      // Show results
      this.detectionPanel.showResults(top, avgConf);

      // Render preview
      this.canvasManager.render();
    } catch (error) {
      console.error('Detection failed:', error);
      state.aiState.isDetecting = false;
      this.detectionPanel.showError(error.message);
    }
  }

  acceptSuggestions(selectedLines) {
    const { state } = this;

    // Add selected lines to state (mark as no longer pending)
    for (const line of selectedLines) {
      state.lines.push({
        ...line,
        isPending: false,
        isAIDetected: true
      });
    }

    // Calculate VP
    const sourceLines = state.getSourceLines();
    if (sourceLines.length >= 2) {
      state.vpPos = bestFit(sourceLines.map((l) => l.geo));
    }

    state.saveHistory();

    // Clear suggestions
    state.aiState.detectedSuggestions = [];
    this.detectionPanel.clear();
    this.detectionPanel.showReadyForDetection();

    this.updateStatus();
    this.canvasManager.render();
  }

  rejectSuggestions() {
    this.state.aiState.detectedSuggestions = [];
    this.detectionPanel.clear();
    this.detectionPanel.showReadyForDetection();
    this.canvasManager.render();
  }

  toggleAI(enabled) {
    this.state.aiState.autoDetectEnabled = enabled;
    this.detectionPanel.setAIEnabled(enabled);

    if (!enabled) {
      this.state.aiState.detectedSuggestions = [];
      this.canvasManager.render();
    }
  }

  calcVP() {
    const sourceLines = this.state.getSourceLines();
    return sourceLines.length >= 2 ? bestFit(sourceLines.map((l) => l.geo)) : null;
  }

  updateVPLines(vp) {
    if (!vp) return;
    const { state } = this;

    state.lines = state.lines.map((l) => {
      if (!l.isVP) return l;

      let anchor;
      if (l.srcPt) {
        anchor = l.srcPt;
      } else {
        const rect = { left: 0, top: 0, right: state.imageSize.width, bottom: state.imageSize.height };
        const seg = lineRect(l.geo, rect);
        anchor = seg ? (distSq(seg[0], vp) > distSq(seg[1], vp) ? seg[0] : seg[1]) : l.geo.p2;
      }

      if (!anchor) return l;
      const g = createLine(vp, anchor);
      return g ? { ...l, geo: g } : l;
    });
  }

  updateStatus() {
    const { state } = this;

    // Status hint
    const statusMessages = {
      select: t('statusSelect'),
      draw: state.drawPt ? t('statusDraw2') : t('statusDraw1'),
      vpLine: state.vpPos ? t('statusVP') : t('statusVPNone'),
      player: state.drawPt ? t('statusPlayer2') : t('statusPlayer1'),
      delete: t('statusDelete'),
      pan: t('statusPan')
    };
    document.getElementById('statusHint').textContent = statusMessages[state.tool];

    // VP info
    document.getElementById('vpX').textContent = state.vpPos ? state.vpPos.x.toFixed(1) : '--';
    document.getElementById('vpY').textContent = state.vpPos ? state.vpPos.y.toFixed(1) : '--';

    const vpStatus = document.getElementById('vpStatus');
    if (state.vpPos) {
      const inside =
        state.vpPos.x >= 0 &&
        state.vpPos.x <= state.imageSize.width &&
        state.vpPos.y >= 0 &&
        state.vpPos.y <= state.imageSize.height;
      vpStatus.innerHTML = inside ? t('insideImage') : t('outsideImage');
      vpStatus.className = 'vp-status ' + (inside ? 'inside' : 'outside');
    } else {
      vpStatus.innerHTML = t('drawLines');
      vpStatus.className = 'vp-status';
    }

    // Header stats
    document.getElementById('vpCoords').textContent = state.vpPos
      ? `VP: (${Math.round(state.vpPos.x)}, ${Math.round(state.vpPos.y)})`
      : 'VP: --';
    document.getElementById('sourceCount').textContent = state.getSourceLines().length;
    document.getElementById('vpCount').textContent = state.getVPLines().length;
    document.getElementById('zoomIndicator').textContent =
      Math.round(state.view.scale * 100) + '%';

    // Tool buttons
    document.querySelectorAll('.tool-btn[data-tool]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tool === state.tool);
    });

    // Empty state
    document.getElementById('emptyState').style.display = state.image ? 'none' : 'block';

    // Cursor
    const cursors = {
      select: 'default',
      draw: 'crosshair',
      vpLine: 'crosshair',
      player: 'crosshair',
      delete: 'pointer',
      pan: 'grab'
    };
    this.container.style.cursor = cursors[state.tool] || 'default';
  }

  openHelp() {
    document.getElementById('helpModal').classList.add('open');
    this.showTab('quickstart');
  }

  closeHelp() {
    document.getElementById('helpModal').classList.remove('open');
  }

  showTab(tab) {
    document.querySelectorAll('.modal-tab').forEach((t) => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    document.getElementById('modalContent').innerHTML = t(tab + 'Content') || '';
  }
}

// Initialize app
const app = new OffsideCalculatorAI();
