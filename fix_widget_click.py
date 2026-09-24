from pathlib import Path

css = Path("css/style.css")
js = Path("js/app.js")

c = css.read_text()
j = js.read_text()

# CSS: pastikan widget dan seluruh isinya menerima klik
marker = "/* === WIDGET CLICK FORCE FIX === */"

if marker not in c:
    c += r'''

/* === WIDGET CLICK FORCE FIX === */

.widget-card {
  position: relative !important;
  pointer-events: auto !important;
  touch-action: manipulation !important;
  cursor: pointer !important;
  z-index: 10 !important;
}

.widget-card *,
.widget-card .material-symbols-sharp {
  pointer-events: none !important;
}

.widget-card::before,
.widget-card::after {
  pointer-events: none !important;
}
'''

# JS: event delegation dari document, jadi klik icon/text juga pasti ketangkap
marker_js = "/* === WIDGET CLICK DELEGATION FIX === */"

if marker_js not in j:
    j += r'''

/* === WIDGET CLICK DELEGATION FIX === */
document.addEventListener("click", function(e) {
  const card = e.target.closest(".widget-card[data-page]");

  if (!card) return;

  e.preventDefault();
  e.stopPropagation();

  const page = card.dataset.page;
  const target = document.getElementById(page + "Page");

  if (!target) {
    console.error("Widget target tidak ditemukan:", page + "Page");
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
}, true);
'''

css.write_text(c)
js.write_text(j)

print("WIDGET CLICK FORCE FIX : DONE")
