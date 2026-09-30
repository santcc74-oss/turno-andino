/* Turno Andino — contenido de los juegos interactivos (no son preguntas: se juegan).
   IP de ejemplo en rangos de documentación (192.0.2.x, 198.51.100.x, 203.0.113.x). */

/* ——— Caza de señales: toca las partes sospechosas del mensaje. [texto, ¿sospechosa?, por qué] ——— */
window.SPOTS = [
  { ch: "Correo", from: [["Seguridad Banco Andino ", false], ["<alertas@bancoandino-seguridad.co>", true, "El dominio no es bancoandino.com.co: es un dominio parecido."]],
    subj: [["URGENTE: ", true, "La urgencia en el asunto busca que actúes sin pensar."], ["verifique su cuenta", false]],
    body: [["Estimado cliente: ", false], ["su cuenta será bloqueada en 2 horas", true, "Plazo corto y miedo: urgencia artificial."], [" si no confirma sus datos. Ingrese a ", false],
      ["bancoandino-verificacion.com/login", true, "Enlace a un dominio que no es del banco."], [" y escriba su usuario, contraseña y ", false],
      ["el código que le llegará por SMS", true, "Ningún banco pide el código SMS: con él aprueban transacciones en tu nombre."], [". Atentamente, Departamento de Seguridad.", false]] },
  { ch: "SMS", from: [["+57 321 555 0198", true, "El banco no escribe desde un celular personal."]], subj: [],
    body: [["BancoAndino: ", false], ["su tarjeta fue bloqueada", true, "Miedo para que reacciones rápido."], [" por seguridad. Desbloquéela aquí: ", false],
      ["andino-desbloqueo.co/t/88", true, "Enlace acortado a un dominio falso."], [". Gracias por preferirnos.", false]] },
  { ch: "WhatsApp", from: [["Mamá ", false], ["(número nuevo)", true, "Un «número nuevo» sin verificar es la entrada típica de esta estafa."]], subj: [],
    body: [["Hola mijo, cambié de número. ", false], ["Estoy en un apuro", true, "Urgencia emocional."], [", ¿me prestas 800.000? Te devuelvo mañana, ", false],
      ["consígnalos a esta cuenta", true, "Pide dinero a una cuenta que no conoces: llama al número de siempre."], [". Te quiero.", false]] },
  { ch: "Correo", from: [["Carlos Ruiz (Presidente) ", false], ["<carlos.ruiz.presidencia@gmail.com>", true, "Un presidente no escribe de pagos desde un correo personal."]],
    subj: [["Pago ", false], ["confidencial", true, "Pide secreto para que no consultes a nadie."], [" hoy", true, "Urgencia."]],
    body: [["Estoy en una reunión y ", false], ["no puedo hablar", true, "Evita que lo verifiques por teléfono."], [". Necesito que hagas hoy una transferencia a ", false],
      ["un nuevo proveedor", true, "Una cuenta de pago nueva siempre se verifica por un canal registrado."], [". ", false], ["No lo comentes con nadie", true, "Aislarte es parte del engaño."], [".", false]] },
  { ch: "Correo", from: [["Microsoft 365 ", false], ["<no-reply@micros0ft-support.com>", true, "Un cero en lugar de la letra o: dominio falso."]],
    subj: [["Su contraseña ", false], ["expira hoy", true, "Urgencia."]],
    body: [["Para mantener su contraseña actual haga clic ", false], ["aquí", true, "Un enlace que no dice a dónde lleva."], [" y escriba ", false],
      ["sus credenciales corporativas", true, "Nadie legítimo te pide la clave por correo."], [". Equipo de TI.", false]] },
  { ch: "Correo", from: [["Aerolínea Andes ", false], ["<reservas@aerolineas-andes-checkin.com>", true, "El dominio real de la aerolínea es aerolineaandes.com."]],
    subj: [["Su vuelo AA 214 fue cancelado", false]],
    body: [["Para reubicarlo ", false], ["hoy mismo", true, "Urgencia aprovechando el estrés del viaje."], [" debe pagar un cargo de 120 dólares ", false],
      ["con los datos de su tarjeta en este formulario", true, "Te pide la tarjeta por fuera de la app oficial."], [". Si no, perderá su silla.", false]] },
];

/* ——— Firewall en vivo: la política del servidor y los paquetes que llegan. ——— */
window.FW_RULES = [
  "Servidor web del Banco Andino.",
  "Permitir desde internet: solo 443 (HTTPS).",
  "Permitir 22 (SSH) solo desde la VPN 10.8.x.x.",
  "Bloquear todo lo demás.",
];
window.FW_PACKETS = [
  { port: 443, svc: "HTTPS", src: "190.24.8.77", ok: true, why: "HTTPS desde internet está permitido: es la banca en línea." },
  { port: 443, svc: "HTTPS", src: "181.52.10.4", ok: true, why: "HTTPS desde internet está permitido." },
  { port: 443, svc: "HTTPS", src: "200.21.5.9", ok: true, why: "HTTPS desde internet está permitido." },
  { port: 22, svc: "SSH", src: "10.8.3.14 (VPN)", ok: true, why: "SSH desde la VPN está permitido." },
  { port: 22, svc: "SSH", src: "10.8.0.27 (VPN)", ok: true, why: "SSH desde la VPN está permitido." },
  { port: 3389, svc: "RDP", src: "203.0.113.45", ok: false, why: "Escritorio remoto desde internet: la entrada favorita del ransomware." },
  { port: 22, svc: "SSH", src: "198.51.100.9", ok: false, why: "SSH desde internet, no desde la VPN: fuerza bruta en camino." },
  { port: 23, svc: "Telnet", src: "203.0.113.77", ok: false, why: "Telnet no cifra nada y no está permitido." },
  { port: 445, svc: "SMB", src: "198.51.100.200", ok: false, why: "SMB desde internet: así se propagó WannaCry." },
  { port: 3306, svc: "MySQL", src: "203.0.113.12", ok: false, why: "La base de datos nunca debe recibir conexiones de internet." },
  { port: 21, svc: "FTP", src: "198.51.100.61", ok: false, why: "FTP no está en la política y no cifra las claves." },
];

/* ——— Rueda del César: mensajes del Camaleón (sin tildes, como en los cifrados clásicos). ——— */
window.CAESAR_MSGS = [
  "EL CAMALEON LLAMA A LAS TRES", "NO DES TU CLAVE A NADIE", "LA VPN NECESITA MFA", "REVISA EL DOMINIO ANTES DE HACER CLIC",
  "EL RESPALDO ESTA EN LA BOVEDA", "NUNCA PIDAS EL CODIGO SMS", "EL SERVIDOR RPT UNO FUE ATACADO", "CAMBIA LA CLAVE DEL ROUTER",
];

/* ——— Clave fuerte: palabras que un atacante prueba primero. ——— */
window.PW_COMMON = ["password", "contrasena", "clave", "banco", "andino", "admin", "qwerty", "123456", "12345", "abc123", "colombia", "bogota",
  "medellin", "amor", "dios", "futbol", "america", "millonarios", "nacional", "iloveyou", "welcome", "letmein", "2024", "2025", "2026", "santiago"];

/* ——— Triaje contra reloj: alertas con su prioridad correcta (1 = crítica … 4 = baja). ——— */
window.TRIAGE = [
  { t: "Ransomware cifrando ahora el servidor de pagos", p: 1, why: "Daño activo en un sistema crítico: todo el equipo a esto." },
  { t: "Transferencias grandes desde una cuenta con sesión robada", p: 1, why: "Dinero saliendo en este momento: se frena ya." },
  { t: "Credenciales de administrador del dominio usadas desde otro país", p: 1, why: "Control total de la red en manos equivocadas." },
  { t: "50 fallos de inicio de sesión y luego un acceso exitoso", p: 2, why: "Probable cuenta comprometida: se investiga de inmediato." },
  { t: "Correo de phishing a 30 empleados y 3 hicieron clic", p: 2, why: "Hay personas afectadas: contener antes de que se use la clave." },
  { t: "El EDR bloqueó un malware, pero el equipo alcanzó a conectarse a una IP sospechosa", p: 2, why: "Bloqueado a medias: puede haber algo más en el equipo." },
  { t: "Escaneo de puertos desde internet bloqueado por el firewall", p: 3, why: "Pasa todo el tiempo y ya fue bloqueado: se registra y se vigila." },
  { t: "Un usuario reporta un correo sospechoso que nadie abrió", p: 3, why: "Hay que revisarlo, pero no hay víctimas todavía." },
  { t: "El certificado del sitio de campañas vence en 20 días", p: 3, why: "Importante, pero hay tiempo para planearlo." },
  { t: "Spam enviado a cuarentena por el filtro de correo", p: 4, why: "El control funcionó: solo informativo." },
  { t: "Un usuario se equivocó una vez al escribir su clave", p: 4, why: "Comportamiento normal." },
  { t: "Actualización del antivirus completada en 200 equipos", p: 4, why: "Evento esperado, sin riesgo." },
];

/* ——— Segmenta la red: cada sistema a su zona. ——— */
window.ZONES = [
  { id: "dmz", name: "DMZ", desc: "Lo que recibe tráfico de internet" },
  { id: "int", name: "Red interna", desc: "Empleados y sistemas internos" },
  { id: "cde", name: "Zona de tarjetas (CDE)", desc: "Datos de tarjetas, PCI DSS" },
  { id: "lab", name: "Laboratorio aislado", desc: "Pruebas, sin conexión a nada" },
];
window.ZONE_ITEMS = [
  { t: "Servidor web público del banco", z: "dmz", why: "Recibe tráfico de internet: va en la DMZ, separado de lo interno." },
  { t: "Proxy inverso con WAF", z: "dmz", why: "Es la puerta de entrada desde internet." },
  { t: "Servidor de correo de salida", z: "dmz", why: "Habla con internet: se aísla en la DMZ." },
  { t: "Base de datos de clientes", z: "int", why: "Nunca expuesta: solo las aplicaciones internas hablan con ella." },
  { t: "Controlador de dominio", z: "int", why: "Maneja todas las cuentas: bien adentro y protegido." },
  { t: "Computadores de los empleados", z: "int", why: "Red interna, separada de los servidores críticos." },
  { t: "Servidor que autoriza pagos con tarjeta", z: "cde", why: "Toca datos de tarjetas: va en el CDE para reducir el alcance de PCI." },
  { t: "HSM que verifica los PIN", z: "cde", why: "Protege llaves de tarjetas: dentro del CDE." },
  { t: "Datáfonos de las sucursales", z: "cde", why: "Leen tarjetas: forman parte del entorno de tarjetas." },
  { t: "Máquina virtual vulnerable para practicar", z: "lab", why: "Nunca debe poder llegar a la red real: laboratorio aislado." },
  { t: "Equipo donde se analiza malware", z: "lab", why: "El malware se estudia sin red hacia el banco." },
];
