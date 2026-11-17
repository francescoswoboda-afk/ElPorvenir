/* Ambient sound, synthesised with the Web Audio API. No samples. Off by default. */
(function () {
  "use strict";
  function Sound() { this.ctx = null; this.on = false; this.season = 2; this.birdTimer = null; }
  var P = Sound.prototype;

  P.init = function () {
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    var c = this.ctx = new AC();
    this.master = c.createGain(); this.master.gain.value = 0; this.master.connect(c.destination);
    // pink-ish noise buffer
    var len = c.sampleRate * 4, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0), b0 = 0, b1 = 0, b2 = 0;
    for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; b0 = .99765 * b0 + w * .099046; b1 = .963 * b1 + w * .2965164; b2 = .57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * .1848) * .18; }
    this.noise = buf;
    // wind: noise -> bandpass swept by a slow LFO
    var src = c.createBufferSource(); src.buffer = buf; src.loop = true;
    var bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 520; bp.Q.value = .7;
    var wg = c.createGain(); wg.gain.value = .5;
    var lfo = c.createOscillator(); lfo.frequency.value = .07; var lg = c.createGain(); lg.gain.value = 260; lfo.connect(lg); lg.connect(bp.frequency);
    var lfo2 = c.createOscillator(); lfo2.frequency.value = .11; var lg2 = c.createGain(); lg2.gain.value = .22; lfo2.connect(lg2); lg2.connect(wg.gain);
    src.connect(bp); bp.connect(wg); wg.connect(this.master);
    // leaves: high, airy rustle
    var src2 = c.createBufferSource(); src2.buffer = buf; src2.loop = true; src2.playbackRate.value = 1.7;
    var hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 3200;
    var rg = c.createGain(); rg.gain.value = .0; this.rustle = rg;
    var lfo3 = c.createOscillator(); lfo3.frequency.value = .23; var lg3 = c.createGain(); lg3.gain.value = .05; lfo3.connect(lg3); lg3.connect(rg.gain);
    src2.connect(hp); hp.connect(rg); rg.connect(this.master);
    src.start(); src2.start(); lfo.start(); lfo2.start(); lfo3.start();
    this.wind = wg;
    return true;
  };

  P.toggle = function () {
    if (!this.ctx && !this.init()) return false;
    this.on = !this.on;
    var c = this.ctx, now = c.currentTime;
    if (c.state === "suspended") c.resume();
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(this.on ? .55 : 0, now, .6);
    var self = this;
    clearTimeout(this.birdTimer);
    if (this.on) (function loop() { self.birdTimer = setTimeout(function () { self.bird(); loop(); }, self.birdGap()); })();
    return this.on;
  };

  P.setSeason = function (s) {
    this.season = ((s % 4) + 4) % 4;
    if (!this.ctx || !this.on) return;
    var m = this.season, leafy = m > .9 && m < 3.8 ? 1 : 0;
    this.rustle.gain.setTargetAtTime(leafy * .09, this.ctx.currentTime, 1.5);
    this.wind.gain.setTargetAtTime(m < .8 || m > 3.6 ? .7 : .42, this.ctx.currentTime, 2);
  };

  P.birdGap = function () { var m = this.season; var busy = m > .8 && m < 2.6; return (busy ? 2500 : 7000) + Math.random() * (busy ? 4000 : 9000); };

  P.bird = function () {
    if (!this.on) return;
    var c = this.ctx, t = c.currentTime + .05, n = 2 + (Math.random() * 4 | 0), base = 2300 + Math.random() * 1600, pan = c.createStereoPanner ? c.createStereoPanner() : null;
    if (pan) { pan.pan.value = Math.random() * 1.6 - .8; pan.connect(this.master); }
    for (var i = 0; i < n; i++) {
      var o = c.createOscillator(), g = c.createGain(), st = t + i * (.09 + Math.random() * .06), du = .06 + Math.random() * .05;
      o.type = "sine"; o.frequency.setValueAtTime(base * (1 + Math.random() * .15), st);
      o.frequency.exponentialRampToValueAtTime(base * (1.35 + Math.random() * .4), st + du * .6);
      o.frequency.exponentialRampToValueAtTime(base * .9, st + du);
      g.gain.setValueAtTime(0, st); g.gain.linearRampToValueAtTime(.05, st + .01); g.gain.exponentialRampToValueAtTime(.0005, st + du);
      o.connect(g); g.connect(pan || this.master); o.start(st); o.stop(st + du + .02);
    }
  };

  P.crack = function () {
    if (!this.on) return;
    var c = this.ctx, t = c.currentTime;
    var s = c.createBufferSource(); s.buffer = this.noise;
    var bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 2400; bp.Q.value = 1.4;
    var g = c.createGain(); g.gain.setValueAtTime(1.4, t); g.gain.exponentialRampToValueAtTime(.001, t + .07);
    s.connect(bp); bp.connect(g); g.connect(this.master); s.start(t, Math.random() * 2, .1);
    var o = c.createOscillator(), og = c.createGain(); o.frequency.setValueAtTime(190, t); o.frequency.exponentialRampToValueAtTime(70, t + .09);
    og.gain.setValueAtTime(.4, t); og.gain.exponentialRampToValueAtTime(.001, t + .12); o.connect(og); og.connect(this.master); o.start(t); o.stop(t + .14);
    var s2 = c.createBufferSource(); s2.buffer = this.noise; var hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 5000;
    var g2 = c.createGain(); g2.gain.setValueAtTime(.5, t + .03); g2.gain.exponentialRampToValueAtTime(.001, t + .09);
    s2.connect(hp); hp.connect(g2); g2.connect(this.master); s2.start(t + .03, Math.random() * 2, .08);
  };

  P.chirpHello = function () { if (this.on) { this.bird(); var self = this; setTimeout(function () { self.bird(); }, 260); } };

  window.EPSound = Sound;
})();
