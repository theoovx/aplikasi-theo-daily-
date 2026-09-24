from pathlib import Path
import re
from datetime import datetime

ROOT = Path.home() / "theo-daily"
HTML = ROOT / "index.html"
CSS = ROOT / "css" / "style.css"

html = HTML.read_text()
css = CSS.read_text()

# Backup sekali per eksekusi
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
HTML.with_name(f"index.html.bak_{stamp}").write_text(html)
CSS.with_name(f"style.css.bak_{stamp}").write_text(css)

# Google Fonts + Material Symbols Sharp
if "fonts.googleapis.com/css2?family=Space+Grotesk" not in html:
    injection = """
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,500,0,0" rel="stylesheet">
"""
    html = html.replace("</head>", injection + "\n</head>", 1)

# Ganti bottom navigation lama menjadi 5 menu
new_nav = """<nav class="bottom-nav">
  <button class="nav-item active" data-page="home" type="button">
    <span class="material-symbols-sharp">home</span>
    <span>Today</span>
  </button>

  <button class="nav-item" data-page="schedule" type="button">
    <span class="material-symbols-sharp">calendar_month</span>
    <span>Schedule</span>
  </button>

  <button class="nav-item" data-page="progress" type="button">
    <span class="material-symbols-sharp">monitoring</span>
    <span>Progress</span>
  </button>

  <button class="nav-item" data-page="money" type="button">
    <span class="material-symbols-sharp">account_balance_wallet</span>
    <span>Money</span>
  </button>

  <button class="nav-item" data-page="widgets" type="button">
    <span class="material-symbols-sharp">widgets</span>
    <span>Widgets</span>
  </button>
</nav>"""

html, nav_count = re.subn(
    r'<nav\s+class=["\']bottom-nav["\']>.*?</nav>',
    new_nav,
    html,
    count=1,
    flags=re.S
)

if nav_count == 0:
    raise SystemExit("ERROR: bottom-nav tidak ditemukan.")

# Tambahkan Widgets Hub sebelum bottom nav
if 'id="widgetsPage"' not in html:
    widgets_page = """
<section class="page" id="widgetsPage" data-page-section="widgets" hidden>
  <div class="page-header">
    <div>
      <span class="eyebrow">TOOLS</span>
      <h1>Widgets</h1>
      <p>Quick access to your daily tools.</p>
    </div>
  </div>

  <div class="widgets-grid">
    <button class="widget-card" data-open-page="habits" type="button">
      <span class="material-symbols-sharp">check_circle</span>
      <strong>Habits</strong>
      <small>Track your routines</small>
    </button>

    <button class="widget-card" data-open-page="goals" type="button">
      <span class="material-symbols-sharp">flag</span>
      <strong>Goals</strong>
      <small>Keep your targets visible</small>
    </button>

    <button class="widget-card" data-open-page="grooming" type="button">
      <span class="material-symbols-sharp">face</span>
      <strong>Grooming</strong>
      <small>Personal care routine</small>
    </button>

    <button class="widget-card" data-open-page="focus" type="button">
      <span class="material-symbols-sharp">center_focus_strong</span>
      <strong>Focus Mode</strong>
      <small>Cut the distractions</small>
    </button>

    <button class="widget-card" data-open-page="timer" type="button">
      <span class="material-symbols-sharp">timer</span>
      <strong>Timer</strong>
      <small>Simple countdown</small>
    </button>

    <button class="widget-card" data-open-page="review" type="button">
      <span class="material-symbols-sharp">rate_review</span>
      <strong>Review</strong>
      <small>Reflect on your day</small>
    </button>

    <button class="widget-card" data-open-page="backup" type="button">
      <span class="material-symbols-sharp">backup</span>
      <strong>Backup</strong>
      <small>Protect your data</small>
    </button>
  </div>
</section>
"""
    html = html.replace('<nav class="bottom-nav">', widgets_page + '\n<nav class="bottom-nav">', 1)

# CSS redesign block, ditandai supaya idempotent
START = "/* === THEO STEALTH GLASS REDESIGN === */"
END = "/* === END THEO STEALTH GLASS REDESIGN === */"

redesign = f"""
{START}

:root {{
  --bg: #0D0E12;
  --glass: rgba(22,25,35,.65);
  --glass-strong: rgba(22,25,35,.82);
  --border: rgba(255,255,255,.08);
  --text: #FFFFFF;
  --muted: #8C94A5;
  --accent: #FF5A00;
}}

html, body {{
  background: var(--bg) !important;
  color: var(--text);
  font-family: "Inter", sans-serif;
}}

body {{
  background:
    radial-gradient(circle at 15% 10%, rgba(255,90,0,.08), transparent 28%),
    radial-gradient(circle at 90% 75%, rgba(255,90,0,.045), transparent 25%),
    var(--bg) !important;
}}

h1, h2, h3, .page-title, .stat-value {{
  font-family: "Space Grotesk", sans-serif !important;
}}

.page {{
  position: relative;
}}

.card,
.task-card,
.stat-card,
.widget-card,
.modal-content,
.panel {{
  background: var(--glass) !important;
  border: 1px solid var(--border) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px !important;
}}

button {{
  font-family: "Inter", sans-serif;
}}

.bottom-nav {{
  position: fixed !important;
  left: 14px !important;
  right: 14px !important;
  bottom: 14px !important;
  width: auto !important;
  min-height: 68px;
  padding: 8px !important;
  display: grid !important;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  background: rgba(18,20,27,.82) !important;
  border: 1px solid rgba(255,255,255,.09) !important;
  border-radius: 22px !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 16px 45px rgba(0,0,0,.42);
  z-index: 9999;
}}

.bottom-nav .nav-item {{
  min-width: 0;
  border: 0 !important;
  background: transparent !important;
  color: var(--muted) !important;
  border-radius: 15px !important;
  display: flex !important;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-size: 10px;
  transition: .18s ease;
}}

.bottom-nav .nav-item .material-symbols-sharp {{
  font-size: 22px;
}}

.bottom-nav .nav-item.active {{
  color: var(--accent) !important;
  background: rgba(255,90,0,.08) !important;
  text-shadow: 0 0 14px rgba(255,90,0,.45);
}}

.bottom-nav .nav-item:active {{
  transform: scale(.96);
}}

.widgets-grid {{
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}}

.widget-card {{
  min-height: 145px;
  padding: 18px !important;
  text-align: left;
  color: var(--text) !important;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 5px;
  cursor: pointer;
  transition: transform .16s ease, border-color .16s ease;
}}

.widget-card .material-symbols-sharp {{
  color: var(--accent);
  font-size: 28px;
  margin-bottom: auto;
}}

.widget-card strong {{
  font-family: "Space Grotesk", sans-serif;
  font-size: 16px;
}}

.widget-card small {{
  color: var(--muted);
  font-size: 11px;
}}

.widget-card:active {{
  transform: scale(.985);
}}

.page-header {{
  margin-bottom: 18px;
}}

.eyebrow {{
  color: var(--accent);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .14em;
}}

.page-header h1 {{
  margin: 4px 0;
}}

.page-header p {{
  color: var(--muted);
}}

@media (max-width: 380px) {{
  .bottom-nav {{
    left: 9px !important;
    right: 9px !important;
  }}

  .widget-card {{
    min-height: 130px;
    padding: 14px !important;
  }}
}}

{END}
"""

# Hapus redesign lama jika pernah dijalankan
css = re.sub(
    re.escape(START) + r".*?" + re.escape(END),
    "",
    css,
    flags=re.S
).rstrip()

css += "\n\n" + redesign.strip() + "\n"

HTML.write_text(html)
CSS.write_text(css)

print("DONE")
print(f"HTML: {HTML}")
print(f"CSS : {CSS}")
print("Widgets page:", "widgetsPage" in html)
print("5-nav:", nav_count == 1)
