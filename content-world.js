/* Turno Andino — mundo del juego: sedes, cargos, personajes, objetos y textos de historia.
   Todo es ficticio. El contenido de estudio viene de data/*.js (copiado de CyberRuta). */

window.CITIES = [
  { code: "BOG", city: "Bogotá", country: "Colombia", office: "Sede principal · Calle 72", phase: "f0", gate: "A3",
    mods: ["m01", "m02", "m03"], games: { quiz: 3, mail: 2, call: 2, decode: 2, header: 1, english: 1 },
    intro: "Bienvenido al SOC del Banco Andino. Hoy aprendes cómo piensa una máquina: bits, hashes y el sistema operativo." },
  { code: "MDE", city: "Medellín", country: "Colombia", office: "Centro de datos El Poblado", phase: "f1", gate: "B7",
    mods: ["m04a", "m04", "m05", "m06"], games: { quiz: 3, log: 3, siem: 1, code: 1, mail: 1, call: 1, english: 1 },
    intro: "Los servidores del banco corren Linux. Aquí lees logs, revisas permisos y encuentras lo que no encaja." },
  { code: "UIO", city: "Quito", country: "Ecuador", office: "Nodo de red Andino Norte", phase: "f2", gate: "C2",
    mods: ["m07", "m08", "m09"], games: { quiz: 3, ports: 2, log: 1, siem: 1, order: 1, mail: 1, english: 1 },
    intro: "Todo ataque viaja por una red. En Quito aprendes a leer IPs, puertos y protocolos." },
  { code: "LIM", city: "Lima", country: "Perú", office: "Fábrica de software", phase: "f3", gate: "A9",
    mods: ["m10", "m11", "m12"], games: { quiz: 3, code: 3, decode: 1, log: 1, call: 1, english: 1 },
    intro: "El equipo de desarrollo necesita a alguien que entienda código. Python y Java te esperan." },
  { code: "SCL", city: "Santiago", country: "Chile", office: "Oficina de riesgo y cripto", phase: "f4", gate: "D4",
    mods: ["m13", "m14", "m15"], games: { quiz: 3, decode: 2, header: 2, code: 1, call: 1, order: 1, english: 1 },
    intro: "CIA, cifrado e identidad: el vocabulario que usan auditores y arquitectos." },
  { code: "MEX", city: "Ciudad de México", country: "México", office: "Laboratorio de amenazas", phase: "f5", gate: "E1",
    mods: ["m16", "m17", "m18"], games: { quiz: 3, code: 2, cve: 2, header: 1, mail: 1, call: 1, order: 1 },
    intro: "El Camaleón se mueve rápido. Aquí estudias cómo atacan para saber defender." },
  { code: "GRU", city: "São Paulo", country: "Brasil", office: "SOC regional 24/7", phase: "f6", gate: "F6",
    mods: ["m19", "m20", "m21"], games: { quiz: 3, siem: 3, log: 2, cve: 1, order: 1, mail: 1 },
    intro: "El SOC regional nunca duerme. Alertas del SIEM, MITRE ATT&CK y respuesta a incidentes." },
  { code: "PTY", city: "Panamá", country: "Panamá", office: "Centro de pagos y tarjetas", phase: "f7", gate: "B2",
    mods: ["m22", "m23", "m24"], games: { quiz: 3, call: 2, mail: 1, header: 1, code: 1, log: 1, order: 1 },
    intro: "Aquí pasan millones en pagos cada hora. Fraude, PCI DSS y regulación financiera." },
  { code: "MAD", city: "Madrid", country: "España", office: "Dirección global de seguridad", phase: "f8", gate: "T4",
    mods: ["m25", "m26", "m27"], games: { quiz: 3, cve: 2, siem: 1, code: 1, order: 1, mail: 1, english: 1 },
    intro: "Nube, gobierno y el examen final. Quien pasa por Madrid está listo para Security+." },
];

/* Cargos: [reputación mínima, nombre, salario base por turno] */
window.CAREER_RANKS = [
  [0, "Practicante", 40],
  [400, "Analista SOC N1", 60],
  [1000, "Analista SOC N2", 85],
  [1800, "Cazador de amenazas", 110],
  [2800, "Ingeniero de seguridad", 140],
  [4000, "Especialista en seguridad bancaria", 175],
  [5500, "Arquitecto de seguridad", 215],
  [7500, "CISO", 260],
];

window.CHARACTERS = {
  marta: { name: "Marta Quintero", role: "Jefa del SOC", ini: "MQ" },
  juli: { name: "Julián «Juli» Ortega", role: "Analista N2", ini: "JO" },
  cama: { name: "El Camaleón", role: "Estafador buscado", ini: "¿?" },
};

/* Objetos para tu vida: se compran con el salario. perk = efecto en el juego. */
window.ITEMS = [
  { id: "planta", name: "Una planta", price: 40, perk: null, glyph: "plant",
    desc: "No hace nada. Pero el escritorio se ve mejor y tú lo sabes." },
  { id: "cafe", name: "Café de origen", price: 90, perk: "hint", glyph: "cup",
    desc: "+1 pista por turno. Una pista descarta una respuesta incorrecta." },
  { id: "audifonos", name: "Audífonos con cancelación de ruido", price: 150, perk: "sla", glyph: "phones",
    desc: "El tiempo para el bono de rapidez sube de 25 a 35 segundos. Ideal en el bus." },
  { id: "maleta", name: "Maleta de cabina", price: 200, perk: "freeze", glyph: "bag",
    desc: "Protege tu racha: si un día no juegas, la maleta la guarda (una vez por semana)." },
  { id: "monitor", name: "Segundo monitor", price: 260, perk: "xp", glyph: "screen",
    desc: "+15 % de reputación en cada turno." },
  { id: "llave", name: "Llave de seguridad FIDO2", price: 320, perk: "shield", glyph: "key",
    desc: "Tu primer error de cada turno no le baja la salud al banco." },
  { id: "termo", name: "Termo para el turno largo", price: 380, perk: "hint", glyph: "flask",
    desc: "+1 pista más por turno. Sí, se acumula con el café." },
  { id: "homelab", name: "Home lab (mini PC)", price: 480, perk: "labxp", glyph: "server",
    desc: "+30 de reputación extra al terminar cada turno. Practicar en casa se nota." },
];

/* Expediente del Camaleón: se desbloquea una nota cada vez que lo atrapas N veces. */
window.DOSSIER = [
  [1, "Autoridad", "Se hace pasar por alguien con poder: el presidente, la DIAN, soporte de TI. La gente obedece a la autoridad sin verificar."],
  [3, "Urgencia", "Siempre hay un plazo: «en 2 horas», «hoy mismo». La prisa impide pensar. Regla: si hay afán, más calma."],
  [6, "Dominios gemelos", "Registra dominios casi iguales: micros0ft, bancoandino-seguridad.co. Lee el dominio de derecha a izquierda."],
  [10, "Canal cambiado", "Empieza por correo y te pide seguir por WhatsApp o por teléfono, donde no hay filtros. Verifica por un canal que tú elijas."],
  [15, "Secreto", "«Es confidencial, no lo comentes». Aislarte es su táctica: un proceso legítimo nunca te pide saltarte controles."],
  [22, "Lo atrapaste", "El Camaleón usa siempre las mismas palancas psicológicas. Ya las conoces todas. Así se entrena una analista de verdad."],
];

/* Frases de Marta según el resultado del turno. */
window.MARTA_END = {
  3: ["Turno impecable. Así se cuida un banco.", "Ni un error. Voy a mencionarte en la reunión de mañana.", "Eso fue trabajo de nivel senior."],
  2: ["Buen turno. Revisa lo que fallaste antes de irte.", "Sólido. Un par de cosas para repasar y listo.", "Vas bien. Los errores de hoy son el repaso de mañana."],
  1: ["Turno difícil. Lee las explicaciones con calma, para eso están.", "Hoy costó. Mañana los mismos temas te van a parecer fáciles.", "Todo analista tuvo un turno así. Repasa y vuelve."],
  0: ["El banco tuvo un mal día. No pasa nada: esto es entrenamiento.", "Respira. Lee cada explicación y repite el turno."],
};

window.MARTA_TIPS = [
  "Antes de hacer clic, pasa el dedo sobre el enlace y lee el dominio completo.",
  "Si una alerta no tiene sentido, pregunta. En un SOC nadie trabaja solo.",
  "En un incidente no apagues el equipo: aíslalo de la red. La RAM guarda evidencia.",
  "El banco nunca pide la clave ni el código SMS. Nunca.",
  "Documenta todo lo que haces. Si no está escrito, no pasó.",
  "Un buen analista sabe distinguir lo raro de lo peligroso.",
  "En el aeropuerto, desconfía del Wi-Fi gratis sin contraseña. Usa tus datos móviles.",
];

/* Dibujos simples (SVG en línea) para los objetos. Trazos con currentColor. */
window.GLYPHS = {
  plant: '<path d="M12 21v-7M12 14c0-4 3-6 6-6 0 4-3 6-6 6zM12 12c0-3-2-5-5-5 0 3 2 5 5 5z"/><path d="M8 21h8l-1-4H9z"/>',
  cup: '<path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 11h2a2 2 0 0 1 0 4h-2M9 3c0 1.5 1 1.5 1 3M13 3c0 1.5 1 1.5 1 3"/>',
  phones: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
  bag: '<rect x="6" y="7" width="12" height="13" rx="2"/><path d="M9 7V4h6v3M9 20v1M15 20v1M10 11v5M14 11v5"/>',
  screen: '<rect x="2" y="5" width="9" height="7" rx="1"/><rect x="13" y="5" width="9" height="7" rx="1"/><path d="M6 16h3M15 16h3M7.5 12v4M16.5 12v4"/>',
  key: '<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M21 12v2"/>',
  flask: '<rect x="8" y="6" width="8" height="15" rx="2"/><path d="M9 3h6v3H9zM8 11h8"/>',
  server: '<rect x="4" y="4" width="16" height="7" rx="1.5"/><rect x="4" y="13" width="16" height="7" rx="1.5"/><path d="M8 7.5h.01M8 16.5h.01M12 7.5h5M12 16.5h5"/>',
};
