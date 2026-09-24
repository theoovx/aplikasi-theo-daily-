/* THEO v2.8 PATCH: galeri foto, banner, lencana */
(function () {
  const S = () => (data.settings ||= {});
  const H = id => document.getElementById(id);
  const GR = ["", "linear-gradient(135deg,#3b82f6,#a855f7)", "linear-gradient(135deg,#f97316,#ef4444)", "linear-gradient(135deg,#10b981,#06b6d4)", "linear-gradient(135deg,#ec4899,#8b5cf6)", "linear-gradient(135deg,#111827,#374151)"];
  const st = document.createElement("style");
  st.textContent = `
.gal-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:12px 0}
.gal-grid img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px}
.ban-chips button{width:34px;height:34px;padding:0;border-radius:10px;border:2px solid var(--border);background:rgba(255,255,255,.08)}
.ban-chips .on{border-color:var(--accent)}
.bdg{display:inline-flex;gap:6px;align-items:center;margin:4px 6px 0 0;padding:6px 12px;border-radius:99px;font-size:12px;font-weight:600;background:rgba(var(--accent-rgb),.18)}
.bdg.off{opacity:.3;filter:grayscale(1)}
.view-ov{position:fixed;inset:0;z-index:100000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:env(safe-area-inset-top) 16px env(safe-area-inset-bottom);background:rgba(0,0,0,.92)}
.view-ov img{max-width:100%;max-height:60%;border-radius:16px}
.view-ov input{width:100%;max-width:340px;padding:10px 14px;border-radius:12px;border:1px solid var(--border);background:rgba(255,255,255,.08);color:inherit}
.toast{position:fixed;left:50%;bottom:110px;z-index:100001;transform:translateX(-50%);padding:10px 18px;border-radius:99px;background:var(--accent);color:#fff;font-weight:700;animation:hRise .4s both}`;
  document.head.appendChild(st);

  function shrink(file, max, q, cb) {
    const url = URL.createObjectURL(file), img = new Image();
    img.onerror = () => { URL.revokeObjectURL(url); alert("Foto tidak bisa dibaca."); };
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      cb(c.toDataURL("image/jpeg", q));
    };
    img.src = url;
  }
  const full = () => JSON.stringify(data).length > 4.4e6;

  function gallery() {
    const box = H("galCfg"), posts = data.posts || [];
    if (!box) return;
    box.innerHTML = `<h2>Galeri</h2><p class="settings-note">Foto disimpan di HP dan ikut cadangan (${posts.length}/30).</p><div class="gal-grid">${posts.map(p => `<img src="${p.img}" data-id="${p.id}" alt="">`).join("")}</div>` +
      `<div class="fx-chips"><label class="mini-button" for="galInput">+ Posting</label><input id="galInput" type="file" accept="image/*" hidden><label class="mini-button" for="banInput">Foto banner</label><input id="banInput" type="file" accept="image/*" hidden></div>` +
      `<p class="settings-note">Banner kartu Home</p><div class="fx-chips ban-chips">${GR.map((g, i) => `<button type="button" data-g="${i}" class="${!S().bannerImg && (S().banner || 0) === i ? "on" : ""}" style="background:${g || ""}"></button>`).join("")}</div>`;
  }

  function viewer(id) {
    const p = (data.posts || []).find(x => x.id === id);
    if (!p) return;
    const ov = document.createElement("div");
    ov.className = "view-ov";
    ov.innerHTML = `<img src="${p.img}" alt=""><input placeholder="Tulis keterangan..." value="${escapeHTML(p.cap || "")}"><small>${new Date(p.ts).toLocaleDateString("id-ID", { dateStyle: "long" })}</small><div class="fx-chips"><button type="button" class="mini-button on" data-v="ok">Simpan</button><button type="button" class="mini-button" data-v="del">Hapus</button></div>`;
    document.body.appendChild(ov);
    ov.onclick = e => {
      const b = e.target.closest("button");
      if (e.target === ov) { ov.remove(); return; }
      if (!b) return;
      if (b.dataset.v === "del") data.posts = data.posts.filter(x => x.id !== id);
      else p.cap = ov.querySelector("input").value;
      persist();
      ov.remove();
      gallery();
    };
  }

  window.THEOviewer = viewer;
  function badges() {
    const box = H("bdgCfg");
    const tot = Object.values(data.history || {}).reduce((s, r) => s + (r.t || 0), 0);
    const lvl = Math.floor(Math.sqrt(totalXP() / 40)) + 1, sk = dayStreak();
    const BD = [["🔥", "Streak 3", sk >= 3], ["🔥", "Streak 7", sk >= 7], ["🌋", "Streak 30", sk >= 30], ["✅", "10 tugas", tot >= 10], ["🏆", "100 tugas", tot >= 100], ["⭐", "Level 5", lvl >= 5], ["👑", "Level 10", lvl >= 10], ["📸", "Posting pertama", (data.posts || []).length >= 1]];
    const got = BD.filter(b => b[2]).map(b => b[1]), had = S().badges;
    if (!had) { S().badges = got; persist(); }
    else {
      const neu = got.filter(n => !had.includes(n));
      if (neu.length) {
        S().badges = got;
        persist();
        const t = document.createElement("div");
        t.className = "toast";
        t.textContent = "🏅 Lencana baru: " + neu.join(", ");
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3000);
        try { celebrate(); } catch (_) { /* abaikan */ }
      }
    }
    if (box) box.innerHTML = "<h2>Lencana</h2>" + BD.map(b => `<span class="bdg${b[2] ? "" : " off"}">${b[0]} ${b[1]}</span>`).join("");
  }

  function ui() {
    const page = H("settingsPage");
    if (!page || H("galCfg")) return;
    const main = page.querySelector("main") || page;
    ["bdgCfg", "galCfg"].forEach(id => {
      const s = document.createElement("section");
      s.id = id;
      s.className = "card";
      main.prepend(s);
    });
    const box = H("galCfg");
    box.onclick = e => {
      const im = e.target.closest("img"), g = e.target.closest("[data-g]");
      if (im) viewer(Number(im.dataset.id));
      if (g) { S().banner = Number(g.dataset.g); delete S().bannerImg; persist(); gallery(); }
    };
    box.onchange = e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      if (e.target.id === "galInput") {
        if ((data.posts ||= []).length >= 30) { alert("Maksimal 30 foto."); return; }
        shrink(f, 720, 0.7, img => {
          data.posts.unshift({ id: Date.now(), img, cap: "", ts: Date.now() });
          if (full()) { data.posts.shift(); alert("Penyimpanan hampir penuh. Hapus foto lama atau unduh backup."); return; }
          persist();
          gallery();
        });
      } else if (e.target.id === "banInput") {
        shrink(f, 640, 0.6, img => { const old = S().bannerImg; S().bannerImg = img; if (full()) { S().bannerImg = old; alert("Penyimpanan hampir penuh."); return; } persist(); gallery(); });
      }
      e.target.value = "";
    };
    gallery();
  }

  function hero() {
    const el = H("heroCard");
    if (!el) return;
    const key = (S().bannerImg ? S().bannerImg.length : 0) + "|" + (S().banner || 0);
    if (el.dataset.bk === key) return;
    el.dataset.bk = key;
    el.style.background = S().bannerImg ? `linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)),url(${S().bannerImg}) center/cover` : (GR[S().banner || 0] || "");
  }

  setInterval(() => { ui(); hero(); badges(); }, 3000);
  ui(); hero(); badges();
})();
