/* Turno Andino — «Vida»: en qué gastar el salario.
   Equipo con 3 niveles, vivienda, vouchers de certificaciones reales (con examen) y recuerdos de viaje. */
(function () {
  const { esc, money } = TA;
  const S = () => TA.S;
  const PASS = 0.75;
  let tab = "equipo";
  const TABS = [["equipo", "Equipo"], ["hogar", "Hogar"], ["certs", "Certificaciones"], ["recuerdos", "Recuerdos"]];
  const glyph = (g) => `<svg class="glyph" viewBox="0 0 24 24" aria-hidden="true">${GLYPHS[g] || ""}</svg>`;

  /* Preguntas disponibles para una certificación: de sus temas que ya estudiaste, sin conceptos repetidos. */
  function certPool(c) {
    const ids = [];
    c.mods.forEach((m) => {
      if (!LEARN.learned(m)) return;
      const city = CITIES.find((x) => x.mods.includes(m));
      TA.learnedQuizIds(city).filter((id) => TA.modOfId(id) === m).forEach((id) => ids.push(id));
    });
    const seen = new Set();
    return TA.shuffle(ids).filter((id) => { const k = TA.concept(id); if (seen.has(k)) return false; seen.add(k); return true; });
  }
  const certReady = (c) => c.mods.filter(LEARN.learned).length / c.mods.length;

  function view() {
    const s = S(), r = TA.rankInfo(s.xp), mult = TA.salaryMult();
    const shelf = GEAR.filter((g) => TA.level(g.id)).map((g) => `<span class="shelf-it" title="${esc(g.levels[TA.level(g.id) - 1][0])}">${glyph(g.glyph)}<i>${TA.level(g.id)}</i></span>`).join("");
    const head = `
      <section class="head"><p class="eyebrow">Tu vida fuera del SOC</p><h1>Vida</h1>
        <p>Hoy cobras hasta <b>${money(r.salary * mult)}</b> por turno${mult > 1 ? ` (tu salario base ${money(r.salary)} + ${Math.round((mult - 1) * 100)} % por tu equipo, tu hogar y tus certificaciones)` : ""}.</p></section>
      <section class="desk" aria-label="Tu escritorio">
        <p class="eyebrow">${esc(HOMES[s.home || 0].name)}</p>
        <div class="desk-shelf">${shelf || `<p class="small">Vacío por ahora. Con uno o dos turnos te alcanza para la primera planta.</p>`}</div>
        <p class="wallet mono">SALDO ${money(s.money)}</p>
      </section>
      <div class="seg" role="tablist">${TABS.map(([k, l]) => `<button role="tab" data-life="${k}" aria-selected="${tab === k}">${l}</button>`).join("")}</div>`;
    return head + `<div class="seg-body">${TAB[tab]()}</div><p class="small center" id="life-msg" role="status"></p>`;
  }

  const TAB = {
    equipo() {
      return `<ul class="shop">${GEAR.map((g) => {
        const lv = TA.level(g.id), next = g.levels[lv], cur = lv ? g.levels[lv - 1] : null;
        return `<li class="item ${lv ? "own" : ""}">${glyph(g.glyph)}
          <div class="item-t"><b>${esc(cur ? cur[0] : next[0])}</b>
            <small>${cur ? "Ahora: " + esc(cur[2]) : esc(next[2])}</small>
            ${cur && next ? `<small class="up">Mejora a <b>${esc(next[0])}</b>: ${esc(next[2])}</small>` : ""}
            <span class="lv" aria-label="Nivel ${lv} de ${g.levels.length}">${g.levels.map((_, i) => `<i class="${i < lv ? "on" : ""}"></i>`).join("")}</span></div>
          ${next ? `<button class="btn buy" data-gear="${g.id}" ${S().money >= next[1] ? "" : "disabled"}>${money(next[1])}</button>` : `<span class="st done">Máximo</span>`}</li>`;
      }).join("")}</ul>`;
    },
    hogar() {
      const h = S().home || 0;
      return `<p class="small">Cada vivienda nueva suma +5 % a tu salario de cada turno.</p><ul class="shop">${HOMES.map((x, i) => `<li class="item ${i <= h ? "own" : ""}">
        ${glyph("home")}<div class="item-t"><b>${esc(x.name)}</b><small>${esc(x.desc)}</small><small class="mono">+${i * 5} % de salario</small></div>
        ${i <= h ? `<span class="st done">${i === h ? "Vives aquí" : "Ya pasaste"}</span>` : i === h + 1 ? `<button class="btn buy" data-home="${i}" ${S().money >= x.price ? "" : "disabled"}>${money(x.price)}</button>` : `<span class="st shut">${money(x.price)}</span>`}</li>`).join("")}</ul>`;
    },
    certs() {
      return `<p class="small">Compras el voucher y presentas el examen con preguntas de los temas que ya estudiaste. Apruebas con el ${Math.round(PASS * 100)} %. Si no apruebas, pierdes el voucher, como en la vida real: estudia antes.</p>
        <ul class="co-list">${CERT_EXAMS.map((c) => {
          const got = S().certs && S().certs[c.id], ready = certReady(c), pool = certPool(c).length;
          const can = ready >= 0.6 && pool >= c.n;
          return `<li class="co-card cert ${got ? "got" : ""}"><div class="cc-top"><div class="cc-name"><b>${esc(c.name)}</b><small>${esc(c.note)}</small></div>${got ? '<span class="st done">Obtenida</span>' : ""}</div>
            <p class="small">${c.n} preguntas · premio: +${c.pay} % de salario y +${c.xp} de reputación</p>
            <div><span class="small">Temas estudiados: ${c.mods.filter(LEARN.learned).length} de ${c.mods.length}</span><div class="bar sm"><i style="width:${ready * 100}%"></i></div></div>
            ${got ? `<p class="small">Certificada el ${esc(got)}.</p>` : can ? `<button class="btn primary wide" data-cert="${c.id}" ${S().money >= c.price ? "" : "disabled"}>Comprar voucher y presentar · ${money(c.price)}</button>`
              : `<p class="small">Estudia al menos el 60 % de sus temas en Capacitación para poder presentarla.</p>`}</li>`;
        }).join("")}</ul>`;
    },
    recuerdos() {
      const own = S().souvenirs || {}, n = Object.keys(own).length, all = CITIES.length;
      return `<p class="small">Un recuerdo por cada ciudad donde tengas el sello. Con los ${all} completas la colección: ${money(500)} de premio.</p>
        <ul class="souv">${CITIES.map((c) => { const [name, price] = SOUVENIRS[c.code];
          return `<li class="${own[c.code] ? "got" : ""}">${SCENE.scene(c.code, { cls: "mini", phase: "day", label: c.city })}
            <b>${esc(own[c.code] || TA.S.stamps[c.code] ? name : "¿?")}</b><small>${esc(c.city)}</small>
            ${own[c.code] ? '<span class="st done">Tuyo</span>' : TA.S.stamps[c.code] ? `<button class="btn buy" data-souv="${c.code}" ${S().money >= price ? "" : "disabled"}>${money(price)}</button>` : '<span class="st shut">Sin sello</span>'}</li>`; }).join("")}</ul>
        <p class="small center">${n} de ${all} recuerdos.</p>`;
    },
  };

  /* ——— Compras ——— */
  function buyGear(id) {
    const g = GEAR.find((x) => x.id === id), lv = TA.level(id), next = g.levels[lv];
    if (!next || S().money < next[1]) return "No te alcanza todavía.";
    S().money -= next[1]; S().gear[id] = lv + 1; TA.save(); PROG.buy(id);
    return null;
  }
  function buyHome(i) {
    const h = HOMES[i];
    if (i !== (S().home || 0) + 1 || S().money < h.price) return "No te alcanza todavía.";
    S().money -= h.price; S().home = i; TA.save(); PROG.buy("home"); ART.confetti();
    return null;
  }
  function buySouvenir(code) {
    const price = SOUVENIRS[code][1];
    if (!TA.S.stamps[code] || S().money < price) return "No te alcanza todavía.";
    S().money -= price; S().souvenirs[code] = TA.dayKey();
    if (Object.keys(S().souvenirs).length === CITIES.length) { S().money += 500; PROG.toast({ kind: "mission", title: "Colección completa", text: "Todos los recuerdos del Banco Andino", sub: "+" + money(500) }); }
    TA.save(); PROG.buy("souvenir");
    return null;
  }

  /* ——— Examen de certificación ——— */
  function certExam(id, refresh) {
    const c = CERT_EXAMS.find((x) => x.id === id);
    if (S().money < c.price) return;
    const qs = certPool(c).slice(0, c.n);
    S().money -= c.price; TA.save();
    const el = document.createElement("div");
    el.className = "picker cert-exam";
    el.setAttribute("role", "dialog");
    document.body.appendChild(el);
    document.body.classList.add("playing");
    let k = 0, right = 0;
    const close = () => { el.remove(); if (document.getElementById("play").hidden) document.body.classList.remove("playing"); refresh(); };
    const ask = () => {
      if (k >= qs.length) return finish();
      const q = TA.quizById(qs[k]);
      const opts = TA.shuffle(q.a.map((t, j) => ({ t, ok: j === q.c })));
      el.innerHTML = `<div class="picker-in">
        <header class="ls-head"><button class="icon-btn" data-x aria-label="Abandonar el examen"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
          <div><p class="eyebrow">${esc(c.name)}</p><h2>Pregunta ${k + 1} de ${qs.length}</h2></div></header>
        <div class="bar"><i style="width:${(k / qs.length) * 100}%"></i></div>
        <article class="ls-card"><h3 class="t-q">${GLOSS.link(esc(q.q), 3)}</h3></article>
        <div class="opts">${opts.map((o, j) => `<button class="opt" data-j="${j}">${esc(o.t)}</button>`).join("")}</div>
        <p class="small center">Como en el examen real, aquí no ves la respuesta correcta hasta el final.</p></div>`;
      const x = el.querySelector("[data-x]");
      x.onclick = () => { if (!x.dataset.sure) { x.dataset.sure = "1"; x.setAttribute("aria-label", "Toca otra vez para abandonar: pierdes el voucher"); el.querySelector(".small.center").textContent = "Toca la X otra vez para abandonar. Perderás el voucher."; return; } close(); };
      el.querySelectorAll(".opt").forEach((b) => b.onclick = () => {
        const o = opts[+b.dataset.j];
        if (o.ok) right += 1;
        TA.markResult(qs[k], o.ok); TA.markSeen(qs[k]);
        k += 1; ask();
      });
    };
    const finish = () => {
      const pct = right / qs.length, pass = pct >= PASS;
      const before = TA.rankInfo(S().xp);
      if (pass) { S().certs[c.id] = TA.dayKey(); S().xp += c.xp; ART.confetti(); }
      TA.save(); PROG.check();
      el.innerHTML = `<div class="picker-in"><div class="ls-done">${ART.portrait("marta", pass ? "happy" : "worried")}
        <p class="eyebrow">${esc(c.name)}</p><h2>${pass ? "¡Certificado!" : "No aprobaste esta vez"}</h2>
        <p>${right} de ${qs.length} correctas (${Math.round(pct * 100)} %). ${pass ? `Tu salario sube ${c.pay} % y ganas ${c.xp} de reputación.` : `Necesitabas el ${Math.round(PASS * 100)} %. Las preguntas que fallaste vuelven en tus repasos: estudia y vuelve a intentarlo.`}</p>
        <button class="btn primary wide big" data-ok>Volver</button></div></div>`;
      el.querySelector("[data-ok]").onclick = close;
      const after = TA.rankInfo(S().xp);
      if (after.i > before.i) ART.promoCeremony(after);
    };
    ask();
  }

  function wire(refresh) {
    const msg = (t) => { const m = document.getElementById("life-msg"); if (m) m.textContent = t || ""; };
    const act = (fn) => { const e = fn(); if (e) msg(e); else refresh(); };
    const on = (sel, fn) => document.querySelectorAll(sel).forEach((b) => b.onclick = () => fn(b));
    on("[data-life]", (b) => { tab = b.dataset.life; refresh(); });
    on("[data-gear]", (b) => act(() => buyGear(b.dataset.gear)));
    on("[data-home]", (b) => act(() => buyHome(+b.dataset.home)));
    on("[data-souv]", (b) => act(() => buySouvenir(b.dataset.souv)));
    on("[data-cert]", (b) => certExam(b.dataset.cert, refresh));
  }

  window.LIFE = { view, wire, certPool };
})();
