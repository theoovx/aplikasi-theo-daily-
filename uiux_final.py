from pathlib import Path
from datetime import datetime
import re

HTML = Path("index.html")
CSS = Path("css/style.css")
JS = Path("js/app.js")

if not HTML.exists() or not CSS.exists() or not JS.exists():
    print("❌ Jalankan script dari ~/theo-daily")
    raise SystemExit(1)

# =========================================================
# BACKUP
# =========================================================

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

html = HTML.read_text(encoding="utf-8")
css = CSS.read_text(encoding="utf-8")

HTML.with_name(f"index.html.backup_{stamp}").write_text(
    html, encoding="utf-8"
)

CSS.with_name(f"style.css.backup_{stamp}").write_text(
    css, encoding="utf-8"
)

# =========================================================
# SAFETY CHECK
# =========================================================

required = [
    "homePage",
    "schedulePage",
    "progressPage",
    "moneyPage",
    "widgetsPage",
]

missing = [
    x for x in required
    if f'id="{x}"' not in html and f"id='{x}'" not in html
]

if missing:
    print("❌ PATCH DIBATALKAN")
    print("Page yang tidak ditemukan:")

    for x in missing:
        print(" -", x)

    print("\nTidak ada file yang diubah.")
    raise SystemExit(1)

# =========================================================
# HTML VERSION MARKER
# =========================================================

html = re.sub(
    r'\sdata-uiux-version=["\'][^"\']*["\']',
    "",
    html,
    count=1
)

html = html.replace(
    "<html",
    '<html data-uiux-version="stealth-final-v1"',
    1
)

# =========================================================
# ADD PAGE CLASSES
# =========================================================

page_classes = {
    "homePage": "page-home",
    "schedulePage": "page-schedule",
    "progressPage": "page-progress",
    "moneyPage": "page-money",
    "widgetsPage": "page-widgets",
    "habitsPage": "page-habits",
    "goalsPage": "page-goals",
    "groomingPage": "page-grooming",
    "focusPage": "page-focus",
    "timerPage": "page-timer",
    "reviewPage": "page-review",
    "backupPage": "page-backup",
}

for element_id, new_class in page_classes.items():

    pattern = re.compile(
        rf'(<[^>]+id=["\']{re.escape(element_id)}["\'][^>]*class=["\'])([^"\']*)(["\'])',
        re.I
    )

    def add_class(match, cls=new_class):
        classes = match.group(2).split()

        if cls not in classes:
            classes.append(cls)

        return (
            match.group(1)
            + " ".join(classes)
            + match.group(3)
        )

    html = pattern.sub(add_class, html, count=1)

# =========================================================
# MATERIAL SYMBOLS SHARP
# =========================================================

if "Material+Symbols+Sharp" not in html:

    font = """
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,300,0,0"
>
"""

    html = html.replace(
        "</head>",
        font + "\n</head>",
        1
    )

# =========================================================
# CSS HELPER
# =========================================================

def patch_css(start, end, content):

    global css

    pattern = re.compile(
        re.escape(start) +
        r".*?" +
        re.escape(end),
        re.DOTALL
    )

    block = (
        start
        + "\n"
        + content.strip()
        + "\n"
        + end
    )

    if pattern.search(css):
        css = pattern.sub(block, css, count=1)
    else:
        css += "\n\n" + block + "\n"

# =========================================================
# DESIGN TOKENS
# =========================================================

patch_css(
"/* === THEO STEALTH TOKENS START === */",
"/* === THEO STEALTH TOKENS END === */",
r"""
:root {
  --bg-main: #0D0E12;
  --bg-elevated: #14161D;

  --surface-glass: rgba(22, 25, 34, 0.72);
  --surface-glass-hover: rgba(30, 34, 46, 0.85);
  --surface-glass-active: rgba(38, 43, 58, 0.92);

  --surface-border: rgba(255,255,255,0.08);
  --surface-border-accent: rgba(255,90,0,0.35);

  --accent: #FF5A00;
  --accent-glow: rgba(255,90,0,0.16);
  --accent-subtle: rgba(255,90,0,0.08);
  --accent-hover: #FF7024;

  --text-primary: #FFFFFF;
  --text-secondary: #8C94A5;
  --text-muted: #525866;

  --font-display:
    'Space Grotesk',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;

  --font-body:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;

  --radius-sm: 12px;
  --radius-md: 18px;
  --radius-lg: 24px;
  --radius-pill: 9999px;

  --glass-blur: blur(20px) saturate(160%);

  --shadow-main:
    0 12px 32px rgba(0,0,0,0.45);

  --shadow-accent:
    0 8px 24px rgba(255,90,0,0.22);

  --transition-fast:
    0.15s cubic-bezier(0.16,1,0.3,1);

  --transition-smooth:
    0.25s cubic-bezier(0.16,1,0.3,1);
}
"""
)

# =========================================================
# GLOBAL
# =========================================================

patch_css(
"/* === THEO STEALTH GLOBAL START === */",
"/* === THEO STEALTH GLOBAL END === */",
r"""
html {
  background: var(--bg-main);
  color-scheme: dark;
}

body {
  margin: 0;
  min-height: 100vh;

  background:
    radial-gradient(
      circle at 50% -10%,
      rgba(255,90,0,0.045),
      transparent 38%
    ),
    var(--bg-main);

  color: var(--text-primary);

  font-family: var(--font-body);

  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.stealth-luxury-app {
  min-height: 100vh;
  background: transparent;
}

h1,
h2,
h3,
.text-display {
  font-family: var(--font-display);
  letter-spacing: -0.035em;
}

.material-symbols-sharp {
  font-family: 'Material Symbols Sharp';
  font-weight: normal;
  font-style: normal;

  font-size: 22px;
  line-height: 1;

  display: inline-block;

  white-space: nowrap;
  direction: ltr;

  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}

button,
input,
textarea,
select {
  font-family: inherit;
}

button {
  -webkit-tap-highlight-color: transparent;
}

button:active {
  transform: scale(0.97);
}

::selection {
  background: rgba(255,90,0,0.25);
}

::-webkit-scrollbar {
  width: 0;
  height: 0;
}
"""
)

# =========================================================
# GLASS
# =========================================================

patch_css(
"/* === THEO STEALTH GLASS START === */",
"/* === THEO STEALTH GLASS END === */",
r"""
.hero-focus-card,
.hero-balance-card,
.chart-card,
.progress-item-card,
.metric-tile,
.widget-card,
.event-card {
  background: var(--surface-glass);

  border: 1px solid var(--surface-border);

  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);

  box-shadow: var(--shadow-main);

  transition:
    transform var(--transition-fast),
    background var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.hero-focus-card:hover,
.hero-balance-card:hover,
.chart-card:hover,
.progress-item-card:hover,
.metric-tile:hover,
.widget-card:hover,
.event-card:hover {
  background: var(--surface-glass-hover);
  border-color: rgba(255,255,255,0.12);
}

.hero-focus-card,
.hero-balance-card {
  border-radius: var(--radius-lg);
}

.chart-card,
.progress-item-card,
.metric-tile,
.event-card,
.widget-card {
  border-radius: var(--radius-md);
}

.badge-accent,
.section-badge {
  color: var(--accent);

  background: var(--accent-subtle);

  border: 1px solid var(--surface-border-accent);

  border-radius: var(--radius-pill);

  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.btn-primary-accent {
  color: #fff;
  background: var(--accent);

  border: 0;
  border-radius: var(--radius-sm);

  box-shadow: var(--shadow-accent);

  transition:
    background var(--transition-fast),
    transform var(--transition-fast);
}

.btn-primary-accent:hover {
  background: var(--accent-hover);
}

.btn-ghost-glass,
.icon-btn-glass {
  color: var(--text-primary);

  background: var(--surface-glass);

  border: 1px solid var(--surface-border);
  border-radius: var(--radius-sm);

  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
}
"""
)

# =========================================================
# HOME
# =========================================================

patch_css(
"/* === THEO HOME FINAL START === */",
"/* === THEO HOME FINAL END === */",
r"""
.page-home {
  padding-bottom: 110px;
}

.page-home .home-hero {
  margin-bottom: 24px;
}

.page-home .hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.page-home .date-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;

  padding: 8px 11px;

  color: var(--text-secondary);

  background: rgba(255,255,255,0.035);

  border: 1px solid var(--surface-border);
  border-radius: var(--radius-pill);

  font-size: 12px;
}

.page-home .hero-greeting {
  margin-top: 24px;
}

.page-home .hero-greeting h1 {
  margin: 0;

  color: var(--text-primary);

  font-size: clamp(32px,9vw,46px);
  line-height: 1.02;
}

.page-home .hero-greeting p {
  margin: 10px 0 0;

  color: var(--text-secondary);

  font-size: 13px;
}

.page-home .hero-focus-card {
  position: relative;
  overflow: hidden;

  padding: 20px;

  border-color: var(--surface-border-accent);

  box-shadow:
    var(--shadow-main),
    var(--shadow-accent);
}

.page-home .hero-focus-card::before {
  content: "";

  position: absolute;
  inset: 0 0 auto;

  height: 2px;

  background:
    linear-gradient(
      90deg,
      transparent,
      var(--accent),
      transparent
    );
}

.page-home .focus-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-home .timer-display {
  color: var(--text-primary);

  font-family: var(--font-display);

  font-size: 20px;
  font-variant-numeric: tabular-nums;
}

.page-home .focus-title {
  margin: 18px 0 6px;

  color: var(--text-primary);

  font-family: var(--font-display);

  font-size: 19px;
}

.page-home .focus-subtitle {
  margin: 0;

  color: var(--text-secondary);

  font-size: 12px;
}

.page-home .focus-card-footer {
  display: flex;
  gap: 10px;

  margin-top: 20px;
}

.page-home .focus-card-footer .btn-primary-accent {
  flex: 1;
  min-height: 44px;
}

.page-home .section-group {
  margin-top: 28px;
}

.page-home .section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 12px;
}

.page-home .section-title {
  margin: 0;

  font-family: var(--font-display);
  font-size: 17px;
}

.page-home .section-link {
  color: var(--accent);

  font-size: 12px;
  font-weight: 600;

  text-decoration: none;
}

.page-home .metrics-grid {
  display: grid;

  grid-template-columns:
    repeat(2,minmax(0,1fr));

  gap: 10px;
}

.page-home .metric-tile {
  display: flex;
  align-items: center;
  gap: 12px;

  padding: 14px;
}

.page-home .tile-icon {
  display: grid;
  place-items: center;

  width: 38px;
  height: 38px;

  flex: 0 0 38px;

  color: var(--text-secondary);

  background: rgba(255,255,255,0.04);

  border-radius: 11px;
}

.page-home .tile-icon.accent {
  color: var(--accent);
  background: var(--accent-subtle);
}

.page-home .tile-info {
  min-width: 0;
}

.page-home .tile-label {
  display: block;

  color: var(--text-secondary);

  font-size: 11px;
}

.page-home .tile-value {
  display: block;

  margin-top: 4px;

  color: var(--text-primary);

  font-family: var(--font-display);

  font-size: 16px;
  font-weight: 600;
}
"""
)

# =========================================================
# SCHEDULE
# =========================================================

patch_css(
"/* === THEO SCHEDULE FINAL START === */",
"/* === THEO SCHEDULE FINAL END === */",
r"""
.page-schedule {
  padding-bottom: 110px;
}

.schedule-header .header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.schedule-header .text-display {
  margin: 0;
  font-size: 32px;
}

.schedule-header .text-secondary {
  margin: 6px 0 0;
  font-size: 13px;
}

.date-strip-wrapper {
  margin-top: 20px;
  overflow-x: auto;
  scrollbar-width: none;
}

.date-strip-wrapper::-webkit-scrollbar {
  display: none;
}

.date-strip {
  display: flex;
  gap: 8px;
  min-width: max-content;
}

.date-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-width: 52px;
  min-height: 68px;

  padding: 8px;

  color: var(--text-secondary);

  background: var(--surface-glass);

  border: 1px solid var(--surface-border);
  border-radius: 16px;
}

.date-card .day-name {
  font-size: 10px;
  font-weight: 600;
}

.date-card .day-num {
  margin-top: 4px;

  color: var(--text-primary);

  font-family: var(--font-display);

  font-size: 18px;
  font-weight: 600;
}

.date-card.active {
  color: #fff;
  background: var(--accent);
  border-color: var(--accent);
  box-shadow: var(--shadow-accent);
}

.date-card.active .day-num {
  color: #fff;
}

.category-filters {
  display: flex;
  gap: 8px;

  margin: 20px 0;

  overflow-x: auto;
  scrollbar-width: none;
}

.category-filters::-webkit-scrollbar {
  display: none;
}

.filter-chip {
  flex: 0 0 auto;

  padding: 8px 13px;

  color: var(--text-secondary);

  background: rgba(255,255,255,0.035);

  border: 1px solid var(--surface-border);
  border-radius: var(--radius-pill);

  font-size: 11px;
  font-weight: 600;
}

.filter-chip.active {
  color: #fff;

  background: var(--accent);
  border-color: var(--accent);

  box-shadow:
    0 5px 16px rgba(255,90,0,0.18);
}

.timeline-wrapper {
  position: relative;
}

.timeline-row {
  display: grid;

  grid-template-columns:
    48px 20px minmax(0,1fr);

  gap: 10px;

  position: relative;
}

.time-col {
  padding-top: 12px;

  color: var(--text-muted);

  font-family: var(--font-display);

  font-size: 11px;

  text-align: right;

  font-variant-numeric: tabular-nums;
}

.spine-col {
  position: relative;

  display: flex;
  justify-content: center;
}

.spine-line {
  position: absolute;

  top: 0;
  bottom: 0;

  width: 1px;

  background: rgba(255,255,255,0.08);
}

.spine-node {
  position: relative;
  z-index: 2;

  width: 8px;
  height: 8px;

  margin-top: 15px;

  background: var(--text-muted);

  border: 3px solid var(--bg-main);

  border-radius: 50%;
}

.timeline-row.active-now .spine-node,
.active-node {
  background: var(--accent);

  box-shadow:
    0 0 0 5px var(--accent-subtle),
    0 0 18px rgba(255,90,0,0.45);
}

.event-card-wrapper {
  padding-bottom: 14px;
}

.event-card {
  padding: 14px;
}

.timeline-row.active-now .event-card {
  border-color: var(--surface-border-accent);

  box-shadow:
    var(--shadow-main),
    0 0 24px rgba(255,90,0,0.08);
}

.event-header,
.event-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.event-category,
.event-duration,
.tag-subtle {
  color: var(--text-secondary);
  font-size: 10px;
}

.event-title {
  margin: 8px 0 5px;

  color: var(--text-primary);

  font-family: var(--font-display);

  font-size: 15px;
  font-weight: 600;
}

.event-desc {
  margin: 0;

  color: var(--text-secondary);

  font-size: 11px;
  line-height: 1.5;
}

.now-indicator-row {
  display: grid;

  grid-template-columns:
    48px 20px minmax(0,1fr);

  gap: 10px;

  align-items: center;

  margin: 3px 0 8px;
}

.now-time {
  color: var(--accent);

  font-family: var(--font-display);

  font-size: 10px;
  font-weight: 700;

  text-align: right;
}

.now-line-container {
  grid-column: 2 / 4;

  display: flex;
  align-items: center;

  position: relative;
}

.now-line {
  width: 100%;
  height: 1px;

  background: var(--accent);
}

.now-dot {
  position: absolute;
  left: 0;

  width: 7px;
  height: 7px;

  background: var(--accent);

  border-radius: 50%;

  box-shadow:
    0 0 10px rgba(255,90,0,0.6);
}
"""
)

# =========================================================
# PROGRESS
# =========================================================

patch_css(
"/* === THEO PROGRESS FINAL START === */",
"/* === THEO PROGRESS FINAL END === */",
r"""
.page-progress {
  padding-bottom: 110px;
}

.progress-header .header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.progress-header .text-display {
  margin: 0;
  font-size: 32px;
}

.period-filters {
  display: flex;
  gap: 8px;
  margin-top: 20px;
}

.hero-score-card {
  margin-top: 20px;

  padding: 20px;

  background: var(--surface-glass);

  border: 1px solid var(--surface-border);

  border-radius: var(--radius-lg);

  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);

  box-shadow: var(--shadow-main);
}

.score-main {
  display: flex;
  align-items: center;
  gap: 20px;
}

.score-ring-wrapper {
  position: relative;

  flex: 0 0 112px;

  width: 112px;
  height: 112px;
}

.score-ring {
  width: 100%;
  height: 100%;

  transform: rotate(-90deg);
}

.score-ring circle {
  fill: none;
  stroke-width: 7;
}

.ring-bg {
  stroke: rgba(255,255,255,0.06);
}

.ring-fill {
  stroke: var(--accent);

  stroke-linecap: round;

  stroke-dasharray: 263.9;

  filter:
    drop-shadow(
      0 0 5px rgba(255,90,0,0.35)
    );
}

.ring-content {
  position: absolute;
  inset: 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-value {
  color: var(--text-primary);

  font-family: var(--font-display);

  font-size: 23px;
  font-weight: 700;
}

.score-label {
  color: var(--text-muted);

  font-size: 9px;
  text-transform: uppercase;
}

.score-title {
  margin: 10px 0 6px;

  font-family: var(--font-display);

  font-size: 17px;
}

.score-desc {
  margin: 0;

  color: var(--text-secondary);

  font-size: 11px;
  line-height: 1.5;
}

.chart-card {
  padding: 18px 14px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  gap: 8px;

  height: 170px;
}

.chart-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;

  height: 100%;
  flex: 1;
}

.bar-wrapper {
  display: flex;
  align-items: flex-end;

  width: 100%;
  max-width: 22px;
  height: 135px;

  overflow: hidden;

  background: rgba(255,255,255,0.035);

  border-radius: 8px;
}

.bar-fill {
  width: 100%;
  min-height: 3px;

  background: rgba(255,255,255,0.14);

  border-radius: 7px 7px 3px 3px;
}

.chart-col.active .bar-fill {
  background: var(--accent);

  box-shadow:
    0 0 14px rgba(255,90,0,0.28);
}

.day-label {
  margin-top: 9px;

  color: var(--text-muted);

  font-size: 10px;
}

.chart-col.active .day-label {
  color: var(--accent);
  font-weight: 700;
}

.progress-list {
  display: grid;
  gap: 10px;
}

.progress-item-card {
  padding: 14px;
}

.progress-track {
  height: 5px;

  margin-top: 12px;

  overflow: hidden;

  background: rgba(255,255,255,0.06);

  border-radius: var(--radius-pill);
}

.progress-fill {
  height: 100%;

  background: var(--text-secondary);

  border-radius: inherit;
}

.progress-fill.accent-glow {
  background: var(--accent);

  box-shadow:
    0 0 10px rgba(255,90,0,0.3);
}
"""
)

# =========================================================
# MOBILE
# =========================================================

patch_css(
"/* === THEO MOBILE FINAL START === */",
"/* === THEO MOBILE FINAL END === */",
r"""
@media (max-width: 480px) {

  .score-main {
    gap: 14px;
  }

  .score-ring-wrapper {
    flex-basis: 96px;

    width: 96px;
    height: 96px;
  }

  .score-value {
    font-size: 20px;
  }

  .timeline-row,
  .now-indicator-row {
    grid-template-columns:
      42px 18px minmax(0,1fr);

    gap: 8px;
  }

}

@media (prefers-reduced-motion: reduce) {

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

}
"""
)

# =========================================================
# WRITE
# =========================================================

HTML.write_text(html, encoding="utf-8")
CSS.write_text(css, encoding="utf-8")

print("")
print("==========================================")
print("✅ THEO DAILY UI/UX FINAL PATCH BERES")
print("==========================================")
print("✓ index.html aman")
print("✓ app.js TIDAK disentuh")
print("✓ Home dipertahankan")
print("✓ Schedule dipertahankan")
print("✓ Progress dipertahankan")
print("✓ Money dipertahankan")
print("✓ Widgets dipertahankan")
print("✓ ID existing tidak dihapus")
print("✓ Stealth Luxury Dark Glass diterapkan")
print("✓ Backup otomatis dibuat")
print("==========================================")
