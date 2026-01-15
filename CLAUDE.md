# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Offside Calculator Pro is a single-file web application for analyzing offside positions in soccer/football using perspective geometry and vanishing point calculations. The application allows users to:

1. Load match images and draw reference lines along pitch markings
2. Automatically calculate the vanishing point from parallel horizontal lines
3. Project player positions to the pitch surface accounting for perspective
4. Generate offside lines and export annotated images

The entire application is self-contained in `index.html` with embedded CSS and JavaScript.

## Development

### Running the Application

This is a static HTML file with no build process:

```bash
# Option 1: Open directly in browser
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows

# Option 2: Use a local server (recommended for testing)
python3 -m http.server 8000
# Then navigate to http://localhost:8000

# Option 3: Use any other static file server
npx serve .
```

### File Structure

The application is a monolithic single-file architecture:

- **Lines 1-575**: HTML structure and embedded CSS styling
- **Lines 576-711**: HTML UI elements (header, toolbar, canvas, sidebar, modals)
- **Lines 712-1079**: JavaScript application logic

## Architecture

### Core Components

**Geometry Engine** (lines 759-787)

The geometry module implements perspective line calculations:

- `createLine(p1, p2)`: Creates normalized line equation `ax + by + c = 0` where `a² + b² = 1`
- `intersect(l1, l2)`: Computes intersection point of two lines using determinant method
- `bestFit(lines)`: Least-squares vanishing point calculation from 2+ lines
  - With 2 lines: direct intersection
  - With 3+ lines: solves overdetermined system minimizing distance sum
- `lineRect(line, rect)`: Clips infinite line to rectangle bounds for rendering
- `distSq(a, b)`: Distance squared utility

**Application State** (lines 789-794)

Global state management:

- `image`: Loaded image object
- `imageSize`: Image dimensions `{width, height}`
- `lines[]`: Array of line objects with structure:
  - `id`: Unique timestamp identifier
  - `geo`: Line geometry object `{a, b, c, p1, p2}`
  - `color`: Hex color string
  - `isVP`: Boolean - true for offside lines (orange), false for reference lines (blue)
  - `isPlumb`: Boolean - true for player projection segments (cyan)
  - `srcPt`: Anchor point for VP-generated lines
- `vpPos`: Vanishing point coordinates `{x, y}` or null
- `vpManual`: Boolean indicating if VP was manually adjusted
- `view`: Viewport transform `{x, y, scale}` for pan/zoom
- `history[]`: Undo/redo stack storing serialized line states

**Coordinate Systems**

- **Image coordinates**: Origin at top-left of loaded image (0,0 to width,height)
- **Canvas coordinates**: Screen-space coordinates accounting for pan/zoom transform
- **Conversion**: `toCanvas(screenX, screenY)` transforms screen → image coordinates

**Tools System** (lines 975-1002)

Five drawing tools modify behavior of mouse events:

1. `select`: Default mode, allows VP dragging and line selection
2. `draw`: Draw blue reference lines (2 clicks) for VP calculation
3. `vpLine`: Draw orange offside lines from VP (1 click)
4. `player`: Draw cyan projection segment (2 clicks: body part → ground), auto-generates offside line
5. `delete`: Click to delete lines
6. `pan`: Drag to pan viewport

Tool state stored in `tool` variable; keyboard shortcuts (v/l/p/y/d/h) switch tools.

**Rendering Pipeline** (lines 839-970)

The `render()` function executes on every state change:

1. Clear canvas and apply viewport transform
2. Draw loaded image
3. Render lines (infinite lines clipped to extended viewport bounds)
   - Reference lines (blue, solid): `!isVP && !isPlumb`
   - Offside lines (orange, dashed): `isVP`
   - Player projection segments (cyan, dotted): `isPlumb` - renders as finite segment, not infinite line
4. Draw temporary preview during interaction
5. Render vanishing point crosshair (green circle with crosshairs)
6. Draw magnifier overlay when using drawing tools (140px, 4x zoom)

**Magnifier Logic** (lines 931-968)

Smart magnifier activates during line drawing:
- 140px square, 4x zoom factor
- Auto-positions to avoid cursor obstruction
- Allows viewing outside image borders for edge pixel selection
- Red crosshair marks center point

**Event Handling**

Mouse events (lines 975-1006):
- `mousedown`: Initiates drawing, deletion, selection, or VP dragging
- `mousemove`: Updates preview, drags VP, or pans viewport
- `mouseup`: Finalizes drag operations, saves to history
- `wheel`: Zoom in/out centered on cursor position

Keyboard shortcuts (lines 1007-1024):
- `v/l/p/y/d/h`: Switch tools
- `Ctrl+Z/Y`: Undo/redo
- `Delete`: Remove selected line
- `Arrow keys`: Move VP by 1px (Shift: 10px)
- `Space`: Temporary pan mode
- `Escape`: Cancel drawing, return to select
- `F1`: Open help modal

**Internationalization** (lines 713-757)

Two-language support (English/Italian):
- `i18n` object stores all translations
- `t(key)` retrieves translated string
- `setLang(lang)` switches language, updates all `[data-i18n]` elements

**Export Functionality** (lines 1036-1064)

Two export modes:
1. `exportImg(false)`: Export image with lines at original dimensions
2. `exportImg(true)`: Export extended canvas including VP if outside image bounds

Both create offscreen canvas, redraw all elements, trigger PNG download.

### Key Implementation Details

**Vanishing Point Calculation**

The VP represents the horizon convergence point in perspective. All horizontal lines on the pitch (penalty box, midfield line, grass patterns) should intersect at this point.

- Reference lines (`isVP=false, isPlumb=false`) are used for VP calculation
- VP automatically recalculates when reference lines added/removed (unless manually moved)
- Manual VP adjustment: drag with mouse or arrow keys, sets `vpManual=true` to prevent auto-recalc

**Player Projection Tool**

The "Player" tool (Y key) solves the parallax problem:
1. First click: Player's offside body part (head/shoulder)
2. Second click: Ground point directly below
3. Creates cyan dotted segment showing vertical projection
4. Auto-generates orange offside line from ground point through VP

This ensures offside lines represent ground-level positions, not elevated body parts.

**Line Rendering Types**

Lines are stored as infinite algebraic equations but rendered differently:

- **Infinite lines** (reference & offside): Clipped to extended viewport rectangle using `lineRect()`
- **Finite segments** (player projection): Rendered directly from `p1` to `p2` without clipping

Extended viewport bounds (viewport + 200px margin) ensure smooth line appearance during pan/zoom.

**History/Undo System**

- History stores serialized JSON snapshots of `lines[]` array
- Each modification triggers `saveHistory()` (adds snapshot, increments index)
- Undo/redo navigates history array, recalculates VP unless manual
- Limited to available memory (no explicit cap)

## Common Patterns

### Adding a New Tool

1. Add tool button in toolbar HTML (line ~594-613)
2. Add keyboard shortcut in keydown handler (line ~1007-1022)
3. Implement mouse interaction logic in mousedown handler (line ~975-1002)
4. Add status text to `updateStatus()` mapping (line ~817-825)
5. Add cursor style to cursor mapping (line ~837)
6. Update tool preview rendering if needed (line ~886-917)

### Modifying Line Appearance

Line styles are set during rendering (line ~874-881):
- `ctx.strokeStyle`: Color from `line.color`
- `ctx.lineWidth`: Thickness (selected lines are thicker)
- `ctx.setLineDash()`: Solid `[]` or dashed `[12/scale, 6/scale]`
- `ctx.shadowBlur`: Glow effect

### Adding UI Elements

The UI uses CSS custom properties (line 9-24) for theming. Key colors:
- `--primary` (#00ff87): Main accent (green)
- `--accent` (#f97316): Offside lines (orange)
- `--cyan` (#22d3ee): Player projection (cyan)
- `--secondary` (#7c3aed): Secondary accent (purple)

All UI text should include `data-i18n` attributes for translation support.
