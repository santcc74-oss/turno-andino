/* Turno Andino — Andino Shield: tu empresa de servicios de ciberseguridad.
   Todos los clientes, personas y montos son ficticios. Los montos son ₳ por día hábil (un turno = un día). */

/* ——— Servicios: role = carrera que lo presta, load = capacidad diaria que consume, fee = cobro base por día. ——— */
window.SVC = [
  { id: "training", name: "Capacitación antiphishing", role: "grc", load: 1, fee: 14, tool: null,
    what: "Talleres y simulacros de phishing para que los empleados reconozcan y reporten engaños." },
  { id: "mdr", name: "SOC 24/7 (MDR)", role: "soc", load: 2, fee: 40, tool: "siem",
    what: "Monitoreo continuo: tu equipo vigila las alertas del cliente día y noche y responde a lo sospechoso." },
  { id: "ir", name: "Retainer de respuesta a incidentes", role: "dfir", load: 1, fee: 32, tool: null,
    what: "Un contrato para que, si hay un incidente, tu equipo llegue de inmediato con un plan ya acordado." },
  { id: "pentest", name: "Pentest anual", role: "pentest", load: 2, fee: 30, tool: null,
    what: "Ataques simulados y autorizados para encontrar fallas antes que los delincuentes, con informe y retest." },
  { id: "appsec", name: "Revisión de código seguro", role: "appsec", load: 1, fee: 24, tool: "sast",
    what: "Revisar el código y las librerías de sus aplicaciones para cerrar fallas como XSS o inyección SQL." },
  { id: "cloud", name: "Seguridad en la nube", role: "cloud", load: 1, fee: 26, tool: "cspm",
    what: "Revisar permisos, buckets y configuraciones en AWS o Azure, y vigilar que no se abran por error." },
  { id: "pci", name: "Cumplimiento PCI DSS", role: "grc", load: 1, fee: 26, tool: null,
    what: "Acompañar al cliente para cumplir el estándar obligatorio de quienes procesan pagos con tarjeta." },
  { id: "iso", name: "Consultoría ISO 27001", role: "grc", load: 1, fee: 24, tool: null,
    what: "Montar el sistema de gestión de seguridad (SGSI) y preparar la certificación ISO 27001." },
  { id: "fraud", name: "Monitoreo de fraude", role: "fraude", load: 2, fee: 36, tool: "siem",
    what: "Vigilar transacciones en tiempo real para frenar cuentas mula, card testing y robos de cuentas." },
  { id: "vciso", name: "CISO virtual (vCISO)", role: "grc", load: 1, fee: 36, tool: null, senior: true,
    what: "Un líder de seguridad por horas: arma la estrategia, reporta a la junta y prioriza el presupuesto." },
];

/* ——— Clientes posibles. needs = [servicio, por qué lo necesita]. budget multiplica el cobro. ——— */
window.CLIENT_TPL = [
  { id: "colegio", name: "Colegio Los Andes", sector: "Educación", budget: 0.7, risk: 1, minRep: 0,
    brief: "Los profesores reciben correos falsos de «la secretaría de educación» que les piden su clave del correo institucional.",
    needs: [["training", "Los ataques entran engañando a personas: la capacitación antiphishing es lo que más reduce ese riesgo."]] },
  { id: "coop", name: "Cooperativa Cafetera del Huila", sector: "Cooperativa financiera", budget: 0.9, risk: 2, minRep: 0,
    brief: "Varios empleados cayeron en correos de phishing este año. Además, van a empezar a recibir pagos con tarjeta y no saben qué les exige la norma.",
    needs: [["training", "Empleados que caen en phishing: capacitación y simulacros."], ["pci", "Si van a procesar tarjetas, deben cumplir PCI DSS."]] },
  { id: "tienda", name: "Moda Andina (tienda en línea)", sector: "Comercio electrónico", budget: 1.0, risk: 2, minRep: 0,
    brief: "Venden por internet y cobran con tarjeta en su propio sitio. Un comprador les avisó que al escribir su nombre en el formulario aparecían mensajes raros.",
    needs: [["pci", "Reciben pagos con tarjeta en su sitio: PCI DSS."], ["appsec", "Textos del usuario que se «ejecutan» en la página suenan a XSS: revisión de código seguro."]] },
  { id: "buses", name: "Transportes Frailejón", sector: "Transporte", budget: 0.8, risk: 1, minRep: 0,
    brief: "El mes pasado alguien de la oficina abrió un adjunto y el sistema de tiquetes estuvo caído un día entero. Nadie sabía a quién llamar.",
    needs: [["training", "Todo empezó con un adjunto malicioso: concientización."], ["ir", "No sabían a quién llamar durante la crisis: un retainer de respuesta les da ese plan."]] },
  { id: "agro", name: "Agro IoT (startup)", sector: "Tecnología", budget: 1.1, risk: 2, minRep: 10,
    brief: "Todo su producto corre en AWS y lo programan tres desarrolladores a toda velocidad. Un inversionista les pide demostrar que su código y su nube son seguros.",
    needs: [["cloud", "Todo vive en AWS: revisar permisos y configuraciones de la nube."], ["appsec", "Programan rápido y sin revisión: código seguro."]] },
  { id: "hotel", name: "Hotel Mar de Cartagena", sector: "Turismo", budget: 1.0, risk: 2, minRep: 10,
    brief: "Cobran con tarjeta en la recepción y en su web de reservas. Los recepcionistas cambian seguido y ya les hicieron una estafa por teléfono.",
    needs: [["pci", "Pagos con tarjeta en recepción y en la web: PCI DSS."], ["training", "Estafas por teléfono a personal nuevo: capacitación contra la ingeniería social."]] },
  { id: "alcaldia", name: "Alcaldía de Villa Verde", sector: "Gobierno", budget: 1.2, risk: 2, minRep: 25,
    brief: "Guardan datos de 80.000 ciudadanos. Nadie revisa las alertas de sus servidores de noche, y el gobierno nacional les exige un sistema de gestión de seguridad.",
    needs: [["mdr", "Nadie mira las alertas de noche: SOC 24/7."], ["iso", "Les exigen un sistema de gestión de seguridad: ISO 27001."], ["training", "Muchos funcionarios con correo: capacitación."]] },
  { id: "fintech", name: "Moneda Clara (fintech)", sector: "Fintech", budget: 1.5, risk: 3, minRep: 30,
    brief: "Una billetera digital que vive en la nube. Crecen rápido, les preocupan las cuentas mula y quieren que alguien ataque su app antes del lanzamiento.",
    needs: [["fraud", "Cuentas mula y movimientos raros: monitoreo de fraude."], ["pentest", "Probar la app antes de lanzarla: pentest."], ["cloud", "Todo corre en la nube: seguridad cloud."]] },
  { id: "clinica", name: "Clínica Los Nevados", sector: "Salud", budget: 1.3, risk: 3, minRep: 35,
    brief: "Historias clínicas digitales y quirófanos conectados. Vieron el ransomware en otras clínicas: no tienen quién vigile de noche ni un plan si los atacan.",
    needs: [["mdr", "Nadie vigila de noche: SOC 24/7."], ["ir", "No tienen plan si los atacan: retainer de respuesta a incidentes."], ["training", "El ransomware suele entrar por un correo: capacitación."]] },
  { id: "universidad", name: "Universidad del Valle Alto", sector: "Educación", budget: 1.2, risk: 2, minRep: 40,
    brief: "Miles de estudiantes, laboratorios montados en la nube y un «SOC» improvisado por dos becarios que se gradúan este semestre.",
    needs: [["mdr", "El monitoreo depende de dos becarios: un SOC 24/7 profesional."], ["cloud", "Laboratorios en la nube sin control: seguridad cloud."], ["training", "Miles de usuarios con correo: capacitación."]] },
  { id: "aseguradora", name: "Aseguradora Altiplano", sector: "Seguros", budget: 1.6, risk: 2, minRep: 55,
    brief: "La junta quiere un responsable de seguridad sin contratar uno de planta, certificarse en ISO 27001 y probar sus sistemas antes de la auditoría.",
    needs: [["vciso", "Un líder de seguridad por horas: CISO virtual."], ["iso", "Certificarse: consultoría ISO 27001."], ["pentest", "Probar los sistemas: pentest."]] },
  { id: "banco", name: "Banco Andino · Unidad de tarjetas", sector: "Banca", budget: 2.0, risk: 3, minRep: 70,
    brief: "Tu antiguo empleador te busca: quieren monitoreo de fraude con tarjetas, cumplir PCI DSS en la nueva plataforma y un pentest antes del lanzamiento.",
    needs: [["fraud", "Fraude con tarjetas: monitoreo en tiempo real."], ["pci", "Nueva plataforma de tarjetas: PCI DSS."], ["pentest", "Antes de lanzar: pentest."]] },
];

/* ——— Herramientas de tu empresa: setup = costo de compra, day = costo diario. ——— */
window.TOOLS = [
  { id: "siem", name: "SIEM gestionado (Wazuh)", setup: 300, day: 8, what: "Obligatorio para prestar SOC 24/7 y monitoreo de fraude." },
  { id: "edr", name: "EDR para clientes", setup: 250, day: 6, what: "Los incidentes de tus clientes de SOC ocurren un 30 % menos." },
  { id: "soar", name: "SOAR (automatización)", setup: 400, day: 10, what: "Cada analista SOC de tu equipo rinde 1 punto de capacidad más." },
  { id: "sast", name: "Escáner SAST", setup: 200, day: 5, what: "Obligatorio para prestar revisión de código seguro con calidad." },
  { id: "cspm", name: "CSPM (postura en la nube)", setup: 200, day: 5, what: "Obligatorio para prestar seguridad en la nube con calidad." },
  { id: "mfa", name: "MFA y gestor de claves (propio)", setup: 100, day: 2, what: "Protege tu propia empresa: +35 de seguridad interna." },
  { id: "backup", name: "Respaldos inmutables (propios)", setup: 150, day: 3, what: "Protege tu propia empresa: +25 de seguridad interna." },
];

/* ——— Oficinas: staff = empleados que caben (sin contarte a ti). ——— */
window.OFFICES = [
  { name: "Garaje de tu casa", staff: 2, rent: 0, cost: 0 },
  { name: "Coworking", staff: 5, rent: 10, cost: 300 },
  { name: "Oficina propia", staff: 12, rent: 25, cost: 900 },
  { name: "SOC propio con videowall", staff: 25, rent: 60, cost: 2500, rep: 10 },
];

/* ——— Etapas de la empresa según el ingreso mensual (20 días hábiles). ——— */
window.CO_STAGES = [[0, "Freelance"], [800, "Startup"], [3000, "Pyme"], [7500, "Proveedor regional"], [15000, "Líder en Latinoamérica"]];

window.CO_NAMES = {
  first: ["Laura", "Andrés", "Camila", "Juan", "Valentina", "Mariana", "Felipe", "Daniela", "Sebastián", "Paula", "Mateo", "Natalia", "Carlos", "Luisa", "Diego", "Sara", "Julián", "Manuela", "Esteban", "Isabel"],
  last: ["Gómez", "Rojas", "Pérez", "Castro", "Vargas", "Moreno", "Ríos", "Suárez", "Herrera", "Ortiz", "Salazar", "Mejía", "Cárdenas", "Arango", "Lozano"],
};

/* ——— Incidentes y dilemas. kind: client (le pasa a un cliente), ethics (dilema), own (a tu empresa).
   need = servicio que el cliente debe tener para que aparezca (opcional). Opciones: ok = la correcta.
   eff: sat (satisfacción del cliente), rep (reputación), cash (caja). ——— */
window.CO_EVENTS = [
  { id: "ransom", kind: "client", minRisk: 2, title: "Ransomware a las 3 a. m.",
    text: "{c} reporta que sus archivos aparecen cifrados y en las pantallas hay una nota de rescate.",
    opts: [
      { t: "Aislar los equipos afectados, activar el plan y restaurar desde respaldos", ok: true, eff: { sat: 15, rep: 3 } },
      { t: "Recomendar pagar el rescate para volver a operar rápido", eff: { sat: -25, rep: -6 } },
      { t: "Apagar todos los equipos y esperar a que abra la oficina", eff: { sat: -30, rep: -5 } }],
    why: "Primero se contiene (aislar sin borrar evidencia) y se recupera desde respaldos. Pagar no garantiza nada y financia al delincuente." },
  { id: "phish", kind: "client", title: "Campaña de phishing",
    text: "30 empleados de {c} recibieron un correo falso de «nómina» y 4 hicieron clic en el enlace.",
    opts: [
      { t: "Borrar el correo de todos los buzones, bloquear el dominio y cambiar las claves de quienes hicieron clic", ok: true, eff: { sat: 10, rep: 2 } },
      { t: "Enviar un correo general pidiendo que nadie lo abra", eff: { sat: -10, rep: -2 } },
      { t: "Esperar a ver si pasa algo antes de actuar", eff: { sat: -20, rep: -4 } }],
    why: "Se contiene el correo, se bloquean los indicadores y se protege a quienes cayeron. Esperar le da tiempo al atacante." },
  { id: "bucket", kind: "client", need: "cloud", title: "Bucket público",
    text: "Tu monitoreo encontró un bucket de {c} abierto a internet con copias de facturas de clientes.",
    opts: [
      { t: "Cerrar el acceso público, revisar en CloudTrail quién lo abrió y avisar a los responsables", ok: true, eff: { sat: 12, rep: 3 } },
      { t: "Borrar el bucket con todo su contenido", eff: { sat: -20, rep: -3 } },
      { t: "Dejarlo así: nadie conoce la dirección", eff: { sat: -25, rep: -6 } }],
    why: "Se cierra la exposición, se investiga con los registros y se evalúa si hubo acceso. Borrar destruye evidencia y datos." },
  { id: "cardtest", kind: "client", need: "pci", title: "Card testing",
    text: "{c} registró 400 compras de $1.000 en una hora, cada una con una tarjeta distinta.",
    opts: [
      { t: "Activar 3-D Secure, limitar los intentos y avisar para bloquear las tarjetas usadas", ok: true, eff: { sat: 12, rep: 3 } },
      { t: "Cerrar la tienda en línea por una semana", eff: { sat: -20, rep: -2 } },
      { t: "Ignorarlo: son compras muy pequeñas", eff: { sat: -20, rep: -5 } }],
    why: "Son tarjetas robadas probándose antes de compras grandes. Se frena con verificación del titular y límites de intentos." },
  { id: "bec", kind: "client", title: "Fraude de cambio de cuenta",
    text: "Un «proveedor» de {c} pidió por correo cambiar la cuenta de pago, y ayer se le transfirió el pago del mes.",
    opts: [
      { t: "Llamar al banco receptor para intentar congelar el dinero y verificar con el proveedor por su número registrado", ok: true, eff: { sat: 12, rep: 3 } },
      { t: "Responder ese mismo correo pidiendo que devuelvan el dinero", eff: { sat: -15, rep: -3 } },
      { t: "Esperar al cierre del mes para revisar", eff: { sat: -25, rep: -4 } }],
    why: "En un BEC cada hora cuenta para recuperar el dinero. Y nunca se verifica por el mismo canal que usó el atacante." },
  { id: "xss", kind: "client", need: "appsec", title: "Reporte de un investigador",
    text: "Un investigador de seguridad le avisa a {c} que su sitio de pagos tiene una falla XSS.",
    opts: [
      { t: "Agradecerle, corregir con prioridad y verificar con un retest", ok: true, eff: { sat: 10, rep: 4 } },
      { t: "Amenazarlo con una demanda para que no lo publique", eff: { sat: -10, rep: -8 } },
      { t: "Negar públicamente que exista la falla", eff: { sat: -15, rep: -6 } }],
    why: "Un reporte responsable es un regalo: se corrige y se agradece. Amenazar espanta a quienes podrían ayudarte." },
  { id: "report", kind: "client", minRisk: 2, title: "El regulador pregunta",
    text: "{c} sufrió un incidente y la entidad de control pide un reporte formal.",
    opts: [
      { t: "Reportar a tiempo con lo que se sabe y enviar actualizaciones después", ok: true, eff: { sat: 8, rep: 3 } },
      { t: "Esperar a tener todo resuelto antes de reportar", eff: { sat: -10, rep: -4 } },
      { t: "No reportar para evitar mala prensa", eff: { sat: -20, rep: -10 } }],
    why: "Los plazos de reporte son obligatorios. Se informa lo conocido y se actualiza; ocultarlo trae sanciones." },
  { id: "hackcomp", kind: "ethics", title: "Un encargo turbio",
    text: "Un empresario te ofrece ₳ 800 por «entrar» al correo de su competencia y sacarle información.",
    opts: [
      { t: "Rechazarlo, explicar que es un delito y dejar registro de la solicitud", ok: true, eff: { rep: 5 } },
      { t: "Aceptar: pagan muy bien", eff: { cash: 800, rep: -30 } },
      { t: "Aceptar, pero solo mirar sin cambiar nada", eff: { cash: 800, rep: -30 } }],
    why: "Acceder sin autorización es un delito (en Colombia, la Ley 1273 de 2009), con o sin cambios. Tu reputación es tu negocio." },
  { id: "insider", kind: "ethics", title: "Datos reales en casa",
    text: "Descubres que un empleado se llevó datos reales de un cliente para probar una herramienta en su casa.",
    opts: [
      { t: "Retirarle los accesos, investigar qué pasó y avisar al cliente", ok: true, eff: { rep: 4 } },
      { t: "Pedirle que no lo repita y olvidarlo", eff: { rep: -12 } },
      { t: "Despedirlo sin investigar ni avisar al cliente", eff: { rep: -8 } }],
    why: "Es un posible incidente de datos personales: se contiene, se investiga y se informa al dueño de los datos." },
  { id: "hidefinding", kind: "ethics", title: "«Quítalo del informe»",
    text: "Un cliente te pide que el informe de pentest no mencione la falla crítica, para no asustar a su junta directiva.",
    opts: [
      { t: "Mantener la falla en el informe y ofrecer explicársela a la junta", ok: true, eff: { rep: 5 } },
      { t: "Quitarla del informe para no perder al cliente", eff: { rep: -15 } },
      { t: "Dejarla, pero bajarle la severidad a «baja»", eff: { rep: -12 } }],
    why: "Un informe honesto es lo que el cliente paga. Ocultar riesgos te hace responsable si luego los explotan." },
  { id: "ownphish", kind: "own", title: "Te atacaron a ti",
    text: "Un empleado de Andino Shield cayó en un phishing y alguien entró a la consola de tu SIEM, donde ves datos de tus clientes.",
    opts: [
      { t: "Revocar sesiones, cambiar claves, activar MFA y avisar a los clientes afectados", ok: true, eff: { rep: -3 } },
      { t: "Cambiar solo esa clave y no decirle nada a nadie", eff: { rep: -20, churn: 1 } },
      { t: "Apagar el SIEM una semana hasta que se calme", eff: { rep: -15, churn: 1 } }],
    why: "Los atacantes van por los proveedores para llegar a sus clientes (como con Kaseya o SolarWinds). Se contiene y se avisa con transparencia." },
];
