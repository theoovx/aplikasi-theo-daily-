/* THEO v2.6 PATCH: crop foto, freeze streak, pengingat backup */
(function () {
  const S = () => (data.settings ||= {});
  const H = id => document.getElementById(id);
  const DAY = 864e5;
  let lastB = "";

  window.dayStreak = function () {
    const has = d => (data.history[dk(d)]?.t || 0) > 0;
    const d = new Date(), skips = [];
    if (!has(d)) d.setDate(d.getDate() - 1);
    let n = 0;
    for (let i = 0; i < 400; i++) {
      if (has(d)) n++;
      else {
        const y = new Date(d);
        y.setDate(y.getDate() - 1);
        if (i === 0 || !S().freeze || !has(y) || skips.some(t => t - d.getTime() < 7 * DAY)) break;
        skips.push(d.getTime());
      }
      d.setDate(d.getDate() - 1);
    }
    return n;
  };

  function cropper(file) {
    const url = URL.createObjectURL(file), img = new Image();
    img.onerror = () => { URL.revokeObjectURL(url); alert("Foto tidak bisa dibaca."); };
    img.onload = () => {
      const W = 280, ov = document.createElement("div");
      ov.className = "crop-ov";
      ov.innerHTML = `<div class="crop-box"><canvas width="${W}" height="${W}"></canvas><input type="range" min="1" max="4" step="0.01" value="1"><small>Geser dan zoom untuk atur posisi</small><div class="crop-btns"><button type="button" class="mini-button" data-c="0">Batal</button><button type="button" class="mini-button on" data-c="1">Simpan</button></div></div>`;
      document.body.appendChild(ov);
      const cv = ov.querySelector("canvas"), g = cv.getContext("2d"), rg = ov.querySelector("input");
      const base = W / Math.min(img.width, img.height);
      let z = 1, ox = 0, oy = 0, px = null, py = null;
      const draw = () => {
        const w = img.width * base * z, h = img.height * base * z;
        ox = Math.max(-(w - W) / 2, Math.min((w - W) / 2, ox));
        oy = Math.max(-(h - W) / 2, Math.min((h - W) / 2, oy));
        g.clearRect(0, 0, W, W);
        g.drawImage(img, (W - w) / 2 + ox, (W - h) / 2 + oy, w, h);
      };
      draw();
      rg.oninput = () => { z = Number(rg.value); draw(); };
      cv.onpointerdown = e => { px = e.clientX; py = e.clientY; cv.setPointerCapture(e.pointerId); };
      cv.onpointermove = e => { if (px === null) return; ox += e.clientX - px; oy += e.clientY - py; px = e.clientX; py = e.clientY; draw(); };
      cv.onpointerup = () => { px = null; };
      ov.onclick = e => {
        const b = e.target.closest("button");
        if (!b) return;
        if (b.dataset.c === "1") {
          const o = document.createElement("canvas");
          o.width = o.height = 256;
          o.getContext("2d").drawImage(cv, 0, 0, 256, 256);
          S().avatar = o.toDataURL("image/jpeg", 0.85);
          saveData();
        }
        URL.revokeObjectURL(url);
        ov.remove();
      };
    };
    img.src = url;
  }

  const inp = H("avatarInput");
  if (inp) inp.addEventListener("change", e => {
    const f = inp.files[0];
    if (!f) return;
    e.stopImmediatePropagation();
    inp.value = "";
    cropper(f);
  }, true);

  const ex = H("exportDataButton");
  if (ex) ex.addEventListener("click", () => { S().lastBackup = Date.now(); persist(); banner(); });
  if (!S().lastBackup) { S().lastBackup = Date.now(); persist(); }

  function banner() {
    const home = H("homePage");
    let el = H("bkBanner");
    const days = Math.floor((Date.now() - S().lastBackup) / DAY);
    const show = home && !S().noRemind && days >= 7 && Date.now() > (S().snooze || 0);
    if (!show) { if (el) el.remove(); lastB = ""; return; }
    const html = `<div><b>Sudah ${days} hari belum backup</b><small>Semua datamu tersimpan di HP ini saja.</small></div><div class="cfg-btns"><button type="button" class="mini-button on" data-b="now">Backup</button><button type="button" class="mini-button" data-b="later">Nanti</button></div>`;
    if (!el) {
      el = document.createElement("section");
      el.id = "bkBanner";
      el.className = "card cfg-row bk";
      el.onclick = e => {
        const b = e.target.closest("button");
        if (!b) return;
        if (b.dataset.b === "now") H("exportDataButton")?.click();
        else { S().snooze = Date.now() + 2 * DAY; persist(); banner(); }
      };
      const h = home.querySelector(".top-header");
      h ? h.after(el) : home.prepend(el);
    }
    if (html !== lastB) { lastB = html; el.innerHTML = html; }
  }

  function ui() {
    const page = H("settingsPage");
    if (!page || H("extraCfg")) return;
    const box = document.createElement("section");
    box.id = "extraCfg";
    box.className = "card";
    (page.querySelector("main") || page).prepend(box);
    const draw = () => {
      const row = (k, on, t, s) => `<div class="cfg-row"><div><b>${t}</b><small>${s}</small></div><div class="cfg-btns"><button type="button" class="mini-button${on ? " on" : ""}" data-k="${k}">${on ? "Aktif" : "Mati"}</button></div></div>`;
      box.innerHTML = "<h2>Tambahan</h2>" +
        row("freeze", !!S().freeze, "Freeze streak", "Boleh bolong 1 hari tiap minggu tanpa memutus streak") +
        row("noRemind", !S().noRemind, "Pengingat backup", "Muncul di Today kalau sudah 7 hari belum backup");
    };
    draw();
    box.onclick = e => {
      const b = e.target.closest("button");
      if (!b) return;
      S()[b.dataset.k] = !S()[b.dataset.k];
      persist();
      draw();
      banner();
    };
  }

  ui();
  banner();
  setInterval(() => { ui(); banner(); }, 3000);
})();
