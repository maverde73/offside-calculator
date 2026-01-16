/**
 * Line Detection Engine using OpenCV.js
 * Uses Hough Transform to detect horizontal field lines
 */

import { loadOpenCV } from './loader.js';
import { createLine } from '../core/geometry.js';

export class LineDetector {
  constructor() {
    // Detection parameters
    this.minLineLength = 80; // Min pixels for valid line
    this.maxLineGap = 15; // Max gap to merge line segments
    this.cannyLow = 50; // Canny edge detection low threshold
    this.cannyHigh = 150; // Canny edge detection high threshold
    this.houghThreshold = 80; // Hough transform threshold
    this.angleToleranceDeg = 20; // Degrees tolerance for "horizontal"
  }

  /**
   * Detect horizontal lines in an image
   * @param {HTMLImageElement|HTMLCanvasElement} imageElement
   * @param {Object} options Override default parameters
   * @returns {Promise<Array>} Array of detected line objects
   */
  async detect(imageElement, options = {}) {
    // Ensure OpenCV is loaded
    const loaded = await loadOpenCV();
    if (!loaded) throw new Error('OpenCV not available');

    // Override defaults with options
    Object.assign(this, options);

    // Convert image to OpenCV Mat
    const src = cv.imread(imageElement);
    const gray = new cv.Mat();
    const edges = new cv.Mat();
    const lines = new cv.Mat();

    try {
      // 1. Convert to grayscale
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

      // 2. Apply Gaussian blur to reduce noise
      const ksize = new cv.Size(5, 5);
      cv.GaussianBlur(gray, gray, ksize, 0, 0, cv.BORDER_DEFAULT);

      // 3. Canny edge detection
      cv.Canny(gray, edges, this.cannyLow, this.cannyHigh);

      // 4. Hough Line Transform (Probabilistic)
      cv.HoughLinesP(
        edges,
        lines,
        1, // rho resolution
        Math.PI / 180, // theta resolution (1 degree)
        this.houghThreshold, // threshold
        this.minLineLength, // min line length
        this.maxLineGap // max line gap
      );

      // 5. Extract and filter lines
      const detectedLines = [];
      for (let i = 0; i < lines.rows; i++) {
        const x1 = lines.data32S[i * 4];
        const y1 = lines.data32S[i * 4 + 1];
        const x2 = lines.data32S[i * 4 + 2];
        const y2 = lines.data32S[i * 4 + 3];

        // Calculate angle (in degrees)
        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
        const absAngle = Math.abs(angle);

        // Filter for roughly horizontal lines
        // Horizontal = 0 degrees or 180 degrees
        if (absAngle <= this.angleToleranceDeg || absAngle >= 180 - this.angleToleranceDeg) {
          const p1 = { x: x1, y: y1 };
          const p2 = { x: x2, y: y2 };
          const lineEq = createLine(p1, p2);

          if (lineEq) {
            // Calculate confidence based on length and angle precision
            const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const angleDeviation = Math.min(absAngle, 180 - absAngle);
            const lengthScore = Math.min(length / 400, 1.0); // Max at 400px
            const angleScore = 1.0 - angleDeviation / this.angleToleranceDeg;
            const confidence = lengthScore * 0.4 + angleScore * 0.6;

            detectedLines.push({
              id: `ai-${Date.now()}-${i}`,
              geo: lineEq,
              p1,
              p2,
              color: '#3b82f6',
              isVP: false,
              isAIDetected: true,
              isPending: true,
              confidence: confidence,
              length: length,
              angle: angle
            });
          }
        }
      }

      // 6. Merge similar lines (reduce duplicates)
      const mergedLines = this.mergeSimilarLines(detectedLines);

      // 7. Sort by confidence (descending)
      mergedLines.sort((a, b) => b.confidence - a.confidence);

      return mergedLines;
    } finally {
      // Clean up OpenCV mats
      src.delete();
      gray.delete();
      edges.delete();
      lines.delete();
    }
  }

  /**
   * Merge lines that are very close in position and angle
   */
  mergeSimilarLines(lines) {
    const merged = [];
    const used = new Set();

    for (let i = 0; i < lines.length; i++) {
      if (used.has(i)) continue;

      const line1 = lines[i];
      const group = [line1];

      for (let j = i + 1; j < lines.length; j++) {
        if (used.has(j)) continue;

        const line2 = lines[j];

        // Check if lines are similar (close in position and angle)
        const angleDiff = Math.abs(line1.angle - line2.angle);
        const avgY1 = (line1.p1.y + line1.p2.y) / 2;
        const avgY2 = (line2.p1.y + line2.p2.y) / 2;
        const yDiff = Math.abs(avgY1 - avgY2);

        if (angleDiff < 5 && yDiff < 30) {
          group.push(line2);
          used.add(j);
        }
      }

      // Average the group
      if (group.length > 1) {
        const avgLine = this.averageLines(group);
        merged.push(avgLine);
      } else {
        merged.push(line1);
      }
    }

    return merged;
  }

  /**
   * Average multiple similar lines into one
   */
  averageLines(lines) {
    // Find extent of all lines
    let minX = Infinity,
      maxX = -Infinity;
    let sumY = 0;
    let count = 0;

    for (const l of lines) {
      minX = Math.min(minX, l.p1.x, l.p2.x);
      maxX = Math.max(maxX, l.p1.x, l.p2.x);
      sumY += l.p1.y + l.p2.y;
      count += 2;
    }

    const avgY = sumY / count;
    const avgP1 = { x: minX, y: avgY };
    const avgP2 = { x: maxX, y: avgY };

    const maxConfidence = Math.max(...lines.map((l) => l.confidence));
    const lineEq = createLine(avgP1, avgP2);

    return {
      id: `ai-${Date.now()}-merged-${Math.random().toString(36).substr(2, 9)}`,
      geo: lineEq,
      p1: avgP1,
      p2: avgP2,
      color: '#3b82f6',
      isVP: false,
      isAIDetected: true,
      isPending: true,
      confidence: maxConfidence,
      length: Math.sqrt((avgP2.x - avgP1.x) ** 2 + (avgP2.y - avgP1.y) ** 2),
      angle: Math.atan2(avgP2.y - avgP1.y, avgP2.x - avgP1.x) * (180 / Math.PI)
    };
  }

  /**
   * Adjust detection parameters
   */
  setParameters(params) {
    Object.assign(this, params);
  }
}
