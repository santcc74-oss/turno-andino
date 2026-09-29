/* Turno Andino — Andino Shield: motor del tycoon y su pantalla.
   Cada turno terminado en el banco es un día hábil de la empresa (nextDay). Todo funciona sin internet. */
(function () {
  const { esc, pick, rand, money } = TA;
  const UNLOCK_RANK = 2, FOUND_COST = 300, LEAD_DAYS = 4, CAND_EVERY = 4, BRANCH_COST = 1000, MAX_EVENTS = 2;
  const SAL = [0, 16, 26, 40];
  const CONTRACT_DAYS = 30;
  const RISK_P = [0, 0.04, 0.07, 0.11];
  const $ = (s) => document.querySelector(s);
  const C = () => TA.S.co;
  const svc = (id) => SVC.find((x) => x.id === id);
  const tpl = (id) => CLIENT_TPL.find((x) => x.id === id);
  const careerOf = (id) => CAREERS.find((c) => c.id === id);
  const roleName = (r) => (careerOf(r) ? careerOf(r).short : r);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const unlocked = () => TA.rankIndex(TA.S.xp) >= UNLOCK_RANK;
  const founded = () => !!C();

  function news(text, tone) {
    const co = C();
    co.news.unshift({ d: co.day, text, tone: tone || "" });
    co.news = co.news.slice(0, 25);
  }

  /* ——— Fundar ——— */
  function found() {
    const S = TA.S;
    if (S.money < FOUND_COST || S.co) return false;
    S.money -= FOUND_COST;
    S.co = { day: 0, cash: FOUND_COST, rep: 10, office: 0, staff: [], tools: {}, clients: [], leads: [], cands: [], events: [],
      news: [], hist: [{ d: 0, cash: FOUND_COST, inc: 0, cost: 0 }], branches: {}, uid: 1, lastCands: -99,
      stats: { won: 0, lost: 0, ok: 0, bad: 0, ethic: 0 } };
    news("Registraste Andino Shield con ₳ " + FOUND_COST + " de capital. ¡Suerte, fundador!", "good");
    newLead(true); newLead(true);
    refreshCands();
    TA.save();
    if (window.PROG) PROG.check();
    return true;
  }

  /* ——— Capacidad y calidad del servicio ——— */
  const founderRole = () => TA.S.career || "soc";
  function supply() {
    const co = C(), s = {};
    s[founderRole()] = (s[founderRole()] || 0) + 2;
    co.staff.forEach((p) => {
      let cap = 2 + p.lvl + (co.tools.soar && p.role === "soc" ? 1 : 0) - (p.morale < 40 ? 1 : 0);
      s[p.role] = (s[p.role] || 0) + Math.max(1, cap);
    });
    return s;
  }
  function demand() {
    const d = {};
    C().clients.forEach((cl) => cl.services.forEach((id) => { const v = svc(id); d[v.role] = (d[v.role] || 0) + v.load; }));
    return d;
  }
  const hasSenior = (role) => C().staff.some((p) => p.role === role && p.lvl >= 2) || (founderRole() === role && TA.S.careers && CAREER.levelOf(TA.S.careers[role] || 0) >= 1);
  function quality(cl, sup, dem) {
    let q = 1;
    cl.services.forEach((id) => {
      const v = svc(id);
      let f = dem[v.role] ? Math.min(1, (sup[v.role] || 0) / dem[v.role]) : 1;
      if (v.tool && !C().tools[v.tool]) f *= 0.5;
      if (v.senior && !hasSenior(v.role)) f *= 0.6;
      q = Math.min(q, f);
    });
    return q;
  }
  function selfSec() {
    const co = C();
    return clamp(20 + (co.tools.mfa ? 35 : 0) + (co.tools.backup ? 25 : 0) + (co.office >= 2 ? 10 : 0), 0, 100);
  }
  const dailyFee = () => C().clients.reduce((s, c) => s + c.fee, 0);
  const mrr = () => dailyFee() * 20;
  function stage() {
    let i = 0;
    CO_STAGES.forEach((s, k) => { if (mrr() >= s[0]) i = k; });
    return { i, name: CO_STAGES[i][1], next: CO_STAGES[i + 1] || null };
  }
  function costs() {
    const co = C();
    const staff = co.staff.reduce((s, p) => s + p.salary, 0);
    const tools = TOOLS.filter((t) => co.tools[t.id]).reduce((s, t) => s + t.day, 0);
    const rent = OFFICES[co.office].rent + Object.keys(co.branches).length * 5;
    return { staff, tools, rent, total: staff + tools + rent };
  }

  /* ——— Mercado ——— */
  function newLead(onlyEasy) {
    const co = C();
    const taken = new Set(co.clients.map((c) => c.tpl).concat(co.leads.map((l) => l.tpl)));
    const pool = CLIENT_TPL.filter((t) => !taken.has(t.id) && (onlyEasy ? t.minRep === 0 : t.minRep <= co.rep));
    if (!pool.length || co.leads.length >= 3) return;
    co.leads.push({ tpl: pick(pool).id, until: co.day + LEAD_DAYS });
  }
  function refreshCands() {
    const co = C();
    const roles = CAREERS.map((c) => c.id);
    co.cands = [0, 1, 2].map(() => {
      const r = Math.random(), lvl = r < 0.6 - co.rep / 400 ? 1 : r < 0.92 ? 2 : 3;
      return { name: pick(CO_NAMES.first) + " " + pick(CO_NAMES.last), role: pick(roles), lvl, salary: SAL[lvl] };
    });
    co.lastCands = co.day;
  }

  /* ——— Un día hábil ——— */
  function worst(ev) {
    return ev.opts.slice().sort((a, b) => ((a.eff.sat || 0) + (a.eff.rep || 0) * 3) - ((b.eff.sat || 0) + (b.eff.rep || 0) * 3))[0];
  }
  function nextDay() {
    const co = C();
    if (!co) return null;
    co.day += 1;
    const out = { day: co.day, inc: 0, fines: 0, cost: 0, news: [], events: 0 };
    const say = (t, tone) => { news(t, tone); out.news.push(t); };

    /* Incidentes que quedaron sin respuesta. */
    co.events.forEach((ev) => {
      const def = CO_EVENTS.find((e) => e.id === ev.id);
      applyEffects(ev, worst(def).eff);
      co.stats.bad += 1;
      say("No respondiste a tiempo: «" + def.title + "». Se tomó la peor decisión por omisión.", "bad");
    });
    co.events = [];

    /* Servicio, cobros y satisfacción. */
    const sup = supply(), dem = demand();
    co.clients.forEach((cl) => {
      const q = quality(cl, sup, dem);
      cl.q = q;
      let fee = cl.fee;
      if (q < 0.7) { const f = Math.round(fee * 0.2); out.fines += f; fee -= f; cl.sat -= 8; }
      else if (q >= 1) cl.sat += 3;
      cl.sat = clamp(cl.sat, 0, 100);
      out.inc += fee;
    });
    const lost = co.clients.filter((cl) => cl.sat < 20);
    lost.forEach((cl) => say(tpl(cl.tpl).name + " canceló el contrato: el servicio no estuvo a la altura.", "bad"));
    co.clients = co.clients.filter((cl) => cl.sat >= 20);
    if (out.fines) say("Pagaste " + money(out.fines) + " en multas por incumplir el SLA. Te falta personal o herramientas.", "bad");

    /* Contratos que vencen: se renuevan si el cliente está contento. */
    co.clients = co.clients.filter((cl) => {
      if (!cl.until || cl.until > co.day) return true;
      if (cl.sat >= 60) { cl.until = co.day + CONTRACT_DAYS; co.rep = clamp(co.rep + 1, 0, 100); say(tpl(cl.tpl).name + " renovó su contrato por " + CONTRACT_DAYS + " días más.", "good"); return true; }
      say(tpl(cl.tpl).name + " no renovó: su satisfacción quedó en " + Math.round(cl.sat) + " %.", "bad");
      return false;
    });

    /* Costos. */
    const k = costs();
    out.cost = k.total;
    co.cash += out.inc - out.cost;

    /* Equipo: cansancio, crecimiento y renuncias. */
    co.staff.forEach((p) => {
      const over = (dem[p.role] || 0) > (sup[p.role] || 0);
      p.morale = clamp(p.morale + (over ? -6 : 3) + (co.cash < 0 ? -5 : 0), 0, 100);
      p.days = (p.days || 0) + 1;
      if (p.lvl < 3 && p.days % 20 === 0) { p.lvl += 1; p.salary = SAL[p.lvl]; say(p.name + " subió a nivel " + p.lvl + " y ahora gana " + money(p.salary) + " por día.", "good"); }
    });
    co.staff.filter((p) => p.morale < 15).forEach((p) => say(p.name + " renunció por exceso de trabajo.", "bad"));
    co.staff = co.staff.filter((p) => p.morale >= 15);

    /* Reputación según la satisfacción promedio. */
    if (co.clients.length) {
      const avg = co.clients.reduce((s, c) => s + c.sat, 0) / co.clients.length;
      co.rep = clamp(co.rep + clamp((avg - 60) / 40, -1, 0.8), 0, 100);
    }

    /* Nuevas oportunidades. */
    co.leads = co.leads.filter((l) => {
      if (l.until >= co.day) return true;
      say("Se venció la licitación de " + tpl(l.tpl).name + ".", "");
      return false;
    });
    if (Math.random() < Math.min(0.6, 0.2 + co.rep / 250 + Object.keys(co.branches).length * 0.08)) newLead(false);
    if (co.day - co.lastCands >= CAND_EVERY) refreshCands();

    /* Incidentes nuevos. */
    const addEv = (def, cl) => { if (co.events.length < MAX_EVENTS) { co.events.push({ id: def.id, client: cl ? cl.uid : null }); out.events += 1; } };
    co.clients.forEach((cl) => {
      const t = tpl(cl.tpl);
      const p = RISK_P[t.risk] * (co.tools.edr && cl.services.includes("mdr") ? 0.7 : 1);
      if (Math.random() < p) {
        const opts = CO_EVENTS.filter((e) => e.kind === "client" && (!e.need || cl.services.includes(e.need)) && (!e.minRisk || t.risk >= e.minRisk));
        if (opts.length) addEv(pick(opts), cl);
      }
    });
    if (co.clients.length >= 2 && Math.random() < 0.05) addEv(pick(CO_EVENTS.filter((e) => e.kind === "ethics")));
    if (co.staff.length && Math.random() < ((100 - selfSec()) / 100) * 0.04) addEv(CO_EVENTS.find((e) => e.kind === "own"));
    if (out.events) say(out.events === 1 ? "Hay un incidente esperando tu decisión." : "Hay " + out.events + " incidentes esperando tu decisión.", "bad");

    co.hist.push({ d: co.day, cash: Math.round(co.cash), inc: out.inc, cost: out.cost });
    co.hist = co.hist.slice(-30);
    TA.save();
    if (window.PROG) PROG.check();
    out.cash = co.cash;
    return out;
  }

  function applyEffects(ev, eff) {
    const co = C();
    const cl = ev.client != null ? co.clients.find((c) => c.uid === ev.client) : null;
    if (eff.sat && cl) cl.sat = clamp(cl.sat + eff.sat, 0, 100);
    if (eff.rep) co.rep = clamp(co.rep + eff.rep, 0, 100);
    if (eff.cash) co.cash += eff.cash;
    if (eff.churn && co.clients.length) {
      const gone = co.clients.sort((a, b) => a.sat - b.sat).shift();
      news(tpl(gone.tpl).name + " canceló el contrato después de enterarse del incidente.", "bad");
    }
  }

  /* ——— Acciones del jugador ——— */
  function decide(idx, optIdx) {
    const co = C(), ev = co.events[idx];
    if (!ev) return null;
    const def = CO_EVENTS.find((e) => e.id === ev.id), o = def.opts[optIdx];
    applyEffects(ev, o.eff);
    co.events.splice(idx, 1);
    if (o.ok) { co.stats.ok += 1; if (def.kind === "ethics") co.stats.ethic += 1; } else co.stats.bad += 1;
    news((o.ok ? "Bien manejado: " : "Mal manejado: ") + def.title + ".", o.ok ? "good" : "bad");
    TA.save();
    if (window.PROG) PROG.check();
    return { def, o };
  }

  function evalBid(leadIdx, chosen) {
    const co = C(), lead = co.leads[leadIdx], t = tpl(lead.tpl);
    const needs = t.needs.map((n) => n[0]);
    const matched = chosen.filter((id) => needs.includes(id));
    const wrong = chosen.filter((id) => !needs.includes(id));
    const missing = needs.filter((id) => !chosen.includes(id));
    const win = matched.length >= Math.ceil(needs.length * 0.6) && wrong.length <= 1;
    co.leads.splice(leadIdx, 1);
    let client = null;
    if (win) {
      const fee = Math.round(matched.reduce((s, id) => s + svc(id).fee, 0) * t.budget);
      client = { uid: co.uid++, tpl: t.id, services: matched, fee, sat: wrong.length ? 62 : 72, since: co.day, until: co.day + CONTRACT_DAYS, q: 1 };
      co.clients.push(client);
      co.stats.won += 1;
      news("¡Ganaste la licitación de " + t.name + "! Cobras " + money(fee) + " por día.", "good");
    } else {
      co.stats.lost += 1;
      news("Perdiste la licitación de " + t.name + ".", "bad");
    }
    TA.save();
    if (window.PROG) PROG.check();
    return { t, matched, wrong, missing, win, client };
  }

  function hire(i) {
    const co = C(), c = co.cands[i];
    if (!c || co.staff.length >= OFFICES[co.office].staff) return "Tu oficina está llena. Múdate a una más grande en Inversión.";
    if (co.cash < c.salary * 5) return "Necesitas al menos " + money(c.salary * 5) + " en caja para contratar (una semana de salario).";
    co.staff.push({ uid: co.uid++, name: c.name, role: c.role, lvl: c.lvl, salary: c.salary, morale: 80, days: 0 });
    co.cands.splice(i, 1);
    news("Contrataste a " + c.name + " (" + roleName(c.role) + ", nivel " + c.lvl + ").", "good");
    TA.save();
    if (window.PROG) PROG.check();
    return null;
  }
  function fire(uid) {
    const co = C(), p = co.staff.find((x) => x.uid === uid);
    if (!p) return;
    co.staff = co.staff.filter((x) => x.uid !== uid);
    co.staff.forEach((x) => { x.morale = clamp(x.morale - 5, 0, 100); });
    news(p.name + " dejó la empresa. El equipo quedó un poco desanimado.", "");
    TA.save();
  }
  function buyTool(id) {
    const co = C(), t = TOOLS.find((x) => x.id === id);
    if (co.tools[id]) return null;
    if (co.cash < t.setup) return "Te faltan " + money(t.setup - co.cash) + " en caja.";
    co.cash -= t.setup; co.tools[id] = co.day;
    news("Compraste " + t.name + ".", "good");
    TA.save();
    return null;
  }
  function upgradeOffice() {
    const co = C(), next = OFFICES[co.office + 1];
    if (!next) return null;
    if (co.cash < next.cost) return "Te faltan " + money(next.cost - co.cash) + " en caja.";
    co.cash -= next.cost; co.office += 1;
    if (next.rep) co.rep = clamp(co.rep + next.rep, 0, 100);
    news("Te mudaste a: " + next.name + ".", "good");
    TA.save();
    if (window.PROG) PROG.check();
    return null;
  }
  function openBranch(code) {
    const co = C();
    if (co.office < 2) return "Necesitas una oficina propia antes de abrir sucursales.";
    if (co.cash < BRANCH_COST) return "Te faltan " + money(BRANCH_COST - co.cash) + " en caja.";
    co.cash -= BRANCH_COST; co.branches[code] = co.day; co.rep = clamp(co.rep + 6, 0, 100);
    news("Abriste sucursal en " + TA.cityByCode(code).city + ".", "good");
    TA.save();
    if (window.PROG) PROG.check();
    return null;
  }
  function invest(amount) {
    const S = TA.S, a = Math.min(amount, S.money);
    if (a <= 0) return "No tienes ahorros para invertir.";
    S.money -= a; C().cash += a;
    news("Invertiste " + money(a) + " de tus ahorros.", "");
    TA.save();
    return null;
  }
  function withdraw(amount) {
    const co = C(), a = Math.min(amount, Math.floor(co.cash));
    if (a <= 0) return "La caja de la empresa está vacía.";
    co.cash -= a; TA.S.money += a;
    news("Te pagaste " + money(a) + " en dividendos.", "");
    TA.save();
    return null;
  }

  /* ——— Dibujo de la oficina (crece con el equipo) ——— */
  function officeSvg() {
    const co = C(), lvl = co.office, n = Math.min(co.staff.length + 1, 12);
    let s = `<svg class="office" viewBox="0 0 320 124" role="img" aria-label="${esc(OFFICES[lvl].name)} con ${co.staff.length + 1} personas">
      <rect width="320" height="124" class="of-wall"/><rect y="92" width="320" height="32" class="of-floor"/>`;
    if (lvl === 0) s += `<g class="of-line"><rect x="236" y="20" width="72" height="72"/>${[30, 42, 54, 66, 78].map((y) => `<path d="M236 ${y}h72"/>`).join("")}</g>`;
    if (lvl >= 1) s += `<g class="of-line"><rect x="14" y="16" width="44" height="30" rx="2"/><path d="M36 16v30M14 31h44"/></g>`;
    if (lvl >= 2) s += `<text x="160" y="30" text-anchor="middle" class="of-logo">ANDINO SHIELD</text>`;
    if (lvl >= 3) s += `<g>${[0, 1, 2, 3].map((i) => `<rect x="${92 + i * 36}" y="38" width="32" height="20" rx="2" class="of-screen ${i % 2 ? "b" : ""}"/>`).join("")}</g>`;
    if (lvl >= 1) s += `<g class="of-plant"><rect x="292" y="80" width="12" height="12" rx="2"/><circle cx="298" cy="74" r="8"/></g>`;
    const cols = 6;
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / cols), col = i % cols;
      const x = 28 + col * 44 + (row ? 20 : 0), y = 78 + row * 22 - (lvl >= 3 ? 0 : 0);
      s += `<g transform="translate(${x} ${Math.min(y, 100)})"><circle cx="8" cy="-4" r="4.5" class="of-head ${i === 0 ? "me" : ""}"/><rect x="0" y="6" width="26" height="4" rx="1" class="of-desk"/><rect x="12" y="-6" width="13" height="10" rx="1.5" class="of-screen"/></g>`;
    }
    return s + `</svg>`;
  }

  function spark() {
    const h = C().hist;
    if (h.length < 2) return `<p class="small">La gráfica aparece desde el segundo día.</p>`;
    const vals = h.map((x) => x.cash), lo = Math.min(0, ...vals), hi = Math.max(...vals, 1);
    const W = 300, H = 70, px = (i) => 10 + (i / (h.length - 1)) * (W - 20), py = (v) => 8 + (1 - (v - lo) / (hi - lo || 1)) * (H - 16);
    const pts = vals.map((v, i) => px(i).toFixed(1) + "," + py(v).toFixed(1)).join(" ");
    const zero = py(0).toFixed(1);
    return `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Caja de los últimos ${h.length} días">
      <path d="M10 ${zero}H${W - 10}" class="sp-zero"/>
      <polygon points="10,${zero} ${pts} ${W - 10},${zero}" class="sp-area"/>
      <polyline points="${pts}" class="sp-line"/>
      <circle cx="${px(h.length - 1).toFixed(1)}" cy="${py(vals[vals.length - 1]).toFixed(1)}" r="3.5" class="sp-dot"/>
      <text x="10" y="${H - 1}" class="sp-lab">Día ${h[0].d}</text><text x="${W - 10}" y="${H - 1}" text-anchor="end" class="sp-lab">Día ${h[h.length - 1].d}</text>
    </svg>`;
  }

  /* ——— Pantalla ——— */
  let tab = "resumen";
  const TABS = [["resumen", "Resumen"], ["clientes", "Clientes"], ["equipo", "Equipo"], ["mercado", "Mercado"], ["inversion", "Inversión"]];

  function view() {
    const S = TA.S;
    if (!unlocked()) return `
      <section class="head"><p class="eyebrow">Tu propia empresa</p><h1>Andino Shield</h1>
      <p>Una empresa que presta servicios de ciberseguridad a otras empresas: SOC, pentest, cumplimiento, nube. La fundas al llegar a <b>Analista SOC N2</b>.</p></section>
      <div class="co-lock">${ART.portrait("marta", "happy")}<p>«Primero aprende el oficio aquí en el banco. Cuando seas Analista N2 hablamos de tu empresa.»<small>Marta Quintero</small></p></div>
      <ul class="car-preview">${["Ganas licitaciones eligiendo los servicios que cada cliente necesita.", "Contratas personas de las 7 carreras y cuidas que no se agoten.", "Compras herramientas (SIEM, EDR, SOAR) y creces del garaje a un SOC propio.", "Cada turno en el banco es un día hábil de tu empresa: funciona sin internet."].map((t) => `<li style="--h:38"><span class="car-dot" aria-hidden="true"></span><div><small>${esc(t)}</small></div></li>`).join("")}</ul>`;
    if (!founded()) return `
      <section class="head"><p class="eyebrow">Tu propia empresa</p><h1>Funda Andino Shield</h1>
      <p>Una empresa de servicios de ciberseguridad: le vendes a otras empresas lo que aprendiste en el banco.</p></section>
      <div class="co-lock">${ART.portrait("marta", "happy")}<p>«Puedes seguir en el banco y montar tu empresa en paralelo. Cada turno que trabajes aquí será un día hábil allá.»<small>Marta Quintero</small></p></div>
      <section class="block"><h2>Cómo funciona</h2><ol class="steps">
        <li><b>Licitaciones:</b> el cliente cuenta su problema y tú eliges qué servicios proponerle.</li>
        <li><b>Equipo:</b> cada servicio necesita personas de una carrera. Si te falta gente, pagas multas y el cliente se va.</li>
        <li><b>Incidentes:</b> a tus clientes los atacan. Decide bien y crece tu reputación.</li>
        <li><b>Dinero:</b> la caja de la empresa es aparte de tus ahorros. Puedes invertir o pagarte dividendos.</li>
      </ol></section>
      <button class="btn primary wide big" id="co-found" ${S.money < FOUND_COST ? "disabled" : ""}>Fundar con ${money(FOUND_COST)} de capital</button>
      ${S.money < FOUND_COST ? `<p class="small center">Tienes ${money(S.money)}. Te faltan ${money(FOUND_COST - S.money)}.</p>` : ""}`;

    const co = C(), st = stage(), k = costs();
    const evs = co.events.map((ev, i) => { const d = CO_EVENTS.find((e) => e.id === ev.id), cl = ev.client != null ? co.clients.find((c) => c.uid === ev.client) : null;
      return `<button class="co-alert" data-ev="${i}"><span class="co-bang" aria-hidden="true">!</span><span><b>${esc(d.title)}</b><small>${esc(cl ? tpl(cl.tpl).name : d.kind === "own" ? "Tu empresa" : "Decisión de la dirección")} · decide antes de tu próximo turno</small></span></button>`; }).join("");
    return `
      <section class="co-head">
        ${officeSvg()}
        <div class="co-id"><div><p class="eyebrow">Andino Shield · día ${co.day}</p><h1>${esc(st.name)}</h1></div><span class="st open">${esc(OFFICES[co.office].name)}</span></div>
        <dl class="tally">
          <div><dt>Caja</dt><dd class="${co.cash < 0 ? "neg" : ""}">${money(co.cash)}</dd></div>
          <div><dt>Ingreso / mes</dt><dd>${money(mrr())}</dd></div>
          <div><dt>Gasto / día</dt><dd>${money(k.total)}</dd></div>
        </dl>
        <div class="co-bars">
          <div><span class="small">Reputación ${Math.round(co.rep)}</span><div class="bar sm"><i style="width:${co.rep}%"></i></div></div>
          <div><span class="small">Seguridad interna ${selfSec()}</span><div class="bar sm ${selfSec() < 50 ? "weak" : ""}"><i style="width:${selfSec()}%"></i></div></div>
        </div>
        ${st.next ? `<p class="small">Siguiente etapa: <b>${esc(st.next[1])}</b> con ${money(st.next[0])} de ingreso mensual.</p>` : ""}
      </section>
      ${evs ? `<section class="co-alerts"><p class="eyebrow">Requiere tu decisión</p>${evs}</section>` : ""}
      <div class="seg seg5" role="tablist">${TABS.map(([id, l]) => `<button role="tab" data-cotab="${id}" aria-selected="${tab === id}">${l}</button>`).join("")}</div>
      <div class="seg-body" id="co-body">${TAB_VIEW[tab]()}</div>
      <p class="small center" id="co-msg" role="status"></p>`;
  }

  const TAB_VIEW = {
    resumen() {
      const co = C(), last = co.hist[co.hist.length - 1];
      return `<section class="block"><h2>Caja de la empresa</h2>${spark()}
        ${co.day ? `<p class="small">Ayer: ingresos ${money(last.inc)} · gastos ${money(last.cost)} · neto <b>${money(last.inc - last.cost)}</b></p>` : `<p class="small">Tu primer día hábil llega cuando termines tu próximo turno en el banco.</p>`}</section>
        <section class="block"><h2>Noticias</h2><ul class="co-news">${co.news.slice(0, 10).map((n) => `<li class="${n.tone}"><span class="mono">D${n.d}</span>${esc(n.text)}</li>`).join("")}</ul></section>`;
    },
    clientes() {
      const co = C();
      if (!co.clients.length) return `<p class="small">Todavía no tienes clientes. Ve a <b>Mercado</b> y gana tu primera licitación.</p>`;
      return `<ul class="co-list">${co.clients.map((cl) => { const t = tpl(cl.tpl), q = cl.q == null ? 1 : cl.q;
        return `<li class="co-card"><div class="cc-top"><div class="cc-name"><b>${esc(t.name)}</b><small>${esc(t.sector)} · contrato hasta el día ${cl.until}</small></div><span class="mono">${money(cl.fee)}/día</span></div>
          <div class="chips">${cl.services.map((id) => `<span class="chip">${esc(svc(id).name)}</span>`).join("")}</div>
          <div><span class="small">Satisfacción ${Math.round(cl.sat)} %${q < 0.7 ? " · servicio insuficiente: pagas multas" : q < 1 ? " · servicio justo" : ""}</span><div class="bar sm ${cl.sat < 40 ? "weak" : ""}"><i style="width:${cl.sat}%"></i></div></div></li>`; }).join("")}</ul>`;
    },
    equipo() {
      const co = C(), sup = supply(), dem = demand();
      const roles = [...new Set(Object.keys(sup).concat(Object.keys(dem)))];
      const cap = roles.map((r) => { const s = sup[r] || 0, d = dem[r] || 0;
        return `<tr><td>${esc(roleName(r))}</td><td class="mono">${s}</td><td class="mono">${d}</td><td>${d > s ? '<span class="st exam">Falta gente</span>' : '<span class="st done">Cubierto</span>'}</td></tr>`; }).join("");
      const founderLvl = TA.S.career ? CAREER.info(TA.S.career).title : "Analista SOC";
      return `<section class="block"><h2>Capacidad por carrera</h2>
        <div class="tbl"><table><thead><tr><th>Carrera</th><th>Tienes</th><th>Necesitas</th><th></th></tr></thead><tbody>${cap}</tbody></table></div>
        <p class="small">Cada persona aporta capacidad en su carrera (nivel 1: 3 puntos, nivel 3: 5). Si falta, el servicio baja de calidad y pagas multas por el SLA.</p></section>
        <section class="block"><h2>Tu equipo · ${co.staff.length}/${OFFICES[co.office].staff}</h2><ul class="co-list">
          <li class="co-person"><span class="car-dot" style="--h:${(careerOf(founderRole()) || { hue: 38 }).hue}"></span><div><b>Tú (fundador)</b><small>${esc(roleName(founderRole()))} · ${esc(founderLvl)} · aportas 2 puntos</small></div></li>
          ${co.staff.map((p) => `<li class="co-person"><span class="car-dot" style="--h:${careerOf(p.role).hue}"></span><div><b>${esc(p.name)}</b><small>${esc(roleName(p.role))} · nivel ${p.lvl} · ${money(p.salary)}/día</small>
            <div class="bar sm ${p.morale < 40 ? "weak" : ""}"><i style="width:${p.morale}%"></i></div><small>Ánimo ${Math.round(p.morale)} %</small></div>
            <button class="btn ghost co-fire" data-fire="${p.uid}">Despedir</button></li>`).join("")}
        </ul></section>`;
    },
    mercado() {
      const co = C();
      const leads = co.leads.map((l, i) => { const t = tpl(l.tpl);
        return `<li class="co-card"><div class="cc-top"><div class="cc-name"><b>${esc(t.name)}</b><small>${esc(t.sector)} · vence en ${Math.max(0, l.until - co.day)} ${l.until - co.day === 1 ? "día" : "días"}</small></div></div>
          <p class="small">${esc(t.brief)}</p><button class="btn primary wide" data-bid="${i}">Preparar propuesta</button></li>`; }).join("");
      const cands = co.cands.map((c, i) => `<li class="co-person"><span class="car-dot" style="--h:${careerOf(c.role).hue}"></span><div><b>${esc(c.name)}</b><small>${esc(careerOf(c.role).name)} · nivel ${c.lvl} · ${money(c.salary)}/día</small></div>
        <button class="btn" data-hire="${i}">Contratar</button></li>`).join("");
      return `<section class="block"><h2>Licitaciones abiertas</h2>${leads ? `<ul class="co-list">${leads}</ul>` : `<p class="small">No hay licitaciones ahora. Llegan más cada día, y más seguido si tu reputación sube.</p>`}</section>
        <section class="block"><h2>Candidatos</h2><p class="small">Se renuevan cada ${CAND_EVERY} días. Para contratar necesitas una semana de salario en caja.</p>${cands ? `<ul class="co-list">${cands}</ul>` : `<p class="small">Sin candidatos por ahora.</p>`}</section>`;
    },
    inversion() {
      const co = C(), next = OFFICES[co.office + 1];
      const tools = TOOLS.map((t) => `<li class="item ${co.tools[t.id] ? "own" : ""}"><span class="car-dot" style="--h:${co.tools[t.id] ? 175 : 210}"></span>
        <div class="item-t"><b>${esc(t.name)}</b><small>${esc(t.what)} Cuesta ${money(t.day)} por día.</small></div>
        ${co.tools[t.id] ? `<span class="st done">Activa</span>` : `<button class="btn buy" data-tool="${t.id}">${money(t.setup)}</button>`}</li>`).join("");
      const stamped = CITIES.filter((c) => TA.S.stamps[c.code]);
      const branches = stamped.map((c) => `<li class="item"><span class="iata sm">${c.code}</span><div class="item-t"><b>${esc(c.city)}</b><small>+6 de reputación y más licitaciones. ${money(5)} por día.</small></div>
        ${co.branches[c.code] ? `<span class="st done">Abierta</span>` : `<button class="btn buy" data-branch="${c.code}">${money(BRANCH_COST)}</button>`}</li>`).join("");
      return `<section class="block"><h2>Herramientas</h2><ul class="shop">${tools}</ul></section>
        <section class="block"><h2>Oficina</h2><p class="small">Ahora: <b>${esc(OFFICES[co.office].name)}</b> (${OFFICES[co.office].staff} puestos, ${money(OFFICES[co.office].rent)}/día).</p>
          ${next ? `<button class="btn wide" id="co-office">Mudarte a ${esc(next.name)} · ${money(next.cost)}</button><p class="small">${next.staff} puestos · arriendo ${money(next.rent)}/día${next.rep ? " · +" + next.rep + " de reputación" : ""}</p>` : `<p class="small">Tienes la mejor sede posible.</p>`}</section>
        <section class="block"><h2>Sucursales</h2><p class="small">Puedes abrir sucursal en cada ciudad donde tengas el sello del pasaporte. Requiere oficina propia.</p>${branches ? `<ul class="shop">${branches}</ul>` : `<p class="small">Aún no tienes sellos del pasaporte.</p>`}</section>
        <section class="block"><h2>Capital</h2><p class="small">Tus ahorros: ${money(TA.S.money)} · caja de la empresa: ${money(co.cash)}</p>
          <div class="duo"><button class="btn" data-invest="100">Invertir ${money(100)}</button><button class="btn" data-invest="500">Invertir ${money(500)}</button></div>
          <div class="duo"><button class="btn" data-withdraw="100">Pagarte ${money(100)}</button><button class="btn" data-withdraw="500">Pagarte ${money(500)}</button></div></section>`;
    },
  };

  /* ——— Ventanas: licitación e incidente ——— */
  function modal(html) {
    const el = document.createElement("div");
    el.className = "picker co-modal";
    el.setAttribute("role", "dialog");
    el.innerHTML = `<div class="picker-in">${html}</div>`;
    document.body.appendChild(el);
    document.body.classList.add("playing");
    return el;
  }
  const closeModal = (el, refresh) => { el.remove(); if (document.getElementById("play").hidden) document.body.classList.remove("playing"); if (refresh) refresh(); };

  function bidModal(i, refresh) {
    const co = C(), t = tpl(co.leads[i].tpl);
    const chosen = new Set();
    const el = modal(`
      <header class="picker-head">${ART.portrait("stranger", "neutral")}<div><p class="eyebrow">Licitación · ${esc(t.sector)}</p><h2>${esc(t.name)}</h2></div></header>
      <blockquote class="say">${GLOSS.link(esc(t.brief))}</blockquote>
      <p class="small">Elige hasta 3 servicios que resuelvan lo que te contaron. Proponer cosas que no necesita le resta confianza a tu oferta.</p>
      <ul class="svc-list">${SVC.map((v) => `<li><button class="svc" data-svc="${v.id}" aria-pressed="false">
        <span class="svc-top"><b>${esc(v.name)}</b><span class="mono">${money(Math.round(v.fee * t.budget))}/día</span></span>
        <small>${esc(v.what)}</small><small class="svc-role">Lo presta: ${esc(roleName(v.role))}${v.tool ? " · requiere " + esc(TOOLS.find((x) => x.id === v.tool).name) : ""}</small></button></li>`).join("")}</ul>
      <button class="btn primary wide big" id="bid-send" disabled>Enviar propuesta</button>
      <button class="btn ghost wide" data-close>Volver</button>`);
    const send = el.querySelector("#bid-send");
    el.querySelectorAll(".svc").forEach((b) => b.onclick = () => {
      const id = b.dataset.svc;
      if (chosen.has(id)) chosen.delete(id); else if (chosen.size < 3) chosen.add(id);
      el.querySelectorAll(".svc").forEach((x) => x.setAttribute("aria-pressed", chosen.has(x.dataset.svc)));
      send.disabled = !chosen.size;
      send.textContent = chosen.size ? "Enviar propuesta (" + chosen.size + " de 3)" : "Enviar propuesta";
    });
    el.querySelector("[data-close]").onclick = () => closeModal(el, refresh);
    send.onclick = () => {
      const r = evalBid(i, [...chosen]);
      const needWhy = (id) => (t.needs.find((n) => n[0] === id) || [])[1];
      el.querySelector(".picker-in").innerHTML = `
        <header class="picker-head">${ART.portrait("stranger", r.win ? "happy" : "worried")}<div><p class="eyebrow">${esc(t.name)}</p><h2>${r.win ? "¡Ganaste el contrato!" : "Perdiste la licitación"}</h2></div></header>
        ${r.win ? `<p>Cobras <b>${money(r.client.fee)}</b> por día hábil durante ${CONTRACT_DAYS} días; si queda contento, renueva. Revisa en <b>Equipo</b> que tengas gente para prestarlo.</p>` : `<p>El cliente eligió a otra empresa. Así se veía la propuesta ideal:</p>`}
        <ul class="bid-res">
          ${r.matched.map((id) => `<li class="ok"><b>✓ ${esc(svc(id).name)}</b><small>${esc(needWhy(id))}</small></li>`).join("")}
          ${r.missing.map((id) => `<li class="miss"><b>Faltó: ${esc(svc(id).name)}</b><small>${esc(needWhy(id))}</small></li>`).join("")}
          ${r.wrong.map((id) => `<li class="bad"><b>✗ ${esc(svc(id).name)}</b><small>No era lo que este cliente necesitaba ahora: ${esc(svc(id).what.charAt(0).toLowerCase() + svc(id).what.slice(1))}</small></li>`).join("")}
        </ul>
        ${GLOSS.chips(t.brief + " " + r.matched.concat(r.missing).map((id) => svc(id).what).join(" "))}
        <button class="btn primary wide big" data-close>Listo</button>`;
      if (r.win) ART.confetti();
      el.querySelector("[data-close]").onclick = () => closeModal(el, refresh);
    };
  }

  function eventModal(i, refresh) {
    const co = C(), ev = co.events[i], d = CO_EVENTS.find((e) => e.id === ev.id);
    const cl = ev.client != null ? co.clients.find((c) => c.uid === ev.client) : null;
    const text = d.text.replace("{c}", cl ? tpl(cl.tpl).name : "Un cliente");
    const opts = TA.shuffle(d.opts.map((o, k) => ({ o, k })));
    const el = modal(`
      <header class="picker-head">${ART.portrait(d.kind === "ethics" ? "cama" : "marta", d.kind === "ethics" ? "smug" : "worried")}<div><p class="eyebrow">${d.kind === "ethics" ? "Dilema ético" : d.kind === "own" ? "Incidente en tu empresa" : "Incidente de un cliente"}</p><h2>${esc(d.title)}</h2></div></header>
      <blockquote class="say">${GLOSS.link(esc(text))}</blockquote>
      <p class="t-sub">¿Qué haces?</p>
      <div class="opts">${opts.map(({ o, k }) => `<button class="opt" data-k="${k}">${esc(o.t)}</button>`).join("")}</div>`);
    el.querySelectorAll(".opt").forEach((b) => b.onclick = () => {
      const r = decide(i, +b.dataset.k);
      el.querySelectorAll(".opt").forEach((x) => { x.disabled = true; if (d.opts[+x.dataset.k].ok) x.classList.add("right"); });
      if (!r.o.ok) b.classList.add("wrong");
      const e = r.o.eff, parts = [];
      if (e.sat) parts.push((e.sat > 0 ? "+" : "") + e.sat + " satisfacción del cliente");
      if (e.rep) parts.push((e.rep > 0 ? "+" : "") + e.rep + " reputación");
      if (e.cash) parts.push("+" + money(e.cash) + " en caja");
      if (e.churn) parts.push("un cliente se va");
      const box = document.createElement("div");
      box.className = "ex-why " + (r.o.ok ? "is-ok" : "is-bad");
      box.innerHTML = `<p class="sheet-k">${r.o.ok ? "Buena decisión" : "No era lo mejor"}</p><p>${GLOSS.link(esc(d.why))}</p><div class="chips">${parts.map((p) => `<span class="chip">${esc(p)}</span>`).join("")}</div>
        <button class="btn primary wide" data-close>Volver a la empresa</button>`;
      el.querySelector(".picker-in").appendChild(box);
      box.querySelector("[data-close]").onclick = () => closeModal(el, refresh);
      box.scrollIntoView({ block: "nearest" });
    });
  }

  function wire(refresh) {
    const msg = (t) => { const m = $("#co-msg"); if (m) m.textContent = t || ""; };
    const act = (fn) => { const err = fn(); if (err) msg(err); else refresh(); };
    const on = (sel, fn) => document.querySelectorAll(sel).forEach((b) => b.onclick = () => fn(b));
    on("#co-found", () => { if (found()) { ART.confetti(); refresh(); } });
    on("[data-cotab]", (b) => { tab = b.dataset.cotab; refresh(); });
    on("[data-ev]", (b) => eventModal(+b.dataset.ev, refresh));
    on("[data-bid]", (b) => bidModal(+b.dataset.bid, refresh));
    on("[data-hire]", (b) => act(() => hire(+b.dataset.hire)));
    on("[data-tool]", (b) => act(() => buyTool(b.dataset.tool)));
    on("[data-branch]", (b) => act(() => openBranch(b.dataset.branch)));
    on("#co-office", () => act(upgradeOffice));
    on("[data-invest]", (b) => act(() => invest(+b.dataset.invest)));
    on("[data-withdraw]", (b) => act(() => withdraw(+b.dataset.withdraw)));
    on("[data-fire]", (b) => {
      if (!b.dataset.sure) { b.dataset.sure = "1"; b.textContent = "¿Seguro?"; return; }
      fire(+b.dataset.fire); refresh();
    });
  }

  /* Tarjetas para Hoy y para el resultado del turno. */
  function homeCard() {
    if (!founded()) return unlocked() ? `<button class="card-btn co-home" id="h-co"><span class="eyebrow">Tu propia empresa</span><b>Funda Andino Shield</b><small>Ya puedes montar tu empresa de ciberseguridad.</small></button>` : "";
    const co = C();
    return `<button class="card-btn co-home" id="h-co"><span class="eyebrow">Andino Shield · día ${co.day}</span><b>${money(co.cash)} en caja</b>
      <small>${co.clients.length} ${co.clients.length === 1 ? "cliente" : "clientes"} · ${co.staff.length + 1} personas${co.events.length ? " · <span class=\"co-warn\">" + co.events.length + " por decidir</span>" : ""}${co.leads.length ? " · " + co.leads.length + " licitaciones" : ""}</small></button>`;
  }
  function resultCard(r) {
    return `<div class="banner co-res"><p class="eyebrow">Andino Shield · día ${r.day}</p>
      <p>Ingresos ${money(r.inc)} · gastos ${money(r.cost)}${r.fines ? " · multas " + money(r.fines) : ""} · caja <b>${money(r.cash)}</b></p>
      ${r.events ? `<p class="co-warn">${r.events === 1 ? "Un incidente espera tu decisión." : r.events + " incidentes esperan tu decisión."}</p>` : ""}
      <button class="btn wide" id="r-co">Ir a mi empresa</button></div>`;
  }

  window.TYC = { unlocked, founded, found, nextDay, view, wire, homeCard, resultCard, stage, mrr, supply, demand, evalBid, decide, hire, buyTool, upgradeOffice, invest, withdraw, selfSec, costs, UNLOCK_RANK, FOUND_COST };
})();
