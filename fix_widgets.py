from pathlib import Path
import re

HTML = Path("index.html")
JS = Path("js/app.js")

html = HTML.read_text()
js = JS.read_text()

# 1. Tambahkan onclick langsung ke semua widget-card
pages = [
    "habits",
    "goals",
    "grooming",
    "focus",
    "timer",
    "review",
    "backup"
]

for page in pages:
    pattern = rf'(<button\b[^>]*class="widget-card"[^>]*data-page="{page}"[^>]*)>'
    replacement = rf'\1 onclick="openWidgetPage(\'{page}\')">'
    html = re.sub(pattern, replacement, html, count=1)

# 2. Tambahkan fungsi global sekali saja
marker = "/* === THEO WIDGET DIRECT CLICK === */"

if marker not in js:
    js += r'''

/* === THEO WIDGET DIRECT CLICK === */
window.openWidgetPage = function(page) {
  const target = document.getElementById(page + "Page");

  if (!target) {
    console.error("Widget page tidak ditemukan:", page + "Page");
    return;
  }

  document.querySelectorAll(".page").forEach(section => {
    section.hidden = true;
  });

  target.hidden = false;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  if (page === "habits" && typeof renderHabits === "function") renderHabits();
  if (page === "goals" && typeof renderGoals === "function") renderGoals();
  if (page === "grooming" && typeof renderGrooming === "function") renderGrooming();
  if (page === "focus" && typeof suggestActivity === "function") suggestActivity();
  if (page === "timer" && typeof updateTimerDisplay === "function") updateTimerDisplay();
  if (page === "review" && typeof setupReview === "function") setupReview();
};
'''

HTML.write_text(html)
JS.write_text(js)

print("================================")
print("WIDGET DIRECT CLICK : FIXED")
print("onclick              : ADDED")
print("global function      : ADDED")
print("================================")
