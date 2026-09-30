/* Turno Andino — archivo histórico (casos reales con cuestionario) y álbum de técnicas de MITRE ATT&CK. */
(function () {
  const { esc } = TA;
  const CASE_EVERY = 3, CASE_XP = 50;
  const tech = (id) => ATTACK.find((x) => x.id === id);
  const S = () => TA.S;
  const album = () => { if (!S().attack) S().attack = {}; return S().attack; };
  const cases = () => { if (!S().cases) S().cases = {}; return S().cases; };

  /* ——— Álbum ——— */
  function collect(id) {
    if (!id || !tech(id) || album()[id]) return false;
    album()[id] = TA.dayKey();
    TA.save();
    PROG.toast({ kind: "mission", title: "Nueva técnica en tu álbum ATT&CK", text: id + " · " + tech(id).name, sub: tech(id).tactic });
    PROG.check();
    return true;
  }

  /* Qué técnica real representa cada ticket resuelto correctamente. */
  const LOG_TECH = { l0: "T1110", l1: "T1078", l2: "T1136", l3: "T1053.003", l4: "T1190", l5: "T1190", l6: "T1571", l7: "T1071.004", l8: "T1078", l10: "T1114.003", l11: "T1059.001" };
  const CMD_TECH = { cm0: "T1078", cm1: "T1571", cm3: "T1053.003", cm6: "T1110", cm7: "T1571" };
  function techOf(t) {
    if (t.type === "mail") return t.phish ? "T1566" : null;
    if (t.type === "header") return t.legit ? null : "T1566";
    if (t.type === "call") return t.cama ? "T1566.004" : null;
    if (t.type === "log") return LOG_TECH[t.id] || null;
    if (t.type === "cmd") return CMD_TECH[t.id] || null;
    if (t.type === "scan") return "T1046";
    if (t.type === "spot") return "T1566";
    if (t.type === "firewall") return "T1133";
    if (t.type === "code") return /SQL|ping|eval|IDOR|cuenta/i.test(t.title + " " + t.why) ? "T1190" : null;
    if (t.type === "cve") { const x = (t.items || []).find((i) => i.ok); if (!x) return null; return /EternalBlue|Zerologon|PrintNightmare/.test(x.name) ? "T1210" : "T1190"; }
    if (t.type === "order") return /ransomware/i.test(t.title) ? "T1204.002" : /phishing/i.test(t.title) ? "T1566" : null;
    return null;
  }
  function fromTicket(t, ok) { if (ok) collect(techOf(t)); }

  /* ——— Casos ——— */
  const available = () => Math.min(CASES.length, 1 + Math.floor(S().shifts / CASE_EVERY));

  function caseModal(i, refresh) {
    const c = CASES[i], st = cases()[c.id] || {};
    const el = document.createElement("div");
    el.className = "picker case-modal";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", c.title);
    el.innerHTML = `<div class="picker-in">
      <header class="case-head"><p class="eyebrow mono">Expediente ${String(i + 1).padStart(2, "0")} · ${c.year} · ${esc(c.sector)}</p><h2>${esc(c.title)}</h2></header>
      ${c.story.map((p) => `<p class="case-p">${GLOSS.link(TA.esc(p), 3)}</p>`).join("")}
      <section class="block"><h3>Línea de tiempo</h3><ol class="case-tl">${c.timeline.map((x) => `<li>${esc(x)}</li>`).join("")}</ol></section>
      <section class="block"><h3>Lecciones</h3><ul class="case-les">${c.lessons.map((x) => `<li>${GLOSS.link(TA.esc(x), 2)}</li>`).join("")}</ul></section>
      <section class="block"><h3>Técnicas de ATT&CK</h3><div class="chips">${c.techs.map((id) => `<span class="chip mono">${id} · ${esc(tech(id).name)}</span>`).join("")}</div></section>
      <section class="block" id="cq"></section>
      <button class="btn ghost wide" data-close>Cerrar expediente</button>
    </div>`;
    document.body.appendChild(el);
    document.body.classList.add("playing");
    const close = () => { el.remove(); if (document.getElementById("play").hidden) document.body.classList.remove("playing"); if (refresh) refresh(); };
    el.querySelector("[data-close]").onclick = close;
    const box = el.querySelector("#cq");
    let k = 0, right = 0;
    const ask = () => {
      if (k >= c.quiz.length) return finish();
      const q = c.quiz[k];
      const opts = TA.shuffle(q.a.map((t, j) => ({ t, ok: j === q.c })));
      box.innerHTML = `<h3>Preguntas del expediente · ${k + 1} de ${c.quiz.length}</h3><p class="t-q">${esc(q.q)}</p>
        <div class="opts">${opts.map((o, j) => `<button class="opt" data-j="${j}">${esc(o.t)}</button>`).join("")}</div>`;
      box.querySelectorAll(".opt").forEach((b) => b.onclick = () => {
        const o = opts[+b.dataset.j];
        box.querySelectorAll(".opt").forEach((x, j) => { x.disabled = true; if (opts[j].ok) x.classList.add("right"); });
        if (!o.ok) b.classList.add("wrong"); else right += 1;
        const w = document.createElement("div");
        w.className = "ex-why " + (o.ok ? "is-ok" : "is-bad");
        w.innerHTML = `<p class="sheet-k">${o.ok ? "Correcto" : "No era así"}</p><p>${esc(q.w)}</p><button class="btn primary wide">${k + 1 < c.quiz.length ? "Siguiente pregunta" : "Ver resultado"}</button>`;
        box.appendChild(w);
        w.querySelector("button").onclick = () => { k += 1; ask(); };
      });
    };
    const finish = () => {
      const pass = right >= 2, before = TA.rankInfo(S().xp);
      if (pass && !st.done) {
        cases()[c.id] = { done: TA.dayKey(), score: right };
        S().xp += CASE_XP;
        TA.save();
        c.techs.forEach(collect);
        PROG.check();
        ART.confetti();
      }
      box.innerHTML = `<div class="ex-why ${pass ? "is-ok" : "is-bad"}"><p class="sheet-k">${pass ? "Expediente cerrado" : "Te faltó poco"}</p>
        <p>${right} de ${c.quiz.length} correctas. ${pass ? (st.done ? "Ya lo habías cerrado antes." : "+" + CASE_XP + " de reputación y sus técnicas entran a tu álbum.") : "Relee la historia y vuelve a intentarlo: necesitas 2 de 3."}</p>
        ${pass ? "" : `<button class="btn primary wide" id="cq-retry">Intentar de nuevo</button>`}</div>`;
      const r = box.querySelector("#cq-retry"); if (r) r.onclick = () => { k = 0; right = 0; ask(); };
      const after = TA.rankInfo(S().xp);
      if (after.i > before.i) ART.promoCeremony(after);
    };
    box.innerHTML = `<h3>¿Cerramos el expediente?</h3><p class="small">Responde 3 preguntas sobre el caso. Con 2 correctas lo cierras y ganas ${CASE_XP} de reputación.</p><button class="btn primary wide" id="cq-go">Responder las preguntas</button>`;
    box.querySelector("#cq-go").onclick = ask;
  }

  /* ——— Pestaña Archivo del pasaporte ——— */
  function view() {
    const n = available(), done = cases(), got = album();
    const nGot = Object.keys(got).length;
    const list = CASES.map((c, i) => {
      if (i >= n) return `<li class="case locked"><span class="mono">${String(i + 1).padStart(2, "0")}</span><div><b>Expediente sellado</b><small>Se abre en ${(i * CASE_EVERY) - S().shifts} ${(i * CASE_EVERY) - S().shifts === 1 ? "turno" : "turnos"} más.</small></div></li>`;
      return `<li><button class="case ${done[c.id] ? "done" : ""}" data-case="${i}"><span class="mono">${String(i + 1).padStart(2, "0")}</span>
        <div><b>${esc(c.title)}</b><small>${c.year} · ${esc(c.sector)}</small></div>${done[c.id] ? '<span class="st done">Cerrado</span>' : '<span class="st open">Nuevo</span>'}</button></li>`;
    }).join("");
    const cards = ATTACK.map((a) => got[a.id]
      ? `<li class="tcard got"><span class="mono">${a.id}</span><b>${esc(a.name)}</b><span class="tac">${esc(a.tactic)}</span><small>${esc(a.es)}</small><small class="det"><b>Cómo se detecta:</b> ${esc(a.detect)}</small></li>`
      : `<li class="tcard"><span class="mono">${a.id}</span><b>???</b><span class="tac">${esc(a.tactic)}</span><small>Resuelve tickets o expedientes para descubrirla.</small></li>`).join("");
    return `<section class="block"><h2>Casos reales</h2><p class="small">Ataques que cambiaron la ciberseguridad, contados como expedientes. Se abre uno nuevo cada ${CASE_EVERY} turnos.</p><ul class="cases">${list}</ul></section>
      <section class="block"><h2>Álbum ATT&CK · ${nGot} de ${ATTACK.length}</h2><p class="small">Cada técnica es real, con su código oficial de MITRE. Se colecciona cuando resuelves bien un ticket que la muestra.</p><ul class="tcards">${cards}</ul></section>`;
  }
  function wire(refresh) {
    document.querySelectorAll("[data-case]").forEach((b) => b.onclick = () => caseModal(+b.dataset.case, refresh));
  }

  window.HIST = { collect, techOf, fromTicket, view, wire, available, albumCount: () => Object.keys(album()).length, casesDone: () => Object.keys(cases()).length };
})();
