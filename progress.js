/* Turno Andino — progreso: logros, misiones diarias y semanales, y preparación para Security+.
   El juego avisa de lo que pasa con PROG.ticket / shift / flash / exam / buy; aquí se cuentan y se premian. */
(function () {
  const S = () => TA.S;
  const st = () => { const s = S(); if (!s.st) s.st = {}; return s.st; };
  const inc = (k, n) => { const o = st(); o[k] = (o[k] || 0) + (n == null ? 1 : n); };
  const top = (k, v) => { const o = st(); o[k] = Math.max(o[k] || 0, v); };
  const val = (k) => st()[k] || 0;

  /* ——— Security+ SY0-701: 5 dominios con su peso en el examen ——— */
  const DOMAINS = [
    [1, "Conceptos generales de seguridad", 12],
    [2, "Amenazas, vulnerabilidades y mitigaciones", 22],
    [3, "Arquitectura de seguridad", 18],
    [4, "Operaciones de seguridad", 28],
    [5, "Gestión y supervisión del programa", 20],
  ];
  const DOM_OF_MOD = {
    m13: 1, m14: 1,
    m12: 2, m16: 2, m17: 2, m24: 2,
    m07: 3, m08: 3, m09: 3, m25: 3,
    m01: 4, m02: 4, m03: 4, m04a: 4, m04: 4, m05: 4, m06: 4, m10: 4, m11: 4, m15: 4, m18: 4, m19: 4, m20: 4, m21: 4,
    m22: 5, m23: 5, m26: 5, m27: 5,
  };
  const DOM_OF_EXTRA = [1, 2, 1, 1, 3, 4, 4, 2, 5, 4, 4, 5, 2, 3, 3];
  const DOM_OF_TYPE = { mail: 2, call: 2, header: 2, code: 2, log: 4, siem: 4, cve: 4, order: 4, decode: 1, ports: 3, scan: 4, risk: 5 };
  function domOf(t) {
    const id = t.id || "";
    let m;
    if ((m = /^x-(\d+)$/.exec(id))) return DOM_OF_EXTRA[+m[1]];
    if ((m = /^(m\w+)-[qo]\d+$/.exec(id))) return DOM_OF_MOD[m[1]];
    if ((m = /^e-(m\w+)-\d+$/.exec(id))) return DOM_OF_MOD[m[1]];
    if (/^cq-/.test(id)) { const q = TA.quizById(id); return q ? q.d : 0; }
    if (t.type === "match") return t.en ? 0 : 3;
    return DOM_OF_TYPE[t.type] || 0;
  }
  function recordDomain(t, ok) {
    const d = domOf(t);
    if (!d) return;
    const s = S(); if (!s.dom) s.dom = {};
    const x = s.dom[d] || [0, 0];
    x[1] += 1; if (ok) x[0] += 1;
    s.dom[d] = x;
  }
  /* Preparación: aciertos por dominio, ponderados por su peso y por cuánto has practicado (25 respuestas = cobertura completa). */
  function readiness() {
    const dom = S().dom || {};
    let total = 0;
    const rows = DOMAINS.map(([d, name, w]) => {
      const [ok, n] = dom[d] || [0, 0];
      const acc = n ? ok / n : 0, cov = Math.min(1, n / 25);
      total += w * acc * cov;
      return { d, name, w, ok, n, acc, cov };
    });
    return { pct: Math.round(total), rows };
  }

  /* ——— Misiones ——— */
  const DAILY = [
    { id: "turnos", t: "Completa 2 turnos", goal: 2, on: "shift" },
    { id: "estrellas", t: "Termina un turno con 3 estrellas", goal: 1, on: "shift", when: (e) => e.stars === 3 },
    { id: "nodmg", t: "Termina un turno sin perder salud del banco", goal: 1, on: "shift", when: (e) => e.health >= 100 },
    { id: "cama", t: "Atrapa al Camaleón 2 veces", goal: 2, on: "ticket", when: (e) => e.cama === "caught" },
    { id: "mail", t: "Resuelve bien 4 mensajes sospechosos", goal: 4, on: "ticket", when: (e) => e.type === "mail" && e.ok },
    { id: "quiz", t: "Acierta 5 preguntas del equipo", goal: 5, on: "ticket", when: (e) => e.type === "quiz" && e.ok },
    { id: "fast", t: "Gana 6 bonos de rapidez", goal: 6, on: "ticket", when: (e) => e.fast },
    { id: "english", t: "Resuelve bien 2 tickets en inglés", goal: 2, on: "ticket", when: (e) => e.en && e.ok },
    { id: "flash", t: "Haz un repaso relámpago con 8 aciertos o más", goal: 1, on: "flash", when: (e) => e.right >= 8 },
    { id: "log", t: "Encuentra 2 líneas sospechosas en logs", goal: 2, on: "ticket", needs: "log", when: (e) => e.type === "log" && e.ok },
    { id: "code", t: "Encuentra 2 líneas vulnerables en código", goal: 2, on: "ticket", needs: "code", when: (e) => e.type === "code" && e.ok },
    { id: "siem", t: "Elige bien 2 consultas del SIEM", goal: 2, on: "ticket", needs: "siem", when: (e) => e.type === "siem" && e.ok },
    { id: "cve", t: "Prioriza bien 2 vulnerabilidades", goal: 2, on: "ticket", needs: "cve", when: (e) => e.type === "cve" && e.ok },
    { id: "header", t: "Analiza bien 2 encabezados de correo", goal: 2, on: "ticket", needs: "header", when: (e) => e.type === "header" && e.ok },
    { id: "career", t: "Resuelve bien 3 casos de tu especialidad", goal: 3, on: "ticket", needs: "career", when: (e) => e.career && e.ok },
    { id: "gloss", t: "Aprende 3 palabras nuevas del diccionario", goal: 3, on: "gloss" },
  ];
  const WEEKLY = [
    { id: "w-turnos", t: "Completa 10 turnos esta semana", goal: 10, on: "shift" },
    { id: "w-estrellas", t: "Gana 15 estrellas esta semana", goal: 15, on: "shift", add: (e) => e.stars },
    { id: "w-cama", t: "Atrapa al Camaleón 6 veces esta semana", goal: 6, on: "ticket", when: (e) => e.cama === "caught" },
    { id: "w-flash", t: "Haz 5 repasos relámpago esta semana", goal: 5, on: "flash" },
  ];
  const DAILY_PAY = { money: 25, xp: 25 }, DAILY_BONUS = 50, WEEKLY_PAY = { money: 250, xp: 150 };

  /* Números pseudoaleatorios fijos por día: las misiones de hoy son las mismas aunque recargues. */
  function seeded(seedStr) {
    let h = 2166136261;
    for (const ch of seedStr) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; };
  }
  const weekNum = () => { const [y, m, d] = TA.dayKey().split("-").map(Number); return Math.floor((Date.UTC(y, m - 1, d) / 864e5 + 3) / 7); };
  function availableTypes() {
    const set = new Set();
    CITIES.filter((c) => TA.cityOpen(c.code)).forEach((c) => Object.keys(c.games).forEach((g) => set.add(g)));
    if (S().career) set.add("career");
    return set;
  }
  function ensureMissions() {
    const s = S(), day = TA.dayKey(), wk = weekNum();
    if (!s.daily || s.daily.day !== day) {
      const avail = availableTypes(), rnd = seeded(day);
      const pool = DAILY.filter((m) => !m.needs || avail.has(m.needs));
      const pick = [];
      while (pick.length < 3 && pool.length) pick.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0].id);
      s.daily = { day, items: pick.map((id) => ({ id, prog: 0, claimed: false })), bonus: false };
    }
    if (!s.weekly || s.weekly.week !== wk) {
      const m = WEEKLY[Math.floor(seeded("w" + wk)() * WEEKLY.length)];
      s.weekly = { week: wk, id: m.id, prog: 0, claimed: false };
    }
  }
  const defOf = (id) => DAILY.concat(WEEKLY).find((m) => m.id === id);

  function bumpMissions(on, e) {
    ensureMissions();
    const s = S();
    const items = s.daily.items.concat([s.weekly]);
    items.forEach((it) => {
      const m = defOf(it.id);
      if (!m || m.on !== on || it.prog >= m.goal) return;
      if (m.when && !m.when(e)) return;
      it.prog = Math.min(m.goal, it.prog + (m.add ? m.add(e) : 1));
      if (it.prog >= m.goal) toast({ kind: "mission", title: "Misión cumplida", text: m.t, sub: "Cóbrala en Hoy" });
    });
  }

  function claim(id) {
    ensureMissions();
    const s = S(), before = TA.rankInfo(s.xp);
    let pay = null;
    if (s.weekly.id === id && !s.weekly.claimed && s.weekly.prog >= defOf(id).goal) { s.weekly.claimed = true; pay = WEEKLY_PAY; inc("weeklies"); }
    const it = s.daily.items.find((x) => x.id === id);
    if (it && !it.claimed && it.prog >= defOf(id).goal) { it.claimed = true; pay = DAILY_PAY; inc("missions"); }
    if (!pay) return null;
    s.money += pay.money; s.xp += pay.xp;
    let bonus = 0;
    if (!s.daily.bonus && s.daily.items.every((x) => x.claimed)) { s.daily.bonus = true; bonus = DAILY_BONUS; s.money += bonus; }
    top("moneyBest", s.money);
    TA.save();
    check();
    const after = TA.rankInfo(s.xp);
    if (after.i > before.i) ART.promoCeremony(after);
    return { money: pay.money + bonus, xp: pay.xp, bonus };
  }

  function missions() {
    ensureMissions();
    const s = S();
    const row = (it) => { const m = defOf(it.id); return { id: it.id, text: m.t, prog: it.prog, goal: m.goal, done: it.prog >= m.goal, claimed: it.claimed }; };
    return { daily: s.daily.items.map(row), weekly: row(s.weekly), bonus: s.daily.bonus, pay: DAILY_PAY, weeklyPay: WEEKLY_PAY, bonusPay: DAILY_BONUS };
  }

  /* ——— Logros ——— */
  const G = { company: "Andino Shield", career: "Carrera", precision: "Precisión", cama: "El Camaleón", craft: "Oficio", life: "Vida", travel: "Viajero", missions: "Misiones", secret: "Secretos" };
  const REWARD = { bronce: 30, plata: 80, oro: 200 };
  const rank = () => TA.rankIndex(S().xp);
  const stamps = () => Object.keys(S().stamps).length;
  const co = (k) => (S().co ? S().co.stats[k] || 0 : 0);
  const coStage = () => (S().co && window.TYC ? TYC.stage().i : 0);
  const careerLevels = () => Object.values(S().careers || {}).map((xp) => (window.CAREER ? CAREER.levelOf(xp) : 0));
  const careerTop = () => Math.max(0, ...careerLevels());
  const careerCount = (lvl) => careerLevels().filter((l) => l >= lvl).length;
  const A = (id, g, tier, name, desc, prog, secret) => ({ id, g, tier, name, desc, prog, secret: !!secret });
  const ACH = [
    A("a-turno1", "career", "bronce", "Primer turno", "Termina tu primer turno.", () => [S().shifts, 1]),
    A("a-turno25", "career", "plata", "Veterano del SOC", "Termina 25 turnos.", () => [S().shifts, 25]),
    A("a-turno100", "career", "oro", "Cien turnos", "Termina 100 turnos.", () => [S().shifts, 100]),
    A("a-rank1", "career", "bronce", "Primer ascenso", "Llega a Analista SOC N1.", () => [rank(), 1]),
    A("a-rank3", "career", "plata", "Cazador de amenazas", "Llega al cargo de Cazador de amenazas.", () => [rank(), 3]),
    A("a-rank7", "career", "oro", "CISO", "Llega a la cima: CISO del Banco Andino.", () => [rank(), 7]),
    A("a-sello1", "career", "bronce", "Primer sello", "Gana el sello de una sede.", () => [stamps(), 1]),
    A("a-sello5", "career", "plata", "Media ruta", "Gana 5 sellos.", () => [stamps(), 5]),
    A("a-sello9", "career", "oro", "Trotamundos", "Gana los 9 sellos del pasaporte.", () => [stamps(), 9]),
    A("a-exam10", "career", "plata", "10 de 10", "Saca 10 de 10 en un examen de sede.", () => [val("examTen"), 1]),
    A("a-examfirst", "career", "bronce", "A la primera", "Aprueba un examen de sede en el primer intento.", () => [val("examFirst"), 1]),

    A("p-perfect", "precision", "bronce", "Sin errores", "Termina un turno con todas las respuestas correctas.", () => [val("perfect"), 1]),
    A("p-perfect10", "precision", "oro", "Impecable", "Termina 10 turnos sin errores.", () => [val("perfect"), 10]),
    A("p-nodmg", "precision", "bronce", "Sin rasguños", "Termina un turno con el banco al 100 %.", () => [val("noDmg"), 1]),
    A("p-mail10", "precision", "plata", "Ojo de halcón", "Acierta 10 mensajes sospechosos seguidos.", () => [val("mailBest"), 10]),
    A("p-mail25", "precision", "oro", "Filtro humano", "Acierta 25 mensajes sospechosos seguidos.", () => [val("mailBest"), 25]),
    A("p-fast50", "precision", "plata", "Reflejos", "Gana 50 bonos de rapidez.", () => [val("fast"), 50]),
    A("p-flash10", "precision", "bronce", "Relámpago", "Logra 10 aciertos en un repaso relámpago.", () => [S().flashBest, 10]),
    A("p-flash15", "precision", "plata", "Rayo", "Logra 15 aciertos en un repaso relámpago.", () => [S().flashBest, 15]),
    A("p-flash20", "precision", "oro", "Tormenta eléctrica", "Logra 20 aciertos en un repaso relámpago.", () => [S().flashBest, 20]),

    A("c-1", "cama", "bronce", "Primera captura", "Atrapa al Camaleón por primera vez.", () => [S().cama.caught, 1]),
    A("c-10", "cama", "plata", "Tras sus pasos", "Atrapa al Camaleón 10 veces.", () => [S().cama.caught, 10]),
    A("c-25", "cama", "oro", "Expediente cerrado", "Atrapa al Camaleón 25 veces.", () => [S().cama.caught, 25]),

    A("o-code", "craft", "plata", "Revisor de código", "Encuentra 10 líneas vulnerables en código.", () => [val("ok_code"), 10]),
    A("o-header", "craft", "plata", "Detective de encabezados", "Analiza bien 10 encabezados de correo.", () => [val("ok_header"), 10]),
    A("o-siem", "craft", "plata", "Consultor del SIEM", "Elige bien 10 consultas del SIEM.", () => [val("ok_siem"), 10]),
    A("o-cve", "craft", "plata", "Priorizador", "Prioriza bien 10 vulnerabilidades.", () => [val("ok_cve"), 10]),
    A("o-log", "craft", "plata", "Cazador de logs", "Encuentra 20 líneas sospechosas en logs.", () => [val("ok_log"), 20]),
    A("o-call", "craft", "bronce", "Buen oído", "Resuelve bien 15 llamadas.", () => [val("ok_call"), 15]),
    A("o-en", "craft", "plata", "Políglota", "Resuelve bien 20 tickets en inglés.", () => [val("ok_en"), 20]),

    A("v-buy", "life", "bronce", "Primera compra", "Compra tu primer objeto.", () => [Object.keys(S().owned).length, 1]),
    A("v-all", "life", "oro", "Escritorio completo", "Ten todos los objetos de la tienda.", () => [Object.keys(S().owned).length, ITEMS.length]),
    A("v-save", "life", "plata", "Ahorrador", "Junta ₳ 1.000 al mismo tiempo.", () => [val("moneyBest"), 1000]),

    A("t-offline", "travel", "plata", "Turno en pleno vuelo", "Termina un turno sin conexión a internet.", () => [val("offline"), 1]),
    A("t-early", "travel", "bronce", "Madrugador", "Termina un turno entre las 5 y las 7 de la mañana.", () => [val("early"), 1]),
    A("t-night", "travel", "bronce", "Turno de medianoche", "Termina un turno entre las 12 y las 4 de la madrugada.", () => [val("night"), 1]),
    A("t-streak3", "travel", "bronce", "Constancia", "Juega 3 días seguidos.", () => [S().streak.best, 3]),
    A("t-streak7", "travel", "plata", "Una semana seguida", "Juega 7 días seguidos.", () => [S().streak.best, 7]),
    A("t-streak30", "travel", "oro", "Hábito de hierro", "Juega 30 días seguidos.", () => [S().streak.best, 30]),

    A("m-1", "missions", "bronce", "Cumplidor", "Cobra tu primera misión diaria.", () => [val("missions"), 1]),
    A("m-20", "missions", "plata", "Profesional", "Cobra 20 misiones diarias.", () => [val("missions"), 20]),
    A("m-w", "missions", "plata", "Semana redonda", "Cobra una misión semanal.", () => [val("weeklies"), 1]),

    A("co-found", "company", "bronce", "Emprendedor", "Funda Andino Shield.", () => [S().co ? 1 : 0, 1]),
    A("co-client", "company", "bronce", "Primer cliente", "Gana tu primera licitación.", () => [co("won"), 1]),
    A("co-staff5", "company", "plata", "Nómina de cinco", "Ten 5 empleados en tu empresa.", () => [S().co ? S().co.staff.length : 0, 5]),
    A("co-pyme", "company", "plata", "Ya somos pyme", "Llega a la etapa Pyme (₳ 4.000 de ingreso mensual).", () => [coStage(), 2]),
    A("co-latam", "company", "oro", "Líder en Latinoamérica", "Llega a la última etapa de Andino Shield.", () => [coStage(), 4]),
    A("co-ethic", "company", "plata", "Con principios", "Toma la decisión correcta en 3 dilemas éticos.", () => [co("ethic"), 3]),
    A("co-ir", "company", "plata", "Respuesta de libro", "Maneja bien 10 incidentes de tu empresa.", () => [co("ok"), 10]),
    A("co-branch", "company", "oro", "Sucursal", "Abre una sucursal en otra ciudad.", () => [S().co ? Object.keys(S().co.branches).length : 0, 1]),
    A("k-pick", "career", "bronce", "Especialista", "Elige tu especialidad.", () => [S().career ? 1 : 0, 1]),
    A("k-lvl2", "career", "plata", "Te lo tomas en serio", "Llega al segundo cargo de tu especialidad.", () => [careerTop(), 1]),
    A("k-lvl4", "career", "oro", "Referente del área", "Llega al último cargo de una especialidad.", () => [careerTop(), 3]),
    A("k-multi", "career", "plata", "Polivalente", "Llega al segundo cargo en 3 especialidades distintas.", () => [careerCount(1), 3]),
    A("g-10", "craft", "bronce", "Curioso", "Consulta 10 palabras del diccionario.", () => [Object.keys(st().words || {}).length, 10]),
    A("g-50", "craft", "plata", "Diccionario andante", "Consulta 50 palabras del diccionario.", () => [Object.keys(st().words || {}).length, 50]),
    A("s-shield", "secret", "bronce", "Salvado por la llave", "Tu llave FIDO2 absorbió un error.", () => [val("shield"), 1], true),
    A("s-edge", "secret", "bronce", "Al límite", "Termina un turno con el banco al 20 %.", () => [val("lowHp"), 1], true),
    A("s-double", "secret", "plata", "Doble Camaleón", "Atrapa al Camaleón dos veces en un mismo turno.", () => [val("doubleCama"), 1], true),
    A("s-sunday", "secret", "bronce", "Turno de domingo", "Termina un turno un domingo.", () => [val("sunday"), 1], true),
  ];

  function check() {
    const s = S(); if (!s.ach) s.ach = {};
    let changed = false;
    ACH.forEach((a) => {
      if (s.ach[a.id]) return;
      const [cur, goal] = a.prog();
      if (cur >= goal) {
        s.ach[a.id] = TA.dayKey();
        s.money += REWARD[a.tier];
        changed = true;
        toast({ kind: "ach", tier: a.tier, g: a.g, title: "Logro desbloqueado", text: a.name, sub: "+" + TA.money(REWARD[a.tier]) });
      }
    });
    if (changed) { top("moneyBest", s.money); TA.save(); }
  }

  function achievements() {
    const s = S(), got = s.ach || {};
    return ACH.map((a) => {
      const [cur, goal] = a.prog();
      return Object.assign({}, a, { got: got[a.id] || null, cur: Math.min(cur, goal), goal, group: G[a.g] });
    });
  }

  /* ——— Eventos del juego ——— */
  function ticket(t, ok, fast, cama) {
    const type = t.type === "match" ? (t.en ? "english" : "ports") : t.type;
    if (ok) inc("ok_" + type);
    if (ok && t.en) inc("ok_en");
    if (fast) inc("fast");
    if (t.type === "mail") {
      if (ok) { inc("mailRun"); top("mailBest", val("mailRun")); } else st().mailRun = 0;
    }
    recordDomain(t, ok);
    bumpMissions("ticket", { type: t.type, ok, fast, cama, en: !!t.en, career: !!t.career });
    check();
  }
  function shift(e) {
    const h = new Date().getHours(), d = new Date().getDay();
    if (e.perfect) inc("perfect");
    if (e.health >= 100) inc("noDmg");
    if (e.health === 20) inc("lowHp");
    if (e.camaCaught >= 2) inc("doubleCama");
    if (e.shieldUsed) inc("shield");
    if (typeof navigator !== "undefined" && navigator.onLine === false) inc("offline");
    if (h >= 5 && h < 7) inc("early");
    if (h < 4) inc("night");
    if (d === 0) inc("sunday");
    top("moneyBest", S().money);
    bumpMissions("shift", e);
    check();
  }
  function flash(e) { bumpMissions("flash", e); check(); }
  function gloss() { bumpMissions("gloss", {}); check(); }
  function exam(e) {
    const tries = "examTries_" + e.city;
    inc(tries);
    if (e.pass && val(tries) === 1) inc("examFirst");
    if (e.right === 10) inc("examTen");
    check();
  }
  function buy() { check(); }

  /* ——— Medallas y avisos ——— */
  const TIER = { bronce: ["#B7794A", "#7A4A26"], plata: ["#B9C3CF", "#6E7B8C"], oro: ["#E3B04B", "#94681A"] };
  const GICON = {
    career: '<path d="M-6 -2h12v8h-12z M-3 -2v-2.5h6V-2"/>',
    precision: '<circle r="6.5"/><circle r="3"/><circle r=".6"/>',
    cama: '<circle cx="-2.5" r="3.2"/><circle cx="4" cy="-1" r="2.6"/><path d="M-7 5 q7 3 14 -1"/>',
    craft: '<path d="M-3 -5 l-4 5 4 5 M3 -5 l4 5 -4 5"/>',
    life: '<path d="M-5 -2h8v4a4 4 0 0 1 -4 4h0a4 4 0 0 1 -4 -4z M3 0h2a2 2 0 0 1 0 4h-2"/>',
    travel: '<path d="M-7 1 l5 -.8 2.6 -5 h1.4 l-1.3 5 4 -.3 1.3 -1.6 h1 l-.7 2.7 .7 2.7 h-1 l-1.3 -1.6 -4 -.3 1.3 5 h-1.4 l-2.6 -5 -5 -.8z"/>',
    missions: '<path d="M-6 0 l4 4 8 -8"/>',
    company: '<path d="M-6 6V-2l6 -4 6 4v8 M-2 6v-4h4v4"/>',
    secret: '<path d="M-2.5 -2.5 a2.5 2.5 0 1 1 3 2.4 v1.6 M.5 4.5v.4"/>',
  };
  function medal(a, size) {
    const on = !!a.got, [fill, dark] = on ? TIER[a.tier] : ["var(--card-2)", "var(--line)"];
    const icon = !on && a.secret ? GICON.secret : GICON[a.g];
    return `<svg class="medal ${on ? "on" : ""}" viewBox="-20 -24 40 46" width="${size || 44}" height="${(size || 44) * 1.15}" aria-hidden="true">
      <path d="M-9 -24 L-3 -8 L3 -8 L-3 -24Z" fill="${on ? "#0F7A74" : "var(--line)"}"/><path d="M9 -24 L3 -8 L-3 -8 L3 -24Z" fill="${on ? "#B83A26" : "var(--line)"}"/>
      <circle cy="6" r="15" fill="${fill}" stroke="${dark}" stroke-width="2"/>
      <circle cy="6" r="11" fill="none" stroke="${dark}" stroke-width="1" stroke-dasharray="2 2" opacity=".7"/>
      <g transform="translate(0 6)" fill="none" stroke="${on ? "#1D2633" : "var(--muted)"}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icon}</g>
    </svg>`;
  }

  const queue = [];
  let showing = false;
  function toast(t) { queue.push(t); if (!showing) nextToast(); }
  function nextToast() {
    const t = queue.shift();
    if (!t) { showing = false; return; }
    showing = true;
    let box = document.getElementById("toasts");
    if (!box) { box = document.createElement("div"); box.id = "toasts"; box.setAttribute("aria-live", "polite"); document.body.appendChild(box); }
    const el = document.createElement("div");
    el.className = "toast " + (t.kind === "ach" ? "t-ach" : "t-mission");
    const icon = t.kind === "ach" ? medal({ got: 1, tier: t.tier, g: t.g }, 34) : '<span class="t-check" aria-hidden="true">✓</span>';
    el.innerHTML = `${icon}<div><small>${TA.esc(t.title)}</small><b>${TA.esc(t.text)}</b>${t.sub ? `<span>${TA.esc(t.sub)}</span>` : ""}</div>`;
    box.appendChild(el);
    setTimeout(() => { el.classList.add("out"); setTimeout(() => { el.remove(); nextToast(); }, 300); }, 2600);
  }

  window.PROG = { ticket, shift, flash, exam, buy, gloss, check, claim, missions, ensureMissions, achievements, medal, readiness, DOMAINS, toast };
})();
