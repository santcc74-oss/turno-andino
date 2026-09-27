# Turno Andino

Juego de ciberseguridad bancaria para el celular, pensado para jugar de viaje: en el aeropuerto, el bus o el avión, **sin internet**.

Eres analista del SOC del Banco Andino, un banco ficticio. Cada turno dura unos 3 minutos y trae 6 tickets: correos y SMS de phishing, llamadas de estafadores, alertas del SIEM, puertos, cifrados y preguntas del equipo. Subes de cargo de Practicante a CISO, viajas por 9 sedes (cada una es un tema) y ganas sellos en tu pasaporte al aprobar el examen de cada sede.

**Jugar:** https://santcc74-oss.github.io/turno-andino/

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
