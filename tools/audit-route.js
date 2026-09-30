/* Auditoría de la ruta: ¿cada minijuego aparece después de estudiar lo que necesita? Uso: node tools/audit-route.js */
const path = require("path"); global.window = global; const root = path.join(__dirname, "..");
["data/glossary.js","data/modules-a.js","data/modules-b.js","data/modules-c.js","data/explain.js","content-world.js"].forEach(f => require(path.join(root, f)));
const NEEDS = { mail: ["m16"], call: ["m16"], log: ["m06"], decode: ["m01"], ports: ["m08"], english: [], order: ["m21"], header: ["m16"], code: ["m10", "m17"], siem: ["m19"], cve: ["m18"], cmd: ["m04"], quiz: [] };
const name = (id) => (MODULES.find(m => m.id === id) || {}).title;
let seen = [];
CITIES.forEach((c, i) => {
  seen = seen.concat(c.mods);
  const probs = Object.keys(c.games).filter(t => (NEEDS[t] || []).some(m => !seen.includes(m))).map(t => t + " (necesita " + NEEDS[t].filter(m => !seen.includes(m)).map(m => m + " " + name(m)).join(", ") + ")");
  const words = c.mods.map(m => { const mod = MODULES.find(x => x.id === m); return mod.lessons.reduce((s, l) => s + l.b.split(/\s+/).length, 0) + (EXPLAIN[m] || "").split(/\s+/).length; });
  console.log(`${i + 1}. ${c.code} ${c.city} · temas: ${c.mods.join(", ")} · lecciones: ${words.join("/")} palabras`);
  console.log("   Minijuegos antes de tiempo: " + (probs.length ? probs.join("; ") : "ninguno"));
});
