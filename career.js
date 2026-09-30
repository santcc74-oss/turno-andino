/* Turno Andino — carreras: elegir especialidad, ganar experiencia en ella y armar sus tickets. */
(function () {
  const { esc, pick } = TA;
  const UNLOCK_RANK = 2;           /* Analista SOC N2 */
  const SWITCH_COST = 250;
  const XP_CASE = 25, XP_AFFINE = 10;

  const byId = (id) => CAREERS.find((c) => c.id === id);
  const current = () => (TA.S.career ? byId(TA.S.career) : null);
  const unlocked = () => TA.rankIndex(TA.S.xp) >= UNLOCK_RANK;
  const xpOf = (id) => (TA.S.careers && TA.S.careers[id]) || 0;
  function levelOf(xp) {
    let l = 0;
    CAREER_LEVELS.forEach((t, i) => { if (xp >= t) l = i; });
    return l;
  }
  function info(id) {
    const c = byId(id), xp = xpOf(id), l = levelOf(xp), next = CAREER_LEVELS[l + 1];
    return { c, xp, l, title: c.levels[l], next: next != null ? c.levels[l + 1] : null, need: next != null ? next - xp : 0,
      pct: next != null ? (xp - CAREER_LEVELS[l]) / (next - CAREER_LEVELS[l]) : 1 };
  }

  /* Suma experiencia de especialidad. Devuelve el cargo nuevo si subió de nivel. */
  function addXp(t, ok) {
    const c = current();
    if (!c || !ok) return null;
    const affine = c.special.some((s) => s.type === t.type) || (t.type === "quiz" && t.career === c.id);
    const gain = t.career === c.id ? XP_CASE : affine ? XP_AFFINE : 0;
    if (!gain) return null;
    const S = TA.S; if (!S.careers) S.careers = {};
    const before = levelOf(xpOf(c.id));
    S.careers[c.id] = xpOf(c.id) + gain;
    const after = levelOf(S.careers[c.id]);
    return { gain, up: after > before ? c.levels[after] : null };
  }

  /* Dos tickets de especialidad por turno: un caso del banco de la carrera y un minijuego afín. */
  function tickets(city, make) {
    const c = current();
    if (!c) return [];
    const out = [];
    /* Los casos de especialidad salen cuando ya estudiaste algún tema de la inducción de tu carrera. */
    if ((CAREER_MODS[c.id] || []).some(LEARN.learned)) {
      const ids = c.q.map((_, i) => "cq-" + c.id + "-" + i);
      const q = make.quizById(TA.pickFresh(ids, make.usedConcepts));
      if (q) { q.career = c.id; q.label = "Caso de especialidad"; out.push(q); }
    }
    const specials = c.special.filter((sp) => LEARN.typeAllowed(sp.type));
    const sp = specials.length ? pick(specials) : null;
    const t = sp ? make.ofType(sp.type, sp.tag) : null;
    if (t) { t.career = c.id; out.push(t); }
    return out;
  }

  /* ——— Elegir especialidad ——— */
  function picker(opts) {
    opts = opts || {};
    const S = TA.S, cur = current();
    const el = document.createElement("div");
    el.className = "picker";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Elige tu especialidad");
    const card = (c) => {
      const mine = cur && cur.id === c.id, saved = xpOf(c.id);
      return `<li class="car" style="--h:${c.hue}">
        <div class="car-top"><span class="car-dot" aria-hidden="true"></span><h3>${esc(c.name)}</h3></div>
        <p>${esc(c.pitch)}</p>
        <p class="small"><b>Tu día:</b> ${esc(c.day)}</p>
        <p class="small"><b>Cargos:</b> ${c.levels.map(esc).join(" → ")}</p>
        <p class="small"><b>Certificaciones de referencia:</b> ${c.certs.map((x) => esc(x[0]) + " (" + esc(x[1]) + ")").join(" · ")}</p>
        ${saved ? `<p class="small">Progreso guardado: ${saved} de experiencia.</p>` : ""}
        ${mine ? `<span class="st done">Tu especialidad actual</span>` : `<button class="btn primary wide" data-pick="${c.id}">${cur ? "Cambiar a esta carrera · " + TA.money(SWITCH_COST) : "Elegir esta carrera"}</button>`}
      </li>`;
    };
    el.innerHTML = `<div class="picker-in">
      <header class="picker-head">
        ${ART.portrait("marta", "happy")}
        <div><p class="eyebrow">${cur ? "Cambio de especialidad" : "Ya eres Analista SOC N2"}</p>
        <h2>${cur ? "¿Quieres cambiar de carrera?" : "Elige tu especialidad"}</h2>
        <p class="small">${cur ? "Cambiar cuesta " + TA.money(SWITCH_COST) + " (el curso de reconversión). Lo que ganaste en cada carrera queda guardado por si vuelves." : "Marta te ofrece especializarte. Estudias la inducción de tu carrera en Capacitación y, desde ahí, 2 de los 6 tickets de cada turno serán de tu especialidad. Podrás cambiar después."}</p></div>
      </header>
      <ul class="cars">${CAREERS.map(card).join("")}</ul>
      <button class="btn ghost wide" data-close>${cur ? "Cerrar" : "Decidir más tarde"}</button>
      <p class="small center" id="pk-msg" role="status"></p>
    </div>`;
    document.body.appendChild(el);
    document.body.classList.add("playing");
    const done = () => { el.remove(); if (document.getElementById("play").hidden) document.body.classList.remove("playing"); if (opts.onClose) opts.onClose(); };
    el.querySelector("[data-close]").onclick = () => { S.careerOffered = true; TA.save(); done(); };
    el.querySelectorAll("[data-pick]").forEach((b) => b.onclick = () => {
      const id = b.dataset.pick;
      if (cur) {
        if (S.money < SWITCH_COST) { el.querySelector("#pk-msg").textContent = "Te faltan " + TA.money(SWITCH_COST - S.money) + " para el curso de reconversión."; return; }
        S.money -= SWITCH_COST;
      }
      S.career = id; S.careerOffered = true;
      if (!S.careers) S.careers = {};
      if (!S.careers[id]) S.careers[id] = 0;
      TA.save();
      el.remove();
      if (document.getElementById("play").hidden) document.body.classList.remove("playing");
      if (window.PROG) PROG.check();
      ART.confetti();
      const c = byId(id);
      ART.ceremony(`<p class="eyebrow mono">Recursos Humanos · Banco Andino</p>
        <div class="car-badge" style="--h:${c.hue}" aria-hidden="true">${esc(c.short)}</div>
        <h2>Bienvenido a ${esc(c.name)}</h2>
        <p>Empiezas como <b>${esc(c.levels[levelOf(xpOf(id))])}</b>. Tus casos de especialidad dan ${XP_CASE} de experiencia de carrera, y los minijuegos afines, ${XP_AFFINE}.</p>`,
        [["ok", "A trabajar"]], () => { if (opts.onClose) opts.onClose(); UI.go(UI.current()); });
    });
  }

  /* Ofrece elegir carrera una sola vez, cuando se alcanza el cargo que la desbloquea. */
  function ensureOffer() {
    const S = TA.S;
    if (unlocked() && !S.career && !S.careerOffered && !document.querySelector(".picker, .ceremony")) picker();
  }

  window.CAREER = { byId, current, unlocked, info, levelOf, addXp, tickets, picker, ensureOffer, UNLOCK_RANK, SWITCH_COST };
})();
