/* Turno Andino — glosario vivo: marca las palabras técnicas en los textos, las explica al tocarlas
   y ofrece un diccionario con buscador. Usa GLOSSARY_PLUS (explicación sencilla) y GLOSSARY (detalle técnico). */
(function () {
  const G = window.GLOSSARY_PLUS || {};
  const BASE = window.GLOSSARY || {};
  const esc = TA.esc;
  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  /* Índice de palabras que activan cada término, de la más larga a la más corta. */
  const IDX = [];
  Object.entries(G).forEach(([k, e]) => {
    if (e.nolink) return;
    (e.al || []).forEach((a) => {
      const cs = a[0] === "=", txt = cs ? a.slice(1) : a;
      const re = new RegExp("(^|[^\\p{L}\\p{N}_])(" + escRe(esc(txt)) + ")(?![\\p{L}\\p{N}_])", cs ? "u" : "iu");
      IDX.push({ k, len: txt.length, re });
    });
  });
  IDX.sort((a, b) => b.len - a.len);

  /* Busca términos en un texto ya escapado: primera aparición de cada uno, sin solaparse. */
  function find(text) {
    const taken = [], used = new Set(), hits = [];
    for (const x of IDX) {
      if (used.has(x.k)) continue;
      const m = x.re.exec(text);
      if (!m) continue;
      const start = m.index + m[1].length, end = start + m[2].length;
      if (taken.some(([a, b]) => start < b && end > a)) continue;
      taken.push([start, end]); used.add(x.k);
      hits.push({ k: x.k, start, end });
    }
    return hits.sort((a, b) => a.start - b.start);
  }

  /* Convierte los términos de un texto escapado en botones que abren su explicación. */
  function link(text, max) {
    const hits = find(text).slice(0, max || 5);
    let out = "", last = 0;
    hits.forEach((h) => {
      out += text.slice(last, h.start) + `<button type="button" class="gl" data-k="${h.k}">${text.slice(h.start, h.end)}</button>`;
      last = h.end;
    });
    return out + text.slice(last);
  }

  /* Términos presentes en un texto plano (para la lista «Palabras de este ticket»). */
  const keysIn = (plain) => find(esc(plain || "")).map((h) => h.k);
  function chips(plain, max) {
    const ks = keysIn(plain).slice(0, max || 6);
    if (!ks.length) return "";
    return `<div class="kw"><small>Palabras de este ticket · toca para entenderlas</small><div>${ks.map((k) => `<button type="button" class="gl-chip" data-k="${k}">${esc(G[k].es)}</button>`).join("")}</div></div>`;
  }

  function open(k) {
    const e = G[k];
    if (!e) return;
    const base = BASE[k];
    const en = e.en || (base && base[0] && base[0] !== e.es ? base[0] : "");
    const tech = base && base[1] && base[1] !== e.s ? base[1] : "";
    const S = TA.S; if (!S.st) S.st = {};
    const seen = (S.st.words = S.st.words || {});
    const first = !seen[k];
    seen[k] = (seen[k] || 0) + 1;
    TA.save();
    if (first && window.PROG) PROG.gloss();
    const el = document.createElement("div");
    el.className = "gloss-pop";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", e.es);
    el.innerHTML = `<div class="gloss-card">
      <p class="eyebrow">Diccionario del SOC</p>
      <h3>${esc(e.es)}</h3>
      ${en ? `<p class="gloss-en mono">${esc(en)}</p>` : ""}
      <p class="gloss-s">${esc(e.s)}</p>
      ${e.ex ? `<div class="gloss-ex"><small>Ejemplo</small><p>${esc(e.ex)}</p></div>` : ""}
      ${tech ? `<details class="gloss-t"><summary>Más técnico</summary><p>${esc(tech)}</p></details>` : ""}
      <button class="btn primary wide" data-close>Entendido</button>
    </div>`;
    document.body.appendChild(el);
    const close = () => { el.remove(); document.removeEventListener("keydown", onKey); };
    const onKey = (ev) => { if (ev.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    el.addEventListener("click", (ev) => { if (ev.target === el || ev.target.hasAttribute("data-close")) close(); });
    el.querySelector("[data-close]").focus({ preventScroll: true });
  }

  /* Cualquier palabra marcada, en cualquier pantalla, abre su explicación. */
  document.addEventListener("click", (ev) => {
    const b = ev.target.closest && ev.target.closest(".gl, .gl-chip");
    if (!b) return;
    ev.preventDefault(); ev.stopPropagation();
    open(b.dataset.k);
  }, true);

  /* Diccionario completo con buscador. */
  function dictionary() {
    const all = Object.entries(G).map(([k, e]) => ({ k, e })).sort((a, b) => a.e.es.localeCompare(b.e.es, "es"));
    const seen = (TA.S.st && TA.S.st.words) || {};
    const el = document.createElement("div");
    el.className = "dict";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Diccionario");
    el.innerHTML = `<div class="dict-in">
      <header class="dict-head">
        <div><p class="eyebrow">Diccionario del SOC</p><h2>${all.length} términos</h2><p class="small">Has consultado ${Object.keys(seen).length}.</p></div>
        <button class="icon-btn" data-close aria-label="Cerrar diccionario"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </header>
      <label class="small" for="dict-q">Buscar</label>
      <input id="dict-q" type="search" placeholder="Por ejemplo: snapshot, phishing, SIEM" autocomplete="off">
      <ul class="dict-list"></ul>
    </div>`;
    document.body.appendChild(el);
    document.body.classList.add("playing");
    const list = el.querySelector(".dict-list"), q = el.querySelector("#dict-q");
    const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const draw = () => {
      const t = norm(q.value.trim());
      const rows = all.filter(({ k, e }) => !t || norm(e.es + " " + (e.en || "") + " " + (e.al || []).join(" ") + " " + k).includes(t));
      list.innerHTML = rows.map(({ k, e }) => `<li><button class="gl-row" data-k="${k}"><b>${esc(e.es)}</b><small>${esc(e.s.length > 90 ? e.s.slice(0, 88) + "…" : e.s)}</small>${seen[k] ? '<span class="st done">Vista</span>' : ""}</button></li>`).join("")
        || `<li class="small">No hay términos con «${esc(q.value)}».</li>`;
    };
    list.addEventListener("click", (ev) => { const b = ev.target.closest(".gl-row"); if (b) open(b.dataset.k); });
    q.addEventListener("input", draw);
    el.querySelector("[data-close]").onclick = () => { el.remove(); if (document.getElementById("play").hidden) document.body.classList.remove("playing"); };
    draw();
  }

  window.GLOSS = { link, chips, keysIn, open, dictionary, count: () => Object.keys(G).length };
})();
