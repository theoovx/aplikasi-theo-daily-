/* THEO v2.4 PATCH: streak, heatmap, border foto */
(function () {
  const S = () => (data.settings ||= {});
  const FX = [["", "Polos"], ["ring", "Cincin"], ["neon", "Neon"], ["rainbow", "Pelangi"], ["fire", "Api"]];
  let last = "";

  function flameCard() {
    const home = document.getElementById("homePage");
    let card = document.getElementById("streakCard");
    if (!home) return;
    if (S().hideStreak) { if (card) card.remove(); last = ""; return; }
    const n = dayStreak();
    const cells = lastDays(28).map(d => {
      const t = d.r.t || 0;
      return `<i class="hm l${t === 0 ? 0 : t < 3 ? 1 : t < 5 ? 2 : 3}" title="${d.key}"></i>`;
    }).join("");
    const html = `<div class="flame${n ? "" : " off"}">🔥</div><div class="sk-main"><b>${n} hari beruntun</b><small>28 hari terakhir</small></div><div class="hm-grid">${cells}</div>`;
    if (!card) {
      card = document.createElement("section");
      card.id = "streakCard";
      card.className = "streak-card";
      const h = home.querySelector(".top-header");
      h ? h.after(card) : home.prepend(card);
    }
    if (html !== last) { last = html; card.innerHTML = html; }
  }

  function buildSettings() {
    const row = document.querySelector("#settingsPage .avatar-row");
    if (!row || document.getElementById("fxRow")) return;
    const box = document.createElement("div");
    box.id = "fxRow";
    box.className = "fx-row";
    box.innerHTML = "<small>Border foto</small><div class=\"fx-chips\">" +
      FX.map(f => `<button type="button" class="mini-button" data-fx="${f[0]}">${f[1]}</button>`).join("") +
      "<button type=\"button\" class=\"mini-button\" id=\"streakToggle\"></button></div>";
    row.after(box);
    box.addEventListener("click", e => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.id === "streakToggle") S().hideStreak = !S().hideStreak;
      else S().avatarFx = b.dataset.fx;
      persist();
      paint();
    });
  }

  function paint() {
    buildSettings();
    document.querySelectorAll("#avatarPreview,.profile").forEach(el => {
      el.classList.remove("fx-ring", "fx-neon", "fx-rainbow", "fx-fire");
      if (S().avatarFx) el.classList.add("fx-" + S().avatarFx);
    });
    document.querySelectorAll("#fxRow [data-fx]").forEach(b => b.classList.toggle("on", b.dataset.fx === (S().avatarFx || "")));
    const t = document.getElementById("streakToggle");
    if (t) t.textContent = S().hideStreak ? "Streak: sembunyi" : "Streak: tampil";
    flameCard();
  }

  document.addEventListener("click", e => {
    if (e.target.closest(".task-item")) { try { navigator.vibrate && navigator.vibrate(15); } catch (_) { /* abaikan */ } }
  });

  paint();
  setInterval(paint, 2000);
})();
