/* Turno Andino — Campamento Linux (parte 1): diccionario, servidor de práctica y chuleta.
   El servidor srv-web01 del Banco Andino es simulado; sus IP son de rangos privados o de documentación. */

Object.assign(window.GLOSSARY_PLUS = window.GLOSSARY_PLUS || {}, {
  terminal: { es: "Terminal", s: "La ventana donde escribes comandos en vez de usar el ratón. Por dentro, la shell lee lo que escribes y lo ejecuta.", ex: "En un servidor del banco no hay escritorio ni ratón: todo se hace desde la terminal.", al: ["terminal", "línea de comandos"] },
  distro: { es: "Distribución de Linux (distro)", s: "Linux empaquetado con un instalador y programas. Todas usan el mismo kernel; cambian los programas y la forma de instalarlos.", ex: "Ubuntu y Debian son distros muy usadas en servidores.", al: ["distribución de Linux", "distribuciones", "distro"] },
  prompt: { es: "Prompt (indicador)", s: "El texto que la terminal muestra antes del cursor: quién eres, en qué equipo estás y en qué carpeta. Termina en $ (usuario normal) o # (root).", ex: "analista@srv-web01:~$ = usuario analista, servidor srv-web01, carpeta personal.", al: ["prompt"] },
  rutaabs: { es: "Ruta absoluta y ruta relativa", s: "La ruta absoluta es la dirección completa y empieza por /. La relativa parte de la carpeta donde estás.", ex: "/var/log/syslog es absoluta. Si ya estás en /var, la relativa es log/syslog.", al: ["ruta absoluta", "ruta relativa", "rutas absolutas", "rutas relativas"] },
  oculto: { es: "Archivo oculto", s: "Un archivo cuyo nombre empieza por punto no aparece con ls normal; se ve con ls -a. No es seguridad: solo lo quita de la vista.", ex: ".bashrc guarda la configuración de tu terminal y está oculto.", al: ["archivo oculto", "archivos ocultos"] },
  pid: { es: "PID (número de proceso)", s: "El número que Linux le pone a cada programa en ejecución. Con él puedes revisarlo o detenerlo.", ex: "Si un respaldo se quedó pegado con el PID 3150, sudo kill 3150 lo detiene.", al: ["=PID"] },
  daemon: { es: "Servicio (daemon)", s: "Un programa que corre en segundo plano todo el tiempo, sin ventana: el servidor web, SSH, cron. Se maneja con systemctl.", ex: "systemctl status nginx dice si el servidor web está funcionando.", al: ["daemon", "systemctl"] },
  redir: { es: "Redirección (> y >>)", s: "Envía el resultado de un comando a un archivo en vez de a la pantalla. > reemplaza el archivo; >> agrega al final.", ex: "grep 404 access.log > errores.txt guarda esas líneas en errores.txt.", al: ["redirección"] },
  uid: { es: "UID (número de usuario)", s: "El número que identifica a cada usuario. El 0 es root: cualquier cuenta con UID 0 tiene poder total, por eso solo debe existir root.", ex: "En /etc/passwd, analista tiene UID 1000.", al: ["=UID"] },
});

(function () {
  const AUTH = [
    "Sep 29 00:00:01 srv-web01 CRON[1801]: pam_unix(cron:session): session opened for user respaldos(uid=1002) by (uid=0)",
    "Sep 29 00:42:10 srv-web01 CRON[1801]: pam_unix(cron:session): session closed for user respaldos",
    "Sep 29 07:58:03 srv-web01 sshd[3890]: Accepted publickey for lrojas from 10.20.5.14 port 60211 ssh2",
    "Sep 29 08:01:40 srv-web01 sshd[3941]: Failed password for analista from 10.20.5.21 port 60322 ssh2",
    "Sep 29 08:01:52 srv-web01 sshd[3941]: Failed password for analista from 10.20.5.21 port 60322 ssh2",
    "Sep 29 08:02:17 srv-web01 sshd[3941]: Accepted password for analista from 10.20.5.21 port 60322 ssh2",
    "Sep 29 08:05:30 srv-web01 sudo:  analista : TTY=pts/0 ; PWD=/home/analista ; USER=root ; COMMAND=/usr/bin/systemctl restart nginx",
    "Sep 29 08:11:02 srv-web01 sshd[4012]: Failed password for lrojas from 10.20.5.14 port 60455 ssh2",
    "Sep 29 08:11:09 srv-web01 sshd[4012]: Accepted password for lrojas from 10.20.5.14 port 60455 ssh2",
    "Sep 29 08:12:44 srv-web01 sudo:   lrojas : TTY=pts/1 ; PWD=/home/lrojas ; USER=root ; COMMAND=/usr/bin/apt update",
  ].join("\n");
  const SYSLOG = [
    "Sep 29 00:00:01 srv-web01 CRON[1802]: (respaldos) CMD (/usr/local/bin/respaldo-diario.sh)",
    "Sep 29 00:42:10 srv-web01 respaldo-diario.sh[1803]: respaldo terminado: /srv/respaldos/web-2026-09-29.tar.gz",
    "Sep 29 01:12:40 srv-web01 nginx[880]: 2026/09/29 01:12:40 [error] 881#881: *311 upstream timed out (110: Connection timed out)",
    "Sep 29 03:10:22 srv-web01 smartd[701]: Device: /dev/sda [SAT], ERROR count increased from 0 to 1",
    "Sep 29 06:25:01 srv-web01 CRON[2610]: (root) CMD (test -x /usr/sbin/anacron || run-parts --report /etc/cron.daily)",
    "Sep 29 08:05:31 srv-web01 systemd[1]: Stopping nginx.service - A high performance web server...",
    "Sep 29 08:05:31 srv-web01 systemd[1]: Started nginx.service - A high performance web server.",
    "Sep 29 08:12:50 srv-web01 apt[4060]: 3 paquetes se pueden actualizar.",
  ].join("\n");
  const ua = { ip: '"Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)"', win: '"Mozilla/5.0 (Windows NT 10.0; Win64; x64)"', and: '"Mozilla/5.0 (Linux; Android 15)"' };
  const A = (ip, h, req, code, size, u) => `${ip} - - [29/Sep/2026:${h} -0500] "${req} HTTP/1.1" ${code} ${size} "-" ${u}`;
  const ACCESS = [
    A("190.24.8.77", "07:59:12", "GET /banca/login", 200, 5120, ua.ip),
    A("190.24.8.77", "07:59:12", "GET /img/logo.png", 200, 8840, ua.ip),
    A("190.24.8.77", "07:59:30", "POST /banca/login", 302, 0, ua.ip),
    A("190.24.8.77", "07:59:31", "GET /banca/inicio", 200, 8812, ua.ip),
    A("181.52.10.4", "08:01:45", "GET /banca/login", 200, 5120, ua.win),
    A("181.52.10.4", "08:01:58", "POST /banca/login", 302, 0, ua.win),
    A("181.52.10.4", "08:02:00", "GET /banca/inicio", 200, 8812, ua.win),
    A("181.52.10.4", "08:03:10", "GET /banca/transferencias", 200, 6230, ua.win),
    A("200.21.5.9", "08:04:02", "GET /promo-verano", 404, 162, ua.and),
    A("200.21.5.9", "08:04:09", "GET /banca/login", 200, 5120, ua.and),
    A("200.21.5.9", "08:04:40", "POST /banca/login", 302, 0, ua.and),
    A("200.21.5.9", "08:04:41", "GET /banca/inicio", 200, 8812, ua.and),
    A("186.30.77.2", "08:06:15", "GET /banca/login", 200, 5120, ua.ip),
    A("186.30.77.2", "08:06:16", "GET /favicon.ico", 404, 162, ua.ip),
    A("186.30.77.2", "08:06:44", "POST /banca/login", 302, 0, ua.ip),
    A("186.30.77.2", "08:06:45", "GET /banca/inicio", 200, 8812, ua.ip),
  ].join("\n");
  const T0 = "sep 28 18:02";
  window.LX_FS = [
    ["/", "d", "root", "root", 755],
    ["/usr", "d", "root", "root", 755], ["/usr/bin", "d", "root", "root", 755], ["/usr/local", "d", "root", "root", 755], ["/usr/local/bin", "d", "root", "root", 755],
    ["/usr/local/bin/respaldo-diario.sh", "f", "root", "root", 755, "#!/bin/bash\n# Respaldo diario de la configuración del servidor web\ntar -czf /srv/respaldos/web-$(date +%F).tar.gz /etc/nginx /opt/banco\n"],
    ["/etc", "d", "root", "root", 755],
    ["/etc/hostname", "f", "root", "root", 644, "srv-web01\n"],
    ["/etc/hosts", "f", "root", "root", 644, "127.0.0.1 localhost\n10.20.3.15 srv-web01\n10.20.8.5 srv-db01\n"],
    ["/etc/os-release", "f", "root", "root", 644, 'PRETTY_NAME="Ubuntu 24.04.1 LTS"\nNAME="Ubuntu"\nVERSION_ID="24.04"\nVERSION="24.04.1 LTS (Noble Numbat)"\nID=ubuntu\n'],
    ["/etc/passwd", "f", "root", "root", 644, "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nsshd:x:110:65534::/run/sshd:/usr/sbin/nologin\npostgres:x:113:120:PostgreSQL:/var/lib/postgresql:/bin/bash\nanalista:x:1000:1000:Analista SOC:/home/analista:/bin/bash\nlrojas:x:1001:1001:Laura Rojas:/home/lrojas:/bin/bash\nrespaldos:x:1002:1002:Cuenta de respaldos:/home/respaldos:/usr/sbin/nologin\n"],
    ["/etc/shadow", "f", "root", "shadow", 640, "root:*:19990:0:99999:7:::\n"],
    ["/etc/group", "f", "root", "root", 644, "root:x:0:\nadm:x:4:analista\nsudo:x:27:analista,lrojas\nwww-data:x:33:\nanalista:x:1000:\nlrojas:x:1001:\nrespaldos:x:1002:\nsoc:x:1003:analista,lrojas\n"],
    ["/etc/resolv.conf", "f", "root", "root", 644, "nameserver 127.0.0.53\noptions edns0 trust-ad\n"],
    ["/etc/ssh", "d", "root", "root", 755],
    ["/etc/ssh/sshd_config", "f", "root", "root", 644, "# Configuración del servidor SSH\nPort 22\nPermitRootLogin no\nPasswordAuthentication no\nMaxAuthTries 3\n"],
    ["/etc/nginx", "d", "root", "root", 755],
    ["/etc/nginx/nginx.conf", "f", "root", "root", 644, "user www-data;\nworker_processes auto;\nhttp {\n    server_tokens off;\n    include /etc/nginx/sites-enabled/*;\n}\n"],
    ["/home", "d", "root", "root", 755],
    ["/home/analista", "d", "analista", "analista", 750],
    ["/home/analista/notas.txt", "f", "analista", "analista", 644, "Bienvenida al servidor srv-web01 del Banco Andino (simulado).\nTodo lo que hagas aquí es de práctica: no puedes dañar nada real.\nMarta dejó una pista en un archivo oculto de esta carpeta.\n"],
    ["/home/analista/.pista", "f", "analista", "analista", 600, "¡Bien! Los archivos ocultos empiezan por punto y se ven con ls -a.\nTu primera tarea de hoy está en tareas.txt\n"],
    ["/home/analista/.bashrc", "f", "analista", "analista", 644, "# Configuración de la shell bash\nalias ll='ls -la'\nexport HISTSIZE=1000\n"],
    ["/home/analista/tareas.txt", "f", "analista", "analista", 644, "1. Revisar que nginx esté activo\n2. Contar los errores 404 del sitio\n3. Arreglar los permisos de /opt/banco/config.properties\n4. Revisar el espacio en disco\n"],
    ["/home/analista/borrador.txt", "f", "analista", "analista", 644, "texto de prueba que ya no sirve\n"],
    ["/home/analista/reportes", "d", "analista", "analista", 755],
    ["/home/analista/reportes/enero.csv", "f", "analista", "analista", 644, "fecha,transacciones,alertas\n2026-01-31,182004,12\n"],
    ["/home/analista/reportes/febrero.csv", "f", "analista", "analista", 644, "fecha,transacciones,alertas\n2026-02-28,176551,31\n"],
    ["/home/analista/reportes/marzo.csv", "f", "analista", "analista", 644, "fecha,transacciones,alertas\n2026-03-31,190320,18\n"],
    ["/home/lrojas", "d", "lrojas", "lrojas", 750],
    ["/home/lrojas/pendientes.txt", "f", "lrojas", "lrojas", 600, "renovar el certificado del sitio\n"],
    ["/root", "d", "root", "root", 700],
    ["/var", "d", "root", "root", 755], ["/var/log", "d", "root", "syslog", 775],
    ["/var/log/auth.log", "f", "syslog", "adm", 640, AUTH + "\n", "sep 29 08:12"],
    ["/var/log/syslog", "f", "syslog", "adm", 640, SYSLOG + "\n", "sep 29 08:12"],
    ["/var/log/nginx", "d", "root", "adm", 755],
    ["/var/log/nginx/access.log", "f", "www-data", "adm", 640, ACCESS + "\n", "sep 29 08:06"],
    ["/var/log/nginx/error.log", "f", "www-data", "adm", 640, "2026/09/29 01:12:40 [error] 881#881: *311 upstream timed out (110: Connection timed out)\n", "sep 29 01:12"],
    ["/var/www", "d", "root", "root", 755], ["/var/www/html", "d", "www-data", "www-data", 755],
    ["/var/www/html/index.html", "f", "www-data", "www-data", 644, "<h1>Banco Andino</h1>\n"],
    ["/opt", "d", "root", "root", 755], ["/opt/banco", "d", "root", "root", 755],
    ["/opt/banco/README.txt", "f", "root", "root", 644, "Aplicación de banca en línea (simulada).\nLa configuración tiene datos de conexión a la base de datos: sus permisos deben ser 640.\n"],
    ["/opt/banco/config.properties", "f", "root", "root", 666, "db.url=jdbc:postgresql://10.20.8.5:5432/core\ndb.user=app_banca\ndb.password=(en la bóveda de secretos)\n"],
    ["/opt/banco/app.jar", "f", "root", "root", 644, "PK app"],
    ["/srv", "d", "root", "root", 755], ["/srv/respaldos", "d", "respaldos", "respaldos", 755],
    ["/srv/respaldos/web-2026-09-28.tar.gz", "f", "respaldos", "respaldos", 640, "x".repeat(2400), "sep 28 00:41"],
    ["/srv/respaldos/web-2026-09-29.tar.gz", "f", "respaldos", "respaldos", 640, "x".repeat(2410), "sep 29 00:42"],
    ["/tmp", "d", "root", "root", 1777],
    ["/tmp/.X11-unix", "d", "root", "root", 1777],
    ["/tmp/sesion_8812.tmp", "f", "www-data", "www-data", 600, "sesión temporal\n"],
  ].map((r) => { if (!r[6]) r[6] = T0; return r; });

  /* Procesos: [usuario, PID, %CPU, %MEM, TTY, STAT, inicio, tiempo, comando] */
  window.LX_PROCS = [
    ["root", 1, "0.0", "0.3", "?", "Ss", "sep28", "0:04", "/sbin/init"],
    ["syslog", 540, "0.0", "0.1", "?", "Ssl", "sep28", "0:01", "/usr/sbin/rsyslogd -n"],
    ["root", 612, "0.0", "0.2", "?", "Ss", "sep28", "0:00", "sshd: /usr/sbin/sshd -D"],
    ["postgres", 760, "0.4", "2.1", "?", "Ss", "sep28", "1:02", "/usr/lib/postgresql/16/bin/postgres -D /var/lib/postgresql/16/main"],
    ["root", 880, "0.0", "0.1", "?", "Ss", "sep28", "0:00", "nginx: master process /usr/sbin/nginx"],
    ["www-data", 881, "0.3", "0.4", "?", "S", "sep28", "0:12", "nginx: worker process"],
    ["root", 905, "0.0", "0.1", "?", "Ss", "sep28", "0:00", "/usr/sbin/cron -f"],
    ["respaldos", 3150, "64.2", "0.8", "?", "R", "07:30", "41:10", "tar -czf /srv/respaldos/web-extra.tar.gz /var/www"],
    ["analista", 4021, "0.0", "0.1", "pts/0", "Ss", "08:02", "0:00", "-bash"],
  ];
  /* Puertos a la escucha: [protocolo, dirección, PID, programa] */
  window.LX_PORTS = [
    ["udp", "127.0.0.53%lo:53", 0, "systemd-resolve"],
    ["tcp", "0.0.0.0:22", 612, "sshd"],
    ["tcp", "0.0.0.0:80", 880, "nginx"],
    ["tcp", "0.0.0.0:443", 880, "nginx"],
    ["tcp", "127.0.0.1:5432", 760, "postgres"],
  ];

  /* Chuleta: [grupo, [comando, qué hace, ejemplo]] */
  window.LX_CHEAT = [
    ["Orientarte", [["pwd", "Dice en qué carpeta estás", "pwd"], ["ls -la", "Lista todo, con detalles y ocultos", "ls -la /var/log"], ["cd", "Cambia de carpeta (cd .. sube, cd vuelve a casa)", "cd /etc"], ["whoami · id", "Quién eres y en qué grupos estás", "id"]]],
    ["Leer", [["cat", "Muestra un archivo completo", "cat /etc/hostname"], ["less", "Lee por páginas (q para salir)", "less /var/log/syslog"], ["head · tail", "Primeras o últimas líneas", "tail -n 20 /var/log/auth.log"], ["tail -f", "Sigue un log en vivo (Ctrl+C para salir)", "tail -f /var/log/syslog"], ["wc -l", "Cuenta líneas", "wc -l /var/log/auth.log"]]],
    ["Archivos", [["mkdir -p", "Crea carpetas", "mkdir -p ~/casos/2026"], ["touch", "Crea un archivo vacío", "touch notas.txt"], ["cp · cp -r", "Copia archivos o carpetas", "cp config.properties config.bak"], ["mv", "Mueve o renombra", "mv viejo.txt nuevo.txt"], ["rm · rm -r", "Borra (no hay papelera)", "rm borrador.txt"]]],
    ["Buscar", [["grep", "Busca texto dentro de archivos (-i, -c, -v, -n, -r)", "grep -i error /var/log/syslog"], ["find", "Busca archivos por nombre o tipo", "find /etc -name \"*.conf\""]]],
    ["Unir comandos", [["|", "Pasa el resultado al siguiente comando", "grep 404 access.log | wc -l"], ["> · >>", "Guarda en un archivo (reemplaza · agrega)", "ls > lista.txt"], ["sort · uniq -c", "Ordena y cuenta repetidos", "sort | uniq -c | sort -nr"], ["awk · cut", "Saca columnas", "awk '{print $1}' access.log"]]],
    ["Permisos", [["ls -l", "Muestra permisos: rwx de dueño, grupo y otros", "ls -l /opt/banco"], ["chmod", "Cambia permisos (640 = rw- r-- ---)", "sudo chmod 640 archivo"], ["chown", "Cambia el dueño", "sudo chown root:root archivo"], ["sudo", "Ejecuta un comando como administrador (queda registrado)", "sudo systemctl restart nginx"]]],
    ["Sistema y red", [["ps aux", "Lista los procesos", "ps aux"], ["top", "Procesos en vivo, ordenados por CPU", "top"], ["kill", "Detiene un proceso por su PID", "sudo kill 3150"], ["systemctl", "Estado de un servicio", "systemctl status nginx"], ["ss -tulpn", "Puertos que esperan conexiones", "sudo ss -tulpn"], ["ip a", "Tus direcciones IP", "ip a"], ["df -h · free -h", "Espacio en disco y memoria", "df -h"], ["ping", "¿Responde otro equipo?", "ping -c 3 10.20.8.5"]]],
  ];
})();
