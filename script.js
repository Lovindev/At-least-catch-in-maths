(() => {
  const canvas = document.getElementById('graph'), ctx = canvas.getContext('2d');
  const $ = id => document.getElementById(id);
  const slope = $('slope'), intercept =$('intercept');
  const levelTitle = $('levelTitle'), levelDesc =$('levelDesc');
  const equation = $('equation'), distanceEl = $('distance'), hitsEl =$('hits');
  const message = $('message'), overlay =$('overlay');
  const modalTitle = $('modalTitle'), modalText =$('modalText'), modalEquation = $('modalEquation'), modalEyebrow =$('modalEyebrow');
  const level5Overlay = $('level5Overlay'), level5Message =$('level5Message'), level5Equation = $('level5Equation'), level5Next =$('level5Next');
  const specialPasswordOverlay = $('specialPasswordOverlay'), specialPasswordInput =$('specialPasswordInput'), specialPasswordError = $('specialPasswordError'), specialPasswordBtn =$('specialPasswordBtn');

  const levels = [
    { title: "First Notice", desc: "She moves in a simple line. Learn how changing your path changes where you can meet.", kind: "line", speed: .72, text: "You noticed her.", eq: "y = 0.58x + 2.10", initialHer: [-5.50, -1.09], yRange: "−1.09 to 5.29" },
    { title: "First Conversation", desc: "Her path bends now. You need to think about where she will be, not where she is.", kind: "parabola", speed: .56, text: "You found a way to talk.", eq: "y = 0.18x² − 3.30", initialHer: [0, -3.30], yRange: "−3.30 to 0.85" },
    { title: "Almost", desc: "She keeps moving around you. A good path is about timing.", kind: "circle", speed: .68, text: "So close.", eq: "x = 3.25 cos(t),  y = 2.15 sin(t)", initialHer: [3.25, 0], yRange: "−2.15 to 2.15" },
    { title: "Different Paths", desc: "Your paths can cross without meeting at the same time. This time, timing matters.", kind: "wave", speed: .82, text: "Same path. Wrong moment.", eq: "y = 2.10 sin(0.95x + 0.20t)", initialHer: [-5.50, 1.83], yRange: "−2.10 to 2.10" },
    { title: "The Right Point", desc: "Predict the future point and send your path there.", kind: "figure8", speed: .74, text: "You found the right point.", eq: "x = 4.40 sin(0.62t),  y = 2.55 sin(1.24t)", initialHer: [0, 0], yRange: "−2.55 to 2.55" },
    { title: "The Intersection", desc: "One last time. Everything you learned comes together here.", kind: "final", speed: .62, text: "Two paths. One point.", eq: "x = 4.70 sin(0.52t),  y = 3.10 sin(1.04t) cos(0.18t)", initialHer: [0, 0], yRange: "approximately −3.10 to 3.10" }
  ];

  let level = 0, running = false, completed = false, timedOut = false, time = 0, hits = 0, last = performance.now();
  let player = { x: -5, y: 0 }, her = { x: 3, y: 2 };
  let movementDirection = 1;
  let lockedDirection = 1;
  let W = 0, H = 0, scale = 55, origin = { x: 0, y: 0 };
  let userName = "", userSurname = "", userGender = "", crushName = "", hasCrush = true;

  const ASSUMED_CRUSHES = {
    "krushna": "S",
    "aryan": "S",
    "aryan suryawanshi": "V",
    "prajwal": "S",
    "manish": "S",
    "raj": "N",
    "atharv": "S",
    "harshwardhan": "G",
    "sujay": "Biology",
    "apeksha": "Still confused?"
  };

  function getPersonalMessage() {
    const n = userName.trim().toLowerCase();
    const s = userSurname.trim().toLowerCase();

    if (n === "krushna") return "Sorry, It was our fault... we should have brought you a ladder to climb😁.";
    if (n === "apeksha") return "Still confused?";
    return levels[4].text;
  }

  function setupCredit() {
    const creditOverlay = $("creditOverlay");
    let continued = false;

    const continueCredit = (e) => {
      if (continued) return;
      continued = true;
      if (e) e.preventDefault();

      creditOverlay.classList.add("hide");
      setTimeout(() => {
        creditOverlay.style.display = "none";
        const nameInput = $("nameInput");
        if (nameInput) {
          document.body.classList.add("typing-mode");
          nameInput.focus();
        }
      }, 500);
    };

    creditOverlay.addEventListener("pointerup", continueCredit);
    creditOverlay.addEventListener("click", continueCredit);
  }

  let renderActive = false;

  const SPECIAL_PASSWORD = 'expectation';
  const SPECIAL_USERS = new Set(['krushna', 'apeksha']);

  function isSpecialUser(name) {
    return SPECIAL_USERS.has(String(name || '').trim().toLowerCase());
  }

  function openSpecialPassword() {
    specialPasswordInput.value = '';
    specialPasswordError.textContent = '';
    specialPasswordOverlay.classList.add('show');
    setTimeout(() => specialPasswordInput.focus(), 120);
  }

  function unlockSpecialUser() {
    if (specialPasswordInput.value.trim().toLowerCase() !== SPECIAL_PASSWORD) {
      specialPasswordError.textContent = 'Incorrect password. Please try again.';
      specialPasswordInput.focus();
      specialPasswordInput.select();
      return;
    }
    specialPasswordOverlay.classList.remove('show');
    specialPasswordError.textContent = '';
    document.body.classList.remove('typing-mode');
    renderActive = true;
    render();
  }

  function setupIdentity() {
    const identityOverlay = $("identityOverlay");
    const nameInput = $("nameInput");

    renderActive = false;
    const surnameInput = $("surnameInput");
    const surnameWrap = $("surnameWrap");
    const crushInput = $("crushInput");
    const noCrush = $("noCrush");
    const enterGame = $("enterGame");
    const genderButtons = document.querySelectorAll(".choiceBtn");

    nameInput.focus();

    genderButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        genderButtons.forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        userGender = btn.dataset.gender;

        if (userGender === "boy") {
          document.documentElement.style.setProperty("--accent", "#8ea2ff");
        } else {
          document.documentElement.style.setProperty("--accent", "#ff7eaa");
        }
      });
    });

    nameInput.addEventListener("input", () => {
      const name = nameInput.value.trim().toLowerCase();

      if (name === "aryan") {
        surnameWrap.classList.add("show");
      } else {
        surnameWrap.classList.remove("show");
        surnameInput.value = "";
      }
    });

    noCrush.addEventListener("click", () => {
      hasCrush = !hasCrush;
      noCrush.classList.toggle("selected", !hasCrush);
      crushInput.disabled = !hasCrush;

      if (!hasCrush) {
        const typedName = nameInput.value.trim().toLowerCase();
        const assumed = ASSUMED_CRUSHES[typedName];
        crushInput.value = assumed || "";
        crushName = assumed || "";
        crushInput.placeholder = assumed
          ? "Let's assume: " + assumed
          : "No crush selected";
        applyIdentity();
      } else {
        crushInput.value = "";
        crushInput.placeholder = "Enter their name";
      }
    });

    function enter() {
      userName = nameInput.value.trim();
      userSurname = surnameInput.value.trim();

      const normalizedName = userName.toLowerCase();
      if (!hasCrush) {
        crushName = ASSUMED_CRUSHES[normalizedName] || "";
      } else {
        crushName = crushInput.value.trim();
      }

      if (!userName) {
        nameInput.focus();
        nameInput.style.borderColor = "var(--pink)";
        setTimeout(() => { nameInput.style.borderColor = ""; }, 700);
        return;
      }

      if (!userGender) {
        genderButtons.forEach(b => b.style.borderColor = "var(--pink)");
        setTimeout(() => genderButtons.forEach(b => b.style.borderColor = ""), 700);
        return;
      }

      if (hasCrush && !crushName) {
        crushInput.focus();
        crushInput.style.borderColor = "var(--pink)";
        setTimeout(() => { crushInput.style.borderColor = ""; }, 700);
        return;
      }

      if (!hasCrush && ASSUMED_CRUSHES[normalizedName]) {
        crushName = ASSUMED_CRUSHES[normalizedName];
        crushInput.value = crushName;
      }

      if (hasCrush) {
        crushName = crushInput.value.trim();
      } else {
        crushName = ASSUMED_CRUSHES[normalizedName] || "";
      }

      applyIdentity();
      identityOverlay.classList.remove("show");
      identityOverlay.style.display = "none";

      if (isSpecialUser(userName)) {
        openSpecialPassword();
        return;
      }

      document.body.classList.remove("typing-mode");
      renderActive = true;
      render();
    }

    enterGame.addEventListener("click", enter);

    crushInput.addEventListener("input", () => {
      if (hasCrush) {
        crushName = crushInput.value.trim();
        if (crushName) {
          applyIdentity();
          if (renderActive) render();
        }
      }
    });

    [nameInput, crushInput, surnameInput].forEach(input => {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") enter();
      });
    });
  }

  function getCrushDisplayName() {
    const name = String(crushName || "").trim();
    return name || (userGender === "boy" ? "her" : "him");
  }

  function applyIdentity() {
    const youColor = userGender === "girl" ? "#ff7eaa" : "#8ea2ff";
    const crushColor = userGender === "girl" ? "#8ea2ff" : "#ff7eaa";
    const crushDisplayName = getCrushDisplayName();

    document.querySelector(".statRow .stat:first-child strong").textContent = "● you";
    document.querySelector(".statRow .stat:first-child small").textContent = "speed: 2.00 u/s";

    document.querySelector(".statRow .stat:nth-child(2) span").textContent = crushDisplayName;
    document.querySelector(".statRow .stat:nth-child(2) strong").textContent = "● " + crushDisplayName;

    document.querySelector(".legend span:first-child").innerHTML =
      `<i style="background:${youColor}"></i>you`;
    document.querySelector(".legend span:nth-child(2)").replaceChildren(
      Object.assign(document.createElement("i"), {
        style: `background:${crushColor}`
      }),
      document.createTextNode(crushDisplayName)
    );

    document.querySelector(".statRow .stat:first-child").style.setProperty("--you-color", youColor);
    document.querySelector(".statRow .stat:nth-child(2)").style.setProperty("--crush-color", crushColor);

    window.identityYouColor = youColor;
    window.identityCrushColor = crushColor;

    syncUI();
  }

  function resize() {
    const r = canvas.getBoundingClientRect(), d = devicePixelRatio || 1;
    W = r.width; H = r.height; canvas.width = W * d; canvas.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    scale = Math.min(W, H) / 14; origin = { x: W / 2, y: H / 2 };
  }
  addEventListener('resize', resize); resize();

  function sx(x) { return origin.x + x * scale }
  function sy(y) { return origin.y - y * scale }
  function worldX(px) { return (px - origin.x) / scale }
  function worldY(py) { return (origin.y - py) / scale }

  function pathY(x) { return +slope.value * x + +intercept.value }

  const HER_SPEED = 1.50;
  const PLAYER_SPEED = 2.00;
  const PLAYER_START_X = -5.00;
  const PLAYER_MIN_X = -7.80;
  const PLAYER_MAX_X = 7.80;
  const PLAYER_MIN_Y = -7.80;
  const PLAYER_MAX_Y = 7.80;
  const MAX_ATTEMPT_TIME = 18.0;

  function herPosition(t) {
    const k = levels[level].kind;
    if (k === "line") {
      const x = -5.5 + ((t * HER_SPEED + 5.5) % 11);
      return { x, y: .58 * x + 2.1 };
    }
    if (k === "parabola") {
      const a = 4.8, x = a * Math.sin(t * .30);
      const y = .18 * x * x - 3.3;
      return { x, y };
    }
    if (k === "circle") {
      const rX = 3.25, rY = 2.15, omega = HER_SPEED / Math.max(rX, rY);
      return { x: rX * Math.cos(t * omega), y: rY * Math.sin(t * omega) };
    }
    if (k === "wave") {
      const x = -5.5 + ((t * HER_SPEED + 5.5) % 11);
      return { x, y: 2.1 * Math.sin(x * .95 + t * .08) };
    }
    if (k === "figure8") {
      const a = 4.4, omega = HER_SPEED / a;
      return { x: a * Math.sin(t * omega), y: 2.55 * Math.sin(2 * t * omega) };
    }
    const a = 4.7, omega = HER_SPEED / a;
    return { x: a * Math.sin(t * omega), y: 3.1 * Math.sin(2 * t * omega) * Math.cos(.18 * t * omega) };
  }

  function drawGrid() {
    ctx.clearRect(0, 0, W, H);
    const grad = ctx.createRadialGradient(W * .5, H * .45, 0, W * .5, H * .45, Math.max(W, H) * .7);
    grad.addColorStop(0, "#10152b"); grad.addColorStop(1, "#070914"); ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    ctx.lineWidth = 1;
    for (let x = -8; x <= 8; x++) { ctx.strokeStyle = x === 0 ? "rgba(255,255,255,.24)" : "rgba(255,255,255,.045)"; ctx.beginPath(); ctx.moveTo(sx(x), 0); ctx.lineTo(sx(x), H); ctx.stroke() }
    for (let y = -8; y <= 8; y++) { ctx.strokeStyle = y === 0 ? "rgba(255,255,255,.24)" : "rgba(255,255,255,.045)"; ctx.beginPath(); ctx.moveTo(0, sy(y)); ctx.lineTo(W, sy(y)); ctx.stroke() }
    ctx.fillStyle = "rgba(255,255,255,.27)"; ctx.font = "10px ui-monospace,monospace";
    for (let x = -7; x <= 7; x++) if (x) ctx.fillText(x, sx(x) + 4, origin.y - 5);
    for (let y = -7; y <= 7; y++) if (y) ctx.fillText(y, origin.x + 6, sy(y) - 4);
  }

  function drawGlowPoint(x, y, color, label) {
    const px = sx(x), py = sy(y), g = ctx.createRadialGradient(px, py, 0, px, py, 25);
    g.addColorStop(0, color + "cc"); g.addColorStop(1, color + "00"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, 25, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = color + "66"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.82)";
    ctx.font = "600 10px system-ui";
    ctx.textBaseline = "middle";
    ctx.fillText(String(label || ""), px + 12, py - 10);
    ctx.textBaseline = "alphabetic";
  }

  function drawPlayerPath() {
    ctx.strokeStyle = "rgba(142,162,255,.5)"; ctx.lineWidth = 2;
    ctx.beginPath(); let started = false;
    for (let px = 0; px <= W; px += 4) {
      const x = worldX(px), y = pathY(x), py = sy(y);
      if (py < -80 || py > H + 80) { started = false; continue }
      if (!started) { ctx.moveTo(px, py); started = true } else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  function drawHerPath() {
    ctx.strokeStyle = "rgba(255,126,170,.27)"; ctx.lineWidth = 1.6; ctx.setLineDash([5, 7]);
    ctx.beginPath(); let started = false;
    for (let tt = time - 8; tt <= time + 8; tt += .025) {
      const p = herPosition(tt), px = sx(p.x), py = sy(p.y);
      if (px < -100 || px > W + 100 || py < -100 || py > H + 100) { started = false; continue }
      if (!started) { ctx.moveTo(px, py); started = true } else ctx.lineTo(px, py);
    }
    ctx.stroke(); ctx.setLineDash([]);
  }

  function update(dt) {
    if (!running) return;

    time += dt;
    if (timerEl) timerEl.textContent = Math.max(0, MAX_ATTEMPT_TIME - time).toFixed(1) + "s";
    her = herPosition(time);

    const a = +slope.value;
    const step = (PLAYER_SPEED * dt) / Math.sqrt(1 + a * a);

    let nextX = player.x + lockedDirection * step;
    let nextY = pathY(nextX);

    if (
      nextX < PLAYER_MIN_X || nextX > PLAYER_MAX_X ||
      nextY < PLAYER_MIN_Y || nextY > PLAYER_MAX_Y
    ) {
      lockedDirection *= -1;
      nextX = player.x + lockedDirection * step;
      nextY = pathY(nextX);

      nextX = Math.max(PLAYER_MIN_X, Math.min(PLAYER_MAX_X, nextX));
      nextY = pathY(nextX);

      if (nextY < PLAYER_MIN_Y || nextY > PLAYER_MAX_Y) {
        lockedDirection *= -1;
        nextX = player.x + lockedDirection * step;
        nextX = Math.max(PLAYER_MIN_X, Math.min(PLAYER_MAX_X, nextX));
        nextY = pathY(nextX);
      }
    }

    player.x = nextX;
    player.y = nextY;

    const d = Math.hypot(player.x - her.x, player.y - her.y);
    distanceEl.textContent = d.toFixed(2);

    if (d < .18 && !completed) {
      completed = true;
      running = false;
      hits++;
      hitsEl.textContent = hits;
      showComplete();
      return;
    }

    if (time >= MAX_ATTEMPT_TIME && !completed) {
      running = false;
      timedOut = true;
      time = MAX_ATTEMPT_TIME;
      if (timerEl) timerEl.textContent = "0.0s";
      setGameControlsLocked(false);
      $('forward').disabled = false;
      $('backward').disabled = false;
      $('start').textContent = "Try again";
      message.textContent = "No meeting in this attempt — change your equation or direction.";
      message.classList.add("show");
      setTimeout(() => message.classList.remove("show"), 2600);
    }
  }

  function render() {
    if (!renderActive) return;
    drawGrid(); drawHerPath(); drawPlayerPath();
    drawGlowPoint(player.x, player.y, window.identityYouColor || "#8ea2ff", "you");
    drawGlowPoint(
      her.x,
      her.y,
      window.identityCrushColor || "#ff7eaa",
      getCrushDisplayName()
    );
    requestAnimationFrame(render);
  }

  function parseEquation(raw) {
    let t = raw.trim().toLowerCase().replace(/[−–—]/g, "-").replace(/\s+/g, "");
    if (t.startsWith("y=")) t = t.slice(2);
    const m = t.match(/^([+-]?(?:\d*\.?\d+))?x(?:([+-])(?:\d*\.?\d+))?$/);
    if (!m) return null;
    const a = (m[1] === undefined || m[1] === "" || m[1] === "+") ? 1 : (m[1] === "-" ? -1 : parseFloat(m[1]));
    const c = m[2] ? parseFloat((m[2] === "-" ? "-" : "") + t.split("x")[1].slice(1)) : 0;
    if (!Number.isFinite(a) || !Number.isFinite(c) || a < -3 || a > 3 || c < -7 || c > 7) return null;
    return { a, c };
  }

  function syncUI() {
    const s = +slope.value, c = +intercept.value;
    $('slopeVal').textContent = s.toFixed(2);$('interceptVal').textContent = c.toFixed(2);
    if (document.activeElement !== equation) { equation.value = `y = ${s.toFixed(2)}x ${c >= 0 ? "+" : "−"} ${Math.abs(c).toFixed(2)}`; }
    $('herEquation').textContent = levels[level].eq;
    const info = levels[level];
    const crushLabelForInfo = getCrushDisplayName();
    const startY = pathY(PLAYER_START_X);
    $('positionInfo').innerHTML = `<b>Initial positions:</b> you (${PLAYER_START_X.toFixed(2)}, ${startY.toFixed(2)}) · ${crushLabelForInfo} (${info.initialHer[0].toFixed(2)}, ${info.initialHer[1].toFixed(2)})<br><b>Your movement:</b> along your chosen line at 2.00 u/s · <b>${crushLabelForInfo}:</b> 1.50 u/s`;
    $('crushPathLabel').textContent = crushLabelForInfo.toUpperCase() + " PATH";
    $('crushSpeedText').textContent = crushLabelForInfo.charAt(0).toUpperCase() + crushLabelForInfo.slice(1);
    levelTitle.textContent = levels[level].title; levelDesc.textContent = levels[level].desc;
    $('progressText').textContent = `Level ${level + 1} / ${levels.length}`;
    document.querySelectorAll('.dot').forEach((d, i) => d.className = "dot " + (i < level ? "done" : i === level ? "active" : ""));
  }

  function reset() {
    running = false;
    completed = false;
    timedOut = false;
    time = 0;
    if (timerEl) timerEl.textContent = MAX_ATTEMPT_TIME.toFixed(1) + "s";
    movementDirection = 1;
    lockedDirection = 1;
    const startX = Math.max(PLAYER_MIN_X, Math.min(PLAYER_MAX_X, PLAYER_START_X));
    player = { x: startX, y: pathY(startX) };
    her = herPosition(0);
    distanceEl.textContent = "—";
    message.classList.remove("show");
    $('start').textContent = "Start";
    setGameControlsLocked(false);
    $('forward').disabled = false;
    $('backward').disabled = false;
    syncDirectionUI();
    syncUI();
  }

  function setGameControlsLocked(locked) {
    equation.disabled = locked;
    slope.disabled = locked;
    intercept.disabled = locked;
  }

  function start() {
    if (completed) return;

    if (timedOut) {
      reset();
      return;
    }

    if (!running) {
      lockedDirection = movementDirection;
      running = true;
      $('forward').disabled = true;
      $('backward').disabled = true;
      setGameControlsLocked(true);
      $('start').textContent = "Pause";
    } else {
      running = false;
      $('start').textContent = "Start";
    }
  }

  function syncDirectionUI() {
    $('directionVal').textContent = movementDirection === 1 ? "→ forward" : "← backward";
