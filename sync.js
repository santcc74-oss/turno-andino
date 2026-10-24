/* Turno Andino — sincronización entre dispositivos con un código.
   El progreso se cifra en el dispositivo (AES-GCM, clave derivada del código con PBKDF2);
   el servidor solo guarda un bloque ilegible y no conoce el código. Gana la copia más reciente. */
(function () {
  const ENDPOINT = "https://lightgray-kangaroo-547829.hostingersite.com/sync.php";
  const K_CODE = "turno-andino-sync-code", K_META = "turno-andino-sync-meta";
  const enc = new TextEncoder(), dec = new TextDecoder();
  const MIN_LEN = 10;

  let code = null, ids = null, meta = { rev: 0, updated: 0 }, timer = null, busy = Promise.resolve(), status = "off", lastError = "";
  try { code = localStorage.getItem(K_CODE) || null; meta = JSON.parse(localStorage.getItem(K_META) || "null") || meta; } catch (e) {}

  const hex = (buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const b64 = (buf) => { let s = ""; new Uint8Array(buf).forEach((b) => { s += String.fromCharCode(b); }); return btoa(s); };
  const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const norm = (c) => String(c || "").trim().toLowerCase().replace(/\s+/g, "");

  async function derive(c) {
    const id = hex(await crypto.subtle.digest("SHA-256", enc.encode("turno-andino|id|" + c)));
    const base = await crypto.subtle.importKey("raw", enc.encode(c), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: enc.encode("turno-andino|key"), iterations: 150000, hash: "SHA-256" },
      base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    return { id, key };
  }
  async function seal(obj, key) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(obj)));
    return b64(iv) + "." + b64(ct);
  }
  async function open(blob, key) {
    const [iv, ct] = blob.split(".");
    return JSON.parse(dec.decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, key, unb64(ct))));
  }
  const saveMeta = () => { try { localStorage.setItem(K_META, JSON.stringify(meta)); } catch (e) {} };
  const setStatus = (s, err) => { status = s; lastError = err || ""; window.dispatchEvent(new CustomEvent("ta-sync", { detail: s })); };

  async function req(method, body) {
    const url = ENDPOINT + (method === "GET" ? "?id=" + ids.id : "");
    const res = await fetch(url, method === "GET" ? { cache: "no-store" } : { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, json };
  }
  const localState = () => Object.assign({}, TA.S);

  /* Trae la copia del servidor. Si es más reciente que la local, la aplica; si no, sube la local. */
  async function pull() {
    const r = await req("GET");
    if (r.status !== 200) throw new Error("servidor " + r.status);
    meta.rev = r.json.rev || 0;
    if (!r.json.data) { saveMeta(); return "empty"; }
    const remote = await open(r.json.data, ids.key);
    const loc = TA.S;
    if ((remote.updated || 0) > (meta.updated || 0) && (remote.updated || 0) > (loc.updated || 0)) {
      TA.load(remote);
      meta.updated = TA.S.updated; saveMeta();
      return "applied";
    }
    saveMeta();
    return "kept";
  }
  async function push() {
    const body = { id: ids.id, baseRev: meta.rev, data: await seal(localState(), ids.key) };
    const r = await req("POST", body);
    if (r.status === 409) { meta.rev = r.json.rev || 0; const res = await pull(); if (res === "applied") return "applied"; return push(); }
    if (r.status !== 200) throw new Error("servidor " + r.status);
    meta.rev = r.json.rev; meta.updated = TA.S.updated; saveMeta();
    return "pushed";
  }
  const queue = (fn) => (busy = busy.then(fn, fn));

  /* Sincroniza: primero trae, luego sube si lo local es más nuevo. Devuelve "applied" si cambió el progreso local. */
  function syncNow() {
    if (!code) return Promise.resolve("off");
    return queue(async () => {
      setStatus("busy");
      try {
        const r = await pull();
        if (r === "applied") { setStatus("ok"); return "applied"; }
        if (TA.S.updated > meta.updated || r === "empty") await push();
        setStatus("ok"); return r;
      } catch (e) { setStatus("error", e && e.message); return "error"; }
    });
  }

  /* TA.save() avisa aquí: se sube 3 segundos después del último cambio. */
  function changed() {
    if (!code) return;
    clearTimeout(timer);
    timer = setTimeout(() => queue(async () => {
      try { setStatus("busy"); const r = await push(); setStatus("ok"); return r; } catch (e) { setStatus("error", e && e.message); }
    }), 3000);
  }

  async function connect(raw) {
    const c = norm(raw);
    if (c.length < MIN_LEN) throw new Error("El código debe tener al menos " + MIN_LEN + " caracteres.");
    ids = await derive(c); code = c;
    meta = { rev: 0, updated: 0 };
    try { localStorage.setItem(K_CODE, code); } catch (e) {}
    saveMeta();
    const r = await syncNow();
    if (r === "error") { const m = lastError; disconnect(); throw new Error("No pude conectar con el servidor (" + m + "). Revisa tu internet."); }
    return r;
  }
  function disconnect() {
    clearTimeout(timer); code = null; ids = null; meta = { rev: 0, updated: 0 };
    try { localStorage.removeItem(K_CODE); localStorage.removeItem(K_META); } catch (e) {}
    setStatus("off");
  }
  function generate() {
    const abc = "abcdefghjkmnpqrstuvwxyz23456789", a = crypto.getRandomValues(new Uint8Array(12));
    return Array.from(a).map((n) => abc[n % abc.length]).join("").replace(/(.{4})(?=.)/g, "$1-");
  }

  window.TASYNC = {
    changed, syncNow, connect, disconnect, generate,
    get code() { return code; }, get status() { return status; }, get error() { return lastError; },
    start() {
      if (!code) return;
      derive(code).then((d) => {
        ids = d; setStatus("busy");
        syncNow().then((r) => { if (r === "applied") location.reload(); });
        document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") syncNow().then((r) => { if (r === "applied") location.reload(); }); });
      }).catch(() => setStatus("error", "cifrado"));
    },
  };
})();
