/* Turno Andino — Campamento Linux (parte 2): los niveles.
   cards: lecciones (HTML; {{clave|texto}} marca palabras del diccionario; <pre class="lx-ex"> es una terminal de ejemplo).
   missions: { goal, hint, sol, ok, check(c) } con c = { cmd, cmds, out, sh }.
   quiz: comprobación final (hay que acertar 2). */
(function () {
  const H = "/home/analista";
  const used = (c, n) => c.cmds.includes(n);
  const lines = (s) => (s || "").split("\n").filter((x) => x.trim() !== "");
  const P = (path) => `<span class="u">analista@srv-web01</span>:<span class="d">${path}</span>$ `;

window.LX_LEVELS = [
{
  id: "lx1", title: "La terminal: tu nueva herramienta", mins: 8,
  summary: "Qué es Linux, cómo leer el prompt y cómo se escribe un comando.",
  cards: [
    { t: "¿Por qué Linux?", b: "Linux es un {{os|sistema operativo}}, como Windows, pero libre y gratuito. La mayoría de los servidores del mundo usan Linux: la banca en línea, las bases de datos y casi toda la nube. En ciberseguridad lo usarás todos los días, porque los {{log|logs}} que revisas y las herramientas del analista viven ahí.<br><br>Hay muchas {{distro|distribuciones}}: Ubuntu, Debian, Red Hat. Todas comparten el mismo corazón, el {{kernel}}, y los mismos comandos básicos. Lo que aprendas aquí sirve en todas." },
    { t: "La terminal y el prompt", b: `En un servidor no hay ratón ni ventanas: todo se hace escribiendo en la {{terminal}}. Lo primero que ves es el {{prompt}}:<pre class="lx-ex">${P("~")}</pre>Se lee así: usuario <b>analista</b>, en el equipo <b>srv-web01</b>, dentro de la carpeta <b>~</b> (tu carpeta personal). El <b>$</b> dice que eres un usuario normal. Si ves <b>#</b>, eres {{root}}, el administrador con poder total: ahí hay que ir con mucho cuidado.` },
    { t: "Cómo se escribe un comando", b: "Casi todos los comandos tienen la misma forma:<pre class=\"lx-ex\">comando  -opciones  argumentos\nls       -l         /var/log</pre><ul><li><b>Comando</b>: qué quieres hacer (ls = listar).</li><li><b>Opciones</b>: cómo hacerlo; empiezan por guion (-l = formato largo).</li><li><b>Argumentos</b>: sobre qué (/var/log = esa carpeta).</li></ul>Linux distingue mayúsculas: <code>ls</code> funciona, <code>LS</code> no. Y los espacios cuentan: <code>ls-l</code> no es lo mismo que <code>ls -l</code>." },
    { t: "Tus primeros comandos y atajos", b: `<pre class="lx-ex">${P("~")}whoami\nanalista\n${P("~")}hostname\nsrv-web01\n${P("~")}echo Hola\nHola</pre><code>whoami</code> dice qué usuario eres, <code>hostname</code> en qué equipo estás, <code>date</code> la fecha y la hora, <code>echo</code> repite un texto y <code>clear</code> limpia la pantalla.<br><br>Para pedir ayuda: <code>man ls</code> abre el manual de un comando y <code>ls --help</code> muestra un resumen.<br><br>Atajos que ahorran horas: la <b>flecha arriba</b> repite comandos anteriores, <b>Tab</b> completa nombres y <b>Ctrl+C</b> cancela lo que está corriendo. En el simulador tienes botones para Tab y para la flecha.` },
  ],
  missions: [
    { goal: "Pregúntale al servidor con qué usuario estás trabajando.", hint: "En inglés sería «who am I?», todo junto.", sol: "whoami", ok: "whoami responde analista. Antes de cualquier tarea, confirma con qué usuario y permisos trabajas.", check: (c) => used(c, "whoami") && c.out.trim() === "analista" },
    { goal: "Averigua el nombre de este servidor.", hint: "El nombre de un equipo en la red se llama host name.", sol: "hostname", ok: "Confirma siempre en qué servidor estás: un comando en el servidor equivocado puede tumbar un servicio del banco.", check: (c) => used(c, "hostname") && /srv-web01/.test(c.out) },
    { goal: "Mira la fecha y la hora del servidor.", hint: "El comando es la palabra «fecha» en inglés.", sol: "date", ok: "Los logs usan la hora del servidor. Para entender qué pasó y en qué orden, comparas horas entre equipos.", check: (c) => used(c, "date") },
    { goal: "Haz que la terminal escriba: Hola, Banco Andino", hint: "echo repite lo que escribas después de él.", sol: "echo Hola, Banco Andino", ok: "echo parece simple, pero lo usarás mucho para escribir en archivos y en scripts.", check: (c) => used(c, "echo") && /hola,?\s+banco andino/i.test(c.out) },
    { goal: "Pide el manual del comando ls.", hint: "man seguido del nombre del comando.", sol: "man ls", ok: "Nadie se sabe todas las opciones de memoria: los profesionales consultan man todo el tiempo.", check: (c) => (used(c, "man") && /\bls\b/.test(c.cmd)) || (used(c, "ls") && /--help/.test(c.cmd)) },
  ],
  quiz: [
    { q: "En el prompt analista@srv-web01:~$ ¿qué significa el símbolo $?", a: ["Que eres un usuario normal", "Que eres root", "Que hay un error", "Que el comando cuesta dinero"], c: 0, w: "$ = usuario normal; # = root. Míralo antes de escribir." },
    { q: "En el comando ls -l /var/log, ¿qué es -l?", a: ["Una opción", "El comando", "El argumento", "Un error de escritura"], c: 0, w: "Las opciones empiezan por guion y cambian cómo trabaja el comando." },
    { q: "¿Qué comando muestra el manual de grep?", a: ["man grep", "help me grep", "grep manual", "info-grep"], c: 0, w: "man + nombre del comando." },
    { q: "¿Por qué un analista de un banco debe saber Linux?", a: ["Porque la mayoría de servidores y herramientas de seguridad usan Linux", "Porque Windows está prohibido", "Porque Linux no tiene logs", "No hace falta"], c: 0, w: "Servidores web, bases de datos, la nube y las herramientas del SOC corren en Linux." },
    { q: "¿Qué atajo cancela un comando que se quedó corriendo?", a: ["Ctrl+C", "Escribir stop", "Ctrl+S", "Cerrar el computador"], c: 0, w: "Ctrl+C interrumpe el comando actual." },
  ],
},
{
  id: "lx2", title: "Moverte por las carpetas", mins: 9,
  summary: "El árbol de Linux, dónde está cada cosa y cómo moverte con pwd, ls y cd.",
  cards: [
    { t: "Todo cuelga de /", b: "En Linux no hay C: ni D:. Todo empieza en una sola raíz, <code>/</code>, y de ella cuelgan las carpetas, como las ramas de un árbol:<pre class=\"lx-ex\">/\n├── home/      carpetas de los usuarios (/home/analista)\n├── etc/       configuración del sistema y de los programas\n├── var/log/   los logs: aquí trabaja el analista\n├── tmp/       temporales: cualquiera puede escribir\n├── root/      la carpeta personal de root\n├── opt/       aplicaciones aparte (la app del banco)\n├── srv/       datos que sirve el equipo (los respaldos)\n└── usr/bin/   los programas: ls, grep, cat…</pre>Memoriza <b>/etc</b>, <b>/var/log</b>, <b>/home</b> y <b>/tmp</b>: en seguridad son las que más visitarás." },
    { t: "¿Dónde estoy y qué hay aquí?", b: "<code>pwd</code> dice en qué carpeta estás. <code>ls</code> muestra lo que hay. Con opciones ves más:<pre class=\"lx-ex\">$ ls -l /var/log\n-rw-r----- 1 syslog adm   1203 sep 29 08:12 auth.log\ndrwxr-xr-x 2 root   adm   4096 sep 28 18:02 nginx\n-rw-r----- 1 syslog adm    905 sep 29 08:12 syslog</pre>Las columnas son: permisos (la primera letra: <b>d</b> carpeta, <b>-</b> archivo), dueño, grupo, tamaño en bytes, fecha y nombre.<br><br><code>ls -a</code> muestra también los {{oculto|archivos ocultos}} (empiezan por punto). <code>ls -la</code> junta las dos. <code>ls -lh</code> muestra el tamaño en K o M, más fácil de leer." },
    { t: "Moverte con cd", b: "<code>cd</code> cambia de carpeta:<ul><li><code>cd /var/log</code>: ir a esa carpeta.</li><li><code>cd ..</code>: subir un nivel.</li><li><code>cd</code> o <code>cd ~</code>: volver a tu carpeta personal.</li><li><code>cd -</code>: volver a la carpeta anterior.</li></ul>Hay dos formas de escribir una dirección. La {{rutaabs|ruta absoluta}} empieza por / y funciona desde cualquier sitio: <code>/var/log/nginx</code>. La relativa parte de donde estás: si ya estás en /var/log, basta con <code>cd nginx</code>.<br><br>Es como dar una dirección: «Calle 72 # 10-34, Bogotá» sirve desde cualquier ciudad; «dos casas a la derecha» solo sirve si sabes dónde estás." },
  ],
  missions: [
    { goal: "Muestra en qué carpeta estás ahora.", hint: "pwd = print working directory.", sol: "pwd", ok: "Estás en /home/analista, tu carpeta personal. En el prompt aparece abreviada como ~.", check: (c) => used(c, "pwd") && c.out.trim() === H },
    { goal: "Mira qué archivos hay en tu carpeta personal.", hint: "El comando para listar tiene dos letras.", sol: "ls", ok: "Ves notas.txt, tareas.txt, borrador.txt y la carpeta reportes. Pero hay algo que ls no muestra…", check: (c) => used(c, "ls") && /notas\.txt/.test(c.out) },
    { goal: "Lista también los archivos ocultos de tu carpeta.", hint: "Agrega la opción -a (all, todos).", sol: "ls -a", ok: "Aparecieron .pista y .bashrc. Un buen analista siempre usa ls -a: lo oculto también cuenta.", check: (c) => used(c, "ls") && /\.pista/.test(c.out) },
    { goal: "Entra a la carpeta de los logs: /var/log", hint: "cd seguido de la ruta.", sol: "cd /var/log", ok: "Mira el prompt: ahora dice /var/log. El prompt siempre te dice dónde estás.", check: (c) => c.sh.cwd === "/var/log" },
    { goal: "Mira el detalle de lo que hay aquí: dueño, tamaño y fecha.", hint: "La opción -l muestra el formato largo.", sol: "ls -l", ok: "auth.log es de syslog y del grupo adm. Tú puedes leerlo porque estás en el grupo adm, el de quienes revisan logs.", check: (c) => used(c, "ls") && /auth\.log/.test(c.out) && /^-rw/m.test(c.out) },
    { goal: "Vuelve a tu carpeta personal con el atajo más corto.", hint: "cd solo, o cd ~", sol: "cd", ok: "cd sin nada te lleva a casa. Muy útil cuando te pierdes.", check: (c) => used(c, "cd") && c.sh.cwd === H },
  ],
  quiz: [
    { q: "¿En qué carpeta están los logs del sistema?", a: ["/var/log", "/etc", "/home", "/bin"], c: 0, w: "auth.log, syslog y los logs de nginx viven en /var/log." },
    { q: "¿Qué comando muestra los archivos ocultos?", a: ["ls -a", "ls -h", "cd -a", "pwd -a"], c: 0, w: "-a = all. Los ocultos empiezan por punto." },
    { q: "Estás en /var/log y escribes cd .. ¿Dónde quedas?", a: ["/var", "/", "/var/log/..", "/home"], c: 0, w: ".. sube un nivel: de /var/log a /var." },
    { q: "¿Cuál es una ruta absoluta?", a: ["/etc/ssh/sshd_config", "ssh/sshd_config", "../ssh", "sshd_config"], c: 0, w: "Las absolutas empiezan por /." },
    { q: "En ls -l, una línea que empieza por d es…", a: ["Una carpeta", "Un archivo borrado", "Un disco dañado", "Un archivo de root"], c: 0, w: "d = directory (carpeta); - = archivo normal." },
  ],
},
{
  id: "lx3", title: "Leer archivos sin abrirlos", mins: 8,
  summary: "cat, less, head, tail y wc: leer logs y configuraciones desde la terminal.",
  cards: [
    { t: "cat: todo el archivo", b: "<code>cat archivo</code> muestra todo el contenido:<pre class=\"lx-ex\">$ cat /etc/hostname\nsrv-web01</pre>Sirve para archivos cortos. Un log de un servidor del banco puede tener millones de líneas; con cat se te llenaría la pantalla. Para eso están <code>less</code>, <code>head</code> y <code>tail</code>.<br><br><code>less archivo</code> abre el archivo por páginas: bajas con la barra espaciadora, buscas con / y sales con q." },
    { t: "head y tail: el principio y el final", b: "<code>head</code> muestra las primeras líneas y <code>tail</code> las últimas (10 si no dices cuántas). Con <code>-n</code> eliges:<pre class=\"lx-ex\">$ tail -n 2 /var/log/auth.log\nSep 29 08:11:09 srv-web01 sshd[4012]: Accepted password for lrojas from 10.20.5.14 port 60455 ssh2\nSep 29 08:12:44 srv-web01 sudo:   lrojas : TTY=pts/1 ; ... COMMAND=/usr/bin/apt update</pre>En los logs lo más nuevo está al final: por eso <code>tail</code> es el favorito del analista. <code>tail -f</code> deja el log abierto y muestra cada línea nueva en vivo; lo cierras con Ctrl+C." },
    { t: "Cómo leer una línea de log", b: "Las líneas de auth.log tienen siempre las mismas partes:<pre class=\"lx-ex\">Sep 29 08:02:17   srv-web01   sshd[3941]:   Accepted password for analista from 10.20.5.21\n── fecha y hora ─  ─ equipo ─  ─ programa ─  ─────────────── qué pasó ───────────────</pre>Esta dice que la cuenta <b>analista</b> entró por {{ssh|SSH}} desde el equipo 10.20.5.21 a las 8:02. Antes hubo dos intentos con la clave equivocada: alguien se equivocó escribiendo. Leer logs es eso: entender qué pasó, quién lo hizo y cuándo." },
    { t: "Contar con wc", b: "<code>wc -l archivo</code> cuenta las líneas:<pre class=\"lx-ex\">$ wc -l /var/log/nginx/access.log\n16 /var/log/nginx/access.log</pre>16 líneas = 16 peticiones al sitio web. Sin -l, wc muestra líneas, palabras y bytes. Más adelante lo combinarás con grep para contar solo lo que te interesa." },
  ],
  missions: [
    { goal: "Lee el archivo oculto .pista de tu carpeta personal.", hint: "cat seguido del nombre (con el punto).", sol: "cat .pista", ok: "La pista te manda a tareas.txt: ahí está tu trabajo de hoy.", check: (c) => used(c, "cat") && /archivos ocultos empiezan/.test(c.out) },
    { goal: "Lee tu lista de tareas: tareas.txt", hint: "Igual que antes: cat y el nombre.", sol: "cat tareas.txt", ok: "Cuatro tareas reales de operaciones. Las irás resolviendo en los siguientes niveles.", check: (c) => /Revisar que nginx/.test(c.out) },
    { goal: "Muestra solo las primeras 3 líneas de /var/log/auth.log", hint: "head con la opción -n y un número.", sol: "head -n 3 /var/log/auth.log", ok: "head es útil para ver cómo empieza un archivo y qué formato tiene.", check: (c) => used(c, "head") && lines(c.out).length === 3 && /CRON/.test(c.out) },
    { goal: "Muestra las 2 últimas líneas de /var/log/auth.log: lo más reciente.", hint: "tail funciona igual que head, pero desde el final.", sol: "tail -n 2 /var/log/auth.log", ok: "Lo último fue lrojas usando sudo para actualizar paquetes. En los logs, lo nuevo siempre está abajo.", check: (c) => used(c, "tail") && lines(c.out).length === 2 && /apt update/.test(c.out) },
    { goal: "¿Cuántas peticiones recibió el sitio web? Cuenta las líneas de /var/log/nginx/access.log", hint: "wc con la opción -l.", sol: "wc -l /var/log/nginx/access.log", ok: "16 peticiones. Cada línea del access.log es una visita a una página o a un archivo del sitio.", check: (c) => used(c, "wc") && /^\s*16\b/.test(c.out) },
  ],
  quiz: [
    { q: "Necesitas ver lo más reciente de un log muy largo. ¿Qué usas?", a: ["tail", "head", "cat", "pwd"], c: 0, w: "Lo nuevo está al final: tail." },
    { q: "¿Qué hace tail -f /var/log/syslog?", a: ["Muestra las líneas nuevas en vivo", "Borra el log", "Muestra la primera línea", "Comprime el log"], c: 0, w: "-f = follow (seguir). Se sale con Ctrl+C." },
    { q: "head -n 5 archivo muestra…", a: ["Las primeras 5 líneas", "Las últimas 5 líneas", "5 archivos", "La línea 5"], c: 0, w: "head = cabeza = el principio." },
    { q: "¿Qué cuenta wc -l?", a: ["Líneas", "Palabras", "Archivos", "Carpetas"], c: 0, w: "-l = lines." },
    { q: "¿Cómo sales de less?", a: ["Con la tecla q", "Con exit()", "No se puede salir", "Con la tecla Esc dos veces"], c: 0, w: "q = quit." },
  ],
},
{
  id: "lx4", title: "Crear, copiar, mover y borrar", mins: 9,
  summary: "mkdir, touch, cp, mv y rm: organizar archivos sin romper nada.",
  cards: [
    { t: "Crear: mkdir y touch", b: "<code>mkdir</code> crea carpetas y <code>touch</code> crea archivos vacíos:<pre class=\"lx-ex\">$ mkdir informes\n$ mkdir -p casos/2026/septiembre\n$ touch informes/resumen.txt</pre>Con <code>-p</code>, mkdir crea todas las carpetas del camino de una vez. Para escribir dentro de un archivo, en servidores se usa un editor como <code>nano</code> (en el simulador usarás <code>echo</code>, que verás en el nivel 6)." },
    { t: "Copiar y mover: cp y mv", b: "<pre class=\"lx-ex\">$ cp config.properties config.properties.bak\n$ cp -r reportes reportes-copia\n$ mv borrador.txt informes/\n$ mv viejo.txt nuevo.txt</pre><code>cp</code> copia (con <code>-r</code> copia carpetas enteras). <code>mv</code> mueve, y también sirve para renombrar: mover un archivo a otro nombre en la misma carpeta.<br><br>Regla de oro de operaciones: <b>antes de cambiar una configuración, haz una copia</b> (.bak). Si algo sale mal, la restauras en segundos." },
    { t: "Borrar: rm, con mucho cuidado", b: "<code>rm archivo</code> borra un archivo. <code>rm -r carpeta</code> borra una carpeta con todo lo que tiene.<br><br><b>En Linux no hay papelera</b>: lo que borras desaparece. Por eso:<ul><li>Antes de borrar, mira dónde estás con <code>pwd</code>.</li><li>Lista primero lo que vas a borrar con <code>ls</code>.</li><li>Nunca uses <code>rm -rf</code> sin estar 100 % seguro: con root puede borrar el servidor entero.</li></ul>Muchas caídas de servicios en empresas reales empezaron con un rm escrito con prisa." },
  ],
  missions: [
    { goal: "Crea en tu carpeta personal una carpeta llamada informes.", hint: "mkdir y el nombre.", sol: "mkdir informes", ok: "Ordenar el trabajo en carpetas te ahorra tiempo cuando alguien pide «el informe del martes».", check: (c) => c.sh.isDir(H + "/informes") },
    { goal: "Crea un archivo vacío llamado resumen.txt dentro de informes.", hint: "touch y la ruta: carpeta/archivo.", sol: "touch informes/resumen.txt", ok: "touch crea el archivo vacío (y si ya existe, solo actualiza su fecha).", check: (c) => c.sh.isFile(H + "/informes/resumen.txt") },
    { goal: "Haz una copia de seguridad de tareas.txt llamada tareas.txt.bak", hint: "cp origen destino.", sol: "cp tareas.txt tareas.txt.bak", ok: "La copia .bak es un hábito profesional: antes de editar, respaldas.", check: (c) => c.sh.isFile(H + "/tareas.txt.bak") && c.sh.isFile(H + "/tareas.txt") },
    { goal: "Mueve la carpeta reportes dentro de informes.", hint: "mv carpeta destino/", sol: "mv reportes informes/", ok: "mv movió la carpeta completa con sus tres archivos .csv.", check: (c) => c.sh.isDir(H + "/informes/reportes") && !c.sh.exists(H + "/reportes") },
    { goal: "Borra borrador.txt, que ya no sirve.", hint: "rm y el nombre. Revisa dos veces antes de Enter.", sol: "rm borrador.txt", ok: "Listo. Recuerda: sin papelera. Por eso se respalda antes y se borra con calma.", check: (c) => !c.sh.exists(H + "/borrador.txt") && c.sh.exists(H + "/notas.txt") },
  ],
  quiz: [
    { q: "¿Qué hace mv viejo.txt nuevo.txt?", a: ["Renombra el archivo", "Lo copia", "Lo borra", "Lo comprime"], c: 0, w: "Mover a otro nombre en la misma carpeta = renombrar." },
    { q: "¿Qué opción necesita cp para copiar una carpeta entera?", a: ["-r", "-a2", "-f", "-l"], c: 0, w: "-r = recursivo: la carpeta y todo lo de adentro." },
    { q: "Borras un archivo con rm por error. ¿Qué pasa?", a: ["Desaparece: no hay papelera", "Va a la papelera", "Se recupera con undo", "Se guarda en /tmp"], c: 0, w: "Por eso existen los respaldos." },
    { q: "Vas a editar la configuración de un servidor. ¿Qué haces primero?", a: ["Una copia .bak del archivo", "Borrarlo", "Reiniciar el servidor", "Nada"], c: 0, w: "Respaldar antes de cambiar." },
    { q: "mkdir -p a/b/c…", a: ["Crea las tres carpetas de una vez", "Da error siempre", "Crea solo c", "Borra a, b y c"], c: 0, w: "-p crea las carpetas del camino que falten." },
  ],
},
{
  id: "lx5", title: "Buscar como un analista", mins: 10,
  summary: "grep para buscar dentro de los archivos y find para encontrar archivos.",
  cards: [
    { t: "grep: busca texto dentro de archivos", b: "{{grep}} muestra solo las líneas que contienen lo que buscas:<pre class=\"lx-ex\">$ grep \"Failed password\" /var/log/auth.log\nSep 29 08:01:40 srv-web01 sshd[3941]: Failed password for analista from 10.20.5.21 port 60322 ssh2\nSep 29 08:01:52 srv-web01 sshd[3941]: Failed password for analista from 10.20.5.21 port 60322 ssh2\nSep 29 08:11:02 srv-web01 sshd[4012]: Failed password for lrojas from 10.20.5.14 port 60455 ssh2</pre>Si lo que buscas tiene espacios, ponlo entre comillas. Es el comando que más usará un analista: de un log de un millón de líneas te quedas con las diez que importan." },
    { t: "Las opciones que más se usan", b: "<ul><li><code>-i</code>: no distingue mayúsculas (error, Error, ERROR).</li><li><code>-c</code>: en vez de las líneas, dice cuántas hay.</li><li><code>-n</code>: muestra el número de línea.</li><li><code>-v</code>: al revés, las líneas que NO contienen el texto.</li><li><code>-r</code>: busca en todos los archivos de una carpeta.</li></ul><pre class=\"lx-ex\">$ grep -c \"Failed password\" /var/log/auth.log\n3\n$ grep -i error /var/log/syslog</pre>" },
    { t: "find: encuentra archivos", b: "grep busca dentro de los archivos; <code>find</code> busca los archivos mismos:<pre class=\"lx-ex\">$ find /etc -name \"*.conf\"\n/etc/resolv.conf\n/etc/nginx/nginx.conf</pre>El asterisco <code>*</code> significa «cualquier cosa»: *.conf = todo lo que termine en .conf. Otras búsquedas útiles: <code>-type f</code> (solo archivos), <code>-type d</code> (solo carpetas), <code>-user respaldos</code> (de ese dueño).<br><br>Si buscas en carpetas sin permiso, salen errores; se esconden agregando <code>2>/dev/null</code> al final." },
  ],
  missions: [
    { goal: "Muestra las líneas de /var/log/auth.log con «Failed password» (claves equivocadas).", hint: "grep \"texto con espacios\" archivo", sol: "grep \"Failed password\" /var/log/auth.log", ok: "Tres claves equivocadas de dos personas del equipo, y después entraron bien. Así se ve un error humano normal.", check: (c) => used(c, "grep") && lines(c.out).length === 3 && lines(c.out).every((l) => /Failed password/.test(l)) },
    { goal: "Ahora no las muestres: solo cuéntalas, con una opción de grep.", hint: "La opción c viene de count.", sol: "grep -c \"Failed password\" /var/log/auth.log", ok: "3. Si un día ves 3.000, ya no es un error humano: es algo que hay que investigar.", check: (c) => used(c, "grep") && c.out.trim() === "3" },
    { goal: "Busca «error» en /var/log/syslog sin importar mayúsculas.", hint: "La opción -i ignora mayúsculas.", sol: "grep -i error /var/log/syslog", ok: "Salieron dos: [error] de nginx y ERROR del disco. Sin -i te habrías perdido uno.", check: (c) => used(c, "grep") && /\[error\]/.test(c.out) && /ERROR count/.test(c.out) },
    { goal: "Encuentra todos los archivos que terminan en .conf dentro de /etc", hint: "find carpeta -name \"*.conf\"", sol: "find /etc -name \"*.conf\"", ok: "find recorre todas las subcarpetas. Muy útil para revisar configuraciones.", check: (c) => used(c, "find") && /\/etc\/nginx\/nginx\.conf/.test(c.out) && /\/etc\/resolv\.conf/.test(c.out) },
    { goal: "Busca las carpetas o archivos ocultos dentro de /tmp", hint: "Los ocultos empiezan por punto: -name \".*\"", sol: "find /tmp -name \".*\"", ok: "Encontraste /tmp/.X11-unix, una carpeta normal del sistema. Revisar lo oculto en /tmp es parte de la rutina, porque cualquiera puede escribir ahí.", check: (c) => used(c, "find") && /\/tmp\/\.X11-unix/.test(c.out) },
  ],
  quiz: [
    { q: "¿Qué hace grep -i?", a: ["Busca sin importar mayúsculas", "Cuenta líneas", "Invierte la búsqueda", "Busca imágenes"], c: 0, w: "-i = ignore case." },
    { q: "¿Qué opción de grep muestra las líneas que NO contienen el texto?", a: ["-v", "-n", "-c", "-r"], c: 0, w: "-v invierte el resultado." },
    { q: "Quieres encontrar archivos llamados *.log. ¿Qué usas?", a: ["find", "grep", "cat", "wc"], c: 0, w: "find busca archivos; grep busca texto dentro de ellos." },
    { q: "grep -c \"404\" access.log devuelve…", a: ["Cuántas líneas contienen 404", "Las líneas con 404", "El tamaño del archivo", "Las líneas sin 404"], c: 0, w: "-c = count." },
    { q: "¿Para qué sirve 2>/dev/null al final de un find?", a: ["Para esconder los mensajes de error", "Para borrar archivos", "Para buscar más rápido", "Para ser root"], c: 0, w: "Manda los errores (salida 2) a la basura." },
  ],
},
{
  id: "lx6", title: "Unir comandos: tuberías y redirección", mins: 10,
  summary: "El símbolo |, guardar resultados con > y >>, y ordenar y contar con sort y uniq.",
  cards: [
    { t: "La tubería |", b: "La {{pipe|tubería}} <code>|</code> pasa el resultado de un comando al siguiente, como una cadena de montaje: cada comando hace una sola cosa y se la entrega al otro.<pre class=\"lx-ex\">$ grep \" 404 \" /var/log/nginx/access.log | wc -l\n2</pre>Primero grep saca las líneas con error 404 (página no encontrada) y después wc las cuenta. En el iPhone, el símbolo | está en el teclado de símbolos; en el simulador tienes un botón." },
    { t: "Sacar columnas: awk y cut", b: "Cada línea del access.log tiene columnas separadas por espacios:<pre class=\"lx-ex\">190.24.8.77 - - [29/Sep/2026:07:59:12 -0500] \"GET /banca/login HTTP/1.1\" 200 5120\n    $1      $2 $3          $4          $5     $6       $7        $8     $9  $10</pre><code>awk '{print $7}'</code> imprime solo la columna 7 (la página). <code>awk '{print $1}'</code> daría la IP del visitante.<br><br><code>cut</code> hace algo parecido: <code>cut -d' ' -f7</code> corta por espacios y se queda con el campo 7." },
    { t: "Ordenar y contar: sort y uniq", b: "La combinación más famosa del analista:<pre class=\"lx-ex\">$ awk '{print $7}' access.log | sort | uniq -c | sort -nr\n      8 /banca/login\n      4 /banca/inicio\n      1 /promo-verano</pre><ol><li><code>awk</code> saca la página de cada línea.</li><li><code>sort</code> las ordena para que las iguales queden juntas.</li><li><code>uniq -c</code> junta las iguales y las cuenta.</li><li><code>sort -nr</code> ordena por número, de mayor a menor.</li></ol>Resultado: un ranking. Con la misma idea sacas qué IP hizo más peticiones o qué usuario falló más veces." },
    { t: "Guardar resultados: > y >>", b: "La {{redir|redirección}} envía el resultado a un archivo en vez de a la pantalla:<pre class=\"lx-ex\">$ grep \" 404 \" access.log > errores-404.txt     (crea o REEMPLAZA)\n$ echo \"Revisado por analista\" >> errores-404.txt   (AGREGA al final)</pre>Cuidado: un solo <code>></code> borra lo que tenía el archivo. Para sumar líneas usa <code>>></code>." },
  ],
  missions: [
    { goal: "Cuenta los errores 404 del sitio uniendo grep y wc con una tubería.", hint: "grep \" 404 \" archivo | wc -l (los espacios evitan confundir 404 con otros números)", sol: "grep \" 404 \" /var/log/nginx/access.log | wc -l", ok: "2 páginas no encontradas: una promoción vieja y el ícono del sitio. Tarea 2 de tu lista: hecha.", check: (c) => c.cmds.length > 1 && used(c, "grep") && used(c, "wc") && c.out.trim() === "2" },
    { goal: "Saca solo la columna de la página (la 7) de /var/log/nginx/access.log", hint: "awk '{print $7}' archivo", sol: "awk '{print $7}' /var/log/nginx/access.log", ok: "Ahora tienes una lista limpia de páginas, sin IP ni fechas.", check: (c) => (used(c, "awk") || used(c, "cut")) && /^\/banca\/login$/m.test(c.out) && !/HTTP/.test(c.out) },
    { goal: "Arma el ranking: qué página se visitó más veces.", hint: "Agrega | sort | uniq -c | sort -nr al comando anterior.", sol: "awk '{print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -nr", ok: "/banca/login es la más visitada: es la puerta de entrada de los clientes.", check: (c) => used(c, "uniq") && /^\s*8 \/banca\/login/.test(c.out) },
    { goal: "Guarda ese ranking en un archivo: ~/ranking.txt", hint: "Repite el comando (flecha arriba) y agrega > ~/ranking.txt al final.", sol: "awk '{print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -nr > ~/ranking.txt", ok: "Nada salió en pantalla: todo se fue al archivo. Compruébalo con cat ranking.txt.", check: (c) => /8 \/banca\/login/.test(c.sh.read(H + "/ranking.txt") || "") },
    { goal: "Agrega al final de ranking.txt la línea: Revisado por analista", hint: "echo \"texto\" >> archivo (dos signos >)", sol: "echo \"Revisado por analista\" >> ~/ranking.txt", ok: "Con >> sumaste una línea sin borrar el ranking. Con un solo > lo habrías perdido.", check: (c) => { const t = c.sh.read(H + "/ranking.txt") || ""; return /8 \/banca\/login/.test(t) && /Revisado por analista/.test(t); } },
  ],
  quiz: [
    { q: "¿Qué hace el símbolo | ?", a: ["Pasa el resultado de un comando al siguiente", "Guarda en un archivo", "Borra la pantalla", "Separa dos archivos"], c: 0, w: "Es la tubería: une comandos." },
    { q: "¿Cuál es la diferencia entre > y >>?", a: ["> reemplaza el archivo; >> agrega al final", "Son iguales", "> agrega; >> reemplaza", ">> borra el archivo"], c: 0, w: "Un > de más puede borrar un informe completo." },
    { q: "¿Por qué se pone sort antes de uniq -c?", a: ["Porque uniq solo junta líneas iguales que estén seguidas", "Porque uniq no funciona sin sort instalado", "Para que vaya más rápido", "No hace falta"], c: 0, w: "uniq compara cada línea con la anterior." },
    { q: "awk '{print $1}' access.log muestra…", a: ["La primera columna de cada línea", "La primera línea", "El primer archivo", "Un error"], c: 0, w: "$1 = columna 1 (en el access.log, la IP)." },
    { q: "sort -nr ordena…", a: ["Por número, de mayor a menor", "Alfabéticamente", "Al azar", "Por fecha"], c: 0, w: "-n numérico, -r al revés." },
  ],
},
{
  id: "lx7", title: "Usuarios, permisos y sudo", mins: 10,
  summary: "Quién puede leer, escribir o ejecutar cada archivo, y cómo arreglarlo.",
  cards: [
    { t: "Usuarios y grupos", b: "Cada persona y cada servicio tiene su usuario. <code>id</code> muestra el tuyo:<pre class=\"lx-ex\">$ id\nuid=1000(analista) gid=1000(analista) grupos=1000(analista),4(adm),27(sudo),1003(soc)</pre>El {{uid|UID}} es tu número de usuario; los grupos dan permisos compartidos (adm = leer logs, sudo = poder administrar).<br><br>La lista de usuarios está en <code>/etc/passwd</code> (la puede leer cualquiera). Las claves, guardadas como hash, están en <code>/etc/shadow</code>, que solo puede leer root. El UID 0 es root: solo root debe tenerlo." },
    { t: "Leer los permisos", b: "<pre class=\"lx-ex\">-rw-r----- 1 root root 120 sep 28 18:02 config.properties\n│└┬┘└┬┘└┬┘\n│ │  │  └── otros:  ---  nada\n│ │  └───── grupo:  r--  solo leer\n│ └──────── dueño:  rw-  leer y escribir\n└────────── tipo:   -    archivo</pre><b>r</b> = leer, <b>w</b> = escribir, <b>x</b> = ejecutar (en una carpeta, x = poder entrar). Un guion = no tiene ese permiso.<br><br>Cada letra vale un número: r = 4, w = 2, x = 1. Se suman por grupo: rw- = 6, r-- = 4, --- = 0. Por eso estos permisos se escriben <b>640</b>. Otros comunes: 644 (todos leen, solo el dueño escribe), 755 (programas y carpetas), 600 (solo el dueño)." },
    { t: "chmod, chown y sudo", b: "<code>chmod 640 archivo</code> cambia los permisos; <code>chown usuario:grupo archivo</code> cambia el dueño. Solo el dueño o root pueden hacerlo.<br><br>{{sudo}} ejecuta un comando como administrador, y queda registrado en /var/log/auth.log quién lo hizo y qué hizo:<pre class=\"lx-ex\">$ chmod 640 /opt/banco/config.properties\nchmod: cambiando los permisos de '/opt/banco/config.properties': Operación no permitida\n$ sudo chmod 640 /opt/banco/config.properties</pre>Esto aplica el {{leastprivilege|mínimo privilegio}}: trabajas como usuario normal y solo usas sudo para la tarea puntual. Nadie trabaja todo el día como root." },
  ],
  missions: [
    { goal: "Mira tu identidad completa: tu número de usuario y tus grupos.", hint: "Un comando de dos letras.", sol: "id", ok: "Estás en adm (puedes leer logs) y en sudo (puedes administrar con sudo).", check: (c) => used(c, "id") && /uid=1000/.test(c.out) },
    { goal: "Intenta leer /etc/shadow y fíjate qué responde el sistema.", hint: "cat /etc/shadow", sol: "cat /etc/shadow", ok: "Permiso denegado: los hash de las claves solo los ve root. Así debe ser.", check: (c) => /Permiso denegado/.test(c.out) && /shadow/.test(c.cmd) },
    { goal: "Comprueba en /etc/passwd que solo root tiene el UID 0.", hint: "Busca \":x:0:\" con grep.", sol: "grep \":x:0:\" /etc/passwd", ok: "Solo aparece root. Revisar esto es una tarea normal de auditoría: una cuenta extra con UID 0 tendría poder total.", check: (c) => used(c, "grep") && /^root:x:0:0/m.test(c.out) && lines(c.out).length === 1 },
    { goal: "Mira los permisos de /opt/banco/config.properties", hint: "ls -l y la ruta.", sol: "ls -l /opt/banco/config.properties", ok: "-rw-rw-rw- (666): cualquier usuario del servidor puede leerlo y cambiarlo. Tiene datos de conexión a la base de datos: hay que arreglarlo.", check: (c) => used(c, "ls") && /-rw-rw-rw-.*config\.properties/.test(c.out) },
    { goal: "Arréglalo: dueño lee y escribe, grupo solo lee, otros nada (640).", hint: "chmod 640 no basta: el archivo es de root. Usa sudo delante.", sol: "sudo chmod 640 /opt/banco/config.properties", ok: "Tarea 3 resuelta. Mira auth.log: tu sudo quedó registrado, como debe ser.", check: (c) => c.sh.mode("/opt/banco/config.properties") === 640 },
  ],
  quiz: [
    { q: "¿Qué permisos son 640?", a: ["rw- r-- ---", "rwx r-x r-x", "rw- rw- rw-", "r-- --- ---"], c: 0, w: "6 = rw-, 4 = r--, 0 = ---." },
    { q: "¿Dónde están los hash de las contraseñas?", a: ["/etc/shadow", "/etc/passwd", "/var/log/auth.log", "/home/root"], c: 0, w: "shadow solo lo lee root." },
    { q: "¿Qué hace sudo además de dar permisos de administrador?", a: ["Deja registro de quién hizo qué", "Cifra el disco", "Borra los logs", "Crea usuarios"], c: 0, w: "Por eso es mejor que entrar como root." },
    { q: "Un archivo con datos de conexión tiene permisos 666. ¿Es un problema?", a: ["Sí: cualquier usuario puede leerlo y cambiarlo", "No: 666 es lo normal", "Solo si es viernes", "No, porque no es ejecutable"], c: 0, w: "Debe ser 640 o 600." },
    { q: "¿Qué UID tiene root?", a: ["0", "1", "1000", "999"], c: 0, w: "UID 0 = poder total." },
  ],
},
{
  id: "lx8", title: "Procesos, servicios y red", mins: 10,
  summary: "Qué está corriendo, qué servicios están activos y cómo se conecta el servidor.",
  cards: [
    { t: "Procesos: ps y top", b: "Cada programa en ejecución es un {{proceso}} con su número, el {{pid|PID}}:<pre class=\"lx-ex\">$ ps aux\nUSER      PID %CPU %MEM ... START   TIME COMMAND\nroot      612  0.0  0.2 ... sep28   0:00 sshd: /usr/sbin/sshd -D\nwww-data  881  0.3  0.4 ... sep28   0:12 nginx: worker process\nrespaldos 3150 64.2 0.8 ... 07:30  41:10 tar -czf /srv/respaldos/web-extra.tar.gz /var/www</pre>Las columnas clave: USER (quién lo ejecuta), PID, %CPU, START (cuándo empezó) y COMMAND (qué es). <code>top</code> muestra lo mismo en vivo, ordenado por CPU (sales con q).<br><br><code>kill PID</code> le pide a un proceso que termine. Si es de otro usuario, necesitas sudo." },
    { t: "Servicios: systemctl", b: "Un {{daemon|servicio}} es un programa que corre siempre en segundo plano: nginx (la web), ssh, cron (las tareas programadas). Se manejan con <code>systemctl</code>:<pre class=\"lx-ex\">$ systemctl status nginx\n● nginx.service - A high performance web server\n     Active: active (running) since lun 2026-09-29 08:05:31 -05</pre><code>active (running)</code> = funciona. Con sudo puedes <code>restart</code> (reiniciar), <code>stop</code> o <code>start</code> un servicio." },
    { t: "Red: ip, ping y ss", b: "<ul><li><code>ip a</code>: las direcciones {{ip|IP}} del servidor.</li><li><code>ping -c 3 equipo</code>: ¿responde otro equipo? (-c 3 = solo 3 intentos).</li><li><code>ss -tulpn</code>: qué {{puerto|puertos}} esperan conexiones (con sudo, también qué programa los usa).</li></ul><pre class=\"lx-ex\">$ sudo ss -tulpn\ntcp LISTEN 0.0.0.0:443     users:((\"nginx\",pid=880))\ntcp LISTEN 127.0.0.1:5432  users:((\"postgres\",pid=760))</pre>0.0.0.0 = abierto a toda la red; 127.0.0.1 = solo desde el mismo servidor. La base de datos escucha solo en 127.0.0.1: bien configurada. En seguridad, cada puerto abierto que no se necesita es una puerta de más." },
  ],
  missions: [
    { goal: "Lista todos los procesos y busca cuál usa más CPU.", hint: "ps aux", sol: "ps aux", ok: "Un respaldo (tar, del usuario respaldos) lleva desde las 7:30 usando el 64 % de la CPU. El respaldo normal termina a las 00:42: este se quedó pegado.", check: (c) => used(c, "ps") && /tar -czf/.test(c.out) },
    { goal: "Revisa si el servicio nginx (la web del banco) está activo.", hint: "systemctl status y el nombre del servicio.", sol: "systemctl status nginx", ok: "active (running): la web funciona. Tarea 1 de tu lista: hecha.", check: (c) => used(c, "systemctl") && /active \(running\)/.test(c.out) && /nginx/.test(c.out) },
    { goal: "Mira qué puertos esperan conexiones, con el programa que usa cada uno.", hint: "sudo ss -tulpn (sin sudo no ves los programas).", sol: "sudo ss -tulpn", ok: "22 (SSH), 80 y 443 (web) abiertos a la red; 5432 (base de datos) solo en 127.0.0.1. Nada de más.", check: (c) => used(c, "ss") && /5432/.test(c.out) && /nginx/.test(c.out) },
    { goal: "Averigua la dirección IP de este servidor.", hint: "ip a (o ip addr).", sol: "ip a", ok: "10.20.3.15 es su IP en la red interna del banco. La 127.0.0.1 (lo) es el propio equipo.", check: (c) => used(c, "ip") && /10\.20\.3\.15/.test(c.out) },
    { goal: "Detén el respaldo que se quedó pegado. Su PID está en ps aux.", hint: "kill y el PID. Como el proceso es de otro usuario, va con sudo.", sol: "sudo kill 3150", ok: "Detenido: la CPU vuelve a la normalidad. En un caso real avisarías al dueño del respaldo y lo dejarías anotado en el ticket.", check: (c) => !c.sh.procs.some((p) => p[1] === 3150) },
  ],
  quiz: [
    { q: "¿Qué es un PID?", a: ["El número de un proceso", "Una contraseña", "Un puerto", "Un tipo de archivo"], c: 0, w: "Process ID." },
    { q: "¿Qué comando muestra si un servicio está funcionando?", a: ["systemctl status servicio", "ls servicio", "cat servicio", "ping servicio"], c: 0, w: "active (running) = funciona." },
    { q: "Un puerto escucha en 127.0.0.1:5432. ¿Desde dónde se puede conectar?", a: ["Solo desde el mismo servidor", "Desde internet", "Desde toda la red interna", "Desde ningún sitio"], c: 0, w: "127.0.0.1 = el propio equipo." },
    { q: "¿Para qué sirve ping -c 3 10.20.8.5?", a: ["Para ver si ese equipo responde (3 intentos)", "Para copiar 3 archivos", "Para abrir 3 puertos", "Para reiniciar el equipo"], c: 0, w: "-c = count: cuántos intentos." },
    { q: "Necesitas detener un proceso de otro usuario. ¿Qué usas?", a: ["sudo kill PID", "kill sin más", "rm PID", "stop PID"], c: 0, w: "Sobre lo ajeno solo actúa root, con sudo." },
  ],
},
{
  id: "lx9", title: "Prueba final: tu primer turno de operaciones", mins: 10, final: true,
  summary: "Un turno real de principio a fin, usando todo lo que aprendiste.",
  cards: [
    { t: "Tu primer turno", b: "Son las 8:30 en el SOC del Banco Andino. Marta te pasa el servidor srv-web01 con una revisión de rutina antes de la campaña de fin de mes:<ol><li>Confirmar que la web esté activa.</li><li>Revisar el espacio en disco.</li><li>Ver qué pasó en los últimos accesos.</li><li>Respaldar una configuración antes de cambiarla.</li><li>Dejar evidencia de lo revisado.</li></ol>No hay teoría nueva: es todo lo que ya sabes, junto. Si te atascas, la pista está ahí." },
    { t: "Huellas digitales con sha256sum", b: "Un último comando útil: <code>sha256sum archivo</code> calcula el {{hash}} del archivo, su huella digital. Si alguien cambia una sola letra, el hash cambia por completo.<pre class=\"lx-ex\">$ sha256sum respaldo.tar.gz\n9f2c…e41a  respaldo.tar.gz</pre>Se usa para comprobar que un respaldo o un programa no fue modificado. Y <code>df -h</code> muestra el espacio libre de cada disco: si llega al 100 %, los servicios y los logs se detienen." },
  ],
  missions: [
    { goal: "Confirma que la web (nginx) está activa.", hint: "systemctl status nginx", sol: "systemctl status nginx", ok: "La web funciona.", check: (c) => used(c, "systemctl") && /active \(running\)/.test(c.out) },
    { goal: "Revisa el espacio en disco en un formato fácil de leer.", hint: "df con la opción -h (human).", sol: "df -h", ok: "El disco principal está al 41 %. Bien: hay espacio para los logs de la campaña.", check: (c) => used(c, "df") && /%/.test(c.out) },
    { goal: "¿Quiénes entraron al servidor? Muestra las líneas de auth.log con «Accepted».", hint: "grep Accepted /var/log/auth.log", sol: "grep Accepted /var/log/auth.log", ok: "Entraron lrojas y analista desde la red interna (10.20.x.x): todo en orden.", check: (c) => used(c, "grep") && /Accepted publickey for lrojas/.test(c.out) },
    { goal: "Antes de tocar la configuración de nginx, cópiala a tu carpeta como nginx.conf.bak", hint: "cp /etc/nginx/nginx.conf ~/nginx.conf.bak", sol: "cp /etc/nginx/nginx.conf ~/nginx.conf.bak", ok: "Respaldo hecho. Si un cambio sale mal, se restaura en segundos.", check: (c) => c.sh.isFile(H + "/nginx.conf.bak") },
    { goal: "Calcula la huella (SHA-256) de tu copia nginx.conf.bak", hint: "sha256sum y el nombre del archivo.", sol: "sha256sum ~/nginx.conf.bak", ok: "Con esa huella, cualquiera puede comprobar después que la copia no cambió.", check: (c) => used(c, "sha256sum") && /nginx\.conf\.bak/.test(c.out) },
    { goal: "Guarda tu informe: escribe «srv-web01 revisado: OK» en el archivo ~/informe.txt", hint: "echo \"texto\" > ~/informe.txt", sol: "echo \"srv-web01 revisado: OK\" > ~/informe.txt", ok: "Turno cerrado con evidencia. Así trabaja un equipo de operaciones profesional: lo que no queda escrito, no pasó.", check: (c) => /srv-web01 revisado/i.test(c.sh.read(H + "/informe.txt") || "") },
  ],
  quiz: [
    { q: "¿Qué hace sha256sum archivo?", a: ["Calcula su huella digital (hash)", "Lo cifra", "Lo comprime", "Lo borra de forma segura"], c: 0, w: "Si el archivo cambia, el hash cambia." },
    { q: "¿Qué muestra df -h?", a: ["El espacio usado y libre de los discos", "Los procesos", "Los usuarios", "Los puertos abiertos"], c: 0, w: "disk free, en formato humano." },
    { q: "¿Qué haces antes de editar un archivo de configuración?", a: ["Una copia de respaldo", "Reiniciar el servidor", "Borrarlo", "Cambiarle los permisos a 777"], c: 0, w: "Siempre respaldar antes de cambiar." },
    { q: "¿Por qué se deja un informe escrito al final del turno?", a: ["Porque lo que no queda escrito no se puede revisar ni demostrar", "Porque lo exige Linux", "Para ocupar disco", "No hace falta"], c: 0, w: "La evidencia escrita es parte del trabajo." },
  ],
},
];

/* Retos para los turnos y la Sala de juegos: una tarea corta en el servidor. need = nivel que hay que haber completado. */
window.LX_TASKS = [
  { need: "lx2", title: "¿Dónde estoy?", goal: "Te conectaste a srv-web01. Muestra en qué carpeta empiezas y qué hay ahí, incluidos los ocultos.", hint: "ls -la", sol: "ls -la", ok: "ls -la es lo primero que escribe un analista al llegar a un servidor.", check: (c) => used(c, "ls") && /\.bashrc/.test(c.out) && /^d/m.test(c.out) },
  { need: "lx3", title: "Lo último del log", goal: "Muestra las 3 últimas líneas de /var/log/syslog para ver qué pasó hace poco.", hint: "tail -n 3", sol: "tail -n 3 /var/log/syslog", ok: "Lo más reciente: nginx se reinició y apt avisa de actualizaciones.", check: (c) => used(c, "tail") && lines(c.out).length === 3 && /apt/.test(c.out) },
  { need: "lx3", title: "Configuración de SSH", goal: "Lee /etc/ssh/sshd_config y confirma que root no puede entrar por SSH.", hint: "cat y la ruta.", sol: "cat /etc/ssh/sshd_config", ok: "PermitRootLogin no: bien configurado. Se entra con un usuario normal y se usa sudo.", check: (c) => /PermitRootLogin no/.test(c.out) },
  { need: "lx4", title: "Respaldo antes de editar", goal: "Copia /etc/ssh/sshd_config a tu carpeta personal como sshd_config.bak", hint: "cp origen ~/destino", sol: "cp /etc/ssh/sshd_config ~/sshd_config.bak", ok: "Respaldo listo antes de cualquier cambio.", check: (c) => c.sh.isFile(H + "/sshd_config.bak") },
  { need: "lx5", title: "Claves equivocadas", goal: "¿Cuántas veces alguien escribió mal su clave? Cuenta «Failed password» en /var/log/auth.log", hint: "grep -c", sol: "grep -c \"Failed password\" /var/log/auth.log", ok: "3, de dos personas del equipo. Normal: todos nos equivocamos al escribir.", check: (c) => used(c, "grep") && c.out.trim() === "3" },
  { need: "lx5", title: "Errores en syslog", goal: "Busca «error» en /var/log/syslog sin importar mayúsculas.", hint: "grep -i", sol: "grep -i error /var/log/syslog", ok: "Dos avisos: un tiempo de espera de nginx y un error del disco que habría que reportar.", check: (c) => used(c, "grep") && /ERROR count/.test(c.out) && /\[error\]/.test(c.out) },
  { need: "lx5", title: "Archivos de configuración", goal: "Encuentra todos los archivos .conf dentro de /etc", hint: "find /etc -name \"*.conf\"", sol: "find /etc -name \"*.conf\"", ok: "find te da el inventario en segundos.", check: (c) => used(c, "find") && /nginx\.conf/.test(c.out) },
  { need: "lx6", title: "Páginas no encontradas", goal: "Cuenta los errores 404 del sitio uniendo grep y wc.", hint: "grep \" 404 \" archivo | wc -l", sol: "grep \" 404 \" /var/log/nginx/access.log | wc -l", ok: "2 errores 404: una promoción vieja y el ícono del sitio.", check: (c) => used(c, "wc") && c.out.trim() === "2" },
  { need: "lx6", title: "Ranking de visitantes", goal: "¿Cuántas peticiones hizo cada IP? Saca la columna 1 del access.log, ordénala y cuéntala.", hint: "awk '{print $1}' archivo | sort | uniq -c", sol: "awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c", ok: "4 peticiones por visitante: cargar la página, entrar y ver el inicio. Un patrón normal.", check: (c) => used(c, "uniq") && /4 190\.24\.8\.77/.test(c.out) },
  { need: "lx7", title: "Permisos de la configuración", goal: "/opt/banco/config.properties tiene permisos 666. Déjalo en 640.", hint: "sudo chmod 640", sol: "sudo chmod 640 /opt/banco/config.properties", ok: "Ahora solo root escribe y su grupo lee.", check: (c) => c.sh.mode("/opt/banco/config.properties") === 640 },
  { need: "lx7", title: "Auditoría de cuentas", goal: "Confirma en /etc/passwd que solo root tiene UID 0.", hint: "grep \":x:0:\" /etc/passwd", sol: "grep \":x:0:\" /etc/passwd", ok: "Solo root. Revisión de auditoría superada.", check: (c) => used(c, "grep") && /^root:x:0:0/m.test(c.out) && lines(c.out).length === 1 },
  { need: "lx8", title: "¿Está viva la web?", goal: "Comprueba que el servicio nginx esté activo.", hint: "systemctl status nginx", sol: "systemctl status nginx", ok: "active (running).", check: (c) => used(c, "systemctl") && /active \(running\)/.test(c.out) },
  { need: "lx8", title: "Respaldo pegado", goal: "Un respaldo lleva horas usando la CPU. Encuéntralo y detenlo.", hint: "ps aux para ver el PID; luego sudo kill PID", sol: "sudo kill 3150", ok: "Proceso detenido y servidor estable.", check: (c) => !c.sh.procs.some((p) => p[1] === 3150) },
  { need: "lx8", title: "Puertos abiertos", goal: "Lista los puertos a la escucha con el programa de cada uno.", hint: "sudo ss -tulpn", sol: "sudo ss -tulpn", ok: "Solo 22, 80, 443 a la red y la base de datos en local: correcto.", check: (c) => used(c, "ss") && /postgres/.test(c.out) },
];
})();
