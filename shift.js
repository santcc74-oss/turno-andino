/* Turno Andino — el turno: armado de tickets, minijuegos, retroalimentación y resultado. */
(function () {
  const { rand, pick, shuffle, esc } = TA;
  const TICKETS_PER_SHIFT = 6;
  const XP_OK = 20, XP_FAST = 5, HEALTH_HIT = 20;
  const EXAM_N = 10, EXAM_PASS = 8, EXAM_XP = 60;

  const $ = (sel, root) => (root || document).querySelector(sel);
  const play = () => $("#play");

  /* Texto de CyberRuta: quita marcas del glosario y permite <code>. */
  function fmt(s, linkIt) {
    s = String(s == null ? "" : s).replace(/\{\{(\w+)\|([^}]+)\}\}/g, "$2").replace(/\{\{(\w+)\}\}/g, (_, k) => (GLOSSARY[k] ? GLOSSARY[k][0] : k));
    let e = esc(s);
    if (linkIt) e = GLOSS.link(e);
    return e.replace(/&lt;(\/?)code&gt;/g, "<$1code>");
  }
  /* Todo el texto de un ticket, para listar sus palabras técnicas. */
  function ticketText(t) {
    return [t.q, t.w, t.why, t.subj, t.body, t.say, t.prompt, t.title, t.text, t.target, t.lang,
      (t.opts || []).map((o) => o.t).join(" "), (t.items || []).map((x) => x.name + " " + x.id).join(" "), (t.lines || []).join(" ")].filter(Boolean).join(" · ");
  }

  /* ——— Construcción de tickets ——— */
  const SRC_QUIZ = [["juli", "Juli pregunta"], ["marta", "Marta quiere saber"], [null, "Pregunta del auditor"], [null, "Alerta de conocimiento"]];

  function quizTicket(id) {
    const q = TA.quizById(id);
    if (!q || !Array.isArray(q.a)) return null;
    const src = pick(SRC_QUIZ);
    return { type: "quiz", id, who: src[0], label: src[1], q: q.q, w: q.w || "", opts: shuffle(q.a.map((t, i) => ({ t, ok: i === q.c }))) };
  }
  function msgTicket(id) {
    const m = TA.msgById(id);
    return m && Object.assign({ type: "mail", id }, m);
  }
  function callTicket(i) {
    const c = CALLS[i];
    return Object.assign({ type: "call", id: "c" + i }, c, { opts: shuffle(c.opts.map((t, k) => ({ t, ok: k === c.c }))) });
  }
  function logTicket(i) { return Object.assign({ type: "log", id: "l" + i }, LOGS[i]); }
  function orderTicket(o) { return { type: "order", title: o.title, steps: o.steps, deck: shuffle(o.steps.map((_, i) => i)), why: o.why }; }

  function codeTicket(i) { return Object.assign({ type: "code", id: "k" + i }, CODE[i]); }
  function headerTicket(i) { return Object.assign({ type: "header", id: "h" + i }, HEADERS[i]); }
  function siemTicket(i) {
    const q = SIEMQ[i];
    return { type: "siem", id: "s" + i, lang: q.lang, q: q.q, why: q.why, opts: shuffle(q.opts.map((t, k) => ({ t, ok: k === q.c }))) };
  }
  function cveTicket(i) {
    const c = CVES[i];
    return { type: "cve", id: "v" + i, why: c.why, items: shuffle(c.items.map((x, k) => Object.assign({ ok: k === c.c }, x))) };
  }

  function cmdTicket(i) { const c = CMDS[i]; return { type: "cmd", id: "cm" + i, os: c.os, q: c.q, out: c.out, why: c.why, opts: shuffle(c.opts.map((t, k) => ({ t, ok: k === c.c }))) }; }
  function scanTicket(i) { return Object.assign({ type: "scan", id: "sc" + i }, SCANS[i]); }
  function riskTicket(i) { return Object.assign({ type: "risk", id: "rk" + i }, RISKS[i]); }

  function tagged(list, code) {
    const idx = list.map((x, i) => i).filter((i) => (list[i].tags || []).includes(code));
    return idx.length ? idx : list.map((x, i) => i);
  }

  const DEC_KINDS = { BOG: ["bin", "hex", "hash"], LIM: ["b64", "bin", "hex"], SCL: ["b64", "caesar", "hash"] };
  function near(n, max) {
    const set = new Set([n]);
    while (set.size < 4) { const d = n + (rand(2) ? 1 : -1) * (1 + rand(max)); if (d > 0 && d < 256) set.add(d); }
    return shuffle([...set]);
  }
  const hex64 = () => Array.from({ length: 64 }, () => "0123456789abcdef"[rand(16)]).join("");
  function decodeTicket(code) {
    const kind = pick(DEC_KINDS[code] || ["bin", "hex", "b64", "caesar", "hash"]);
    const word = pick(DECODE_WORDS);
    const words = () => shuffle([word].concat(shuffle(DECODE_WORDS.filter((w) => w !== word)).slice(0, 3)));
    if (kind === "bin") {
      const n = 1 + rand(254);
      return { type: "decode", label: "Evidencia en binario", prompt: "¿Qué número decimal es este byte?", value: n.toString(2).padStart(8, "0"),
        opts: near(n, 12).map((x) => ({ t: String(x), ok: x === n })), why: "Cada posición vale el doble: 128 64 32 16 8 4 2 1. Suma las posiciones que tienen 1." };
    }
    if (kind === "hex") {
      const n = 16 + rand(239);
      return { type: "decode", label: "Volcado de memoria", prompt: "¿Cuánto vale este byte en decimal?", value: "0x" + n.toString(16).toUpperCase(),
        opts: near(n, 20).map((x) => ({ t: String(x), ok: x === n })), why: "Cada dígito hex va de 0 a 15 (A = 10 … F = 15). El primero se multiplica por 16: 0x" + n.toString(16).toUpperCase() + " = " + n + "." };
    }
    if (kind === "b64") {
      return { type: "decode", label: "Mensaje interceptado", prompt: "Decodifica este texto en Base64:", value: btoa(word),
        opts: words().map((w) => ({ t: w, ok: w === word })), why: "Base64 no es cifrado: cualquiera lo decodifica. Solo cambia la forma de escribir los datos. Nunca protejas una clave con Base64." };
    }
    if (kind === "caesar") {
      const enc = word.replace(/[A-Z]/g, (ch) => String.fromCharCode(((ch.charCodeAt(0) - 65 + 3) % 26) + 65));
      return { type: "decode", label: "Nota del Camaleón", prompt: "Cifrado César, cada letra corrida 3 posiciones. ¿Qué dice?", value: enc,
        opts: words().map((w) => ({ t: w, ok: w === word })), why: "César mueve cada letra 3 posiciones (A→D). Se rompe probando 25 opciones; por eso hoy se usa AES." };
    }
    const a = hex64(), same = rand(2) === 0;
    const pos = 8 + rand(48);
    const b = same ? a : a.slice(0, pos) + (a[pos] === "0" ? "1" : "0") + a.slice(pos + 1);
    return { type: "decode", label: "Verificación de integridad", prompt: "Compara el SHA-256 publicado con el del archivo que descargaste. ¿Es íntegro?", value: a, value2: b,
      opts: [{ t: "Sí, los hashes coinciden", ok: same }, { t: "No, el archivo fue alterado", ok: !same }],
      why: same ? "Los 64 caracteres coinciden: el archivo no fue alterado." : "Cambia un solo carácter (posición " + (pos + 1) + "). Basta eso para saber que el archivo no es el original. Compara siempre el hash completo." };
  }
  function portsTicket() {
    const pairs = shuffle(PORTS).slice(0, 4);
    return { type: "match", label: "Inventario de red", prompt: "Empareja cada puerto con su servicio.", pairs, left: "Puerto", right: "Servicio",
      why: pairs.map((p) => p[0] + " → " + p[1]).join(" · ") };
  }
  function englishTicket(city) {
    const pairs = shuffle(TA.englishPairs(city)).slice(0, 4);
    return { type: "match", label: "Ticket en inglés", prompt: "Empareja cada término con su traducción.", pairs, left: "English", right: "Español", en: true,
      why: pairs.map((p) => p[0] + " = " + p[1]).join(" · ") };
  }

  /* used = conceptos ya usados en este turno. Se prefiere siempre lo que menos has visto. */
  function makeOfType(type, city, used, tag) {
    const tg = tag || city.code;
    const pf = (ids) => TA.pickFresh(ids, used);
    if (type === "quiz") return quizTicket(pf(TA.quizIdsFor(city)));
    if (type === "mail") return msgTicket(pf(TA.msgIds()));
    if (type === "call") return callTicket(+pf(CALLS.map((_, i) => "c" + i)).slice(1));
    if (type === "log") return logTicket(+pf(tagged(LOGS, tg).map((i) => "l" + i)).slice(1));
    if (type === "order") return orderTicket(ORDERS[+pf(tagged(ORDERS, tg).map((i) => "o" + i)).slice(1)]);
    if (type === "scan") return scanTicket(+pf(SCANS.map((_, i) => "sc" + i)).slice(2));
    if (type === "risk") return riskTicket(+pf(RISKS.map((_, i) => "rk" + i)).slice(2));
    if (type === "cmd") return cmdTicket(+pf(tagged(CMDS, tg).map((i) => "cm" + i)).slice(2));
    if (type === "decode") return decodeTicket(city.code);
    if (type === "ports") return portsTicket();
    if (type === "english") return englishTicket(city);
    const byPrefix = (list, prefix, make, useTags) => {
      const idx = useTags ? tagged(list, tg) : list.map((x, i) => i);
      return make(+pf(idx.map((i) => prefix + i)).slice(1));
    };
    if (type === "code") return byPrefix(CODE, "k", codeTicket, true);
    if (type === "header") return byPrefix(HEADERS, "h", headerTicket, false);
    if (type === "siem") return byPrefix(SIEMQ, "s", siemTicket, true);
    if (type === "cve") return byPrefix(CVES, "v", cveTicket, false);
    return null;
  }
  function ticketFromId(id) {
    if (/^[pg]\d+$/.test(id)) return msgTicket(id);
    if (/^c\d+$/.test(id)) return CALLS[+id.slice(1)] ? callTicket(+id.slice(1)) : null;
    if (/^l\d+$/.test(id)) return LOGS[+id.slice(1)] ? logTicket(+id.slice(1)) : null;
    if (/^k\d+$/.test(id)) return CODE[+id.slice(1)] ? codeTicket(+id.slice(1)) : null;
    if (/^h\d+$/.test(id)) return HEADERS[+id.slice(1)] ? headerTicket(+id.slice(1)) : null;
    if (/^s\d+$/.test(id)) return SIEMQ[+id.slice(1)] ? siemTicket(+id.slice(1)) : null;
    if (/^v\d+$/.test(id)) return CVES[+id.slice(1)] ? cveTicket(+id.slice(1)) : null;
    if (/^cm\d+$/.test(id)) return CMDS[+id.slice(2)] ? cmdTicket(+id.slice(2)) : null;
    if (/^sc\d+$/.test(id)) return SCANS[+id.slice(2)] ? scanTicket(+id.slice(2)) : null;
    if (/^rk\d+$/.test(id)) return RISKS[+id.slice(2)] ? riskTicket(+id.slice(2)) : null;
    if (/^cq-/.test(id)) { const t = quizTicket(id); if (t) { t.career = id.split("-")[1]; t.label = "Caso de especialidad"; } return t; }
    return quizTicket(id);
  }

  function buildShift(city) {
    const used = new Set(), out = [];
    shuffle(TA.dueReview()).slice(0, 2).forEach((id) => {
      const t = ticketFromId(id);
      if (t) { t.review = true; out.push(t); used.add(TA.concept(id)); }
    });
    const bag = [];
    Object.entries(city.games).forEach(([type, w]) => { for (let i = 0; i < w; i++) bag.push(type); });
    /* Al menos 2 preguntas de la sede y máximo 2 tickets de cada tipo, para que el turno sea variado. */
    const count = {};
    out.forEach((t) => { count[t.type] = (count[t.type] || 0) + 1; });
    let last = null, guard = 0;
    while (out.length < TICKETS_PER_SHIFT && guard++ < 80) {
      const needQuiz = (count.quiz || 0) < 2 && TICKETS_PER_SHIFT - out.length <= 2 - (count.quiz || 0);
      const type = needQuiz ? "quiz" : pick(bag);
      if ((count[type] || 0) >= 2 && !needQuiz) continue;
      if (type === last && !needQuiz && bag.some((t) => t !== type)) continue;
      const t = makeOfType(type, city, used);
      if (!t) continue;
      if (t.id) { if (used.has(TA.concept(t.id))) continue; used.add(TA.concept(t.id)); }
      out.push(t); last = type; count[type] = (count[type] || 0) + 1;
    }
    /* Con especialidad, 2 de los 6 tickets son de tu carrera. */
    const extra = CAREER.tickets(city, { quizById: quizTicket, ofType: (tp, tag) => makeOfType(tp, city, used, tag), usedConcepts: used });
    const base = out.slice(0, TICKETS_PER_SHIFT - extra.length);
    return shuffle(base.concat(extra));
  }

  /* ——— Ciclo del turno ——— */
  let timer = null;

  function start(code) {
    const S = TA.S, city = TA.cityByCode(code || S.city);
    S.cur = { city: city.code, tickets: buildShift(city), i: 0, health: 100, res: [], hints: TA.hintsPerShift(), shield: TA.has("llave"), xp: 0, elapsed: 0, fb: null };
    TA.save();
    open();
  }
  function open() {
    const el = play();
    el.hidden = false;
    document.body.classList.add("playing");
    window.scrollTo(0, 0);
    render();
  }
  function close() {
    stopTimer();
    play().hidden = true;
    play().innerHTML = "";
    document.body.classList.remove("playing");
    UI.go(UI.current());
  }

  function header(cur, city) {
    const hp = Math.max(0, cur.health);
    const tone = hp > 60 ? "ok" : hp > 30 ? "warn" : "bad";
    return `<header class="p-head">
      <button class="icon-btn" id="p-pause" aria-label="Pausar turno"><svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg></button>
      <div class="p-meta">
        <div class="p-row"><span class="mono">${city.code} · TICKET ${Math.min(cur.i + 1, cur.tickets.length)}/${cur.tickets.length}</span><span class="mono">${cur.hints ? "PISTAS " + cur.hints : ""}</span></div>
        <div class="hp" role="meter" aria-label="Salud del banco" aria-valuenow="${hp}" aria-valuemin="0" aria-valuemax="100"><i class="${tone}" style="width:${hp}%"></i></div>
        <div class="p-row"><span class="small vault-l"><svg class="vault ${tone}" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="15" rx="2"/><circle cx="12" cy="11.5" r="3.6"/><path d="M12 7.9v1.4M12 13.7v1.4M8.4 11.5h1.4M14.2 11.5h1.4M6 19v2M18 19v2"/></svg>Salud del banco ${hp} %</span><span class="small">+${cur.xp} rep.</span></div>
      </div>
    </header>`;
  }

  function render() {
    const S = TA.S, cur = S.cur;
    if (!cur) return close();
    if (cur.i >= cur.tickets.length || cur.health <= 0) return finish();
    const city = TA.cityByCode(cur.city), t = cur.tickets[cur.i];
    const el = play();
    el.innerHTML = header(cur, city) + `<div class="sla" aria-hidden="true"><i id="sla-bar"></i></div><div class="p-body" id="p-body"></div><div id="p-sheet"></div>`;
    $("#p-pause").onclick = pause;
    const body = $("#p-body");
    const R = RENDER[t.type];
    R(body, t, (ok, extra) => resolve(ok, extra));
    if (t.career) { const l = body.querySelector(".t-label"); if (l) l.insertAdjacentHTML("afterbegin", '<span class="tag car-tag">Especialidad</span> '); }
    if (cur.fb) showFeedback(cur.fb);
    else startTimer(t);
  }

  function slaFor(t) { return TA.slaSeconds() * 1000 * (t.type === "match" || t.type === "order" ? 1.6 : 1); }
  function startTimer(t) {
    stopTimer();
    const cur = TA.S.cur, total = slaFor(t);
    let lastTick = Date.now();
    const bar = $("#sla-bar");
    const tick = () => {
      const now = Date.now();
      cur.elapsed += now - lastTick; lastTick = now;
      if (bar) { const left = Math.max(0, 1 - cur.elapsed / total); bar.style.width = left * 100 + "%"; bar.classList.toggle("out", left === 0); }
    };
    tick();
    timer = setInterval(tick, 250);
  }
  function stopTimer() { if (timer) clearInterval(timer); timer = null; }

  function resolve(ok, extra) {
    stopTimer();
    const S = TA.S, cur = S.cur, t = cur.tickets[cur.i];
    const fast = ok && cur.elapsed < slaFor(t);
    let gain = ok ? XP_OK + (fast ? XP_FAST : 0) : 0;
    let hit = 0, shielded = false;
    if (!ok) { if (cur.shield) { cur.shield = false; shielded = true; } else hit = HEALTH_HIT; }
    cur.health -= hit; cur.xp += gain;
    S.answered += 1; if (ok) S.correct += 1;
    if (t.id) TA.markResult(t.id, ok);
    TA.markSeen(t.id);
    const career = CAREER.addXp(t, ok);
    if (career && career.up) { cur.careerUp = career.up; PROG.toast({ kind: "mission", title: "Ascenso en tu especialidad", text: career.up, sub: "" }); }
    let cama = null;
    if (t.cama) { cama = ok ? "caught" : "missed"; S.cama[cama] += 1; }
    cur.res.push({ ok, type: t.type, id: t.id || null, label: shortLabel(t), cama });
    PROG.ticket(t, ok, fast, cama);
    HIST.fromTicket(t, ok);
    cur.fb = { ok, gain, fast, hit, shielded, cama, career, extra: extra || "" };
    TA.save();
    const head = $(".p-head", play());
    if (head) head.outerHTML = header(cur, TA.cityByCode(cur.city));
    $("#p-pause").onclick = pause;
    if (hit) { const bar = $(".p-head", play()); bar.classList.add("hit"); setTimeout(() => bar.classList.remove("hit"), 500); }
    showFeedback(cur.fb);
  }

  function shortLabel(t) {
    if (t.type === "quiz") return t.q;
    if (t.type === "mail") return (t.subj || t.body).slice(0, 70);
    if (t.type === "call") return "Llamada: " + t.who;
    if (t.type === "log") return "Log: " + t.src;
    if (t.type === "order") return "Orden: " + t.title;
    if (t.type === "code") return "Código: " + t.title;
    if (t.type === "header") return "Encabezados de correo";
    if (t.type === "siem") return "SIEM: " + t.q;
    if (t.type === "cve") return "Priorizar vulnerabilidades";
    if (t.type === "scan") return "Escaneo: " + t.target;
    if (t.type === "cmd") return "Terminal: " + t.q;
    if (t.type === "risk") return "Riesgo: " + t.text.slice(0, 70);
    return t.label || t.prompt;
  }

  function showFeedback(fb) {
    const cur = TA.S.cur, t = cur.tickets[cur.i];
    const last = cur.i + 1 >= cur.tickets.length || cur.health <= 0;
    const why = t.why || t.w || "";
    const right = t.opts && !fb.ok ? t.opts.find((o) => o.ok) : null;
    const lines = [];
    if (fb.ok) lines.push(`<span class="chip good">+${fb.gain} reputación${fb.fast ? " · bono de rapidez" : ""}</span>`);
    if (fb.hit) lines.push(`<span class="chip bad">−${fb.hit} salud del banco</span>`);
    if (fb.shielded) lines.push(`<span class="chip">La llave FIDO2 absorbió el error</span>`);
    if (fb.career) lines.push(`<span class="chip car">+${fb.career.gain} especialidad</span>`);
    if (fb.cama === "caught") lines.push(`<span class="chip cama">Atrapaste al Camaleón</span>`);
    if (fb.cama === "missed") lines.push(`<span class="chip bad">El Camaleón se escapó</span>`);
    $("#p-sheet").innerHTML = `<div class="sheet ${fb.ok ? "is-ok" : "is-bad"}" role="dialog" aria-live="polite">
      <div class="sheet-head">${reaction(t, fb)}<p class="sheet-k">${fb.ok ? "Bien resuelto" : "No era así"}</p></div>
      ${right ? `<p class="sheet-right">Respuesta correcta: <b>${fmt(right.t)}</b></p>` : ""}
      ${fb.extra ? `<p class="sheet-why">${fb.extra}</p>` : ""}
      ${why ? `<p class="sheet-why">${fmt(why, true)}</p>` : ""}
      ${t.fix ? `<div class="sheet-fix"><small>Así se corrige</small><code>${hl(t.fix)}</code></div>` : ""}
      <div class="chips">${lines.join("")}</div>
      ${GLOSS.chips(ticketText(t))}
      <button class="btn primary wide" id="p-next">${last ? "Cerrar el turno" : "Siguiente ticket"}</button>
    </div>`;
    play().classList.add("has-sheet");
    $("#p-next").onclick = () => {
      cur.fb = null; cur.i += 1; cur.elapsed = 0;
      play().classList.remove("has-sheet");
      TA.save(); render();
      play().scrollTop = 0;
    };
    $("#p-next").focus({ preventScroll: true });
  }

  /* Quién reacciona a tu respuesta: el Camaleón si estaba detrás, si no Juli o Marta. */
  function reaction(t, fb) {
    if (fb.cama) return ART.portrait("cama", fb.cama === "caught" ? "caught" : "smug", "sm");
    const who = t.who === "juli" ? "juli" : "marta";
    return ART.portrait(who, fb.ok ? "happy" : "worried", "sm");
  }

  function pause() {
    stopTimer();
    const el = document.createElement("div");
    el.className = "pause";
    el.innerHTML = `<div class="pause-card">
      <p class="eyebrow">Turno en pausa</p>
      <h2>¿Llamaron a abordar?</h2>
      <p>Tu turno queda guardado en este ticket. Puedes cerrar la app y seguir después.</p>
      <button class="btn primary wide" id="pz-go">Seguir con el turno</button>
      <button class="btn wide" id="pz-out">Salir y guardar</button>
      <button class="btn ghost wide" id="pz-drop">Abandonar el turno</button>
    </div>`;
    play().appendChild(el);
    $("#pz-go").onclick = () => { el.remove(); const t = TA.S.cur.tickets[TA.S.cur.i]; if (!TA.S.cur.fb) startTimer(t); };
    $("#pz-out").onclick = () => { el.remove(); close(); };
    $("#pz-drop").onclick = (e) => {
      if (e.target.dataset.sure) { TA.S.cur = null; TA.save(); el.remove(); close(); return; }
      e.target.dataset.sure = "1"; e.target.textContent = "Toca otra vez para abandonar (pierdes este turno)";
    };
  }
  function autoPause() {
    if (!play() || play().hidden || !TA.S.cur || TA.S.cur.fb || $(".pause", play())) return;
    if (document.hidden) pause();
  }
  document.addEventListener("visibilitychange", autoPause);

  /* ——— Cierre del turno ——— */
  function finish() {
    stopTimer();
    const S = TA.S, cur = S.cur, city = TA.cityByCode(cur.city);
    const before = TA.rankInfo(S.xp);
    const n = cur.res.length, good = cur.res.filter((r) => r.ok).length;
    const acc = n ? good / n : 0;
    const stars = cur.health <= 0 ? 0 : acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : acc >= 0.4 ? 1 : 0;
    let xp = cur.xp + (cur.health > 0 ? 20 : 0);
    if (TA.has("monitor")) xp = Math.round(xp * 1.15);
    if (TA.has("homelab") && cur.health > 0) xp += 30;
    const pay = Math.round(before.salary * (0.4 + 0.6 * acc));
    S.xp += xp; S.money += pay; S.shifts += 1;
    const prog = TA.cityProg(city.code);
    prog.shifts += 1;
    if (stars >= 2) prog.good += 1;
    const examReady = prog.good >= TA.GOOD_FOR_STAMP && !S.stamps[city.code];
    TA.touchStreak();
    const coDay = TYC.founded() ? TYC.nextDay() : null;
    PROG.shift({ stars, health: cur.health, perfect: n > 0 && good === n, camaCaught: cur.res.filter((r) => r.cama === "caught").length, shieldUsed: TA.has("llave") && !cur.shield });
    const after = TA.rankInfo(S.xp);
    const res = cur.res;
    S.cur = null;
    TA.save();
    showResult({ city, stars, acc, xp, pay, res, promo: after.i > before.i ? after : null, examReady, health: cur.health, prog, careerUp: cur.careerUp || null, coDay });
  }

  function starsSvg(n) {
    let s = "";
    for (let i = 0; i < 3; i++) s += `<svg class="star ${i < n ? "on" : ""}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.7 5.9 6.4.7-4.8 4.3 1.3 6.3L12 16.8 6.4 20l1.3-6.3L2.9 9.4l6.4-.7z"/></svg>`;
    return `<div class="stars" role="img" aria-label="${n} de 3 estrellas">${s}</div>`;
  }

  function showResult(r) {
    const quote = pick(MARTA_END[r.stars]);
    const wrong = r.res.filter((x) => !x.ok);
    const need = Math.max(0, TA.GOOD_FOR_STAMP - r.prog.good);
    play().innerHTML = `<div class="result">
      <p class="eyebrow mono">${r.city.code} · FIN DEL TURNO</p>
      ${starsSvg(r.stars)}
      <h2>${r.health <= 0 ? "El banco quedó sin salud" : Math.round(r.acc * 100) + " % de aciertos"}</h2>
      <div class="quote">${ART.portrait("marta", r.stars >= 2 ? "happy" : r.stars === 1 ? "neutral" : "worried")}<p>«${esc(quote)}»<small>Marta Quintero, jefa del SOC</small></p></div>
      <dl class="tally">
        <div><dt>Reputación</dt><dd>+${r.xp}</dd></div>
        <div><dt>Salario</dt><dd>${TA.money(r.pay)}</dd></div>
        <div><dt>Racha</dt><dd>${TA.S.streak.cur} ${TA.S.streak.cur === 1 ? "día" : "días"}</dd></div>
      </dl>
      ${r.examReady ? `<div class="banner exam-b"><p class="eyebrow">Examen de sede desbloqueado</p><h3>Sala de espera · ${esc(r.city.city)}</h3><p>${EXAM_N} preguntas de la sede. Con ${EXAM_PASS} aciertos ganas el sello y abres la siguiente ruta.</p><button class="btn primary wide" id="r-exam">Presentar el examen</button></div>`
        : !TA.S.stamps[r.city.code] ? `<p class="small center">Te ${need === 1 ? "falta 1 turno" : "faltan " + need + " turnos"} de 2 estrellas o más para desbloquear el examen de ${esc(r.city.city)}.</p>` : ""}
      ${r.coDay ? TYC.resultCard(r.coDay) : ""}
      ${wrong.length ? `<div class="review"><p class="eyebrow">Para repasar · vuelven en tus próximos turnos</p><ul>${wrong.map((w) => `<li>${fmt(w.label)}</li>`).join("")}</ul></div>` : ""}
      <div class="stack">
        <button class="btn primary wide" id="r-again">Otro turno en ${esc(r.city.city)}</button>
        <button class="btn wide" id="r-home">Volver al inicio</button>
      </div>
    </div>`;
    $("#r-again").onclick = () => start(r.city.code);
    $("#r-home").onclick = close;
    if ($("#r-exam")) $("#r-exam").onclick = () => exam(r.city.code);
    if ($("#r-co")) $("#r-co").onclick = () => { close(); UI.go("empresa"); };
    play().scrollTop = 0;
    const afterPromo = () => CAREER.ensureOffer();
    if (r.promo) setTimeout(() => ART.promoCeremony(r.promo, afterPromo), ART.reduced() ? 0 : 900);
    else if (r.careerUp) setTimeout(() => {
      const c = CAREER.current();
      ART.confetti();
      ART.ceremony(`<p class="eyebrow mono">Especialidad · ${esc(c.name)}</p><div class="car-badge" style="--h:${c.hue}" aria-hidden="true">${esc(c.short)}</div><h2>Ahora eres ${esc(r.careerUp)}</h2><p>Subiste de nivel en tu carrera. Sigue resolviendo casos de especialidad para el próximo cargo.</p>`, [["ok", "Seguir"]]);
    }, ART.reduced() ? 0 : 900);
  }

  /* ——— Minijuegos ——— */
  function who(t) {
    const c = t.who && CHARACTERS[t.who];
    return c ? `<div class="from">${ART.portrait(t.who, "neutral", "sm")}<div><b>${esc(c.name)}</b><small>${esc(c.role)}</small></div></div>` : "";
  }

  function options(root, opts, onPick, extraClass) {
    const cur = TA.S.cur;
    const wrap = document.createElement("div");
    wrap.className = "opts" + (extraClass ? " " + extraClass : "");
    wrap.innerHTML = opts.map((o, i) => `<button class="opt" data-i="${i}">${fmt(o.t)}</button>`).join("");
    root.appendChild(wrap);
    const btns = [...wrap.children];
    btns.forEach((b) => b.onclick = () => {
      const o = opts[+b.dataset.i];
      btns.forEach((x, i) => { x.disabled = true; if (opts[i].ok) x.classList.add("right"); });
      if (!o.ok) b.classList.add("wrong");
      onPick(o.ok);
    });
    if (cur.hints > 0 && opts.length > 2) {
      const h = document.createElement("button");
      h.className = "btn ghost hint";
      h.innerHTML = `Usar pista <span class="small">(${cur.hints})</span>`;
      h.onclick = () => {
        const wrongs = btns.filter((b, i) => !opts[i].ok && !b.disabled);
        if (!wrongs.length) return;
        const b = pick(wrongs); b.disabled = true; b.classList.add("struck");
        cur.hints -= 1; TA.save(); h.remove();
      };
      root.appendChild(h);
    }
  }

  /* Resaltado sencillo: textos entre comillas, comentarios y palabras clave. */
  const KW = /^(def|return|import|from|if|public|void|new|const|let|String|Long|Statement|ResultSet|PreparedStatement|and|or|not|True|False|None|Allow)$/;
  function hl(line) {
    const re = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(#.*$|\/\/.*$)|(@?\b[A-Za-z_]+\b)/g;
    let out = "", last = 0, m;
    while ((m = re.exec(line))) {
      out += esc(line.slice(last, m.index));
      if (m[1]) out += `<span class="hl-s">${esc(m[1])}</span>`;
      else if (m[2]) out += `<span class="hl-c">${esc(m[2])}</span>`;
      else if (KW.test(m[3]) || m[3][0] === "@") out += `<span class="hl-k">${esc(m[3])}</span>`;
      else out += esc(m[3]);
      last = re.lastIndex;
    }
    return out + esc(line.slice(last));
  }
  const sevOf = (v) => (v >= 9 ? ["crit", "Crítica"] : v >= 7 ? ["high", "Alta"] : v >= 4 ? ["med", "Media"] : ["low", "Baja"]);

  function qrSvg(text) {
    let h = 7; const cells = [];
    for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const N = 21, finder = (x, y) => (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (finder(x, y)) continue;
      h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
      if ((h >>> 0) % 2) cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
    }
    const f = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
    return `<svg class="qr" viewBox="-1 -1 23 23" aria-label="Código QR del cartel"><rect x="-1" y="-1" width="23" height="23" fill="#fff"/><g fill="#111">${cells.join("")}${f(0, 0)}${f(N - 7, 0)}${f(0, N - 7)}</g></svg>`;
  }

  const RISK_LV = (p, i) => (p * i >= 9 ? 3 : p * i >= 6 ? 2 : p * i >= 3 ? 1 : 0);
  const RISK_NAMES = ["Bajo", "Medio", "Alto", "Crítico"];

  const RENDER = {
    scan(root, t, done) {
      root.innerHTML = `<article class="ticket">
        <p class="t-label">Escaneo autorizado · Nmap${t.review ? ' <span class="tag">repaso</span>' : ""}</p>
        <h3 class="t-q">¿Qué hallazgo reportas como el más grave?</h3>
        <p class="small mono">${esc(t.target)}</p>
      </article>
      <div class="log scanout" role="list">${t.lines.map((l, i) => `<button class="log-line mono" role="listitem" data-i="${i}" ${i === 0 ? "disabled" : ""}>${esc(l)}</button>`).join("")}</div>`;
      const btns = [...root.querySelectorAll(".log-line")];
      btns.forEach((b) => b.onclick = () => {
        btns.forEach((x) => x.disabled = true);
        btns[t.bad].classList.add("right");
        const i = +b.dataset.i;
        if (i !== t.bad) b.classList.add("wrong");
        done(i === t.bad);
      });
    },

    risk(root, t, done) {
      const lv = RISK_LV(t.p, t.i);
      const PL = ["", "Baja", "Media", "Alta"], IL = ["", "Bajo", "Medio", "Alto"];
      let cells = "";
      for (let p = 3; p >= 1; p--) {
        cells += `<span class="rm-l">${PL[p]}</span>`;
        for (let i = 1; i <= 3; i++) cells += `<button class="rm-c lv-${RISK_LV(p, i)}" data-p="${p}" data-i="${i}" aria-label="Probabilidad ${PL[p]}, impacto ${IL[i]}">${RISK_NAMES[RISK_LV(p, i)]}</button>`;
      }
      cells += `<span></span>` + [1, 2, 3].map((i) => `<span class="rm-l">${IL[i]}</span>`).join("");
      root.innerHTML = `<article class="ticket">
        <p class="t-label">Matriz de riesgo${t.review ? ' <span class="tag">repaso</span>' : ""}</p>
        <h3 class="t-q">¿En qué casilla va este riesgo?</h3>
        <p>${GLOSS.link(esc(t.text))}</p>
      </article>
      <div class="rm"><span class="rm-ax rm-ay">Probabilidad ↑</span><div class="rm-grid">${cells}</div><span class="rm-ax">Impacto →</span></div>`;
      const btns = [...root.querySelectorAll(".rm-c")];
      btns.forEach((b) => b.onclick = () => {
        btns.forEach((x) => { x.disabled = true; if (+x.dataset.p === t.p && +x.dataset.i === t.i) x.classList.add("right"); });
        const ok = RISK_LV(+b.dataset.p, +b.dataset.i) === lv;
        if (!(+b.dataset.p === t.p && +b.dataset.i === t.i)) b.classList.add(ok ? "near" : "wrong");
        done(ok, "Nivel correcto: <b>" + RISK_NAMES[lv] + "</b> (probabilidad " + PL[t.p].toLowerCase() + ", impacto " + IL[t.i].toLowerCase() + ").");
      });
    },

    code(root, t, done) {
      root.innerHTML = `<article class="ticket">
        <p class="t-label">Revisión de código · ${esc(t.lang)}${t.review ? ' <span class="tag">repaso</span>' : ""}</p>
        <h3 class="t-q">${esc(t.title)}</h3>
        <p class="small">Toca la línea vulnerable.</p>
      </article>
      <div class="code" role="list">${t.lines.map((l, i) => `<button class="code-line mono" role="listitem" data-i="${i}" ${l.trim() ? "" : "disabled"}><span class="ln">${i + 1}</span><span class="cl">${hl(l) || "&nbsp;"}</span></button>`).join("")}</div>`;
      const btns = [...root.querySelectorAll(".code-line")];
      btns.forEach((b) => b.onclick = () => {
        btns.forEach((x) => x.disabled = true);
        btns[t.bad].classList.add("right");
        const i = +b.dataset.i;
        if (i !== t.bad) b.classList.add("wrong");
        done(i === t.bad);
      });
    },

    header(root, t, done) {
      root.innerHTML = `<article class="ticket">
        <p class="t-label">Encabezados de correo${t.review ? ' <span class="tag">repaso</span>' : ""}</p>
        <h3 class="t-q">¿Este correo es legítimo o está suplantado?</h3>
        <p class="small">Revisa el dominio del From, el Return-Path y los resultados de SPF, DKIM y DMARC.</p>
      </article>
      <div class="hdrs mono">${t.lines.map((l, i) => `<p data-i="${i}">${esc(l)}</p>`).join("")}</div>
      <div class="duo">
        <button class="btn big" id="h-legit">Legítimo</button>
        <button class="btn big danger" id="h-fake">Suplantado</button>
      </div>`;
      const decide = (saysLegit) => {
        $("#h-legit").disabled = $("#h-fake").disabled = true;
        root.querySelectorAll(".hdrs p").forEach((p) => { if (t.clue.includes(+p.dataset.i)) p.classList.add("clue"); });
        done(saysLegit === t.legit, t.legit ? "Era <b>legítimo</b>. Las líneas marcadas lo confirman." : "Estaba <b>suplantado</b>. Las líneas marcadas lo delatan.");
      };
      $("#h-legit").onclick = () => decide(true);
      $("#h-fake").onclick = () => decide(false);
    },

    siem(root, t, done) {
      root.innerHTML = `<article class="ticket">
        <p class="t-label">Consulta al SIEM · ${esc(t.lang)}${t.review ? ' <span class="tag">repaso</span>' : ""}</p>
        <h3 class="t-q">${GLOSS.link(esc(t.q))}</h3>
      </article>`;
      options(root, t.opts, done, "code-opts");
    },

    cve(root, t, done) {
      root.innerHTML = `<article class="ticket">
        <p class="t-label">Gestión de vulnerabilidades${t.review ? ' <span class="tag">repaso</span>' : ""}</p>
        <h3 class="t-q">Solo hay tiempo para un parche esta noche. ¿Cuál va primero?</h3>
        <p class="small">Pesa el CVSS, pero también si está en internet y si ya se explota (catálogo KEV de CISA).</p>
      </article>
      <div class="cves">${t.items.map((x, i) => { const [sc, sl] = sevOf(x.cvss); return `<button class="cve" data-i="${i}">
        <span class="cve-top"><span class="mono">${esc(x.id)}</span><span class="sev sev-${sc}">CVSS ${x.cvss.toFixed(1)} · ${sl}</span></span>
        <b>${esc(x.name)}</b>
        <span class="small">${esc(x.asset)}</span>
        <span class="cve-tags"><span class="st ${x.exp === "Internet" ? "exam" : x.exp === "Aislado" ? "shut" : "open"}">${esc(x.exp)}</span>${x.kev ? '<span class="st exam">Explotada (KEV)</span>' : '<span class="st shut">Sin explotación conocida</span>'}</span>
      </button>`; }).join("")}</div>`;
      const btns = [...root.querySelectorAll(".cve")];
      btns.forEach((b) => b.onclick = () => {
        btns.forEach((x, i) => { x.disabled = true; if (t.items[i].ok) x.classList.add("right"); });
        const i = +b.dataset.i;
        if (!t.items[i].ok) b.classList.add("wrong");
        done(t.items[i].ok);
      });
    },

    quiz(root, t, done) {
      root.innerHTML = `<article class="ticket">
        <p class="t-label">${esc(t.label)}${t.review ? ' <span class="tag">repaso</span>' : ""}</p>
        ${who(t)}
        <h3 class="t-q">${fmt(t.q, true)}</h3>
      </article>`;
      options(root, t.opts, done);
    },

    mail(root, t, done) {
      const tagLine = `${t.review ? ' <span class="tag">repaso</span>' : ""}${t.en ? ' <span class="tag">english</span>' : ""}`;
      const m = /^(.*?)\s*<([^>]+)>$/.exec(t.from || "");
      const name = m ? m[1].replace(/"/g, "") : t.from, addr = m ? m[2] : "";
      const initial = esc((name || "?").trim().charAt(0).toUpperCase());
      const hue = [...(name || "")].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 360;
      let inner;
      if (t.ch === "SMS" || t.ch === "WhatsApp") {
        inner = `<div class="chat ${t.ch === "WhatsApp" ? "wa" : "sms"}">
          <div class="chat-bar"><span class="mc-av" style="--h:${hue}">${initial}</span><div><b>${esc(name)}</b><small>${t.ch === "WhatsApp" ? "WhatsApp" : "Mensaje de texto"}</small></div></div>
          <div class="chat-body"><p class="bubble">${GLOSS.link(esc(t.body))}<span class="mono">08:14</span></p></div></div>`;
      } else if (t.ch === "QR") {
        inner = `<div class="poster"><p class="poster-where small">${esc(t.from)}</p><h3>${esc(t.subj || "Escanea aquí")}</h3>${qrSvg(t.body)}<p>${GLOSS.link(esc(t.body))}</p></div>`;
      } else {
        inner = `<div class="mailclient">
          <div class="mc-bar"><span>Bandeja de entrada</span><span class="mono">08:14</span></div>
          <div class="mc-head"><span class="mc-av" style="--h:${hue}">${initial}</span><div><b>${esc(name)}</b>${addr ? `<small class="mono">${esc(addr)}</small>` : ""}<small>Para: mí</small></div></div>
          ${t.subj ? `<h3 class="m-subj">${esc(t.subj)}</h3>` : ""}
          <p class="m-body">${GLOSS.link(esc(t.body))}</p></div>`;
      }
      root.innerHTML = `<p class="t-label">Reportado por un usuario · ${esc(t.ch)}${tagLine}</p>
        <div class="swipe-zone">
          <span class="swipe-hint left">Legítimo</span><span class="swipe-hint right">Phishing</span>
          <article class="ticket mail" id="mail-card" tabindex="0" aria-label="Mensaje a revisar">${inner}</article>
        </div>
        <p class="small center">Desliza a la derecha si es phishing, a la izquierda si es legítimo, o usa los botones.</p>
        <div class="duo">
          <button class="btn big" id="m-legit">Legítimo</button>
          <button class="btn big danger" id="m-phish">Phishing</button>
        </div>`;
      const card = $("#mail-card"), zone = card.parentElement;
      let answered = false;
      const decide = (saysPhish) => {
        if (answered) return; answered = true;
        card.style.transform = "";
        card.dataset.verdict = saysPhish ? "Phishing" : "Legítimo";
        card.classList.add("judged", saysPhish ? "v-phish" : "v-legit");
        $("#m-legit").disabled = $("#m-phish").disabled = true;
        done(saysPhish === t.phish, (t.phish ? "Era <b>phishing</b>." : "Era <b>legítimo</b>."));
      };
      $("#m-legit").onclick = () => decide(false);
      $("#m-phish").onclick = () => decide(true);
      let x0 = null, dx = 0;
      card.addEventListener("pointerdown", (e) => { if (answered || e.target.closest(".gl")) return; e.preventDefault(); x0 = e.clientX; dx = 0; card.setPointerCapture(e.pointerId); card.classList.add("drag"); });
      card.addEventListener("pointermove", (e) => {
        if (x0 === null) return;
        dx = e.clientX - x0;
        card.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`;
        zone.dataset.lean = dx > 40 ? "right" : dx < -40 ? "left" : "";
      });
      const end = () => {
        if (x0 === null) return;
        x0 = null; card.classList.remove("drag"); zone.dataset.lean = "";
        if (Math.abs(dx) > 90) decide(dx > 0);
        else card.style.transform = "";
      };
      card.addEventListener("pointerup", end);
      card.addEventListener("pointercancel", end);
    },

    /* Llamada: primero la pantalla de llamada entrante; al contestar aparece la conversación. */
    call(root, t, done) {
      const pic = ART.portrait(t.face || "stranger", t.face === "hernan" || t.face === "clienta" ? "worried" : "neutral");
      root.innerHTML = `<div class="phone" id="phone">
          <p class="ph-top">Llamada entrante${t.review ? ' · <span class="tag">repaso</span>' : ""}</p>
          <div class="ph-pic">${pic}</div>
          <h3 class="ph-name">${esc(t.who)}</h3>
          <p class="ph-num mono">${esc(t.from)}</p>
          <div class="ph-slide" id="ph-slide"><button class="ph-knob" id="ph-knob" aria-label="Contestar la llamada"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg></button><span>desliza para contestar</span></div>
        </div>`;
      const answer = () => {
        root.innerHTML = `<article class="ticket call">
          <p class="t-label">En llamada · <span class="mono">00:0${1 + TA.rand(8)}</span></p>
          <div class="caller"><span class="caller-pic">${pic}</span><div><b>${esc(t.who)}</b><small class="mono">${esc(t.from)}</small></div></div>
          <blockquote class="say">${GLOSS.link(esc(t.say))}</blockquote>
          <p class="t-sub">¿Qué haces?</p>
        </article>`;
        options(root, t.opts, done);
      };
      const knob = $("#ph-knob"), track = $("#ph-slide");
      let x0 = null, dx = 0;
      knob.onclick = () => { if (Math.abs(dx) < 5) answer(); };
      knob.addEventListener("pointerdown", (e) => { x0 = e.clientX; dx = 0; knob.setPointerCapture(e.pointerId); });
      knob.addEventListener("pointermove", (e) => {
        if (x0 === null) return;
        const max = track.clientWidth - knob.offsetWidth - 8;
        dx = Math.max(0, Math.min(max, e.clientX - x0));
        knob.style.transform = `translateX(${dx}px)`;
      });
      knob.addEventListener("pointerup", () => {
        if (x0 === null) return;
        const max = track.clientWidth - knob.offsetWidth - 8;
        x0 = null;
        if (dx > max * 0.7) answer(); else { knob.style.transform = ""; dx = dx > 5 ? dx : 0; setTimeout(() => { dx = 0; }, 0); }
      });
    },

    /* Log en una terminal: las líneas aparecen una tras otra. */
    log(root, t, done) {
      const file = /auth/.test(t.src) ? "/var/log/auth.log" : /cron/.test(t.src) ? "/var/log/syslog" : /Windows/.test(t.src) ? "Security.evtx" : "eventos.log";
      root.innerHTML = `<article class="ticket">
        <p class="t-label">Alerta del SIEM${t.review ? ' <span class="tag">repaso</span>' : ""}</p>
        <h3 class="t-q">Toca la línea sospechosa</h3>
        <p class="small mono">${esc(t.src)}</p>
      </article>
      <div class="term"><div class="term-bar"><i></i><i></i><i></i><span class="mono">analista@soc-andino</span></div>
        <p class="term-cmd mono">$ tail -n ${t.lines.length} ${esc(file)}</p>
        <div class="log" role="list">${t.lines.map((l, i) => `<button class="log-line mono typed" style="--d:${i}" role="listitem" data-i="${i}">${esc(l)}</button>`).join("")}</div></div>`;
      const btns = [...root.querySelectorAll(".log-line")];
      btns.forEach((b) => b.onclick = () => {
        btns.forEach((x) => x.disabled = true);
        btns[t.bad].classList.add("right");
        const i = +b.dataset.i;
        if (i !== t.bad) b.classList.add("wrong");
        done(i === t.bad);
      });
    },

    /* Comandos reales: elige el comando y mira lo que devuelve. */
    cmd(root, t, done) {
      root.innerHTML = `<article class="ticket">
        <p class="t-label">Terminal · ${esc(t.os)}${t.review ? ' <span class="tag">repaso</span>' : ""}</p>
        <h3 class="t-q">${GLOSS.link(esc(t.q))}</h3>
        <p class="small">Elige el comando que responde la pregunta.</p>
      </article>`;
      options(root, t.opts, (ok) => {
        const right = t.opts.find((o) => o.ok).t;
        const term = document.createElement("div");
        term.className = "term";
        term.innerHTML = `<div class="term-bar"><i></i><i></i><i></i><span class="mono">${t.os === "Windows" ? "PS C:\\SOC" : "analista@rpt-01"}</span></div>
          <p class="term-cmd mono">${t.os === "Windows" ? "PS&gt;" : "$"} ${esc(right)}</p>
          <div class="term-out">${t.out.map((l, i) => `<p class="mono typed" style="--d:${i}">${esc(l) || "&nbsp;"}</p>`).join("")}</div>`;
        root.appendChild(term);
        done(ok);
        /* La hoja de retroalimentación tapa la parte baja: se sube la vista hasta la terminal. */
        setTimeout(() => { const p = play(); p.scrollTop = Math.max(0, term.offsetTop - 70); }, 60);
      }, "code-opts");
    },

    decode(root, t, done) {
      root.innerHTML = `<article class="ticket">
        <p class="t-label">${esc(t.label)}</p>
        <h3 class="t-q">${esc(t.prompt)}</h3>
        ${t.value2 ? `<div class="hashes"><p class="small">Publicado</p><code class="code-val small-code">${esc(t.value)}</code><p class="small">Tu archivo</p><code class="code-val small-code">${esc(t.value2)}</code></div>`
          : `<code class="code-val">${esc(t.value)}</code>`}
      </article>`;
      options(root, t.opts, done);
    },

    match(root, t, done) {
      const L = shuffle(t.pairs.map((p, i) => i)), Rr = shuffle(t.pairs.map((p, i) => i));
      root.innerHTML = `<article class="ticket">
        <p class="t-label">${esc(t.label)}</p>
        <h3 class="t-q">${esc(t.prompt)}</h3>
      </article>
      <div class="match">
        <div class="col"><p class="col-h">${esc(t.left)}</p>${L.map((i) => `<button class="tile mono" data-side="l" data-i="${i}">${esc(t.pairs[i][0])}</button>`).join("")}</div>
        <div class="col"><p class="col-h">${esc(t.right)}</p>${Rr.map((i) => `<button class="tile" data-side="r" data-i="${i}">${esc(t.pairs[i][1])}</button>`).join("")}</div>
      </div>
      <p class="small center" id="mt-msg">Toca uno de cada columna.</p>`;
      let sel = null, mistakes = 0, hits = 0;
      root.querySelectorAll(".tile").forEach((b) => b.onclick = () => {
        if (b.classList.contains("done")) return;
        if (!sel || sel.dataset.side === b.dataset.side) {
          if (sel) sel.classList.remove("sel");
          sel = b; b.classList.add("sel"); return;
        }
        if (sel.dataset.i === b.dataset.i) {
          hits += 1;
          [sel, b].forEach((x) => { x.classList.remove("sel"); x.classList.add("done"); x.disabled = true; x.dataset.n = hits; });
          if (hits === t.pairs.length) done(mistakes <= 1, mistakes ? "Tuviste " + mistakes + (mistakes === 1 ? " error." : " errores.") : "Sin errores.");
        } else {
          mistakes += 1;
          [sel, b].forEach((x) => { x.classList.remove("sel"); x.classList.add("shake"); setTimeout(() => x.classList.remove("shake"), 400); });
          $("#mt-msg").textContent = "Esa pareja no va. Errores: " + mistakes;
        }
        sel = null;
      });
    },

    order(root, t, done) {
      root.innerHTML = `<article class="ticket">
        <p class="t-label">Procedimiento</p>
        <h3 class="t-q">${esc(t.title)}</h3>
        <p class="small">Toca los pasos en el orden correcto.</p>
      </article>
      <ol class="picked" id="od-picked"></ol>
      <div class="deck">${t.deck.map((i) => `<button class="step" data-i="${i}">${esc(t.steps[i])}</button>`).join("")}</div>
      <p class="small center" id="od-msg"></p>`;
      let next = 0, mistakes = 0;
      root.querySelectorAll(".step").forEach((b) => b.onclick = () => {
        if (+b.dataset.i === next) {
          const li = document.createElement("li"); li.textContent = t.steps[next];
          $("#od-picked").appendChild(li); b.remove(); next += 1;
          if (next === t.steps.length) done(mistakes <= 1, mistakes ? "Tuviste " + mistakes + (mistakes === 1 ? " error." : " errores.") : "Orden perfecto.");
        } else {
          mistakes += 1; b.classList.add("shake"); setTimeout(() => b.classList.remove("shake"), 400);
          $("#od-msg").textContent = "Ese no va todavía. Errores: " + mistakes;
        }
      });
    },
  };

  /* ——— Repaso relámpago (60 s) ——— */
  function flash() {
    const S = TA.S;
    let ids = [];
    CITIES.filter((c) => TA.cityOpen(c.code)).forEach((c) => { ids = ids.concat(TA.quizIdsFor(c)); });
    const seen = ids.filter((id) => S.seen[id]);
    const seenC = new Set();
    const pool = shuffle(seen.length >= 12 ? seen : ids).sort((a, b) => TA.seenCount(a) - TA.seenCount(b))
      .filter((id) => { const c = TA.concept(id); if (seenC.has(c)) return false; seenC.add(c); return true; });
    const el = play();
    el.hidden = false; document.body.classList.add("playing"); window.scrollTo(0, 0);
    let k = 0, right = 0, misses = [], left = 60000, lastT = Date.now(), done = false;
    el.innerHTML = `<header class="p-head">
        <button class="icon-btn" id="f-x" aria-label="Salir del repaso"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        <div class="p-meta"><div class="p-row"><span class="mono">REPASO RELÁMPAGO</span><span class="mono" id="f-t">60 s</span></div>
        <div class="hp"><i class="ok" id="f-bar" style="width:100%"></i></div>
        <div class="p-row"><span class="small" id="f-score">0 aciertos</span><span class="small">+5 rep. cada uno</span></div></div>
      </header><div class="p-body" id="f-body"></div>`;
    $("#f-x").onclick = () => { end(); };
    const iv = setInterval(() => {
      if (document.hidden) { lastT = Date.now(); return; }
      const now = Date.now(); left -= now - lastT; lastT = now;
      $("#f-t").textContent = Math.max(0, Math.ceil(left / 1000)) + " s";
      $("#f-bar").style.width = Math.max(0, left / 600) + "%";
      if (left <= 0) end();
    }, 200);
    function ask() {
      const id = pool[k % pool.length], q = TA.quizById(id);
      k += 1;
      if (!q || !Array.isArray(q.a)) return ask();
      const opts = shuffle(q.a.map((t, i) => ({ t, ok: i === q.c })));
      const body = $("#f-body");
      body.innerHTML = `<article class="ticket"><h3 class="t-q">${fmt(q.q)}</h3></article>`;
      const wrap = document.createElement("div"); wrap.className = "opts";
      wrap.innerHTML = opts.map((o, i) => `<button class="opt" data-i="${i}">${fmt(o.t)}</button>`).join("");
      body.appendChild(wrap);
      [...wrap.children].forEach((b) => b.onclick = () => {
        if (done) return;
        const o = opts[+b.dataset.i];
        [...wrap.children].forEach((x, i) => { x.disabled = true; if (opts[i].ok) x.classList.add("right"); });
        PROG.ticket({ type: "quiz", id }, o.ok, false, null);
        if (o.ok) { right += 1; TA.markResult(id, true); }
        else { b.classList.add("wrong"); misses.push({ q, id }); TA.markResult(id, false); }
        S.seen[id] = 1; TA.markSeen(id);
        $("#f-score").textContent = right + (right === 1 ? " acierto" : " aciertos");
        setTimeout(() => { if (!done) ask(); }, o.ok ? 450 : 1100);
      });
    }
    function end() {
      if (done) return; done = true; clearInterval(iv);
      const xp = right * 5;
      S.xp += xp; S.answered += k; S.correct += right;
      const record = right > S.flashBest; if (record) S.flashBest = right;
      TA.save();
      PROG.flash({ right });
      el.innerHTML = `<div class="result">
        <p class="eyebrow mono">REPASO RELÁMPAGO</p>
        <h2>${right} ${right === 1 ? "acierto" : "aciertos"} en 60 segundos</h2>
        <p class="center">${record ? "Nuevo récord personal." : "Tu récord: " + S.flashBest + "."} Ganaste +${xp} de reputación.</p>
        ${misses.length ? `<div class="review"><p class="eyebrow">Lo que fallaste</p><ul>${misses.map((m) => `<li><b>${fmt(m.q.q, true)}</b><br>${fmt(m.q.a[m.q.c])}${m.q.w ? " · " + fmt(m.q.w, true) : ""}</li>`).join("")}</ul></div>` : ""}
        <div class="stack"><button class="btn primary wide" id="f-again">Otra ronda</button><button class="btn wide" id="f-home">Volver al inicio</button></div>
      </div>`;
      $("#f-again").onclick = flash;
      $("#f-home").onclick = close;
    }
    ask();
  }

  /* ——— Examen de sede («sala de espera»): 10 preguntas, se aprueba con 8. ——— */
  function exam(code) {
    const S = TA.S;
    stopTimer();
    if (!S.exam || S.exam.city !== code) {
      const city = TA.cityByCode(code);
      const seenC = new Set();
      const ids = shuffle(TA.quizIdsFor(city)).filter((id) => { const c = TA.concept(id); if (seenC.has(c)) return false; seenC.add(c); return true; });
      S.exam = { city: code, ids: ids.slice(0, EXAM_N), i: 0, right: 0, misses: [], last: null };
      TA.save();
    }
    play().hidden = false; document.body.classList.add("playing"); window.scrollTo(0, 0);
    renderExam();
  }

  function renderExam() {
    const S = TA.S, ex = S.exam;
    if (!ex) return close();
    if (ex.i >= ex.ids.length && !ex.last) return finishExam();
    const city = TA.cityByCode(ex.city);
    const shown = ex.last ? ex.last.k : ex.i;
    const id = ex.ids[shown], q = TA.quizById(id);
    play().innerHTML = `<header class="p-head">
        <button class="icon-btn" id="ex-x" aria-label="Salir del examen (queda guardado)"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        <div class="p-meta"><div class="p-row"><span class="mono">EXAMEN · ${city.code} · ${shown + 1}/${ex.ids.length}</span><span class="mono" id="ex-score">${ex.right} ✓</span></div>
        <div class="bar"><i style="width:${(ex.i / ex.ids.length) * 100}%"></i></div>
        <div class="p-row"><span class="small">Sala de espera · ${esc(city.city)}</span><span class="small">Apruebas con ${EXAM_PASS}</span></div></div>
      </header><div class="p-body" id="ex-body"></div>`;
    $("#ex-x").onclick = close;
    if (!q || !Array.isArray(q.a)) { ex.i += 1; ex.last = null; TA.save(); return renderExam(); }
    const body = $("#ex-body");
    body.innerHTML = `<article class="ticket"><p class="t-label">Pregunta ${shown + 1}</p><h3 class="t-q">${fmt(q.q, true)}</h3></article>`;
    const opts = q.a.map((t, i) => ({ t, ok: i === q.c }));
    const wrap = document.createElement("div"); wrap.className = "opts";
    wrap.innerHTML = opts.map((o, i) => `<button class="opt" data-i="${i}">${fmt(o.t)}</button>`).join("");
    body.appendChild(wrap);
    const btns = [...wrap.children];
    const reveal = (picked) => {
      btns.forEach((x, i) => { x.disabled = true; if (opts[i].ok) x.classList.add("right"); });
      if (!opts[picked].ok) btns[picked].classList.add("wrong");
      const ok = opts[picked].ok;
      const box = document.createElement("div");
      box.className = "ex-why " + (ok ? "is-ok" : "is-bad");
      box.innerHTML = `<p class="sheet-k">${ok ? "Correcto" : "Incorrecto"}</p>${q.w ? `<p>${fmt(q.w, true)}</p>` : ""}${GLOSS.chips(q.q + " " + q.a.join(" ") + " " + (q.w || ""))}<button class="btn primary wide" id="ex-next">${ex.i >= ex.ids.length ? "Ver resultado" : "Siguiente pregunta"}</button>`;
      body.appendChild(box);
      $("#ex-next").onclick = () => { ex.last = null; TA.save(); renderExam(); play().scrollTop = 0; };
      $("#ex-next").focus({ preventScroll: true });
    };
    if (ex.last) return reveal(ex.last.picked);
    btns.forEach((b) => b.onclick = () => {
      const i = +b.dataset.i, ok = opts[i].ok;
      if (ok) ex.right += 1; else ex.misses.push(id);
      PROG.ticket({ type: "quiz", id }, ok, false, null);
      TA.markResult(id, ok); TA.markSeen(id); S.answered += 1; if (ok) S.correct += 1;
      ex.last = { k: ex.i, picked: i }; ex.i += 1;
      TA.save();
      $("#ex-score").textContent = ex.right + " ✓";
      reveal(i);
    });
  }

  function finishExam() {
    const S = TA.S, ex = S.exam, city = TA.cityByCode(ex.city);
    const pass = ex.right >= EXAM_PASS;
    const before = TA.rankInfo(S.xp);
    let next = null;
    if (pass) {
      S.stamps[city.code] = TA.dayKey();
      S.xp += EXAM_XP;
      next = CITIES[CITIES.indexOf(city) + 1] || null;
      if (next) S.city = next.code;
    }
    const after = TA.rankInfo(S.xp);
    const misses = ex.misses.map((id) => TA.quizById(id)).filter(Boolean);
    S.exam = null;
    TA.save();
    PROG.exam({ city: city.code, pass, right: ex.right });
    play().innerHTML = `<div class="result">
      <p class="eyebrow mono">EXAMEN DE SEDE · ${city.code}</p>
      <h2>${ex.right} de ${ex.ids.length}${pass ? " · Aprobado" : ""}</h2>
      <div class="quote">${ART.portrait("marta", pass ? "happy" : "worried")}<p>«${pass ? "Aprobado. Empaca, que te vas de viaje." : "Te faltó poco. Repasa lo que fallaste y lo vuelves a presentar cuando quieras."}»<small>Marta Quintero</small></p></div>
      ${pass ? `<p class="center">+${EXAM_XP} de reputación.</p>` : `<p class="small center">Necesitas ${EXAM_PASS} aciertos. La próxima vez salen otras preguntas de la sede.</p>`}
      ${misses.length ? `<div class="review"><p class="eyebrow">Lo que fallaste</p><ul>${misses.map((q) => `<li><b>${fmt(q.q)}</b><br>${fmt(q.a[q.c])}${q.w ? " · " + fmt(q.w) : ""}</li>`).join("")}</ul></div>` : ""}
      <div class="stack">
        ${pass ? "" : `<button class="btn primary wide" id="xr-again">Presentar de nuevo</button>`}
        <button class="btn ${pass ? "primary" : ""} wide" id="xr-home">Volver al inicio</button>
      </div>
    </div>`;
    if ($("#xr-again")) $("#xr-again").onclick = () => exam(city.code);
    $("#xr-home").onclick = close;
    play().scrollTop = 0;
    const promoted = after.i > before.i;
    if (pass) {
      ART.confetti();
      /* Primero el sello, luego el ascenso (si hubo) y al final el mapa, para ver volar el avión. */
      ART.stampCeremony(city, next, (b) => {
        const goMap = () => { if (b === "map") { close(); UI.go("rutas"); } };
        if (promoted) ART.promoCeremony(after, goMap); else goMap();
      });
    } else if (promoted) ART.promoCeremony(after);
  }

  window.PLAY = { start, resume: open, flash, exam, EXAM_N, EXAM_PASS };
})();
