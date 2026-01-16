/**
 * Application State Management
 */

export class AppState {
  constructor() {
    // Image state
    this.image = null;
    this.imageSize = { width: 0, height: 0 };

    // Lines and VP
    this.lines = [];
    this.vpPos = null;
    this.vpManual = false;

    // History for undo/redo
    this.history = ['[]'];
    this.historyIdx = 0;

    // View state
    this.view = { x: 0, y: 0, scale: 1 };

    // Tool state
    this.tool = 'select';
    this.drawPt = null;
    this.mousePos = null;
    this.selectedId = null;
    this.draggingVP = false;
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };

    // Language
    this.lang = 'en';

    // AI-specific state
    this.aiState = {
      isDetecting: false,
      detectedSuggestions: [],
      autoDetectEnabled: true,
      opencvLoaded: false
    };
  }

  /**
   * Add a line to the state
   */
  addLine(line) {
    this.lines.push(line);
    this.saveHistory();
  }

  /**
   * Delete a line by ID
   */
  deleteLine(id) {
    this.lines = this.lines.filter((l) => l.id !== id);
    this.saveHistory();
  }

  /**
   * Save current state to history
   */
  saveHistory() {
    this.history = this.history.slice(0, this.historyIdx + 1);
    this.history.push(JSON.stringify(this.lines));
    this.historyIdx = this.history.length - 1;
  }

  /**
   * Undo last action
   */
  undo() {
    if (this.historyIdx > 0) {
      this.historyIdx--;
      this.lines = JSON.parse(this.history[this.historyIdx]);
      return true;
    }
    return false;
  }

  /**
   * Redo last undone action
   */
  redo() {
    if (this.historyIdx < this.history.length - 1) {
      this.historyIdx++;
      this.lines = JSON.parse(this.history[this.historyIdx]);
      return true;
    }
    return false;
  }

  /**
   * Reset state for new image
   */
  reset(keepLines = false) {
    if (!keepLines) {
      this.lines = [];
      this.vpPos = null;
      this.vpManual = false;
      this.history = ['[]'];
      this.historyIdx = 0;
    }
    this.drawPt = null;
    this.selectedId = null;
    this.aiState.detectedSuggestions = [];
  }

  /**
   * Get source lines (non-VP, non-plumb)
   */
  getSourceLines() {
    return this.lines.filter((l) => !l.isVP && !l.isPlumb);
  }

  /**
   * Get VP lines
   */
  getVPLines() {
    return this.lines.filter((l) => l.isVP);
  }
}
