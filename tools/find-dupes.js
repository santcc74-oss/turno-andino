/* Busca preguntas casi iguales (mismo concepto) dentro de cada módulo. Uso: node tools/find-dupes.js */
const path = require("path"); global.window = global; const root = path.join(__dirname, "..");
["data/glossary.js","data/modules-a.js","data/modules-b.js","data/modules-c.js","data/objchecks.js","data/extras.js"].forEach(f => require(path.join(root, f)));
const STOP = new Set("para porque sirve cual cuál como cómo esta este esto una unos unas los las del que qué con por sus suele debe sobre entre desde".split(" "));
const words = (s) => new Set(s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(w => w.length > 3 && !STOP.has(w)));
const items = [];
MODULES.forEach(m => Array.isArray(m.quiz) && m.quiz.forEach((q, i) => items.push({ id: m.id + "-q" + i, mod: m.id, q })));
Object.entries(OBJCHECKS).forEach(([m, a]) => a.forEach((q, i) => items.push({ id: m + "-o" + i, mod: m, q })));
items.forEach(x => x.w = words(x.q.q + " " + x.q.a[x.q.c]));
const jac = (a, b) => { let n = 0; a.forEach(w => b.has(w) && n++); return n / (a.size + b.size - n || 1); };
let pairs = 0;
for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
  if (items[i].mod !== items[j].mod) continue;
  const s = jac(items[i].w, items[j].w);
  if (s >= 0.34) { pairs++; console.log(s.toFixed(2), items[i].id, "|", items[i].q.q, "  ⟷  ", items[j].id, "|", items[j].q.q); }
}
console.log("pares:", pairs, "de", items.length, "preguntas");
