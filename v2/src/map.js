/* Stylised map, drawn in code. Coastlines are simplified by hand (not survey data). */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg", K = Math.cos(-25 * Math.PI / 180);
  function X(lon) { return (lon + 85) * K; }
  function Y(lat) { return -(lat - 14); }
  function pts(arr) {
    // closed Catmull-Rom spline through the points: a hand-drawn, smooth coastline
    var P = arr.map(function (a) { return [X(a[0]), Y(a[1])]; }), n = P.length, d = "M" + P[0][0].toFixed(3) + " " + P[0][1].toFixed(3);
    for (var i = 0; i < n; i++) {
      var p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
      d += "C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(3) + " " + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(3) + " " + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(3) + " " + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(3) + " " + p2[0].toFixed(3) + " " + p2[1].toFixed(3);
    }
    return d + "Z";
  }
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

  var SA = [[-77.4,8.7],[-75.5,10.5],[-73.2,11.3],[-71.3,12.4],[-71.6,10.8],[-70,10.6],[-68,10.5],[-66,10.6],[-64.5,10.4],[-61.9,10.7],[-61,9.6],[-60.4,8.4],[-58.6,7.2],[-57.2,6],[-55,6],[-53.5,5.6],[-52,4.6],[-51.2,4],[-50.5,1.9],[-49.9,1.1],[-48.5,-1.2],[-47,-.7],[-44.6,-2.4],[-42,-2.8],[-40,-2.8],[-38.5,-3.7],[-37.2,-4.8],[-35.4,-5.3],[-34.8,-7.2],[-35.1,-9],[-36.4,-10.6],[-37.6,-12.2],[-38.5,-13],[-39,-15.6],[-39.2,-17.8],[-40.3,-20.3],[-41,-21.6],[-41.9,-22.9],[-43.2,-23],[-44.6,-23.3],[-46.3,-24],[-47.9,-25.3],[-48.6,-26.6],[-48.7,-28.4],[-49.8,-29.4],[-50.6,-30.6],[-51.6,-31.8],[-52.4,-32.6],[-53.4,-33.7],[-54.2,-34.6],[-55.2,-34.9],[-56.2,-34.9],[-57.4,-34.5],[-58.4,-34.6],[-57.3,-35.6],[-56.7,-36.5],[-57.6,-38.1],[-59.5,-38.7],[-62.3,-38.8],[-62.1,-40.6],[-63.8,-41.2],[-65,-41],[-64.3,-42.5],[-65.2,-44.4],[-66.4,-45.1],[-67.6,-46.4],[-66.1,-47.8],[-67.7,-49.3],[-68.4,-50.1],[-69.2,-51.6],[-68.4,-52.4],[-68.6,-53.6],[-67.2,-54.6],[-65.3,-55],[-66.8,-55.2],[-68.3,-55.5],[-70,-55.2],[-71.6,-54.2],[-73.5,-52.8],[-74.8,-51],[-75.5,-48.6],[-74.6,-46.8],[-74.3,-45],[-73.8,-43.4],[-73.6,-41.6],[-73.6,-39.6],[-73.5,-37.4],[-72.6,-35.5],[-71.7,-33],[-71.5,-30.4],[-71.3,-28.2],[-70.6,-25.4],[-70.4,-23.6],[-70.2,-21.4],[-70.3,-18.5],[-71.4,-17.6],[-72.8,-16.6],[-74.6,-15.6],[-76.2,-13.6],[-77.2,-12],[-78.2,-10.2],[-79.2,-8],[-80.6,-6.6],[-81.2,-5.2],[-81.3,-4.3],[-80.3,-3.4],[-80.9,-2.2],[-80.4,-.6],[-80.1,.8],[-78.9,1.6],[-77.8,3.4],[-77.3,4.8],[-77.4,6.5],[-77.9,7.5]];
  var RS = [[-57.6,-30.2],[-57.1,-29.8],[-56.4,-29.1],[-55.7,-28.4],[-55,-27.8],[-54.3,-27.4],[-53.8,-27.15],[-53.1,-27.2],[-52.3,-27.4],[-51.6,-27.7],[-50.9,-28.1],[-50.3,-28.6],[-49.8,-29.3],[-50.1,-29.9],[-50.6,-30.6],[-51.6,-31.8],[-52.4,-32.6],[-53.4,-33.7],[-53.5,-33.2],[-53.2,-32.6],[-53.7,-32.2],[-54.6,-31.6],[-55.5,-30.9],[-56,-31],[-56.8,-30.4]];
  var LAGOA = [[-51.15,-30.15],[-50.8,-30.55],[-50.95,-31.05],[-51.45,-31.5],[-51.95,-31.95],[-52.2,-32.1],[-52.0,-31.65],[-51.65,-31.15],[-51.35,-30.6]];
  var SCS = [-52.43, -29.72], POA = [-51.23, -30.03], FARM = [-52.36, -29.56];

  var STAGES = [
    { c: [-60, -21], span: 78 },
    { c: [-53.4, -30.3], span: 12.5 },
    { c: [-52.4, -29.63], span: 1.1 },
    { c: [-52.36, -29.56], span: .1 }
  ];

  function EPMap(svg) {
    this.svg = svg; this.labels = [];
    var g = el("g", {}, svg); this.g = g;
    // graticule
    var grat = "";
    for (var lon = -80; lon <= -30; lon += 10) grat += "M" + X(lon) + " " + Y(15) + "V" + Y(-60);
    for (var lat = 10; lat >= -60; lat -= 10) grat += "M" + X(-90) + " " + Y(lat) + "H" + X(-25);
    el("path", { d: grat, "class": "grat" }, g);
    el("path", { d: "M" + X(-95) + " " + Y(-23.44) + "H" + X(-20), "class": "tropic" }, g);
    el("path", { d: pts(SA), "class": "continent" }, g);
    el("path", { d: pts(RS), "class": "state" }, g);
    el("path", { d: pts(LAGOA), "class": "lagoon" }, g);
    // hills: stylised contour rings around the farm (decorative)
    var cg = el("g", { "class": "contours" }, g);
    for (var i = 1; i <= 9; i++) {
      var r = .012 * i * i * .35 + .01 * i, d = "";
      for (var a = 0; a <= 64; a++) { var t = a / 64 * Math.PI * 2, w = 1 + .18 * Math.sin(t * 3 + i) + .1 * Math.sin(t * 5 - i * .7); d += (a ? "L" : "M") + (X(FARM[0]) + Math.cos(t) * r * w * 1.25).toFixed(4) + " " + (Y(FARM[1]) + Math.sin(t) * r * w).toFixed(4); }
      el("path", { d: d + "Z", "class": "contour" }, cg);
    }
    this.contours = cg;
    // cities
    this.city(SCS, "Santa Cruz do Sul", 1);
    this.city(POA, "Porto Alegre", 1);
    this.text(X(SCS[0]) + .02, Y(SCS[1]) + .01, "Santa Cruz do Sul", .02, 2);
    var pin = el("g", { "class": "pin" }, g);
    this.halo = el("circle", { "class": "halo", cx: X(FARM[0]), cy: Y(FARM[1]), r: .2 }, pin);
    this.core = el("circle", { "class": "core", cx: X(FARM[0]), cy: Y(FARM[1]), r: .2 }, pin);
    this.tropicLabel = this.text(X(-95), Y(-23.44) - .8, "", 1.25, 0, "tropic");
    this.stateLabel = this.text(X(-56.4), Y(-28.7), "Rio Grande do Sul", .33, 1);
    this.oceanLabel = this.text(X(-49.5), Y(-33.2), "", .28, 1, "ocean");
    this.oceanLabel0 = this.text(X(-38), Y(-36), "", 1.5, 0, "ocean");
    this.farmLabel = this.text(X(FARM[0]) + .025, Y(FARM[1]) - .025, "Monte Alverne", .024, 2);
    this.approxLabel = this.text(X(FARM[0]) + .025, Y(FARM[1]) + .012, "", .009, 3, "approx");
    this.g = g;
    this.set(0);
  }
  var P = EPMap.prototype;
  P.city = function (ll, name, stage) {
    (this.cities = this.cities || []).push(el("circle", { "class": "city", cx: X(ll[0]), cy: Y(ll[1]), r: .045 }, this.g));
    this.text(X(ll[0]) + .1, Y(ll[1]) + .2, name, .17, stage);
  };
  P.text = function (x, y, str, size, stage, key) {
    // Chrome will not draw sub-pixel font sizes inside a zoomed viewBox: draw at 10 and scale
    var t = el("text", { x: 0, y: 0, "font-size": 10, transform: "translate(" + x + " " + y + ") scale(" + (size / 10) + ")" }, this.g); t.textContent = str;
    this.labels.push({ el: t, stage: stage, key: key }); return t;
  };
  P.relabel = function (tr) {
    this.tropicLabel.textContent = tr("land.tropic");
    this.oceanLabel.textContent = this.oceanLabel0.textContent = tr("land.ocean");
    this.approxLabel.textContent = tr("land.approx").replace(/«|»/g, "").replace("VERIFY", "[VERIFY]");
  };
  P.layout = function () {
    var w = window.innerWidth, h = window.innerHeight;
    this.aspect = w / h; this.mobile = w < 820;
  };
  // p: 0..3 continuous
  P.set = function (p) {
    if (!this.aspect) this.layout();
    var i = Math.min(2, Math.floor(p)), f = p - i, e = f * f * (3 - 2 * f);
    if (p >= 3) { i = 2; e = 1; }
    var A = STAGES[i], B = STAGES[i + 1];
    var span = Math.exp(Math.log(A.span) + (Math.log(B.span) - Math.log(A.span)) * e);
    // move the centre in "zoom space" so the target stays put while zooming in
    var k = (A.span - span) / (A.span - B.span || 1);
    var cx = A.c[0] + (B.c[0] - A.c[0]) * k, cy = A.c[1] + (B.c[1] - A.c[1]) * k;
    var hh = span, ww = span * this.aspect;
    if (this.mobile) { ww = span * .9; hh = ww / this.aspect; }
    var x = X(cx), y = Y(cy);
    if (this.mobile) y += hh * .16; else x += ww * .17;
    this.svg.setAttribute("viewBox", (x - ww / 2) + " " + (y - hh / 2) + " " + ww + " " + hh);
    // labels fade with their stage
    for (var l = 0; l < this.labels.length; l++) {
      var L = this.labels[l], d = Math.abs(p - L.stage), o = L.stage === 0 ? 1 - Math.min(1, p) : Math.max(0, 1 - d * 1.4);
      if (L.stage === 3) o = Math.max(0, Math.min(1, (p - 2.2) * 2)) * (1 - Math.max(0, (p - 2.85) * 6));
      L.el.style.opacity = o.toFixed(3);
    }
    var pr = span * .0055;
    for (var c = 0; c < this.cities.length; c++) this.cities[c].setAttribute("r", (span * .004).toFixed(4));
    this.core.setAttribute("r", pr); this.halo.setAttribute("r", pr * (2.2 + Math.sin(Date.now() / 300) * .6));
    this.contours.style.opacity = Math.max(0, Math.min(1, (p - 1.6) * 1.5)).toFixed(3);
  };
  window.EPMap = EPMap;
})();
