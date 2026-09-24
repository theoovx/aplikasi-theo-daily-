/* THEO v2.7 PATCH: opening + hero Home */
(function () {
  const css = `
#splash{position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:radial-gradient(circle at 50% 40%,#1b2340,#05070d 70%);transition:opacity .5s,transform .5s}
#splash.out{opacity:0;transform:scale(1.06);pointer-events:none}
.sp-ring{width:84px;height:84px;margin-bottom:10px;border-radius:50%;border:4px solid transparent;border-top-color:#60a5fa;border-right-color:#a855f7;border-bottom-color:#f97316;animation:spSpin 1.1s linear infinite}
.sp-name{font:800 34px Inter,sans-serif;letter-spacing:.35em;text-indent:.35em;color:#fff;animation:spIn .8s both}
.sp-sub{font:600 12px Inter,sans-serif;letter-spacing:.6em;text-indent:.6em;color:#94a3b8;animation:spIn .8s .25s both}
@keyframes spSpin{to{transform:rotate(360deg)}}
@keyframes spIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.hero{position:relative;overflow:hidden;display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:center;margin:12px 0;padding:18px;border-radius:24px;border:1px solid var(--border);background:linear-gradient(135deg,rgba(var(--accent-rgb),.28),rgba(168,85,247,.16) 60%,transparent)}
.hero::before{content:"";position:absolute;width:180px;height:180px;right:-50px;top:-60px;border-radius:50%;background:rgba(var(--accent-rgb),.35);filter:blur(50px);animation:hFloat 6s ease-in-out infinite;pointer-events:none}
.h-ring{--p:0;position:relative;width:84px;height:84px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--accent) calc(var(--p) * 1%),rgba(255,255,255,.1) 0)}
.h-ring::before{content:"";position:absolute;inset:7px;border-radius:50%;background:var(--card,#111827)}
.h-ring b{position:relative;font-size:22px}
.h-txt{position:relative;min-width:0}
.h-txt small{color:var(--muted);font-size:12px}
.h-txt h2{margin:2px 0 6px;font-size:22px}
.h-txt p{margin:0 0 10px;font-size:13px;color:var(--muted);line-height:1.4}
.h-chips{display:flex;flex-wrap:wrap;gap:6px}
.h-chips span{padding:4px 10px;border-radius:99px;font-size:12px;font-weight:600;background:rgba(255,255,255,.08)}
@keyframes hFloat{50%{transform:translate(-20px,20px) scale(1.15)}}
@keyframes hRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
#homePage main.content > *{animation:hRise .55s both}
#homePage main.content > *:nth-child(2){animation-delay:.06s}
#homePage main.content > *:nth-child(3){animation-delay:.12s}
#homePage main.content > *:nth-child(4){animation-delay:.18s}
#homePage main.content > *:nth-child(5){animation-delay:.24s}
#homePage main.content > *:nth-child(n+6){animation-delay:.3s}`;
  const st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  const sp = document.createElement("div");
  sp.id = "splash";
  sp.innerHTML = '<div class="sp-ring"></div><div class="sp-name">THEO</div><div class="sp-sub">DAILY</div>';
  document.documentElement.appendChild(sp);
  const t0 = Date.now();
  const bye = () => { sp.classList.add("out"); setTimeout(() => sp.remove(), 600); };
  window.addEventListener("load", () => setTimeout(bye, Math.max(0, 1500 - (Date.now() - t0))));
  setTimeout(bye, 5000);

  let last = "";
  function sweep(r, p) {
    let v = 0;
    const t = setInterval(() => { v = Math.min(p, v + 3); r.style.setProperty("--p", v); if (v >= p) clearInterval(t); }, 16);
  }
  function hero() {
    if (typeof data === "undefined" || typeof totalXP !== "function") return;
    const home = document.getElementById("homePage"), hd = home && home.querySelector(".top-header");
    if (!hd) return;
    const xp = totalXP(), L = Math.floor(Math.sqrt(xp / 40)) + 1, lo = 40 * (L - 1) ** 2, hi = 40 * L * L;
    const p = Math.max(0, Math.min(100, Math.round((xp - lo) / (hi - lo) * 100)));
    const tasks = getTodayTasks(), done = tasks.filter(t => t.completed).length, hr = new Date().getHours();
    const g = hr < 11 ? "Selamat pagi" : hr < 15 ? "Selamat siang" : hr < 18 ? "Selamat sore" : "Selamat malam";
    const name = escapeHTML((data.settings && data.settings.name) || "Theo");
    const html = `<div class="h-ring"><b>${L}</b></div><div class="h-txt"><small>${g}</small><h2>${name}</h2><p>${DAILY[new Date().getDate() % DAILY.length]}</p><div class="h-chips"><span>Level ${L}</span><span>${done}/${tasks.length} tugas</span><span>🔥 ${dayStreak()} hari</span></div></div>`;
    let el = document.getElementById("heroCard");
    if (!el) { el = document.createElement("section"); el.id = "heroCard"; el.className = "card hero"; }
    if (hd.nextElementSibling !== el) hd.after(el);
    if (html !== last) { last = html; el.innerHTML = html; sweep(el.querySelector(".h-ring"), p); }
  }
  window.addEventListener("load", () => { hero(); setInterval(hero, 1500); });
})();
