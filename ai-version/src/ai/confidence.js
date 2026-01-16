/**
 * Confidence scoring and filtering for AI detections
 */

/**
 * Filter lines by minimum confidence threshold
 */
export function filterByConfidence(lines, minConfidence = 0.5) {
  return lines.filter((line) => line.confidence >= minConfidence);
}

/**
 * Get top N lines by confidence
 */
export function getTopNLines(lines, n = 4) {
  return [...lines].sort((a, b) => b.confidence - a.confidence).slice(0, n);
}

/**
 * Calculate average confidence of lines
 */
export function calculateAverageConfidence(lines) {
  if (lines.length === 0) return 0;
  const sum = lines.reduce((acc, line) => acc + line.confidence, 0);
  return sum / lines.length;
}

/**
 * Format confidence as percentage string
 */
export function formatConfidence(confidence) {
  return `${Math.round(confidence * 100)}%`;
}

/**
 * Get color based on confidence level
 */
export function getConfidenceColor(confidence) {
  if (confidence >= 0.8) return '#00ff87'; // High - green
  if (confidence >= 0.6) return '#f97316'; // Medium - orange
  return '#ef4444'; // Low - red
}

/**
 * Get confidence level label
 */
export function getConfidenceLevel(confidence) {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.6) return 'medium';
  return 'low';
}
