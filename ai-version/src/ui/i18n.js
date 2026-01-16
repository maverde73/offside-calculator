/**
 * Internationalization module
 */

export const i18n = {
  en: {
    // Original strings
    openImage: 'Open Image',
    sourceLines: 'Source',
    language: 'Language',
    vanishingPoint: 'Vanishing Point',
    drawLines: 'Draw at least 2 lines',
    insideImage: '\u2713 Inside image',
    outsideImage: '\u26a0 Outside image',
    recalculate: 'Recalculate',
    export: 'Export',
    exportImage: 'Image with Lines',
    exportExtended: 'Extended (with VP)',
    shortcuts: 'Shortcuts',
    select: 'Select',
    drawLine: 'Ref Line',
    vpLineShort: 'Offside Line',
    playerTool: 'Player Proj.',
    deleteTool: 'Delete',
    panTool: 'Pan',
    moveVP: 'Move VP',
    zoom: 'Zoom',
    undo: 'Undo',
    help: 'Help',
    statusSelect: 'Click to select. Drag VP or use arrow keys.',
    statusDraw1: 'Click first point of line.',
    statusDraw2: 'Click second point.',
    statusVP: 'Click to create line from VP.',
    statusVPNone: 'No VP. Draw lines first.',
    statusPlayer1: 'Click offside body part (e.g. shoulder).',
    statusPlayer2: 'Click point on ground.',
    statusDelete: 'Click on a line to delete.',
    statusPan: 'Drag to pan.',
    startTutorial: 'Tutorial',
    guideTitle: 'Pro User Guide',
    tabQuickstart: 'Quick Start',
    tabTheory: 'Master Theory',
    tabTools: 'Toolbox',
    tabAbout: 'About',
    emptyTitle: 'Load an image to begin',
    emptyDesc: "Click 'Open Image' or drag & drop",
    emptyDescAI: 'AI will automatically detect field lines',

    // AI-specific strings
    autoDetect: 'Auto-Detect',
    detecting: 'Detecting lines...',
    loadingOpenCV: 'Loading AI engine...',
    foundLines: 'Found {count} lines',
    noLinesFound: 'No lines detected',
    confidence: 'Confidence',
    acceptSuggestions: 'Accept',
    acceptSelected: 'Accept Selected',
    rejectAll: 'Reject All',
    refineDetection: 'Refine',
    aiDisabled: 'AI Detection Disabled',
    aiEnabled: 'AI Detection Enabled',
    toggleAI: 'Toggle AI',
    avgConfidence: 'Avg: {value}%',
    runDetection: 'Run Detection',
    detectionFailed: 'Detection failed',
    lineNum: 'Line {num}',
    aiPanel: 'AI Detection',

    // Help content
    quickstartContent: `<div class="guide-section"><h3>Quick Workflow</h3><p>Follow these steps for a professional analysis:</p><div class="guide-step"><div class="guide-step-num">1</div><div class="guide-step-content"><h4>Image Setup</h4><p>Use high-resolution images where pitch markings are clearly visible.</p></div></div><div class="guide-step"><div class="guide-step-num">2</div><div class="guide-step-content"><h4>AI Auto-Detection</h4><p>When you load an image, AI automatically detects horizontal field lines. Review the suggestions and click <strong>Accept</strong> to use them.</p></div></div><div class="guide-step"><div class="guide-step-num">3</div><div class="guide-step-content"><h4>Manual Refinement</h4><p>Press <strong>L</strong> to add more reference lines manually if needed. The more lines, the more accurate the VP.</p></div></div><div class="guide-step"><div class="guide-step-num">4</div><div class="guide-step-content"><h4>Player Analysis</h4><p>Press <strong>Y</strong>.<br>1. Click the player's offside body part.<br>2. Move down and click where that point projects on the ground.<br>3. The Orange line shows the offside position.</p></div></div></div>`,
    theoryContent: `<div class="guide-section"><h3>The Physics of Offside</h3><p>Understanding 2D projections of 3D space is key to VAR analysis.</p><div class="guide-highlight"><strong>What is the Vanishing Point (VP)?</strong><br>In a perspective image, all lines that are parallel in reality converge to a single point. This is the VP.</div><h3>The Parallax Error</h3><p>Why can't I just draw a line from the player's head?</p><ul><li><strong>The Ground Truth:</strong> Offside lines exist on the pitch surface (z=0).</li><li><strong>Projection:</strong> If a player is leaning, their head is "above" the line. We must project that point vertically down to the ground.</li></ul><p>Our <strong>Player Tool (Y)</strong> solves this by forcing you to define the "Body-to-Ground" segment.</p></div>`,
    toolsContent: `<div class="guide-section"><h3>Tool Reference</h3><div class="guide-step"><div class="guide-step-num">AI</div><div class="guide-step-content"><h4>Auto-Detection</h4><p>Uses OpenCV.js with Hough Transform to detect horizontal lines in the image. Confidence scores help you identify the most reliable detections.</p></div></div><div class="guide-step"><div class="guide-step-num">V</div><div class="guide-step-content"><h4>Select / Move VP</h4><p>Drag VP with mouse or use Arrow keys for precision (Shift+Arrow for 10px).</p></div></div><div class="guide-step"><div class="guide-step-num">L</div><div class="guide-step-content"><h4>Reference Line</h4><p>Draw Blue Lines on horizontal pitch markings.</p></div></div><div class="guide-step"><div class="guide-step-num">Y</div><div class="guide-step-content"><h4>Player Projection</h4><p>Click 1: Body part. Click 2: Ground point. Creates Cyan segment + Orange offside line.</p></div></div></div>`,
    aboutContent: `<div class="guide-section"><h3>Offside Calculator Pro AI</h3><p>Version 4.0 - AI-enhanced version with automatic field line detection.</p><div class="guide-highlight"><strong>AI Features</strong><br>Powered by OpenCV.js with Hough Transform for real-time line detection. No server required - all processing happens in your browser.</div><h3>Developer</h3><p><strong>Maurizio Verde</strong></p><h3>Links</h3><p><a href="https://github.com/maverde73/offside-calculator" target="_blank" style="color: #00ff87;">github.com/maverde73/offside-calculator</a></p><h3>License</h3><p>MIT License (c) 2026 Maurizio Verde</p></div>`
  },

  it: {
    // Original strings
    openImage: 'Apri Immagine',
    sourceLines: 'Sorgente',
    language: 'Lingua',
    vanishingPoint: 'Punto di Fuga',
    drawLines: 'Disegna almeno 2 linee',
    insideImage: "\u2713 Dentro l'immagine",
    outsideImage: "\u26a0 Fuori dall'immagine",
    recalculate: 'Ricalcola',
    export: 'Esporta',
    exportImage: 'Immagine con Linee',
    exportExtended: 'Estesa (con VP)',
    shortcuts: 'Scorciatoie',
    select: 'Seleziona',
    drawLine: 'Riferimento',
    vpLineShort: 'Linea F.G.',
    playerTool: 'Proiezione',
    deleteTool: 'Elimina',
    panTool: 'Sposta',
    moveVP: 'Muovi VP',
    zoom: 'Zoom',
    undo: 'Annulla',
    help: 'Aiuto',
    statusSelect: 'Clicca per selezionare. Trascina VP o usa le frecce.',
    statusDraw1: 'Clicca il primo punto.',
    statusDraw2: 'Clicca il secondo punto.',
    statusVP: 'Clicca per creare linea da VP.',
    statusVPNone: 'Nessun VP. Disegna linee prima.',
    statusPlayer1: 'Clicca parte del corpo (es. spalla).',
    statusPlayer2: 'Clicca punto a terra.',
    statusDelete: 'Clicca su una linea per eliminarla.',
    statusPan: 'Trascina per spostare.',
    startTutorial: 'Tutorial',
    guideTitle: 'Manuale Pro',
    tabQuickstart: 'Guida Rapida',
    tabTheory: 'Masterclass Teoria',
    tabTools: 'Strumenti',
    tabAbout: 'Info',
    emptyTitle: "Carica un'immagine",
    emptyDesc: "Clicca 'Apri Immagine' o trascina qui",
    emptyDescAI: "L'AI rileverà automaticamente le linee del campo",

    // AI-specific strings
    autoDetect: 'Auto-Rileva',
    detecting: 'Rilevamento in corso...',
    loadingOpenCV: 'Caricamento AI...',
    foundLines: 'Trovate {count} linee',
    noLinesFound: 'Nessuna linea rilevata',
    confidence: 'Affidabilità',
    acceptSuggestions: 'Accetta',
    acceptSelected: 'Accetta Selezionate',
    rejectAll: 'Rifiuta Tutto',
    refineDetection: 'Raffina',
    aiDisabled: 'Rilevamento AI Disattivato',
    aiEnabled: 'Rilevamento AI Attivo',
    toggleAI: 'Attiva/Disattiva AI',
    avgConfidence: 'Media: {value}%',
    runDetection: 'Avvia Rilevamento',
    detectionFailed: 'Rilevamento fallito',
    lineNum: 'Linea {num}',
    aiPanel: 'Rilevamento AI',

    // Help content
    quickstartContent: `<div class="guide-section"><h3>Flusso di Lavoro</h3><p>Segui questi passaggi per un'analisi precisa:</p><div class="guide-step"><div class="guide-step-num">1</div><div class="guide-step-content"><h4>Caricamento</h4><p>Usa screenshot HD con le linee del campo ben visibili.</p></div></div><div class="guide-step"><div class="guide-step-num">2</div><div class="guide-step-content"><h4>Auto-Rilevamento AI</h4><p>Quando carichi un'immagine, l'AI rileva automaticamente le linee orizzontali. Rivedi i suggerimenti e clicca <strong>Accetta</strong>.</p></div></div><div class="guide-step"><div class="guide-step-num">3</div><div class="guide-step-content"><h4>Raffinamento Manuale</h4><p>Premi <strong>L</strong> per aggiungere altre linee di riferimento se necessario.</p></div></div><div class="guide-step"><div class="guide-step-num">4</div><div class="guide-step-content"><h4>Analisi Giocatore</h4><p>Premi <strong>Y</strong>.<br>1. Clicca sulla parte del corpo in fuorigioco.<br>2. Clicca dove quel punto cade a terra.<br>3. La linea Arancione mostra il fuorigioco.</p></div></div></div>`,
    theoryContent: `<div class="guide-section"><h3>La Fisica del Fuorigioco</h3><p>Capire la proiezione 2D di uno spazio 3D è fondamentale per l'analisi VAR.</p><div class="guide-highlight"><strong>Cos'è il Punto di Fuga (VP)?</strong><br>In una foto prospettica, tutte le linee parallele nella realtà convergono in un unico punto.</div><h3>Errore di Parallasse</h3><p>Perché non posso tirare una linea dalla testa del giocatore?</p><ul><li><strong>Verità del Terreno:</strong> Le linee di fuorigioco esistono sul piano del campo (z=0).</li><li><strong>Proiezione:</strong> Se un giocatore è inclinato, la sua testa è "sopra" la linea.</li></ul><p>Lo <strong>Strumento Giocatore (Y)</strong> risolve questo problema definendo il segmento "Corpo-Terra".</p></div>`,
    toolsContent: `<div class="guide-section"><h3>Dettaglio Strumenti</h3><div class="guide-step"><div class="guide-step-num">AI</div><div class="guide-step-content"><h4>Auto-Rilevamento</h4><p>Usa OpenCV.js con Trasformata di Hough per rilevare le linee orizzontali. I punteggi di affidabilità aiutano a identificare i rilevamenti migliori.</p></div></div><div class="guide-step"><div class="guide-step-num">V</div><div class="guide-step-content"><h4>Seleziona / Muovi VP</h4><p>Trascina il VP o usa le frecce (Shift+Frecce per 10px).</p></div></div><div class="guide-step"><div class="guide-step-num">L</div><div class="guide-step-content"><h4>Linea di Riferimento</h4><p>Traccia Linee Blu sulle marcature orizzontali del campo.</p></div></div><div class="guide-step"><div class="guide-step-num">Y</div><div class="guide-step-content"><h4>Proiezione Giocatore</h4><p>Click 1: Parte del corpo. Click 2: Punto a terra. Crea segmento Ciano + linea Arancione.</p></div></div></div>`,
    aboutContent: `<div class="guide-section"><h3>Offside Calculator Pro AI</h3><p>Versione 4.0 - Versione potenziata con AI per il rilevamento automatico delle linee.</p><div class="guide-highlight"><strong>Funzionalità AI</strong><br>Alimentato da OpenCV.js con Trasformata di Hough per il rilevamento in tempo reale. Nessun server richiesto - tutto avviene nel browser.</div><h3>Sviluppatore</h3><p><strong>Maurizio Verde</strong></p><h3>Link</h3><p><a href="https://github.com/maverde73/offside-calculator" target="_blank" style="color: #00ff87;">github.com/maverde73/offside-calculator</a></p><h3>Licenza</h3><p>Licenza MIT (c) 2026 Maurizio Verde</p></div>`
  }
};

let currentLang = 'en';

/**
 * Get translation for a key
 */
export function t(key, params = {}) {
  let str = i18n[currentLang][key] || i18n['en'][key] || key;
  Object.keys(params).forEach((k) => {
    str = str.replace(`{${k}}`, params[k]);
  });
  return str;
}

/**
 * Set current language
 */
export function setLang(lang) {
  currentLang = lang;
}

/**
 * Get current language
 */
export function getLang() {
  return currentLang;
}

/**
 * Update all elements with data-i18n attribute
 */
export function updateUI() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (i18n[currentLang][key]) {
      el.textContent = i18n[currentLang][key];
    }
  });
}
