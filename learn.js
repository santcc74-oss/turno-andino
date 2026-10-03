/* Turno Andino — capacitación: primero se estudia el tema, después se juega.
   Aula por ciudad, reproductor de lecciones (explicación sencilla, lecciones, objetivos y comprobación),
   guías «cómo se juega» y reglas de qué minijuegos ya están disponibles. */
(function () {
  const { esc } = TA;
  const LESSON_XP = 20, LESSON_MONEY = 15;
  const G = window.GLOSSARY_PLUS || {};
  const S = () => TA.S;
  const mod = (id) => MODULES.find((m) => m.id === id);
  /* Los niveles del Campamento Linux (lx…) cuentan como temas estudiados para desbloquear juegos. */
  const learned = (id) => (/^lx\d/.test(id) ? !!(S().linux && S().linux.done && S().linux.done[id]) : !!(S().learned && S().learned[id]));

  /* ——— Reglas ——— */
  function needsMet(n) {
    if (!n) return true;
    if (Array.isArray(n)) return n.every(learned);
    return (n.any || []).some(learned);
  }
  const typeAllowed = (type) => needsMet(TYPE_NEEDS[type]);
  const itemAllowed = (id) => needsMet(ITEM_NEEDS[id]);
  function orderAllowed(title) {
    const r = ORDER_NEEDS.find(([re]) => re.test(title));
    return r ? needsMet(r[1]) : false;
  }
  const decodeKinds = () => Object.keys(DECODE_NEEDS).filter((k) => needsMet(DECODE_NEEDS[k]));

  const cityMods = (code) => TA.cityByCode(code).mods;
  function cityProgress(code) {
    const mods = cityMods(code);
    return { done: mods.filter(learned).length, total: mods.length, next: mods.find((m) => !learned(m)) || null };
  }
  const canWork = (code) => cityProgress(code).done > 0 && !(window.LINUX && LINUX.blocking());
  const allLearned = (code) => cityProgress(code).done === cityMods(code).length;
  const minutes = (id) => {
    const m = mod(id);
    const w = m.lessons.reduce((s, l) => s + l.b.split(/\s+/).length, 0) + ((window.EXPLAIN || {})[id] || "").split(/\s+/).length;
    return Math.max(2, Math.round(w / 150) + 1);
  };

  /* ——— Texto de las lecciones: las marcas {{clave|texto}} se vuelven palabras del diccionario ——— */
  /* Nombre en español para las marcas sin texto propio (las lecciones originales usaban el término en inglés). */
  const LABEL = { mac: "MAC", owasp: "OWASP Top 10", mitre: "MITRE ATT&CK", sigma: "reglas Sigma", forense: "análisis forense",
    aml: "AML/SARLAFT", rto: "RTO/RPO", http: "HTTP/HTTPS", ids: "IDS/IPS" };
  function spanishLabel(k) {
    if (LABEL[k]) return LABEL[k];
    const al = G[k] && (G[k].al || [])[0];
    return al ? al.replace(/^=/, "") : GLOSSARY[k] ? GLOSSARY[k][0] : k;
  }
  function lessonHtml(b) {
    return b.replace(/\{\{(\w+)(?:\|([^}]+))?\}\}/g, (_, k, txt, at, all) => {
      let label = txt || spanishLabel(k);
      /* Mayúscula si la palabra empieza una oración. */
      if (!txt && (at === 0 || /(^|[.:>]\s*)$/.test(all.slice(Math.max(0, at - 3), at)))) label = label.charAt(0).toUpperCase() + label.slice(1);
      return G[k] ? `<button type="button" class="gl" data-k="${k}">${esc(label)}</button>` : esc(label);
    });
  }

  function overlay(cls, label) {
    const el = document.createElement("div");
    el.className = "picker " + cls;
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", label);
    document.body.appendChild(el);
    document.body.classList.add("playing");
    return el;
  }
  const closeOverlay = (el) => { el.remove(); if (document.getElementById("play").hidden && !document.querySelector(".picker")) document.body.classList.remove("playing"); };

  /* ——— Reproductor de una lección ——— */
  function lesson(id, onDone) {
    const m = mod(id), expl = (window.EXPLAIN || {})[id];
    const cards = [];
    if (expl) cards.push({ k: "En palabras simples", html: `<p class="ls-simple">${GLOSS.link(esc(expl), 4)}</p>` });
    m.lessons.forEach((l) => cards.push({ k: l.t, html: `<div class="ls-body">${lessonHtml(l.b)}</div>` }));
    cards.push({ k: "Lo que ya sabes hacer", html: `<p class="small">Si entendiste la lección, ahora puedes:</p><ul class="ls-obj">${m.objectives.map((o) => `<li>${esc(o)}</li>`).join("")}</ul>` });
    const checks = TA.shuffle((OBJCHECKS[id] || []).slice());
    const el = overlay("lesson", m.title);
    let i = 0, right = 0, qi = 0;
    const total = cards.length + 1;
    const dots = (n) => `<div class="ls-dots" aria-hidden="true">${Array.from({ length: total }, (_, k) => `<i class="${k < n ? "on" : k === n ? "cur" : ""}"></i>`).join("")}</div>`;
    const head = () => `<header class="ls-head"><button class="icon-btn" data-x aria-label="Cerrar la lección"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      <div><p class="eyebrow">Capacitación · ${minutes(id)} min</p><h2>${esc(m.title)}</h2></div></header>${dots(i)}`;
    const draw = () => {
      if (i < cards.length) {
        const c = cards[i];
        el.innerHTML = `<div class="picker-in">${head()}
          <article class="ls-card"><p class="eyebrow">${i + 1} de ${cards.length} · ${esc(c.k)}</p>${c.html}</article>
          <p class="small center">Las palabras subrayadas se tocan para ver qué significan.</p>
          <div class="duo">${i ? `<button class="btn" data-prev>Atrás</button>` : `<span></span>`}<button class="btn primary" data-next>${i + 1 < cards.length ? "Siguiente" : "Comprobar lo aprendido"}</button></div></div>`;
        el.querySelector("[data-next]").onclick = () => { i += 1; draw(); el.scrollTop = 0; };
        const p = el.querySelector("[data-prev]"); if (p) p.onclick = () => { i -= 1; draw(); el.scrollTop = 0; };
      } else check();
      el.querySelector("[data-x]").onclick = () => closeOverlay(el);
    };
    const check = () => {
      if (!checks.length) return finish();
      const q = checks[qi % checks.length];
      const opts = TA.shuffle(q.a.map((t, k) => ({ t, ok: k === q.c })));
      el.innerHTML = `<div class="picker-in">${head()}
        <article class="ls-card"><p class="eyebrow">Comprobación · ${right} de 2 correctas</p><h3 class="t-q">${GLOSS.link(esc(q.q), 3)}</h3></article>
        <div class="opts">${opts.map((o, k) => `<button class="opt" data-k="${k}">${esc(o.t)}</button>`).join("")}</div><div id="ls-fb"></div></div>`;
      el.querySelector("[data-x]").onclick = () => closeOverlay(el);
      el.querySelectorAll(".opt").forEach((b) => b.onclick = () => {
        const o = opts[+b.dataset.k];
        el.querySelectorAll(".opt").forEach((x, k) => { x.disabled = true; if (opts[k].ok) x.classList.add("right"); });
        if (!o.ok) b.classList.add("wrong"); else right += 1;
        qi += 1;
        const fb = el.querySelector("#ls-fb");
        fb.innerHTML = `<div class="ex-why ${o.ok ? "is-ok" : "is-bad"}"><p class="sheet-k">${o.ok ? "Correcto" : "Todavía no"}</p><p>${esc(q.w || "")}</p>
          <button class="btn primary wide" data-go>${right >= 2 ? "Terminar la lección" : o.ok ? "Otra pregunta" : "Intentar con otra pregunta"}</button>
          ${o.ok ? "" : `<button class="btn ghost wide" data-review>Volver a leer la lección</button>`}</div>`;
        fb.querySelector("[data-go]").onclick = () => (right >= 2 ? finish() : check());
        const r = fb.querySelector("[data-review]"); if (r) r.onclick = () => { i = 0; draw(); el.scrollTop = 0; };
        fb.scrollIntoView({ block: "nearest" });
      });
    };
    const finish = () => {
      const first = !learned(id);
      if (first) {
        if (!S().learned) S().learned = {};
        S().learned[id] = TA.dayKey();
        const before = TA.rankInfo(S().xp);
        S().xp += LESSON_XP; S().money += LESSON_MONEY;
        TA.save();
        if (window.PROG) PROG.learn();
        const after = TA.rankInfo(S().xp);
        if (after.i > before.i) setTimeout(() => ART.promoCeremony(after), 400);
      }
      el.innerHTML = `<div class="picker-in">${head()}
        <div class="ls-done">${ART.portrait("marta", "happy")}<h2>Tema aprendido</h2>
        <p>${first ? `+${LESSON_XP} de reputación y ${TA.money(LESSON_MONEY)}. Desde ahora, las preguntas de este tema pueden salir en tus turnos.` : "Ya lo tenías aprendido: el repaso nunca sobra."}</p>
        <button class="btn primary wide big" data-ok>Continuar</button></div></div>`;
      if (first) ART.confetti();
      el.querySelector("[data-ok]").onclick = () => { closeOverlay(el); if (onDone) onDone(first); };
      el.querySelector("[data-x]").onclick = () => { closeOverlay(el); if (onDone) onDone(first); };
    };
    draw();
  }

  /* ——— Aula: los temas de la ciudad, la inducción de tu carrera y los repasos ——— */
  function aula(code, onClose) {
    const city = TA.cityByCode(code);
    const el = overlay("aula", "Capacitación");
    const row = (id, extra) => `<li><button class="ls-row ${learned(id) ? "done" : ""}" data-mod="${id}" ${window.LINUX && LINUX.blocking() ? "disabled" : ""}>
      <span class="ls-state" aria-hidden="true">${learned(id) ? "✓" : "▶"}</span>
      <span><b>${esc(mod(id).title)}</b><small>${esc(mod(id).summary)}</small><small class="mono">${minutes(id)} min${extra ? " · " + extra : ""}</small></span></button></li>`;
    const draw = () => {
      const p = cityProgress(code), car = window.CAREER && CAREER.current();
      const carMods = car ? (CAREER_MODS[car.id] || []).filter((m) => !city.mods.includes(m)) : [];
      const past = CITIES.filter((c) => c.code !== code && TA.cityOpen(c.code)).flatMap((c) => c.mods).filter((m) => !carMods.includes(m));
      el.innerHTML = `<div class="picker-in">
        <header class="ls-head"><button class="icon-btn" data-x aria-label="Cerrar la capacitación"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
          <div><p class="eyebrow">Capacitación · ${esc(city.city)}</p><h2>${p.done} de ${p.total} temas aprendidos</h2></div></header>
        <div class="bar"><i style="width:${(p.done / p.total) * 100}%"></i></div>
        <p class="small">Primero estudias, después trabajas: en tus turnos solo salen preguntas de los temas que ya aprendiste. Con los ${p.total} temas se abre el examen de sede.</p>
        ${window.LINUX && LINUX.blocking() ? `<section class="camp-lock"><p><b>Primero, el Campamento Linux.</b> Antes de la ciberseguridad aprendes a usar la terminal: ${LINUX.count()} de ${LX_LEVELS.length} niveles hechos.</p><button class="btn primary wide" data-camp>Ir al Campamento Linux</button></section>` : ""}
        <ul class="ls-list">${city.mods.map((m) => row(m)).join("")}</ul>
        ${carMods.length ? `<section class="block"><h3>Inducción de tu carrera: ${esc(car.name)}</h3><p class="small">Estos temas te preparan para los casos de especialidad.</p><ul class="ls-list">${carMods.map((m) => row(m, "especialidad")).join("")}</ul></section>` : ""}
        ${past.length ? `<details class="block"><summary>Repasar temas de otras sedes (${past.length})</summary><ul class="ls-list">${past.map((m) => row(m)).join("")}</ul></details>` : ""}
      </div>`;
      el.querySelector("[data-x]").onclick = () => { closeOverlay(el); if (onClose) onClose(); };
      el.querySelectorAll("[data-mod]").forEach((b) => b.onclick = () => lesson(b.dataset.mod, () => draw()));
      const camp = el.querySelector("[data-camp]"); if (camp) camp.onclick = () => LINUX.open(() => draw());
    };
    draw();
  }

  /* ——— Guía «cómo se juega» ——— */
  const primerKey = (t) => (t.type === "match" ? (t.en ? "english" : "ports") : t.type);
  const needsPrimer = (t) => { const k = primerKey(t); return !!PRIMERS[k] && !(S().primers && S().primers[k]); };
  function primer(root, t, onOk) {
    const k = primerKey(t), p = PRIMERS[k];
    root.innerHTML = `<article class="ticket primer">
      <p class="t-label">Primera vez · cómo se juega</p>
      <h3 class="t-q">${esc(p.title)}</h3>
      <p>${GLOSS.link(esc(p.intro), 3)}</p>
      <p class="eyebrow">Lo que necesitas saber</p>
      <ul class="ls-obj">${p.points.map((x) => `<li>${GLOSS.link(esc(x), 2)}</li>`).join("")}</ul>
      ${p.example ? `<pre class="primer-ex mono">${esc(p.example)}</pre>` : ""}
      <p class="primer-how"><b>Cómo se juega:</b> ${esc(p.how)}</p>
      <button class="btn primary wide big" id="primer-ok">Entendido, a jugar</button>
    </article>`;
    root.querySelector("#primer-ok").onclick = () => {
      if (!S().primers) S().primers = {};
      S().primers[k] = TA.dayKey();
      TA.save();
      onOk();
    };
  }

  window.LEARN = { learned, needsMet, typeAllowed, itemAllowed, orderAllowed, decodeKinds, cityProgress, canWork, allLearned, minutes, lesson, aula, primer, needsPrimer, lessonHtml, LESSON_XP };
})();
