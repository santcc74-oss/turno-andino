# Turno Andino

Juego de ciberseguridad bancaria para el celular, pensado para jugar de viaje: en el aeropuerto, el bus o el avión, **sin internet**.

Eres analista del SOC del Banco Andino, un banco ficticio. Cada turno dura unos 3 minutos y trae 6 tickets: correos y SMS de phishing, llamadas de estafadores, alertas del SIEM, puertos, cifrados y preguntas del equipo. Subes de cargo de Practicante a CISO, viajas por 9 sedes (cada una es un tema) y ganas sellos en tu pasaporte al aprobar el examen de cada sede.

**Jugar:** https://santcc74-oss.github.io/turno-andino/

## Qué hay adentro

- **Primero aprendes, luego juegas:** cada ciudad abre con su capacitación (28 lecciones cortas con explicación sencilla, lecciones, objetivos y comprobación). En los turnos solo salen preguntas y minijuegos de lo que ya estudiaste, y cada minijuego nuevo trae su guía «cómo se juega».
- **14 minijuegos:** phishing por correo, SMS, WhatsApp y QR; llamadas de estafadores; cazar la línea sospechosa en logs; **revisión de código real** (Python, Java, JavaScript, configuraciones); **encabezados de correo** con SPF, DKIM y DMARC; **consultas de SIEM** en KQL, SPL y Wazuh; **priorización de CVE reales** (Log4Shell, EternalBlue, MOVEit, Zerologon…); procedimientos, puertos, cifrados, resultados de escaneos, matriz de riesgo, comandos de terminal y preguntas del equipo.
- **Examen de sede** para ganar cada sello del pasaporte.
- **7 carreras** para elegir al llegar a Analista SOC N2: Blue Team/SOC, respuesta a incidentes y forense, pentesting ético, AppSec/DevSecOps, fraude bancario, nube y GRC. Cada una con sus cargos, sus casos, minijuegos propios (escaneos, matriz de riesgo) y la certificación real de referencia.
- **Andino Shield:** tu propia empresa de servicios de ciberseguridad (tycoon). Ganas licitaciones eligiendo los servicios que cada cliente necesita (SOC 24/7, pentest, PCI DSS, ISO 27001, nube, fraude, vCISO…), contratas personas de las 7 carreras, compras herramientas, atiendes incidentes y dilemas éticos, y creces del garaje a un SOC propio. Cada turno en el banco es un día hábil de la empresa.
- **Archivo histórico:** 7 ataques reales contados como expedientes (Banco de Bangladesh, WannaCry, Equifax, Target, Capital One, SolarWinds, Colonial Pipeline), con cuestionario.
- **Álbum MITRE ATT&CK:** 20 técnicas reales que se coleccionan al resolver tickets.
- **Tickets con apariencia real:** llamada entrante tipo iPhone, bandeja de correo, chat de SMS y WhatsApp, cartel con QR, terminal y comandos reales de Linux y Windows con su salida.
- **Escenas de cada ciudad** que cambian de día, atardecer y noche según tu hora.
- **Diccionario del SOC** con más de 200 términos explicados con palabras sencillas y ejemplos: las palabras técnicas vienen subrayadas en cada ticket.
- **Sin repeticiones:** el juego recuerda lo que ya viste y agrupa las preguntas que dicen lo mismo con otras palabras.
- **Vida:** equipo con 3 niveles, 5 viviendas, vouchers de 6 certificaciones reales con su examen (ISC2 CC, Security+, CySA+, PenTest+, PCIP, AWS Security) y recuerdos de las 9 ciudades.
- **72 logros** en bronce, plata y oro, **misiones diarias y semanales**, y un medidor de **preparación para Security+** por dominio del SY0-701.

## Instalarlo en el iPhone

1. Abre el enlace en **Safari**.
2. Toca **Compartir** y luego **Añadir a pantalla de inicio**.
3. Ábrelo una vez con internet. Después funciona sin conexión.

## Temas

Fundamentos y hashes · Linux · Redes y puertos · Python y Java · CIA, criptografía e identidad · Amenazas y OWASP · SOC, SIEM y MITRE ATT&CK · Banca, PCI DSS y fraude · Nube, gobierno y Security+.

## Técnica

- HTML, CSS y JavaScript sin librerías ni compilación.
- PWA con service worker (`sw.js`): guarda todos los archivos para jugar sin conexión.
- Gráficos en SVG y canvas dibujados en el código (`art.js`), sin imágenes externas.
- El progreso se guarda solo en el teléfono (`localStorage`), con respaldo para copiar y pegar.
- Contenido de estudio en `data/`, tomado del proyecto de estudio CyberRuta.

Todo el contenido es educativo y defensivo. Personajes, banco y casos son ficticios.
