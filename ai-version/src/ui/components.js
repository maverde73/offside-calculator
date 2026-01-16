/**
 * UI Components for AI Detection Panel
 */

import { t } from './i18n.js';
import { formatConfidence, getConfidenceColor } from '../ai/confidence.js';

/**
 * Detection Panel Component
 */
export class DetectionPanel {
  constructor(container, callbacks) {
    this.container = container;
    this.onAccept = callbacks.onAccept;
    this.onReject = callbacks.onReject;
    this.onToggle = callbacks.onToggle;
    this.onRunDetection = callbacks.onRunDetection;
    this.suggestions = [];
    this.aiEnabled = true;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="sidebar-section ai-panel">
        <div class="sidebar-title ai-title">
          <span data-i18n="aiPanel">${t('aiPanel')}</span>
          <button class="btn-toggle-ai" id="btnToggleAI" title="${t('toggleAI')}">
            <span class="ai-indicator ${this.aiEnabled ? 'active' : ''}">&#9889;</span>
          </button>
        </div>
        <div id="detectionStatus" class="detection-status"></div>
        <div id="detectionResults" class="detection-results"></div>
        <button class="btn btn-secondary sidebar-btn" id="btnRunDetection" style="display: none;">
          <span data-i18n="runDetection">${t('runDetection')}</span>
        </button>
      </div>
    `;

    document.getElementById('btnToggleAI').onclick = () => {
      this.aiEnabled = !this.aiEnabled;
      this.onToggle(this.aiEnabled);
      this.setAIEnabled(this.aiEnabled);
    };

    document.getElementById('btnRunDetection').onclick = () => {
      this.onRunDetection();
    };
  }

  showIdle() {
    const status = document.getElementById('detectionStatus');
    status.innerHTML = `
      <div class="detection-idle">
        <span>${t('emptyDescAI')}</span>
      </div>
    `;
    document.getElementById('detectionResults').innerHTML = '';
    document.getElementById('btnRunDetection').style.display = 'none';
  }

  showLoading() {
    const status = document.getElementById('detectionStatus');
    status.innerHTML = `
      <div class="detecting-spinner">
        <span class="spinner"></span>
        <span>${t('loadingOpenCV')}</span>
      </div>
    `;
    document.getElementById('detectionResults').innerHTML = '';
    document.getElementById('btnRunDetection').style.display = 'none';
  }

  showDetecting() {
    const status = document.getElementById('detectionStatus');
    status.innerHTML = `
      <div class="detecting-spinner">
        <span class="spinner"></span>
        <span>${t('detecting')}</span>
      </div>
    `;
    document.getElementById('detectionResults').innerHTML = '';
    document.getElementById('btnRunDetection').style.display = 'none';
  }

  showResults(suggestions, avgConfidence) {
    this.suggestions = suggestions;

    const status = document.getElementById('detectionStatus');

    if (suggestions.length === 0) {
      status.innerHTML = `
        <div class="detection-summary no-results">
          <span>${t('noLinesFound')}</span>
        </div>
      `;
      document.getElementById('detectionResults').innerHTML = '';
      document.getElementById('btnRunDetection').style.display = 'block';
      return;
    }

    status.innerHTML = `
      <div class="detection-summary">
        <span>${t('foundLines', { count: suggestions.length })}</span>
        <span class="confidence-badge" style="background: ${getConfidenceColor(avgConfidence)}">
          ${t('avgConfidence', { value: Math.round(avgConfidence * 100) })}
        </span>
      </div>
    `;

    const results = document.getElementById('detectionResults');
    results.innerHTML = `
      <div class="suggestion-list">
        ${suggestions
          .map(
            (line, idx) => `
          <div class="suggestion-item" data-line-id="${line.id}">
            <input type="checkbox" id="line-${idx}" checked />
            <label for="line-${idx}">
              <span class="line-number">${idx + 1}</span>
              <span class="line-confidence" style="color: ${getConfidenceColor(line.confidence)}">
                ${formatConfidence(line.confidence)}
              </span>
            </label>
          </div>
        `
          )
          .join('')}
      </div>
      <div class="detection-actions">
        <button class="btn btn-primary btn-accept" id="btnAcceptSuggestions">
          ${t('acceptSelected')}
        </button>
        <button class="btn btn-secondary btn-reject" id="btnRejectAll">
          ${t('rejectAll')}
        </button>
      </div>
    `;

    document.getElementById('btnAcceptSuggestions').onclick = () => {
      const selected = this.getSelectedSuggestions();
      this.onAccept(selected);
    };

    document.getElementById('btnRejectAll').onclick = () => {
      this.onReject();
    };

    document.getElementById('btnRunDetection').style.display = 'none';
  }

  showError(message) {
    const status = document.getElementById('detectionStatus');
    status.innerHTML = `
      <div class="detection-error">
        <span>${t('detectionFailed')}: ${message}</span>
      </div>
    `;
    document.getElementById('detectionResults').innerHTML = '';
    document.getElementById('btnRunDetection').style.display = 'block';
  }

  showReadyForDetection() {
    const status = document.getElementById('detectionStatus');
    status.innerHTML = `
      <div class="detection-ready">
        <span>${this.aiEnabled ? t('aiEnabled') : t('aiDisabled')}</span>
      </div>
    `;
    document.getElementById('detectionResults').innerHTML = '';
    document.getElementById('btnRunDetection').style.display = this.aiEnabled ? 'block' : 'none';
  }

  getSelectedSuggestions() {
    const checkboxes = document.querySelectorAll(
      '.suggestion-item input[type="checkbox"]:checked'
    );
    return Array.from(checkboxes).map((cb) => {
      const id = cb.closest('.suggestion-item').dataset.lineId;
      return this.suggestions.find((s) => s.id === id);
    });
  }

  clear() {
    document.getElementById('detectionStatus').innerHTML = '';
    document.getElementById('detectionResults').innerHTML = '';
    document.getElementById('btnRunDetection').style.display = 'none';
  }

  setAIEnabled(enabled) {
    this.aiEnabled = enabled;
    const indicator = document.querySelector('.ai-indicator');
    if (indicator) {
      indicator.classList.toggle('active', enabled);
      indicator.style.opacity = enabled ? '1' : '0.3';
    }

    const btn = document.getElementById('btnRunDetection');
    if (btn) {
      btn.style.display = enabled ? 'block' : 'none';
    }
  }

  updateLanguage() {
    // Re-render with new language
    const wasEnabled = this.aiEnabled;
    const hadSuggestions = this.suggestions.length > 0;

    this.render();
    this.setAIEnabled(wasEnabled);

    if (hadSuggestions) {
      // Will need to re-show results from parent
    }
  }
}

/**
 * Render confidence badge on canvas
 */
export function renderConfidenceBadge(ctx, line, view) {
  if (!line.isAIDetected || !line.confidence || !line.isPending) return;

  const midX = (line.p1.x + line.p2.x) / 2;
  const midY = (line.p1.y + line.p2.y) / 2;

  ctx.save();
  ctx.font = `bold ${12 / view.scale}px Montserrat, sans-serif`;

  const text = formatConfidence(line.confidence);
  const metrics = ctx.measureText(text);
  const padding = 4 / view.scale;

  // Background
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.fillRect(
    midX - metrics.width / 2 - padding,
    midY - 10 / view.scale - padding,
    metrics.width + padding * 2,
    14 / view.scale + padding * 2
  );

  // Text
  ctx.fillStyle = getConfidenceColor(line.confidence);
  ctx.textAlign = 'center';
  ctx.fillText(text, midX, midY);

  ctx.restore();
}
