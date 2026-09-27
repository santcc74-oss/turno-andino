/* CyberRuta — certificaciones, rangos, insignias, datos de juegos y preguntas extra. */

window.RANKS = [
  [0, "Aspirante"], [600, "Becario de TI"], [1500, "Analista SOC N1"], [2800, "Analista SOC N2"],
  [4200, "Ingeniero de Seguridad"], [5800, "Especialista en Seguridad Bancaria"], [7500, "Arquitecto de Seguridad"], [9500, "CISO en formación"],
];

window.CERTS = [
  { id: "isc2cc", name: "ISC2 Certified in Cybersecurity (CC)", level: "Entrada", cost: "Curso y examen gratis (programa 1M Certified)", mods: ["m01","m07","m08","m13","m14","m15","m21"], url: "https://www.isc2.org/certifications/cc", why: "Tu primera certificación: barata, reconocida y te da confianza." },
  { id: "gcyber", name: "Google Cybersecurity Certificate", level: "Entrada", cost: "Suscripción Coursera (hay ayuda financiera)", mods: ["m04a","m04","m05","m06","m08","m10","m16","m19","m21"], url: "https://www.coursera.org/professional-certificates/google-cybersecurity", why: "Enfocado en SOC, con Linux, SQL, Python y SIEM." },
  { id: "secplus", name: "CompTIA Security+ (SY0-701)", level: "Base del sector", cost: "~404 USD (busca vouchers con descuento)", mods: ["m07","m08","m09","m13","m14","m15","m16","m17","m18","m19","m20","m21","m25","m26","m27"], url: "https://www.comptia.org/certifications/security", why: "La meta principal. La piden en muchas vacantes de bancos y multinacionales." },
  { id: "btl1", name: "Blue Team Level 1 (BTL1)", level: "Práctica SOC", cost: "~500 USD", mods: ["m09","m16","m19","m20","m21"], url: "https://www.securityblue.team/certifications/blue-team-level-1", why: "Examen 100% práctico de 24 horas: demuestra habilidad real de analista." },
  { id: "cysa", name: "CompTIA CySA+", level: "Intermedio", cost: "~404 USD", mods: ["m18","m19","m20","m21","m24"], url: "https://www.comptia.org/certifications/cybersecurity-analyst", why: "Siguiente paso natural tras Security+ para analistas SOC." },
  { id: "ejpt", name: "eJPT (INE)", level: "Ofensiva de entrada", cost: "~250 USD", mods: ["m04","m05","m07","m08","m09","m17","m18"], url: "https://ine.com/security/certifications/ejpt-certification", why: "Si te atrae el pentesting: práctica y accesible." },
  { id: "aws", name: "AWS Cloud Practitioner → Security Specialty", level: "Cloud", cost: "100 USD / 300 USD", mods: ["m15","m25"], url: "https://aws.amazon.com/certification/", why: "Los bancos migran a la nube y faltan perfiles cloud security." },
  { id: "iso", name: "ISO/IEC 27001 Foundation / Lead Implementer", level: "GRC", cost: "Variable (PECB, ISACA)", mods: ["m13","m23","m26"], url: "https://pecb.com/", why: "Muy valorada en bancos para cargos de riesgo y cumplimiento." },
  { id: "pcip", name: "PCI Professional (PCIP)", level: "Banca y pagos", cost: "Consultar PCI SSC", mods: ["m22","m23","m24"], url: "https://www.pcisecuritystandards.org/program_training_and_qualification/pci_professional_qualification/", why: "Te especializa en seguridad de pagos con tarjeta." },
];

window.BADGES = [
  { id: "first", name: "Primer paso", desc: "Completa tu primer módulo", test: s => Object.keys(s.done).length >= 1 },
  { id: "tux", name: "Pingüino", desc: "Termina el nivel Linux", test: s => ["m04","m05","m06"].every(m => s.done[m]) },
  { id: "net", name: "Paquete en tránsito", desc: "Termina el nivel de redes", test: s => ["m07","m08","m09"].every(m => s.done[m]) },
  { id: "py", name: "Pythonista", desc: "Termina Python desde cero y Automatización", test: s => ["m10","m11"].every(m => s.done[m]) },
  { id: "lab5", name: "Manos a la obra", desc: "Completa 5 laboratorios", test: s => Object.keys(s.labs).length >= 5 },
  { id: "port3", name: "Portafolio vivo", desc: "Publica 3 proyectos de portafolio", test: s => Object.values(s.posted || {}).filter(Boolean).length >= 3 },
  { id: "perfect", name: "Sin errores", desc: "Saca 100% en un examen", test: s => Object.values(s.done).some(v => v >= 100) },
  { id: "term", name: "Operador de terminal", desc: "Completa todas las misiones del simulador", test: s => (s.games.terminal || 0) >= 5 },
  { id: "phish", name: "Ojo de halcón", desc: "8/8 en ¿Phishing o legítimo?", test: s => (s.games.phish || 0) >= 8 },
  { id: "streak7", name: "Constancia", desc: "Racha de 7 días", test: s => (s.streak.best || 0) >= 7 },
  { id: "bank", name: "Guardián de la bóveda", desc: "Termina el nivel de seguridad bancaria", test: s => ["m22","m23","m24"].every(m => s.done[m]) },
  { id: "secplus", name: "Listo para Security+", desc: "Aprueba el simulacro final", test: s => !!s.done.m27 },
];

/* ——— Juego: ¿Phishing o legítimo? (casos ficticios) ——— */
window.PHISH = [
  { from: "Seguridad Banco Andino <alertas@bancoandino-seguridad.co>", subj: "URGENTE: su cuenta será bloqueada en 2 horas", body: "Detectamos actividad inusual. Para evitar el bloqueo, confirme su usuario, contraseña y el código que le llegará por SMS en el siguiente enlace: bancoandino-verificacion.com/login", phish: true, why: "Urgencia, dominio distinto al oficial y solicitud del código SMS: ningún banco lo pide." },
  { from: "Banco Andino <notificaciones@bancoandino.com.co>", subj: "Comprobante de su transferencia", body: "Realizó una transferencia de $150.000 a la cuenta terminada en 4821. Si no la reconoce, llame a la línea que aparece al respaldo de su tarjeta o ingrese directamente a la app.", phish: false, why: "No pide datos ni tiene enlaces; te dirige a canales que ya conoces." },
  { from: "DIAN <notificacion@dian-gov.info>", subj: "Proceso de embargo — descargue el documento", body: "Tiene un proceso pendiente. Descargue el archivo adjunto 'Embargo_2026.zip' y ejecute el documento para ver los detalles.", phish: true, why: "Suplantación de entidad del gobierno, dominio falso y adjunto comprimido ejecutable: típico de troyanos bancarios." },
  { from: "Carlos Ruiz (Presidente) <carlos.ruiz.presidencia@gmail.com>", subj: "Pago confidencial hoy", body: "Estoy en una reunión y no puedo hablar. Necesito que hagas hoy una transferencia a un nuevo proveedor. Es confidencial, no lo comentes. Te paso los datos de la cuenta.", phish: true, why: "BEC: autoridad, secreto, urgencia, correo personal y cambio de cuenta de pago." },
  { from: "TI Interno <soporte@bancoandino.com.co>", subj: "Mantenimiento programado del sábado", body: "El sábado de 10 p.m. a 2 a.m. habrá mantenimiento del correo. No se requiere ninguna acción de su parte. Dudas: extensión 4400.", phish: false, why: "Informativo, no pide acciones ni credenciales, dominio corporativo y canal interno verificable." },
  { from: "Microsoft 365 <no-reply@micros0ft-support.com>", subj: "Su contraseña expira hoy", body: "Mantenga su contraseña actual haciendo clic aquí y escribiendo sus credenciales corporativas.", phish: true, why: "Dominio con un cero en lugar de 'o' y solicitud de credenciales." },
  { from: "Proveedor Logística SAS <facturacion@logisticasas.com>", subj: "Actualizamos nuestra cuenta bancaria", body: "A partir de este mes, por favor consignen nuestras facturas en la nueva cuenta que adjuntamos. La anterior quedó inactiva.", phish: true, why: "Cambio de cuenta de pago por correo: verifica siempre llamando al número registrado del proveedor, no al del correo." },
  { from: "Recursos Humanos <rrhh@bancoandino.com.co>", subj: "Encuesta de clima laboral 2026", body: "Participa en la encuesta anual desde la intranet (Inicio → Gestión humana → Encuestas). Es anónima y toma 10 minutos.", phish: false, why: "Te lleva a la intranet por navegación conocida, sin enlaces ni datos sensibles." },
];

/* ——— Juego: Port Match ——— */
window.PORTS = [["22","SSH"],["53","DNS"],["80","HTTP"],["443","HTTPS"],["3389","RDP"],["445","SMB"],["25","SMTP"],["3306","MySQL"],["1433","SQL Server"],["23","Telnet"],["21","FTP"],["514","Syslog"]];

/* ——— Juego: Cazador de logs (servidor de banca en línea ficticio) ——— */
window.LOGCASES = [
  { title: "Caso 1 · Login de banca en línea",
    lines: [
      "08:01:12 200 POST /login user=mgomez ip=181.52.10.4 result=OK",
      "08:03:40 200 POST /login user=jperez ip=190.24.8.77 result=OK",
      "08:04:02 401 POST /login user=agarcia ip=45.155.204.19 result=FAIL",
      "08:04:03 401 POST /login user=lrojas ip=45.155.204.19 result=FAIL",
      "08:04:03 401 POST /login user=cmora ip=45.155.204.19 result=FAIL",
      "08:04:04 401 POST /login user=dvega ip=45.155.204.19 result=FAIL",
      "08:04:05 401 POST /login user=ptorres ip=45.155.204.19 result=FAIL",
      "08:04:05 200 POST /login user=scastro ip=45.155.204.19 result=OK",
      "08:04:09 200 GET /cuentas/88213/saldo user=scastro ip=45.155.204.19",
      "08:04:15 200 POST /transferencias user=scastro ip=45.155.204.19 monto=4.900.000 destino=NUEVO",
      "08:05:30 200 POST /login user=mgomez ip=181.52.10.4 result=OK",
      "08:06:44 401 POST /login user=jperez ip=190.24.8.77 result=FAIL",
      "08:06:51 200 POST /login user=jperez ip=190.24.8.77 result=OK",
    ],
    qs: [
      { q: "¿Qué IP está atacando?", a: ["181.52.10.4","190.24.8.77","45.155.204.19"], c: 2 },
      { q: "¿Qué técnica usa?", a: ["Fuerza bruta a una sola cuenta","Password spraying: una contraseña contra muchas cuentas","Inyección SQL"], c: 1 },
      { q: "¿Qué cuenta fue comprometida?", a: ["jperez","scastro","mgomez"], c: 1 },
      { q: "¿Qué harías primero?", a: ["Cerrar el caso: jperez también falló","Bloquear la sesión de scastro, detener la transferencia y bloquear la IP","Esperar a mañana"], c: 1 },
    ] },
  { title: "Caso 2 · Servidor Linux de reportes",
    lines: [
      "Sep 20 02:11:03 rpt sshd[1201]: Failed password for root from 103.77.12.9 port 51122",
      "Sep 20 02:11:05 rpt sshd[1203]: Failed password for root from 103.77.12.9 port 51130",
      "Sep 20 02:11:07 rpt sshd[1205]: Failed password for admin from 103.77.12.9 port 51141",
      "Sep 20 02:14:44 rpt sshd[1290]: Accepted password for backup from 103.77.12.9 port 51388",
      "Sep 20 02:15:02 rpt sudo: backup : COMMAND=/usr/bin/crontab -e",
      "Sep 20 02:15:40 rpt useradd[1322]: new user: name=sysupd, UID=0",
      "Sep 20 02:16:10 rpt sshd[1340]: Accepted publickey for sysupd from 103.77.12.9",
      "Sep 20 07:58:00 rpt sshd[1402]: Accepted publickey for lrojas from 10.20.5.14",
    ],
    qs: [
      { q: "¿Qué cuenta usó el atacante para entrar?", a: ["root","backup","lrojas"], c: 1 },
      { q: "¿Qué indica 'new user sysupd UID=0'?", a: ["Un usuario normal","Una cuenta con privilegios de root creada para persistencia","Una actualización del sistema"], c: 1 },
      { q: "¿Por qué revisar crontab?", a: ["Porque pudo dejar una tarea programada de persistencia","Porque cron cifra archivos","No es relevante"], c: 0 },
      { q: "¿Qué técnica de MITRE aplica a la creación de la cuenta?", a: ["T1136 Create Account","T1566 Phishing","T1486 Data Encrypted for Impact"], c: 0 },
    ] },
];

/* ——— Simulador de terminal: sistema de archivos ficticio ——— */
window.FS = {
  "/": ["home","var","etc","opt","tmp"],
  "/home": ["analista"],
  "/home/analista": ["notas.txt",".pista","reportes"],
  "/home/analista/reportes": ["enero.csv","febrero.csv"],
  "/var": ["log"],
  "/var/log": ["auth.log","syslog","banca-web.log"],
  "/etc": ["passwd","hostname","ssh"],
  "/etc/ssh": ["sshd_config"],
  "/opt": ["banco"],
  "/opt/banco": ["config.properties","app.jar"],
  "/tmp": [".x11-cache"],
  "/tmp/.x11-cache": ["minero.sh"],
};
window.FILES = {
  "/home/analista/notas.txt": "Bienvenido al servidor rpt-01 del Banco Andino (ficticio).\nTu jefe dejó una pista en un archivo oculto de tu carpeta personal.",
  "/home/analista/.pista": "Bien hecho: los archivos ocultos empiezan por punto.\nSiguiente: revisa /var/log/auth.log y cuenta los intentos fallidos.\nFLAG{archivos_ocultos}",
  "/home/analista/reportes/enero.csv": "fecha,transacciones,alertas\n2026-01-31,182004,12",
  "/home/analista/reportes/febrero.csv": "fecha,transacciones,alertas\n2026-02-28,176551,31",
  "/var/log/auth.log": "Sep 20 02:11:03 rpt sshd: Failed password for root from 103.77.12.9\nSep 20 02:11:05 rpt sshd: Failed password for root from 103.77.12.9\nSep 20 02:11:07 rpt sshd: Failed password for admin from 103.77.12.9\nSep 20 02:12:20 rpt sshd: Failed password for backup from 103.77.12.9\nSep 20 02:14:44 rpt sshd: Accepted password for backup from 103.77.12.9\nSep 20 07:58:00 rpt sshd: Accepted publickey for lrojas from 10.20.5.14\nSep 20 08:02:11 rpt sshd: Failed password for lrojas from 10.20.5.14\nSep 20 08:02:15 rpt sshd: Accepted password for lrojas from 10.20.5.14",
  "/var/log/syslog": "Sep 20 02:15:02 rpt CRON: (backup) EDIT (crontab)\nSep 20 02:20:00 rpt CRON: (backup) CMD (/tmp/.x11-cache/minero.sh)",
  "/var/log/banca-web.log": "08:04:05 POST /login user=scastro ip=45.155.204.19 result=OK\n08:04:15 POST /transferencias user=scastro monto=4900000",
  "/etc/passwd": "root:x:0:0:root:/root:/bin/bash\nanalista:x:1000:1000::/home/analista:/bin/bash\nbackup:x:1001:1001::/home/backup:/bin/bash\nsysupd:x:0:0::/root:/bin/bash",
  "/etc/hostname": "rpt-01",
  "/etc/ssh/sshd_config": "Port 22\nPermitRootLogin yes\nPasswordAuthentication yes",
  "/opt/banco/config.properties": "db.url=jdbc:postgresql://10.20.8.5:5432/core\ndb.user=app_reportes\ndb.password=********  # debería estar en una bóveda de secretos",
  "/opt/banco/app.jar": "[archivo binario]",
  "/tmp/.x11-cache/minero.sh": "#!/bin/bash\n# script sospechoso (ficticio) ejecutado por cron cada 5 minutos",
};
window.MISSIONS = [
  { goal: "Encuentra el archivo oculto de tu carpeta personal y léelo.", hint: "ls -la y luego cat .pista", check: (cmd, out) => /FLAG\{archivos_ocultos\}/.test(out) },
  { goal: "¿Cuántos intentos fallidos hay en /var/log/auth.log? Usa grep y wc.", hint: "grep Failed /var/log/auth.log | wc -l", check: (cmd, out) => /^\s*4\s*$/.test(out) && /grep/.test(cmd) },
  { goal: "Encuentra la cuenta con UID 0 que no debería existir en /etc/passwd.", hint: "grep ':0:' /etc/passwd", check: (cmd, out) => /sysupd/.test(out) && /grep/.test(cmd) },
  { goal: "Descubre qué ejecuta cron por cuenta del usuario backup (revisa syslog).", hint: "grep CMD /var/log/syslog", check: (cmd, out) => /minero\.sh/.test(out) },
  { goal: "Identifica la configuración insegura de SSH.", hint: "cat /etc/ssh/sshd_config", check: (cmd, out) => /PermitRootLogin yes/.test(out) },
];

/* ——— Preguntas extra del simulacro Security+ ——— */
window.EXTRA_Q = [
  { q: "¿Qué control es compensatorio?", a: ["Un firewall nuevo","Monitoreo adicional mientras no se puede parchar un sistema heredado","Un antivirus","Un backup"], c: 1, w: "Sustituye temporalmente al control principal." },
  { q: "Un atacante envía correos a directivos específicos. Es…", a: ["Whaling","Smishing","Vishing","Pharming"], c: 0, w: "Phishing dirigido a altos cargos." },
  { q: "¿Qué garantiza que un dato no fue modificado?", a: ["Cifrado","Hashing","Tokenización","Ofuscación"], c: 1, w: "Integridad." },
  { q: "Un honeypot es un control…", a: ["Correctivo","Detectivo / de engaño","Físico","Preventivo"], c: 1, w: "Atrae y detecta atacantes." },
  { q: "¿Qué describe mejor un plan de continuidad del negocio (BCP)?", a: ["Cómo restaurar un servidor","Cómo mantener las funciones críticas del negocio durante una interrupción","Un antivirus","Un pentest"], c: 1, w: "El DRP se enfoca en TI; el BCP en el negocio." },
  { q: "SAML se usa principalmente para…", a: ["Cifrar discos","Federación e inicio de sesión único","Escanear puertos","Backups"], c: 1, w: "SSO federado." },
  { q: "¿Cuál es un ejemplo de 'algo que eres'?", a: ["PIN","Token físico","Huella dactilar","Contraseña"], c: 2, w: "Biometría." },
  { q: "Un sistema que ya no recibe parches del fabricante es…", a: ["Zero-day","End-of-life (EOL)","Sandbox","Honeypot"], c: 1, w: "Riesgo de sistemas heredados." },
  { q: "¿Qué tipo de prueba da al evaluador conocimiento total del sistema?", a: ["Caja negra","Caja blanca (known environment)","Caja gris","Ninguna"], c: 1, w: "Known environment." },
  { q: "El objetivo del hardening es…", a: ["Aumentar funciones","Reducir la superficie de ataque","Acelerar la red","Crear usuarios"], c: 1, w: "Menos servicios, menos riesgo." },
  { q: "Un SOAR sirve para…", a: ["Automatizar y orquestar la respuesta","Cifrar datos","Escribir políticas","Diseñar redes"], c: 0, w: "Security Orchestration, Automation and Response." },
  { q: "¿Qué documento define el nivel de servicio acordado con un proveedor?", a: ["NDA","SLA","MOU","AUP"], c: 1, w: "Service Level Agreement." },
  { q: "Un atacante con acceso físico sigue a un empleado por una puerta segura:", a: ["Tailgating","Shoulder surfing","Dumpster diving","Pretexting"], c: 0, w: "Control: puertas tipo esclusa (mantrap) y concienciación." },
  { q: "¿Qué reduce mejor el impacto de un ransomware?", a: ["Pagar rápido","Backups offline/inmutables probados","Cambiar el fondo de pantalla","Desactivar logs"], c: 1, w: "Recuperación sin pagar." },
  { q: "La clasificación de datos sirve para…", a: ["Ordenar alfabéticamente","Aplicar controles según la sensibilidad del dato","Borrar datos","Comprimir"], c: 1, w: "Público, interno, confidencial, restringido." },
];

/* ——— Inglés para entrevistas ——— */
window.INTERVIEW = [
  ["Tell me about yourself.", "I'm an aspiring SOC analyst focused on banking security. I built a home lab with Wazuh, where I write detection rules and investigate alerts, and I'm preparing for Security+."],
  ["What is the CIA triad?", "It stands for confidentiality, integrity and availability, the three core goals of information security. In a bank, integrity means nobody can change a transfer amount."],
  ["How would you handle a phishing report?", "I'd analyze the headers and links in a safe environment, look for other recipients, remove the email from all mailboxes, block the indicators, and reset credentials for anyone who clicked."],
  ["What's the difference between IDS and IPS?", "An IDS detects and alerts; an IPS sits inline and can block the traffic."],
  ["Why banking security?", "Banks are high-value targets and heavily regulated, so security has real impact on people's money and trust. I like combining technical work with standards like PCI DSS."],
  ["Describe a project you're proud of.", "I built a mini SOC with Wazuh, onboarded Linux and Windows agents, wrote a custom brute-force rule and documented three investigations on GitHub."],
];
