/* Turno Andino — gráficos: retratos de personajes, mapa de rutas, confeti y ceremonias.
   Todo es SVG o canvas dibujado en el momento: no se descargan imágenes y funciona sin internet. */
(function () {
  const reduced = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ——— Retratos (viewBox 64×64, recortados en círculo por CSS) ——— */
  const MOUTH = {
    happy: '<path d="M27 38.5 Q32 43.5 37 38.5" stroke="#3A1E14" stroke-width="1.8" fill="#7A2E24"/>',
    neutral: '<path d="M28.5 39.5 Q32 40.5 35.5 39.5" stroke="#3A1E14" stroke-width="1.8" fill="none"/>',
    worried: '<path d="M27.5 41.5 Q32 37.5 36.5 41.5" stroke="#3A1E14" stroke-width="1.8" fill="none"/>',
  };
  const BROWS = {
    happy: '<path d="M23.5 26.5 Q27 24.5 30 26M34 26 Q37 24.5 40.5 26.5" stroke="#2B1B14" stroke-width="1.6" fill="none"/>',
    neutral: '<path d="M23.5 26.5 L30 26M34 26 L40.5 26.5" stroke="#2B1B14" stroke-width="1.6" fill="none"/>',
    worried: '<path d="M23.5 27 L30 25M34 25 L40.5 27" stroke="#2B1B14" stroke-width="1.6" fill="none"/>',
  };
  const eyes = (y) => `<circle cx="27" cy="${y}" r="1.4" fill="#1D2633"/><circle cx="37" cy="${y}" r="1.4" fill="#1D2633"/>`;

  function face(who, mood) {
    if (who === "cama") return cama(mood);
    mood = MOUTH[mood] ? mood : "neutral";
    if (who === "marta") return `
      <rect width="64" height="64" fill="#CFE7E4"/>
      <path d="M17 34 C15 18 24 12 32 12 C40 12 49 18 47 34 L48 44 L16 44 Z" fill="#2B1B14"/>
      <rect x="28" y="38" width="8" height="10" fill="#B27650"/>
      <path d="M7 64 C9 51 19 46 32 46 C45 46 55 51 57 64 Z" fill="#8C5F16"/>
      <path d="M26 46 L32 55 L38 46 Z" fill="#F4EFE6"/>
      <ellipse cx="32" cy="30" rx="12" ry="13" fill="#C98E63"/>
      <path d="M20 28 C20 18 30 15 38 17 C42 19 44 23 44 28 C38 23 29 22 20 28 Z" fill="#2B1B14"/>
      <circle cx="20.5" cy="34" r="1.3" fill="#E0AC52"/><circle cx="43.5" cy="34" r="1.3" fill="#E0AC52"/>
      ${BROWS[mood]}${eyes(31)}
      <circle cx="27" cy="31" r="3.8" fill="none" stroke="#1D2633" stroke-width="1.3"/><circle cx="37" cy="31" r="3.8" fill="none" stroke="#1D2633" stroke-width="1.3"/>
      <path d="M30.8 31 H33.2" stroke="#1D2633" stroke-width="1.3"/>
      ${MOUTH[mood]}`;
    if (who === "juli") return `
      <rect width="64" height="64" fill="#F3E7D2"/>
      <rect x="28" y="39" width="8" height="9" fill="#6E4129"/>
      <path d="M6 64 C8 51 19 46 32 46 C45 46 56 51 58 64 Z" fill="#0F7A74"/>
      <path d="M28 47 L28 56M36 47 L36 56" stroke="#D5ECEA" stroke-width="1.4"/>
      <ellipse cx="32" cy="31" rx="12" ry="13" fill="#8D5A3B"/>
      <g fill="#1A1210"><circle cx="22" cy="21" r="6"/><circle cx="28" cy="16.5" r="6"/><circle cx="35.5" cy="16" r="6"/><circle cx="42" cy="20" r="6"/><circle cx="45" cy="26" r="4.2"/><circle cx="19" cy="26.5" r="4.2"/></g>
      <path d="M18 32 C18 13 46 13 46 32" stroke="#1D2633" stroke-width="2.4" fill="none"/>
      <rect x="15.5" y="28.5" width="4.5" height="9" rx="2" fill="#1D2633"/><rect x="44" y="28.5" width="4.5" height="9" rx="2" fill="#1D2633"/>
      <path d="M18 37 C19.5 42.5 23 44 27 43" stroke="#1D2633" stroke-width="1.6" fill="none"/>
      ${BROWS[mood].replace(/#2B1B14/g, "#1A1210")}${eyes(31.5)}
      ${MOUTH[mood]}`;
    if (who === "hernan") return `
      <rect width="64" height="64" fill="#E3E8EE"/>
      <rect x="28" y="39" width="8" height="9" fill="#C99774"/>
      <path d="M7 64 C9 51 19 46 32 46 C45 46 55 51 57 64 Z" fill="#56637A"/>
      <path d="M27 46 L32 51 L37 46" stroke="#E9EEF5" stroke-width="1.6" fill="none"/>
      <ellipse cx="32" cy="30" rx="12" ry="13.5" fill="#E0B08C"/>
      <path d="M20 31 C19 24 21 21 23 20 L23 30 Z M44 31 C45 24 43 21 41 20 L41 30 Z" fill="#C9CED6"/>
      ${BROWS[mood].replace(/#2B1B14/g, "#9AA3AE")}${eyes(31)}
      <path d="M26 37.5 C29 35.5 35 35.5 38 37.5 C35 38.5 29 38.5 26 37.5 Z" fill="#C9CED6"/>
      <g transform="translate(0 1.5)">${MOUTH[mood]}</g>`;
    if (who === "clienta") return `
      <rect width="64" height="64" fill="#F6DDD7"/>
      <circle cx="32" cy="13" r="6.5" fill="#9AA3AE"/>
      <rect x="28" y="39" width="8" height="9" fill="#C28A63"/>
      <path d="M7 64 C9 51 19 46 32 46 C45 46 55 51 57 64 Z" fill="#B83A26"/>
      <ellipse cx="32" cy="30" rx="12" ry="13" fill="#D9A07A"/>
      <path d="M20 29 C20 19 27 16.5 32 16.5 C37 16.5 44 19 44 29 C41 23 36 21 32 21 C28 21 23 23 20 29 Z" fill="#9AA3AE"/>
      ${BROWS[mood].replace(/#2B1B14/g, "#7C8591")}${eyes(31)}
      ${MOUTH[mood]}`;
    if (who === "stranger") return `
      <rect width="64" height="64" fill="#26344A"/>
      <circle cx="32" cy="27" r="12" fill="#5A6B82"/>
      <path d="M8 64 C10 50 20 44 32 44 C44 44 54 50 56 64 Z" fill="#5A6B82"/>
      <text x="32" y="32" text-anchor="middle" font-size="15" font-weight="800" fill="#E9EEF5" font-family="Bricolage Grotesque, sans-serif">?</text>`;
    return face("stranger");
  }

  /* El Camaleón: cambia de color según el disfraz (tono 0-360). */
  function cama(mood, hue) {
    hue = hue == null ? 118 : hue;
    const skin = `hsl(${hue} 52% 46%)`, dark = `hsl(${hue} 55% 26%)`, light = `hsl(${hue} 60% 70%)`;
    const caught = mood === "caught" || mood === "worried";
    const pupils = caught
      ? `<path d="M21 29 l4 4 m0 -4 l-4 4 M40 27 l4 4 m0 -4 l-4 4" stroke="#0F1B2D" stroke-width="1.8"/>`
      : `<circle cx="21.5" cy="31" r="2.6" fill="#0F1B2D"/><circle cx="43.5" cy="28.5" r="2.4" fill="#0F1B2D"/>`;
    const mouth = caught
      ? `<path d="M19 42 q4 -2 7 0 t7 0 t7 0 t6 -1" stroke="${dark}" stroke-width="1.8" fill="none"/><path d="M50 22 q2 4 0 5 q-2 -1 0 -5z" fill="#9FD8F0"/>`
      : `<path d="M18 40 C26 44.5 38 44.5 47 37 L48.5 35" stroke="${dark}" stroke-width="1.9" fill="none"/>`;
    return `
      <rect width="64" height="64" fill="#0F1B2D"/>
      <path d="M4 64 C8 52 18 48 32 48 C46 48 56 52 60 64 Z" fill="#4A3A2C"/>
      <path d="M22 48 L32 60 L27 48 Z M42 48 L32 60 L37 48 Z" fill="#6B5642"/>
      <path d="M13 40 C11 27 21 19 33 19 C46 19 53 27 51 37 C50 45 41 49 31 48 C22 47 14 46 13 40 Z" fill="${skin}"/>
      <circle cx="30" cy="36" r="1.6" fill="${light}"/><circle cx="35" cy="40" r="1.2" fill="${light}"/><circle cx="16" cy="37" r="1.3" fill="${light}"/>
      <circle cx="23" cy="31" r="7" fill="${light}" stroke="${dark}" stroke-width="1.4"/>
      <circle cx="42" cy="28.5" r="6.2" fill="${light}" stroke="${dark}" stroke-width="1.4"/>
      ${pupils}${mouth}
      <ellipse cx="33" cy="18.5" rx="17" ry="3.6" fill="#141414"/>
      <path d="M21.5 18.5 C21.5 8 44.5 8 44.5 18.5 Z" fill="#1E1E1E"/>
      <rect x="21.8" y="14.2" width="22.4" height="2.6" fill="#E0AC52"/>`;
  }

  let uid = 0;
  function portrait(who, mood, cls) {
    uid += 1;
    const c = (window.CHARACTERS && CHARACTERS[who]) || null;
    return `<span class="portrait ${cls || ""}" role="img" aria-label="${c ? c.name : "Persona que llama"}"><svg viewBox="0 0 64 64" aria-hidden="true" data-u="${uid}">${face(who, mood)}</svg></span>`;
  }

  /* ——— Mapa de rutas ——— */
  const P = (lon, lat) => [(lon + 118) * 4 + 8, (33 - lat) * 4 + 8];
  const AMERICAS = [
    [-117.1, 32.5], [-111, 31.3], [-106.5, 31.8], [-103, 29], [-99.5, 27.5], [-97.2, 25.9], [-97.7, 22], [-96, 19], [-94.5, 18.2], [-91, 18.6],
    [-90.3, 21], [-87, 21.5], [-87.5, 18], [-88.5, 16], [-84, 15.8], [-83.3, 14.9], [-83.7, 11], [-81.7, 9], [-79.5, 9.5], [-77.4, 8.6],
    [-75.5, 10.5], [-74, 11.2], [-71.9, 12.4], [-71, 10.8], [-68, 10.6], [-64, 10.6], [-61.8, 10.7], [-60, 8.5], [-57, 6], [-54, 5.8],
    [-51.5, 4.2], [-50, 1.8], [-48.5, -1.2], [-44, -2.5], [-41, -2.9], [-38.5, -3.7], [-35.2, -5.8], [-34.9, -8], [-37, -11], [-38.9, -13.5],
    [-39.2, -17.8], [-40.3, -20.3], [-41.9, -22.9], [-44.5, -23.3], [-48.5, -26], [-48.8, -28.5], [-51, -31], [-53.4, -33.7], [-54.9, -34.9],
    [-58.4, -34.6], [-57.3, -36.5], [-57.5, -38.2], [-62, -38.9], [-62.3, -40.8], [-65, -41], [-63.6, -42.6], [-65.3, -44.5], [-67.5, -46],
    [-65.8, -47.8], [-68.3, -50.1], [-69.2, -52.1], [-68.6, -54.8], [-66.5, -55], [-70, -55.5], [-72, -53.8], [-74.7, -52.5], [-75.5, -48.5],
    [-74, -44], [-73.5, -41.5], [-73.7, -37.2], [-72, -33], [-71.4, -30], [-70.3, -23.7], [-70.2, -18.4], [-71.4, -17.6], [-75, -15.4],
    [-76.3, -13.5], [-77.2, -12], [-79, -8], [-81.3, -5.1], [-80.3, -3.4], [-80.9, -1.2], [-80.1, 0.5], [-78.9, 1.4], [-77.5, 4], [-77.4, 7.1],
    [-78.4, 8.3], [-80.5, 7.3], [-82.9, 8.1], [-85.7, 10.7], [-87.6, 13.3], [-91.5, 13.9], [-94, 16], [-96.5, 15.7], [-98.5, 16.3], [-101.5, 17.8],
    [-105.5, 20.5], [-105.2, 22.5], [-106.4, 23.2], [-109.1, 26.2], [-110.9, 27.9], [-112.7, 31.3], [-114.8, 31.8], [-113, 29], [-111.5, 26],
    [-110.3, 24.2], [-109.9, 22.9], [-112, 24.8], [-114.2, 28], [-115.9, 30.4],
  ];
  const IBERIA = [[-9.3, 43.1], [-7.9, 43.8], [-1.8, 43.4], [3.2, 42.4], [0.8, 40.8], [-0.3, 39.5], [0.2, 38.8], [-0.8, 37.6], [-2.1, 36.7],
    [-5.6, 36], [-6.4, 36.8], [-7.4, 37.2], [-8.9, 37], [-8.8, 38.7], [-9.5, 38.8], [-8.9, 41], [-8.8, 42.2]];
  const INSET = { x: 258, y: 16, w: 84, h: 64 };
  const PI = (lon, lat) => [INSET.x + 6 + (lon + 10) * 5.2, INSET.y + 14 + (44 - lat) * 5.2];
  const poly = (pts, f) => "M" + pts.map((p) => f(p[0], p[1]).map((n) => n.toFixed(1)).join(" ")).join("L") + "Z";

  /* Posición de cada ciudad en el mapa (proyección, con ajustes para que no se encimen) y lado de la etiqueta. */
  const NODES = {
    BOG: { at: [192, 125], lab: "r" }, MDE: { at: [174, 113], lab: "l" }, UIO: { at: P(-78.47, -0.18), lab: "l" },
    LIM: { at: P(-77.04, -12.05), lab: "l" }, SCL: { at: P(-70.67, -33.45), lab: "r" }, MEX: { at: P(-99.13, 19.43), lab: "t" },
    GRU: { at: P(-46.63, -23.55), lab: "r" }, PTY: { at: [157, 99], lab: "t" }, MAD: { at: PI(-3.7, 40.42), lab: "l" },
  };

  function routePath(a, b, bend) {
    const [x1, y1] = a, [x2, y2] = b;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1;
    const k = bend == null ? 0.22 : bend;
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${(mx - dy * k).toFixed(1)} ${(my + dx * k).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }

  /* states: {CODE: "done" | "exam" | "open" | "shut"}; sel = ciudad seleccionada. */
  function map(states, sel) {
    const grid = [];
    for (let lon = -110; lon <= -40; lon += 10) { const [x] = P(lon, 0); grid.push(`<path d="M${x} 8 V364"/>`); }
    for (let lat = 30; lat >= -50; lat -= 10) { const [, y] = P(0, lat); grid.push(`<path d="M8 ${y} H352"/>`); }
    const [, eq] = P(0, 0);
    const codes = CITIES.map((c) => c.code);
    const routes = codes.slice(0, -1).map((code, i) => {
      const next = codes[i + 1];
      const st = states[next] === "shut" ? "shut" : states[code] === "done" ? "done" : "next";
      const bend = next === "MAD" ? -0.28 : i % 2 ? 0.22 : -0.22;
      return `<path class="rt rt-${st}" id="rt-${next}" d="${routePath(NODES[code].at, NODES[next].at, bend)}"/>`;
    }).join("");
    const nodes = CITIES.map((c) => {
      const n = NODES[c.code], st = states[c.code], [x, y] = n.at;
      const lx = n.lab === "r" ? x + 10 : n.lab === "l" ? x - 10 : x;
      const ly = n.lab === "t" ? y - 11 : n.lab === "b" ? y + 17 : y + 4;
      const anchor = n.lab === "r" ? "start" : n.lab === "l" ? "end" : "middle";
      const mark = st === "done"
        ? `<circle r="7" class="nd-done"/><path d="M-3 0 l2 2.2 l4 -4.4" class="nd-check"/>`
        : st === "exam" ? `<circle r="7" class="nd-exam"/><text y="3" text-anchor="middle" class="nd-ex">!</text>`
        : st === "open" ? `<circle r="11" class="nd-pulse"/><circle r="6.5" class="nd-open"/>`
        : `<circle r="5" class="nd-shut"/>`;
      return `<g class="nd ${c.code === sel ? "is-sel" : ""} st-${st}" data-code="${c.code}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" ${st === "shut" ? "" : 'tabindex="0" role="button"'} aria-label="${c.city}${st === "shut" ? ", cerrada" : ""}">
        <circle r="15" class="nd-hit"/>${c.code === sel ? '<circle r="11" class="nd-sel"/>' : ""}${mark}
        <text x="${(lx - x).toFixed(1)}" y="${(ly - y).toFixed(1)}" text-anchor="${anchor}" class="nd-lab">${c.code}</text>
      </g>`;
    }).join("");
    return `<svg class="map" viewBox="0 0 360 372" role="group" aria-label="Mapa de rutas del Banco Andino">
      <rect x="0" y="0" width="360" height="372" class="map-sea"/>
      <g class="map-grid">${grid.join("")}</g>
      <path d="M8 ${eq} H352" class="map-eq"/><text x="14" y="${eq - 4}" class="map-note">ECUADOR 0°</text>
      <path d="${poly(AMERICAS, P)}" class="map-land"/>
      <g class="map-inset"><rect x="${INSET.x}" y="${INSET.y}" width="${INSET.w}" height="${INSET.h}" rx="8"/>
        <path d="${poly(IBERIA, PI)}" class="map-land"/>
        <text x="${INSET.x + INSET.w / 2}" y="${INSET.y + INSET.h - 6}" text-anchor="middle" class="map-note">ESPAÑA · 8.000 KM</text></g>
      <g class="map-routes">${routes}</g>
      <g class="map-plane" id="map-plane" opacity="0"><path d="M-9 1.5 l7 -1 3.5 -7 h1.8 l-1.8 7 5.2 -.4 1.8 -2.2 h1.3 l-.9 3.5 .9 3.5 h-1.3 l-1.8 -2.2 -5.2 -.4 1.8 7 h-1.8 l-3.5 -7 -7 -1 z"/></g>
      <g class="map-nodes">${nodes}</g>
    </svg>`;
  }

  /* Hace volar el avión por la ruta que termina en `code`. */
  function flyTo(svg, code, done) {
    const path = svg && svg.querySelector("#rt-" + code), plane = svg && svg.querySelector("#map-plane");
    if (!path || !plane || reduced() || document.hidden) { if (done) done(); return; }
    const len = path.getTotalLength(), t0 = performance.now(), dur = 2200;
    const p0 = path.getPointAtLength(0);
    plane.setAttribute("transform", `translate(${p0.x.toFixed(1)} ${p0.y.toFixed(1)})`);
    path.classList.add("rt-drawing");
    path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
    plane.setAttribute("opacity", "1");
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur), e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const p = path.getPointAtLength(e * len), q = path.getPointAtLength(Math.min(len, e * len + 1));
      const ang = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
      plane.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
      path.style.strokeDashoffset = len * (1 - e);
      if (t < 1) requestAnimationFrame(step);
      else {
        plane.setAttribute("opacity", "0"); path.style.strokeDasharray = ""; path.style.strokeDashoffset = ""; path.classList.remove("rt-drawing");
        if (done) done();
      }
    };
    requestAnimationFrame(step);
  }

  /* ——— Confeti (una sola ráfaga, luego se borra) ——— */
  function confetti() {
    if (reduced() || document.hidden) return;
    const cv = document.createElement("canvas");
    cv.className = "confetti"; cv.setAttribute("aria-hidden", "true");
    document.body.appendChild(cv);
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = innerWidth, H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    const ctx = cv.getContext("2d"); ctx.scale(dpr, dpr);
    const cols = ["#E0AC52", "#8C5F16", "#0F7A74", "#45BDB3", "#B83A26", "#E9EEF5"];
    const ps = Array.from({ length: 110 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 60, y: H * 0.38, vx: (Math.random() - 0.5) * 9, vy: -6 - Math.random() * 8,
      w: 5 + Math.random() * 5, h: 3 + Math.random() * 4, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: cols[Math.floor(Math.random() * cols.length)],
    }));
    const t0 = performance.now();
    const step = (now) => {
      const t = now - t0;
      ctx.clearRect(0, 0, W, H);
      ps.forEach((p) => {
        p.vy += 0.28; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = Math.max(0, 1 - t / 2200);
        ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
      if (t < 2200) requestAnimationFrame(step); else cv.remove();
    };
    requestAnimationFrame(step);
  }

  /* ——— Sello de pasaporte ——— */
  const INKS = ["var(--brass)", "var(--teal)", "var(--danger)"];
  function stamp(c, i, date) {
    const rot = ((i * 37) % 24) - 12;
    return `<svg class="stamp" viewBox="0 0 120 120" style="--rot:${rot}deg;color:${INKS[i % 3]}" role="img" aria-label="Sello de ${c.city}">
      <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" stroke-width="3"/>
      <circle cx="60" cy="60" r="46" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3"/>
      <text x="60" y="46" text-anchor="middle" font-size="7.5" fill="currentColor" font-family="IBM Plex Mono, monospace" letter-spacing=".5">BANCO ANDINO</text>
      <text x="60" y="72" text-anchor="middle" font-size="28" font-weight="800" fill="currentColor" font-family="Bricolage Grotesque, sans-serif">${c.code}</text>
      <text x="60" y="90" text-anchor="middle" font-size="9" fill="currentColor" font-family="IBM Plex Mono, monospace">${date || ""}</text>
    </svg>`;
  }

  /* Ventana de celebración reutilizable. onClose recibe el nombre del botón pulsado. */
  function ceremony(html, buttons, onClose) {
    const el = document.createElement("div");
    el.className = "ceremony";
    el.setAttribute("role", "dialog");
    el.innerHTML = `<div class="ceremony-card">${html}<div class="stack">${buttons.map((b, i) => `<button class="btn ${i === 0 ? "primary" : ""} wide big" data-b="${b[0]}">${b[1]}</button>`).join("")}</div></div>`;
    document.body.appendChild(el);
    el.querySelectorAll("button[data-b]").forEach((b) => b.onclick = () => { el.remove(); if (onClose) onClose(b.dataset.b); });
    const first = el.querySelector("button"); if (first) first.focus({ preventScroll: true });
    return el;
  }

  function stampCeremony(city, next, onClose) {
    const i = CITIES.indexOf(city);
    ceremony(`
      <p class="eyebrow mono">Control de pasaporte · ${city.code}</p>
      <div class="slam-page">${stamp(city, i, TA.dayKey())}</div>
      <h2>Sello de ${city.city}</h2>
      <p>${next ? `Aprobaste el examen de sede. El banco te envía a <b>${next.city}</b>: nueva ruta abierta.` : "Completaste la última sede del Banco Andino."}</p>`,
      next ? [["map", "Ver la nueva ruta"], ["home", "Volver al inicio"]] : [["home", "Volver al inicio"]], onClose);
  }

  function promoCeremony(rank, onClose) {
    confetti();
    ceremony(`
      <p class="eyebrow mono">Recursos Humanos · Banco Andino</p>
      <div class="promo-badge" aria-hidden="true"><small>NIVEL</small><span>${rank.i + 1}</span><small>DE ${CAREER.length}</small></div>
      <h2>Ascenso: ${rank.name}</h2>
      <div class="quote">${portrait("marta", "happy")}<p>«Te lo ganaste. Desde hoy cobras ${TA.money(rank.salary)} por turno.»<small>Marta Quintero</small></p></div>`,
      [["ok", "¡Gracias, Marta!"]], onClose);
  }

  window.ART = { portrait, face, map, flyTo, confetti, stamp, ceremony, stampCeremony, promoCeremony, reduced };
})();
