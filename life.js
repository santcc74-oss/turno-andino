/* Turno Andino — «Vida»: en qué gastar el salario.
   Equipo con 3 niveles, vivienda, vouchers de certificaciones reales (con examen) y recuerdos de viaje. */
(function () {
  const { esc, money } = TA;
  const S = () => TA.S;
  const PASS = 0.75;
  let tab = "equipo";
  const TABS = [["equipo", "Equipo"], ["provisiones", "Provisiones"], ["hogar", "Hogar"], ["formacion", "Formación"], ["ahorro", "Ahorro"], ["recuerdos", "Recuerdos"]];
  const sup = () => { if (!S().supplies) S().supplies = {}; return S().supplies; };
  const cdts = () => { if (!S().cdt) S().cdt = []; return S().cdt; };
  const confs = () => { if (!S().confs) S().confs = {}; return S().confs; };
  /* Preguntas para el mentor: primero las que fallaste, después las de tus temas que menos has visto. */
  function mentorPool() {
    const learnedIds = [...new Set(CITIES.flatMap((c) => TA.learnedQuizIds(c)))];
    const ok = (id) => { const q = TA.quizById(id); return q && Array.isArray(q.a); };
    const wrong = Object.keys(S().wrong || {}).filter((id) => learnedIds.includes(id) && ok(id));
    const rest = TA.shuffle(learnedIds.filter((id) => !wrong.includes(id) && ok(id))).sort((a, b) => TA.seenCount(a) - TA.seenCount(b));
    const out = [], seen = new Set();
    TA.shuffle(wrong).concat(rest).forEach((id) => { const k = TA.concept(id); if (!seen.has(k) && out.length < MENTOR.n) { seen.add(k); out.push(id); } });
    return { ids: out, weak: wrong.length };
  }
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
      <div class="seg seg6" role="tablist">${TABS.map(([k, l]) => `<button role="tab" data-life="${k}" aria-selected="${tab === k}">${l}</button>`).join("")}</div>`;
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
    provisiones() {
      return `<p class="small">Se gastan solas al empezar tu próximo turno: uno de cada tipo que tengas. Ideales antes de un examen de sede o de un turno difícil.</p>
        <ul class="shop">${SUPPLIES.map((x) => { const n = sup()[x.id] || 0;
          return `<li class="item ${n ? "own" : ""}">${glyph(x.glyph)}<div class="item-t"><b>${esc(x.name)}</b><small>${esc(x.eff)}</small><small class="mono">Tienes ${n} de ${x.max}</small></div>
            ${n >= x.max ? `<span class="st done">Lleno</span>` : `<button class="btn buy" data-sup="${x.id}" ${S().money >= x.price ? "" : "disabled"}>${money(x.price)}</button>`}</li>`; }).join("")}</ul>`;
    },
    formacion() {
      const mp = mentorPool();
      const mentor = `<section class="block"><h2>Sesión con mentor</h2>
        <div class="from">${ART.portrait(MENTOR.who, "happy", "sm")}<p class="small">${esc(CHARACTERS[MENTOR.who].name)} repasa contigo ${MENTOR.n} preguntas de tus temas más débiles y te explica cada respuesta. ${mp.weak ? `Tienes ${mp.weak} ${mp.weak === 1 ? "pregunta fallada" : "preguntas falladas"} por repasar.` : "Ahora mismo no tienes preguntas falladas: repasarás lo que menos has visto."}</p></div>
        ${mp.ids.length >= 3 ? `<button class="btn primary wide" data-mentor ${S().money >= MENTOR.price ? "" : "disabled"}>Pagar la sesión · ${money(MENTOR.price)}</button><p class="small">+${MENTOR.xpPer} de reputación por cada acierto. Sesiones hechas: ${S().mentorN || 0}.</p>`
          : `<p class="small">Estudia algún tema en Capacitación para tener material de repaso.</p>`}</section>`;
      const conf = `<section class="block"><h2>Conferencias</h2><p class="small">Conferencias reales de seguridad. Ganas reputación y contactos: con más contactos, los candidatos de tu empresa llegan con más experiencia.</p>
        <ul class="shop">${CONFS.map((c) => { const went = confs()[c.id];
          return `<li class="item ${went ? "own" : ""}">${glyph("bag")}<div class="item-t"><b>${esc(c.name)}</b><small>${esc(c.where)} · +${c.xp} de reputación · +${c.net} ${c.net === 1 ? "contacto" : "contactos"}</small>
            ${went ? `<small>Lo que aprendiste: ${esc(c.fact)}</small>` : ""}</div>
            ${went ? `<span class="st done">Fuiste</span>` : `<button class="btn buy" data-conf="${c.id}" ${S().money >= c.price ? "" : "disabled"}>${money(c.price)}</button>`}</li>`; }).join("")}</ul>
        <p class="small">Contactos: ${S().network || 0}.</p></section>`;
      return mentor + conf + `<section class="block"><h2>Certificaciones</h2>${TAB.certs()}</section>`;
    },
    ahorro() {
      const list = cdts(), now = S().shifts;
      return `<section class="block"><h2>CDT del Banco Andino</h2>
        <p class="small">Un CDT (certificado de depósito a término) es un ahorro a plazo fijo: dejas el dinero quieto un tiempo y el banco te lo devuelve con intereses. Si lo sacas antes, pierdes los intereses. Aquí el plazo se cuenta en turnos y las tasas son de juego; en la vida real se comparan por su tasa efectiva anual (EA).</p>
        ${list.length ? `<ul class="co-list">${list.map((c, i) => `<li class="co-card"><div class="cc-top"><div class="cc-name"><b>${money(c.amt)} al ${Math.round(c.rate * 100)} %</b><small>Te devuelve ${money(c.amt * (1 + c.rate))} · faltan ${Math.max(0, c.end - now)} ${c.end - now === 1 ? "turno" : "turnos"}</small></div></div>
          <div class="bar sm"><i style="width:${Math.min(100, ((now - c.start) / (c.end - c.start)) * 100)}%"></i></div>
          <button class="btn ghost" data-cdtx="${i}">Cancelar y recuperar ${money(c.amt)} sin intereses</button></li>`).join("")}</ul>` : `<p class="small">No tienes CDT abiertos.</p>`}</section>
        <section class="block"><h2>Abrir un CDT</h2><ul class="shop">${CDT_PLANS.map((p, i) => `<li class="item">${glyph("key")}<div class="item-t"><b>${p.days} turnos · +${Math.round(p.rate * 100)} %</b><small>Desde ${money(p.min)}. Con ${money(p.min * 2)} recibirías ${money(p.min * 2 * (1 + p.rate))}.</small></div>
          <div class="co-acts">${[p.min, Math.max(p.min * 2, Math.floor(S().money / 200) * 100)].map((a) => `<button class="btn buy" data-cdt="${i}" data-amt="${a}" ${S().money >= a ? "" : "disabled"}>${money(a)}</button>`).join("")}</div></li>`).join("")}</ul>
          <p class="small">El segundo botón deposita la mitad de tu saldo (desde el doble del mínimo).</p></section>`;
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

  function buySupply(id) {
    const x = SUPPLIES.find((s) => s.id === id), n = sup()[id] || 0;
    if (n >= x.max || S().money < x.price) return "No te alcanza todavía.";
    S().money -= x.price; sup()[id] = n + 1; TA.save(); PROG.buy("supply");
    return null;
  }
  function goConf(id) {
    const c = CONFS.find((x) => x.id === id);
    if (confs()[id] || S().money < c.price) return "No te alcanza todavía.";
    const before = TA.rankInfo(S().xp);
    S().money -= c.price; confs()[id] = TA.dayKey(); S().xp += c.xp; S().network = (S().network || 0) + c.net;
    if (S().co) S().co.rep = Math.min(100, S().co.rep + 2);
    TA.save(); PROG.check();
    PROG.toast({ kind: "mission", title: "Fuiste a " + c.name, text: "+" + c.xp + " de reputación y nuevos contactos", sub: c.where });
    const after = TA.rankInfo(S().xp);
    if (after.i > before.i) ART.promoCeremony(after);
    return null;
  }
  function openCdt(i, amt) {
    const p = CDT_PLANS[i];
    if (amt < p.min || S().money < amt) return "No te alcanza todavía.";
    S().money -= amt;
    cdts().push({ amt, rate: p.rate, start: S().shifts, end: S().shifts + p.days });
    TA.save(); PROG.buy("cdt");
    return null;
  }
  function cancelCdt(i) {
    const c = cdts()[i];
    if (!c) return null;
    S().money += c.amt; cdts().splice(i, 1); TA.save();
    return null;
  }
  /* Al cerrar cada turno: paga los CDT que vencieron. */
  function cdtTick() {
    const now = S().shifts, paid = [];
    S().cdt = cdts().filter((c) => { if (c.end > now) return true; const v = Math.round(c.amt * (1 + c.rate)); S().money += v; S().cdtPaid = (S().cdtPaid || 0) + 1; paid.push(v); return false; });
    paid.forEach((v) => PROG.toast({ kind: "mission", title: "Venció tu CDT", text: "El Banco Andino te pagó " + money(v), sub: "Capital más intereses" }));
    return paid;
  }
  /* Provisiones que se usan al empezar un turno. */
  function useSupplies(cur) {
    const s = sup(), used = [];
    const take = (id) => { if (!(s[id] > 0)) return false; s[id] -= 1; used.push(SUPPLIES.find((x) => x.id === id).name); return true; };
    if (take("tinto")) cur.hints += 1;
    if (take("plan")) cur.shield += 1;
    if (take("taxi")) cur.slaPlus = 10;
    if (take("desayuno")) cur.boost = 1.25;
    return used;
  }
  function packLine() {
    const own = SUPPLIES.filter((x) => (sup()[x.id] || 0) > 0);
    return own.length ? `<p class="small center pack">Llevas al turno: ${own.map((x) => esc(x.name.toLowerCase())).join(", ")}.</p>` : "";
  }

  /* ——— Sesión con el mentor ——— */
  function mentor(refresh) {
    const { ids } = mentorPool();
    if (ids.length < 3 || S().money < MENTOR.price) return;
    S().money -= MENTOR.price; TA.save();
    const el = document.createElement("div");
    el.className = "picker cert-exam";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Sesión con mentor");
    document.body.appendChild(el);
    document.body.classList.add("playing");
    const who = CHARACTERS[MENTOR.who];
    let k = 0, right = 0;
    const close = () => { el.remove(); if (document.getElementById("play").hidden) document.body.classList.remove("playing"); refresh(); };
    const ask = () => {
      if (k >= ids.length) return finish();
      const q = TA.quizById(ids[k]);
      const opts = TA.shuffle(q.a.map((t, j) => ({ t, ok: j === q.c })));
      el.innerHTML = `<div class="picker-in">
        <header class="ls-head"><button class="icon-btn" data-x aria-label="Terminar la sesión"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
          <div><p class="eyebrow">Sesión con ${esc(who.name)}</p><h2>Pregunta ${k + 1} de ${ids.length}</h2></div></header>
        <div class="bar"><i style="width:${(k / ids.length) * 100}%"></i></div>
        <article class="ls-card">${S().wrong && S().wrong[ids[k]] ? `<p class="eyebrow">La fallaste antes</p>` : ""}<h3 class="t-q">${GLOSS.link(esc(q.q), 3)}</h3></article>
        <div class="opts">${opts.map((o, j) => `<button class="opt" data-j="${j}">${esc(o.t)}</button>`).join("")}</div><div id="mt-fb"></div></div>`;
      el.querySelector("[data-x]").onclick = finish;
      el.querySelectorAll(".opt").forEach((b) => b.onclick = () => {
        const o = opts[+b.dataset.j];
        el.querySelectorAll(".opt").forEach((x, j) => { x.disabled = true; if (opts[j].ok) x.classList.add("right"); });
        if (!o.ok) b.classList.add("wrong"); else right += 1;
        TA.markResult(ids[k], o.ok); TA.markSeen(ids[k]);
        const fb = el.querySelector("#mt-fb");
        fb.innerHTML = `<div class="ex-why ${o.ok ? "is-ok" : "is-bad"}"><p class="sheet-k">${o.ok ? "Eso es" : "Mira por qué"}</p>
          <p>${GLOSS.link(esc(q.w || "La correcta es: " + q.a[q.c]), 3)}</p>${GLOSS.chips(q.q + " " + q.a[q.c] + " " + (q.w || ""))}
          <button class="btn primary wide" data-go>${k + 1 < ids.length ? "Siguiente" : "Terminar"}</button></div>`;
        fb.querySelector("[data-go]").onclick = () => { k += 1; ask(); el.scrollTop = 0; };
        fb.scrollIntoView({ block: "nearest" });
      });
    };
    const finish = () => {
      const before = TA.rankInfo(S().xp), xp = right * MENTOR.xpPer;
      S().xp += xp; S().mentorN = (S().mentorN || 0) + 1; TA.save(); PROG.check();
      el.innerHTML = `<div class="picker-in"><div class="ls-done">${ART.portrait(MENTOR.who, "happy")}<h2>Sesión terminada</h2>
        <p>${right} de ${k} correctas · +${xp} de reputación. ${right < k ? "Las que fallaste vuelven en tus repasos de los turnos." : "¡Impecable!"}</p>
        <button class="btn primary wide big" data-ok>Volver</button></div></div>`;
      el.querySelector("[data-ok]").onclick = close;
      const after = TA.rankInfo(S().xp);
      if (after.i > before.i) ART.promoCeremony(after);
    };
    ask();
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
    on("[data-sup]", (b) => act(() => buySupply(b.dataset.sup)));
    on("[data-conf]", (b) => act(() => goConf(b.dataset.conf)));
    on("[data-cdt]", (b) => act(() => openCdt(+b.dataset.cdt, +b.dataset.amt)));
    on("[data-cdtx]", (b) => { if (!b.dataset.sure) { b.dataset.sure = "1"; b.textContent = "¿Seguro? Pierdes los intereses"; return; } act(() => cancelCdt(+b.dataset.cdtx)); });
    on("[data-mentor]", () => mentor(refresh));
  }

  window.LIFE = { view, wire, certPool, cdtTick, useSupplies, packLine, mentorPool };
})();
