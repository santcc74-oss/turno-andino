/* Turno Andino — pantallas (Hoy, Rutas, Vida, Pasaporte, Perfil), bienvenida y arranque. */
(function () {
  const { esc } = TA;
  const $ = (sel) => document.querySelector(sel);
  let view = "hoy";

  const phaseName = (id) => (PHASES.find((p) => p.id === id) || {}).name || "";
  function cityState(code) {
    if (TA.S.stamps[code]) return "done";
    if (!TA.cityOpen(code)) return "shut";
    return TA.cityProg(code).good >= TA.GOOD_FOR_STAMP ? "exam" : "open";
  }
  const glyph = (g) => `<svg class="glyph" viewBox="0 0 24 24" aria-hidden="true">${GLYPHS[g] || ""}</svg>`;

  function topbar() {
    const S = TA.S, r = TA.rankInfo(S.xp), st = TA.streakAlive();
    $("#topbar").innerHTML = `
      <div class="brand"><span class="brand-mark" aria-hidden="true">TA</span><div><b>Turno Andino</b><small>${esc(r.name)}</small></div></div>
      <div class="pills">
        <span class="pill" title="Racha de días jugados"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 1.5 1 2 2.5 2 4 1-2 1.5-4 1-7z"/></svg>${st}</span>
        <span class="pill mono" title="Tu dinero">${TA.money(S.money)}</span>
      </div>`;
  }

  /* ——— Hoy ——— */
  function hoy() {
    const S = TA.S, city = TA.cityByCode(S.city), r = TA.rankInfo(S.xp), prog = TA.cityProg(city.code);
    const due = TA.dueReview().length;
    const nextDossier = DOSSIER.find((d) => S.cama.caught < d[0]);
    const tip = MARTA_TIPS[new Date().getDate() % MARTA_TIPS.length];
    const pending = S.cur ? TA.cityByCode(S.cur.city) : null;
    const st = cityState(city.code);
    const examCity = S.exam ? TA.cityByCode(S.exam.city) : null;
    return `
      <section class="career">
        <div class="career-row"><span class="eyebrow">Tu cargo</span><span class="small">${r.next ? "Faltan " + r.need + " de reputación para " + esc(r.next) : "Llegaste a la cima"}</span></div>
        <h1>${esc(r.name)}</h1>
        <div class="bar" role="meter" aria-label="Progreso al siguiente cargo" aria-valuenow="${Math.round(r.pct * 100)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${r.pct * 100}%"></i></div>
        <p class="small mono">${S.xp.toLocaleString("es-CO")} REP · ${S.shifts} ${S.shifts === 1 ? "TURNO" : "TURNOS"}</p>
        ${careerLine()}
      </section>

      ${pending ? `<section class="resume">
        <div><p class="eyebrow">Turno a medias</p><p><b>${esc(pending.city)}</b> · ticket ${S.cur.i + 1} de ${S.cur.tickets.length}</p></div>
        <button class="btn primary" id="h-resume">Seguir</button>
      </section>` : ""}

      ${examCity ? `<section class="resume">
        <div><p class="eyebrow">Examen a medias</p><p><b>${esc(examCity.city)}</b> · pregunta ${Math.min(S.exam.i + 1, S.exam.ids.length)} de ${S.exam.ids.length}</p></div>
        <button class="btn primary" id="h-exam-resume">Seguir</button>
      </section>` : st === "exam" && LEARN.allLearned(city.code) ? `<section class="exam-card">
        ${ART.portrait("marta", "happy", "sm")}
        <div><p class="eyebrow">Examen de sala de espera listo</p><p>${PLAY.EXAM_N} preguntas de ${esc(city.city)}. Con ${PLAY.EXAM_PASS} aciertos ganas el sello.</p></div>
        <button class="btn primary wide" id="h-exam">Presentar el examen</button>
      </section>` : ""}

      ${trainingCard(city)}

      <section class="pass" aria-label="Pase de abordar de tu próximo turno">
        <div class="pass-scene">${SCENE.scene(city.code, { label: "Paisaje de " + city.city })}<span class="scene-tag mono">${esc(city.city)} · ${{ day: "de día", dusk: "atardecer", night: "de noche" }[SCENE.phase()]}</span></div>
        <div class="pass-main">
          <p class="eyebrow">Pase de turno · Banco Andino</p>
          <div class="route">
            <div><span class="iata">CASA</span><small>Tu lugar</small></div>
            <svg class="plane" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 13l8-1 4-8h2l-2 8 6-.5 2-2.5h1.5l-1 4 1 4H22l-2-2.5-6-.5 2 8h-2l-4-8-8-1z"/></svg>
            <div class="to"><span class="iata">${city.code}</span><small>${esc(city.city)}</small></div>
          </div>
          <p class="pass-office">${esc(city.office)}</p>
        </div>
        <div class="pass-stub">
          <dl>
            <div><dt>Puerta</dt><dd>${city.gate}</dd></div>
            <div><dt>Tickets</dt><dd>6</dd></div>
            <div><dt>Duración</dt><dd>≈3 min</dd></div>
            <div><dt>Sello</dt><dd>${st === "done" ? "Listo" : st === "exam" ? "Examen" : Math.min(prog.good, TA.GOOD_FOR_STAMP) + "/" + TA.GOOD_FOR_STAMP}</dd></div>
          </dl>
          ${LEARN.canWork(city.code) ? `<button class="btn primary wide big" id="h-start">${pending ? "Empezar uno nuevo" : "Empezar turno"}</button>`
            : `<button class="btn primary wide big" id="h-learn-first">Primero, tu capacitación</button><p class="small center">Estudia un tema de ${esc(city.city)} (unos ${LEARN.minutes(city.mods[0])} minutos) y se abre tu primer turno.</p>`}
        </div>
      </section>

      ${TYC.homeCard()}
      ${missionsCard()}

      <button class="arcade-card" id="h-arcade">
        <svg viewBox="0 0 48 32" aria-hidden="true"><rect x="2" y="4" width="44" height="24" rx="12"/><path d="M13 12v8M9 16h8"/><circle cx="33" cy="13" r="2.2"/><circle cx="38" cy="18" r="2.2"/></svg>
        <span><span class="eyebrow">Sala de juegos</span><b>Juega sin turno</b>
        <small>${Object.keys(GAMES).filter((g) => LEARN.typeAllowed(g)).length} de ${Object.keys(GAMES).length} juegos nuevos abiertos · firewall, triaje, cifrado y más</small></span>
      </button>

      <section class="duo-cards">
        <button class="card-btn" id="h-flash" ${TA.S.learned && Object.keys(TA.S.learned).length ? "" : "disabled"}>
          <span class="eyebrow">60 segundos</span><b>Repaso relámpago</b>
          <small>${S.flashBest ? "Récord: " + S.flashBest : "Para cuando anuncian tu vuelo"}</small>
        </button>
        <div class="card-btn static">
          <span class="eyebrow">Repaso pendiente</span><b>${due} ${due === 1 ? "tema" : "temas"}</b>
          <small>${due ? "Vuelven en tu próximo turno" : "Nada pendiente"}</small>
        </div>
      </section>

      <section class="note">
        ${ART.portrait("marta", "happy", "sm")}
        <p><small>Consejo de Marta</small>${esc(tip)}</p>
      </section>

      <section class="note cama-note">
        ${ART.portrait("cama", "smug", "sm")}
        <p><small>El Camaleón</small>Lo has atrapado ${S.cama.caught} ${S.cama.caught === 1 ? "vez" : "veces"}.
        ${nextDossier ? "Atrápalo " + (nextDossier[0] - S.cama.caught) + " más para abrir la siguiente página de su expediente." : "Su expediente está completo."}</p>
      </section>`;
  }

  function careerLine() {
    const c = CAREER.current();
    if (c) {
      const x = CAREER.info(c.id);
      return `<button class="car-line" id="h-career" style="--h:${c.hue}"><span class="car-dot" aria-hidden="true"></span>
        <span><b>${esc(c.name)}</b> · ${esc(x.title)}<small>${x.next ? "Faltan " + x.need + " de experiencia para " + esc(x.next) : "Llegaste al último cargo"}</small></span>
        <span class="bar sm"><i style="width:${x.pct * 100}%"></i></span></button>`;
    }
    if (CAREER.unlocked()) return `<button class="btn primary wide" id="h-pick">Elige tu especialidad</button>`;
    return `<p class="small">Al llegar a Analista SOC N2 eliges especialidad: SOC, forense, pentesting, AppSec, fraude, nube o cumplimiento.</p>`;
  }

  /* Tarjeta de capacitación de la sede actual. */
  function trainingCard(city) {
    const p = LEARN.cityProgress(city.code);
    if (!p.next) return `<section class="train done"><span class="ls-state" aria-hidden="true">✓</span><div><p class="eyebrow">Capacitación de ${esc(city.city)}</p><p>Los ${p.total} temas aprendidos.</p></div><button class="btn ghost" id="h-aula">Repasar</button></section>`;
    const m = MODULES.find((x) => x.id === p.next);
    return `<section class="train">
      <div class="train-top"><div><p class="eyebrow">Capacitación · ${esc(city.city)}</p><p><b>${p.done} de ${p.total} temas</b>${p.done ? "" : " · empieza aquí"}</p></div><button class="btn ghost" id="h-aula">Ver todo</button></div>
      <div class="bar sm"><i style="width:${(p.done / p.total) * 100}%"></i></div>
      <button class="train-next" id="h-lesson" data-mod="${m.id}"><span class="ls-state" aria-hidden="true">▶</span><span><b>${esc(m.title)}</b><small>${esc(m.summary)}</small><small class="mono">${LEARN.minutes(m.id)} min de lectura</small></span></button>
      ${p.done && TA.cityProg(city.code).good >= TA.GOOD_FOR_STAMP ? `<p class="small">Tu examen de sede se abre cuando estudies los ${p.total} temas.</p>` : ""}
    </section>`;
  }

  function missionsCard() {
    const m = PROG.missions();
    const row = (x, weekly) => `<li class="${x.claimed ? "claimed" : x.done ? "done" : ""} ${weekly ? "weekly" : ""}">
      <div class="ms-t"><span>${esc(x.text)}</span><span class="mono small">${x.prog}/${x.goal}</span></div>
      <div class="bar sm"><i style="width:${(x.prog / x.goal) * 100}%"></i></div>
      ${x.claimed ? `<span class="st done">Cobrada</span>` : x.done ? `<button class="btn primary claim" data-id="${x.id}">Cobrar ${TA.money(weekly ? m.weeklyPay.money : m.pay.money)} · +${weekly ? m.weeklyPay.xp : m.pay.xp} rep.</button>` : ""}
    </li>`;
    return `<section class="missions" aria-label="Misiones">
      <div class="ms-head"><p class="eyebrow">Misiones de hoy</p><span class="small">Se renuevan a medianoche</span></div>
      <ul>${m.daily.map((x) => row(x, false)).join("")}</ul>
      <p class="small">${m.bonus ? "Bono del día cobrado." : `Cobra las 3 y ganas ${TA.money(m.bonusPay)} extra.`}</p>
      <div class="ms-head"><p class="eyebrow">Misión de la semana</p></div>
      <ul>${row(m.weekly, true)}</ul>
    </section>`;
  }

  /* ——— Rutas ——— */
  const STATUS = { done: ["done", "Con sello"], exam: ["exam", "Examen listo"], open: ["open", "Abierta"], shut: ["shut", "Cerrada"] };
  function rutas() {
    const S = TA.S, states = {};
    CITIES.forEach((c) => { states[c.code] = cityState(c.code); });
    const sel = TA.cityByCode(S.city), st = states[sel.code], p = TA.cityProg(sel.code);
    const dots = [0, 1, 2].map((i) => `<i class="${i < Math.min(p.good, TA.GOOD_FOR_STAMP) ? "on" : ""}"></i>`).join("") + `<i class="ex ${st === "done" ? "on" : ""}" title="Examen">E</i>`;
    const chip = (code) => { const x = STATUS[states[code]]; return `<span class="st ${x[0]}">${x[1]}</span>`; };
    const rows = CITIES.map((c) => `<li><button class="board-row ${S.city === c.code ? "sel" : ""}" data-code="${c.code}" ${states[c.code] === "shut" ? "disabled" : ""} aria-pressed="${S.city === c.code}">
        <span class="iata sm">${c.code}</span>
        <span class="b-city"><b>${esc(c.city)}</b><small>${esc(phaseName(c.phase))}</small></span>
        <span class="b-gate mono">${c.gate}</span>
        ${chip(c.code)}
      </button></li>`).join("");
    return `
      <section class="head">
        <p class="eyebrow">Salidas · Banco Andino</p>
        <h1>Rutas</h1>
        <p>Cada sede es un tema. Con ${TA.GOOD_FOR_STAMP} turnos de 2 estrellas se abre el examen de sede; si lo apruebas, ganas el sello y la siguiente ruta.</p>
      </section>
      <div class="map-wrap">${ART.map(states, sel.code)}</div>
      <section class="city-card" aria-live="polite">
        <div class="cc-scene">${SCENE.scene(sel.code, { label: "Paisaje de " + sel.city })}</div>
        <div class="cc-top"><span class="iata sm">${sel.code}</span><div class="cc-name"><b>${esc(sel.city)}, ${esc(sel.country)}</b><small>${esc(phaseName(sel.phase))} · Puerta ${sel.gate}</small></div>${chip(sel.code)}</div>
        <p class="small">${esc(sel.intro)}</p>
        <div class="cc-prog"><span class="small">Turnos buenos y examen</span><span class="dots">${dots}</span></div>
        <div class="stack">
          <button class="btn wide" id="rt-aula">Capacitación · ${LEARN.cityProgress(sel.code).done} de ${LEARN.cityProgress(sel.code).total} temas</button>
          ${st === "exam" && LEARN.allLearned(sel.code) ? `<button class="btn primary wide" id="rt-exam">Presentar el examen de sede</button>` : ""}
          ${LEARN.canWork(sel.code) ? `<button class="btn ${st === "exam" && LEARN.allLearned(sel.code) ? "" : "primary"} wide" id="rt-start">Empezar turno en ${esc(sel.city)}</button>` : `<p class="small center">Estudia un tema de ${esc(sel.city)} para abrir sus turnos.</p>`}
        </div>
      </section>
      <details class="board-box">
        <summary>Tablero de salidas</summary>
        <div class="board-head mono" aria-hidden="true"><span>VUELO</span><span>DESTINO</span><span>PUERTA</span><span>ESTADO</span></div>
        <ul class="board">${rows}</ul>
      </details>`;
  }

  /* ——— Pasaporte: sellos, logros, carrera y expediente ——— */
  let passTab = "sellos";
  const PASS_TABS = [["sellos", "Sellos"], ["logros", "Logros"], ["carrera", "Carrera"], ["archivo", "Archivo"], ["cama", "Camaleón"]];
  function pasaporte() {
    const S = TA.S, ri = TA.rankIndex(S.xp);
    const nStamps = Object.keys(S.stamps).length;
    const ach = PROG.achievements(), nGot = ach.filter((a) => a.got).length;
    const tabs = `<div class="seg seg5" role="tablist">${PASS_TABS.map(([k, l]) => `<button role="tab" data-tab="${k}" aria-selected="${passTab === k}">${l}</button>`).join("")}</div>`;
    let body = "";
    if (passTab === "sellos") {
      const stamps = CITIES.map((c, i) => S.stamps[c.code]
        ? `<li>${ART.stamp(c, i, S.stamps[c.code])}<small>${esc(c.city)}</small></li>`
        : `<li class="empty"><span class="mono">${c.code}</span><small>${esc(c.city)}</small></li>`).join("");
      body = `<p class="small">${nStamps} de ${CITIES.length} sellos. Cada sello es un tema que ya dominas.</p><ul class="stamps">${stamps}</ul>`;
    } else if (passTab === "logros") {
      const tiers = ["oro", "plata", "bronce"].map((t) => `<span class="tier-n t-${t}">${ach.filter((a) => a.got && a.tier === t).length} ${t}</span>`).join("");
      const groups = [...new Set(ach.map((a) => a.group))];
      body = `<p class="small">${nGot} de ${ach.length} logros. Cada logro paga: bronce ₳ 30, plata ₳ 80, oro ₳ 200.</p>
        <div class="tiers">${tiers}</div>
        ${groups.map((g) => `<section class="ach-group"><h2>${esc(g)}</h2><ul class="achs">${ach.filter((a) => a.group === g).map((a) => {
          const hidden = a.secret && !a.got;
          return `<li class="${a.got ? "got" : ""}">${PROG.medal(a, 40)}
            <div><b>${hidden ? "Logro secreto" : esc(a.name)}</b><small>${hidden ? "Sigue jugando para descubrirlo." : esc(a.desc)}</small>
            ${a.got ? `<span class="small mono">${a.got}</span>` : hidden ? "" : `<div class="bar sm"><i style="width:${(a.cur / a.goal) * 100}%"></i></div><span class="small mono">${a.cur}/${a.goal}</span>`}</div>
          </li>`; }).join("")}</ul></section>`).join("")}`;
    } else if (passTab === "archivo") {
      body = HIST.view();
    } else if (passTab === "carrera") {
      const cur = window.CAREER && CAREER.current();
      let spec = "";
      if (cur) {
        const x = CAREER.info(cur.id);
        spec = `<section class="spec" style="--h:${cur.hue}">
          <p class="eyebrow">Tu especialidad</p><h2>${esc(cur.name)}</h2>
          <p class="small">${esc(cur.day)}</p>
          <ol class="ladder">${cur.levels.map((l, i) => `<li class="${i < x.l ? "past" : i === x.l ? "now" : ""}"><span class="mono">${CAREER_LEVELS[i]}</span><b>${esc(l)}</b><small>${i === x.l ? x.xp + " exp." : ""}</small></li>`).join("")}</ol>
          <p class="small"><b>Certificaciones reales de referencia:</b> ${cur.certs.map((c) => esc(c[0]) + " (" + esc(c[1]) + ")").join(" · ")}</p>
          <button class="btn wide" id="pp-switch">Ver otras especialidades</button>
        </section>`;
      } else if (CAREER.unlocked()) {
        spec = `<button class="btn primary wide" id="pp-switch">Elige tu especialidad</button>`;
      } else {
        spec = `<p class="small">Las especialidades se desbloquean al llegar a Analista SOC N2. Estas son las opciones:</p>
          <ul class="car-preview">${CAREERS.map((c) => `<li style="--h:${c.hue}"><span class="car-dot" aria-hidden="true"></span><div><b>${esc(c.name)}</b><small>${esc(c.pitch)}</small></div></li>`).join("")}</ul>`;
      }
      const ladder = window.CAREER_RANKS.map((c, i) => `<li class="${i < ri ? "past" : i === ri ? "now" : ""}"><span class="mono">${c[0].toLocaleString("es-CO")}</span><b>${esc(c[1])}</b><small>${TA.money(c[2])}/turno</small></li>`).join("");
      body = `${spec}<section class="block"><h2>Cargos del banco</h2><ol class="ladder">${ladder}</ol></section>`;
    } else {
      const doss = DOSSIER.map((d) => S.cama.caught >= d[0]
        ? `<li><b>${esc(d[1])}</b><p>${esc(d[2])}</p></li>`
        : `<li class="locked"><b>Página cerrada</b><p>Atrápalo ${d[0]} ${d[0] === 1 ? "vez" : "veces"} para leerla.</p></li>`).join("");
      body = `<div class="cama-head">${ART.portrait("cama", S.cama.caught >= 22 ? "caught" : "smug")}<p class="small">Atrapado ${S.cama.caught} · Se escapó ${S.cama.missed}</p></div><ul class="dossier">${doss}</ul>`;
    }
    return `
      <section class="head">
        <p class="eyebrow">República del SOC · Pasaporte laboral</p>
        <h1>Pasaporte</h1>
      </section>
      ${tabs}
      <div class="seg-body">${body}</div>`;
  }

  /* ——— Perfil ——— */
  function perfil() {
    const S = TA.S, acc = S.answered ? Math.round((S.correct / S.answered) * 100) : 0;
    return `
      <section class="head">
        <p class="eyebrow">Tus números</p>
        <h1>Perfil</h1>
      </section>
      <dl class="tally wide">
        <div><dt>Turnos</dt><dd>${S.shifts}</dd></div>
        <div><dt>Precisión</dt><dd>${acc} %</dd></div>
        <div><dt>Reputación</dt><dd>${S.xp.toLocaleString("es-CO")}</dd></div>
        <div><dt>Mejor racha</dt><dd>${S.streak.best}</dd></div>
        <div><dt>Récord relámpago</dt><dd>${S.flashBest}</dd></div>
        <div><dt>Por repasar</dt><dd>${Object.keys(S.wrong).length}</dd></div>
      </dl>
      <section class="block">
        <h2>Diccionario del SOC</h2>
        <p class="small">${GLOSS.count()} términos explicados con palabras sencillas y ejemplos del banco. En los tickets, las palabras técnicas vienen subrayadas: tócalas para ver qué significan.</p>
        <button class="btn wide" id="pf-dict">Abrir el diccionario</button>
      </section>
      ${securityPlus()}
      <section class="block">
        <h2>Instálalo en tu iPhone</h2>
        <ol class="steps">
          <li>Abre la dirección del juego en <b>Safari</b>.</li>
          <li>Toca el botón <b>Compartir</b> (el cuadrado con la flecha).</li>
          <li>Elige <b>Añadir a pantalla de inicio</b>.</li>
          <li>Ábrelo una vez con internet. Después funciona sin conexión, en el avión o el bus.</li>
        </ol>
      </section>
      <section class="block">
        <h2>Respaldo de tu progreso</h2>
        <p class="small">Tu progreso vive en este teléfono. Copia el respaldo y guárdalo en tus notas; para recuperarlo, pégalo abajo.</p>
        <button class="btn wide" id="pf-copy">Copiar respaldo</button>
        <label class="small" for="pf-text">Respaldo</label>
        <textarea id="pf-text" class="mono" rows="4" placeholder="Pega aquí un respaldo para importarlo"></textarea>
        <button class="btn wide" id="pf-import">Importar respaldo</button>
        <p class="small" id="pf-msg" role="status"></p>
      </section>
      <section class="block">
        <h2>Empezar de cero</h2>
        <button class="btn ghost wide" id="pf-reset">Borrar mi progreso</button>
      </section>
      <p class="small">Turno Andino no usa sonido ni internet durante el juego. Personajes, banco y casos son ficticios.</p>`;
  }

  function securityPlus() {
    const r = PROG.readiness();
    return `<section class="block">
      <h2>Preparación para Security+</h2>
      <div class="ready"><span class="ready-n">${r.pct}<small>%</small></span>
        <p class="small">Estimación del juego según tus aciertos en los 5 dominios del examen SY0-701, ponderados por su peso. Cuenta completo cuando llevas 25 respuestas en un dominio. No es un puntaje oficial de CompTIA.</p></div>
      <ul class="doms">${r.rows.map((d) => `<li>
        <div class="dom-t"><span><b>${d.d}.</b> ${esc(d.name)}</span><span class="mono small">${d.w} %</span></div>
        <div class="bar sm ${d.n && d.acc < 0.7 ? "weak" : ""}"><i style="width:${Math.round(d.acc * 100)}%"></i></div>
        <span class="small">${d.n ? Math.round(d.acc * 100) + " % de aciertos en " + d.n + " respuestas" : "Sin respuestas todavía"}${d.n && d.acc < 0.7 ? " · tema para reforzar" : ""}</span>
      </li>`).join("")}</ul>
    </section>`;
  }

  const VIEWS = { hoy, rutas, vida: () => LIFE.view(), pasaporte, perfil, empresa: () => TYC.view() };

  function go(name) {
    view = VIEWS[name] ? name : "hoy";
    topbar();
    $("#view").innerHTML = VIEWS[view]();
    document.querySelectorAll(".tabs button").forEach((b) => b.setAttribute("aria-current", b.dataset.v === view ? "page" : "false"));
    wire();
    try { localStorage.setItem("turno-andino-tab", view); } catch (e) {}
  }

  function wire() {
    const on = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; };
    on("h-start", () => PLAY.start());
    on("h-resume", () => PLAY.resume());
    on("h-flash", () => PLAY.flash());
    on("h-arcade", () => ARCADE.open(() => go(view)));
    on("h-aula", () => LEARN.aula(TA.S.city, () => go(view)));
    on("h-lesson", () => LEARN.lesson(document.getElementById("h-lesson").dataset.mod, () => go(view)));
    on("h-learn-first", () => LEARN.lesson(LEARN.cityProgress(TA.S.city).next, () => go(view)));
    on("rt-aula", () => LEARN.aula(TA.S.city, () => go(view)));
    if (view === "vida") LIFE.wire(() => { const y = window.scrollY; go("vida"); window.scrollTo(0, y); });
    on("h-co", () => go("empresa"));
    if (view === "pasaporte" && passTab === "archivo") HIST.wire(() => go("pasaporte"));
    if (view === "empresa") TYC.wire(() => { const y = window.scrollY; go("empresa"); window.scrollTo(0, y); });
    on("h-pick", () => CAREER.picker({ onClose: () => go(view) }));
    on("h-career", () => { passTab = "carrera"; go("pasaporte"); });
    on("pp-switch", () => CAREER.picker({ onClose: () => go(view) }));
    on("pf-dict", () => GLOSS.dictionary());
    document.querySelectorAll(".claim").forEach((b) => b.onclick = () => {
      const r = PROG.claim(b.dataset.id);
      if (r) PROG.toast({ kind: "mission", title: "Cobraste la misión", text: "+" + TA.money(r.money) + " · +" + r.xp + " rep.", sub: r.bonus ? "Incluye el bono del día" : "" });
      go("hoy");
    });
    document.querySelectorAll(".seg button[data-tab]").forEach((b) => b.onclick = () => { passTab = b.dataset.tab; go("pasaporte"); });
    on("h-exam", () => PLAY.exam(TA.S.city));
    on("h-exam-resume", () => PLAY.exam(TA.S.exam.city));
    on("rt-exam", () => PLAY.exam(TA.S.city));
    on("rt-start", () => PLAY.start(TA.S.city));
    document.querySelectorAll(".map .nd[role=button]").forEach((g) => {
      const pickCity = () => { TA.S.city = g.dataset.code; TA.save(); go("rutas"); };
      g.addEventListener("click", pickCity);
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pickCity(); } });
    });
    const svg = document.querySelector(".map");
    if (svg) {
      const open = CITIES.filter((c) => TA.cityOpen(c.code));
      if (open.length > (TA.S.mapSeen || 1)) {
        const newest = open[open.length - 1].code;
        TA.S.mapSeen = open.length; TA.save();
        setTimeout(() => ART.flyTo(svg, newest), 350);
      }
    }
    document.querySelectorAll(".board-row").forEach((b) => b.onclick = () => { TA.S.city = b.dataset.code; TA.save(); go("rutas"); });
    on("pf-copy", () => {
      const txt = JSON.stringify(Object.assign({}, TA.S, { app: "turno-andino" }));
      const area = $("#pf-text"), msg = $("#pf-msg");
      const fallback = () => { area.value = txt; area.focus(); area.select(); msg.textContent = "Selecciona el texto y cópialo a mano."; };
      try {
        navigator.clipboard.writeText(txt).then(() => { msg.textContent = "Respaldo copiado. Pégalo en tus notas."; }, fallback);
      } catch (e) { fallback(); }
    });
    on("pf-import", () => {
      const msg = $("#pf-msg");
      try {
        const obj = JSON.parse($("#pf-text").value);
        if (!obj || obj.app !== "turno-andino") throw new Error();
        delete obj.app; TA.load(obj); go("perfil");
        $("#pf-msg").textContent = "Progreso recuperado.";
      } catch (e) { msg.textContent = "Ese texto no es un respaldo de Turno Andino. Copia el respaldo completo, desde { hasta }."; }
    });
    on("pf-reset", (e) => {
      if (!e.target.dataset.sure) { e.target.dataset.sure = "1"; e.target.textContent = "Toca otra vez para borrar todo (no se puede deshacer)"; return; }
      TA.reset(); go("hoy");
    });
  }

  /* ——— Bienvenida ——— */
  function intro() {
    const steps = [
      ["marta", "Bienvenido al Banco Andino", "Soy Marta Quintero, jefa del SOC. Empiezas como practicante. Cada turno dura unos 3 minutos y trae 6 tickets: correos, llamadas, alertas y preguntas del equipo."],
      ["juli", "Primero aprendes, luego trabajas", "Cada ciudad empieza con su capacitación: lecciones cortas con explicaciones sencillas. Después resuelves tickets solo de lo que ya estudiaste. Resuelve cada ticket. Los aciertos te dan reputación y te acercan al ascenso. Los errores le bajan la salud al banco, pero siempre verás la explicación. Lo que falles volverá después para que lo repases."],
      ["cama", "Cuidado con el Camaleón", "Un estafador se disfraza de soporte, de presidente o de aerolínea. Cada vez que lo atrapes se abre una página de su expediente. Puedes pausar el turno cuando quieras: queda guardado."],
    ];
    let k = 0;
    const el = $("#intro");
    const draw = () => {
      const [who, h, p] = steps[k], c = CHARACTERS[who];
      el.innerHTML = `<div class="intro-card">
        <p class="eyebrow mono">${k + 1} / ${steps.length}</p>
        <div class="from">${ART.portrait(who, who === "cama" ? "smug" : "happy")}<div><b>${esc(c.name)}</b><small>${esc(c.role)}</small></div></div>
        <h2>${esc(h)}</h2><p>${esc(p)}</p>
        <button class="btn primary wide big" id="in-next">${k < steps.length - 1 ? "Siguiente" : "Empezar mi capacitación"}</button>
        ${k < steps.length - 1 ? `<button class="btn ghost wide" id="in-skip">Saltar</button>` : ""}
      </div>`;
      $("#in-next").onclick = () => { if (k < steps.length - 1) { k++; draw(); } else finish(true); };
      const sk = $("#in-skip"); if (sk) sk.onclick = () => finish(false);
    };
    const finish = (startNow) => { TA.S.intro = true; TA.save(); el.hidden = true; go("hoy"); if (startNow) LEARN.lesson(LEARN.cityProgress(TA.S.city).next || TA.cityByCode(TA.S.city).mods[0], () => go("hoy")); };
    el.hidden = false;
    draw();
  }

  /* ——— Arranque ——— */
  function boot() {
    document.querySelectorAll(".tabs button").forEach((b) => b.onclick = () => go(b.dataset.v));
    let tab = "hoy";
    try { tab = localStorage.getItem("turno-andino-tab") || "hoy"; } catch (e) {}
    PROG.ensureMissions();
    go(tab);
    PROG.check();
    if (TA.S.intro) CAREER.ensureOffer();
    if (!TA.S.intro) intro();
    /* En localhost solo se activa con #sw, para que los cambios se vean al recargar mientras se desarrolla. */
    const dev = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && location.hash !== "#sw";
    if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol) && !dev) {
      /* Si llega una versión nueva del juego, se recarga una vez para mostrarla (el progreso ya está guardado). */
      const hadController = !!navigator.serviceWorker.controller;
      let reloaded = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (hadController && !reloaded) { reloaded = true; location.reload(); }
      });
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
    try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {}
  }

  window.UI = { go, current: () => view };
  boot();
})();
