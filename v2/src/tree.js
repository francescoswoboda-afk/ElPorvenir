/* ============================================================
   The living pecan tree — procedural, canvas 2D.
   Seasons: s in [0,4): 0 winter, 1 spring, 2 summer, 3 autumn.
   ============================================================ */
(function () {
  "use strict";
  var TAU = Math.PI * 2;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function mix(c1, c2, t) { return [lerp(c1[0], c2[0], t) | 0, lerp(c1[1], c2[1], t) | 0, lerp(c1[2], c2[2], t) | 0]; }
  function rgb(c, a) { return a == null ? "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")" : "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  var C = {
    bark: [62, 50, 40], barkWinter: [70, 64, 60], barkDusk: [28, 26, 30],
    spring: [160, 190, 92], summer: [74, 108, 42], summer2: [92, 126, 52], summer3: [60, 92, 36],
    yellow: [212, 168, 64], amber: [190, 122, 46], brown: [128, 84, 44],
    husk: [96, 130, 58], huskDry: [96, 70, 44], nut: [140, 92, 54], nutDark: [78, 50, 28],
    catkin: [178, 176, 96], frost: [236, 242, 246]
  };

  function Tree(canvas, opt) {
    opt = opt || {};
    this.cv = canvas; this.ctx = canvas.getContext("2d");
    this.mobile = !!opt.mobile; this.reduced = !!opt.reduced;
    this.maxDepth = this.mobile ? 7 : 8;
    this.state = { G: 0, seed: 0, s: 2, x: 0, base: 0, H: 400, alpha: 1, O: 0, dusk: 0, wind: 1 };
    this.ptr = { x: -9999, y: -9999, e: 0, vx: 0 };
    this.parts = { nuts: [], leaves: [], twigs: [], shells: [] };
    this.caught = 0; this.time = 0; this.trunkClicks = []; this.bird = null;
    this.sprite = document.createElement("canvas"); this.spriteN = 0;
    this.build(opt.seed || 7);
    this.resize();
  }
  var P = Tree.prototype;

  P.build = function (seed) {
    var r = rng(seed), nodes = [], leaves = [], catkins = [], husks = [], maxD = this.maxDepth, maxBirth = 0;
    function add(parent, depth, len, w, a, birth, abs) {
      abs = abs == null ? a : abs;
      var n = { p: parent, d: depth, len: len, w: w, a: a, bend: (r() - .5) * .35, birth: birth, ph: r() * TAU,
        sx: 0, sy: 0, ex: 0, ey: 0, wa: 0, g: 0 };
      nodes.push(n); var idx = nodes.length - 1; if (birth > maxBirth) maxBirth = birth;
      if (depth >= maxD) return idx;
      var k = depth === 0 ? 3 : depth < 3 ? (r() < .5 ? 3 : 2) : (r() < .8 ? 2 : 3);
      for (var i = 0; i < k; i++) {
        if (depth >= maxD - 2 && r() < .1) continue;
        if (depth >= 3 && depth < maxD - 1 && r() < .16) continue;
        var spread = depth === 0 ? .5 : .46 + .14 * r();
        var ai = (i - (k - 1) / 2) * spread * (depth === 0 ? 1 : .8 + .4 * r()) + (depth === 0 ? 0 : (r() - .5) * .26);
        var ab = abs + ai;
        // a broad, rounded crown like a pecan: limbs bend back towards the light
        if (depth >= 1) { var pull = depth === 1 ? .12 : depth < 4 ? .26 : .2; ai += (-Math.PI / 2 - ab) * pull; ab = abs + ai; }
        if (depth === 0 && k === 3 && i === 1) ai += (r() - .5) * .1;
        var cl = len * (depth === 0 ? .64 : depth === 1 ? .84 : .76 + .1 * r());
        add(idx, depth + 1, cl, w * .64, ai, birth + .8 + .35 * r(), ab);
      }
      return idx;
    }
    add(-1, 0, .24, .042, -Math.PI / 2, 0);
    var kids = new Array(nodes.length).fill(0);
    for (var z = 1; z < nodes.length; z++) kids[nodes[z].p]++;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.d >= 3) {
        // pecan leaves are compound: a stem with paired leaflets
        var term = kids[i] === 0;
        var cnt = term ? (r() < .6 ? 2 : 1) + (n.d < maxD - 1 ? 1 : 0) : n.d >= maxD - 2 ? (r() < .5 ? 1 : 0) : (r() < .22 ? 1 : 0);
        for (var j = 0; j < cnt; j++) leaves.push({ n: i, off: term ? .7 + r() * .3 : .35 + r() * .6, ox: 0, oy: 0, a: (j ? 1 : -1) * (.5 + r() * .7) + (r() - .5) * .4,
          sz: .8 + r() * .45, k: r(), k2: r(), k3: r(), b: (r() * 3) | 0, ph: r() * TAU, fallen: false, droop: .15 + r() * .35 });
        if (term && r() < .33) catkins.push({ n: i, len: .035 + r() * .03, ph: r() * TAU });
        if (term && r() < .16) {
          var nn = [], c2 = 2 + ((r() * 2) | 0);
          for (var q = 0; q < c2; q++) nn.push({ dx: (r() - .5) * .022, dy: (r() - .2) * .02, f: r(), fallen: false });
          husks.push({ n: i, nuts: nn });
        }
      }
    }
    this.nodes = nodes; this.leaves = leaves; this.catkins = catkins; this.husks = husks; this.maxBirth = maxBirth;
    var bees = []; for (var b = 0; b < 7; b++) bees.push({ a: r() * TAU, sp: .4 + r() * .5, rx: .25 + r() * .25, ry: .12 + r() * .14, ph: r() * TAU });
    this.bees = bees;
    var grass = []; for (var g = 0; g < (this.mobile ? 110 : 220); g++) grass.push({ x: (r() - .5) * 1.3 * (.4 + .6 * r()), h: .008 + r() * .02, ph: r() * TAU, lean: (r() - .5) * .5 });
    this.grass = grass;
    var frost = []; for (var f = 0; f < 50; f++) frost.push({ x: (r() - .5) * 1.3, y: r() * .05, ph: r() * TAU });
    this.frostPts = frost;
  };

  P.resize = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, this.mobile ? 1.6 : 2);
    this.dpr = dpr; this.w = window.innerWidth; this.h = window.innerHeight;
    this.cv.width = Math.round(this.w * dpr); this.cv.height = Math.round(this.h * dpr);
  };

  P.pointer = function (x, y, speed) {
    this.ptr.x = x; this.ptr.y = y;
    this.ptr.e = Math.min(1.4, this.ptr.e + speed * 0.0016);
  };

  /* ---------- season curves ---------- */
  P.season = function (s) {
    var m = ((s % 4) + 4) % 4, o = {};
    o.m = m;
    o.leaf = m < .75 ? 0 : m < 1.6 ? .9 * smooth(.75, 1.6, m) : m < 2.2 ? .9 + .1 * smooth(1.6, 2.2, m) : m < 3.25 ? 1 : m < 3.97 ? 1 - smooth(3.25, 3.95, m) : 0;
    o.leafSize = m < 1.95 ? .35 + .65 * smooth(.75, 1.95, m) : 1;
    o.green = smooth(1.2, 2.2, m);
    o.turn = smooth(2.95, 3.55, m);
    o.fall = smooth(3.3, 3.95, m);
    o.catkin = smooth(.85, 1.15, m) * (1 - smooth(1.55, 1.85, m));
    o.bees = smooth(.9, 1.2, m) * (1 - smooth(2.0, 2.35, m));
    o.husk = m > 1.75 && m < 3.9 ? smooth(1.75, 2.7, m) : 0;
    o.huskDry = smooth(2.85, 3.2, m);
    o.huskOpen = smooth(3.05, 3.3, m);
    o.nutFall = smooth(3.2, 3.62, m);
    o.huskGone = smooth(3.75, 3.9, m);
    o.frost = m < .8 ? 1 - smooth(.45, .8, m) : smooth(3.85, 4, m);
    o.prune = m > .08 && m < .6 ? 1 : 0;
    return o;
  };

  /* ---------- skeleton ---------- */
  P.solve = function (bx, by, H, G, t, live) {
    var nodes = this.nodes, mb = this.maxBirth + 1, wind = this.state.wind * (this.reduced ? .15 : 1);
    var gust = .55 + .45 * Math.sin(t * .37) * Math.sin(t * .11 + 1.3);
    var px = this.ptr.x, py = this.ptr.y, pe = live ? this.ptr.e : 0, R = Math.max(120, H * .32);
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i], par = n.p >= 0 ? nodes[n.p] : null;
      var g = clamp(G * mb - n.birth, 0, 1); g = g * g * (3 - 2 * g); n.g = g;
      var amp = .0045 * Math.pow(n.d + 1, 1.15) * wind;
      var sway = amp * (Math.sin(t * 1.25 + n.ph) * .65 + Math.sin(t * 2.7 + n.ph * 1.7) * .25) * (.6 + gust * .8);
      if (pe > .01 && par) {
        var dx = n.ex - px, dy = n.ey - py, d = Math.sqrt(dx * dx + dy * dy);
        if (d < R) { var f = 1 - d / R; sway += f * f * .16 * pe * (dx > 0 ? 1 : -1) * (n.d / this.maxDepth); }
      }
      n.wa = (par ? par.wa + n.a : n.a) + sway;
      n.sx = par ? par.ex : bx; n.sy = par ? par.ey : by;
      var L = n.len * H * g;
      n.ex = n.sx + Math.cos(n.wa) * L; n.ey = n.sy + Math.sin(n.wa) * L;
    }
  };

  P.drawTree = function (ctx, bx, by, H, G, S, t, live, dusk) {
    this.solve(bx, by, H, G, t, live);
    var nodes = this.nodes, md = this.maxDepth, i, n;
    var bark = mix(mix(C.bark, C.barkWinter, S.frost * .6), C.barkDusk, dusk);
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = rgb(bark);
    var thick = .35 + .65 * Math.min(1, G * 1.2);
    for (var d = 0; d <= md; d++) {
      ctx.lineCap = d === 0 ? "butt" : "round";
      ctx.beginPath(); var any = false, lw = 0;
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i]; if (n.d !== d || n.g <= 0) continue;
        any = true; lw = n.w * H * thick;
        var mx = (n.sx + n.ex) / 2, my = (n.sy + n.ey) / 2, L = n.len * H * n.g;
        var cx = mx - Math.sin(n.wa) * n.bend * L * .3, cy = my + Math.cos(n.wa) * n.bend * L * .3;
        ctx.moveTo(n.sx, n.sy); ctx.quadraticCurveTo(cx, cy, n.ex, n.ey);
      }
      if (any) { ctx.lineWidth = Math.max(.7, lw); ctx.stroke(); }
    }
    // trunk flare
    var tr = nodes[0];
    if (tr.g > 0) {
      ctx.fillStyle = rgb(bark); ctx.beginPath();
      var tw = tr.w * H * thick;
      ctx.moveTo(bx - tw * .9, by + 1); ctx.quadraticCurveTo(bx - tw * .46, by - tw * .5, bx - tw * .46, by - tw * 1.4);
      ctx.lineTo(bx + tw * .46, by - tw * 1.4); ctx.quadraticCurveTo(bx + tw * .46, by - tw * .5, bx + tw * .9, by + 1); ctx.fill();
    }
    var leafG = smooth(.8, 1, G);
    if (leafG <= 0) return;
    this.drawCatkins(ctx, H, S, t, leafG, dusk);
    this.drawLeaves(ctx, H, S, t, leafG, live, dusk);
    this.drawHusks(ctx, H, S, leafG, live, dusk);
  };

  P.drawLeaves = function (ctx, H, S, t, lg, live, dusk) {
    if (S.leaf <= 0) return;
    var leaves = this.leaves, nodes = this.nodes, wind = this.state.wind * (this.reduced ? .15 : 1);
    var base = mix(C.spring, C.summer, S.green), base2 = mix(C.spring, C.summer2, S.green), base3 = mix(C.spring, C.summer3, S.green);
    var cols = [base, base2, base3, C.yellow, C.amber, C.brown];
    var paths = [new Path2D(), new Path2D(), new Path2D(), new Path2D(), new Path2D(), new Path2D()];
    var sz0 = .0105 * H * S.leafSize * lg;
    for (var i = 0; i < leaves.length; i++) {
      var lf = leaves[i];
      if (lf.k > S.leaf) continue;
      var fallen = S.fall > lf.k3;
      if (fallen) {
        if (live && !lf.fallen && this.parts.leaves.length < 140 && !this.reduced) this.spawnLeaf(lf, H, S);
        if (live) lf.fallen = true; continue;
      } else if (live) lf.fallen = false;
      var n = nodes[lf.n]; if (n.g < .9) continue;
      var c = Math.cos(n.wa), s = Math.sin(n.wa);
      var px = lerp(n.sx, n.ex, lf.off) + (lf.ox * c - lf.oy * s) * H;
      var py = lerp(n.sy, n.ey, lf.off) + (lf.ox * s + lf.oy * c) * H;
      lf.x = px; lf.y = py;
      var ang = n.wa + lf.a + Math.sin(t * 2.6 + lf.ph) * .22 * wind;
      var bucket = lf.b;
      if (S.turn > lf.k2) bucket = S.turn - lf.k2 < .25 ? 3 : S.turn - lf.k2 < .5 ? 4 : 5;
      var p = paths[bucket], RL = sz0 * 2.2 * lf.sz, ca = Math.cos(ang), sa = Math.sin(ang), fl = Math.sin(t * 4.3 + lf.ph * 2) * .18 * wind;
      // rachis gently droops
      for (var q = 0; q < 4; q++) {
        var tq = .28 + q * .24, lx = px + ca * RL * tq, ly = py + sa * RL * tq + lf.droop * RL * tq * tq, ll = sz0 * lf.sz * (q === 3 ? .95 : .78), lw = ll * .3;
        if (q === 3) { p.moveTo(lx + ca * ll, ly + sa * ll); p.ellipse(lx + ca * ll * .6, ly + sa * ll * .6, ll, lw, ang, 0, TAU); break; }
        var a1 = ang - .95 + fl, a2 = ang + .95 - fl;
        p.moveTo(lx + Math.cos(a1) * ll * 1.6, ly + Math.sin(a1) * ll * 1.6); p.ellipse(lx + Math.cos(a1) * ll * .8, ly + Math.sin(a1) * ll * .8, ll, lw, a1, 0, TAU);
        p.moveTo(lx + Math.cos(a2) * ll * 1.6, ly + Math.sin(a2) * ll * 1.6); p.ellipse(lx + Math.cos(a2) * ll * .8, ly + Math.sin(a2) * ll * .8, ll, lw, a2, 0, TAU);
      }
    }
    for (var b = 0; b < 6; b++) { ctx.fillStyle = rgb(mix(cols[b], C.barkDusk, dusk * .7)); ctx.fill(paths[b]); }
  };

  P.drawCatkins = function (ctx, H, S, t, lg, dusk) {
    if (S.catkin <= 0) return;
    var nodes = this.nodes, wind = this.state.wind * (this.reduced ? .15 : 1);
    ctx.strokeStyle = rgb(mix(C.catkin, C.barkDusk, dusk), .9 * S.catkin * lg); ctx.lineWidth = Math.max(1.2, H * .0035);
    ctx.beginPath();
    for (var i = 0; i < this.catkins.length; i++) {
      var k = this.catkins[i], n = nodes[k.n]; if (n.g < .9) continue;
      var L = k.len * H * S.catkin, sw = Math.sin(t * 2 + k.ph) * .25 * wind;
      ctx.moveTo(n.ex, n.ey);
      ctx.quadraticCurveTo(n.ex + L * .3 * sw, n.ey + L * .5, n.ex + L * sw, n.ey + L);
    }
    ctx.stroke();
  };

  P.drawHusks = function (ctx, H, S, lg, live, dusk) {
    if (S.husk <= 0 || S.huskGone >= 1) return;
    var nodes = this.nodes, r = .0085 * H * (.35 + .65 * S.husk) * lg;
    var hc = mix(mix(C.husk, C.huskDry, S.huskDry), C.barkDusk, dusk * .7);
    for (var i = 0; i < this.husks.length; i++) {
      var hk = this.husks[i], n = nodes[hk.n]; if (n.g < .9) continue;
      for (var j = 0; j < hk.nuts.length; j++) {
        var nu = hk.nuts[j], x = n.ex + nu.dx * H, y = n.ey + nu.dy * H + r;
        var falls = S.nutFall > nu.f;
        if (live) {
          if (falls && !nu.fallen) { nu.fallen = true; this.dropNut(x, y, r, H); }
          else if (!falls && S.nutFall < nu.f - .02) nu.fallen = false;
        }
        var gone = live ? nu.fallen : falls;
        ctx.globalAlpha = 1 - S.huskGone;
        if (S.huskOpen > 0) {
          // four valves splitting open
          var o = S.huskOpen;
          ctx.fillStyle = rgb(hc);
          for (var v = 0; v < 4; v++) {
            var a = v * TAU / 4 + .78, ox = Math.cos(a) * r * .55 * o, oy = Math.sin(a) * r * .55 * o;
            ctx.beginPath(); ctx.ellipse(x + ox, y + oy, r * .55, r * .9, a + Math.PI / 2, 0, TAU); ctx.fill();
          }
          if (!gone) { this.nutShape(ctx, x, y, r * .62, .3, dusk); }
        } else {
          ctx.fillStyle = rgb(hc); ctx.beginPath(); ctx.ellipse(x, y, r * .78, r, 0, 0, TAU); ctx.fill();
          ctx.strokeStyle = rgb(mix(hc, [40, 40, 20], .35)); ctx.lineWidth = Math.max(.6, r * .12);
          ctx.beginPath(); ctx.moveTo(x, y - r * .9); ctx.lineTo(x, y + r * .9); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    }
  };

  P.nutShape = function (ctx, x, y, r, rot, dusk) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
    ctx.fillStyle = rgb(mix(C.nut, C.barkDusk, (dusk || 0) * .5)); ctx.beginPath(); ctx.ellipse(0, 0, r * .7, r, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = rgb(C.nutDark); ctx.lineWidth = Math.max(.8, r * .14);
    ctx.beginPath();
    ctx.moveTo(-r * .3, -r * .6); ctx.quadraticCurveTo(-r * .1, -r * .2, -r * .35, r * .1);
    ctx.moveTo(r * .2, -r * .3); ctx.quadraticCurveTo(r * .35, r * .1, r * .1, r * .5);
    ctx.moveTo(-r * .1, r * .45); ctx.lineTo(-r * .25, r * .75);
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(0, -r * 1.12); ctx.stroke();
    ctx.restore();
  };

  /* ---------- particles ---------- */
  P.dropNut = function (x, y, r, H, rain) {
    if (!rain && this.parts.nuts.length > 70) return;
    var nr = Math.max(this.mobile ? 9 : 8, r * .75);
    var gy = rain ? this.h * (.86 + Math.random() * .1) : this.state.base + (Math.random() * .03 - .005) * H;
    var tx = rain ? null : this.state.x, tb = rain ? null : this.state.base;
    if (this.reduced && !rain) { this.parts.nuts.push({ x: x + (Math.random() - .5) * H * .3, y: gy, vx: 0, vy: 0, rot: Math.random() * 3, vr: 0, r: nr, gy: gy, ground: true, life: 0, tx: tx, tb: tb }); return; }
    this.parts.nuts.push({ x: x, y: y, vx: (Math.random() - .5) * 40, vy: 0, rot: Math.random() * 3, vr: (Math.random() - .5) * 4, r: nr, gy: gy, ground: false, life: 0, bounces: 0, tx: tx, tb: tb });
  };
  P.spawnLeaf = function (lf, H, S) {
    var bucket = S.turn - lf.k2 < .3 ? C.yellow : S.turn - lf.k2 < .55 ? C.amber : C.brown;
    this.parts.leaves.push({ x: lf.x, y: lf.y, vx: (Math.random() - .5) * 20, vy: 18 + Math.random() * 20, rot: Math.random() * TAU, vr: (Math.random() - .5) * 3,
      c: bucket, s: .012 * H * lf.sz, ph: Math.random() * TAU, gy: this.state.base + Math.random() * .03 * H, life: 0, tx: this.state.x, tb: this.state.base });
  };
  P.rain = function (n) {
    for (var i = 0; i < n; i++) {
      var self = this;
      (function (k) { setTimeout(function () { self.dropNut(Math.random() * self.w * .9 + self.w * .05, -30, 20, self.h * .8, true); }, k * 110); })(i);
    }
  };

  P.updateParts = function (dt, t) {
    var g = 900, i, p, list;
    list = this.parts.nuts;
    for (i = list.length - 1; i >= 0; i--) {
      p = list[i]; p.life += dt;
      if (!p.ground) {
        p.vy += g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        if (p.y >= p.gy) { p.y = p.gy; if (Math.abs(p.vy) > 140 && p.bounces < 3) { p.vy *= -.32; p.vx = p.vx * .6 + (Math.random() - .5) * 60; p.vr *= .6; p.bounces++; } else { p.ground = true; p.life = 0; } }
      } else if (p.life > 8) list.splice(i, 1);
    }
    list = this.parts.leaves;
    for (i = list.length - 1; i >= 0; i--) {
      p = list[i]; p.life += dt;
      if (p.y < p.gy) { p.vx += Math.sin(t * 2.2 + p.ph) * 40 * dt - p.vx * .5 * dt; p.x += (p.vx + this.state.wind * 12) * dt; p.y += p.vy * dt; p.rot += p.vr * dt; }
      else if (p.life > 12) list.splice(i, 1);
    }
    list = this.parts.twigs;
    for (i = list.length - 1; i >= 0; i--) { p = list[i]; p.life += dt; if (p.y < p.gy) { p.vy += g * .5 * dt; p.y += p.vy * dt; p.x += p.vx * dt; p.rot += p.vr * dt; } else if (p.life > 5) list.splice(i, 1); }
    list = this.parts.shells;
    for (i = list.length - 1; i >= 0; i--) { p = list[i]; p.life += dt; p.vy += g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; if (p.life > 1.2) list.splice(i, 1); }
  };

  P.off = function (p) { return p.tx == null ? [0, 0, 1] : [this.state.x - p.tx, this.state.base - p.tb, this.state.alpha]; };
  P.drawParts = function (ctx, t, dusk) {
    var i, p, a, o;
    var lv = this.parts.leaves;
    for (i = 0; i < lv.length; i++) {
      p = lv[i]; o = this.off(p); a = (p.y >= p.gy ? clamp(1 - (p.life - 9) / 3, 0, 1) : 1) * o[2]; if (a <= .01) continue;
      ctx.fillStyle = rgb(mix(p.c, C.barkDusk, dusk * .6), a); ctx.beginPath(); ctx.ellipse(p.x + o[0], p.y + o[1], p.s, p.s * .38, p.rot, 0, TAU); ctx.fill();
    }
    var tw = this.parts.twigs; ctx.strokeStyle = rgb(C.bark); ctx.lineCap = "round";
    for (i = 0; i < tw.length; i++) { p = tw[i]; o = this.off(p); a = clamp(1 - (p.life - 3.5) / 1.5, 0, 1) * o[2]; ctx.globalAlpha = a; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.x + o[0] - Math.cos(p.rot) * p.l, p.y + o[1] - Math.sin(p.rot) * p.l); ctx.lineTo(p.x + o[0] + Math.cos(p.rot) * p.l, p.y + o[1] + Math.sin(p.rot) * p.l); ctx.stroke(); }
    ctx.globalAlpha = 1;
    var nu = this.parts.nuts;
    for (i = 0; i < nu.length; i++) { p = nu[i]; o = this.off(p); a = (p.ground ? clamp(1 - (p.life - 7) / 1, 0, 1) : 1) * o[2]; if (a <= .01) continue; ctx.globalAlpha = a; this.nutShape(ctx, p.x + o[0], p.y + o[1] - p.r * (p.ground ? .7 : 0), p.r, p.ground ? 1.45 : p.rot, dusk); }
    ctx.globalAlpha = 1;
    var sh = this.parts.shells;
    for (i = 0; i < sh.length; i++) { p = sh[i]; ctx.globalAlpha = clamp(1 - p.life / 1.2, 0, 1); ctx.fillStyle = rgb(p.c); ctx.beginPath(); ctx.ellipse(p.x, p.y, p.s, p.s * .55, p.rot, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
  };

  P.drawGround = function (ctx, bx, by, H, S, t, a, dusk) {
    if (a <= 0) return;
    var wind = this.state.wind * (this.reduced ? .15 : 1);
    // canopy shadow
    var sh = .05 + .1 * S.leaf;
    var grd = ctx.createRadialGradient(bx, by, 0, bx, by, H * .6);
    grd.addColorStop(0, "rgba(30,36,22," + (sh * a) + ")"); grd.addColorStop(1, "rgba(30,36,22,0)");
    ctx.save(); ctx.translate(bx, by); ctx.scale(1, .09); ctx.translate(-bx, -by);
    ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(bx, by, H * .6, 0, TAU); ctx.fill(); ctx.restore();
    // grass
    var gc = mix(mix([110, 138, 64], C.frost, S.frost * .55), C.barkDusk, dusk * .7);
    ctx.strokeStyle = rgb(gc, .7 * a); ctx.lineWidth = 1; ctx.beginPath();
    for (var i = 0; i < this.grass.length; i++) {
      var g = this.grass[i], x = bx + g.x * H, h = g.h * H, sw = Math.sin(t * 1.8 + g.ph) * .35 * wind + g.lean;
      ctx.moveTo(x, by + 2); ctx.quadraticCurveTo(x + sw * h * .3, by - h * .5, x + sw * h, by - h);
    }
    ctx.stroke();
    if (S.frost > .05) {
      ctx.fillStyle = "rgba(255,255,255," + (.85 * S.frost * a) + ")";
      for (var f = 0; f < this.frostPts.length; f++) {
        var fp = this.frostPts[f], tw = .5 + .5 * Math.sin(t * 2.5 + fp.ph);
        if (tw < .3) continue;
        var fx = bx + fp.x * H, fy = by - fp.y * H * .2, s = 1.2 + tw * 1.6;
        ctx.fillRect(fx - s / 2, fy - .4, s, .8); ctx.fillRect(fx - .4, fy - s / 2, .8, s);
      }
    }
  };

  P.drawBees = function (ctx, bx, by, H, S, t) {
    if (S.bees <= 0 || this.reduced || this.state.G < .95) return;
    var cx = bx, cy = by - H * .62;
    for (var i = 0; i < this.bees.length; i++) {
      var b = this.bees[i], a = b.a + t * b.sp;
      var x = cx + Math.cos(a) * b.rx * H + Math.sin(t * 7 + b.ph) * 4, y = cy + Math.sin(a * 1.3) * b.ry * H + Math.cos(t * 9 + b.ph) * 3;
      ctx.globalAlpha = S.bees;
      ctx.fillStyle = "rgba(255,255,255,.75)"; var wv = Math.sin(t * 60 + i) * 2;
      ctx.beginPath(); ctx.ellipse(x - 1, y - 3 - wv * .3, 2.6, 1.4, -.5, 0, TAU); ctx.ellipse(x + 1.5, y - 3 + wv * .3, 2.6, 1.4, .5, 0, TAU); ctx.fill();
      ctx.fillStyle = "#e0a92c"; ctx.beginPath(); ctx.ellipse(x, y, 3.6, 2.4, Math.cos(a) > 0 ? .2 : -.2, 0, TAU); ctx.fill();
      ctx.fillStyle = "#2a2116"; ctx.fillRect(x - .6, y - 2.2, 1.3, 4.4);
      ctx.globalAlpha = 1;
    }
  };

  P.drawBird = function (ctx, t, dt) {
    var b = this.bird; if (!b) return;
    b.t += dt; var T = b.t, x, y, flip = 1;
    var hx = this.state.x + this.state.H * .36, hy = this.state.base - this.state.H * .58;
    if (T < 1.4) { var k = smooth(0, 1.4, T); x = lerp(this.w + 40, hx, k); y = lerp(hy - 140, hy, k) + Math.sin(T * 6) * 8; flip = -1; }
    else if (T < 4.6) { x = hx + Math.sin(T * 2.2) * 6; y = hy + Math.sin(T * 3.4) * 5; flip = -1; }
    else if (T < 6) { var k2 = smooth(4.6, 6, T); x = lerp(hx, -60, k2 * k2); y = lerp(hy, hy - 260, k2); flip = -1; }
    else { this.bird = null; return; }
    ctx.save(); ctx.translate(x, y); ctx.scale(flip * 1.25, 1.25);
    var wing = Math.sin(t * 95);
    ctx.fillStyle = "rgba(180,220,210,.45)";
    ctx.beginPath(); ctx.ellipse(-2, -6, 13, 4, -1.2 + wing * .9, 0, TAU); ctx.fill();
    var body = ctx.createLinearGradient(-10, -6, 10, 6); body.addColorStop(0, "#1d7d63"); body.addColorStop(1, "#48b08c");
    ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(0, 0, 10, 5, -.25, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(8, -3, 4, 0, TAU); ctx.fill();
    ctx.fillStyle = "#b8324a"; ctx.beginPath(); ctx.arc(9, 0, 2.2, 0, TAU); ctx.fill();
    ctx.strokeStyle = "#222"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(11.5, -3.5); ctx.lineTo(24, -4.5); ctx.stroke();
    ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(9.5, -4, .9, 0, TAU); ctx.fill();
    ctx.fillStyle = "#145a48"; ctx.beginPath(); ctx.moveTo(-9, 1); ctx.lineTo(-18, 5); ctx.lineTo(-17, -1); ctx.fill();
    ctx.restore();
  };

  /* ---------- orchard (the end of the site) ---------- */
  P.renderSprite = function (S, t, dusk) {
    var sw = 260, shh = 300, dpr = this.dpr;
    if (this.sprite.width !== sw * dpr) { this.sprite.width = sw * dpr; this.sprite.height = shh * dpr; }
    var c = this.sprite.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, sw, shh);
    var keep = this.ptr.e; this.ptr.e = 0;
    this.drawTree(c, sw / 2, shh - 6, shh * .86, 1, S, t, false, dusk);
    this.ptr.e = keep;
  };

  P.drawOrchard = function (ctx, S, t, dusk, mainSlot) {
    var O = this.state.O, w = this.w, h = this.h;
    var horizon = h * .5, front = h * .93, R = this.mobile ? 6 : 7, Hf = Math.min(h * .44, w * .55);
    // field
    var fg = ctx.createLinearGradient(0, horizon, 0, h);
    fg.addColorStop(0, "rgba(54,62,58," + (.0 * O) + ")"); fg.addColorStop(.25, "rgba(40,48,38," + (.55 * O) + ")"); fg.addColorStop(1, "rgba(24,30,22," + (.9 * O) + ")");
    ctx.fillStyle = fg; ctx.fillRect(0, horizon, w, h - horizon);
    ctx.strokeStyle = "rgba(200,190,150," + (.07 * O) + ")"; ctx.lineWidth = 1; ctx.beginPath();
    for (var l = -12; l <= 12; l++) { ctx.moveTo(w / 2 + l * 6, horizon); ctx.lineTo(w / 2 + l * w * .22, h); }
    ctx.stroke();
    var sp = this.sprite, aspect = sp.width / sp.height;
    for (var r = 0; r < R; r++) {
      var z = r / (R - 1), zz = Math.pow(z, 1.7), y = lerp(horizon + 6, front, zz), sc = .1 + .9 * zz, th = Hf * sc, tw = th * aspect, gap = th * .78;
      var off = (r % 2) * gap * .5, n = Math.ceil((w / 2) / gap) + 2;
      for (var c = -n; c <= n; c++) {
        var x = w / 2 + c * gap + off;
        if (r === R - 1 && c === 0 && mainSlot) { ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); ctx.globalAlpha = 1; mainSlot(x, y, th); continue; }
        var dly = Math.abs(c) * .05 + (R - 1 - r) * .09;
        var a = clamp((O * 1.9 - dly) / .45, 0, 1); if (a <= 0) continue;
        var skew = Math.sin(t * 1.1 + c * .7 + r) * .025 * (this.reduced ? .2 : 1);
        ctx.globalAlpha = a * (.55 + .45 * z);
        ctx.setTransform(this.dpr, 0, skew * this.dpr, this.dpr, x * this.dpr, y * this.dpr);
        ctx.drawImage(sp, -tw / 2, -th * 294 / 300, tw, th);
      }
    }
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); ctx.globalAlpha = 1;
  };

  /* ---------- frame ---------- */
  P.frame = function (dt, t) {
    var st = this.state, ctx = this.ctx, S = this.season(st.s);
    this.time = t;
    // nothing to draw: clear once and rest
    var idle = st.alpha < .005 && st.O < .001 && !this.bird && !this.parts.nuts.length && !this.parts.leaves.length && !this.parts.shells.length;
    if (idle) { if (!this.cleared) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, this.cv.width, this.cv.height); this.cleared = true; } return; }
    this.cleared = false;
    this.ptr.e *= Math.pow(.25, dt);
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    this.updateParts(dt, t);
    if (st.alpha < .03) { var pl = this.parts; ["leaves", "twigs", "nuts"].forEach(function (k) { pl[k] = pl[k].filter(function (q) { return q.tx == null; }); }); }
    // winter pruning: a few cut twigs fall now and then
    if (S.prune && st.alpha > .5 && !this.reduced && Math.random() < dt * 1.1 && this.parts.twigs.length < 12) {
      var nn = this.nodes[(this.nodes.length * (.4 + Math.random() * .6)) | 0];
      this.parts.twigs.push({ x: nn.ex, y: nn.ey, vx: (Math.random() - .5) * 30, vy: 0, rot: Math.random() * 3, vr: (Math.random() - .5) * 6, l: 5 + Math.random() * 6, gy: st.base + Math.random() * 10, life: 0, tx: st.x, tb: st.base });
    }
    var self = this, drawn = false;
    if (st.O > .001) {
      if (this.spriteN++ % 4 === 0) this.renderSprite(S, t, st.dusk);
      this.drawOrchard(ctx, S, t, st.dusk, function (x, y, th) {
        // the main tree travels into the orchard's front row
        var k = smooth(0, 1, st.O);
        var bx = lerp(st.x, x, k), by = lerp(st.base, y, k), H = lerp(st.H, th * .86, k);
        ctx.globalAlpha = st.alpha; self.drawTree(ctx, bx, by, H, st.G, S, t, true, st.dusk); ctx.globalAlpha = 1; drawn = true;
      });
    }
    if (!drawn && st.alpha > .005) {
      ctx.globalAlpha = st.alpha;
      var sx = st.sx || 1; if (sx !== 1) { ctx.translate(st.x, 0); ctx.scale(sx, 1); ctx.translate(-st.x, 0); }
      this.drawGround(ctx, st.x, st.base, st.H, S, t, smooth(0, .3, st.G + st.seed * .3), st.dusk);
      if (st.G < .12) this.drawSeed(ctx, st, t);
      this.drawTree(ctx, st.x, st.base, st.H, st.G, S, t, true, st.dusk);
      this.drawBees(ctx, st.x, st.base, st.H, S, t);
      ctx.globalAlpha = 1; ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
    this.drawParts(ctx, t, st.dusk);
    this.drawBird(ctx, t, dt);
  };

  P.drawSeed = function (ctx, st, t) {
    var k = st.seed, r = Math.max(8, st.H * .016);
    var y = k < .55 ? lerp(st.base - st.H * .45, st.base - r * .7, Math.pow(k / .55, 2)) : st.base - r * .7;
    var split = smooth(.6, 1, k) * (1 - smooth(.02, .12, st.G));
    var a = 1 - smooth(.04, .12, st.G);
    if (a <= 0 || k <= 0) return;
    ctx.globalAlpha = a * st.alpha;
    this.nutShape(ctx, st.x - split * r * .7, y, r, -split * .6, 0);
    if (split > 0) this.nutShape(ctx, st.x + split * r * .7, y, r, split * .6, 0);
    ctx.globalAlpha = st.alpha;
  };

  /* ---------- interaction ---------- */
  P.nutAt = function (x, y) {
    var nu = this.parts.nuts, best = -1, bd = this.mobile ? 46 : 34;
    for (var i = 0; i < nu.length; i++) { var o = this.off(nu[i]); if (o[2] < .3) continue; var dx = nu[i].x + o[0] - x, dy = nu[i].y + o[1] - y, d = Math.sqrt(dx * dx + dy * dy); if (d < bd) { bd = d; best = i; } }
    return best;
  };
  P.catchAt = function (x, y) {
    var i = this.nutAt(x, y); if (i < 0) return false;
    var p = this.parts.nuts.splice(i, 1)[0], po = this.off(p); p = { x: p.x + po[0], y: p.y + po[1], r: p.r };
    for (var k = 0; k < 9; k++) {
      var a = Math.random() * TAU, sp = 140 + Math.random() * 220;
      this.parts.shells.push({ x: p.x, y: p.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 220, rot: Math.random() * 3, vr: (Math.random() - .5) * 20, s: p.r * (k < 2 ? .55 : .3), c: k < 2 ? [196, 150, 96] : C.nutDark, life: 0 });
    }
    this.caught++; return true;
  };
  P.trunkAt = function (x, y) {
    var n = this.nodes[0]; if (!n || n.g < 1 || this.state.alpha < .5 || this.state.O > .1) return false;
    var dx = n.ex - n.sx, dy = n.ey - n.sy, L2 = dx * dx + dy * dy, u = clamp(((x - n.sx) * dx + (y - n.sy) * dy) / L2, 0, 1);
    var qx = n.sx + u * dx - x, qy = n.sy + u * dy - y;
    return Math.sqrt(qx * qx + qy * qy) < Math.max(16, n.w * this.state.H);
  };
  P.callBird = function () { if (!this.bird) this.bird = { t: 0 }; };

  window.EPTree = Tree;
})();
