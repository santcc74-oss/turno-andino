/* Turno Andino — minijuegos con ejemplos reales: código, encabezados de correo, consultas de SIEM y CVE.
   Todo es defensivo: se muestra el error y cómo se corrige. Las IP usan rangos de documentación (192.0.2.x,
   198.51.100.x, 203.0.113.x) y los dominios del banco son ficticios. Los CVE y sus puntajes CVSS 3.x son reales. */

/* ——— Revisión de código: toca la línea vulnerable. bad = índice de la línea. ——— */
window.CODE = [
  { lang: "Python", title: "Buscar un cliente por cédula", tags: ["LIM", "MEX"], lines: [
    "def buscar_cliente(conn, cedula):",
    "    cur = conn.cursor()",
    "    sql = \"SELECT * FROM clientes WHERE cedula = '\" + cedula + \"'\"",
    "    cur.execute(sql)",
    "    return cur.fetchone()"], bad: 2,
    fix: "cur.execute(\"SELECT * FROM clientes WHERE cedula = %s\", (cedula,))",
    why: "Inyección SQL: el dato del usuario se pega dentro de la consulta. Con una consulta parametrizada, la base de datos trata la cédula como dato y nunca como código." },
  { lang: "Python", title: "Consultar la reputación de una IP", tags: ["LIM"], lines: [
    "import requests",
    "",
    "API_KEY = \"a7f3c9e1-demo-no-real-4b2d\"",
    "",
    "def reputacion(ip):",
    "    r = requests.get(f\"https://api.ejemplo.com/ip/{ip}\",",
    "                     headers={\"Authorization\": API_KEY}, timeout=5)",
    "    return r.json()"], bad: 2,
    fix: "API_KEY = os.environ[\"REPUTACION_API_KEY\"]",
    why: "Secreto escrito en el código: termina en GitHub y cualquiera lo puede usar. Va en una variable de entorno o en una bóveda de secretos." },
  { lang: "Python", title: "Guardar la contraseña de un usuario", tags: ["LIM", "SCL"], lines: [
    "import hashlib",
    "",
    "def guardar_clave(usuario, clave):",
    "    h = hashlib.md5(clave.encode()).hexdigest()",
    "    db.guardar(usuario, h)"], bad: 3,
    fix: "h = bcrypt.hashpw(clave.encode(), bcrypt.gensalt())",
    why: "MD5 es rápido y sin sal: se rompe con diccionarios y tablas precalculadas. Para contraseñas se usan algoritmos lentos con sal, como bcrypt o Argon2." },
  { lang: "Python", title: "Calculadora del portal", tags: ["LIM", "MEX"], lines: [
    "def calcular(expresion):",
    "    # expresion llega desde un formulario web",
    "    return eval(expresion)"], bad: 2,
    fix: "return ast.literal_eval(expresion)  # o valida que solo haya números y operadores",
    why: "eval ejecuta cualquier código Python que escriba el usuario. Nunca uses eval con datos que vienen de afuera." },
  { lang: "Python", title: "Hacer ping a un servidor", tags: ["LIM", "MDE"], lines: [
    "import subprocess",
    "",
    "def hacer_ping(host):",
    "    # host viene del usuario",
    "    return subprocess.run(\"ping -c 1 \" + host, shell=True, capture_output=True)"], bad: 4,
    fix: "return subprocess.run([\"ping\", \"-c\", \"1\", host], capture_output=True)",
    why: "Inyección de comandos: con shell=True, un host como «8.8.8.8; cat /etc/passwd» ejecuta un segundo comando. Pasa los argumentos como lista y valida el host." },
  { lang: "Python", title: "Consultar el saldo en el core", tags: ["LIM", "PTY"], lines: [
    "import requests",
    "",
    "def consultar_saldo(token):",
    "    r = requests.get(\"https://core.bancoandino.local/saldo\",",
    "                     headers={\"Authorization\": \"Bearer \" + token},",
    "                     verify=False)",
    "    return r.json()"], bad: 5,
    fix: "verify=\"/etc/ssl/certs/ca-bancoandino.pem\"  # valida el certificado",
    why: "verify=False apaga la validación del certificado TLS. Cualquiera en medio de la red podría hacerse pasar por el core y leer el token." },
  { lang: "Python", title: "Generar un código para reiniciar la clave", tags: ["LIM", "SCL"], lines: [
    "import random",
    "",
    "def token_reinicio():",
    "    return str(random.randint(100000, 999999))"], bad: 3,
    fix: "return secrets.token_urlsafe(32)",
    why: "El módulo random es predecible y no sirve para seguridad. Para tokens se usa secrets, que usa una fuente criptográfica." },
  { lang: "Python", title: "Arrancar la API interna", tags: ["LIM", "MEX"], lines: [
    "from flask import Flask",
    "app = Flask(__name__)",
    "",
    "if __name__ == \"__main__\":",
    "    app.run(host=\"0.0.0.0\", debug=True)"], bad: 4,
    fix: "app.run(host=\"127.0.0.1\", debug=False)",
    why: "El modo debug de Flask abre una consola que permite ejecutar código en el servidor, y 0.0.0.0 la expone a toda la red. Nunca en producción." },
  { lang: "Java", title: "Consultar el saldo de una cuenta", tags: ["LIM", "PTY"], lines: [
    "String sql = \"SELECT saldo FROM cuentas WHERE id = \" + idCuenta;",
    "Statement st = conn.createStatement();",
    "ResultSet rs = st.executeQuery(sql);"], bad: 0,
    fix: "PreparedStatement ps = conn.prepareStatement(\"SELECT saldo FROM cuentas WHERE id = ?\"); ps.setLong(1, idCuenta);",
    why: "La misma inyección SQL, en Java. PreparedStatement con parámetros separa el dato de la consulta." },
  { lang: "Java", title: "Registrar un pago", tags: ["PTY", "LIM"], lines: [
    "public void procesarPago(Pago p) {",
    "    log.info(\"Pago recibido: tarjeta={} monto={}\", p.getNumeroTarjeta(), p.getMonto());",
    "    autorizador.enviar(p);",
    "}"], bad: 1,
    fix: "log.info(\"Pago recibido: tarjeta={} monto={}\", enmascarar(p.getNumeroTarjeta()), p.getMonto());",
    why: "El número completo de la tarjeta (PAN) queda en los logs. PCI DSS exige no guardarlo en claro: se muestran solo los últimos 4 dígitos." },
  { lang: "Java", title: "Ver una cuenta desde la API", tags: ["MEX", "PTY"], lines: [
    "@GetMapping(\"/cuentas/{id}\")",
    "public Cuenta verCuenta(@PathVariable Long id) {",
    "    return cuentaRepo.findById(id).orElseThrow();",
    "}"], bad: 2,
    fix: "return cuentaRepo.findByIdAndTitular(id, usuarioActual().getId()).orElseThrow();",
    why: "Control de acceso roto (IDOR), el riesgo #1 de OWASP: cualquiera cambia el número en la URL y ve cuentas ajenas. Hay que comprobar que la cuenta sea del usuario." },
  { lang: "JavaScript", title: "Saludo en la página de inicio", tags: ["MEX"], lines: [
    "const params = new URLSearchParams(location.search);",
    "const nombre = params.get(\"nombre\");",
    "document.getElementById(\"saludo\").innerHTML = \"Hola, \" + nombre;"], bad: 2,
    fix: "document.getElementById(\"saludo\").textContent = \"Hola, \" + nombre;",
    why: "XSS: lo que venga en la URL se inserta como HTML y puede ejecutar scripts en el navegador de la víctima. textContent lo muestra como texto." },
  { lang: "sshd_config", title: "Configuración de SSH del servidor rpt-01", tags: ["MDE"], lines: [
    "Port 22",
    "PermitRootLogin yes",
    "PasswordAuthentication no",
    "MaxAuthTries 3"], bad: 1,
    fix: "PermitRootLogin no",
    why: "Permitir que root entre directo por SSH le regala al atacante el usuario más poderoso. Se entra con un usuario normal y se usa sudo, que además deja registro." },
  { lang: "JSON · AWS", title: "Política del bucket de extractos", tags: ["MAD"], lines: [
    "{",
    "  \"Effect\": \"Allow\",",
    "  \"Principal\": \"*\",",
    "  \"Action\": \"s3:GetObject\",",
    "  \"Resource\": \"arn:aws:s3:::andino-extractos/*\"",
    "}"], bad: 2,
    fix: "\"Principal\": { \"AWS\": \"arn:aws:iam::111122223333:role/app-extractos\" }",
    why: "Principal \"*\" significa «cualquiera en internet»: los extractos de los clientes quedan públicos. Solo el rol de la aplicación debe poder leerlos." },
];

/* ——— Encabezados de correo: ¿legítimo o suplantado? clue = líneas que lo delatan. ——— */
window.HEADERS = [
  { legit: false, clue: [0, 5, 7], lines: [
    "Return-Path: <soporte@andino-alertas.xyz>",
    "Received: from mail.andino-alertas.xyz (203.0.113.45)",
    "From: \"Banco Andino\" <seguridad@bancoandino.com.co>",
    "Subject: Verifique su cuenta hoy",
    "Authentication-Results: mx.bancoandino.com.co;",
    "  spf=fail smtp.mailfrom=andino-alertas.xyz;",
    "  dkim=none;",
    "  dmarc=fail (p=reject) header.from=bancoandino.com.co"],
    why: "El From dice bancoandino.com.co, pero salió de andino-alertas.xyz: SPF falla, no hay firma DKIM y DMARC falla. El From visible se puede falsificar; los resultados de autenticación no." },
  { legit: true, clue: [5, 6, 7], lines: [
    "Return-Path: <nomina@bancoandino.com.co>",
    "Received: from mail-out.bancoandino.com.co (198.51.100.20)",
    "From: \"Nómina\" <nomina@bancoandino.com.co>",
    "Subject: Comprobante de pago de septiembre",
    "Authentication-Results: mx.bancoandino.com.co;",
    "  spf=pass smtp.mailfrom=bancoandino.com.co;",
    "  dkim=pass header.d=bancoandino.com.co;",
    "  dmarc=pass header.from=bancoandino.com.co"],
    why: "SPF, DKIM y DMARC pasan, y todos coinciden con el dominio del From. El servidor de salida es el del banco." },
  { legit: false, clue: [0, 1], lines: [
    "From: \"Carlos Ruiz\" <presidencia@bancoandlno.com.co>",
    "Reply-To: <carlos.ruiz.pres@gmail.com>",
    "Subject: Pago urgente y confidencial",
    "Authentication-Results: mx.bancoandino.com.co;",
    "  spf=pass smtp.mailfrom=bancoandlno.com.co;",
    "  dkim=pass header.d=bancoandlno.com.co;",
    "  dmarc=pass header.from=bancoandlno.com.co"],
    why: "Todo «pasa», pero el dominio es bancoandlno (una L en lugar de la i). El atacante registró ese dominio, así que sus propios SPF y DKIM funcionan. Además, las respuestas van a Gmail. Autenticado no significa legítimo." },
  { legit: true, clue: [0, 5, 6], lines: [
    "Return-Path: <bounces+4471@em.aerolineaandes.com>",
    "From: \"Aerolínea Andes\" <reservas@aerolineaandes.com>",
    "Subject: Tu pase de abordar · AA 214",
    "Authentication-Results: mx.google.com;",
    "  spf=pass smtp.mailfrom=em.aerolineaandes.com;",
    "  dkim=pass header.d=aerolineaandes.com;",
    "  dmarc=pass header.from=aerolineaandes.com"],
    why: "El Return-Path es distinto, pero es un subdominio de la misma aerolínea que usa para envíos masivos. DKIM firma con el dominio del From y DMARC pasa: es legítimo." },
  { legit: false, clue: [0, 5], lines: [
    "From: \"Microsoft 365\" <no-reply@micros0ft-support.com>",
    "Subject: Su contraseña expira hoy",
    "Authentication-Results: mx.bancoandino.com.co;",
    "  spf=pass smtp.mailfrom=micros0ft-support.com;",
    "  dkim=pass header.d=micros0ft-support.com;",
    "  dmarc=pass header.from=micros0ft-support.com"],
    why: "El nombre visible dice Microsoft, pero el dominio es micros0ft-support.com (con un cero). Pasa la autenticación porque es el dominio del atacante. Mira siempre el dominio, no el nombre." },
  { legit: false, clue: [1, 3, 5, 6], lines: [
    "From: \"Tesorería\" <tesoreria@bancoandino.com.co>",
    "Received: from unknown (192.0.2.77)",
    "Subject: Cambio de cuenta para pagos",
    "Authentication-Results: mx.bancoandino.com.co;",
    "  spf=softfail smtp.mailfrom=bancoandino.com.co;",
    "  dkim=none;",
    "  dmarc=fail (p=none) header.from=bancoandino.com.co",
    "X-Mailer: PHPMailer 6.8.0"],
    why: "Sale de un servidor desconocido, sin firma DKIM y con DMARC fallido. Llegó a la bandeja porque la política es p=none (solo monitorear). La recomendación es subir el DMARC del banco a quarantine o reject." },
  { legit: true, clue: [4, 5, 6], lines: [
    "Return-Path: <billing@cloudprovider.com>",
    "From: \"Cloud Billing\" <billing@cloudprovider.com>",
    "Subject: Invoice #4471 is available",
    "Authentication-Results: mx.bancoandino.com.co;",
    "  spf=pass smtp.mailfrom=cloudprovider.com;",
    "  dkim=pass header.d=cloudprovider.com;",
    "  dmarc=pass header.from=cloudprovider.com"],
    why: "Todo alineado con el dominio del proveedor que el banco sí usa, sin enlaces ni pedidos de pago. Legítimo." },
];

/* ——— Consultas del SIEM: elige la que responde la pregunta. ——— */
window.SIEMQ = [
  { lang: "KQL · Microsoft Sentinel", tags: ["GRU", "MAD"], q: "¿Qué IP tuvieron más de 10 inicios de sesión fallidos en Windows?",
    opts: [
      "SecurityEvent | where EventID == 4625 | summarize fallos = count() by IpAddress | where fallos > 10",
      "SecurityEvent | where EventID == 4624 | summarize fallos = count() by IpAddress | where fallos > 10",
      "SecurityEvent | where EventID == 4625 | where fallos > 10 | summarize fallos = count() by IpAddress"], c: 0,
    why: "4625 es inicio de sesión fallido (4624 es exitoso). Además, primero se cuenta con summarize y después se filtra: la columna fallos no existe antes de contarla." },
  { lang: "SPL · Splunk", tags: ["MDE", "GRU"], q: "¿Qué usuarios tuvieron más de 5 fallos de SSH en el servidor rpt-01?",
    opts: [
      "index=linux host=rpt-01 \"Accepted password\" | stats count by user | where count > 5",
      "index=linux host=rpt-01 \"Failed password\" | stats count by user | where count > 5",
      "index=linux host=rpt-01 \"Failed password\" | stats count by user | where count < 5"], c: 1,
    why: "«Failed password» es el mensaje de sshd para un fallo. stats count by user agrupa por usuario y where count > 5 deja solo los que superan el umbral." },
  { lang: "KQL · Defender for Endpoint", tags: ["GRU"], q: "¿Qué consulta detecta a Word abriendo PowerShell (típico de una macro maliciosa)?",
    opts: [
      "DeviceProcessEvents | where InitiatingProcessFileName =~ \"powershell.exe\" and FileName =~ \"winword.exe\"",
      "DeviceProcessEvents | where FileName =~ \"winword.exe\"",
      "DeviceProcessEvents | where InitiatingProcessFileName =~ \"winword.exe\" and FileName =~ \"powershell.exe\""], c: 2,
    why: "InitiatingProcessFileName es el proceso padre (Word) y FileName el hijo (PowerShell). La primera opción busca lo contrario y la segunda trae cada vez que alguien abre Word." },
  { lang: "DQL · Wazuh", tags: ["MDE", "GRU"], q: "¿Cómo ves solo las alertas de autenticación fallida del agente rpt-01?",
    opts: [
      "rule.groups: \"authentication_failed\" and agent.name: \"rpt-01\"",
      "rule.groups: \"authentication_success\" and agent.name: \"rpt-01\"",
      "rule.groups: \"authentication_failed\" or agent.name: \"rpt-01\""], c: 0,
    why: "Con and se cumplen las dos condiciones. Con or aparecerían todas las alertas de rpt-01 y todas las de autenticación fallida de otros equipos." },
  { lang: "KQL · Microsoft Sentinel", tags: ["GRU", "PTY", "SCL"], q: "¿Qué consulta encuentra reglas nuevas que reenvían correo afuera (señal de BEC)?",
    opts: [
      "OfficeActivity | where Operation == \"MailItemsAccessed\"",
      "OfficeActivity | where Operation == \"New-InboxRule\" | where Parameters has \"ForwardTo\"",
      "OfficeActivity | where Operation == \"New-InboxRule\" | where Parameters has \"MarkAsRead\""], c: 1,
    why: "New-InboxRule registra la creación de reglas del buzón y ForwardTo indica reenvío. Un atacante con acceso al buzón las crea para espiar la conversación de pagos." },
  { lang: "SPL · Splunk", tags: ["UIO", "GRU"], q: "¿Cómo buscas consultas DNS anormalmente largas (posible túnel DNS)?",
    opts: [
      "index=dns | eval largo=len(query) | where largo > 60 | stats count by src_ip, query",
      "index=dns | eval largo=len(query) | where largo < 10 | stats count by src_ip, query",
      "index=dns query=\"bancoandino.com.co\" | stats count by src_ip"], c: 0,
    why: "Los túneles DNS meten datos en subdominios muy largos. eval calcula el largo de cada consulta y where deja solo las sospechosamente largas." },
  { lang: "KQL · Microsoft Entra ID", tags: ["MAD", "PTY"], q: "¿Qué inicios de sesión exitosos vienen de fuera de Colombia?",
    opts: [
      "SigninLogs | where ResultType != \"0\" and Location != \"CO\"",
      "SigninLogs | where ResultType == \"0\" and Location == \"CO\"",
      "SigninLogs | where ResultType == \"0\" and Location != \"CO\""], c: 2,
    why: "En SigninLogs, ResultType \"0\" significa éxito. Location guarda el código del país, así que != \"CO\" deja los de fuera de Colombia." },
  { lang: "SPL · Splunk", tags: ["UIO", "GRU"], q: "¿Qué equipos lograron conectarse hacia afuera al puerto 4444?",
    opts: [
      "index=firewall action=blocked direction=inbound dest_port=4444 | stats count by src_ip",
      "index=firewall action=allowed direction=outbound dest_port=4444 | stats count by src_ip, dest_ip",
      "index=firewall action=allowed dest_port=443 | stats count by src_ip"], c: 1,
    why: "Buscamos tráfico permitido, de salida y hacia el puerto 4444, un puerto poco común que usan muchas herramientas de control remoto." },
];

/* ——— Priorización de vulnerabilidades: ¿cuál parchas primero? c = índice correcto. ———
   kev = está en el catálogo KEV de CISA (explotada activamente). */
window.CVES = [
  { c: 1, items: [
    { id: "CVE-2019-0708", name: "BlueKeep (RDP)", cvss: 9.8, asset: "PC de laboratorio desconectado de la red", exp: "Aislado", kev: true },
    { id: "CVE-2021-44228", name: "Log4Shell (Apache Log4j)", cvss: 10.0, asset: "Portal de banca en línea", exp: "Internet", kev: true },
    { id: "Hallazgo interno", name: "XSS en la intranet de RR. HH.", cvss: 6.1, asset: "Intranet de empleados", exp: "Interna", kev: false }],
    why: "Log4Shell está expuesta a internet, se explota de forma masiva y el portal maneja dinero de clientes. BlueKeep es grave, pero ese PC no tiene red: nadie lo puede alcanzar." },
  { c: 1, items: [
    { id: "Hallazgo interno", name: "Inyección en la app de pruebas", cvss: 9.1, asset: "Servidor de desarrollo sin datos reales", exp: "Interna", kev: false },
    { id: "CVE-2017-0144", name: "EternalBlue (SMBv1)", cvss: 8.1, asset: "Servidor de archivos de las sucursales", exp: "Interna", kev: true },
    { id: "Hallazgo interno", name: "TLS 1.0 habilitado", cvss: 5.3, asset: "Impresora del piso 3", exp: "Interna", kev: false }],
    why: "El CVSS no lo es todo. EternalBlue tiene menor puntaje, pero se explota activamente y se propaga sola por la red, como hizo WannaCry en 2017. Está en un servidor que tocan todas las sucursales." },
  { c: 0, items: [
    { id: "CVE-2023-34362", name: "MOVEit Transfer (inyección SQL)", cvss: 9.8, asset: "Transferencia de archivos con aliados", exp: "Internet", kev: true },
    { id: "CVE-2021-34527", name: "PrintNightmare", cvss: 8.8, asset: "Servidor de impresión", exp: "Interna", kev: true },
    { id: "CVE-2014-0160", name: "Heartbleed (OpenSSL)", cvss: 7.5, asset: "Servidor viejo ya apagado", exp: "Aislado", kev: true }],
    why: "MOVEit está en internet, es crítica y el grupo Cl0p la usó en 2023 para robar datos de cientos de organizaciones. PrintNightmare va después; el servidor apagado no es prioridad." },
  { c: 2, items: [
    { id: "Hallazgo interno", name: "XSS en el sitio de mercadeo", cvss: 6.1, asset: "Sitio público de campañas", exp: "Internet", kev: false },
    { id: "Hallazgo interno", name: "Librería jQuery desactualizada", cvss: 4.3, asset: "Intranet de empleados", exp: "Interna", kev: false },
    { id: "CVE-2020-1472", name: "Zerologon (Netlogon)", cvss: 10.0, asset: "Controlador de dominio", exp: "Interna", kev: true }],
    why: "Zerologon permite tomar el controlador de dominio, es decir, las llaves de todas las cuentas del banco. Aunque sea interno, un atacante que ya entró (por ejemplo, con un phishing) lo toma todo." },
  { c: 0, items: [
    { id: "CVE-2017-5638", name: "Apache Struts (Jakarta)", cvss: 10.0, asset: "Portal de reclamos de clientes", exp: "Internet", kev: true },
    { id: "Hallazgo interno", name: "Contraseña débil en un switch", cvss: 7.2, asset: "Switch del laboratorio", exp: "Aislado", kev: false },
    { id: "CVE-2021-34527", name: "PrintNightmare", cvss: 8.8, asset: "PC de la recepción", exp: "Interna", kev: true }],
    why: "Es exactamente lo que le pasó a Equifax en 2017: Struts sin parchar en un portal público, con el parche disponible desde hacía dos meses. Se robaron datos de unas 147 millones de personas." },
  { c: 1, items: [
    { id: "Hallazgo interno", name: "Ejecución remota en un prototipo", cvss: 9.8, asset: "VM de laboratorio sin red", exp: "Aislado", kev: false },
    { id: "CVE-2014-0160", name: "Heartbleed (OpenSSL)", cvss: 7.5, asset: "VPN de acceso remoto", exp: "Internet", kev: true },
    { id: "Hallazgo interno", name: "Cabecera HSTS ausente", cvss: 4.3, asset: "Intranet", exp: "Interna", kev: false }],
    why: "Heartbleed en la VPN expuesta permite leer memoria del equipo: contraseñas, cookies y hasta la llave privada. La VM sin red no la alcanza nadie, aunque su puntaje sea mayor." },
];
