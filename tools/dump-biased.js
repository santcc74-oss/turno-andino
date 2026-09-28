/* Lista las preguntas donde la correcta es claramente la más larga. Uso: node tools/dump-biased.js [desde] [hasta] */
const path = require("path"); global.window = global; const root = path.join(__dirname, "..");
["data/glossary.js","data/modules-a.js","data/modules-b.js","data/modules-c.js","data/objchecks.js","data/extras.js","content-world.js","content-cases.js"].forEach(f => require(path.join(root, f)));
const qs = [];
MODULES.forEach(m => Array.isArray(m.quiz) && m.quiz.forEach((q,i) => qs.push([m.id+"-q"+i, q])));
Object.entries(OBJCHECKS).forEach(([m,a]) => a.forEach((q,i) => qs.push([m+"-o"+i, q])));
EXTRA_Q.forEach((q,i) => qs.push(["x-"+i, q]));
const out = [];
for (const [id, q] of qs) { const L = q.a.map(s=>s.length), second = Math.max(...L.filter((_,i)=>i!==q.c)); if (L[q.c] === Math.max(...L) && L[q.c] > second*1.3) out.push(id + " | " + q.q + " | OK: " + q.a[q.c] + " | MAL: " + q.a.filter((_,i)=>i!==q.c).join(" ¦ ")); }
const [a,b] = process.argv.slice(2).map(Number); console.log(out.slice(a||0, b||out.length).join("\n"));
