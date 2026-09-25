/* THEO v3.2 PATCH: perbaiki scroll, border cuma di foto profil, badges & statistik baru */
(function () {
  const S = () => (data.settings ||= {});
  const H = id => document.getElementById(id);
  const SYM = { "🔥": "✦", "🌋": "✶", "✅": "✓", "🏆": "✪", "⭐": "◆", "👑": "♛", "📸": "◎" };
  const st = document.createElement("style");
  st.textContent = `
/* --- perbaiki scroll yang macet --- */
html,body{overscroll-behavior:auto!important;-webkit-user-select:auto!important;user-select:auto!important;-webkit-touch-callout:default!important}

/* --- border cuma di foto profil, bukan tombol pojok --- */
.profile:not(#pfAvatar):not(#avatarPreview){box-shadow:none!important;animation:none!important}
.profile:not(#pfAvatar):not(#avatarPreview)::after{content:none!important;display:none!important}

/* --- border tambahan --- */
.fx-glass{position:relative;overflow:hidden}
.fx-glass::after{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.55) 48%,transparent 62%);background-size:220% 220%;animation:sw32 2.6s ease-in-out infinite;pointer-events:none}
.fx-hex{box-shadow:0 0 0 2px var(--accent)}
.fx-hex::after{content:"";position:absolute;inset:-6px;pointer-events:none;background:conic-gradient(var(--accent) 0 8%,transparent 8% 25%,var(--accent) 25% 33%,transparent 33% 50%,var(--accent) 50% 58%,transparent 58% 75%,var(--accent) 75% 83%,transparent 83% 100%);-webkit-mask:radial-gradient(closest-side,transparent calc(100% - 3px),#000 calc(100% - 3px));mask:radial-gradient(closest-side,transparent calc(100% - 3px),#000 calc(100% - 3px));border-radius:50%;animation:sp30 6s linear infinite}
@keyframes sw32{0%{background-position:-40% -40%}100%{background-position:140% 140%}}

/* --- status lebih tegas --- */
.pf-status{font-weight:700!important;font-size:14px!important;background:rgba(255,255,255,.16)!important;border:1px solid rgba(255,255,255,.28)!important;color:#fff!important}
.pf-status::placeholder{color:rgba(255,255,255,.55);font-weight:600}

/* --- badges pindah + tanpa emoji --- */
.pf-badges{margin:14px 4px 0!important}
.pf-badges::before{content:"Pencapaian";display:block;margin:0 0 8px;font-size:15px;font-weight:800}
.pf-badges span{display:inline-flex;align-items:center;gap:6px;font-weight:700}

/* --- statistik versi baru --- */
#pf32Stats{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.st32{padding:14px;border-radius:18px;border:1px solid var(--border);background:linear-gradient(160deg,rgba(var(--accent-rgb),.14),transparent 70%)}
.st32 b{display:block;font-size:15px;color:var(--muted);margin-bottom:6px}
.st32 .n{font-size:26px;font-weight:800;font-variant-numeric:tabular-nums}
.st32 .n::after{content:"";display:inline-block;width:7px;height:7px;margin-left:6px;border-radius:50%;background:var(--accent);animation:pl32 1.6s ease-in-out infinite}
.st32 .bar{margin-top:8px;height:6px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden}
.st32 .bar i{display:block;height:100%;width:0;border-radius:99px;background:var(--accent);transition:width 1s cubic-bezier(.2,.9,.3,1)}
@keyframes pl32{50%{opacity:.25;transform:scale(1.6)}}`;
  document.head.appendChild(st);

  function symbols() {
    document.querySelectorAll(".pf-badges span, .bdg").forEach(el => {
      Object.keys(SYM).forEach(e => { if (el.textContent.includes(e)) el.textContent = el.textContent.split(e).join(SYM[e]); });
    });
  }

  function moveBadges() {
    const badges = H("pfBadges"), main = H("pfMain");
    if (!badges || !main) return;
    const bio = main.querySelector(".card");
    if (bio && badges.previousElementSibling !== bio) bio.after(badges);
  }

  const prev = {};
  function count(el, to) {
    const from = prev[el.dataset.id] || 0;
    prev[el.dataset.id] = to;
    if (from === to) { el.textContent = to; return; }
    const t0 = performance.now(), dur = 700;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), v = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      el.textContent = v;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function stats() {
    const main = H("pfMain");
    if (!main || typeof totalXP !== "function") return;
    let box = H("pf32Stats");
    const old = [...main.querySelectorAll(".card")].find(c => c.querySelector("h2") && /Statistik/.test(c.querySelector("h2").textContent));
    if (old) old.style.display = "none";
    if (!box) {
      box = document.createElement("section");
      box.className = "card";
      box.id = "pf32Wrap";
      box.innerHTML = '<h2>Statistik</h2><div id="pf32Stats"></div>';
      (old || main.querySelector(".card")).after(box);
      box = box.querySelector("#pf32Stats");
    }
    const xp = totalXP(), lvl = Math.floor(Math.sqrt(xp / 40)) + 1;
    const lo = 40 * (lvl - 1) ** 2, hi = 40 * lvl * lvl, pct = Math.max(4, Math.min(100, Math.round((xp - lo) / (hi - lo) * 100)));
    const tot = Object.values(data.history || {}).reduce((a, r) => a + (r.t || 0), 0);
    const sk = dayStreak(), best = Math.max(sk, Number(S().bestStreak || 0));
    S().bestStreak = best;
    const posts = (data.posts || []).length;
    const tiles = [
      ["Level", lvl, pct, `${xp}/${hi} XP`],
      ["Tugas selesai", tot, Math.min(100, tot * 3), null],
      ["Streak", sk, best ? Math.round(sk / best * 100) : 0, `rekor ${best} hari`],
      ["Postingan", posts, Math.min(100, posts * 10), null]
    ];
    box.innerHTML = tiles.map((t, i) => `<div class="st32"><b>${t[0]}</b><span class="n" data-id="s${i}"></span><div class="bar"><i style="width:${t[2]}%"></i></div>${t[3] ? `<small style="color:var(--muted);font-size:11px">${t[3]}</small>` : ""}</div>`).join("");
    tiles.forEach((t, i) => count(box.querySelector(`[data-id=s${i}]`), t[1]));
  }

  function fxRow() {
    const row = H("fxRow");
    if (!row || row.dataset.v32) return;
    row.dataset.v32 = "1";
    const chips = row.querySelector(".fx-chips");
    [["neon", "Neon"], ["rainbow", "Pelangi"], ["fire", "Api"], ["glass", "Kaca"], ["hex", "Segi"]].forEach(f => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "mini-button"; b.dataset.fx = f[0]; b.textContent = f[1];
      chips.appendChild(b);
    });
  }

  function tick() {
    fxRow();
    moveBadges();
    stats();
    symbols();
  }
  setInterval(tick, 1200);
  tick();
})();
