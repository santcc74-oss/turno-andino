/* Turno Andino — preguntas nuevas por módulo, para que los turnos se repitan menos.
   { módulo: [{ q, a: [opciones], c: índice correcto, w: explicación }] }. Id en el juego: e-<módulo>-<n>. */
window.EXTRA_CITY = {
  m01: [
    { q: "¿Qué guarda el disco duro que la RAM no?", a: ["Los archivos, incluso con el equipo apagado", "Solo los programas que están abiertos ahora", "Las instrucciones que ejecuta la CPU en este momento", "Nada: los dos se borran al apagar el equipo"], c: 0, w: "El disco guarda de forma permanente; la RAM es temporal y se borra al apagar." },
    { q: "¿Cuántos bits tiene un byte?", a: ["4", "8", "16", "2"], c: 1, w: "Un byte son 8 bits: por eso va de 0 (00000000) a 255 (11111111)." },
  ],
  m02: [
    { q: "¿Qué hace Get-Process en PowerShell?", a: ["Muestra los procesos que se están ejecutando", "Borra los procesos que usan mucha memoria", "Instala actualizaciones pendientes de Windows", "Crea un usuario nuevo con permisos de administrador"], c: 0, w: "Get-Process lista los procesos, como el administrador de tareas pero desde la línea de comandos." },
    { q: "El Visor de eventos de Windows sirve para:", a: ["Programar reuniones en el calendario de Outlook", "Revisar los registros (logs) del sistema y de seguridad", "Ver las fotos guardadas en el equipo del usuario", "Cambiar el fondo de pantalla de todos los equipos"], c: 1, w: "Ahí están los eventos 4624, 4625 o 1102 que revisa un analista." },
  ],
  m03: [
    { q: "¿Por qué tu laboratorio de ataques debe usar una red interna aislada?", a: ["Porque así las máquinas virtuales funcionan más rápido", "Porque VirtualBox no permite otro tipo de red", "Para que nada de lo que pruebes toque tu red real ni internet", "Para ahorrar datos del plan de internet de la casa"], c: 2, w: "Las máquinas vulnerables y el malware de práctica nunca deben poder llegar a tu red de casa ni a internet." },
    { q: "Una red NAT en VirtualBox permite que la VM:", a: ["Salga a internet usando la conexión de tu equipo", "Reciba conexiones directas desde internet", "Se conecte solo con otras VMs, sin internet", "Funcione sin sistema operativo instalado"], c: 0, w: "Con NAT la VM sale a internet a través de tu equipo, pero desde afuera no se puede llegar a ella." },
  ],
  m04a: [
    { q: "¿Qué es una ISO de Ubuntu?", a: ["Un certificado de calidad internacional", "Una versión de pago de Ubuntu para empresas", "Un antivirus que viene incluido con Linux", "Un archivo con la imagen del disco de instalación"], c: 3, w: "La ISO es la imagen del disco de instalación; se verifica con su hash antes de usarla." },
    { q: "¿Qué hace sudo apt update?", a: ["Actualiza la lista de paquetes disponibles", "Instala una versión nueva de Windows", "Borra los programas que no se usan", "Reinicia el equipo de inmediato"], c: 0, w: "update refresca la lista de paquetes; apt upgrade es el que instala las actualizaciones." },
  ],
  m04: [
    { q: "¿Qué comando muestra en qué carpeta estás?", a: ["ls", "cd", "pwd", "rm"], c: 2, w: "pwd = print working directory: imprime la carpeta actual." },
    { q: "En Linux, la carpeta /etc guarda principalmente:", a: ["Las fotos y documentos de los usuarios", "Archivos de configuración del sistema", "Los programas que se están ejecutando", "Los archivos temporales que se borran"], c: 1, w: "En /etc están passwd, ssh/sshd_config, hostname y muchas configuraciones más." },
  ],
  m05: [
    { q: "chmod 600 archivo deja que:", a: ["Todos los usuarios lean y escriban", "Nadie pueda leerlo, ni siquiera root", "Solo el grupo ejecute el archivo", "Solo el dueño lea y escriba el archivo"], c: 3, w: "6 = lectura + escritura para el dueño; 0 para el grupo y 0 para los demás." },
    { q: "¿Qué hace el comando kill 1234?", a: ["Envía una señal para terminar el proceso con PID 1234", "Borra el archivo llamado 1234 del disco", "Bloquea al usuario número 1234 del sistema", "Apaga el equipo después de 1234 segundos"], c: 0, w: "kill envía una señal a un proceso según su PID; por defecto le pide terminar." },
  ],
  m06: [
    { q: "tail -f /var/log/auth.log sirve para:", a: ["Borrar las últimas líneas del log", "Ver en vivo las líneas nuevas del log", "Comprimir el log para ahorrar espacio", "Enviar el log por correo al jefe"], c: 1, w: "-f (follow) deja el log abierto y muestra cada línea nueva apenas llega." },
    { q: "En un script de bash, $1 representa:", a: ["El precio de ejecutar el script", "La primera línea del archivo de log", "El primer argumento que recibe el script", "El usuario root del sistema"], c: 2, w: "Si ejecutas ./buscar.sh 45.155.204.19, dentro del script $1 vale esa IP." },
  ],
  m07: [
    { q: "¿Cuál de estas es una IP privada?", a: ["8.8.8.8", "45.155.204.19", "1.1.1.1", "192.168.1.20"], c: 3, w: "Los rangos privados son 10.x.x.x, 172.16-31.x.x y 192.168.x.x; no salen directo a internet." },
    { q: "¿Cuántos equipos (hosts) caben en una red /24?", a: ["254", "256", "24", "1024"], c: 0, w: "Un /24 tiene 256 direcciones, pero la primera es la red y la última el broadcast: quedan 254." },
  ],
  m08: [
    { q: "¿Por qué Telnet es inseguro?", a: ["Solo funciona en computadores con Windows", "Es muy lento para transferir archivos", "Envía usuario y clave sin cifrar", "Necesita una licencia costosa"], c: 2, w: "Cualquiera que capture el tráfico lee la clave. Se reemplaza por SSH." },
    { q: "¿Qué protocolo y puerto usa normalmente el DNS?", a: ["UDP en el puerto 53", "TCP en el puerto 3389", "UDP en el puerto 22", "TCP en el puerto 443"], c: 0, w: "El DNS usa UDP 53 para consultas normales (y TCP 53 para respuestas grandes)." },
  ],
  m09: [
    { q: "nmap -sV sirve para:", a: ["Borrar los logs del equipo escaneado", "Detectar la versión de los servicios abiertos", "Cifrar el tráfico de la red interna", "Bloquear las IPs que hacen escaneos"], c: 1, w: "-sV pregunta a cada servicio qué es y qué versión tiene; así sabes qué parchar. Solo en redes autorizadas." },
    { q: "En Wireshark, el filtro dns muestra:", a: ["Los paquetes cifrados con TLS 1.3", "Las conexiones bloqueadas por el firewall", "Los equipos con Windows de la red", "Solo los paquetes del protocolo DNS"], c: 3, w: "Los filtros de visualización dejan ver solo lo que buscas entre miles de paquetes." },
  ],
  m10: [
    { q: "¿Qué imprime print(len(\"banco\"))?", a: ["6", "5", "banco", "0"], c: 1, w: "len cuenta los caracteres: b-a-n-c-o son 5." },
    { q: "Una lista en Python se escribe con:", a: ["Llaves: {1, 2, 3}", "Comillas: \"1, 2, 3\"", "Corchetes: [1, 2, 3]", "Barras: /1, 2, 3/"], c: 2, w: "Las listas van entre corchetes; las llaves se usan para diccionarios y conjuntos." },
  ],
  m11: [
    { q: "¿Qué hace json.loads(texto) en Python?", a: ["Envía el texto a una API por internet", "Convierte un texto JSON en datos de Python", "Cifra el texto con una llave secreta", "Guarda el texto en un archivo .json"], c: 1, w: "loads (load string) convierte el texto de una respuesta de API en diccionarios y listas." },
    { q: "¿Por qué poner timeout en requests.get?", a: ["Para que la API cobre menos por cada consulta", "Para cifrar la respuesta de la API automáticamente", "Para que el script corra solo de noche", "Para que el script no se quede esperando para siempre"], c: 3, w: "Si la API no responde, sin timeout el script se congela y la automatización se detiene." },
  ],
  m12: [
    { q: "En Java, un try-with-resources sirve para:", a: ["Cerrar solos los recursos, como conexiones, al terminar", "Reintentar la operación hasta que funcione", "Ocultar los errores para que el usuario no los vea", "Ejecutar el código con permisos de administrador"], c: 0, w: "Evita dejar conexiones a la base de datos abiertas, que agotan recursos." },
    { q: "Cuando falla el login, ¿qué conviene mostrarle al usuario?", a: ["«Ese usuario existe, pero la clave está mal»", "El error completo que devolvió la base de datos", "«Usuario o contraseña incorrectos», sin decir cuál", "La contraseña correcta para que no se bloquee"], c: 2, w: "Decir cuál falló le confirma al atacante qué usuarios existen." },
  ],
  m13: [
    { q: "Una caída de la banca en línea afecta sobre todo la:", a: ["Confidencialidad", "Disponibilidad", "Integridad", "No repudio"], c: 1, w: "Disponibilidad: el servicio no está cuando los clientes lo necesitan." },
    { q: "Una cámara de seguridad en la entrada es un control:", a: ["Técnico y correctivo", "Administrativo y preventivo", "Físico y detectivo", "Legal y compensatorio"], c: 2, w: "Es física y detecta (registra) lo que pasa; también disuade." },
  ],
  m14: [
    { q: "¿Qué llave usas para cifrar un mensaje que solo Marta pueda leer?", a: ["La llave privada de Marta", "La llave pública de Marta", "Tu propia llave pública", "Una llave que se envía por correo"], c: 1, w: "Se cifra con la pública de Marta; solo su llave privada puede abrirlo." },
    { q: "Un certificado autofirmado en la banca en línea es un problema porque:", a: ["Hace que la página cargue mucho más despacio en los celulares", "Solo funciona en computadores con Windows y no en celulares", "Impide que los clientes usen contraseñas de más de 8 caracteres", "Ninguna autoridad de confianza respalda la identidad del sitio"], c: 3, w: "Cualquiera puede crear uno; el navegador no puede confirmar que el sitio es el banco." },
  ],
  m15: [
    { q: "Cuando un empleado se va del banco, sus accesos deben:", a: ["Retirarse el mismo día de su salida", "Quedar activos por si vuelve algún día", "Pasarse a su reemplazo tal como están", "Revisarse en la auditoría del próximo año"], c: 0, w: "Las cuentas huérfanas son una puerta abierta para exempleados o atacantes." },
    { q: "¿Cuál es un factor de «algo que tienes»?", a: ["Tu contraseña del correo", "Tu huella dactilar", "Una llave de seguridad física", "Tu fecha de nacimiento"], c: 2, w: "Algo que tienes: una llave, un celular o una tarjeta. La huella es algo que eres." },
  ],
  m16: [
    { q: "Un ataque a la cadena de suministro compromete:", a: ["El camión que transporta los computadores", "A un proveedor para llegar a sus clientes", "Solo la página web de la propia empresa", "Las contraseñas débiles de los empleados"], c: 1, w: "Como SolarWinds o Kaseya: atacan al proveedor para entrar a cientos de empresas a la vez." },
    { q: "El pretexting consiste en:", a: ["Enviar miles de correos idénticos a la vez", "Adivinar contraseñas con un diccionario", "Cifrar los archivos y pedir un rescate", "Inventar una historia creíble para sacar información"], c: 3, w: "«Soy de auditoría y necesito el listado ya»: una historia montada para que bajes la guardia." },
  ],
  m17: [
    { q: "¿Qué es una «mala configuración de seguridad» según OWASP?", a: ["Dejar cuentas por defecto o errores detallados visibles", "Usar HTTPS en todas las páginas del sitio", "Pedir MFA a los administradores del sistema", "Cifrar las contraseñas con bcrypt y sal"], c: 0, w: "Contraseñas de fábrica, modo debug o errores con detalles técnicos le ayudan al atacante." },
    { q: "Una cookie de sesión debe tener la marca HttpOnly para que:", a: ["La cookie dure para siempre en el navegador", "JavaScript no pueda leerla si hay un XSS", "Se envíe también a otros sitios web", "El servidor no tenga que validarla"], c: 1, w: "Con HttpOnly, un script inyectado no puede robar la sesión." },
  ],
  m18: [
    { q: "Un escaneo de vulnerabilidades autenticado:", a: ["Ataca sin permiso para parecer un delincuente real", "Solo revisa si el sitio web tiene HTTPS", "Entra con credenciales y ve más detalles del sistema", "Borra las vulnerabilidades que encuentra"], c: 2, w: "Con credenciales, el escáner revisa parches y configuraciones por dentro y da menos falsos positivos." },
    { q: "Si no puedes parchar un sistema heredado, lo mejor es:", a: ["Dejarlo igual y esperar que nadie lo encuentre", "Aislarlo y vigilarlo con controles compensatorios", "Borrar sus logs para no llamar la atención", "Conectarlo directo a internet para actualizarlo"], c: 1, w: "Segmentarlo y monitorearlo reduce el riesgo mientras se reemplaza." },
  ],
  m19: [
    { q: "Un agente de Wazuh instalado en un servidor:", a: ["Bloquea todos los puertos del servidor", "Reemplaza el sistema operativo del equipo", "Envía sus logs y eventos al servidor de Wazuh", "Hace copias de seguridad cada hora"], c: 2, w: "El agente recolecta y envía; el servidor analiza y genera alertas." },
    { q: "Normalizar logs en un SIEM significa:", a: ["Llevar los campos de fuentes distintas a un mismo formato", "Borrar los logs que parecen normales para ahorrar espacio", "Comprimir los logs viejos en un solo archivo cada mes", "Enviar los logs por correo al auditor al final del día"], c: 0, w: "Así «IP de origen» se llama igual venga de Windows, Linux o el firewall, y se puede correlacionar." },
  ],
  m20: [
    { q: "T1486 en MITRE ATT&CK es:", a: ["Phishing con un archivo adjunto malicioso", "Fuerza bruta contra las contraseñas de usuarios", "Uso de cuentas válidas robadas a empleados", "Cifrar datos para causar impacto (ransomware)"], c: 3, w: "T1486 Data Encrypted for Impact: el cifrado del ransomware." },
    { q: "Detectar por comportamiento (TTP) es mejor que detectar por IP porque:", a: ["Al atacante le cuesta mucho más cambiar su forma de actuar", "Las IP nunca aparecen en los logs del SIEM", "Los comportamientos no generan falsos positivos", "Las reglas por IP no se pueden escribir en Sigma"], c: 0, w: "Cambiar de IP toma segundos; cambiar de técnica, mucho trabajo (pirámide del dolor)." },
  ],
  m21: [
    { q: "¿Por qué no se analiza directamente el disco original?", a: ["Porque el disco original siempre está cifrado", "Cualquier cambio podría invalidar la evidencia", "Porque es más lento que analizar una copia", "Porque la ley prohíbe mirar discos originales"], c: 1, w: "Se trabaja sobre una imagen forense verificada con hash; el original queda intacto." },
    { q: "Al detectar un incidente grave, ¿a quién se avisa primero?", a: ["A los periodistas, para informar a los clientes", "Al atacante, para negociar directamente", "Al líder de respuesta, según el plan de incidentes", "A nadie: primero hay que resolverlo solo"], c: 2, w: "El plan define la cadena de escalamiento; las comunicaciones externas las maneja el equipo designado." },
  ],
  m22: [
    { q: "En un pago con tarjeta, el adquirente es:", a: ["El banco que le dio la tarjeta al cliente", "La marca de la tarjeta, como Visa", "El banco del comercio que recibe el pago", "El fabricante del datáfono"], c: 2, w: "Emisor = banco del cliente; adquirente = banco del comercio." },
    { q: "El PIN de una tarjeta se verifica de forma segura con ayuda de:", a: ["Un HSM en el banco emisor", "Una hoja de cálculo del área de tarjetas", "El cajero de la sucursal, a mano", "El correo electrónico del cliente"], c: 0, w: "Los PIN se verifican dentro de un HSM, sin que nadie vea el PIN en claro." },
  ],
  m23: [
    { q: "La Circular Externa 007 de 2018 de la Superintendencia Financiera trata sobre:", a: ["La tasa máxima de interés de las tarjetas de crédito", "El horario de atención de las oficinas bancarias", "Requisitos mínimos de ciberseguridad para las entidades vigiladas", "El diseño de los billetes nuevos del país"], c: 2, w: "Fija requisitos de ciberseguridad y de reporte de incidentes para los bancos en Colombia." },
    { q: "¿Cada cuánto exige PCI DSS escaneos externos de vulnerabilidades hechos por un ASV?", a: ["Cada tres meses", "Una vez cada cinco años", "Solo cuando hay un incidente", "Nunca: son opcionales"], c: 0, w: "Trimestrales, por un proveedor aprobado (ASV), y después de cambios importantes." },
  ],
  m24: [
    { q: "Un «mensaje del banco» que pide instalar una app de control remoto para «ayudarle» es:", a: ["Un servicio normal de soporte técnico del banco", "Una actualización obligatoria de seguridad", "Un requisito para usar la banca en línea", "Una estafa para manejar su celular y su banca"], c: 3, w: "Con control remoto, el estafador ve y usa la app del banco como si fuera el cliente." },
    { q: "Monitorear transacciones en tiempo real sirve para:", a: ["Frenar un fraude antes de que el dinero salga", "Cobrar más comisiones a los clientes", "Ver cuánto gasta cada cliente por curiosidad", "Reemplazar la autenticación de los clientes"], c: 0, w: "Cada minuto cuenta: una vez el dinero sale de la cuenta mula, es muy difícil recuperarlo." },
  ],
  m25: [
    { q: "Activar desde el primer día un registro como CloudTrail sirve para:", a: ["Que la factura mensual salga más barata", "Poder investigar después quién hizo cada cambio", "Que los servidores respondan más rápido", "Evitar tener que usar contraseñas"], c: 1, w: "Sin registros no hay forma de reconstruir un incidente en la nube." },
    { q: "¿Qué es una región en la nube?", a: ["Una carpeta compartida dentro de un bucket", "Un tipo de usuario con permisos limitados", "Un grupo de centros de datos en una zona geográfica", "Un plan de pago con descuento anual"], c: 2, w: "Elegir región importa por la ley de datos personales y por la recuperación ante desastres." },
  ],
  m26: [
    { q: "Probar el plan de continuidad sirve para:", a: ["Cumplir un trámite de auditoría sin cambiar nada", "Descubrir fallas del plan antes de una crisis real", "Reemplazar las copias de seguridad de los servidores", "Evitar tener que escribir y mantener el plan"], c: 1, w: "Un plan nunca probado suele fallar justo el día que se necesita." },
    { q: "Un registro de riesgos (risk register) contiene:", a: ["Cada riesgo con su dueño, su nivel y su tratamiento", "Las contraseñas de todos los sistemas", "La lista de empleados que cometieron errores", "Los correos de phishing recibidos en el año"], c: 0, w: "Es la lista viva de riesgos: quién responde, qué tan grave es y qué se va a hacer." },
  ],
};
