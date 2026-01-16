/**
 * Lazy loader for OpenCV.js
 * Loads OpenCV from CDN only when needed
 */

let opencvLoaded = false;
let opencvLoadPromise = null;

/**
 * Load OpenCV.js from CDN
 * @returns {Promise<boolean>} True if loaded successfully
 */
export async function loadOpenCV() {
  if (opencvLoaded) return true;

  if (opencvLoadPromise) return opencvLoadPromise;

  opencvLoadPromise = new Promise((resolve, reject) => {
    // Check if already loaded (e.g., from cache)
    if (typeof cv !== 'undefined' && cv.Mat) {
      opencvLoaded = true;
      resolve(true);
      return;
    }

    // Load from CDN
    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.5.5/opencv.js';
    script.async = true;

    script.onload = () => {
      // OpenCV needs time to initialize WASM
      const checkReady = () => {
        if (typeof cv !== 'undefined') {
          if (cv.Mat) {
            // Already initialized
            opencvLoaded = true;
            resolve(true);
          } else if (cv.onRuntimeInitialized !== undefined) {
            // Need to wait for initialization
            cv.onRuntimeInitialized = () => {
              opencvLoaded = true;
              resolve(true);
            };
          } else {
            // Fallback: poll for Mat availability
            const pollInterval = setInterval(() => {
              if (typeof cv !== 'undefined' && cv.Mat) {
                clearInterval(pollInterval);
                opencvLoaded = true;
                resolve(true);
              }
            }, 100);

            // Timeout after 30 seconds
            setTimeout(() => {
              clearInterval(pollInterval);
              if (!opencvLoaded) {
                reject(new Error('OpenCV initialization timeout'));
              }
            }, 30000);
          }
        } else {
          reject(new Error('OpenCV failed to load'));
        }
      };

      // Give it a moment then check
      setTimeout(checkReady, 100);
    };

    script.onerror = () => {
      opencvLoadPromise = null;
      reject(new Error('Failed to load OpenCV script from CDN'));
    };

    document.head.appendChild(script);
  });

  return opencvLoadPromise;
}

/**
 * Check if OpenCV is loaded
 */
export function isOpenCVLoaded() {
  return opencvLoaded;
}

/**
 * Get OpenCV load status message
 */
export function getLoadStatus() {
  if (opencvLoaded) return 'ready';
  if (opencvLoadPromise) return 'loading';
  return 'not_loaded';
}
