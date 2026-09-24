/* THEO v3.1 PATCH: banner bisa diatur, rapikan tampilan app, tambahan */
(function () {
  const S = () => (data.settings ||= {});
  const H = id => document.getElementById(id);
  const st = document.createElement("style");
  st.textContent = `
*{-webkit-tap-highlight-color:transparent}
html,body{overscroll-behavior:none}
body{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
input,textarea,select{-webkit-user-select:text;user-select:text}
img{-webkit-user-drag:none}
.page:not([hidden]){animation:pgIn .25s both}
button:active,.nav-item:active,.task-item:active{transform:scale(.97)}
@keyframes pgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.ev{display:flex;align-items:center;gap:14px;margin:12px 0;padding:14px 16px!important}
.ev>span{font-size:28px}
.ev small{display:block;color:var(--muted)}
html.light{filter:invert(1) hue-rotate(180deg);background:#000}
html.light img,html.light .pf-banner,html.light .pf-avatar,html.light #avatarPreview.has-photo,html.light .profile.has-photo{filter:invert(1) hue-rotate(180deg)}
html.calm *,html.calm *::before,html.calm *::after{animation:none!important;transition:none!important}`;
  document.head.appendChild(st);
  const vp = document.querySelector("meta[name=viewport]");
  if (vp && !/user-scalable/.test(vp.content)) vp.content += ", maximum-scale=1, user-scalable=no";

  /* tombol Kembali Android: balik ke Home dulu, baru keluar */
  history.pushState({ t: 1 }, "");
  addEventListener("popstate", () => {
    const cur = [...document.querySelectorAll(".page")].find(p => !p.hidden);
    if (cur && cur.id !== "homePage") { showPage("home"); history.pushState({ t: 1 }, ""); }
  });

  /* banner: geser dan zoom */
  function bannerCrop(file) {
    const url = URL.createObjectURL(file), img = new Image();
    img.onerror = () => { URL.revokeObjectURL(url); alert("Foto tidak bisa dibaca."); };
    img.onload = () => {
      const W = 660, Ht = 290, ov = document.createElement("div");
      ov.className = "crop-ov";
      ov.innerHTML = `<div class="crop-box"><canvas width="${W}" height="${Ht}" style="width:100%;aspect-ratio:auto;border-radius:16px"></canvas><input type="range" min="1" max="4" step="0.01" value="1"><small>Geser dan zoom untuk atur banner</small><div class="crop-btns"><button type="button" class="mini-button" data-c="0">Batal</button><button type="button" class="mini-button on" data-c="1">Simpan</button></div></div>`;
      document.body.appendChild(ov);
      const cv = ov.querySelector("canvas"), g = cv.getContext("2d"), rg = ov.querySelector("input");
      const base = Math.max(W / img.width, Ht / img.height);
      let z = 1, ox = 0, oy = 0, px = null, py = null;
      const draw = () => {
        const w = img.width * base * z, h = img.height * base * z;
        ox = Math.max(-(w - W) / 2, Math.min((w - W) / 2, ox));
        oy = Math.max(-(h - Ht) / 2, Math.min((h - Ht) / 2, oy));
        g.clearRect(0, 0, W, Ht);
        g.drawImage(img, (W - w) / 2 + ox, (Ht - h) / 2 + oy, w, h);
      };
      draw();
      rg.oninput = () => { z = Number(rg.value); draw(); };
      cv.onpointerdown = e => { px = e.clientX; py = e.clientY; cv.setPointerCapture(e.pointerId); };
      cv.onpointermove = e => {
        if (px === null) return;
        const k = W / cv.getBoundingClientRect().width;
        ox += (e.clientX - px) * k; oy += (e.clientY - py) * k; px = e.clientX; py = e.clientY;
        draw();
      };
      cv.onpointerup = () => { px = null; };
      ov.onclick = e => {
        const b = e.target.closest("button");
        if (!b) return;
        if (b.dataset.c === "1") {
          const old = S().bannerImg;
          S().bannerImg = cv.toDataURL("image/jpeg", 0.72);
          if (JSON.stringify(data).length > 4.4e6) { S().bannerImg = old; alert("Penyimpanan hampir penuh."); }
          else persist();
        }
        URL.revokeObjectURL(url);
        ov.remove();
      };
    };
    img.src = url;
  }
  document.addEventListener("change", e => {
    if (e.target.id === "banInput" && e.target.files[0]) {
      e.stopPropagation();
      const f = e.target.files[0];
      e.target.value = "";
      bannerCrop(f);
    }
  }, true);

  /* kartu tambahan di Akun */
  function card() {
    const box = H("akunExtra");
    if (!box || H("akun31")) return;
    const c = document.createElement("section");
    c.id = "akun31";
    c.className = "card";
    box.appendChild(c);
    const draw = () => {
      const s = S(), e = s.event || {};
      const row = (t, sub, inner) => `<div class="cfg-row"><div><b>${t}</b><small>${sub}</small></div><div class="cfg-btns">${inner}</div></div>`;
      const tg = (k, on) => `<button type="button" class="mini-button${on ? " on" : ""}" data-k="${k}">${on ? "Aktif" : "Mati"}</button>`;
      c.innerHTML = "<h2>Lainnya</h2>" +
        row("Mode terang", "Eksperimen, warna dibalik otomatis", tg("light", s.light)) +
        row("Kurangi animasi", "Lebih hemat baterai", tg("calm", s.calm)) +
        `<div class="cfg-row"><div style="flex:1"><b>Hari penting</b><small>Muncul di Home sebagai hitung mundur</small><input id="evN" maxlength="30" placeholder="Nama acara" value="${escapeHTML(e.name || "")}" style="width:100%;margin:8px 0 6px;padding:8px 12px;border-radius:12px;border:1px solid var(--border);background:rgba(255,255,255,.06);color:inherit"><input id="evD" type="date" value="${e.date || ""}"></div></div>` +
        '<button type="button" class="mini-button" data-ev="save">Simpan acara</button> <button type="button" class="mini-button" data-ev="del">Hapus</button>';
    };
    draw();
    c.onclick = e => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.k) S()[b.dataset.k] = !S()[b.dataset.k];
      else if (b.dataset.ev === "save") S().event = { name: H("evN").value.trim(), date: H("evD").value };
      else if (b.dataset.ev === "del") delete S().event;
      persist();
      draw();
    };
  }

  function countdown() {
    const hero = H("heroCard"), e = S().event;
    let c = H("evCard");
    if (!hero || !e || !e.date) { if (c) c.remove(); return; }
    const d = Math.round((new Date(e.date + "T00:00:00") - new Date(dk() + "T00:00:00")) / 864e5);
    const html = `<span>🎯</span><div><b>${escapeHTML(e.name || "Hari penting")}</b><small>${d > 0 ? d + " hari lagi" : d === 0 ? "Hari ini!" : -d + " hari lalu"}</small></div>`;
    if (!c) { c = document.createElement("section"); c.id = "evCard"; c.className = "card ev"; }
    if (hero.nextElementSibling !== c) hero.after(c);
    if (c.dataset.k !== html) { c.dataset.k = html; c.innerHTML = html; }
  }

  function tick() {
    card();
    countdown();
    document.documentElement.classList.toggle("light", !!S().light);
    document.documentElement.classList.toggle("calm", !!S().calm);
  }
  setInterval(tick, 1200);
  tick();
})();
