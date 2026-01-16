# Offside Calculator Pro AI v4.0

AI-enhanced version of Offside Calculator with automatic field line detection using OpenCV.js and Hough Transform.

## Features

All features from the manual version, plus:

- **Automatic Line Detection**: Uses OpenCV.js with Hough Transform to automatically detect horizontal field lines
- **Confidence Scoring**: Each detected line shows a confidence percentage
- **Accept/Reject Workflow**: Review AI suggestions before accepting them
- **Toggle AI**: Enable/disable auto-detection as needed

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist/` folder.

## How It Works

1. **Load Image**: Open a soccer/football match image
2. **AI Detection**: OpenCV.js automatically detects horizontal lines (~3-5 seconds for first load)
3. **Review Suggestions**: Check the confidence scores and select which lines to accept
4. **Manual Refinement**: Add or remove lines manually as needed
5. **Analyze Offside**: Use Player Projection tool (Y) for accurate offside analysis

## Technology

- **Vite**: Build tool and dev server
- **OpenCV.js**: Computer Vision library (loaded from CDN)
- **Hough Transform**: Line detection algorithm
- **Vanilla JavaScript**: No framework dependencies

## OpenCV.js Loading

OpenCV.js (~8MB) is loaded lazily from the official CDN when first needed:
- First load: ~3-5 seconds
- Subsequent loads: Cached by browser

## Keyboard Shortcuts

Same as manual version:

| Key | Action |
|-----|--------|
| V | Select tool |
| L | Reference Line tool |
| P | Offside Line tool |
| Y | Player Projection tool |
| D | Delete tool |
| H | Pan tool |
| Arrows | Move VP (1px) |
| Shift+Arrows | Move VP (10px) |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| F1 | Help |

## License

MIT License (c) 2026 Maurizio Verde

## Credits

- Original Offside Calculator by Maurizio Verde
- OpenCV.js by OpenCV team
- Built with Vite
