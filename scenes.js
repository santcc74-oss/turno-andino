/* Turno Andino — escenas de cada ciudad (SVG hecho con formas simples, sin imágenes externas).
   El cielo cambia según la hora del teléfono: día, atardecer o noche. */
(function () {
  const W = 360, H = 130, GROUND = 112;
  let uid = 0;

  /* Números pseudoaleatorios fijos por ciudad: la escena siempre se ve igual. */
  function rng(seed) {
    let h = 2166136261;
    for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
  }
  function phase(d) {
    const h = (d || new Date()).getHours();
    return h >= 7 && h < 17 ? "day" : (h >= 17 && h < 19) || (h >= 5 && h < 7) ? "dusk" : "night";
  }
  const SKY = { day: ["#8EC5E8", "#E4F1F8"], dusk: ["#5B4A86", "#F1A661"], night: ["#0A1730", "#23395F"] };
  const TONE = {
    day: { far: "#9DB5C9", near: "#6E8BA3", bld: "#4E6A84", win: "#C9DCEB", sea: "#3E86B5", snow: "#FFFFFF" },
    dusk: { far: "#7A6A93", near: "#574B72", bld: "#3B3456", win: "#F6C27A", sea: "#4A4F85", snow: "#F4E3EE" },
    night: { far: "#243553", near: "#182640", bld: "#101B2F", win: "#F4C95D", sea: "#132646", snow: "#C9D6EA" },
  };

  /* Silueta de montañas: lista de alturas (0 a 1) repartidas a lo ancho. */
  function ridge(heights, base, amp, fill, extra) {
    const step = W / (heights.length - 1);
    const pts = heights.map((h, i) => `${(i * step).toFixed(1)},${(base - h * amp).toFixed(1)}`).join(" ");
    return `<polygon points="0,${H} ${pts} ${W},${H}" fill="${fill}" ${extra || ""}/>`;
  }
  function snowCaps(heights, base, amp, fill, min) {
    const step = W / (heights.length - 1);
    let s = "";
    heights.forEach((h, i) => {
      if (h < min || i === 0 || i === heights.length - 1) return;
      const x = i * step, y = base - h * amp;
      s += `<polygon points="${(x - 9).toFixed(1)},${(y + 7).toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)} ${(x + 9).toFixed(1)},${(y + 7).toFixed(1)}" fill="${fill}"/>`;
    });
    return s;
  }
  function buildings(r, t, ph, x0, x1, hMin, hMax) {
    let s = "", x = x0;
    while (x < x1) {
      const w = 12 + r() * 16, h = hMin + r() * (hMax - hMin), y = GROUND - h;
      s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${t.bld}"/>`;
      if (ph !== "day") for (let wy = y + 5; wy < GROUND - 4; wy += 7) for (let wx = x + 3; wx < x + w - 3; wx += 5) if (r() < 0.35) s += `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="2" height="3" fill="${t.win}"/>`;
      x += w + 1 + r() * 3;
    }
    return s;
  }
  const sea = (t, y) => `<rect x="0" y="${y}" width="${W}" height="${H - y}" fill="${t.sea}"/>${[0, 1, 2].map((i) => `<path d="M${20 + i * 110} ${y + 8 + i * 3}q10 -3 20 0t20 0" stroke="#FFFFFF" stroke-opacity=".35" fill="none" stroke-width="1.2"/>`).join("")}`;

  /* Monumento de cada ciudad, dibujado con formas simples. */
  const LANDMARK = {
    BOG: (t) => `<rect x="258" y="36" width="10" height="76" fill="${t.bld}"/><rect x="256" y="32" width="14" height="5" fill="${t.bld}"/>
      <g fill="${t.snow}"><rect x="44" y="26" width="8" height="6"/><polygon points="43,26 48,20 53,26"/></g>`,
    MDE: (t) => `<path d="M0 60 L360 34" stroke="${t.win}" stroke-width="1"/>${[70, 170, 270].map((x) => { const y = 60 - (x / 360) * 26; return `<rect x="${x - 5}" y="${(y + 2).toFixed(1)}" width="10" height="8" rx="2" fill="#E0AC52"/>`; }).join("")}`,
    UIO: (t) => `<g fill="${t.snow}"><circle cx="40" cy="51" r="3"/><polygon points="34,67 40,55 46,67"/><polygon points="30,58 40,57 40,61"/><polygon points="50,58 40,57 40,61"/></g>`,
    LIM: (t) => `<polygon points="0,112 0,70 30,74 60,90 90,112" fill="${t.near}"/><rect x="300" y="58" width="4" height="30" fill="${t.snow}"/><polygon points="296,58 302,50 308,58" fill="#B83A26"/>`,
    SCL: (t) => `<rect x="236" y="22" width="12" height="90" fill="${t.bld}"/><polygon points="236,22 242,12 248,22" fill="${t.bld}"/>`,
    MEX: (t) => `<rect x="178" y="44" width="4" height="68" fill="${t.snow}"/><rect x="174" y="102" width="12" height="10" fill="${t.snow}"/><circle cx="180" cy="40" r="4" fill="#E0AC52"/><polygon points="174,40 180,33 186,40" fill="#E0AC52"/>`,
    GRU: (t) => `<path d="M150 112 V60 C 170 52, 180 70, 200 60 V112 Z" fill="${t.near}"/>`,
    PTY: (t) => `<g fill="${t.bld}">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${226 + (i % 2) * 3}" y="${40 + i * 10}" width="14" height="10"/>`).join("")}</g>
      <path d="M40 96 Q 100 52 160 96" stroke="${t.near}" stroke-width="3" fill="none"/><path d="M36 96 H164" stroke="${t.near}" stroke-width="2"/>`,
    MAD: (t) => `<g fill="${t.snow}" opacity=".95"><rect x="140" y="66" width="80" height="46"/><rect x="136" y="60" width="88" height="7"/>
      ${[150, 172, 194].map((x) => `<path d="M${x} 112 V90 a8 8 0 0 1 16 0 V112 Z" fill="${t.bld}"/>`).join("")}<polygon points="164,60 180,50 196,60"/></g>`,
  };

  const PROFILE = {
    BOG: { far: [0.5, 0.8, 0.95, 0.7, 0.4, 0.3, 0.35, 0.3, 0.4, 0.3], near: [0.9, 1, 0.8, 0.5, 0.2, 0.1, 0.1, 0.15, 0.1, 0.1], amp: 90, bld: [90, 360, 12, 38] },
    MDE: { far: [0.6, 0.7, 0.5, 0.4, 0.3, 0.3, 0.4, 0.5, 0.7, 0.8], near: [0.5, 0.4, 0.2, 0.1, 0.05, 0.05, 0.1, 0.2, 0.4, 0.55], amp: 80, bld: [60, 320, 14, 44] },
    UIO: { far: [0.2, 0.3, 0.4, 0.5, 0.7, 1, 0.7, 0.45, 0.3, 0.25], near: [0.7, 0.75, 0.6, 0.3, 0.15, 0.1, 0.1, 0.15, 0.2, 0.2], amp: 85, snow: 0.95, bld: [110, 360, 10, 30] },
    LIM: { far: [0.2, 0.25, 0.3, 0.3, 0.25, 0.3, 0.35, 0.3, 0.25, 0.2], near: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], amp: 60, sea: 98, bld: [100, 290, 10, 28] },
    SCL: { far: [0.7, 0.9, 1, 0.85, 0.95, 1, 0.8, 0.9, 0.75, 0.7], near: [0.3, 0.2, 0.1, 0.1, 0.1, 0.1, 0.1, 0.15, 0.2, 0.25], amp: 95, snow: 0.8, bld: [20, 350, 10, 34] },
    MEX: { far: [0.2, 0.35, 0.8, 0.6, 0.3, 0.3, 0.55, 0.75, 0.5, 0.3], near: [0.1, 0.1, 0.1, 0.1, 0.05, 0.05, 0.1, 0.1, 0.1, 0.1], amp: 85, snow: 0.7, bld: [10, 360, 12, 34] },
    GRU: { far: [0.1, 0.15, 0.1, 0.12, 0.1, 0.1, 0.12, 0.1, 0.1, 0.1], near: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], amp: 40, bld: [0, 360, 30, 80] },
    PTY: { far: [0.2, 0.25, 0.2, 0.15, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1], near: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], amp: 50, sea: 100, bld: [180, 360, 20, 70] },
    MAD: { far: [0.1, 0.12, 0.1, 0.1, 0.08, 0.1, 0.1, 0.12, 0.1, 0.1], near: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], amp: 40, bld: [0, 130, 14, 36], bld2: [230, 360, 14, 36] },
  };

  function scene(code, opts) {
    opts = opts || {};
    const ph = opts.phase || phase(), t = TONE[ph], p = PROFILE[code] || PROFILE.BOG, r = rng(code);
    const id = "sky" + (++uid);
    let s = `<svg class="scene ${opts.cls || ""}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${opts.label || "Paisaje de la ciudad"}">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SKY[ph][0]}"/><stop offset="1" stop-color="${SKY[ph][1]}"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#${id})"/>`;
    if (ph === "night") {
      for (let i = 0; i < 26; i++) s += `<circle cx="${(r() * W).toFixed(1)}" cy="${(r() * 60).toFixed(1)}" r="${(0.5 + r() * 0.9).toFixed(1)}" fill="#FFFFFF" opacity="${(0.4 + r() * 0.5).toFixed(2)}"/>`;
      s += `<circle cx="300" cy="24" r="10" fill="#F4F1E1"/><circle cx="305" cy="21" r="9" fill="url(#${id})"/>`;
    } else {
      s += `<circle cx="${ph === "day" ? 300 : 60}" cy="${ph === "day" ? 26 : 70}" r="${ph === "day" ? 12 : 16}" fill="${ph === "day" ? "#FBE08A" : "#F7B267"}" opacity=".95"/>`;
    }
    s += ridge(p.far, 100, p.amp, t.far, 'opacity=".9"');
    if (p.snow) s += snowCaps(p.far, 100, p.amp, t.snow, p.snow);
    if (p.near.some((v) => v > 0)) s += ridge(p.near, GROUND, p.amp * 0.7, t.near);
    if (p.sea) s += sea(t, p.sea);
    s += buildings(r, t, ph, p.bld[0], p.bld[1], p.bld[2], p.bld[3]);
    if (p.bld2) s += buildings(r, t, ph, p.bld2[0], p.bld2[1], p.bld2[2], p.bld2[3]);
    s += (LANDMARK[code] || (() => ""))(t);
    s += `<rect y="${GROUND}" width="${W}" height="${H - GROUND}" fill="${p.sea ? t.sea : t.near}"/>`;
    if (p.sea) s += sea(t, GROUND);
    return s + `</svg>`;
  }

  window.SCENE = { scene, phase };
})();
