/* SWAN GMAO Student landing page: scroll narrative, registration form and direct download. No dependency. */
(function () {
  "use strict";
  var cfg = window.SWAN_LANDING || {};
  var rel = window.SWAN_RELEASE || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var isPreview = /^(localhost|127\.0\.0\.1|\[::1\]|)$/.test(location.hostname) || location.protocol === "file:";
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.documentElement.classList.remove("no-js");

  /* =====================================================================
     Navigation
     ===================================================================== */
  var nav = $("#nav");
  var links = $("#nav-links");
  var toggle = $("#nav-toggle");
  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  });
  $$("a", links).forEach(function (a) { a.addEventListener("click", function () { links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }); });

  /* =====================================================================
     Scroll narrative. Everything is derived from the scroll position on each frame (no observer), so it is exact and testable.
     ===================================================================== */
  var progress = $("#progress");
  var words = [];
  var wordsBox = $("#words");
  if (wordsBox) {
    var parts = wordsBox.textContent.trim().split(/\s+/);
    wordsBox.textContent = "";
    parts.forEach(function (w, i) {
      var s = document.createElement("span");
      s.className = "w";
      s.textContent = w;
      wordsBox.appendChild(s);
      if (i < parts.length - 1) wordsBox.appendChild(document.createTextNode(" "));
      words.push(s);
    });
  }
  var steps = $$(".step");
  var stageImgs = $$(".stage-img");
  var stageIndex = $("#stage-index");
  var stageBar = $("#stage-bar");
  var rail = $$("#rail li");
  var rv = $$(".rv");
  var numbers = $(".numbers");
  var counters = $$("[data-count]");
  var counted = false;
  var activeStep = -1;
  var desktopStory = window.matchMedia("(min-width: 901px)");

  function setStep(i) {
    if (i === activeStep) return;
    activeStep = i;
    steps.forEach(function (s, k) { s.classList.toggle("active", k === i); });
    stageImgs.forEach(function (im, k) { im.classList.toggle("active", k === i); });
    if (stageIndex) stageIndex.textContent = String(i + 1).padStart(2, "0");
    if (stageBar) stageBar.style.transform = "scaleX(" + ((i + 1) / steps.length).toFixed(4) + ")";
  }

  function countUp() {
    if (counted) return;
    counted = true;
    var t0 = Date.now(), dur = reduced ? 1 : 1500;
    var timer = setInterval(function () {
      var p = Math.min(1, (Date.now() - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      counters.forEach(function (c) { c.textContent = String(Math.round(Number(c.getAttribute("data-count")) * e)); });
      if (p >= 1) clearInterval(timer);
    }, 24);
  }

  var ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var y = window.scrollY || window.pageYOffset;
    var max = Math.max(1, document.documentElement.scrollHeight - vh);
    progress.style.transform = "scaleX(" + Math.min(1, y / max).toFixed(4) + ")";
    nav.classList.toggle("scrolled", y > 12);

    // manifesto: each word lights up as its line passes the middle of the screen
    if (wordsBox) {
      var r = wordsBox.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, (vh * 0.82 - r.top) / (r.height + vh * 0.32)));
      var upto = Math.round(p * words.length);
      words.forEach(function (w, i) { w.classList.toggle("on", i < upto); });
    }

    // the system: the step nearest to the middle of the screen is the one told, and its screenshot is on the stage
    if (steps.length && desktopStory.matches) {
      var mid = vh / 2, best = 0, bestDist = Infinity;
      steps.forEach(function (s, i) {
        var b = s.getBoundingClientRect();
        var d = Math.abs((b.top + b.bottom) / 2 - mid);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      setStep(best);
    }

    rail.forEach(function (li) { li.classList.toggle("on", li.getBoundingClientRect().top < vh * 0.64); });
    rv.forEach(function (el) { if (!el.classList.contains("in") && el.getBoundingClientRect().top < vh * 0.92) el.classList.add("in"); });
    if (numbers && numbers.getBoundingClientRect().top < vh * 0.78) countUp();
  }
  function schedule() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  frame();
  setStep(0);

  /* =====================================================================
     Hero: a slow field of contour lines that bends towards the pointer
     ===================================================================== */
  (function field() {
    var cv = $("#field");
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext("2d");
    var w = 0, h = 0, dpr = 1, t = 0, last = 0, mx = 0.7, my = 0.4, tx = 0.7, ty = 0.4, visible = true;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      var rows = Math.max(18, Math.round(h / 24)), gap = h / rows, step = 14;
      for (var r = 0; r < rows; r++) {
        var base = r * gap + gap * 0.5;
        var alpha = 0.05 + 0.13 * (0.5 + 0.5 * Math.sin(r * 0.33 + t * 0.25));
        ctx.beginPath();
        for (var x = 0; x <= w + step; x += step) {
          var n = Math.sin(x * 0.0034 + r * 0.21 + t * 0.35) * 15 + Math.sin(x * 0.009 - r * 0.13 + t * 0.2) * 8 + Math.sin(x * 0.0016 + r * 0.07 - t * 0.12) * 24;
          var dx = x / w - mx, dy = base / h - my;
          var bump = Math.exp(-(dx * dx * 5 + dy * dy * 14)) * 38;
          var yy = base + n - bump;
          if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        ctx.strokeStyle = "rgba(255,255,255," + alpha.toFixed(3) + ")";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    function loop(now) {
      requestAnimationFrame(loop);
      if (!visible || document.hidden || now - last < 33) return;
      last = now; t += 0.033;
      mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;
      draw();
    }
    size();
    draw();
    window.addEventListener("resize", function () { size(); draw(); });
    if (reduced) return;
    window.addEventListener("pointermove", function (e) { tx = e.clientX / Math.max(1, window.innerWidth); ty = e.clientY / Math.max(1, window.innerHeight); }, { passive: true });
    window.addEventListener("scroll", function () { visible = (window.scrollY || 0) < (window.innerHeight || 800) * 1.1; }, { passive: true });
    requestAnimationFrame(loop);
  })();

  /* =====================================================================
     Facts that come from the build
     ===================================================================== */
  $("#year").textContent = String(new Date().getFullYear());
  var mail = cfg.contactEmail || "";
  if (mail) ["contact-link", "help-link", "footer-mail"].forEach(function (id) { var a = document.getElementById(id); if (a) { a.href = "mailto:" + mail; a.textContent = mail; } });
  if (rel.version) $("#meta-version").textContent = rel.version;
  var sizeMb = rel.sizeBytes ? Math.round(rel.sizeBytes / 1048576) : 0;
  if (sizeMb) { $("#meta-size").textContent = sizeMb + " Mo"; $("#file-size").textContent = sizeMb + " Mo"; }
  if (rel.fileName) $("#file-name").textContent = rel.fileName;
  if (rel.sha256) { $("#sha").textContent = rel.sha256; $("#sum-row").hidden = false; }

  /* =====================================================================
     Registration
     ===================================================================== */
  var form = $("#reg");
  var formView = $("#form-view");
  var doneView = $("#done-view");
  var submit = $("#submit");
  var formError = $("#form-error");
  var dl = $("#download");
  var dlError = $("#dl-error");

  function fieldOf(name) { var el = form.elements[name]; return el ? el.closest(".field") : null; }
  function setError(name, msg) {
    var f = fieldOf(name);
    if (!f) return;
    f.classList.toggle("invalid", !!msg);
    var p = $('.err[data-for="' + name + '"]', f);
    if (p) p.textContent = msg || "";
    var input = form.elements[name];
    if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
  }
  var rules = {
    fullName: function (v) { return v.trim().split(/\s+/).filter(Boolean).length >= 2 && v.trim().length >= 5 ? "" : "Indiquez votre nom et votre prénom."; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Indiquez une adresse e-mail valide."; },
    university: function (v) { return v.trim().length >= 2 ? "" : "Indiquez votre université ou votre école."; },
    major: function (v) { return v.trim().length >= 2 ? "" : "Indiquez votre filière ou votre spécialité."; },
    level: function (v) { return v ? "" : "Choisissez votre niveau d'études."; },
  };
  function validate() {
    var ok = true;
    Object.keys(rules).forEach(function (n) { var m = rules[n](form.elements[n].value); setError(n, m); if (m) ok = false; });
    var c = form.elements.consent.checked;
    var f = fieldOf("consent");
    f.classList.toggle("invalid", !c);
    $('.err[data-for="consent"]').textContent = c ? "" : "Cochez la case pour continuer.";
    if (!c) ok = false;
    return ok;
  }
  Object.keys(rules).forEach(function (n) {
    var el = form.elements[n];
    el.addEventListener("blur", function () { setError(n, rules[n](el.value)); });
    el.addEventListener("input", function () { if (el.closest(".field").classList.contains("invalid")) setError(n, rules[n](el.value)); });
  });
  form.elements.consent.addEventListener("change", function () { if (form.elements.consent.checked) { fieldOf("consent").classList.remove("invalid"); $('.err[data-for="consent"]').textContent = ""; } });

  function payload() {
    var d = {};
    ["fullName", "email", "university", "major", "level"].forEach(function (n) { d[n] = form.elements[n].value.trim(); });
    d.page = location.href.split("#")[0];
    d.language = navigator.language || "";
    d.version = rel.version || "";
    return d;
  }

  /** Sends the registration to the free service chosen in config.js. Resolves when it was accepted, rejects otherwise. */
  function send(data) {
    var endpoint = cfg.formEndpoint;
    if (!endpoint) {
      if (isPreview) { console.info("[landing] preview mode: no formEndpoint configured, registration not sent", data); return Promise.resolve(); }
      return Promise.reject(new Error("not_configured"));
    }
    if (cfg.formProvider === "formspree") {
      return fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error("http_" + r.status); });
    }
    if (cfg.formProvider === "web3forms") {
      var body = Object.assign({ access_key: cfg.accessKey, subject: "Inscription SWAN GMAO Student", from_name: "Landing SWAN Student" }, data);
      return fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body) })
        .then(function (r) { return r.json(); }).then(function (j) { if (!j.success) throw new Error("rejected"); });
    }
    // Google Apps Script web app: sent as an ordinary form submission (name, email, university, specialty, level, consent), the format a web app reads
    // as parameters. The browser cannot read its answer across origins, a completed request is the acknowledgement.
    var params = new URLSearchParams();
    Object.keys(data).forEach(function (k) { params.append(k, data[k]); });
    params.set("name", data.fullName);
    params.set("specialty", data.major);
    params.set("consent", "true");
    return fetch(endpoint, { method: "POST", mode: "no-cors", body: params }).then(function () {});
  }

  function showDone(name) {
    var first = (name || "").trim().split(/\s+/)[0];
    $("#thanks").textContent = first ? "Merci " + first + ", votre téléchargement est prêt." : "Merci, votre téléchargement est prêt.";
    var url = cfg.downloadUrl || "";
    var placeholder = /OWNER|REPOSITORY/.test(url) || !url;
    dl.href = url || "#";
    if (rel.fileName) dl.setAttribute("download", rel.fileName);
    dlError.hidden = true;
    if (placeholder && !isPreview) {
      dlError.textContent = "Le lien de téléchargement n'est pas encore configuré. Merci de réessayer plus tard.";
      dlError.hidden = false;
      dl.setAttribute("aria-disabled", "true");
    } else {
      dl.removeAttribute("aria-disabled");
    }
    formView.hidden = true;
    doneView.hidden = false;
    var card = $("#dl-card");
    if (card && card.getBoundingClientRect().top < 0) card.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  dl.addEventListener("click", function (e) { if (dl.getAttribute("aria-disabled") === "true") e.preventDefault(); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    formError.hidden = true;
    if (!validate()) { var bad = $(".field.invalid input, .field.invalid select"); if (bad) bad.focus(); return; }
    // the hidden trap field: a script filled it, a person never sees it
    if (form.elements.website.value) { showDone(form.elements.fullName.value); return; }
    var data = payload();
    submit.disabled = true;
    submit.classList.add("is-loading");
    send(data).then(function () {
      showDone(data.fullName);
    }).catch(function (err) {
      formError.textContent = err && err.message === "not_configured"
        ? "Le formulaire n'est pas encore en service. Merci de réessayer un peu plus tard."
        : "L'envoi a échoué. Vérifiez votre connexion Internet puis réessayez.";
      formError.hidden = false;
    }).then(function () { submit.disabled = false; submit.classList.remove("is-loading"); });
  });
})();
