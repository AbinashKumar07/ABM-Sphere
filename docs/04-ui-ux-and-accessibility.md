# UI/UX Specification & Accessibility

## 1. Design Tokens & Themes
ABM Sphere defines CSS custom properties on `:root` and `[data-theme="dark" | "light" | "purple" | "blue"]`:
- **Typography**: `--font` (`Poppins`, sans-serif), `--font-mono` (`JetBrains Mono`, monospace).
- **Radii**: `--radius-pill` (`999px`), `--radius-box` (`20px`), `--radius-sm` (`10px`).
- **Surface & Contrast**: `--bg-color`, `--bg-mesh`, `--text-main`, `--text-muted`, `--accent`, `--accent-alt`, `--glass-bg`, `--glass-border`, `--card-bg`.

## 2. Responsive Breakpoints
- Desktop & Tablet (`> 900px`): Two-column upload grid and split-screen review viewer (`2.8fr 1.2fr` body).
- Mobile (`<= 900px`): Stacked single-column popup layout, compact top navigation, and full-width controls.

## 3. Accessibility (WCAG 2.2 AA)
- **Skip Navigation**: `.skip-link` jumps keyboard users directly to `<main id="main-content">`.
- **Landmarks**: Semantic `<nav>`, `<main>`, `<section>`, and `<footer>` elements.
- **Keyboard Focus**: Visible `:focus-visible` outline (`2px solid var(--accent-alt)`) across interactive elements; `Escape` closes active modals.
- **Reduced Motion**: `@media (prefers-reduced-motion: reduce)` disables CSS transitions/animations and `FuturisticArtManager` pauses background canvas loops when reduced motion is preferred.
