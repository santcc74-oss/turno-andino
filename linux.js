/* Turno Andino — Campamento Linux: el módulo inicial antes de la ciberseguridad.
   Cada nivel: lecciones con ejemplos reales → práctica con misiones en la terminal simulada → comprobación.
   También: terminal libre, chuleta de comandos y el reto «Terminal en vivo» para turnos y Sala de juegos. */
(function () {
  const { esc } = TA;
  const S = () => TA.S;
  const LEVEL_XP = 20, LEVEL_MONEY = 15, CAMP_BONUS = 100;
  const st = () => { if (!S().linux) S().linux = { done: {} }; return S().linux; };
  const done = (id) => !!st().done[id];
  const count = () => LX_LEVELS.filter((l) => done(l.id)).length;
  const complete = () => count() === LX_LEVELS.length;
  const blocking = () => !!S().linuxReq && !complete();
  const next = () => LX_LEVELS.find((l) => !done(l.id)) || null;
  const unlocked = (i) => i === 0 || done(LX_LEVELS[i - 1].id);
  const lvl = (id) => LX_LEVELS.find((l) => l.id === id);

  function overlay(label) {
    const el = document.createElement("div");
    el.className = "picker lx-ov";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", label);
    document.body.appendChild(el);
    document.body.classList.add("playing");
    return el;
  }
  const close = (el) => { el.remove(); if (document.getElementById("play").hidden && !document.querySelector(".picker")) document.body.classList.remove("playing"); };
  const X = (label) => `<button class="icon-btn" data-x aria-label="${esc(label)}"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>`;
  const BACK = `<button class="icon-btn" data-back aria-label="Volver al campamento"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button>`;
  const PENGUIN = `<svg class="lx-peng" viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="27" rx="14" ry="17" fill="#0F1B2D"/><ellipse cx="24" cy="30" rx="9" ry="12" fill="#F5F1E8"/><circle cx="19.5" cy="17" r="2.4" fill="#F5F1E8"/><circle cx="28.5" cy="17" r="2.4" fill="#F5F1E8"/><circle cx="20" cy="17.4" r="1.1" fill="#0F1B2D"/><circle cx="28" cy="17.4" r="1.1" fill="#0F1B2D"/><path d="M21 21.5h6l-3 3.2z" fill="#E0AC52"/><ellipse cx="18" cy="44" rx="4.5" ry="2" fill="#E0AC52"/><ellipse cx="30" cy="44" rx="4.5" ry="2" fill="#E0AC52"/></svg>`;

  /* ——— Pantalla principal del campamento ——— */
  function open(onClose) {
    const el = overlay("Campamento Linux");
    const draw = () => {
      const n = count(), total = LX_LEVELS.length;
      el.innerHTML = `<div class="picker-in">
        <header class="ls-head">${X("Cerrar el campamento")}<div><p class="eyebrow">Paso cero · antes de la ciberseguridad</p><h2>Campamento Linux</h2></div></header>
        <section class="lx-hero">${PENGUIN}<p>Los servidores del banco usan Linux y no tienen ratón: todo se hace escribiendo comandos. Aquí aprendes la terminal desde cero, con un servidor de práctica donde no puedes romper nada.</p></section>
        <div class="bar"><i style="width:${(n / total) * 100}%"></i></div>
        <p class="small">${n} de ${total} niveles · ${blocking() ? "Termina el campamento y se abre tu primera ciudad, Bogotá." : complete() ? "Campamento completo: ya hablas el idioma de los servidores." : "Recomendado antes de seguir con la ruta."}</p>
        <ol class="ls-list lx-levels">${LX_LEVELS.map((l, i) => {
          const ok = done(l.id), open = unlocked(i);
          return `<li><button class="ls-row ${ok ? "done" : ""}" data-l="${l.id}" ${open ? "" : "disabled"}>
            <span class="ls-state" aria-hidden="true">${ok ? "✓" : open ? i + 1 : "🔒"}</span>
            <span><b>${esc(l.title)}</b><small>${esc(l.summary)}</small><small class="mono">${l.mins} min · ${l.missions.length} misiones${open ? "" : " · termina el nivel anterior"}</small></span></button></li>`;
        }).join("")}</ol>
        <div class="duo"><button class="btn" data-cheat>Chuleta de comandos</button><button class="btn" data-free ${done("lx1") ? "" : "disabled"}>Terminal libre</button></div>
        ${done("lx1") ? "" : `<p class="small center">La terminal libre se abre al terminar el nivel 1.</p>`}
      </div>`;
      el.querySelector("[data-x]").onclick = () => { close(el); if (onClose) onClose(); };
      el.querySelectorAll("[data-l]").forEach((b) => b.onclick = () => level(b.dataset.l, draw));
      el.querySelector("[data-cheat]").onclick = () => cheat();
      el.querySelector("[data-free]").onclick = () => free();
    };
    draw();
  }

  /* ——— Un nivel ——— */
  function level(id, onBack) {
    const L = lvl(id);
    const el = overlay(L.title);
    let i = 0;
    const total = L.cards.length + 2;
    const dots = (n) => `<div class="ls-dots" aria-hidden="true">${Array.from({ length: total }, (_, k) => `<i class="${k < n ? "on" : k === n ? "cur" : ""}"></i>`).join("")}</div>`;
    const head = (n, sub) => `<header class="ls-head">${X("Cerrar el nivel")}<div><p class="eyebrow">Campamento Linux · ${esc(sub)}</p><h2>${esc(L.title)}</h2></div></header>${dots(n)}`;
    const leave = () => { close(el); if (onBack) onBack(); };
    const wireGl = () => el.querySelectorAll("[data-x]").forEach((b) => b.onclick = leave);

    const lesson = () => {
      const c = L.cards[i];
      el.innerHTML = `<div class="picker-in">${head(i, `${L.mins} min`)}
        <article class="ls-card lx-card"><p class="eyebrow">${i + 1} de ${L.cards.length} · ${esc(c.t)}</p><div class="ls-body">${LEARN.lessonHtml(c.b)}</div></article>
        <p class="small center">Las palabras subrayadas se tocan para ver qué significan.</p>
        <div class="duo">${i ? `<button class="btn" data-prev>Atrás</button>` : `<span></span>`}<button class="btn primary" data-next>${i + 1 < L.cards.length ? "Siguiente" : "A practicar en la terminal"}</button></div></div>`;
      wireGl();
      el.querySelector("[data-next]").onclick = () => { i += 1; el.scrollTop = 0; if (i < L.cards.length) lesson(); else practice(); };
      const p = el.querySelector("[data-prev]"); if (p) p.onclick = () => { i -= 1; lesson(); el.scrollTop = 0; };
    };

    const practice = () => {
      let mi = 0, hintShown = false;
      el.innerHTML = `<div class="picker-in">${head(L.cards.length, "práctica")}
        <section class="lx-mission" id="lx-m" aria-live="polite"></section>
        <div id="lx-t"></div>
        <button class="btn ghost wide" data-reread>Volver a leer la lección</button></div>`;
      wireGl();
      el.querySelector("[data-reread]").onclick = () => { i = 0; lesson(); el.scrollTop = 0; };
      const term = SHELL.mount(el.querySelector("#lx-t"), {
        intro: "Servidor de práctica srv-web01 del Banco Andino. Escribe los comandos y pulsa Enviar (o Enter).\nEscribe help para ver todos los comandos.",
        onRun: (c) => {
          const m = L.missions[mi];
          if (!m || box.classList.contains("ok")) return;
          let ok = false;
          try { ok = m.check(c); } catch (e) { ok = false; }
          if (ok) solved();
        },
      });
      const box = el.querySelector("#lx-m");
      const drawM = () => {
        const m = L.missions[mi];
        hintShown = false;
        box.className = "lx-mission";
        box.innerHTML = `<p class="eyebrow">Misión ${mi + 1} de ${L.missions.length}</p><p class="lx-goal">${esc(m.goal)}</p>
          <div class="lx-help"><button class="btn ghost" data-hint>Pista</button></div><div class="lx-extra"></div>`;
        box.querySelector("[data-hint]").onclick = hint;
      };
      const hint = () => {
        const m = L.missions[mi], ex = box.querySelector(".lx-extra"), b = box.querySelector("[data-hint]");
        if (!hintShown) { hintShown = true; ex.innerHTML = `<p class="small">💡 ${esc(m.hint)}</p>`; b.textContent = "Ver la solución"; return; }
        ex.innerHTML = `<p class="small">💡 ${esc(m.hint)}</p><p class="small">Solución: <code>${esc(m.sol)}</code></p>`;
        b.textContent = "Escribirla en la terminal";
        b.onclick = () => { term.input.value = m.sol; term.focus(); };
      };
      const solved = () => {
        const m = L.missions[mi];
        box.className = "lx-mission ok";
        const last = mi + 1 >= L.missions.length;
        box.innerHTML = `<p class="eyebrow">✓ Misión ${mi + 1} de ${L.missions.length} cumplida</p><p>${GLOSS.link(esc(m.ok), 2)}</p>
          <button class="btn primary wide" data-go>${last ? "Comprobar lo aprendido" : "Siguiente misión"}</button>`;
        box.querySelector("[data-go]").onclick = () => { if (last) { quiz(); el.scrollTop = 0; } else { mi += 1; drawM(); term.focus(); } };
        box.scrollIntoView({ block: "nearest" });
      };
      drawM();
      setTimeout(() => term.focus(), 80);
    };

    const quiz = () => {
      const qs = TA.shuffle(L.quiz.slice());
      let right = 0, qi = 0;
      const ask = () => {
        const q = qs[qi % qs.length];
        const opts = TA.shuffle(q.a.map((t, k) => ({ t, ok: k === q.c })));
        el.innerHTML = `<div class="picker-in">${head(L.cards.length + 1, "comprobación")}
          <article class="ls-card"><p class="eyebrow">Comprobación · ${right} de 2 correctas</p><h3 class="t-q">${GLOSS.link(esc(q.q), 3)}</h3></article>
          <div class="opts">${opts.map((o, k) => `<button class="opt" data-k="${k}">${esc(o.t)}</button>`).join("")}</div><div id="lx-fb"></div></div>`;
        wireGl();
        el.querySelectorAll(".opt").forEach((b) => b.onclick = () => {
          const o = opts[+b.dataset.k];
          el.querySelectorAll(".opt").forEach((x, k) => { x.disabled = true; if (opts[k].ok) x.classList.add("right"); });
          if (!o.ok) b.classList.add("wrong"); else right += 1;
          qi += 1;
          const fb = el.querySelector("#lx-fb");
          fb.innerHTML = `<div class="ex-why ${o.ok ? "is-ok" : "is-bad"}"><p class="sheet-k">${o.ok ? "Correcto" : "Todavía no"}</p><p>${esc(q.w)}</p>
            <button class="btn primary wide" data-go>${right >= 2 ? "Terminar el nivel" : "Otra pregunta"}</button></div>`;
          fb.querySelector("[data-go]").onclick = () => (right >= 2 ? finish() : ask());
          fb.scrollIntoView({ block: "nearest" });
        });
      };
      ask();
    };

    const finish = () => {
      const first = !done(id);
      let campDone = false;
      if (first) {
        st().done[id] = TA.dayKey();
        const before = TA.rankInfo(S().xp);
        S().xp += LEVEL_XP; S().money += LEVEL_MONEY;
        if (complete()) { campDone = true; S().money += CAMP_BONUS; }
        TA.save();
        if (window.PROG) { PROG.learn(); PROG.check(); }
        const after = TA.rankInfo(S().xp);
        if (after.i > before.i) setTimeout(() => ART.promoCeremony(after), 400);
      }
      const nxt = next();
      el.innerHTML = `<div class="picker-in">${head(total, "nivel completo")}
        <div class="ls-done">${campDone ? PENGUIN : ART.portrait("marta", "happy")}<h2>${campDone ? "¡Campamento Linux completo!" : "Nivel superado"}</h2>
        <p>${first ? `+${LEVEL_XP} de reputación y ${TA.money(LEVEL_MONEY)}.` : "Ya lo tenías: practicar nunca sobra."}${campDone ? ` Bono de graduación: ${TA.money(CAMP_BONUS)}. Ya sabes moverte en un servidor Linux: ${S().linuxReq ? "Bogotá te espera para empezar con la ciberseguridad." : "la terminal libre y los retos de terminal te esperan en la Sala de juegos."}` : ""}</p>
        ${nxt && !campDone ? `<button class="btn primary wide big" data-next>Siguiente nivel: ${esc(nxt.title)}</button>` : ""}
        <button class="btn ${nxt && !campDone ? "" : "primary"} wide" data-ok>Volver al campamento</button></div></div>`;
      if (first) ART.confetti();
      wireGl();
      el.querySelector("[data-ok]").onclick = leave;
      const nb = el.querySelector("[data-next]"); if (nb) nb.onclick = () => { close(el); level(nxt.id, onBack); };
    };
    lesson();
  }

  /* ——— Terminal libre ——— */
  function free() {
    const el = overlay("Terminal libre");
    el.innerHTML = `<div class="picker-in"><header class="ls-head">${BACK}<div><p class="eyebrow">Campamento Linux</p><h2>Terminal libre</h2></div></header>
      <p class="small">Practica lo que quieras. Ideas: arma el ranking de páginas del sitio, busca tus propios archivos con find, crea carpetas, prueba permisos. Si rompes algo, sal y vuelve a entrar: el servidor se restaura.</p>
      <div id="lx-t"></div><button class="btn wide" data-cheat>Chuleta de comandos</button></div>`;
    el.querySelector("[data-back]").onclick = () => close(el);
    el.querySelector("[data-cheat]").onclick = () => cheat();
    const t = SHELL.mount(el.querySelector("#lx-t"), { intro: "Servidor de práctica srv-web01. Escribe help para ver los comandos disponibles." });
    setTimeout(() => t.focus(), 80);
  }

  /* ——— Chuleta ——— */
  function cheat() {
    const el = overlay("Chuleta de comandos");
    el.innerHTML = `<div class="picker-in"><header class="ls-head">${BACK}<div><p class="eyebrow">Campamento Linux</p><h2>Chuleta de comandos</h2></div></header>
      <p class="small">Los comandos que más usa un analista, con un ejemplo de cada uno.</p>
      ${LX_CHEAT.map(([g, rows]) => `<section class="block lx-cheat"><h3>${esc(g)}</h3><dl>${rows.map(([c, d, ex]) => `<div><dt class="mono">${esc(c)}</dt><dd>${esc(d)}<code>${esc(ex)}</code></dd></div>`).join("")}</dl></section>`).join("")}
    </div>`;
    el.querySelector("[data-back]").onclick = () => close(el);
  }

  /* ——— Tarjeta para la pantalla de inicio ——— */
  function homeCard() {
    if (complete()) return "";
    const n = next(), c = count();
    return `<section class="train lx-home">
      <div class="train-top"><div><p class="eyebrow">${blocking() ? "Empieza aquí · paso cero" : "Recomendado · Campamento Linux"}</p><p><b>${c} de ${LX_LEVELS.length} niveles</b>${blocking() ? " · antes de la ciberseguridad" : ""}</p></div><button class="btn ghost" id="h-camp-all">Ver todo</button></div>
      <div class="bar sm"><i style="width:${(c / LX_LEVELS.length) * 100}%"></i></div>
      <button class="train-next" id="h-camp" data-l="${n.id}">${PENGUIN}<span><b>${esc(n.title)}</b><small>${esc(n.summary)}</small><small class="mono">${n.mins} min · lección + práctica en la terminal</small></span></button>
    </section>`;
  }

  /* ——— Reto «Terminal en vivo» para turnos y Sala de juegos ——— */
  const taskTicket = (i) => Object.assign({ type: "shell", id: "lt" + i }, LX_TASKS[i]);
  if (window.GAMES) GAMES.shell = {
    name: "Terminal en vivo", blurb: "Una tarea real en el servidor: resuélvela escribiendo comandos.",
    label: (t) => "Terminal · " + t.title,
    make(city, used) {
      const ids = LX_TASKS.map((t, i) => (done(t.need) ? "lt" + i : null)).filter(Boolean);
      if (!ids.length) return null;
      return taskTicket(+TA.pickFresh(ids, used || new Set()).slice(2));
    },
    fromId: (id) => { const t = LX_TASKS[+id.slice(2)]; return t && done(t.need) ? taskTicket(+id.slice(2)) : null; },
    render(root, t, finish) {
      let hint = false;
      root.innerHTML = `<article class="ticket"><p class="t-label">Terminal en vivo · ${esc(t.title)}</p><h3 class="t-q">${esc(t.goal)}</h3>
        <div class="lx-help"><button class="btn ghost" data-hint>Pista</button><button class="btn ghost" data-give>Me rindo</button></div><p class="small lx-extra"></p></article>
        <div id="lx-t"></div>`;
      let over = false;
      const term = SHELL.mount(root.querySelector("#lx-t"), {
        intro: "srv-web01 · Banco Andino. Escribe los comandos que necesites (help muestra la lista).",
        onRun: (c) => { if (over) return; let ok = false; try { ok = t.check(c); } catch (e) {} if (ok) { over = true; lock(); finish(true, esc(t.ok)); } },
      });
      const lock = () => { root.querySelectorAll(".lx-help button").forEach((b) => { b.disabled = true; }); term.input.disabled = true; };
      root.querySelector("[data-hint]").onclick = () => { if (!hint) { hint = true; root.querySelector(".lx-extra").textContent = "💡 " + t.hint; } };
      root.querySelector("[data-give]").onclick = () => { if (over) return; over = true; lock(); finish(false, `Una forma de resolverlo: <code>${esc(t.sol)}</code>. ${esc(t.ok)}`); };
      setTimeout(() => term.focus(), 120);
    },
  };

  window.LINUX = { open, level, free, cheat, homeCard, done, count, complete, blocking, next };
})();
