/* Turno Andino — estado guardado, utilidades y bancos de preguntas. */
(function () {
  const LS_KEY = "turno-andino-v1";

  const fresh = () => ({
    v: 1, created: Date.now(), updated: Date.now(), intro: false,
    xp: 0, money: 0, owned: {}, city: "BOG",
    cities: {}, stamps: {},
    wrong: {}, seen: {},
    shifts: 0, answered: 0, correct: 0,
    cama: { caught: 0, missed: 0 },
    streak: { cur: 0, best: 0, last: "", freezeWeek: -1 },
    flashBest: 0, cur: null, exam: null, mapSeen: 1,
  });

  function merge(raw) {
    const base = fresh();
    if (!raw || typeof raw !== "object") return base;
    for (const k of Object.keys(base)) if (raw[k] !== undefined) base[k] = raw[k];
    base.cama = Object.assign(fresh().cama, raw.cama || {});
    base.streak = Object.assign(fresh().streak, raw.streak || {});
    return base;
  }

  let S = fresh();
  try { const raw = localStorage.getItem(LS_KEY); if (raw) S = merge(JSON.parse(raw)); } catch (e) {}

  function save() {
    S.updated = Date.now();
    try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) {}
  }
  function reset() { S = fresh(); save(); }
  function load(obj) { S = merge(obj); save(); }

  /* ——— Utilidades ——— */
  const rand = (n) => Math.floor(Math.random() * n);
  const pick = (arr) => arr[rand(arr.length)];
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function dayKey(d) {
    d = d || new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  const dayNum = (key) => { const [y, m, d] = key.split("-").map(Number); return Math.round(Date.UTC(y, m - 1, d) / 864e5); };
  const money = (n) => "₳ " + Math.round(n).toLocaleString("es-CO");

  /* ——— Carrera ——— */
  function rankIndex(xp) {
    let r = 0;
    CAREER.forEach((c, i) => { if (xp >= c[0]) r = i; });
    return r;
  }
  function rankInfo(xp) {
    const i = rankIndex(xp), cur = CAREER[i], next = CAREER[i + 1];
    const pct = next ? (xp - cur[0]) / (next[0] - cur[0]) : 1;
    return { i, name: cur[1], salary: cur[2], next: next ? next[1] : null, need: next ? next[0] - xp : 0, pct: Math.max(0, Math.min(1, pct)) };
  }

  /* ——— Sedes ——— */
  const cityByCode = (code) => CITIES.find((c) => c.code === code) || CITIES[0];
  function cityProg(code) {
    if (!S.cities[code]) S.cities[code] = { shifts: 0, good: 0 };
    return S.cities[code];
  }
  function cityOpen(code) {
    const i = CITIES.findIndex((c) => c.code === code);
    return i === 0 || !!S.stamps[CITIES[i - 1].code];
  }
  const GOOD_FOR_STAMP = 3;

  /* ——— Perks ——— */
  const has = (id) => !!S.owned[id];
  const hintsPerShift = () => (has("cafe") ? 1 : 0) + (has("termo") ? 1 : 0);
  const slaSeconds = () => (has("audifonos") ? 35 : 25);

  /* ——— Bancos de contenido ——— */
  const modById = (id) => MODULES.find((m) => m.id === id);

  function quizById(id) {
    let m;
    if ((m = /^x-(\d+)$/.exec(id))) return EXTRA_Q[+m[1]];
    if ((m = /^(m\w+)-q(\d+)$/.exec(id))) { const mod = modById(m[1]); return mod && Array.isArray(mod.quiz) ? mod.quiz[+m[2]] : null; }
    if ((m = /^(m\w+)-o(\d+)$/.exec(id))) { const arr = OBJCHECKS[m[1]]; return arr ? arr[+m[2]] : null; }
    return null;
  }
  function quizIdsFor(city) {
    const ids = [];
    city.mods.forEach((mid) => {
      const mod = modById(mid);
      if (mod && Array.isArray(mod.quiz)) mod.quiz.forEach((_, i) => ids.push(mid + "-q" + i));
      (OBJCHECKS[mid] || []).forEach((_, i) => ids.push(mid + "-o" + i));
    });
    if (city.code === "MAD") EXTRA_Q.forEach((_, i) => ids.push("x-" + i));
    return ids;
  }
  /* Mensajes: p = CyberRuta PHISH (correo), g = MSGS del juego.
     En PHISH, el Camaleón firma la alerta falsa del banco, el correo del «presidente» y el de micros0ft. */
  const PHISH_CAMA = [0, 3, 5];
  function msgById(id) {
    const m = /^([pg])(\d+)$/.exec(id);
    if (!m) return null;
    if (m[1] === "p") { const x = PHISH[+m[2]]; return x && Object.assign({ ch: "Correo", cama: PHISH_CAMA.includes(+m[2]) }, x); }
    return MSGS[+m[2]];
  }
  const msgIds = () => PHISH.map((_, i) => "p" + i).concat(MSGS.map((_, i) => "g" + i));

  function englishPairs(city) {
    let words = [];
    city.mods.forEach((mid) => { const mod = modById(mid); if (mod && mod.english) words = words.concat(mod.english.words); });
    if (words.length < 4) MODULES.forEach((mod) => { if (mod.english) words = words.concat(mod.english.words); });
    return words;
  }

  /* ——— Racha ——— */
  function touchStreak() {
    const today = dayKey(), st = S.streak;
    if (st.last === today) return;
    const gap = st.last ? dayNum(today) - dayNum(st.last) : 99;
    const week = Math.floor(dayNum(today) / 7);
    if (gap === 1) st.cur += 1;
    else if (gap === 2 && has("maleta") && st.freezeWeek !== week) { st.cur += 1; st.freezeWeek = week; }
    else st.cur = 1;
    st.last = today;
    st.best = Math.max(st.best, st.cur);
  }
  function streakAlive() {
    const st = S.streak;
    if (!st.last) return 0;
    const gap = dayNum(dayKey()) - dayNum(st.last);
    if (gap <= 1) return st.cur;
    if (gap === 2 && has("maleta") && st.freezeWeek !== Math.floor(dayNum(dayKey()) / 7)) return st.cur;
    return 0;
  }

  /* ——— Repaso espaciado ——— */
  function markResult(id, ok) {
    if (!id) return;
    if (ok) delete S.wrong[id];
    else { const w = S.wrong[id] || { n: 0 }; w.n += 1; w.due = S.shifts + 1; S.wrong[id] = w; }
  }
  const dueReview = () => Object.keys(S.wrong).filter((id) => S.wrong[id].due <= S.shifts + 1);

  window.TA = {
    get S() { return S; }, save, reset, load, LS_KEY,
    rand, pick, shuffle, esc, dayKey, money,
    rankIndex, rankInfo, cityByCode, cityProg, cityOpen, GOOD_FOR_STAMP,
    has, hintsPerShift, slaSeconds,
    modById, quizById, quizIdsFor, msgById, msgIds, englishPairs,
    touchStreak, streakAlive, markResult, dueReview,
  };
})();
