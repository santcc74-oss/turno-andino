/* Turno Andino — en qué gastar el salario: equipo con mejoras, vivienda, certificaciones y recuerdos de viaje. */

/* ——— Equipo de trabajo: cada objeto tiene hasta 3 niveles. levels = [[nombre, precio, efecto]] ——— */
window.GEAR = [
  { id: "planta", glyph: "plant", levels: [["Una planta", 40, "No hace nada. Pero el escritorio se ve mejor."], ["Tres plantas", 90, "Tu escritorio ya parece un vivero."], ["Jardín vertical", 180, "Marta te pregunta si puedes cuidar las suyas."]] },
  { id: "cafe", glyph: "cup", levels: [["Café de origen", 90, "1 pista por turno."], ["Cafetera italiana", 220, "2 pistas por turno."], ["Máquina de espresso", 450, "3 pistas por turno."]] },
  { id: "audifonos", glyph: "phones", levels: [["Audífonos con cancelación de ruido", 150, "Bono de rapidez con 35 s en vez de 25."], ["Audífonos profesionales", 320, "Bono de rapidez con 45 s."]] },
  { id: "silla", glyph: "chair", levels: [["Silla ergonómica", 180, "Cada error baja 15 de salud del banco en vez de 20."], ["Escritorio de pie", 380, "Cada error baja solo 10."]] },
  { id: "monitor", glyph: "screen", levels: [["Segundo monitor", 260, "+15 % de reputación por turno."], ["Monitor ultraancho", 520, "+25 %."], ["Tres monitores", 900, "+35 %."]] },
  { id: "llave", glyph: "key", levels: [["Llave de seguridad FIDO2", 320, "Tu primer error de cada turno no baja la salud."], ["Llave de respaldo", 600, "Tus dos primeros errores no la bajan."]] },
  { id: "laptop", glyph: "laptop", levels: [["Portátil propio", 350, "+10 % de salario por turno."], ["Portátil potente", 700, "+20 %."], ["Estación de trabajo", 1400, "+30 %."]] },
  { id: "maleta", glyph: "bag", levels: [["Maleta de cabina", 200, "Protege tu racha 1 día por semana."], ["Maleta con candado TSA", 420, "La protege 2 días por semana."]] },
  { id: "homelab", glyph: "server", levels: [["Home lab (mini PC)", 480, "+30 de reputación al terminar cada turno."], ["Rack con 3 servidores", 950, "+60."], ["Laboratorio con firewall propio", 1800, "+100."]] },
];

/* ——— Vivienda: cada una suma +5 % de salario (acumulado) y cambia tu escena de «Vida». ——— */
window.HOMES = [
  { name: "Habitación en arriendo", price: 0, desc: "Una cama, un escritorio y wifi prestado del vecino (con permiso)." },
  { name: "Apartaestudio", price: 1200, desc: "Tu propio espacio y un rincón para estudiar." },
  { name: "Apartamento con vista", price: 3000, desc: "Una habitación entera para tu laboratorio." },
  { name: "Casa con estudio", price: 7000, desc: "Oficina en casa con rack y pizarra para diagramas." },
  { name: "Penthouse", price: 15000, desc: "La vista de la ciudad desde tu escritorio. Te lo ganaste." },
];

/* ——— Certificaciones reales: compras el voucher y presentas un examen con preguntas de los temas.
   Si apruebas (75 %) ganas el título, +salario y reputación. Si no, pierdes el voucher (como en la vida real). ——— */
window.CERT_EXAMS = [
  { id: "cc", name: "ISC2 Certified in Cybersecurity (CC)", price: 250, n: 12, pay: 5, xp: 150,
    mods: ["m01", "m07", "m08", "m13", "m14", "m15", "m16", "m21"], note: "La primera certificación de muchos: fundamentos, redes, controles y respuesta a incidentes." },
  { id: "secplus", name: "CompTIA Security+ (SY0-701)", price: 900, n: 20, pay: 10, xp: 400,
    mods: ["m07", "m08", "m09", "m13", "m14", "m15", "m16", "m17", "m18", "m19", "m20", "m21", "m23", "m25", "m26"], note: "La meta principal: la piden en muchas vacantes de bancos." },
  { id: "cysa", name: "CompTIA CySA+", price: 1400, n: 16, pay: 10, xp: 500,
    mods: ["m06", "m18", "m19", "m20", "m21"], note: "Analista de ciberseguridad: detección, SIEM, vulnerabilidades y respuesta." },
  { id: "pentestplus", name: "CompTIA PenTest+", price: 1400, n: 16, pay: 10, xp: 500,
    mods: ["m09", "m17", "m18", "m04", "m05"], note: "Pruebas de penetración éticas: alcance, escaneo, explotación e informes." },
  { id: "pcip", name: "PCI Professional (PCIP)", price: 1200, n: 14, pay: 8, xp: 400,
    mods: ["m22", "m23", "m24"], note: "Especialista en seguridad de pagos con tarjeta." },
  { id: "awssec", name: "AWS Certified Security – Specialty", price: 1800, n: 16, pay: 12, xp: 600,
    mods: ["m25", "m15", "m19", "m14"], note: "Seguridad en la nube de Amazon Web Services." },
];

/* ——— Recuerdos de viaje: uno por ciudad con sello. Completar la colección da un premio. ——— */
window.SOUVENIRS = {
  BOG: ["Taza de café de Bogotá", 60], MDE: ["Silleta en miniatura", 80], UIO: ["Llavero de la Mitad del Mundo", 70],
  LIM: ["Llama de peluche", 70], SCL: ["Piedra de lapislázuli", 90], MEX: ["Alebrije pintado a mano", 90],
  GRU: ["Camiseta de fútbol", 100], PTY: ["Sombrero pintao", 110], MAD: ["Abanico de Madrid", 120],
};
