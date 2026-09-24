/* THEO v3.0 PATCH: tab Foto + Akun, border baru, PIN, suara, pengingat */
(function () {
  const S = () => (data.settings ||= {});
  const H = id => document.getElementById(id);
  const GR = ["", "linear-gradient(135deg,#3b82f6,#a855f7)", "linear-gradient(135deg,#f97316,#ef4444)", "linear-gradient(135deg,#10b981,#06b6d4)", "linear-gradient(135deg,#ec4899,#8b5cf6)", "linear-gradient(135deg,#111827,#374151)"];
  const FX = [["", "Polos"], ["ring", "Cincin"], ["aurora", "Aurora"], ["gold", "Emas"], ["pulse", "Denyut"], ["dots", "Titik"]];
  const st = document.createElement("style");
  st.textContent = `
.bottom-nav{grid-template-columns:repeat(7,minmax(0,1fr))!important;gap:2px!important;padding:8px 4px!important}
.bottom-nav .nav-item span:last-child{font-size:9.5px!important}
#galCfg,.pf-tabs,#pfPosts{display:none!important}
.pf-banner{height:150px!important}
#profilePage .pf-avatar{width:100px!important;height:100px!important}
.pf-name{text-shadow:0 0 18px rgba(var(--accent-rgb),.6)}
#profilePage .card,#photosPage .ph-card{backdrop-filter:blur(10px)}
#akunExtra{display:grid;gap:12px;margin-top:12px}
.ph-add{display:block;text-align:center;margin-bottom:14px}
.ph-card{margin-bottom:14px;padding:10px;border-radius:22px;border:1px solid var(--border);background:var(--card,#111827)}
.ph-card img{width:100%;border-radius:16px;display:block}
.ph-meta{display:flex;align-items:center;gap:8px;margin-top:8px}
.ph-meta input{flex:1;min-width:0;padding:8px 12px;border-radius:12px;border:1px solid var(--border);background:rgba(255,255,255,.06);color:inherit}
.ph-meta small{color:var(--muted)}
.lock-ov{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:#05070d;color:#fff}
.lock-ov input{width:170px;padding:14px;text-align:center;font-size:28px;letter-spacing:.5em;border-radius:16px;border:1px solid #334155;background:#0f172a;color:#fff}
.lock-ov.bad input{border-color:#ef4444;animation:hRise .3s}
.fx-aurora,.fx-gold,.fx-pulse,.fx-dots{position:relative}
.fx-aurora::after,.fx-gold::after{content:"";position:absolute;inset:-4px;border-radius:inherit;padding:3px;pointer-events:none;-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:sp30 3s linear infinite}
.fx-aurora::after{background:conic-gradient(#22d3ee,#a855f7,#f472b6,#22d3ee);filter:drop-shadow(0 0 6px #a855f7)}
.fx-gold::after{background:conic-gradient(#fde68a,#f59e0b,#fff7d6,#f59e0b,#fde68a);animation-duration:5s}
.fx-pulse{animation:pl30 1.8s ease-in-out infinite}
.fx-dots::after{content:"";position:absolute;inset:-6px;border-radius:inherit;border:3px dotted var(--accent);animation:sp30 8s linear infinite;pointer-events:none}
@keyframes sp30{to{transform:rotate(360deg)}}
@keyframes pl30{50%{box-shadow:0 0 0 8px rgba(var(--accent-rgb),.25),0 0 22px rgba(var(--accent-rgb),.5)}}`;
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
  const toast = t => { const d = document.createElement("div"); d.className = "toast"; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 3000); };

  /* ---- bar bawah + halaman Foto ---- */
  if (typeof NAV_PAGES !== "undefined") NAV_PAGES.push("photos", "profile");
  const nav = document.querySelector(".bottom-nav");
  const mk = (page, icon, label) => { const b = document.createElement("button"); b.className = "nav-item"; b.type = "button"; b.dataset.page = page; b.innerHTML = `<span class="material-symbols-sharp">${icon}</span><span>${label}</span>`; return b; };
  if (nav && !nav.querySelector("[data-page=photos]")) {
    nav.querySelector("[data-page=progress]").before(mk("photos", "add_a_photo", "Foto"));
    nav.appendChild(mk("profile", "account_circle", "Akun"));
  }
  const ph = document.createElement("section");
  ph.className = "page";
  ph.id = "photosPage";
  ph.hidden = true;
  ph.innerHTML = '<header class="top-header"><div><p class="greeting">Simpan momenmu.</p><h1>Foto</h1></div></header><main class="content"><label class="primary-button ph-add" for="phInput">+ Posting foto</label><input id="phInput" type="file" accept="image/*" hidden><div id="phFeed"></div></main>';
  (H("settingsPage") || document.body).after(ph);
  let feedKey = "";
  function feed() {
    if (ph.hidden) return;
    const posts = data.posts || [], key = posts.map(p => p.id).join();
    if (key === feedKey) return;
    feedKey = key;
    H("phFeed").innerHTML = posts.length ? posts.map(p => `<article class="ph-card"><img src="${p.img}" alt=""><div class="ph-meta"><input data-c="${p.id}" maxlength="120" placeholder="Tulis keterangan..." value="${escapeHTML(p.cap || "")}"><small>${new Date(p.ts).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</small><button type="button" class="mini-button" data-del="${p.id}">Hapus</button></div></article>`).join("") : '<p class="settings-note">Belum ada foto. Tap Posting foto di atas.</p>';
  }
  ph.addEventListener("change", e => {
    if (e.target.id === "phInput") {
      const f = e.target.files[0];
      if (!f) return;
      if ((data.posts ||= []).length >= 30) { alert("Maksimal 30 foto."); return; }
      shrink(f, 720, 0.7, img => {
        data.posts.unshift({ id: Date.now(), img, cap: "", ts: Date.now() });
        if (full()) { data.posts.shift(); alert("Penyimpanan hampir penuh. Hapus foto lama atau unduh backup."); return; }
        persist();
        feedKey = "";
        feed();
      });
      e.target.value = "";
    } else if (e.target.dataset.c) {
      const p = data.posts.find(x => x.id === Number(e.target.dataset.c));
      if (p) { p.cap = e.target.value; persist(); }
    }
  });
  ph.addEventListener("click", e => {
    const d = e.target.closest("[data-del]");
    if (d && confirm("Hapus foto ini?")) { data.posts = data.posts.filter(x => x.id !== Number(d.dataset.del)); persist(); feedKey = ""; feed(); }
  });

  /* ---- Akun: pindahkan semua dari Settings ---- */
  let moved = false;
  function akun() {
    const pg = H("profilePage"), prev = H("avatarPreview");
    if (moved || !pg || !prev) return;
    const box = document.createElement("div");
    box.id = "akunExtra";
    pg.querySelector("main").appendChild(box);
    box.appendChild(prev.closest("section"));
    if (H("bdgCfg")) box.appendChild(H("bdgCfg"));
    const cfg = document.createElement("section");
    cfg.id = "akunCfg";
    cfg.className = "card";
    box.appendChild(cfg);
    moved = true;
    cfgDraw();
    cfg.onclick = e => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.g) { S().banner = Number(b.dataset.g); delete S().bannerImg; }
      else if (b.dataset.k) S()[b.dataset.k] = !S()[b.dataset.k];
      else if (b.dataset.a) delete S().customAccent;
      else if (b.dataset.pin === "set") { const v = prompt("PIN 4 angka:"); if (v && /^\d{4}$/.test(v)) { S().pin = v; toast("PIN aktif"); } else return; }
      else if (b.dataset.pin === "off") delete S().pin;
      persist();
      cfgDraw();
    };
    cfg.onchange = e => {
      if (e.target.id === "cAcc") S().customAccent = e.target.value;
      else if (e.target.id === "rmT") S().remind = e.target.value;
      else if (e.target.id === "banInput" && e.target.files[0]) {
        shrink(e.target.files[0], 640, 0.6, img => { const o = S().bannerImg; S().bannerImg = img; if (full()) { S().bannerImg = o; alert("Penyimpanan hampir penuh."); return; } persist(); cfgDraw(); });
        e.target.value = "";
        return;
      }
      persist();
    };
  }
  function cfgDraw() {
    const c = H("akunCfg"), s = S();
    if (!c) return;
    const row = (t, sub, inner) => `<div class="cfg-row"><div><b>${t}</b><small>${sub}</small></div><div class="cfg-btns">${inner}</div></div>`;
    const tg = (k, on) => `<button type="button" class="mini-button${on ? " on" : ""}" data-k="${k}">${on ? "Aktif" : "Mati"}</button>`;
    c.innerHTML = "<h2>Tampilan & keamanan</h2><p class=\"settings-note\">Banner</p><div class=\"fx-chips ban-chips\">" +
      GR.map((g, i) => `<button type="button" data-g="${i}" class="${!s.bannerImg && (s.banner || 0) === i ? "on" : ""}" style="background:${g}"></button>`).join("") +
      "<label class=\"mini-button\" for=\"banInput\">Foto banner</label><input id=\"banInput\" type=\"file\" accept=\"image/*\" hidden></div>" +
      row("Warna aksen", "Pilih warna sendiri", `<input type="color" id="cAcc" value="${s.customAccent || "#ff5a00"}"><button type="button" class="mini-button" data-a="1">Reset</button>`) +
      row("Suara kecil", "Bunyi halus saat centang dan pindah tab", tg("sound", s.sound)) +
      row("PIN", s.pin ? "PIN aktif, diminta tiap buka app" : "Kunci app dengan 4 angka", s.pin ? '<button type="button" class="mini-button" data-pin="off">Hapus</button>' : '<button type="button" class="mini-button" data-pin="set">Atur</button>') +
      row("Pengingat harian", "Jam pengingat (jalan saat app terbuka)", `<input type="time" id="rmT" value="${s.remind || "20:00"}">${tg("remOn", s.remOn)}`);
  }

  /* ---- border baru ---- */
  function fx() {
    const row = H("fxRow");
    if (row && !row.dataset.v30) {
      row.dataset.v30 = "1";
      row.querySelectorAll("[data-fx]").forEach(b => b.remove());
      const t = row.querySelector("#streakToggle");
      FX.forEach(f => { const b = document.createElement("button"); b.type = "button"; b.className = "mini-button"; b.dataset.fx = f[0]; b.textContent = f[1]; t ? t.before(b) : row.querySelector(".fx-chips").appendChild(b); });
    }
    document.querySelectorAll("#avatarPreview,.profile").forEach(el => {
      el.className = el.className.replace(/\bfx-\S+/g, "").trim();
      if (S().avatarFx) el.classList.add("fx-" + S().avatarFx);
    });
  }

  /* ---- suara, aksen, pengingat, PIN ---- */
  let ac;
  const beep = f => {
    if (!S().sound) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.value = f; g.gain.value = 0.06;
      o.connect(g); g.connect(ac.destination);
      o.start(); o.stop(ac.currentTime + 0.09);
    } catch (_) { /* abaikan */ }
  };
  document.addEventListener("click", e => { if (e.target.closest(".task-item")) beep(880); else if (e.target.closest(".nav-item")) beep(520); });
  function tick() {
    akun(); fx(); feed();
    const c = S().customAccent;
    if (c) {
      const s = document.documentElement.style;
      ["--accent", "--ui-accent", "--accent-hover"].forEach(v => s.setProperty(v, c));
      s.setProperty("--accent-rgb", [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)).join(","));
    }
    const d = new Date(), hm = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    if (S().remOn && S().remind === hm && S().lastRemind !== dk()) {
      S().lastRemind = dk();
      persist();
      toast("⏰ Waktunya cek tugas hari ini!");
      try { if (window.Notification && Notification.permission === "granted") new Notification("Theo Daily", { body: "Waktunya cek tugas hari ini!" }); } catch (_) { /* abaikan */ }
    }
  }
  if (S().pin) {
    const ov = document.createElement("div");
    ov.className = "lock-ov";
    ov.innerHTML = '<div style="font:800 26px Inter,sans-serif;letter-spacing:.3em">THEO</div><input type="password" inputmode="numeric" maxlength="4" placeholder="••••">';
    document.body.appendChild(ov);
    const i = ov.querySelector("input");
    i.oninput = () => {
      if (i.value === S().pin) ov.remove();
      else if (i.value.length >= 4) { i.value = ""; ov.classList.add("bad"); setTimeout(() => ov.classList.remove("bad"), 400); }
    };
  }
  setInterval(tick, 1200);
  tick();
})();
