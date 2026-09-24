from pathlib import Path
import re

ROOT = Path(".")
HTML = ROOT / "index.html"
CSS = ROOT / "css/style.css"
JS = ROOT / "js/app.js"

html = HTML.read_text()
css = CSS.read_text()
js = JS.read_text()

# =========================================================
# 1. WIDGET NAVIGATION
# =========================================================

marker = "/* === THEO WIDGET NAV === */"

if marker not in js:
    js += r'''

/* === THEO WIDGET NAV === */
document.querySelectorAll(".widget-card[data-page]").forEach(card => {
  card.addEventListener("click", () => {
    const page = card.dataset.page;
    const target = document.getElementById(`${page}Page`);

    if (!target) {
      console.error("Widget page tidak ditemukan:", `${page}Page`);
      return;
    }

    document.querySelectorAll(".page").forEach(section => {
      section.hidden = true;
    });

    target.hidden = false;

    card.classList.add("widget-card-pressed");
    setTimeout(() => card.classList.remove("widget-card-pressed"), 160);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    if (page === "schedule") renderSchedule();
    if (page === "progress") updateProgressPage();
    if (page === "habits") renderHabits();
    if (page === "goals") renderGoals();
    if (page === "money") renderMoney();
    if (page === "grooming") renderGrooming();
    if (page === "focus") suggestActivity();
    if (page === "review") setupReview();
    if (page === "timer") updateTimerDisplay();
  });
});
'''

# =========================================================
# 2. POLISH CSS
# =========================================================

css_marker = "/* === THEO UI POLISH V2 === */"

if css_marker not in css:
    css += r'''

/* =========================================================
   THEO UI POLISH V2
========================================================= */

:root {
  --ui-bg: #0D0E12;
  --ui-card: rgba(22, 25, 35, 0.68);
  --ui-card-soft: rgba(22, 25, 35, 0.48);
  --ui-border: rgba(255, 255, 255, 0.08);
  --ui-border-soft: rgba(255, 255, 255, 0.05);
  --ui-text: #FFFFFF;
  --ui-muted: #8C94A5;
  --ui-accent: #FF5A00;
}

/* ---------- GLOBAL ---------- */

html {
  background: var(--ui-bg);
}

body {
  background:
    radial-gradient(
      circle at 85% 5%,
      rgba(255, 90, 0, 0.055),
      transparent 30%
    ),
    radial-gradient(
      circle at 10% 45%,
      rgba(255, 255, 255, 0.025),
      transparent 28%
    ),
    var(--ui-bg) !important;
  color: var(--ui-text);
}

.page {
  min-height: calc(100vh - 100px) !important;
}

.content {
  width: min(100%, 620px) !important;
  margin-inline: auto !important;
  padding: 20px 16px 125px !important;
}

/* ---------- HEADER ---------- */

.top-header {
  width: min(100%, 620px);
  margin-inline: auto;
  padding: 24px 16px 8px;
  box-sizing: border-box;
}

.greeting {
  color: var(--ui-muted);
  font-size: 13px;
  margin-bottom: 4px;
}

.top-header h1 {
  margin: 0;
  letter-spacing: -0.035em;
}

/* ---------- CARDS ---------- */

.card,
.suggestion-card,
.widget-card,
.overview-item {
  background: var(--ui-card) !important;
  border: 1px solid var(--ui-border) !important;
  box-shadow:
    0 12px 35px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.025) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.card {
  border-radius: 18px !important;
  margin-bottom: 14px;
}

.card-header {
  gap: 14px;
}

.label {
  color: var(--ui-muted) !important;
  letter-spacing: 0.08em;
  font-size: 10px;
  font-weight: 600;
}

/* ---------- DAILY OVERVIEW ---------- */

.daily-overview {
  padding: 18px !important;
}

.overview-grid {
  gap: 8px !important;
}

.overview-item {
  min-width: 0;
  border-radius: 14px !important;
  padding: 14px 10px !important;
}

.overview-item strong {
  font-family: "Space Grotesk", sans-serif;
  font-size: 22px;
}

/* ---------- SECTION TITLES ---------- */

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.section-title h2 {
  margin: 0;
  letter-spacing: -0.025em;
}

/* ---------- WIDGETS ---------- */

#widgetsPage .content {
  padding-top: 18px !important;
}

#widgetsPage .section-title {
  margin-bottom: 16px;
}

.widgets-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.widget-card {
  position: relative;
  min-width: 0;
  min-height: 132px;
  padding: 17px !important;
  border-radius: 18px !important;
  text-align: left;
  color: var(--ui-text);
  cursor: pointer;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease;
}

.widget-card::after {
  content: "";
  position: absolute;
  width: 80px;
  height: 80px;
  right: -30px;
  bottom: -35px;
  background: rgba(255, 90, 0, 0.08);
  border-radius: 50%;
  filter: blur(15px);
  pointer-events: none;
}

.widget-card:active,
.widget-card-pressed {
  transform: scale(0.97) !important;
  background: rgba(30, 33, 43, 0.78) !important;
}

.widget-card .material-symbols-sharp {
  color: var(--ui-accent);
  font-size: 25px;
  margin-bottom: 13px;
}

.widget-card h3,
.widget-card strong {
  font-family: "Space Grotesk", sans-serif;
  margin: 0;
  letter-spacing: -0.02em;
}

.widget-card p {
  color: var(--ui-muted);
  font-size: 12px;
  line-height: 1.45;
  margin-top: 5px;
}

/* ---------- PROGRESS ---------- */

.progress-bar {
  overflow: hidden;
  border-radius: 999px !important;
  background: rgba(255,255,255,0.07) !important;
}

#progressFill {
  background: linear-gradient(
    90deg,
    #FF5A00,
    #FF7A30
  ) !important;
  border-radius: inherit;
}

/* ---------- BUTTONS ---------- */

button {
  -webkit-tap-highlight-color: transparent;
}

button:active {
  transform: scale(0.98);
}

/* ---------- MOBILE ---------- */

@media (max-width: 600px) {
  .content {
    padding-left: 14px !important;
    padding-right: 14px !important;
  }

  .top-header {
    padding-left: 14px;
    padding-right: 14px;
  }

  .card {
    margin-bottom: 12px;
  }

  .widgets-grid {
    gap: 10px;
  }

  .widget-card {
    min-height: 124px;
    padding: 15px !important;
  }
}

@media (max-width: 380px) {
  .widgets-grid {
    gap: 8px;
  }

  .widget-card {
    min-height: 116px;
    padding: 13px !important;
  }
}

/* ---------- REDUCE MOTION ---------- */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition: none !important;
    animation: none !important;
  }
}

'''

# =========================================================
# 3. WRITE
# =========================================================

JS.write_text(js)
CSS.write_text(css)

print("================================")
print("THEO DAILY UI POLISH COMPLETE")
print("Widgets navigation : OK")
print("Glass cards        : OK")
print("Spacing             : OK")
print("Widgets grid        : OK")
print("Mobile polish       : OK")
print("================================")
