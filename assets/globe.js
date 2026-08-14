/* =====================================================================
   SWISS SHEARCH — globe « dots » du hero (Canvas natif, sans dépendance)
   Sphère de points en rotation, projetée en 2D. Couleur = accent du thème.
   API : window.HeroGlobe.mount(canvasEl) / window.HeroGlobe.unmount()
   ===================================================================== */
(function () {
  "use strict";
  var raf = null, ro = null, canvas = null, ctx = null, pts = [], rotY = 0, t = 0, dpr = 1;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fibSphere(n) {
    var p = [], inc = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) {
      var y = 1 - (i / (n - 1)) * 2;
      var r = Math.sqrt(1 - y * y);
      var phi = i * inc;
      p.push([Math.cos(phi) * r, y, Math.sin(phi) * r]);
    }
    return p;
  }
  function accent() {
    var v = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    return v || "#c4302b";
  }
  function resize() {
    if (!canvas) return;
    var rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
  }
  function draw() {
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    var R = Math.min(w * 0.42, 380 * dpr);
    var cx = w / 2;
    var cy = Math.min(h * 0.44, R + 64 * dpr);
    // Rotation multi-axes (comme le DotGlobeHero R3F : y continu, x + z en dérive).
    // Hochement (axe X) et roulis (axe Z) en oscillation douce → mouvement 3D vivant
    // sans que le globe ne « bascule » et désoriente la composition du hero.
    var tiltX = 0.42 + 0.12 * Math.sin(t * 0.004);
    var rollZ = 0.05 * Math.sin(t * 0.0026);
    var cosX = Math.cos(tiltX), sinX = Math.sin(tiltX);
    var cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    var cosZ = Math.cos(rollZ), sinZ = Math.sin(rollZ);
    var col = accent();
    var depth = 2.4;
    ctx.fillStyle = col;
    for (var i = 0; i < pts.length; i++) {
      var x = pts[i][0], y = pts[i][1], z = pts[i][2];
      var x1 = x * cosY + z * sinY, z1 = -x * sinY + z * cosY;
      var y2 = y * cosX - z1 * sinX, z2 = y * sinX + z1 * cosX;
      var front = (z2 + 1) / 2;
      var s = depth / (depth - z2);
      var ox = x1 * R * s, oy = y2 * R * s;
      var sx = cx + ox * cosZ - oy * sinZ, sy = cy + ox * sinZ + oy * cosZ;
      ctx.globalAlpha = 0.22 + 0.58 * front;
      ctx.beginPath();
      ctx.arc(sx, sy, (1.0 + 1.5 * front) * dpr, 0, 6.2832);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function frame() {
    raf = requestAnimationFrame(frame);
    if (document.hidden) return;
    t += 1;
    rotY += 0.0016;
    draw();
  }
  function mount(el) {
    unmount();
    canvas = el;
    ctx = canvas.getContext("2d");
    var n = window.matchMedia("(max-width: 720px)").matches ? 420 : 760;
    pts = fibSphere(n);
    resize();
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(function () { resize(); if (reduce) draw(); });
      ro.observe(canvas);
    } else {
      window.addEventListener("resize", resize);
    }
    if (reduce) { draw(); }
    else { raf = requestAnimationFrame(frame); }
  }
  function unmount() {
    if (raf) cancelAnimationFrame(raf), (raf = null);
    if (ro) ro.disconnect(), (ro = null);
    else window.removeEventListener("resize", resize);
    canvas = ctx = null; pts = [];
  }
  window.HeroGlobe = { mount: mount, unmount: unmount };
})();
