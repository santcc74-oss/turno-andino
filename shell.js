/* Turno Andino — terminal Linux simulada.
   Un intérprete pequeño de bash sobre el servidor de práctica (content-linux.js): comandos reales,
   tuberías, redirección, comillas, comodines, permisos, sudo y mensajes de error como los de Ubuntu en español. */
(function () {
  const HOME = "/home/analista", HOST = "srv-web01";
  const GROUPS = { analista: ["analista", "adm", "sudo", "soc"], root: ["root"] };
  const GID = { root: 0, adm: 4, sudo: 27, analista: 1000, lrojas: 1001, respaldos: 1002, soc: 1003, "www-data": 33, syslog: 104, shadow: 42 };
  const USERS = ["root", "daemon", "www-data", "sshd", "postgres", "analista", "lrojas", "respaldos", "syslog"];
  const CRITICAL = { 1: "init, el primer proceso del sistema", 612: "SSH (te desconectarías del servidor)", 880: "la web del banco", 881: "la web del banco", 760: "la base de datos", 540: "el registro de logs" };

  /* ——— SHA-256 real (para sha256sum) ——— */
  function sha256(str) {
    const bytes = Array.from(new TextEncoder().encode(str));
    const K = [], H = [];
    let n = 2, found = 0;
    const frac = (x) => ((x - Math.floor(x)) * 4294967296) | 0;
    while (found < 64) { let p = true; for (let d = 2; d * d <= n; d++) if (n % d === 0) { p = false; break; } if (p) { if (found < 8) H[found] = frac(Math.pow(n, 1 / 2)); K[found] = frac(Math.pow(n, 1 / 3)); found++; } n++; }
    const l = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    for (let i = 7; i >= 0; i--) bytes.push(i > 3 ? 0 : (l >>> (i * 8)) & 255);
    const r = (x, s) => (x >>> s) | (x << (32 - s));
    for (let i = 0; i < bytes.length; i += 64) {
      const w = [];
      for (let j = 0; j < 16; j++) w[j] = (bytes[i + j * 4] << 24) | (bytes[i + j * 4 + 1] << 16) | (bytes[i + j * 4 + 2] << 8) | bytes[i + j * 4 + 3];
      for (let j = 16; j < 64; j++) { const s0 = r(w[j - 15], 7) ^ r(w[j - 15], 18) ^ (w[j - 15] >>> 3), s1 = r(w[j - 2], 17) ^ r(w[j - 2], 19) ^ (w[j - 2] >>> 10); w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0; }
      let [a, b, c, d, e, f, g, h] = H;
      for (let j = 0; j < 64; j++) {
        const t1 = (h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[j] + w[j]) | 0;
        const t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      [a, b, c, d, e, f, g, h].forEach((v, k) => { H[k] = (H[k] + v) | 0; });
    }
    return H.map((v) => (v >>> 0).toString(16).padStart(8, "0")).join("");
  }

  /* ——— Ayuda corta de cada comando (man y --help) ——— */
  const MAN = {
    ls: ["lista el contenido de una carpeta", "ls [OPCIÓN]... [CARPETA]", [["-l", "formato largo: permisos, dueño, tamaño, fecha"], ["-a", "incluye los ocultos (empiezan por punto)"], ["-h", "tamaños legibles (K, M) junto con -l"]]],
    cd: ["cambia de carpeta", "cd [CARPETA]", [["cd", "vuelve a tu carpeta personal"], ["cd ..", "sube un nivel"], ["cd -", "vuelve a la carpeta anterior"]]],
    pwd: ["muestra la carpeta actual", "pwd", []],
    cat: ["muestra el contenido de archivos", "cat [OPCIÓN]... [ARCHIVO]...", [["-n", "numera las líneas"]]],
    less: ["muestra un archivo por páginas", "less ARCHIVO", [["espacio", "baja una página"], ["/texto", "busca"], ["q", "sale"]]],
    head: ["muestra el principio de un archivo", "head [-n N] ARCHIVO", [["-n N", "las primeras N líneas (10 por defecto)"]]],
    tail: ["muestra el final de un archivo", "tail [-n N] [-f] ARCHIVO", [["-n N", "las últimas N líneas"], ["-f", "sigue mostrando las líneas nuevas en vivo"]]],
    wc: ["cuenta líneas, palabras y bytes", "wc [OPCIÓN] [ARCHIVO]", [["-l", "solo líneas"], ["-w", "solo palabras"], ["-c", "solo bytes"]]],
    grep: ["busca texto dentro de archivos", "grep [OPCIÓN]... PATRÓN [ARCHIVO]...", [["-i", "sin distinguir mayúsculas"], ["-c", "cuenta las líneas que coinciden"], ["-n", "muestra el número de línea"], ["-v", "las líneas que NO coinciden"], ["-r", "busca en toda una carpeta"]]],
    find: ["busca archivos", "find [CARPETA] [EXPRESIÓN]", [["-name \"*.log\"", "por nombre (con comodines)"], ["-type f / -type d", "solo archivos / solo carpetas"], ["-user NOMBRE", "por dueño"]]],
    mkdir: ["crea carpetas", "mkdir [-p] CARPETA", [["-p", "crea también las carpetas del camino"]]],
    touch: ["crea un archivo vacío o actualiza su fecha", "touch ARCHIVO", []],
    cp: ["copia archivos y carpetas", "cp [-r] ORIGEN DESTINO", [["-r", "copia carpetas con todo su contenido"]]],
    mv: ["mueve o renombra", "mv ORIGEN DESTINO", []],
    rm: ["borra archivos (no hay papelera)", "rm [-r] [-f] ARCHIVO", [["-r", "borra carpetas y su contenido"], ["-f", "no pregunta ni avisa"]]],
    echo: ["escribe un texto", "echo [TEXTO]", []],
    sort: ["ordena líneas", "sort [OPCIÓN] [ARCHIVO]", [["-n", "orden numérico"], ["-r", "al revés"], ["-u", "sin repetidos"]]],
    uniq: ["junta líneas repetidas seguidas", "uniq [-c] [ARCHIVO]", [["-c", "antepone cuántas veces se repite"]]],
    cut: ["corta columnas", "cut -d SEPARADOR -f CAMPOS [ARCHIVO]", [["-d ' '", "separador (por defecto, tabulador)"], ["-f 1,3", "campos que se quedan"]]],
    awk: ["procesa texto por columnas", "awk '{print $N}' [ARCHIVO]", [["$1, $2…", "columna 1, 2…"], ["$NF", "la última columna"], ["-F:", "usa : como separador"]]],
    chmod: ["cambia permisos", "chmod MODO ARCHIVO", [["640", "rw- r-- --- (números: r=4 w=2 x=1)"], ["u+x", "da ejecución al dueño"]]],
    chown: ["cambia el dueño", "chown USUARIO[:GRUPO] ARCHIVO", []],
    sudo: ["ejecuta un comando como administrador y lo registra", "sudo COMANDO", []],
    id: ["muestra tu usuario y tus grupos", "id [USUARIO]", []],
    ps: ["lista los procesos", "ps aux", [["aux", "todos los procesos de todos los usuarios"]]],
    top: ["procesos en vivo ordenados por CPU", "top", [["q", "sale"]]],
    kill: ["detiene un proceso", "kill [-9] PID", [["-9", "lo detiene a la fuerza (último recurso)"]]],
    systemctl: ["maneja servicios", "systemctl status|start|stop|restart SERVICIO", []],
    ss: ["muestra conexiones y puertos", "ss -tulpn", [["-t / -u", "TCP / UDP"], ["-l", "solo los que esperan conexiones"], ["-p", "con el programa (requiere sudo)"], ["-n", "números en vez de nombres"]]],
    ip: ["red: direcciones y rutas", "ip a | ip route", []],
    ping: ["comprueba si otro equipo responde", "ping [-c N] EQUIPO", [["-c N", "solo N intentos"]]],
    df: ["espacio en los discos", "df [-h]", [["-h", "tamaños legibles"]]],
    free: ["memoria usada y libre", "free [-h]", []],
    sha256sum: ["calcula la huella digital (hash SHA-256)", "sha256sum ARCHIVO", []],
    whoami: ["muestra tu usuario", "whoami", []],
    hostname: ["muestra el nombre del equipo", "hostname [-I]", [["-I", "muestra sus direcciones IP"]]],
    date: ["muestra la fecha y la hora", "date", []],
    history: ["muestra los comandos que escribiste", "history", []],
    file: ["dice qué tipo de archivo es", "file ARCHIVO", []],
    man: ["muestra el manual de un comando", "man COMANDO", []],
  };
  const COMMANDS = Object.keys(MAN).concat(["clear", "help", "more", "rmdir", "groups", "uptime", "uname", "who", "w", "last", "which", "su", "exit", "nano", "vi", "vim", "apt", "ll", "netstat", "ifconfig"]).sort();

  /* ——— Utilidades ——— */
  const p2 = (n) => String(n).padStart(2, "0");
  const base = (p) => p.split("/").filter(Boolean).pop() || "/";
  const dirOf = (p) => { const i = p.lastIndexOf("/"); return i <= 0 ? "/" : p.slice(0, i); };
  const join = (d, n) => (d === "/" ? "/" + n : d + "/" + n);
  const strip = (s) => (s || "").replace(/\n$/, "");
  const globRe = (pat, ci) => new RegExp("^" + pat.replace(/[.+^${}()|\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$", ci ? "i" : "");
  const human = (n) => (n < 1024 ? String(n) : n < 1048576 ? (n / 1024).toFixed(1).replace(".", ",") + "K" : (n / 1048576).toFixed(1).replace(".", ",") + "M");
  function lev(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  /* Teclados de teléfono: comillas curvas, raya larga en vez de dos guiones, espacios duros. */
  const normalize = (s) => s.replace(/[\u2018\u2019\u00B4`]/g, "'").replace(/[\u201C\u201D\u00AB\u00BB]/g, '"').replace(/[\u2014\u2013]/g, "--").replace(/\u00A0/g, " ");

  function create() {
    /* ——— Sistema de archivos ——— */
    const fs = new Map();
    LX_FS.forEach(([path, t, o, g, m, c, d]) => fs.set(path, { t, o, g, m, c: t === "f" ? c || "" : null, d }));
    const procs = LX_PROCS.map((p) => p.slice());
    const services = { nginx: "active", ssh: "active", cron: "active", postgresql: "active", rsyslog: "active" };
    const hist = [];
    const t0 = Date.now();
    let cwd = HOME, oldpwd = HOME, sudoNoted = false, nextPid = 4130;

    /* Reloj simulado: el turno empieza el lunes 29 de septiembre a las 8:30 y avanza con el tiempo real. */
    const secs = () => (8 * 3600 + 30 * 60 + Math.floor((Date.now() - t0) / 1000)) % 86400;
    const clock = () => { const t = secs(); return `${p2(Math.floor(t / 3600))}:${p2(Math.floor(t / 60) % 60)}:${p2(t % 60)}`; };
    const stamp = () => { const t = clock(); return `sep 29 ${t.slice(0, 5)}`; };
    const children = (dir) => { const pre = dir === "/" ? "/" : dir + "/"; const out = []; fs.forEach((_, p) => { if (p !== dir && p.startsWith(pre) && !p.slice(pre.length).includes("/")) out.push(p); }); return out; };
    const sortNames = (a, b) => { const k = (s) => base(s).replace(/^\./, "").toLowerCase(); return k(a) < k(b) ? -1 : k(a) > k(b) ? 1 : 0; };

    function resolve(p) {
      if (p == null || p === "") return cwd;
      if (p === "~" || p.startsWith("~/")) p = HOME + p.slice(1);
      const parts = (p.startsWith("/") ? p : cwd + "/" + p).split("/");
      const out = [];
      parts.forEach((s) => { if (!s || s === ".") return; if (s === "..") out.pop(); else out.push(s); });
      return "/" + out.join("/");
    }
    /* Permisos: bit 4 = leer, 2 = escribir, 1 = ejecutar / entrar. */
    function can(node, user, bit) {
      if (user === "root") return true;
      const m = node.m % 1000, o = Math.floor(m / 100), g = Math.floor(m / 10) % 10, x = m % 10;
      if (node.o === user) return !!(o & bit);
      if ((GROUPS[user] || [user]).includes(node.g)) return !!(g & bit);
      return !!(x & bit);
    }
    /* ¿Se puede llegar hasta esta ruta? (permiso de entrar en cada carpeta del camino) */
    function reach(path, user) {
      let p = dirOf(path);
      while (true) { const n = fs.get(p); if (n && !can(n, user, 1)) return false; if (p === "/") return true; p = dirOf(p); }
    }
    const permStr = (n) => {
      const m = n.m % 1000, sticky = n.m >= 1000;
      const tri = (d) => (d & 4 ? "r" : "-") + (d & 2 ? "w" : "-") + (d & 1 ? "x" : "-");
      let s = (n.t === "d" ? "d" : "-") + tri(Math.floor(m / 100)) + tri(Math.floor(m / 10) % 10) + tri(m % 10);
      if (sticky) s = s.slice(0, 9) + (s[9] === "x" ? "t" : "T");
      return s;
    };
    const sizeOf = (n) => (n.t === "d" ? 4096 : new TextEncoder().encode(n.c).length);
    function lines(text) { const t = strip(text); return t === "" ? [] : t.split("\n"); }

    /* Errores típicos al abrir un archivo para leer. */
    function readFile(cmd, arg, user) {
      const p = resolve(arg), n = fs.get(p);
      if (!n) return { err: `${cmd}: ${arg}: No existe el archivo o el directorio` };
      if (!reach(p, user)) return { err: `${cmd}: ${arg}: Permiso denegado` };
      if (n.t === "d") return { err: `${cmd}: ${arg}: Es un directorio` };
      if (!can(n, user, 4)) return { err: `${cmd}: ${arg}: Permiso denegado` };
      return { text: n.c, path: p };
    }
    function writeFile(path, text, append, user, label) {
      if (path === "/dev/null") return null;
      const n = fs.get(path);
      if (n && n.t === "d") return `bash: ${label}: Es un directorio`;
      if (n) { if (!can(n, user, 2)) return `bash: ${label}: Permiso denegado`; n.c = append ? n.c + text : text; n.d = stamp(); return null; }
      const parent = fs.get(dirOf(path));
      if (!parent || parent.t !== "d") return `bash: ${label}: No existe el archivo o el directorio`;
      if (!can(parent, user, 2) || !reach(path, user)) return `bash: ${label}: Permiso denegado`;
      fs.set(path, { t: "f", o: user, g: user === "root" ? "root" : user, m: 644, c: text, d: stamp() });
      return null;
    }
    const mayDelete = (path, user) => {
      const parent = fs.get(dirOf(path)), n = fs.get(path);
      if (!can(parent, user, 2) || !reach(path, user)) return false;
      if (parent.m >= 1000 && user !== "root" && n.o !== user && parent.o !== user) return false;
      return true;
    };
    function moveTree(from, to) {
      const moves = [];
      fs.forEach((n, p) => { if (p === from || p.startsWith(from + "/")) moves.push([p, n]); });
      moves.forEach(([p]) => fs.delete(p));
      moves.forEach(([p, n]) => fs.set(to + p.slice(from.length), n));
    }
    function copyTree(from, to, user) {
      fs.forEach((n, p) => {
        if (p === from || p.startsWith(from + "/")) fs.set(to + p.slice(from.length), { t: n.t, o: user, g: user === "root" ? "root" : user, m: n.m % 1000, c: n.c, d: stamp() });
      });
    }

    /* ——— Opciones: separa -abc y --largas de los argumentos ——— */
    function opts(args, withValue) {
      const f = {}, rest = [];
      for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === "--") { rest.push(...args.slice(i + 1)); break; }
        if (/^--\w/.test(a)) { f[a.slice(2)] = true; continue; }
        if (/^-[a-zA-Z0-9]/.test(a) && !/^-\d+$/.test(a) || (/^-\d+$/.test(a) && withValue && withValue.includes("#"))) {
          if (/^-\d+$/.test(a)) { f["#"] = a.slice(1); continue; }
          for (let k = 1; k < a.length; k++) {
            const ch = a[k];
            if (withValue && withValue.includes(ch)) { f[ch] = a.slice(k + 1) || args[++i]; break; }
            f[ch] = true;
          }
          continue;
        }
        rest.push(a);
      }
      return [f, rest];
    }

    /* ——— Los comandos ——— */
    const R = (out, err, code, note) => ({ out: out || "", err: err || "", code: code == null ? (err ? 1 : 0) : code, note: note || "" });
    const C = {};
    C.help = () => R("Comandos del simulador:\n" + COMMANDS.filter((c) => !["ll", "vi", "vim", "netstat", "ifconfig", "more", "w"].includes(c)).join("  ") + "\n\nPuedes unir comandos con | y guardar resultados con > o >>. Escribe man COMANDO para ver su ayuda.");
    C.man = (a) => {
      if (!a[0]) return R("", "¿Qué página de manual desea?\nPor ejemplo, pruebe «man man».");
      const m = MAN[a[0]];
      if (!m) return R("", `No hay ninguna entrada de manual para ${a[0]}`);
      return R(manText(a[0]), "", 0, "En un servidor real, man se abre por páginas: bajas con la barra espaciadora y sales con q.");
    };
    const manText = (c) => { const m = MAN[c]; return `${c.toUpperCase()}(1)\n\nNOMBRE\n       ${c} - ${m[0]}\n\nSINOPSIS\n       ${m[1]}` + (m[2].length ? `\n\nOPCIONES MÁS USADAS\n${m[2].map(([o, d]) => `       ${o.padEnd(18)} ${d}`).join("\n")}` : ""); };
    C.whoami = (a, x) => R(x.user);
    C.hostname = (a) => R(a.includes("-I") ? "10.20.3.15" : HOST);
    C.date = () => R(`lun 29 sep 2026 ${clock()} -05`);
    C.pwd = () => R(cwd);
    C.echo = (a) => { let args = a.slice(); let e = false; while (args[0] === "-n" || args[0] === "-e") { if (args[0] === "-e") e = true; args.shift(); } let s = args.join(" "); if (e) s = s.replace(/\\n/g, "\n").replace(/\\t/g, "\t"); return R(s); };
    C.history = () => R(hist.map((h, i) => String(i + 1).padStart(5) + "  " + h).join("\n"));
    C.cd = (a, x) => {
      let t = a[0];
      if (t === "-") { t = oldpwd; }
      const p = resolve(t == null ? "~" : t), n = fs.get(p);
      if (!n) return R("", `bash: cd: ${t}: No existe el archivo o el directorio`);
      if (n.t !== "d") return R("", `bash: cd: ${t}: No es un directorio`);
      if (!can(n, x.user, 1) || !reach(p, x.user)) return R("", `bash: cd: ${t}: Permiso denegado`);
      oldpwd = cwd; cwd = p;
      return R(a[0] === "-" ? cwd : "");
    };
    C.ls = (args, x) => {
      const [f, rest] = opts(args);
      if (f.help) return R(manText("ls"));
      const all = f.a || f.all || f.A, long = f.l, hum = f.h;
      const targets = rest.length ? rest : ["."];
      const blocks = [], errs = [];
      const fmt = (items, full) => {
        if (!long) return items.map((it) => it.name).join("  ");
        const w = (k) => Math.max(...items.map((it) => String(it[k]).length));
        const rows = items.map((it) => { it.sz = hum ? human(sizeOf(it.n)) : String(sizeOf(it.n)); return it; });
        const ws = Math.max(...rows.map((r) => r.sz.length));
        const body = rows.map((it) => `${permStr(it.n)} ${it.n.t === "d" ? 2 : 1} ${it.n.o.padEnd(w("o"))} ${it.n.g.padEnd(w("g"))} ${it.sz.padStart(ws)} ${it.n.d} ${it.name}`).join("\n");
        if (!full) return body;
        const tot = items.reduce((s, it) => s + Math.ceil(sizeOf(it.n) / 4096) * 4, 0);
        return `total ${tot}\n` + body;
      };
      const files = [], dirs = [];
      targets.forEach((t) => {
        const p = resolve(t), n = fs.get(p);
        if (!n) return errs.push(`ls: no se puede acceder a '${t}': No existe el archivo o el directorio`);
        if (!reach(p, x.user)) return errs.push(`ls: no se puede acceder a '${t}': Permiso denegado`);
        if (n.t === "f") files.push({ name: t, n, o: n.o, g: n.g });
        else dirs.push([t, p, n]);
      });
      if (files.length) blocks.push(fmt(files.map((it) => ({ ...it, o: it.n.o, g: it.n.g })), false));
      dirs.forEach(([t, p, n]) => {
        if (!can(n, x.user, 4)) return errs.push(`ls: no se puede abrir el directorio '${t}': Permiso denegado`);
        let items = children(p).sort(sortNames).map((cp) => ({ name: base(cp), n: fs.get(cp) }));
        if (!all) items = items.filter((it) => !it.name.startsWith("."));
        else if (!f.A) items = [{ name: ".", n }, { name: "..", n: fs.get(dirOf(p)) || n }].concat(items);
        items.forEach((it) => { it.o = it.n.o; it.g = it.n.g; });
        const body = items.length ? fmt(items, true) : long ? "total 0" : "";
        blocks.push(targets.length > 1 ? `${t}:\n${body}` : body);
      });
      return R(blocks.filter((b) => b !== "").join("\n\n"), errs.join("\n"));
    };
    C.ll = (a, x) => C.ls(["-la"].concat(a), x);
    C.cat = (args, x, input) => {
      const [f, rest] = opts(args);
      if (f.help) return R(manText("cat"));
      if (!rest.length) return R(input || "");
      const outs = [], errs = [];
      rest.forEach((a) => { const r = readFile("cat", a, x.user); if (r.err) errs.push(r.err); else outs.push(strip(r.text)); });
      let out = outs.filter((s) => s !== "").join("\n");
      if (f.n) out = out.split("\n").map((l, i) => String(i + 1).padStart(6) + "\t" + l).join("\n");
      return R(out, errs.join("\n"));
    };
    C.less = (a, x, input) => { const r = C.cat(a, x, input); r.note = "En un servidor real, less muestra el archivo por páginas: espacio para bajar, q para salir."; return r; };
    C.more = C.less;
    const headTail = (cmd) => (args, x, input) => {
      const [f, rest] = opts(args, "n#");
      if (f.help) return R(manText(cmd));
      const n = parseInt(f.n || f["#"] || "10", 10);
      if (isNaN(n)) return R("", `${cmd}: número de líneas no válido: «${f.n}»`);
      let text = input;
      if (rest.length) { const r = readFile(cmd, rest[0], x.user); if (r.err) return R("", r.err.replace(`${cmd}: ${rest[0]}`, `${cmd}: no se puede abrir '${rest[0]}' para lectura`)); text = r.text; }
      const ls = lines(text || "");
      const out = (cmd === "head" ? ls.slice(0, n) : ls.slice(Math.max(0, ls.length - n))).join("\n");
      return R(out, "", 0, cmd === "tail" && f.f ? "tail -f se quedaría esperando líneas nuevas en vivo. En un servidor real lo cierras con Ctrl+C." : "");
    };
    C.head = headTail("head"); C.tail = headTail("tail");
    C.wc = (args, x, input) => {
      const [f, rest] = opts(args);
      if (f.help) return R(manText("wc"));
      const count = (t) => ({ l: (t.match(/\n/g) || []).length, w: (t.match(/\S+/g) || []).length, c: new TextEncoder().encode(t).length });
      const fmt = (k, name) => { const parts = []; if (f.l || (!f.w && !f.c)) parts.push(k.l); if (f.w || (!f.l && !f.c)) parts.push(k.w); if (f.c || (!f.l && !f.w)) parts.push(k.c); return (parts.length === 1 ? String(parts[0]) : parts.map((v) => String(v).padStart(parts.length > 1 ? 3 : 0)).join(" ")) + (name ? " " + name : ""); };
      if (!rest.length) { const t = input ? input + "\n" : ""; return R(fmt(count(t))); }
      const outs = [], errs = [];
      rest.forEach((a) => { const r = readFile("wc", a, x.user); if (r.err) errs.push(r.err); else outs.push(fmt(count(r.text), a)); });
      return R(outs.join("\n"), errs.join("\n"));
    };
    C.file = (args, x) => R(args.map((a) => {
      const p = resolve(a), n = fs.get(p);
      if (!n) return `${a}: cannot open \`${a}' (No such file or directory)`;
      if (n.t === "d") return `${a}: directory`;
      const t = /\.jar$/.test(p) ? "Java archive data (JAR)" : /\.gz$/.test(p) ? "gzip compressed data" : /\.sh$/.test(p) || /^#!\/bin\/bash/.test(n.c) ? "Bourne-Again shell script, ASCII text executable" : /\.csv$/.test(p) ? "CSV ASCII text" : /[^\x00-\x7F]/.test(n.c) ? "Unicode text, UTF-8 text" : n.c ? "ASCII text" : "empty";
      return `${a}: ${t}`;
    }).join("\n"));
    C.mkdir = (args, x) => {
      const [f, rest] = opts(args);
      if (!rest.length) return R("", "mkdir: falta un operando");
      const errs = [];
      rest.forEach((a) => {
        const p = resolve(a);
        if (fs.has(p)) { if (!f.p) errs.push(`mkdir: no se puede crear el directorio «${a}»: El archivo ya existe`); return; }
        const chain = [];
        let q = p; while (!fs.has(q)) { chain.unshift(q); q = dirOf(q); }
        if (chain.length > 1 && !f.p) return errs.push(`mkdir: no se puede crear el directorio «${a}»: No existe el archivo o el directorio`);
        const parent = fs.get(q);
        if (parent.t !== "d") return errs.push(`mkdir: no se puede crear el directorio «${a}»: No es un directorio`);
        if (!can(parent, x.user, 2) || !reach(chain[0], x.user)) return errs.push(`mkdir: no se puede crear el directorio «${a}»: Permiso denegado`);
        chain.forEach((c) => fs.set(c, { t: "d", o: x.user, g: x.user === "root" ? "root" : x.user, m: 755, c: null, d: stamp() }));
      });
      return R("", errs.join("\n"));
    };
    C.touch = (args, x) => {
      if (!args.length) return R("", "touch: falta un operando de archivo");
      const errs = [];
      args.forEach((a) => {
        const p = resolve(a), n = fs.get(p);
        if (n) { if (!can(n, x.user, 2) && n.o !== x.user) errs.push(`touch: no se puede efectuar \`touch' sobre '${a}': Permiso denegado`); else n.d = stamp(); return; }
        const e = writeFile(p, "", false, x.user, a);
        if (e) errs.push(e.replace(`bash: ${a}:`, `touch: no se puede efectuar \`touch' sobre '${a}':`));
      });
      return R("", errs.join("\n"));
    };
    C.cp = (args, x) => {
      const [f, rest] = opts(args);
      if (rest.length < 2) return R("", rest.length ? `cp: falta el archivo de destino después de '${rest[0]}'` : "cp: falta un operando de archivo");
      const dstArg = rest.pop(), dst = resolve(dstArg), dn = fs.get(dst), errs = [];
      if (rest.length > 1 && (!dn || dn.t !== "d")) return R("", `cp: el destino '${dstArg}' no es un directorio`);
      rest.forEach((a) => {
        const s = resolve(a), sn = fs.get(s);
        if (!sn || !reach(s, x.user)) return errs.push(`cp: no se puede efectuar \`stat' sobre '${a}': ${sn ? "Permiso denegado" : "No existe el archivo o el directorio"}`);
        if (sn.t === "d" && !(f.r || f.R || f.a)) return errs.push(`cp: -r no especificado; se omite el directorio '${a}'`);
        if (!can(sn, x.user, 4)) return errs.push(`cp: no se puede abrir '${a}' para lectura: Permiso denegado`);
        const target = dn && dn.t === "d" ? join(dst, base(s)) : dst;
        if (target === s) return errs.push(`cp: '${a}' y '${dstArg}' son el mismo archivo`);
        const parent = fs.get(dirOf(target));
        if (!parent || parent.t !== "d") return errs.push(`cp: no se puede crear el fichero regular '${dstArg}': No existe el archivo o el directorio`);
        if (!can(parent, x.user, 2) || !reach(target, x.user)) return errs.push(`cp: no se puede crear el fichero regular '${dstArg}': Permiso denegado`);
        if (sn.t === "d") copyTree(s, target, x.user);
        else { const ex = fs.get(target); if (ex && ex.t === "f") { if (!can(ex, x.user, 2)) return errs.push(`cp: no se puede crear el fichero regular '${dstArg}': Permiso denegado`); ex.c = sn.c; ex.d = stamp(); } else fs.set(target, { t: "f", o: x.user, g: x.user === "root" ? "root" : x.user, m: sn.m % 1000, c: sn.c, d: stamp() }); }
      });
      return R("", errs.join("\n"));
    };
    C.mv = (args, x) => {
      const [, rest] = opts(args);
      if (rest.length < 2) return R("", rest.length ? `mv: falta el archivo de destino después de '${rest[0]}'` : "mv: falta un operando de archivo");
      const dstArg = rest.pop(), dst = resolve(dstArg), dn = fs.get(dst), errs = [];
      rest.forEach((a) => {
        const s = resolve(a), sn = fs.get(s);
        if (!sn) return errs.push(`mv: no se puede efectuar \`stat' sobre '${a}': No existe el archivo o el directorio`);
        const target = dn && dn.t === "d" ? join(dst, base(s)) : dst;
        if (target === s) return;
        if (target.startsWith(s + "/")) return errs.push(`mv: no se puede mover '${a}' a un subdirectorio de sí mismo`);
        const parent = fs.get(dirOf(target));
        if (!parent || parent.t !== "d") return errs.push(`mv: no se puede mover '${a}' a '${dstArg}': No existe el archivo o el directorio`);
        if (!mayDelete(s, x.user) || !can(parent, x.user, 2)) return errs.push(`mv: no se puede mover '${a}' a '${dstArg}': Permiso denegado`);
        if (fs.has(target)) { if (fs.get(target).t === "d") return errs.push(`mv: no se puede sobrescribir el directorio '${dstArg}'`); fs.delete(target); }
        moveTree(s, target);
        if (cwd === s || cwd.startsWith(s + "/")) cwd = target + cwd.slice(s.length);
      });
      return R("", errs.join("\n"));
    };
    C.rm = (args, x) => {
      const [f, rest] = opts(args);
      const rec = f.r || f.R || f.recursive;
      if (!rest.length) return R("", f.f ? "" : "rm: falta un operando");
      if (rec && rest.some((a) => resolve(a) === "/")) return R("", "rm: es peligroso operar recursivamente sobre '/'\nrm: use --no-preserve-root para inhibir esta medida de seguridad", 1, "Esta protección existe porque un rm -rf / borraría el servidor completo.");
      const errs = [];
      rest.forEach((a) => {
        const p = resolve(a), n = fs.get(p);
        if (!n) { if (!f.f) errs.push(`rm: no se puede borrar '${a}': No existe el archivo o el directorio`); return; }
        if (n.t === "d" && !rec) return errs.push(`rm: no se puede borrar '${a}': Es un directorio`);
        if (p === HOME || p === cwd || cwd.startsWith(p + "/")) return errs.push(`rm: no se puede borrar '${a}': en el simulador no se borra la carpeta donde estás ni tu carpeta personal`);
        if (!mayDelete(p, x.user)) return errs.push(`rm: no se puede borrar '${a}': Permiso denegado`);
        [...fs.keys()].forEach((k) => { if (k === p || k.startsWith(p + "/")) fs.delete(k); });
      });
      return R("", errs.join("\n"));
    };
    C.rmdir = (args, x) => {
      const errs = [];
      args.forEach((a) => {
        const p = resolve(a), n = fs.get(p);
        if (!n) return errs.push(`rmdir: no se pudo borrar '${a}': No existe el archivo o el directorio`);
        if (n.t !== "d") return errs.push(`rmdir: no se pudo borrar '${a}': No es un directorio`);
        if (children(p).length) return errs.push(`rmdir: no se pudo borrar '${a}': El directorio no está vacío`);
        if (!mayDelete(p, x.user)) return errs.push(`rmdir: no se pudo borrar '${a}': Permiso denegado`);
        fs.delete(p);
      });
      return R("", errs.join("\n"));
    };
    C.grep = (args, x, input) => {
      const [f, rest] = opts(args, "e");
      if (f.help) return R(manText("grep"));
      const pat = f.e || rest.shift();
      if (pat == null) return R("", "Modo de empleo: grep [OPCIÓN]... PATRONES [FICHERO]...\nPruebe 'grep --help' para más información.", 2);
      let re;
      const src = f.w ? `\\b(?:${pat})\\b` : pat;
      try { re = new RegExp(f.F ? pat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : src, f.i ? "i" : ""); } catch (e) { re = new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), f.i ? "i" : ""); }
      const sources = [], errs = [];
      if (f.r || f.R) {
        const roots = rest.length ? rest : ["."];
        roots.forEach((r0) => {
          const p0 = resolve(r0);
          const walk = (d, shown) => {
            const n = fs.get(d);
            if (!n) return errs.push(`grep: ${shown}: No existe el archivo o el directorio`);
            if (n.t === "f") { if (can(n, x.user, 4) && reach(d, x.user)) sources.push([shown, n.c]); else errs.push(`grep: ${shown}: Permiso denegado`); return; }
            if (!can(n, x.user, 4) || !can(n, x.user, 1)) return errs.push(`grep: ${shown}: Permiso denegado`);
            children(d).sort(sortNames).forEach((c) => walk(c, shown.replace(/\/$/, "") + "/" + base(c)));
          };
          walk(p0, r0);
        });
      } else if (rest.length) rest.forEach((a) => { const r = readFile("grep", a, x.user); if (r.err) errs.push(r.err); else sources.push([a, r.text]); });
      else sources.push(["(entrada estándar)", input || ""]);
      const multi = sources.length > 1 || f.r || f.R;
      const out = [];
      let any = false;
      sources.forEach(([name, text]) => {
        const hits = [];
        lines(text).forEach((l, i) => { if (re.test(l) !== !!f.v) hits.push(f.n ? `${i + 1}:${l}` : l); });
        if (hits.length) any = true;
        if (f.c) out.push((multi ? name + ":" : "") + hits.length);
        else if (f.l) { if (hits.length) out.push(name); }
        else hits.forEach((h) => out.push((multi ? name + ":" : "") + h));
      });
      return R(out.join("\n"), errs.join("\n"), errs.length ? 2 : any ? 0 : 1);
    };
    C.find = (args, x) => {
      const paths = [];
      let i = 0;
      while (i < args.length && !args[i].startsWith("-")) paths.push(args[i++]);
      if (!paths.length) paths.push(".");
      const tests = [];
      let maxd = Infinity;
      for (; i < args.length; i++) {
        const a = args[i], v = args[i + 1];
        if (a === "-name" || a === "-iname") { if (v == null) return R("", `find: falta el argumento de «${a}»`); const re = globRe(v, a === "-iname"); tests.push((p) => re.test(base(p) === "/" ? "/" : base(p))); i++; }
        else if (a === "-type") { tests.push((p) => fs.get(p).t === (v === "d" ? "d" : "f")); i++; }
        else if (a === "-user") { tests.push((p) => fs.get(p).o === v); i++; }
        else if (a === "-perm") { const want = parseInt(String(v).replace(/^[-\/]/, ""), 10); tests.push((p) => fs.get(p).m % 1000 === want); i++; }
        else if (a === "-maxdepth") { maxd = parseInt(v, 10); i++; }
        else return R("", `find: predicado desconocido «${a}»`);
      }
      const out = [], errs = [];
      paths.forEach((start) => {
        const p0 = resolve(start);
        if (!fs.has(p0)) return errs.push(`find: '${start}': No existe el archivo o el directorio`);
        const shownOf = (p) => (start === "/" ? p : (start.replace(/\/$/, "") + p.slice(p0.length)));
        const walk = (p, depth) => {
          if (tests.every((t) => t(p))) out.push(shownOf(p));
          const n = fs.get(p);
          if (n.t !== "d" || depth >= maxd) return;
          if (!can(n, x.user, 4) || !can(n, x.user, 1)) return errs.push(`find: '${shownOf(p)}': Permiso denegado`);
          children(p).sort(sortNames).forEach((c) => walk(c, depth + 1));
        };
        walk(p0, 0);
      });
      return R(out.join("\n"), errs.join("\n"));
    };
    const readInput = (cmd, rest, x, input) => {
      if (!rest.length) return { text: input || "" };
      const r = readFile(cmd, rest[0], x.user);
      return r.err ? { err: r.err } : { text: r.text };
    };
    C.sort = (args, x, input) => {
      const [f, rest] = opts(args, "kt");
      const r = readInput("sort", rest, x, input); if (r.err) return R("", r.err, 2);
      let ls = lines(r.text);
      const key = (l) => { if (!f.k) return l; const k = parseInt(f.k, 10); const parts = f.t ? l.split(f.t) : l.trim().split(/\s+/); return parts.slice(k - 1).join(" "); };
      const num = (s) => { const m = /^\s*(-?\d+(?:[.,]\d+)?)/.exec(s); return m ? parseFloat(m[1].replace(",", ".")) : 0; };
      ls.sort((a, b) => { const A = key(a), B = key(b); if (f.n) return num(A) - num(B) || (A < B ? -1 : A > B ? 1 : 0); const a2 = A.toLowerCase(), b2 = B.toLowerCase(); return a2 < b2 ? -1 : a2 > b2 ? 1 : 0; });
      if (f.r) ls.reverse();
      if (f.u) ls = ls.filter((l, i) => i === 0 || l !== ls[i - 1]);
      return R(ls.join("\n"));
    };
    C.uniq = (args, x, input) => {
      const [f, rest] = opts(args);
      const r = readInput("uniq", rest, x, input); if (r.err) return R("", r.err);
      const groups = [];
      lines(r.text).forEach((l) => { const g = groups[groups.length - 1]; if (g && g[0] === l) g[1]++; else groups.push([l, 1]); });
      const sel = groups.filter(([, n]) => (f.d ? n > 1 : f.u ? n === 1 : true));
      return R(sel.map(([l, n]) => (f.c ? String(n).padStart(7) + " " + l : l)).join("\n"));
    };
    C.cut = (args, x, input) => {
      const [f, rest] = opts(args, "dfc");
      if (!f.f && !f.c) return R("", "cut: debe especificar una lista de bytes, caracteres o campos");
      const r = readInput("cut", rest, x, input); if (r.err) return R("", r.err);
      const pick = (spec, n) => { const set = []; String(spec).split(",").forEach((part) => { const m = /^(\d*)-(\d*)$/.exec(part); if (m) { const a = +(m[1] || 1), b = +(m[2] || n); for (let i = a; i <= b; i++) set.push(i); } else set.push(+part); }); return set; };
      const d = f.d == null ? "\t" : f.d === "" ? " " : f.d;
      return R(lines(r.text).map((l) => {
        if (f.c) { const cs = [...l]; return pick(f.c, cs.length).map((i) => cs[i - 1] || "").join(""); }
        const parts = l.split(d);
        if (parts.length === 1) return l;
        return pick(f.f, parts.length).map((i) => parts[i - 1]).filter((v) => v !== undefined).join(d);
      }).join("\n"));
    };
    C.awk = (args, x, input) => {
      const [f, rest] = opts(args, "F");
      const prog = rest.shift();
      if (!prog) return R("", "uso: awk [-F sep] 'programa' [archivo]");
      const m = /^\s*(?:\/(.*?)\/\s*)?(?:\{\s*print\s*(.*?)\s*;?\s*\})?\s*$/.exec(prog);
      if (!m || (!m[1] && m[2] == null)) return R("", `awk: línea de órdenes:1: ${prog}\nawk: línea de órdenes:1: ^ error sintáctico`, 2, "El simulador entiende awk '{print $N}', con varias columnas separadas por comas, y '/texto/ {print $N}'.");
      const r = readInput("awk", rest, x, input); if (r.err) return R("", r.err.replace(/^awk: (.*?): /, "awk: no se puede abrir el fichero $1 para lectura: "), 2);
      let filter = null;
      if (m[1]) { try { filter = new RegExp(m[1]); } catch (e) { return R("", "awk: expresión regular no válida", 2); } }
      const exprs = (m[2] == null ? "$0" : m[2] || "$0").split(",").map((s) => s.trim());
      const out = [];
      lines(r.text).forEach((l) => {
        if (filter && !filter.test(l)) return;
        const fields = f.F != null ? l.split(f.F === "\\t" ? "\t" : f.F) : l.trim().split(/\s+/);
        const val = (e) => e.split(/\s+/).map((tok) => {
          if (tok === "$0") return l;
          if (tok === "$NF") return fields[fields.length - 1];
          const fm = /^\$(\d+)$/.exec(tok); if (fm) return fields[+fm[1] - 1] || "";
          const sm = /^"(.*)"$/.exec(tok); if (sm) return sm[1];
          return "";
        }).join("");
        out.push(exprs.map(val).join(" "));
      });
      return R(out.join("\n"));
    };
    C.id = (args, x) => {
      const u = args[0] || x.user;
      if (u === "root") return R("uid=0(root) gid=0(root) grupos=0(root)");
      if (u === "analista") return R("uid=1000(analista) gid=1000(analista) grupos=1000(analista),4(adm),27(sudo),1003(soc)");
      if (u === "lrojas") return R("uid=1001(lrojas) gid=1001(lrojas) grupos=1001(lrojas),27(sudo),1003(soc)");
      if (USERS.includes(u)) return R(`uid=${GID[u] || 100}(${u}) gid=${GID[u] || 100}(${u}) grupos=${GID[u] || 100}(${u})`);
      return R("", `id: '${u}': no existe ese usuario`);
    };
    C.groups = (a, x) => R((GROUPS[x.user] || [x.user]).join(" "));
    C.su = () => R("", "su: Fallo de autenticación", 1, "En el simulador no se abre una sesión de root: escribe sudo delante del comando que lo necesite. Es la buena práctica.");
    C.chmod = (args, x) => {
      const [f, rest] = opts(args.map((a) => (/^[ugoa]*[+\-=][rwx]+$/.test(a) && a.startsWith("-") ? "\u0000" + a : a)));
      const list = rest.map((a) => a.replace(/^\u0000/, ""));
      if (list.length < 2) return R("", list.length ? `chmod: falta un operando después de «${list[0]}»` : "chmod: falta un operando");
      const mode = list.shift(), errs = [];
      const apply = (n) => {
        if (/^[0-7]{3,4}$/.test(mode)) { n.m = parseInt(mode, 10); return true; }
        const digits = [Math.floor(n.m % 1000 / 100), Math.floor(n.m % 100 / 10), n.m % 10];
        const ok = mode.split(",").every((part) => {
          const mm = /^([ugoa]*)([+\-=])([rwx]+)$/.exec(part); if (!mm) return false;
          const who = mm[1] === "" || mm[1].includes("a") ? "ugo" : mm[1];
          const bits = [...mm[3]].reduce((s, c) => s + ({ r: 4, w: 2, x: 1 })[c], 0);
          [..."ugo"].forEach((w, i) => { if (!who.includes(w)) return; if (mm[2] === "+") digits[i] |= bits; else if (mm[2] === "-") digits[i] &= ~bits; else digits[i] = bits; });
          return true;
        });
        if (!ok) return false;
        n.m = (n.m >= 1000 ? 1000 : 0) + digits[0] * 100 + digits[1] * 10 + digits[2];
        return true;
      };
      for (const a of list) {
        const p = resolve(a), n = fs.get(p);
        if (!n || !reach(p, x.user)) { errs.push(`chmod: no se puede acceder a '${a}': ${n ? "Permiso denegado" : "No existe el archivo o el directorio"}`); continue; }
        if (x.user !== "root" && n.o !== x.user) { errs.push(`chmod: cambiando los permisos de '${a}': Operación no permitida`); continue; }
        const targets = f.R && n.t === "d" ? [...fs.keys()].filter((k) => k === p || k.startsWith(p + "/")) : [p];
        if (!targets.every((t) => apply(fs.get(t)))) return R("", `chmod: modo inválido: «${mode}»`);
      }
      return R("", errs.join("\n"));
    };
    C.chown = (args, x) => {
      const [f, rest] = opts(args);
      if (rest.length < 2) return R("", "chown: falta un operando");
      const [spec, ...files] = rest;
      const [u, g] = spec.split(":");
      if (u && !USERS.includes(u)) return R("", `chown: usuario incorrecto: «${spec}»`);
      const errs = [];
      files.forEach((a) => {
        const p = resolve(a), n = fs.get(p);
        if (!n) return errs.push(`chown: no se puede acceder a '${a}': No existe el archivo o el directorio`);
        if (x.user !== "root") return errs.push(`chown: cambiando el propietario de '${a}': Operación no permitida`);
        const targets = f.R && n.t === "d" ? [...fs.keys()].filter((k) => k === p || k.startsWith(p + "/")) : [p];
        targets.forEach((t) => { const nn = fs.get(t); if (u) nn.o = u; if (g) nn.g = g; });
      });
      return R("", errs.join("\n"));
    };
    const vsz = (pid) => 167652 - (pid * 7919) % 90000;
    C.ps = (args, x) => {
      const a = args.join(" ");
      const mine = { pid: nextPid++, cmd: "ps " + a };
      if (!/a|e/.test(a)) return R(`    PID TTY          TIME CMD\n   4021 pts/0    00:00:00 bash\n   ${mine.pid} pts/0    00:00:00 ps`);
      const rows = procs.concat([["analista", mine.pid, "0.0", "0.0", "pts/0", "R+", clock().slice(0, 5), "0:00", mine.cmd.trim()]]);
      return R("USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\n" + rows.map((p) => `${p[0].padEnd(10)} ${String(p[1]).padStart(5)} ${p[2].padStart(4)} ${p[3].padStart(4)} ${String(vsz(p[1])).padStart(6)} ${String(Math.round(vsz(p[1]) / 14)).padStart(5)} ${p[4].padEnd(8)} ${p[5].padEnd(4)} ${p[6].padStart(5)} ${p[7].padStart(6)} ${p[8]}`).join("\n"));
    };
    const load = () => (procs.some((p) => p[1] === 3150) ? "0,72, 0,65, 0,60" : "0,08, 0,31, 0,52");
    C.uptime = () => R(` ${clock()} up 14:29,  2 users,  load average: ${load()}`);
    C.top = () => {
      const rows = procs.slice().sort((a, b) => parseFloat(b[2]) - parseFloat(a[2]));
      const cpu = rows.reduce((s, p) => s + parseFloat(p[2]), 0);
      return R(`top - ${clock()} up 14:29,  2 users,  load average: ${load()}\nTareas: ${procs.length + 112} total,   1 ejecutar, ${procs.length + 111} hibernar,   0 detener,   0 zombie\n%Cpu(s): ${(cpu / 2).toFixed(1).replace(".", ",")} us,  0,9 sy,  0,0 ni, ${(100 - cpu / 2 - 0.9).toFixed(1).replace(".", ",")} id\nMiB Mem :   3896,2 total,   1210,4 libre,   1288,6 usado,   1397,2 búf/caché\n\n    PID USUARIO   %CPU %MEM COMMAND\n` + rows.map((p) => `${String(p[1]).padStart(7)} ${p[0].padEnd(9)} ${p[2].padStart(5)} ${p[3].padStart(4)} ${p[8].split(" ")[0].replace(/:$/, "").split("/").pop()}`).join("\n"), "", 0, "top se actualiza en vivo cada pocos segundos. En un servidor real sales con q.");
    };
    C.kill = (args, x) => {
      const pids = args.filter((a) => !a.startsWith("-"));
      if (!pids.length) return R("", "kill: uso: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... o kill -l [sigspec]");
      const errs = [], notes = [];
      pids.forEach((a) => {
        const pid = parseInt(a, 10), i = procs.findIndex((p) => p[1] === pid);
        if (isNaN(pid)) return errs.push(`bash: kill: ${a}: los argumentos deben ser IDs de procesos o de trabajos`);
        if (i < 0) return errs.push(`bash: kill: (${pid}) - No existe el proceso`);
        if (x.user !== "root" && procs[i][0] !== x.user) return errs.push(`bash: kill: (${pid}) - Operación no permitida`);
        if (CRITICAL[pid]) { notes.push(`El simulador no deja detener el proceso ${pid}: es ${CRITICAL[pid]}. En un servidor real lo habrías detenido, con consecuencias.`); return; }
        if (pid === 4021) { notes.push("Ese es tu propia terminal (bash): si la detienes, te desconectas."); return; }
        procs.splice(i, 1);
      });
      return R("", errs.join("\n"), errs.length ? 1 : 0, notes.join("\n"));
    };
    const SVC = { nginx: ["nginx.service - A high performance web server and a reverse proxy server", 880, "lun 2026-09-29 08:05:31 -05", "nginx: master process /usr/sbin/nginx"], ssh: ["ssh.service - OpenBSD Secure Shell server", 612, "dom 2026-09-28 18:02:10 -05", "sshd: /usr/sbin/sshd -D"], cron: ["cron.service - Regular background program processing daemon", 905, "dom 2026-09-28 18:02:09 -05", "/usr/sbin/cron -f"], postgresql: ["postgresql.service - PostgreSQL RDBMS", 760, "dom 2026-09-28 18:02:12 -05", "/usr/lib/postgresql/16/bin/postgres"], rsyslog: ["rsyslog.service - System Logging Service", 540, "dom 2026-09-28 18:02:08 -05", "/usr/sbin/rsyslogd -n"] };
    C.systemctl = (args, x) => {
      const [, rest] = opts(args);
      const [verb, svc0] = rest;
      const svc = (svc0 || "").replace(/\.service$/, "").replace(/^sshd$/, "ssh");
      if (!verb) return R("", "", 0, "Usa systemctl status SERVICIO (por ejemplo: systemctl status nginx).");
      if (!svc0) return R("", `Too few arguments.`);
      if (!SVC[svc]) return R("", `Unit ${svc0}.service could not be found.`, 4);
      const s = SVC[svc];
      if (verb === "status") {
        const on = services[svc] === "active";
        return R(`● ${s[0]}\n     Loaded: loaded (/usr/lib/systemd/system/${svc}.service; enabled; preset: enabled)\n     Active: ${on ? `active (running) since ${s[2]}` : "inactive (dead)"}\n` + (on ? `   Main PID: ${s[1]} (${svc === "ssh" ? "sshd" : svc})\n     CGroup: /system.slice/${svc}.service\n             └─${s[1]} "${s[3]}"` : ""), "", on ? 0 : 3);
      }
      if (verb === "is-active") return R(services[svc], "", services[svc] === "active" ? 0 : 3);
      if (["start", "stop", "restart", "reload"].includes(verb)) {
        if (x.user !== "root") return R("", `Failed to ${verb} ${svc}.service: Interactive authentication required.\nSee system logs and 'systemctl status ${svc}.service' for details.`, 1, "Arrancar o detener servicios requiere sudo.");
        if (verb === "stop") { if (svc === "ssh") return R("", "", 1, "El simulador no deja detener SSH: te dejaría sin acceso al servidor."); services[svc] = "inactive"; return R("", "", 0, `Detuviste ${svc}. Si es la web, el banco quedó sin banca en línea: arráncalo con sudo systemctl start ${svc}.`); }
        services[svc] = "active";
        return R("");
      }
      return R("", `Unknown command verb ${verb}.`);
    };
    C.ss = (args, x) => {
      const fl = args.join("");
      const rows = LX_PORTS.filter((p) => (p[2] === 0 || procs.some((q) => q[1] === p[2])) && (/[tu]/.test(fl) ? (/t/.test(fl) && p[0] === "tcp") || (/u/.test(fl) && p[0] === "udp") : true));
      const show = /p/.test(fl);
      const head = "Netid State  Recv-Q Send-Q  Local Address:Port   Peer Address:Port Process";
      const body = rows.map((p) => `${p[0].padEnd(5)} ${(p[0] === "tcp" ? "LISTEN" : "UNCONN").padEnd(6)} 0      ${p[0] === "tcp" ? "511" : "0  "}    ${p[1].padStart(18)}   ${(p[0] === "tcp" ? "0.0.0.0:*" : "0.0.0.0:*").padStart(17)} ${show && x.user === "root" ? `users:(("${p[3]}",pid=${p[2] || 520},fd=${p[0] === "tcp" ? 6 : 13}))` : ""}`);
      return R([head].concat(body).join("\n"), "", 0, show && x.user !== "root" ? "Sin sudo no ves qué programa usa cada puerto: esa columna solo la ve root." : "");
    };
    const notFoundPkg = (c, pkg) => R("", `No se ha encontrado la orden «${c}», pero se puede instalar con:\nsudo apt install ${pkg}`, 127, c === "ifconfig" ? "ifconfig es el comando antiguo; hoy se usa ip a." : "netstat es el comando antiguo; hoy se usa ss -tulpn.");
    C.netstat = () => notFoundPkg("netstat", "net-tools");
    C.ifconfig = () => notFoundPkg("ifconfig", "net-tools");
    C.ip = (args) => {
      const v = args[0] || "";
      if (/^a/.test(v)) return R("1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n    inet 127.0.0.1/8 scope host lo\n2: ens33: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000\n    link/ether 00:0c:29:4a:7e:21 brd ff:ff:ff:ff:ff:ff\n    inet 10.20.3.15/24 brd 10.20.3.255 scope global ens33");
      if (/^r/.test(v)) return R("default via 10.20.3.1 dev ens33 proto static\n10.20.3.0/24 dev ens33 proto kernel scope link src 10.20.3.15");
      return R("", "Usage: ip [ OPTIONS ] OBJECT { COMMAND | help }", 1, "Prueba ip a (direcciones) o ip route (rutas).");
    };
    const HOSTS = { localhost: "127.0.0.1", "127.0.0.1": "127.0.0.1", "srv-db01": "10.20.8.5", "10.20.8.5": "10.20.8.5", "10.20.3.1": "10.20.3.1", "srv-web01": "10.20.3.15", "10.20.3.15": "10.20.3.15" };
    C.ping = (args) => {
      const [f, rest] = opts(args, "c");
      const host = rest[0];
      if (!host) return R("", "ping: dirección de destino requerida");
      const n = Math.min(10, parseInt(f.c || "4", 10) || 4);
      const ip = HOSTS[host] || (/^\d+\.\d+\.\d+\.\d+$/.test(host) ? host : null);
      if (!ip) return R("", `ping: ${host}: Nombre o servicio desconocido`, 2);
      const ok = !!HOSTS[host];
      const rows = [`PING ${host} (${ip}) 56(84) bytes of data.`];
      if (ok) for (let i = 1; i <= n; i++) rows.push(`64 bytes from ${ip}: icmp_seq=${i} ttl=64 time=${(0.3 + ((i * 37) % 10) / 20).toFixed(3)} ms`);
      rows.push("", `--- ${host} ping statistics ---`, `${n} packets transmitted, ${ok ? n : 0} received, ${ok ? 0 : 100}% packet loss, time ${(n - 1) * 1001}ms`);
      return R(rows.join("\n"), "", ok ? 0 : 1, f.c ? (ok ? "" : "Nadie respondió: ese equipo no existe en esta red simulada o no está encendido.") : "En Linux, ping sigue para siempre hasta que lo cortas con Ctrl+C. Por eso se usa -c (por ejemplo, ping -c 3).");
    };
    C.df = (args) => {
      const h = args.some((a) => /h/.test(a));
      return R(h ? "S.ficheros     Tamaño Usados  Disp Uso% Montado en\ntmpfs            390M   1,2M  389M   1% /run\n/dev/sda2         40G    16G   22G  41% /\ntmpfs            1,9G      0  1,9G   0% /dev/shm\n/dev/sdb1         98G    61G   33G  65% /srv"
        : "S.ficheros     1K-bloques    Usados Disponibles Uso% Montado en\ntmpfs              398960      1212      397748   1% /run\n/dev/sda2        40972512  16234880    22621152  41% /\ntmpfs             1994796         0     1994796   0% /dev/shm\n/dev/sdb1       102626232  63110432    34253216  65% /srv");
    };
    C.free = (args) => R(args.some((a) => /h/.test(a)) ? "               total       usado       libre  compartido   búf/caché  disponible\nMem:           3,8Gi       1,3Gi       1,2Gi        12Mi       1,4Gi       2,5Gi\nInter:         2,0Gi          0B       2,0Gi" : "               total       usado       libre  compartido   búf/caché  disponible\nMem:         3989708     1319536     1239580       12440     1430592     2670172\nInter:       2097148           0     2097148");
    C.uname = (args) => R(args.includes("-a") ? "Linux srv-web01 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC Fri Aug 30 12:02:04 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux" : args.includes("-r") ? "6.8.0-45-generic" : "Linux");
    C.who = () => R("lrojas   pts/1        2026-09-29 08:11 (10.20.5.14)\nanalista pts/0        2026-09-29 08:02 (10.20.5.21)");
    C.w = C.who;
    C.last = () => R("analista pts/0        10.20.5.21       Mon Sep 29 08:02   still logged in\nlrojas   pts/1        10.20.5.14       Mon Sep 29 08:11   still logged in\nlrojas   pts/1        10.20.5.14       Mon Sep 29 07:58 - 08:10  (00:12)\n\nwtmp begins Mon Sep  1 00:00:01 2026");
    C.which = (args) => { const out = args.filter((a) => C[a] && !["ll", "help", "cd", "history"].includes(a)).map((a) => (["ip", "ss", "chown", "kill"].includes(a) ? "/usr/sbin/" : "/usr/bin/") + a); return R(out.join("\n"), "", out.length ? 0 : 1); };
    C.sha256sum = (args, x, input) => {
      if (!args.length) return R(sha256((input || "") + (input ? "\n" : "")) + "  -");
      const outs = [], errs = [];
      args.forEach((a) => { const r = readFile("sha256sum", a, x.user); if (r.err) errs.push(r.err); else outs.push(`${sha256(r.text)}  ${a}`); });
      return R(outs.join("\n"), errs.join("\n"));
    };
    const editor = (c) => () => R("", "", 1, `${c} es un editor de texto de pantalla completa: en un servidor real lo usarías para editar archivos. En el simulador no está; para escribir usa echo "texto" > archivo (o >> para agregar).`);
    C.nano = editor("nano"); C.vi = editor("vi"); C.vim = editor("vim");
    C.apt = (args, x) => {
      if (x.user !== "root") return R("", "E: No se pudo abrir el fichero de bloqueo /var/lib/dpkg/lock-frontend - open (13: Permiso denegado)\nE: No se pudo obtener el bloqueo de la interfaz de dpkg (/var/lib/dpkg/lock-frontend). ¿Es usted superusuario?", 100, "Instalar o actualizar programas requiere sudo.");
      if (args[0] === "update") return R("Obj:1 http://archive.ubuntu.com/ubuntu noble InRelease\nObj:2 http://security.ubuntu.com/ubuntu noble-security InRelease\nLeyendo lista de paquetes... Hecho\nSe pueden actualizar 3 paquetes. Ejecute «apt list --upgradable» para verlos.");
      return R("", "", 0, "En el simulador no se instalan ni actualizan programas.");
    };
    C.exit = () => R("", "", 0, "En el simulador no hace falta salir. En un servidor real, exit cierra tu sesión SSH.");
    C.logout = C.exit;

    /* ——— Analizador: comillas, operadores, variables y comodines ——— */
    function tokenize(line) {
      const toks = [];
      let cur = null, i = 0;
      const push = () => { if (cur) toks.push(cur); cur = null; };
      const word = () => (cur = cur || { w: "", q: false, sq: false });
      while (i < line.length) {
        const ch = line[i];
        if (ch === "'") { const j = line.indexOf("'", i + 1); if (j < 0) return { err: "bash: error sintáctico: falta cerrar una comilla simple (')" }; word().w += line.slice(i + 1, j); cur.q = cur.sq = true; i = j + 1; continue; }
        if (ch === '"') { let j = i + 1, s = ""; while (j < line.length && line[j] !== '"') { if (line[j] === "\\" && /["\\$]/.test(line[j + 1] || "")) { s += line[j + 1]; j += 2; } else s += line[j++]; } if (j >= line.length) return { err: 'bash: error sintáctico: falta cerrar una comilla doble (")' }; word().w += expandVars(s); cur.q = true; i = j + 1; continue; }
        if (ch === "\\") { word().w += line[i + 1] || ""; cur.q = true; i += 2; continue; }
        if (/\s/.test(ch)) { push(); i++; continue; }
        if (ch === "|" || ch === ";" || ch === "&" || ch === ">" || ch === "<") {
          if (ch === ">" && cur && cur.w === "2" && !cur.q) { cur = null; const app = line[i + 1] === ">"; toks.push({ op: app ? "2>>" : "2>" }); i += app ? 2 : 1; continue; }
          push();
          const two = line.slice(i, i + 2);
          if (two === "&&" || two === "||" || two === ">>") { toks.push({ op: two }); i += 2; continue; }
          if (ch === "&") { if (line[i + 1] === ">") { toks.push({ op: "&>" }); i += 2; continue; } return { err: "", note: "El simulador no ejecuta procesos en segundo plano (&)." }; }
          toks.push({ op: ch }); i++; continue;
        }
        word().w += ch; i++;
      }
      push();
      return { toks };
    }
    function expandVars(s) { return s.replace(/\$(HOME|USER|PWD|HOSTNAME)\b|\$\{(HOME|USER|PWD|HOSTNAME)\}/g, (_, a, b) => ({ HOME, USER: "analista", PWD: cwd, HOSTNAME: HOST })[a || b]); }
    function expandWord(t) {
      if (t.q) return [t.w];
      let w = expandVars(t.w);
      if (w === "~" || w.startsWith("~/")) w = HOME + w.slice(1);
      if (/[*?]/.test(w)) {
        const abs = w.startsWith("/"), dirPart = w.includes("/") ? w.slice(0, w.lastIndexOf("/")) || "/" : "", pat = w.slice(w.lastIndexOf("/") + 1);
        if (!/[*?]/.test(dirPart)) {
          const d = resolve(dirPart || "."), n = fs.get(d);
          if (n && n.t === "d") {
            const re = globRe(pat);
            const hits = children(d).map(base).filter((nm) => re.test(nm) && (pat.startsWith(".") || !nm.startsWith("."))).sort((a, b) => sortNames("/" + a, "/" + b));
            if (hits.length) return hits.map((nm) => (dirPart ? (dirPart === "/" ? "/" : dirPart + "/") + nm : nm)).map((s) => (abs || dirPart ? s : s));
          }
        }
      }
      return [w];
    }
    function parse(line) {
      const t = tokenize(line);
      if (t.err != null) return t;
      const seqs = [];
      let cmds = [], cmd = { argv: [], redir: [] }, join = null;
      const endCmd = () => { if (!cmd.argv.length && !cmd.redir.length) return false; cmds.push(cmd); cmd = { argv: [], redir: [] }; return true; };
      for (let i = 0; i < t.toks.length; i++) {
        const k = t.toks[i];
        if (k.op === "|") { if (!endCmd()) return { err: "bash: error sintáctico cerca del elemento inesperado `|'" }; continue; }
        if (k.op === ";" || k.op === "&&" || k.op === "||") { if (!endCmd() && !cmds.length) return { err: `bash: error sintáctico cerca del elemento inesperado \`${k.op}'` }; seqs.push({ cmds, join }); cmds = []; join = k.op; continue; }
        if (k.op && /^(>|>>|2>|2>>|&>|<)$/.test(k.op)) {
          const target = t.toks[i + 1];
          if (!target || target.op) return { err: "bash: error sintáctico cerca del elemento inesperado `newline'" };
          cmd.redir.push({ op: k.op, file: expandWord(target)[0] }); i++; continue;
        }
        cmd.argv.push(...expandWord(k));
      }
      endCmd();
      if (cmds.length) seqs.push({ cmds, join });
      return { seqs };
    }

    /* ——— Ejecutar una línea ——— */
    const sudoLog = (argv) => {
      const n = fs.get("/var/log/auth.log");
      const bin = (["ip", "ss", "chown", "kill"].includes(argv[0]) ? "/usr/sbin/" : "/usr/bin/") + argv[0];
      if (n) n.c += `Sep 29 ${clock()} ${HOST} sudo: analista : TTY=pts/0 ; PWD=${cwd} ; USER=root ; COMMAND=${bin}${argv.length > 1 ? " " + argv.slice(1).join(" ") : ""}\n`;
    };
    function runOne(argv, input, ctx) {
      let user = "analista";
      const notes = [];
      if (argv[0] === "sudo") {
        argv = argv.slice(1);
        while (argv[0] && argv[0].startsWith("-")) { if (argv[0] === "-i" || argv[0] === "-s") return R("", "", 0, "En el simulador no se abre una sesión de root: escribe sudo delante de cada comando. Es la buena práctica, porque cada acción queda registrada."); argv = argv.slice(1); }
        if (!argv.length) return R("", "uso: sudo -h | -K | -k | -V\nuso: sudo [-AbEHknPS] [-u usuario] [comando [arg ...]]");
        if (argv[0] === "su" || argv[0] === "bash") return R("", "", 0, "En el simulador no se abre una sesión de root: escribe sudo delante de cada comando. Es la buena práctica, porque cada acción queda registrada.");
        user = "root";
        if (!sudoNoted) { sudoNoted = true; notes.push("[sudo] En un servidor real aquí te pediría tu contraseña. Tu uso de sudo queda registrado en /var/log/auth.log."); }
        if (C[argv[0]]) sudoLog(argv);
      }
      const c = argv[0];
      ctx.cmds.push(c);
      if (c === "clear") return Object.assign(R(""), { clear: true });
      const fn = C[c];
      if (!fn) {
        const near = COMMANDS.filter((k) => lev(k, c) === 1)[0];
        return R("", `${c}: orden no encontrada`, 127, near ? `¿Quisiste decir ${near}?` : "Escribe help para ver los comandos del simulador.");
      }
      if (argv.includes("--help") && MAN[c] && c !== "ls" && c !== "cat" && c !== "grep") return R(manText(c));
      const r = fn(argv.slice(1), { user }, input);
      if (notes.length) r.note = notes.concat(r.note ? [r.note] : []).join("\n");
      return r;
    }
    function run(raw) {
      const line = normalize(raw).trim();
      const ctx = { cmds: [] };
      if (!line) return { out: "", err: "", note: "", cmds: [], line };
      if (hist[hist.length - 1] !== line) hist.push(line);
      const parsed = parse(line);
      if (parsed.err != null) return { out: "", err: parsed.err, note: parsed.note || "", cmds: [], line };
      const outs = [], errs = [], notes = [];
      let code = 0, clear = false;
      for (const seq of parsed.seqs) {
        if (seq.join === "&&" && code !== 0) continue;
        if (seq.join === "||" && code === 0) continue;
        let input = null, res = null;
        for (let i = 0; i < seq.cmds.length; i++) {
          const cm = seq.cmds[i];
          const inR = cm.redir.find((r) => r.op === "<");
          if (inR) { const r = readFile("bash", inR.file, "analista"); if (r.err) { errs.push(r.err.replace(/^bash: /, "bash: ")); res = R("", "", 1); break; } input = strip(r.text); }
          res = cm.argv.length ? runOne(cm.argv, input, ctx) : R("");
          if (res.clear) { clear = true; outs.length = 0; }
          let out = res.out;
          let errShown = res.err;
          cm.redir.forEach((r) => {
            if (r.op === "2>" || r.op === "2>>") { if (r.file !== "/dev/null") { const e = writeFile(resolve(r.file), res.err ? res.err + "\n" : "", r.op === "2>>", "analista", r.file); if (e) errs.push(e); } errShown = ""; }
            if (r.op === ">" || r.op === ">>" || r.op === "&>") { const text = (out ? out + "\n" : "") + (r.op === "&>" && res.err ? res.err + "\n" : ""); const e = writeFile(resolve(r.file), text, r.op === ">>", "analista", r.file); if (e) errs.push(e); out = ""; if (r.op === "&>") errShown = ""; }
          });
          if (errShown) errs.push(errShown);
          if (res.note) notes.push(res.note);
          input = out;
          if (i === seq.cmds.length - 1 && out) outs.push(out);
        }
        code = res ? res.code : 0;
      }
      return { out: outs.join("\n"), err: errs.join("\n"), note: [...new Set(notes)].join("\n"), cmds: ctx.cmds, line, clear };
    }

    /* ——— Autocompletar con Tab ——— */
    function complete(line) {
      const m = /^(.*?)(\S*)$/.exec(line);
      const head = m[1], word = m[2];
      const first = !/\S/.test(head.replace(/(sudo\s+)$/, "")) || /[|;&]\s*(sudo\s+)?$/.test(head);
      let options;
      if (first) options = COMMANDS.filter((c) => c.startsWith(word)).map((c) => c + " ");
      else {
        const w = word.startsWith("~") ? HOME + word.slice(1) : word;
        const slash = w.lastIndexOf("/");
        const dirTyped = slash >= 0 ? w.slice(0, slash + 1) : "", pre = w.slice(slash + 1);
        const d = resolve(dirTyped || "."), n = fs.get(d);
        if (!n || n.t !== "d" || !can(n, "analista", 4)) return { line, options: [] };
        options = children(d).map(base).filter((nm) => nm.startsWith(pre) && (pre.startsWith(".") || !nm.startsWith("."))).sort()
          .map((nm) => (word.startsWith("~") ? "~" + (dirTyped.slice(HOME.length) || "/") : dirTyped) + nm + (fs.get(join(d, nm)).t === "d" ? "/" : " "));
        options = options.map((o) => o.replace(/^~\/\//, "~/"));
      }
      if (!options.length) return { line, options: [] };
      if (options.length === 1) return { line: head + options[0], options: [] };
      let common = options[0];
      options.forEach((o) => { while (!o.startsWith(common)) common = common.slice(0, -1); });
      return { line: head + (common.length > word.length ? common : word), options: options.map((o) => o.trim().split("/").filter(Boolean).pop() + (o.endsWith("/") ? "/" : "")) };
    }

    const promptPath = () => (cwd === HOME ? "~" : cwd.startsWith(HOME + "/") ? "~" + cwd.slice(HOME.length) : cwd);
    return {
      run, complete, history: hist,
      get cwd() { return cwd; },
      promptPath,
      exists: (p) => fs.has(p),
      isDir: (p) => !!fs.get(p) && fs.get(p).t === "d",
      isFile: (p) => !!fs.get(p) && fs.get(p).t === "f",
      read: (p) => (fs.get(p) && fs.get(p).t === "f" ? fs.get(p).c : null),
      mode: (p) => (fs.get(p) ? fs.get(p).m : null),
      get procs() { return procs; },
    };
  }

  /* ——— La ventana de terminal ——— */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  function mount(root, opt) {
    const o = opt || {};
    const sh = o.sh || create();
    root.innerHTML = `<div class="lx-term">
      <div class="term-bar"><i></i><i></i><i></i><span>analista@srv-web01 · servidor de práctica</span></div>
      <div class="lx-scr" role="log" aria-live="polite" aria-label="Salida de la terminal"></div>
      <form class="lx-line" autocomplete="off"><label class="lx-ps mono" for="lx-in"></label>
        <input id="lx-in" class="mono" type="text" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="send" aria-label="Escribe un comando"><button type="submit" class="lx-send" aria-label="Ejecutar el comando">⏎</button></form>
    </div>
    <div class="lx-keys" aria-label="Teclas rápidas">${["Tab", "↑", "|", "-", "/", "~", ".", "*", '"', ">"].map((k) => `<button type="button" data-k="${esc(k)}">${esc(k)}</button>`).join("")}</div>`;
    const scr = root.querySelector(".lx-scr"), form = root.querySelector(".lx-line"), inp = root.querySelector("#lx-in"), ps = root.querySelector(".lx-ps");
    const psHtml = () => `<span class="u">analista@srv-web01</span>:<span class="d">${esc(sh.promptPath())}</span>$`;
    const setPs = () => { ps.innerHTML = psHtml(); };
    const print = (cls, text) => { if (text === "" || text == null) return; const p = document.createElement("pre"); p.className = cls; p.textContent = text; scr.appendChild(p); };
    const scroll = () => { scr.scrollTop = scr.scrollHeight; };
    if (o.intro) print("lx-note", o.intro);
    setPs();
    let hi = null;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const raw = inp.value;
      inp.value = ""; hi = null;
      const line = document.createElement("pre");
      line.className = "lx-cmd";
      line.innerHTML = psHtml() + " " + esc(normalize(raw));
      scr.appendChild(line);
      const r = sh.run(raw);
      if (r.clear) scr.innerHTML = "";
      print("lx-out", r.out); print("lx-err", r.err); print("lx-note", r.note);
      setPs(); scroll();
      if (o.onRun && r.line) o.onRun({ cmd: r.line, cmds: r.cmds, out: [r.out, r.err].filter(Boolean).join("\n"), sh });
      scroll();
    });
    const histMove = (d) => {
      const h = sh.history; if (!h.length) return;
      hi = hi == null ? h.length : hi;
      hi = Math.max(0, Math.min(h.length, hi + d));
      inp.value = h[hi] || "";
    };
    const tab = () => {
      const r = sh.complete(normalize(inp.value));
      inp.value = r.line;
      if (r.options.length) { print("lx-out", r.options.join("  ")); scroll(); }
    };
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Tab") { e.preventDefault(); tab(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); histMove(-1); }
      else if (e.key === "ArrowDown") { e.preventDefault(); histMove(1); }
      else if (e.key === "c" && e.ctrlKey) { e.preventDefault(); print("lx-cmd", sh.promptPath() + "$ " + inp.value + "^C"); inp.value = ""; }
      else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); scr.innerHTML = ""; }
    });
    root.querySelectorAll(".lx-keys button").forEach((b) => {
      b.addEventListener("pointerdown", (e) => e.preventDefault());
      b.addEventListener("click", () => {
        const k = b.dataset.k;
        if (k === "Tab") tab();
        else if (k === "↑") histMove(-1);
        else { const s = inp.selectionStart == null ? inp.value.length : inp.selectionStart; inp.value = inp.value.slice(0, s) + (k === "|" || k === ">" ? (inp.value.slice(0, s).endsWith(" ") || !s ? "" : " ") + k + " " : k) + inp.value.slice(inp.selectionEnd == null ? s : inp.selectionEnd); }
        inp.focus();
      });
    });
    scr.addEventListener("click", () => { if (!window.getSelection || !String(window.getSelection())) inp.focus({ preventScroll: true }); });
    return { sh, focus: () => inp.focus({ preventScroll: true }), print: (cls, t) => { print(cls, t); scroll(); }, input: inp };
  }

  window.SHELL = { create, mount, sha256, normalize };
})();
