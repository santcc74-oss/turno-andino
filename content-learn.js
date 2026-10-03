/* Turno Andino — ruta de aprendizaje: qué hay que estudiar antes de cada minijuego y guías «cómo se juega».
   Un minijuego solo aparece cuando ya estudiaste los temas (módulos) que necesita. */

/* Temas mínimos por tipo de ticket. Con «any» basta uno de la lista. */
window.TYPE_NEEDS = {
  quiz: [], mail: [], call: [], english: [],
  decode: ["m01"], ports: ["m08"], header: ["m16"], siem: ["m19"], cve: ["m18"],
  log: { any: ["m02", "m06"] }, cmd: { any: ["m02", "m04"] }, code: { any: ["m05", "m11", "m12", "m17", "m25"] },
  order: { any: ["m08", "m16", "m18", "m20", "m21", "m22", "m26"] }, scan: ["m09"], risk: ["m13"],
  /* Juegos interactivos */
  spot: [], firewall: ["m08"], caesar: ["m14"], password: ["m15"], triage: ["m19"], zones: ["m07"],
  /* Retos de terminal: se abren con el Campamento Linux */
  shell: ["lx2"],
};

/* Temas que necesita cada caso concreto (por su id o su título). */
window.ITEM_NEEDS = {
  /* Revisión de código */
  k0: ["m10", "m12"], k1: ["m11"], k2: ["m14"], k3: ["m10", "m17"], k4: ["m17"], k5: ["m11", "m08"], k6: ["m14"],
  k7: ["m17"], k8: ["m12"], k9: ["m12"], k10: ["m17"], k11: ["m17"], k12: ["m05"], k13: ["m25"],
  /* Comandos */
  cm0: ["m06"], cm1: ["m04", "m08"], cm2: ["m05"], cm3: ["m06"], cm4: ["m01"], cm5: ["m04"], cm6: ["m02"], cm7: ["m02", "m08"],
  /* Logs (los de Windows se leen desde m02; los demás, desde m06) */
  l0: ["m02"], l1: ["m06"], l2: ["m05"], l3: ["m06"], l4: ["m17"], l5: ["m17"], l6: ["m08"], l7: ["m08"], l8: ["m15"], l9: ["m24"], l10: ["m16"], l11: ["m02", "m16"],
  /* Encabezados, SIEM, CVE y escaneos: basta su tema general (TYPE_NEEDS) */
};
/* Procedimientos para ordenar: se reconocen por su título. */
window.ORDER_NEEDS = [
  [/TCP/, ["m08"]], [/phishing/i, ["m16"]], [/NIST 800-61|incidentes/i, ["m21"]], [/volatilidad|forense/i, ["m21"]],
  [/vulnerabilidades/i, ["m18"]], [/datáfono|tarjeta/i, ["m22"]], [/CSF/, ["m26"]], [/ransomware/i, ["m21"]], [/ATT&CK/, ["m20"]],
];
/* Tipos de decodificación: binario, hexadecimal y hash se ven en m01; Base64 y César, en m14. */
window.DECODE_NEEDS = { bin: ["m01"], hex: ["m01"], hash: ["m01"], b64: ["m14"], caesar: ["m14"] };

/* Inducción de cada carrera: temas que se pueden estudiar apenas la eliges, aunque sean de otra ciudad. */
window.CAREER_MODS = {
  soc: ["m19", "m20", "m06"], dfir: ["m21", "m06", "m20"], pentest: ["m09", "m18", "m17"], appsec: ["m10", "m17", "m12"],
  fraude: ["m22", "m24", "m16"], cloud: ["m25", "m15", "m19"], grc: ["m13", "m26", "m23"],
};

/* ——— Guías «cómo se juega»: aparecen la primera vez que sale cada tipo de ticket. ——— */
window.PRIMERS = {
  mail: { title: "Mensajes sospechosos", intro: "Te llegan correos, SMS, WhatsApp o carteles con QR que un compañero reportó. Tu trabajo: decidir si son un engaño (phishing) o algo legítimo.",
    points: ["Urgencia o miedo: «su cuenta será bloqueada en 2 horas».", "Te piden claves, códigos SMS, datos de tarjeta o que instales algo.", "El dominio no es el oficial: bancoandino-verificacion.com no es bancoandino.com.co.", "Cambios de canal: «sigamos por WhatsApp», «no llame, es confidencial».", "Lo legítimo no pide datos y te manda a canales que ya conoces (la app, la intranet)."],
    how: "Desliza la tarjeta a la derecha si es phishing o a la izquierda si es legítimo. También puedes usar los botones." },
  call: { title: "Llamadas", intro: "Suena el teléfono. Unas veces es un cliente con un problema real; otras, un estafador que finge ser de TI, del banco o de una aerolínea (vishing).",
    points: ["Nadie legítimo te pide tu contraseña ni el código que te llegó por SMS.", "Si dudas, cuelga y llama tú al número oficial que ya conoces.", "Un cambio de cuenta de pago siempre se verifica por un canal registrado antes.", "Si un cliente fue estafado, primero se bloquea y se escala a fraude; después se le explica, sin culparlo."],
    how: "Desliza para contestar, escucha lo que te dicen y elige qué harías." },
  log: { title: "Cazar en los logs", intro: "Un log es el diario de un sistema: cada línea dice qué pasó, cuándo y quién. El SIEM te muestra unas líneas y una de ellas es la sospechosa.",
    points: ["Cada línea suele tener hora, usuario, IP de origen y resultado (OK o FAIL).", "Busca lo que rompe el patrón: una IP externa, una hora rara, root entrando, un proceso extraño.", "Muchos fallos seguidos de un éxito desde la misma IP = alguien adivinó la clave.", "En Windows, el evento 4625 es un inicio de sesión fallido y el 4624, uno exitoso."],
    example: "08:02 4625 Logon FAIL user=admin src=45.155.204.19\n08:03 4624 Logon OK   user=admin src=45.155.204.19   ← sospechosa",
    how: "Toca la línea que te parezca sospechosa." },
  decode: { title: "Descifrar evidencias", intro: "A veces la evidencia viene «escrita raro»: en binario, en hexadecimal o codificada. No es magia: son otras formas de escribir los mismos datos.",
    points: ["Binario: solo 0 y 1. Cada posición vale el doble que la anterior: 128 64 32 16 8 4 2 1. Sumas las que tienen 1.", "Hexadecimal: usa 0-9 y A-F (A=10 … F=15). 0xFF = 255.", "Un hash es la huella de un archivo: si cambia un solo carácter, el archivo no es el mismo.", "Base64 y César (los verás en Santiago) no protegen nada: cualquiera los revierte."],
    example: "00000101 = 4 + 1 = 5",
    how: "Lee el valor y elige la respuesta correcta." },
  ports: { title: "Puertos y servicios", intro: "Un puerto es como el número de apartamento dentro de un edificio: la IP es el edificio y el puerto dice a qué servicio va el tráfico.",
    points: ["22 = SSH (entrar a un servidor por terminal).", "80 = HTTP y 443 = HTTPS (páginas web).", "53 = DNS (traducir nombres a IP).", "3389 = RDP (escritorio remoto de Windows)."],
    how: "Toca un número y luego el servicio que le corresponde." },
  english: { title: "Inglés técnico", intro: "Casi todas las herramientas, alertas y certificaciones están en inglés. Aquí practicas las palabras de cada tema.",
    points: ["Relaciona cada término en inglés con su traducción.", "Si una palabra no la conoces, descártala por las que sí sabes."],
    how: "Toca una palabra en inglés y luego su traducción." },
  order: { title: "Ordenar procedimientos", intro: "En seguridad el orden importa: contener antes de borrar, recoger primero la evidencia que se pierde más rápido.",
    points: ["Lee todos los pasos antes de empezar.", "Pregúntate: ¿qué tiene que pasar antes para que este paso tenga sentido?"],
    how: "Toca los pasos en el orden correcto." },
  header: { title: "Encabezados de correo", intro: "Todo correo trae una «hoja de ruta» escondida: los encabezados. Ahí se ve de dónde salió de verdad, aunque el remitente visible diga otra cosa.",
    points: ["From: el remitente que ves (se puede falsificar).", "Return-Path: a dónde vuelven los rebotes; muestra el dominio que realmente envió.", "SPF: ¿el servidor que envió tiene permiso del dominio? pass o fail.", "DKIM: ¿el correo va firmado por el dominio? pass o none.", "DMARC: el veredicto final del dominio. Ojo: un dominio falso parecido (bancoandlno) puede pasar todo porque es del atacante."],
    how: "Revisa las líneas y decide si el correo es legítimo o suplantado." },
  code: { title: "Revisión de código", intro: "No necesitas saber programar para ver ciertos errores de seguridad. Un programa es una lista de instrucciones que se leen de arriba hacia abajo, línea por línea.",
    points: ["Una variable guarda un dato: cedula = \"123\".", "Una función es un bloque de instrucciones con nombre: def buscar_cliente(...):", "Un texto entre comillas es un «string». Unir textos con + se llama concatenar.", "El peligro típico: meter lo que escribe el usuario directo en una consulta o un comando. Así entra la inyección.", "Otros errores comunes: claves escritas en el código, algoritmos débiles (MD5) o desactivar protecciones (verify=False)."],
    example: "sql = \"SELECT * FROM clientes WHERE cedula = '\" + cedula + \"'\"\n→ el dato del usuario queda dentro de la consulta: inyección SQL",
    how: "Toca la línea vulnerable. Después verás cómo se corrige." },
  siem: { title: "Consultas al SIEM", intro: "El SIEM guarda millones de eventos. Para encontrar algo le haces una consulta: filtras (where), cuentas (count, stats) y agrupas (by).",
    points: ["KQL (Microsoft Sentinel): Tabla | where condición | summarize count() by campo.", "SPL (Splunk): index=… \"texto\" | stats count by campo.", "Primero se filtra lo que interesa, después se cuenta, al final se filtra por el número.", "Fíjate en los detalles: 4625 (fallo) no es 4624 (éxito); and no es or."],
    how: "Lee la pregunta y elige la consulta que la responde." },
  cve: { title: "Priorizar vulnerabilidades", intro: "Siempre hay más fallas que tiempo. Priorizar es decidir qué parchar primero.",
    points: ["CVSS: gravedad de 0 a 10. Importa, pero no es lo único.", "Exposición: lo que está en internet va antes que lo interno, y lo interno antes que lo aislado.", "KEV: si ya se está explotando en el mundo real, sube al primer lugar.", "Criticidad del activo: el controlador de dominio o el portal de pagos pesan más que una impresora."],
    how: "Toca la vulnerabilidad que parcharías primero." },
  cmd: { title: "La terminal", intro: "La terminal es escribir órdenes en vez de hacer clic. Los analistas la usan todo el día para investigar.",
    points: ["Linux: last (quién entró), ss -tulpn (puertos abiertos), ps aux (procesos), crontab -l (tareas programadas), find (buscar archivos).", "Windows PowerShell: Get-WinEvent (registros), Get-NetTCPConnection (conexiones).", "Lee qué pregunta te hacen y busca el comando que responde exactamente eso."],
    how: "Elige el comando y mira lo que devuelve: ahí suele estar la pista." },
  scan: { title: "Resultados de un escaneo", intro: "Un escaneo autorizado (con Nmap) lista qué puertos y servicios tiene un equipo. Tu trabajo es reportar lo más grave.",
    points: ["Cada línea: puerto/protocolo, estado (open), servicio y versión.", "Grave: servicios de administración expuestos (RDP, bases de datos), protocolos sin cifrar (Telnet, FTP anónimo), versiones viejas (SMBv1), certificados vencidos.", "Normal: 443 con HTTPS en un servidor web."],
    how: "Toca la línea con el hallazgo más grave." },
  risk: { title: "Matriz de riesgo", intro: "Un riesgo se mide cruzando dos preguntas: ¿qué tan probable es? y ¿qué tan grave sería?",
    points: ["Probabilidad alta: ya está pasando en la región o no hay controles.", "Impacto alto: afecta dinero, datos de clientes o servicios críticos.", "Los controles existentes (MFA, cifrado, aislamiento) bajan la probabilidad o el impacto."],
    how: "Toca la casilla donde ubicarías el riesgo." },
  shell: { title: "Terminal en vivo", intro: "Un compañero te pide una tarea en el servidor srv-web01. No hay opciones para elegir: la resuelves escribiendo comandos reales, como aprendiste en el Campamento Linux.",
    points: ["Lee bien la tarea: qué archivo, qué carpeta, qué dato piden.", "Puedes escribir todos los comandos que quieras; cuenta cuando aparezca el resultado correcto.", "Si te atascas, la pista te orienta. «Me rindo» te muestra una solución."],
    how: "Escribe el comando y pulsa Enviar. Los botones de abajo te dan Tab, la flecha arriba y los símbolos | / - ~ que cuesta encontrar en el teclado del iPhone." },
  spot: { title: "Caza de señales", intro: "Un mensaje de phishing casi nunca tiene una sola pista: tiene varias. Aquí las buscas tú, una por una.",
    points: ["El remitente: un dominio parecido pero distinto, o un correo personal.", "La urgencia: plazos cortos, miedo, «no se lo digas a nadie».", "El enlace: ¿lleva al dominio oficial?", "Lo que piden: claves, códigos SMS, datos de tarjeta, dinero."],
    example: "«bancoandino-verificacion.com» no es «bancoandino.com.co»: basta una palabra de más para que sea otro dueño.",
    how: "Toca cada parte sospechosa del mensaje. Cuando creas que ya las tienes todas, toca «Terminé de revisar»." },
  firewall: { title: "Firewall en vivo", intro: "Un firewall es el portero de la red: mira cada paquete (su puerto y su origen) y lo deja pasar o lo bloquea según una lista de reglas llamada política.",
    points: ["El puerto dice a qué servicio va: 443 es HTTPS, 22 es SSH, 3389 es escritorio remoto.", "El origen dice de dónde viene: internet o la VPN interna (10.8.x.x).", "La regla final siempre es «bloquear todo lo demás»: lo que no está permitido, no pasa."],
    example: "Un 3389 (RDP) desde internet se bloquea: es la puerta favorita del ransomware.",
    how: "Los paquetes cruzan la pantalla hacia el servidor. Tócalos para bloquear los que la política no permite; deja pasar los demás." },
  caesar: { title: "Rueda del César", intro: "El cifrado César corre cada letra un número fijo de posiciones: con desplazamiento 3, la A se vuelve D. Es el cifrado más viejo que se conoce.",
    points: ["Solo hay 26 posiciones posibles, así que se rompe probándolas todas (fuerza bruta).", "Por eso hoy se usa cifrado moderno como AES, que tiene más combinaciones que átomos en el universo."],
    example: "«HO FDPDOHRQ» con desplazamiento 3 es «EL CAMALEON».",
    how: "Gira la rueda con las flechas o la barra hasta que el mensaje se lea en español, y envíalo." },
  password: { title: "Clave fuerte", intro: "Un atacante que roba una base de claves prueba miles de millones de combinaciones por segundo. Lo que más lo frena es la longitud.",
    points: ["Cada carácter extra multiplica las combinaciones.", "Palabras obvias (el banco, tu ciudad, el año, «123456») se prueban primero.", "Una frase de varias palabras al azar es larga y fácil de recordar.", "Aun así: usa un gestor de contraseñas y MFA."],
    how: "Escribe una clave de práctica (nunca una real) y mira cuánto tardaría un atacante. Gana cuando cumpla todas las casillas." },
  triage: { title: "Triaje contra reloj", intro: "En un SOC llegan cientos de alertas. Triaje es decidir cuál se atiende primero, como en urgencias de un hospital.",
    points: ["P1 · Crítica: daño activo ahora en algo importante (dinero saliendo, ransomware).", "P2 · Alta: probable compromiso que hay que investigar ya.", "P3 · Media: sospechoso pero contenido o sin víctimas.", "P4 · Baja: informativo, el control funcionó."],
    how: "Lee cada alerta y toca su prioridad antes de que se acabe la barra. Una prioridad de diferencia vale medio punto." },
  zones: { title: "Segmenta la red", intro: "Segmentar es dividir la red en zonas separadas por firewalls, para que si un atacante entra a una, no llegue a todo lo demás.",
    points: ["DMZ: lo que da la cara a internet (web, correo de salida).", "Red interna: empleados y sistemas internos, nunca expuestos.", "Zona de tarjetas (CDE): todo lo que toca datos de tarjetas, aislado por PCI DSS.", "Laboratorio aislado: pruebas y malware, sin conexión a la red real."],
    how: "Toca un sistema y luego la zona donde debe vivir." },
};
