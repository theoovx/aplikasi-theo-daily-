from pathlib import Path
import re

html = Path("index.html")
js = Path("js/app.js")

h = html.read_text()
j = js.read_text()

# Hapus onclick dari widget
h = re.sub(r'\s+onclick="openWidgetPage\(\'[a-z]+\'\)"', '', h)

# Hapus fungsi openWidgetPage lama
j = re.sub(
    r'\n/\* === THEO WIDGET DIRECT CLICK === \*/.*?(?=\n/\* === WIDGET CLICK DELEGATION FIX === \*/)',
    '',
    j,
    flags=re.S
)

# Hapus delegation lama
j = re.sub(
    r'\n/\* === WIDGET CLICK DELEGATION FIX === \*/.*$',
    '',
    j,
    flags=re.S
)

# Tambahkan listener yang dijalankan setelah DOM siap
j += r'''

/* === THEO WIDGET NAV FINAL === */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".widget-card[data-page]").forEach(card => {
    card.addEventListener("click", () => {
      const page = card.dataset.page;
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
    });
  });
});
'''

html.write_text(h)
js.write_text(j)

print("================================")
print("WIDGET NAV FINAL FIX : DONE")
print("onclick removed      : OK")
print("old handlers removed : OK")
print("DOMContentLoaded     : OK")
print("================================")
