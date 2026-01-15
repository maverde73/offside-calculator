# ⚽ Offside Calculator Pro

A professional web-based tool for analyzing offside positions in soccer/football using perspective geometry and vanishing point calculations. Perfect for coaches, analysts, referees, and fans who want to understand the geometry behind VAR decisions.

## 🎯 Features

- **Perspective Calibration**: Draw reference lines on pitch markings to automatically calculate the vanishing point
- **Player Projection Tool**: Account for parallax by projecting elevated body parts (head, shoulder) to the ground plane
- **Offside Line Generation**: Create perspective-correct lines through the vanishing point
- **Smart Magnifier**: 4x zoom magnifier that activates during drawing, with edge detection for precise pixel selection
- **Undo/Redo**: Full history management with Ctrl+Z/Ctrl+Y support
- **Export Capabilities**:
  - Standard export with lines overlaid on original image
  - Extended export that includes vanishing point visualization even if outside frame
- **Bilingual Interface**: Complete English and Italian localization
- **Zero Installation**: Single HTML file - no build process, no dependencies, works offline

## 🚀 Quick Start

### Running Locally

Simply open `index.html` in any modern web browser:

```bash
# Option 1: Open directly
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows

# Option 2: Use local server (recommended)
python3 -m http.server 8000
# Navigate to http://localhost:8000
```

### Basic Workflow

1. **Load Image**: Click "Open Image" or drag & drop a match photo
2. **Draw Reference Lines**: Press `L`, draw 2-4 blue lines along horizontal pitch markings (penalty box, grass patterns)
3. **Verify Vanishing Point**: Check the green crosshair - it should align with the horizon
4. **Analyze Player Position**:
   - Press `Y`
   - Click the player's offside body part (e.g., shoulder)
   - Click where that point projects on the ground
   - An orange offside line is automatically generated
5. **Export**: Click "Export Image" to save your analysis

## 🛠️ Tools

| Tool | Shortcut | Description |
|------|----------|-------------|
| **Select** | `V` | Default mode - drag vanishing point or use arrow keys for precision |
| **Reference Line** | `L` | Draw blue lines on horizontal pitch markings (used for VP calculation) |
| **Offside Line** | `P` | Draw orange lines through the vanishing point |
| **Player Projection** | `Y` | Two-click tool: body part → ground point (creates cyan segment + offside line) |
| **Delete** | `D` | Click any line to remove it |
| **Pan** | `H` | Drag to navigate the image |

### Additional Shortcuts

- **Zoom**: Mouse wheel or `+`/`-` buttons
- **Undo/Redo**: `Ctrl+Z` / `Ctrl+Y`
- **Move VP**: Arrow keys (1px) or `Shift+Arrow` (10px) in Select mode
- **Temporary Pan**: Hold `Space` + drag
- **Cancel Drawing**: `Escape`
- **Help**: `F1`

## 📐 The Science Behind It

### What is a Vanishing Point?

In perspective photography, all parallel lines that recede into the distance converge at a single point called the **vanishing point**. For a soccer field:

- All horizontal pitch markings (penalty box, midfield line, touchlines) are parallel in reality
- In a perspective image, these lines converge to the VP
- The VP typically lies on the horizon line

### Why Player Projection Matters

**The Parallax Problem**: When a player is leaning forward, their head or shoulder is "ahead" of their feet, but offside is determined by the ground-level position.

**The Solution**: The Player Projection tool forces you to:
1. Mark the relevant body part (elevated point)
2. Mark where that point projects vertically to the ground
3. The tool then generates a perspective-correct offside line from the **ground point**

This ensures geometric accuracy that accounts for both perspective distortion and vertical displacement.

## 🎨 Technical Details

### Architecture

- **Single-file application**: All HTML, CSS, and JavaScript in `index.html`
- **No dependencies**: Vanilla JavaScript with Canvas API
- **Geometry engine**:
  - Lines stored as normalized equations `ax + by + c = 0`
  - Vanishing point calculated via least-squares fitting
  - Line-rectangle intersection for viewport clipping

### Browser Compatibility

Requires modern browser with:
- HTML5 Canvas
- ES6 JavaScript (arrow functions, template literals)
- CSS custom properties

Tested on: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## 🌍 Internationalization

The application includes full English and Italian translations. Switch languages using the toggle in the sidebar.

**Supported Languages:**
- 🇬🇧 English
- 🇮🇹 Italiano

## 📊 Use Cases

- **VAR Analysis**: Understand why controversial offside decisions were made
- **Coaching**: Teach players about positioning and perspective
- **Match Analysis**: Analyze attacking patterns and defensive lines
- **Education**: Learn about perspective geometry and vanishing points
- **Officiating**: Training tool for assistant referees

## 🤝 Contributing

This is an open-source project. Contributions are welcome!

### Development

No build process required. Edit `index.html` and refresh your browser.

Key code sections:
- **Lines 759-787**: Geometry engine
- **Lines 789-794**: Application state
- **Lines 839-970**: Rendering pipeline
- **Lines 975-1024**: Event handling

See `CLAUDE.md` for detailed architecture documentation.

## 📝 License

MIT License - feel free to use, modify, and distribute.

## 🙏 Credits

Built with ❤️ for the beautiful game.

Uses:
- Vanilla JavaScript & HTML5 Canvas
- Google Fonts (Montserrat, Inter)
- Geometric algorithms for perspective analysis

---

**Note**: This tool is for educational and analytical purposes. Official match decisions are made by qualified referees using professional VAR systems.
