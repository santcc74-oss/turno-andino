/* Revisa el contenido del juego: cuenta preguntas y detecta la pista de «la correcta es la más larga».
   Uso: node tools/check-content.js */
const path = require("path");
global.window = global;
const root = path.join(__dirname, "..");
["data/glossary.js", "data/distractors.js", "data/modules-a.js", "data/modules-b.js", "data/modules-c.js", "data/objchecks.js", "data/extras.js",
  "content-world.js", "content-cases.js", "content-real.js"].forEach((f) => { try { require(path.join(root, f)); } catch (e) { if (!/content-real/.test(f)) throw e; } });

/* Aplica los distractores igual que state.js. */
const byId = (id) => { let m;
  if ((m = /^x-(\d+)$/.exec(id))) return EXTRA_Q[+m[1]];
  if ((m = /^(m\w+)-q(\d+)$/.exec(id))) { const mod = MODULES.find((x) => x.id === m[1]); return mod && Array.isArray(mod.quiz) ? mod.quiz[+m[2]] : null; }
  if ((m = /^(m\w+)-o(\d+)$/.exec(id))) return (OBJCHECKS[m[1]] || [])[+m[2]];
};
let bad = 0;
Object.entries(DISTRACTORS).forEach(([id, w]) => { const q = byId(id); if (!q || w.length !== q.a.length - 1) { bad++; console.log("Distractor que no encaja:", id); return; } const a = w.slice(); a.splice(q.c, 0, q.a[q.c]); q.a = a; });
console.log("Distractores aplicados:", Object.keys(DISTRACTORS).length - bad, "· con error:", bad);
const qs = [];
MODULES.forEach((m) => Array.isArray(m.quiz) && m.quiz.forEach((q, i) => qs.push([m.id + "-q" + i, q.a, q.c])));
Object.entries(OBJCHECKS).forEach(([m, a]) => a.forEach((q, i) => qs.push([m + "-o" + i, q.a, q.c])));
EXTRA_Q.forEach((q, i) => qs.push(["x-" + i, q.a, q.c]));
CALLS.forEach((q, i) => qs.push(["c" + i, q.opts, q.c]));
if (global.SIEMQ) SIEMQ.forEach((q, i) => qs.push(["s" + i, q.opts, q.c]));

let longest = 0, clear = [];
for (const [id, a, c] of qs) {
  const L = a.map((s) => s.length), max = Math.max(...L);
  if (L[c] === max) {
    longest++;
    const second = Math.max(...L.filter((_, i) => i !== c));
    if (L[c] > second * 1.3 && L[c] - second > 8) clear.push(id);
  }
}
const chance = qs.reduce((s, q) => s + 1 / q[1].length, 0) / qs.length;
console.log("Preguntas:", qs.length);
console.log("La correcta es la más larga:", longest, "(" + Math.round((100 * longest) / qs.length) + " %; al azar sería ~" + Math.round(chance * 100) + " %)");
console.log("La correcta es claramente más larga (+30 % y +8 letras):", clear.length);
console.log(clear.join(" "));
