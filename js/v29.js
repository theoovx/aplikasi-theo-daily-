/* THEO v2.9 PATCH: halaman Profil ala Discord */
(function () {
  const S = () => (data.settings ||= {});
  const H = id => document.getElementById(id);
  const EM = { "Streak 3": "🔥", "Streak 7": "🔥", "Streak 30": "🌋", "10 tugas": "✅", "100 tugas": "🏆", "Level 5": "⭐", "Level 10": "👑", "Posting pertama": "📸" };
  const GR = ["", "linear-gradient(135deg,#3b82f6,#a855f7)", "linear-gradient(135deg,#f97316,#ef4444)", "linear-gradient(135deg,#10b981,#06b6d4)", "linear-gradient(135deg,#ec4899,#8b5cf6)", "linear-gradient(135deg,#111827,#374151)"];
  const st = document.createElement("style");
  st.textContent = `
.pf-banner{position:relative;height:130px;border-radius:22px;background:linear-gradient(135deg,rgba(var(--accent-rgb),.6),#111827)}
.pf-back{position:absolute;left:10px;top:10px;margin:0!important;background:rgba(0,0,0,.45)!important;color:#fff!important}
.pf-head{position:relative;display:flex;align-items:flex-end;gap:10px;margin:-44px 0 0 14px}
#profilePage .pf-avatar{width:92px!important;height:92px!important;flex-shrink:0;border-radius:50%!important;font-size:30px;border:5px solid var(--card,#0b0f1a);background-size:cover;background-position:center}
.pf-status{width:170px;margin-bottom:16px;padding:8px 14px;border:0;border-radius:18px;background:rgba(255,255,255,.1);color:inherit}
.pf-name{margin:12px 4px 2px;font-size:28px}
.pf-sub{margin:0 4px 8px;color:var(--muted);font-size:13px}
.pf-badges{display:flex;flex-wrap:wrap;gap:6px;margin:0 4px 12px}
.pf-badges span{padding:4px 10px;border-radius:12px;background:rgba(255,255,255,.08)}
.pf-tabs{display:grid;grid-template-columns:1fr 1fr;margin-bottom:14px;border-bottom:1px solid var(--border)}
.pf-tabs button{padding:12px;border:0;border-bottom:3px solid transparent;background:none;color:var(--muted);font:700 15px Inter,sans-serif}
.pf-tabs .on{color:var(--accent);border-color:var(--accent)}
#pfMain textarea{width:100%;min-height:72px;margin:8px 0 12px;padding:10px 12px;border-radius:12px;border:1px solid var(--border);background:rgba(255,255,255,.06);color:inherit;font:inherit;resize:none}
.pf-row{display:flex;justify-content:space-between;padding:10px 0;border-top:1px solid var(--border)}
.pf-row span:first-child{color:var(--muted)}`;
  document.head.appendChild(st);

  let last = "", bk = "";
  function build() {
    const after = H("settingsPage");
    if (H("profilePage") || !after) return;
    const pg = document.createElement("section");
    pg.className = "page";
    pg.id = "profilePage";
    pg.hidden = true;
    pg.innerHTML = `<main class="content"><div class="pf-banner" id="pfBanner"><button class="back-btn pf-back" data-page="widgets" type="button">‹ Menu</button></div>` +
      `<div class="pf-head"><div class="pf-avatar profile" id="pfAvatar"></div><input class="pf-status" id="pfStatus" maxlength="28" placeholder="Status kamu..."></div>` +
      `<h1 class="pf-name" id="pfName"></h1><p class="pf-sub" id="pfSub"></p><div class="pf-badges" id="pfBadges"></div>` +
      `<div class="pf-tabs"><button type="button" data-t="main" class="on">Utama</button><button type="button" data-t="posts">Postingan</button></div>` +
      `<div id="pfMain"></div><div id="pfPosts" hidden></div></main>`;
    after.after(pg);
    pg.addEventListener("change", e => {
      if (e.target.id === "pfBio") S().bio = e.target.value;
      else if (e.target.id === "pfStatus") S().status = e.target.value;
      else return;
      persist();
    });
    pg.addEventListener("click", e => {
      const t = e.target.closest("[data-t]"), im = e.target.closest("#pfPosts img");
      if (t) {
        pg.querySelectorAll(".pf-tabs button").forEach(b => b.classList.toggle("on", b === t));
        H("pfMain").hidden = t.dataset.t !== "main";
        H("pfPosts").hidden = t.dataset.t !== "posts";
      }
      if (im && window.THEOviewer) window.THEOviewer(Number(im.dataset.id));
    });
  }

  function render() {
    build();
    const pg = H("profilePage");
    if (!pg || pg.hidden) return;
    const s = S(), xp = totalXP(), lvl = Math.floor(Math.sqrt(xp / 40)) + 1, sk = dayStreak();
    const tot = Object.values(data.history || {}).reduce((a, r) => a + (r.t || 0), 0), posts = data.posts || [];
    const first = Object.keys(data.history || {}).sort()[0];
    const since = new Date(first ? first + "T00:00:00" : Date.now()).toLocaleDateString("id-ID", { dateStyle: "long" });
    const key = [s.bannerImg ? s.bannerImg.length : 0, s.banner || 0].join("|");
    if (key !== bk) {
      bk = key;
      H("pfBanner").style.background = s.bannerImg ? `url(${s.bannerImg}) center/cover` : (GR[s.banner || 0] || "");
    }
    paintAvatar(H("pfAvatar"));
    if (document.activeElement !== H("pfStatus")) H("pfStatus").value = s.status || "";
    H("pfName").textContent = s.name || "Theo";
    H("pfSub").textContent = `Level ${lvl} • 🔥 ${sk} hari beruntun`;
    H("pfBadges").innerHTML = (s.badges || []).map(n => `<span>${EM[n] || "🏅"}</span>`).join("") || "<span>Belum ada lencana</span>";
    const html = `<div class="card"><h2>Bio</h2><textarea id="pfBio" maxlength="160" placeholder="Tulis tentang dirimu...">${escapeHTML(s.bio || "")}</textarea><div class="pf-row"><span>Member sejak</span><span>${since}</span></div></div>` +
      `<div class="card"><h2>Statistik</h2><div class="pf-row"><span>Level</span><span>${lvl}</span></div><div class="pf-row"><span>Total XP</span><span>${xp}</span></div><div class="pf-row"><span>Tugas selesai</span><span>${tot}</span></div><div class="pf-row"><span>Streak</span><span>${sk} hari</span></div><div class="pf-row"><span>Postingan</span><span>${posts.length}</span></div></div>`;
    const ph = `<label class="mini-button on" for="galInput">+ Posting</label>` + (posts.length ? `<div class="gal-grid">${posts.map(p => `<img src="${p.img}" data-id="${p.id}" alt="">`).join("")}</div>` : `<p class="settings-note">Belum ada postingan.</p>`);
    if (document.activeElement !== H("pfBio") && html !== last) { last = html; H("pfMain").innerHTML = html; }
    if (H("pfPosts").dataset.n !== String(posts.length + "|" + (posts[0] ? posts[0].id : 0))) { H("pfPosts").dataset.n = posts.length + "|" + (posts[0] ? posts[0].id : 0); H("pfPosts").innerHTML = ph; }
  }

  function hook() {
    document.querySelectorAll(".profile:not(#pfAvatar)").forEach(el => { el.dataset.page = "profile"; el.style.cursor = "pointer"; });
  }
  document.addEventListener("click", e => { if (e.target.closest("[data-page=profile]")) setTimeout(render, 60); });
  setInterval(() => { hook(); render(); }, 1000);
  hook();
  render();
})();
