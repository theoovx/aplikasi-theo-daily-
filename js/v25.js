/* THEO v2.5 PATCH: Today bisa diatur */
(function () {
  const S = () => (data.settings ||= {});
  const H = id => document.getElementById(id);
  const Q = s => document.querySelector(s);
  const SECS = [
    ["reminder", "Pengingat berikutnya", "Jam tugas terdekat yang akan datang", () => Q("#homePage .next-reminder")],
    ["progress", "Progres hari ini", "Berapa tugas yang sudah selesai", () => H("completedCount")?.closest("section")],
    ["suggest", "Saran sekarang", "App memilihkan satu tugas yang cocok dikerjakan sekarang", () => H("suggestionTitle")?.closest("section")],
    ["tasks", "Tugas hari ini", "Daftar tugas untuk dicentang", () => H("taskList")?.closest("section")],
    ["minimum", "Hari malas", "Tombol darurat: cukup satu hal kecil saat lagi nggak semangat", () => Q("#homePage .minimum-day")]
  ];
  let lastOrder = "";
  const order = () => {
    const o = (S().order || []).filter(k => SECS.some(s => s[0] === k));
    SECS.forEach(s => { if (!o.includes(s[0])) o.push(s[0]); });
    return o;
  };
  function apply() {
    const hide = S().hide || {}, o = order(), key = o.join();
    o.forEach(k => {
      const el = SECS.find(s => s[0] === k)[3]();
      if (!el) return;
      el.classList.toggle("t-hide", !!hide[k]);
      if (key !== lastOrder) el.parentNode.appendChild(el);
    });
    lastOrder = key;
  }
  function draw() {
    const box = H("todayCfg"), hide = S().hide || {}, o = order();
    if (!box) return;
    box.innerHTML = "<h2>Tampilan Today</h2><p class=\"settings-note\">Pilih bagian yang tampil dan atur urutannya.</p>" +
      o.map((k, i) => {
        const s = SECS.find(x => x[0] === k);
        return `<div class="cfg-row"><div><b>${s[1]}</b><small>${s[2]}</small></div><div class="cfg-btns">` +
          `<button type="button" class="mini-button" data-mv="${k}" data-d="-1" ${i === 0 ? "disabled" : ""}>↑</button>` +
          `<button type="button" class="mini-button" data-mv="${k}" data-d="1" ${i === o.length - 1 ? "disabled" : ""}>↓</button>` +
          `<button type="button" class="mini-button${hide[k] ? "" : " on"}" data-t="${k}">${hide[k] ? "Mati" : "Tampil"}</button></div></div>`;
      }).join("");
  }
  function ui() {
    const page = H("settingsPage");
    if (!page || H("todayCfg")) return;
    const box = document.createElement("section");
    box.id = "todayCfg";
    box.className = "card";
    const main = page.querySelector("main");
    main ? main.prepend(box) : page.appendChild(box);
    draw();
    box.addEventListener("click", e => {
      const b = e.target.closest("button");
      if (!b || b.disabled) return;
      if (b.dataset.t) { const h = (S().hide ||= {}); h[b.dataset.t] = !h[b.dataset.t]; }
      if (b.dataset.mv) {
        const o = order(), i = o.indexOf(b.dataset.mv), j = i + Number(b.dataset.d);
        [o[i], o[j]] = [o[j], o[i]];
        S().order = o;
        lastOrder = "";
      }
      persist();
      draw();
      apply();
    });
  }
  function relabel() {
    const set = (el, t) => { if (el) el.textContent = t; };
    set(Q("#homePage .next-reminder .label"), "PENGINGAT BERIKUTNYA");
    set(H("completedCount")?.closest("section")?.querySelector(".label"), "PROGRES HARI INI");
    set(H("suggestionTitle")?.closest("section")?.querySelector(".section-title h2"), "Enaknya ngapain sekarang?");
    set(H("taskList")?.closest("section")?.querySelector(".section-title h2"), "Tugas hari ini");
    set(Q(".minimum-day .label"), "HARI MALAS");
    set(Q(".minimum-day h2"), "Cukup satu hal kecil.");
    set(Q(".minimum-day div > p:not(.label)"), "Lagi nggak semangat? Kerjakan satu hal berguna saja, hari tetap dihitung.");
  }
  relabel();
  ui();
  apply();
  setInterval(() => { ui(); apply(); }, 2000);
})();
