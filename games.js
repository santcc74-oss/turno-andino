/* Turno Andino — juegos interactivos (se juegan, no se responden) y la Sala de juegos.
   Cada juego: make() arma una partida, render(root, t, done) la dibuja y llama done(acierto, explicaciónHtml). */
(function () {
  const { esc, pick, shuffle, rand } = TA;
  const reduced = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const list = (items) => `<span class="gm-list">${items.map((x) => `<span>${x}</span>`).join("")}</span>`;

  const GAMES = {
    /* ——— Caza de señales ——— */
    spot: {
      name: "Caza de señales", blurb: "Toca en el mensaje todo lo que delata el engaño.",
      label: (t) => "Caza de señales · " + t.ch,
      make(city, used) {
        const id = TA.pickFresh(SPOTS.map((_, i) => "sp" + i), used || new Set());
        return Object.assign({ type: "spot", id }, SPOTS[+id.slice(2)]);
      },
      render(root, t, done) {
        const segs = [];
        const line = (arr, cls) => (arr || []).map(([txt, bad, why]) => { segs.push({ txt, bad, why }); return `<span role="button" tabindex="0" class="sg ${cls || ""}" data-s="${segs.length - 1}">${esc(txt)}</span>`; }).join("");
        const from = line(t.from), subj = line(t.subj), body = line(t.body);
        const total = segs.filter((s) => s.bad).length;
        root.innerHTML = `<article class="ticket"><p class="t-label">Caza de señales · ${esc(t.ch)}</p>
          <h3 class="t-q">Toca todas las partes sospechosas</h3><p class="small">Hay ${total}. Cada toque en algo normal cuenta como error.</p></article>
          <div class="spot-msg"><p class="sp-from"><small>De:</small> ${from}</p>${subj ? `<p class="sp-subj">${subj}</p>` : ""}<p class="sp-body">${body}</p></div>
          <p class="small center" id="sp-count">Encontradas 0 de ${total} · errores 0</p>
          <button class="btn primary wide" id="sp-done">Terminé de revisar</button>`;
        let found = 0, miss = 0, over = false;
        const finish = () => {
          if (over) return; over = true;
          root.querySelectorAll(".sg").forEach((b) => { b.classList.add("off"); b.removeAttribute("tabindex"); if (segs[+b.dataset.s].bad && !b.classList.contains("hit")) b.classList.add("missed"); });
          root.querySelector("#sp-done").disabled = true;
          const ok = found >= total - 1 && miss <= 1;
          done(ok, `Encontraste ${found} de ${total} con ${miss} ${miss === 1 ? "error" : "errores"}. Las señales eran:` + list(segs.filter((s) => s.bad).map((s) => `<b>«${esc(s.txt.trim())}»</b>. ${esc(s.why)}`)));
        };
        root.querySelectorAll(".sg").forEach((b) => b.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); b.click(); } });
        root.querySelectorAll(".sg").forEach((b) => b.onclick = () => {
          if (over || b.classList.contains("hit") || b.classList.contains("miss")) return;
          if (segs[+b.dataset.s].bad) { b.classList.add("hit"); found += 1; } else { b.classList.add("miss"); miss += 1; }
          root.querySelector("#sp-count").textContent = `Encontradas ${found} de ${total} · errores ${miss}`;
          if (found === total) finish();
        });
        root.querySelector("#sp-done").onclick = finish;
      },
    },

    /* ——— Firewall en vivo ——— */
    firewall: {
      name: "Firewall en vivo", blurb: "Bloquea los paquetes que no cumplen la política antes de que lleguen.",
      label: () => "Firewall en vivo",
      make() {
        const good = shuffle(FW_PACKETS.filter((p) => p.ok)).slice(0, 4), bad = shuffle(FW_PACKETS.filter((p) => !p.ok)).slice(0, 5);
        const extra = pick(FW_PACKETS.filter((p) => p.ok));
        return { type: "firewall", packets: shuffle(good.concat(bad, [extra])) };
      },
      render(root, t, done) {
        root.innerHTML = `<article class="ticket"><p class="t-label">Firewall en vivo</p><h3 class="t-q">Toca los paquetes que la política no permite</h3>
          <ul class="fw-rules">${FW_RULES.map((r) => `<li>${GLOSS.link(esc(r), 2)}</li>`).join("")}</ul></article>
          <div class="fw-lane" id="fw-lane"><div class="fw-server" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="7" rx="1.5"/><rect x="4" y="13" width="16" height="7" rx="1.5"/><path d="M8 6.5h.01M8 16.5h.01"/></svg><span>Servidor</span></div></div>
          <p class="small center" id="fw-score">Decisiones correctas 0 · errores 0</p>`;
        const lane = root.querySelector("#fw-lane");
        let right = 0, wrong = 0, doneN = 0, i = 0, timer = null, paused = false;
        const mistakes = [];
        const score = () => { root.querySelector("#fw-score").textContent = `Decisiones correctas ${right} · errores ${wrong}`; };
        const settle = (p, blocked) => {
          const good = blocked ? !p.ok : p.ok;
          if (good) right += 1; else { wrong += 1; mistakes.push(`<b>${p.port} ${esc(p.svc)} desde ${esc(p.src)}</b>: ${blocked ? "lo bloqueaste, pero estaba permitido" : "pasó y no debía"}. ${esc(p.why)}`); }
          doneN += 1; score();
          if (doneN === t.packets.length) end();
        };
        const end = () => {
          clearInterval(timer);
          const ok = right >= t.packets.length - 2;
          done(ok, `${right} de ${t.packets.length} decisiones correctas.` + (mistakes.length ? list(mistakes) : " ¡Sin errores!"));
        };
        /* Sin animaciones: un paquete a la vez con botones. */
        if (reduced()) {
          const step = () => {
            if (i >= t.packets.length) return;
            const p = t.packets[i];
            lane.innerHTML = `<div class="fw-card"><b class="mono">${p.port} ${esc(p.svc)}</b><small class="mono">desde ${esc(p.src)}</small>
              <div class="duo"><button class="btn" data-a="allow">Permitir</button><button class="btn danger" data-a="block">Bloquear</button></div></div>`;
            lane.querySelectorAll("[data-a]").forEach((b) => b.onclick = () => { i += 1; settle(p, b.dataset.a === "block"); step(); });
          };
          return step();
        }
        /* El movimiento lo lleva un reloj propio (no una animación CSS): se detiene si sales de la app y no depende de que la pantalla se redibuje. */
        const TRAVEL = 6200, GAP = 1400, live = [];
        let since = GAP, last = Date.now();
        const W = Math.max(220, lane.clientWidth - 150);
        const spawn = () => {
          const p = t.packets[i++];
          const el = document.createElement("button");
          el.className = "pkt row-" + (i % 3);
          el.innerHTML = `<b class="mono">${p.port} <small>${esc(p.svc)}</small></b><small class="mono">${esc(p.src)}</small>`;
          el.setAttribute("aria-label", `Paquete ${p.port} ${p.svc} desde ${p.src}. Toca para bloquear`);
          const k = { el, p, t: 0, settled: false };
          el.onclick = () => { if (k.settled) return; k.settled = true; el.classList.add("blocked"); el.disabled = true; setTimeout(() => el.remove(), 600); settle(p, true); };
          el.style.transform = "translateX(-60px)";
          lane.appendChild(el); live.push(k);
        };
        const tick = () => {
          if (!root.isConnected) { clearInterval(timer); return; }
          const now = Date.now(), dt = Math.min(now - last, 1000); last = now;
          if (document.hidden) return;
          since += dt;
          if (since >= GAP && i < t.packets.length) { since = 0; spawn(); }
          live.forEach((k) => {
            if (k.settled) return;
            k.t += dt;
            k.el.style.transform = `translateX(${-60 + (W + 60) * Math.min(1, k.t / TRAVEL)}px)`;
            if (k.t >= TRAVEL) { k.settled = true; k.el.classList.add(k.p.ok ? "arrived" : "breach"); setTimeout(() => k.el.remove(), 450); settle(k.p, false); }
          });
        };
        timer = setInterval(tick, 40);
        tick();
      },
    },

    /* ——— Rueda del César ——— */
    caesar: {
      name: "Rueda del César", blurb: "Gira la rueda hasta que el mensaje cifrado se lea.",
      label: () => "Rueda del César",
      make() { return { type: "caesar", msg: pick(CAESAR_MSGS), key: 3 + rand(21) }; },
      render(root, t, done) {
        const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const shift = (s, k) => s.replace(/[A-Z]/g, (c) => A[(A.indexOf(c) + k + 26) % 26]);
        const enc = shift(t.msg, t.key);
        let g = 0;
        root.innerHTML = `<article class="ticket"><p class="t-label">Rueda del César</p><h3 class="t-q">Interceptamos este mensaje del Camaleón. Gira la rueda hasta que se lea.</h3>
          <code class="code-val small-code">${esc(enc)}</code></article>
          <div class="cz-wheel"><p class="small">Cifrado → normal (desplazamiento <b id="cz-k">0</b>)</p><div class="cz-strip mono" id="cz-strip"></div></div>
          <code class="code-val" id="cz-out"></code>
          <div class="cz-ctrl"><button class="btn big" id="cz-m" aria-label="Girar a la izquierda">◀</button><input type="range" id="cz-r" min="0" max="25" value="0" aria-label="Desplazamiento"><button class="btn big" id="cz-p" aria-label="Girar a la derecha">▶</button></div>
          <button class="btn primary wide big" id="cz-ok">Ya se lee: enviar a Marta</button>`;
        const draw = () => {
          root.querySelector("#cz-k").textContent = g;
          root.querySelector("#cz-out").textContent = shift(enc, -g);
          root.querySelector("#cz-strip").innerHTML = A.split("").slice(0, 10).map((c) => `<span><b>${c}</b>${A[(A.indexOf(c) - g + 26) % 26]}</span>`).join("") + "<span>…</span>";
          root.querySelector("#cz-r").value = g;
        };
        root.querySelector("#cz-m").onclick = () => { g = (g + 25) % 26; draw(); };
        root.querySelector("#cz-p").onclick = () => { g = (g + 1) % 26; draw(); };
        root.querySelector("#cz-r").oninput = (e) => { g = +e.target.value; draw(); };
        root.querySelector("#cz-ok").onclick = () => {
          root.querySelectorAll("button, input").forEach((x) => { x.disabled = true; });
          done(g === t.key, `El mensaje decía <b>${esc(t.msg)}</b> con un desplazamiento de ${t.key}. César se rompe probando las 26 posiciones: por eso hoy se usa cifrado moderno como AES.`);
        };
        draw();
      },
    },

    /* ——— Clave fuerte ——— */
    password: {
      name: "Clave fuerte", blurb: "Arma una contraseña que tarde siglos en descifrarse.",
      label: () => "Clave fuerte",
      make() { return { type: "password" }; },
      render(root, t, done) {
        root.innerHTML = `<article class="ticket"><p class="t-label">Clave fuerte</p><h3 class="t-q">Crea una contraseña que un atacante tarde siglos en descifrar</h3>
          <p class="small">Es un juego: <b>no escribas una clave que uses de verdad</b>. Nada de lo que escribas se guarda.</p></article>
          <input id="pw-in" class="pw-in mono" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Escribe aquí" aria-label="Contraseña de práctica">
          <div class="pw-meter" aria-hidden="true"><i id="pw-bar"></i></div>
          <p class="pw-time">Tiempo para descifrarla: <b id="pw-time">—</b></p>
          <ul class="pw-checks" id="pw-checks"></ul>
          <p class="small">Truco de los expertos: una frase larga de 4 o 5 palabras al azar («gato lámpara ruta marzo») es fácil de recordar y muy difícil de adivinar.</p>
          <div class="duo"><button class="btn" id="pw-give">Me rindo</button><button class="btn primary" id="pw-ok" disabled>Listo</button></div>`;
        const inp = root.querySelector("#pw-in");
        const evalPw = (s) => {
          const low = s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
          let pool = 0;
          if (/[a-zñ]/.test(s)) pool += 27; if (/[A-ZÑ]/.test(s)) pool += 27; if (/\d/.test(s)) pool += 10; if (/[^a-zA-ZñÑ\d\s]/.test(s)) pool += 32; if (/\s/.test(s)) pool += 1;
          let bits = s.length * Math.log2(Math.max(pool, 1));
          const common = PW_COMMON.filter((w) => low.includes(w));
          common.forEach((w) => { bits -= Math.max(0, w.length * Math.log2(Math.max(pool, 1)) - 11); });
          if (/(.)\1\1/.test(s)) bits -= 10;
          if (/(0123|1234|2345|3456|4567|5678|6789|abcd|qwer)/i.test(s)) bits -= 14;
          bits = Math.max(0, bits);
          return { bits, common, len: s.length, onlyDigits: /^\d+$/.test(s) };
        };
        const human = (bits) => {
          const sec = Math.pow(2, bits) / 1e10 / 2;
          const units = [[31536e11, "más que la edad del universo"], [31536e8, "millones de años"], [31536e5, "miles de años"], [31536e4, "siglos"], [31536e3, "décadas"], [31536e2, "años"], [86400, "días"], [3600, "horas"], [60, "minutos"], [1, "segundos"]];
          if (sec < 1) return "al instante";
          const u = units.find(([s]) => sec >= s);
          return u[1] === "más que la edad del universo" ? u[1] : "unos " + u[1];
        };
        const update = () => {
          const r = evalPw(inp.value);
          const checks = [
            [r.len >= 14, "14 caracteres o más"], [r.common.length === 0 && r.len > 0, r.common.length ? "Sin palabras obvias (quita «" + r.common[0] + "»)" : "Sin palabras obvias ni nombres del banco"],
            [!r.onlyDigits && r.len > 0, "No solo números"], [r.bits >= 72, "Tarda siglos o más en descifrarse"],
          ];
          root.querySelector("#pw-checks").innerHTML = checks.map(([ok, txt]) => `<li class="${ok ? "ok" : ""}">${ok ? "✓" : "·"} ${esc(txt)}</li>`).join("");
          root.querySelector("#pw-time").textContent = inp.value ? human(r.bits) : "—";
          const pct = Math.min(100, (r.bits / 90) * 100);
          const bar = root.querySelector("#pw-bar"); bar.style.width = pct + "%"; bar.className = r.bits >= 72 ? "ok" : r.bits >= 45 ? "warn" : "bad";
          root.querySelector("#pw-ok").disabled = !checks.every(([ok]) => ok);
        };
        inp.addEventListener("input", update);
        const lock = () => { inp.disabled = true; root.querySelectorAll("button").forEach((b) => { b.disabled = true; }); inp.value = ""; };
        root.querySelector("#pw-ok").onclick = () => { lock(); done(true, "Una clave larga, sin palabras obvias, que un atacante no puede adivinar. Guárdala en un gestor de contraseñas y activa MFA."); };
        root.querySelector("#pw-give").onclick = () => { lock(); done(false, "La longitud es lo que más pesa: una frase de 4 o 5 palabras al azar supera fácil los 14 caracteres. Evita el nombre del banco, tu equipo de fútbol o el año."); };
        update();
        setTimeout(() => inp.focus({ preventScroll: true }), 50);
      },
    },

    /* ——— Triaje contra reloj ——— */
    triage: {
      name: "Triaje contra reloj", blurb: "Clasifica las alertas de P1 a P4 antes de que se acabe el tiempo.",
      label: () => "Triaje contra reloj",
      make() {
        const by = [1, 2, 3, 4].map((p) => shuffle(TRIAGE.filter((a) => a.p === p)));
        const set = by.map((l) => l[0]).concat(shuffle(by.flatMap((l) => l.slice(1))).slice(0, 2));
        return { type: "triage", alerts: shuffle(set) };
      },
      render(root, t, done) {
        const SECS = reduced() ? 20 : 8;
        let k = 0, score = 0, timer = null, left = 0;
        const res = [];
        const PN = { 1: "P1 · Crítica", 2: "P2 · Alta", 3: "P3 · Media", 4: "P4 · Baja" };
        const next = () => {
          if (k >= t.alerts.length) return end();
          const a = t.alerts[k];
          root.innerHTML = `<article class="ticket"><p class="t-label">Triaje contra reloj · alerta ${k + 1} de ${t.alerts.length}</p>
            <h3 class="t-q">${GLOSS.link(esc(a.t), 2)}</h3><div class="tr-timer"><i id="tr-bar" style="animation-duration:${SECS}s"></i></div></article>
            <div class="tr-btns">${[1, 2, 3, 4].map((p) => `<button class="btn tr-p p${p}" data-p="${p}">${PN[p]}</button>`).join("")}</div>
            <p class="small center">P1: daño activo en algo crítico · P4: informativo</p>`;
          left = SECS * 1000;
          let last = Date.now();
          const tick = () => {
            if (!root.isConnected) { clearInterval(timer); return; }
            const now = Date.now(), bar = root.querySelector("#tr-bar");
            if (document.hidden) { last = now; if (bar) bar.style.animationPlayState = "paused"; return; }
            if (bar) bar.style.animationPlayState = "running";
            left -= now - last; last = now;
            if (left <= 0) answer(0);
          };
          timer = setInterval(tick, 200);
          root.querySelectorAll("[data-p]").forEach((b) => b.onclick = () => answer(+b.dataset.p));
        };
        const answer = (p) => {
          clearInterval(timer);
          const a = t.alerts[k], d = p ? Math.abs(p - a.p) : 9;
          score += d === 0 ? 1 : d === 1 ? 0.5 : 0;
          if (d) res.push(`<b>${esc(a.t)}</b>: era ${PN[a.p]}${p ? ", marcaste " + PN[p] : " y se te acabó el tiempo"}. ${esc(a.why)}`);
          k += 1; next();
        };
        const end = () => {
          root.innerHTML = `<article class="ticket"><p class="t-label">Triaje contra reloj</p><h3 class="t-q">Cola de alertas despachada</h3><p>${score} de ${t.alerts.length} puntos.</p></article>`;
          done(score >= t.alerts.length - 1.5, `Puntaje ${score} de ${t.alerts.length} (exacta = 1, una prioridad de diferencia = 0,5).` + (res.length ? list(res) : " ¡Todas exactas!"));
        };
        next();
      },
    },

    /* ——— Segmenta la red ——— */
    zones: {
      name: "Segmenta la red", blurb: "Ubica cada sistema del banco en la zona de red que le corresponde.",
      label: () => "Segmenta la red",
      make() {
        const pickZ = shuffle(ZONES.map((z) => z.id)).slice(0, 3);
        let items = pickZ.map((z) => pick(ZONE_ITEMS.filter((x) => x.z === z)));
        items = items.concat(shuffle(ZONE_ITEMS.filter((x) => !items.includes(x))).slice(0, 2));
        return { type: "zones", items: shuffle(items) };
      },
      render(root, t, done) {
        let sel = null;
        const place = {};
        root.innerHTML = `<article class="ticket"><p class="t-label">Segmenta la red</p><h3 class="t-q">Toca un sistema y luego la zona donde debe vivir</h3></article>
          <div class="zn-items" id="zn-items">${t.items.map((x, i) => `<button class="zn-it" data-i="${i}">${esc(x.t)}</button>`).join("")}</div>
          <div class="zn-grid">${ZONES.map((z) => `<button class="zn-z" data-z="${z.id}"><b>${esc(z.name)}</b><small>${esc(z.desc)}</small><span class="zn-in" id="zn-${z.id}"></span></button>`).join("")}</div>`;
        root.querySelectorAll(".zn-it").forEach((b) => b.onclick = () => {
          if (b.disabled) return;
          root.querySelectorAll(".zn-it").forEach((x) => x.classList.remove("sel"));
          sel = +b.dataset.i; b.classList.add("sel");
        });
        root.querySelectorAll(".zn-z").forEach((z) => z.onclick = () => {
          if (sel == null) return;
          place[sel] = z.dataset.z;
          const b = root.querySelector(`.zn-it[data-i="${sel}"]`);
          b.disabled = true; b.classList.remove("sel"); b.classList.add("placed");
          root.querySelector("#zn-" + z.dataset.z).insertAdjacentHTML("beforeend", `<i data-i="${sel}">${esc(t.items[sel].t)}</i>`);
          sel = null;
          if (Object.keys(place).length === t.items.length) {
            let right = 0; const res = [];
            t.items.forEach((x, i) => {
              const ok = place[i] === x.z, chip = root.querySelector(`.zn-in i[data-i="${i}"]`);
              chip.classList.add(ok ? "ok" : "bad");
              if (ok) right += 1; else res.push(`<b>${esc(x.t)}</b> va en ${esc(ZONES.find((z) => z.id === x.z).name)}. ${esc(x.why)}`);
            });
            root.querySelectorAll(".zn-z").forEach((x) => { x.disabled = true; });
            done(right >= t.items.length - 1, `${right} de ${t.items.length} bien ubicados.` + (res.length ? list(res) : " ¡Red perfectamente segmentada!"));
          }
        });
      },
    },
  };

  /* ——— Sala de juegos: jugar cuando quieras, fuera de los turnos ——— */
  const CLASSIC = [["mail", "Phishing o legítimo", "Desliza cada mensaje: engaño o real."], ["log", "Cazar en los logs", "Encuentra la línea sospechosa."],
    ["ports", "Puertos y servicios", "Empareja cada puerto con su servicio."], ["decode", "Descifrar evidencias", "Binario, hexadecimal y hashes."],
    ["cmd", "Terminal", "Elige el comando y mira su salida."], ["code", "Revisión de código", "Encuentra la línea vulnerable."]];
  const needsLabel = (type) => {
    const n = TYPE_NEEDS[type];
    const ids = Array.isArray(n) ? n : (n && n.any) || [];
    const m = MODULES.find((x) => x.id === ids.find((i) => !LEARN.learned(i)) || ids[0]);
    return m ? m.title : "";
  };
  function arcade(onClose) {
    const S = TA.S; if (!S.arcade) S.arcade = {};
    const el = document.createElement("div");
    el.className = "picker arcade";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Sala de juegos");
    document.body.appendChild(el);
    document.body.classList.add("playing");
    const close = () => { el.remove(); if (document.getElementById("play").hidden) document.body.classList.remove("playing"); if (onClose) onClose(); };
    const games = Object.entries(GAMES).map(([k, g]) => [k, g.name, g.blurb]).concat(CLASSIC);
    const menu = () => {
      el.innerHTML = `<div class="picker-in">
        <header class="ls-head"><button class="icon-btn" data-x aria-label="Cerrar la sala de juegos"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
          <div><p class="eyebrow">Sala de juegos</p><h2>Juega cuando quieras</h2></div></header>
        <p class="small">Partidas de uno o dos minutos, fuera de los turnos. Cada victoria da 5 de reputación. Los juegos se abren al estudiar su tema.</p>
        <ul class="ar-grid">${games.map(([k, name, blurb]) => { const open = LEARN.typeAllowed(k), st = S.arcade[k] || { w: 0, n: 0 };
          return `<li><button class="ar-card ${open ? "" : "locked"}" data-g="${k}" ${open ? "" : "disabled"}><b>${esc(name)}</b><small>${esc(blurb)}</small>
            <span class="mono small">${open ? (st.n ? `${st.w} de ${st.n} ganadas` : "Nuevo") : "Estudia: " + esc(needsLabel(k))}</span></button></li>`; }).join("")}</ul></div>`;
      el.querySelector("[data-x]").onclick = close;
      el.querySelectorAll("[data-g]").forEach((b) => b.onclick = () => play(b.dataset.g));
    };
    const play = (k) => {
      const t = GAMES[k] ? GAMES[k].make(TA.cityByCode(S.city), new Set()) : PLAY.makeGame(k);
      if (!t) return menu();
      el.innerHTML = `<div class="picker-in"><header class="ls-head"><button class="icon-btn" data-back aria-label="Volver a la sala"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button>
        <div><p class="eyebrow">Sala de juegos</p><h2>${esc((games.find((g) => g[0] === k) || [])[1] || "")}</h2></div></header><div class="p-body" id="ar-body"></div><div id="ar-res"></div></div>`;
      el.querySelector("[data-back]").onclick = menu;
      const body = el.querySelector("#ar-body");
      const start = () => PLAY.renderGame(body, t, (ok, extra) => {
        const st = S.arcade[k] || { w: 0, n: 0 };
        st.n += 1; if (ok) { st.w += 1; S.xp += 5; }
        S.arcade[k] = st; TA.save();
        if (t.id) { TA.markSeen(t.id); }
        PROG.ticket(t, ok, false, null);
        const why = t.why || t.w || "";
        el.querySelector("#ar-res").innerHTML = `<div class="ex-why ${ok ? "is-ok" : "is-bad"}"><p class="sheet-k">${ok ? "¡Ganaste! +5 de reputación" : "Casi"}</p>
          ${extra ? `<p>${extra}</p>` : ""}${why ? `<p>${GLOSS.link(esc(why), 3)}</p>` : ""}
          <div class="duo"><button class="btn" data-menu>Otro juego</button><button class="btn primary" data-again>Otra vez</button></div></div>`;
        el.querySelector("[data-menu]").onclick = menu;
        el.querySelector("[data-again]").onclick = () => play(k);
        el.querySelector("#ar-res").scrollIntoView({ block: "nearest" });
      });
      if (LEARN.needsPrimer(t)) LEARN.primer(body, t, start); else start();
    };
    menu();
  }

  window.GAMES = GAMES;
  window.ARCADE = { open: arcade };
})();
