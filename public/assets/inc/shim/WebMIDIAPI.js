! function (a) {
  "use strict";

  function j() {}

  function k() {
    this.inputInUse = !1, this.outputInUse = !1;
    var a = document.createElement("object");
    a.id = "_Jazz" + Math.random() + "ie", a.classid = "CLSID:1ACE1618-1C7D-4561-AEE1-34842AA85E90", this.activeX = a;
    var b = document.createElement("object");
    b.id = "_Jazz" + Math.random(), b.type = "audio/x-jazz", a.appendChild(b), this.objRef = b;
    var c = document.createElement("p");
    c.appendChild(document.createTextNode("This page requires the "));
    var d = document.createElement("a");
    d.appendChild(document.createTextNode("Jazz plugin")), d.href = "http://jazz-soft.net/", c.appendChild(d), c.appendChild(document.createTextNode(".")), b.appendChild(c);
    var e = document.getElementById("MIDIPlugin");
    if (!e) {
      var e = document.createElement("div");
      e.id = "MIDIPlugin", e.style.position = "absolute", e.style.visibility = "hidden", e.style.left = "-9999px", e.style.top = "-9999px", document.body.appendChild(e)
    }
    e.appendChild(a), this.objRef.isJazz ? this._Jazz = this.objRef : this.activeX.isJazz ? this._Jazz = this.activeX : this._Jazz = null, this._Jazz && (this._Jazz._jazzTimeZero = this._Jazz.Time(), this._Jazz._perfTimeZero = window.performance.now())
  }

  function l() {
    this._promise && this._promise.fail({
      code: 1
    })
  }

  function m() {
    this.jazz.MidiOutLong(this.data)
  }
  var c, d, e, g, h, i;
  j.prototype.then = function (a, b) {
    this.accept = a, this.reject = b
  }, j.prototype.succeed = function (a) {
    this.accept && this.accept(a)
  }, j.prototype.fail = function (a) {
    this.reject && this.reject(a)
  }, c = function () {
    var b = new d;
    return b._promise
  }, d = function () {
    this._jazzInstances = new Array, this._jazzInstances.push(new k), this._promise = new j, this._jazzInstances[0]._Jazz ? (this._Jazz = this._jazzInstances[0]._Jazz, window.setTimeout(e.bind(this), 3)) : window.setTimeout(l.bind(this), 3)
  }, e = function () {
    this._promise && this._promise.succeed(this)
  }, d.prototype.inputs = function () {
    if (!this._Jazz) return null;
    for (var a = this._Jazz.MidiInList(), b = new Array(a.length), c = 0; c < a.length; c++) b[c] = new g(this, a[c], c);
    return b
  }, d.prototype.outputs = function () {
    if (!this._Jazz) return null;
    for (var a = this._Jazz.MidiOutList(), b = new Array(a.length), c = 0; c < a.length; c++) b[c] = new h(this, a[c], c);
    return b
  }, g = function (b, c, d) {
    this._listeners = [], this._midiAccess = b, this._index = d, this._inLongSysexMessage = !1, this._sysexBuffer = new Uint8Array, this.id = "" + d + "." + c, this.manufacturer = "", this.name = c, this.type = "input", this.version = "", this.onmidimessage = null;
    for (var e = null, f = 0; f < b._jazzInstances.length && !e; f++) b._jazzInstances[f].inputInUse || (e = b._jazzInstances[f]);
    e || (e = new k, b._jazzInstances.push(e)), e.inputInUse = !0, this._jazzInstance = e._Jazz, this._input = this._jazzInstance.MidiInOpen(this._index, i.bind(this))
  }, g.prototype.addEventListener = function (a, b, c) {
    if ("midimessage" === a) {
      for (var d = 0; d < this._listeners.length; d++)
        if (this._listeners[d] == b) return;
      this._listeners.push(b)
    }
  }, g.prototype.removeEventListener = function (a, b, c) {
    if ("midimessage" === a)
      for (var d = 0; d < this._listeners.length; d++)
        if (this._listeners[d] == b) return void this._listeners.splice(d, 1)
  }, g.prototype.preventDefault = function () {
    this._pvtDef = !0
  }, g.prototype.dispatchEvent = function (a) {
    this._pvtDef = !1;
    for (var b = 0; b < this._listeners.length; b++) this._listeners[b].handleEvent ? this._listeners[b].handleEvent.bind(this)(a) : this._listeners[b].bind(this)(a);
    return this.onmidimessage && this.onmidimessage(a), this._pvtDef
  }, g.prototype.appendToSysexBuffer = function (a) {
    var b = this._sysexBuffer.length,
      c = new Uint8Array(b + a.length);
    c.set(this._sysexBuffer), c.set(a, b), this._sysexBuffer = c
  }, g.prototype.bufferLongSysex = function (a, b) {
    for (var c = b; c < a.length;) {
      if (247 == a[c]) return c++, this.appendToSysexBuffer(a.slice(b, c)), c;
      c++
    }
    return this.appendToSysexBuffer(a.slice(b, c)), this._inLongSysexMessage = !0, c
  }, i = function (b, c) {
    var e, d = 0,
      g = !1;
    for (e = 0; e < c.length; e += d) {
      if (this._inLongSysexMessage) {
        if (e = this.bufferLongSysex(c, e), 247 != c[e - 1]) return;
        g = !0
      } else switch (g = !1, 240 & c[e]) {
      case 128:
      case 144:
      case 160:
      case 176:
      case 224:
        d = 3;
        break;
      case 192:
      case 208:
        d = 2;
        break;
      case 240:
        switch (c[e]) {
        case 240:
          if (e = this.bufferLongSysex(c, e), 247 != c[e - 1]) return;
          g = !0;
          break;
        case 241:
        case 243:
          d = 2;
          break;
        case 242:
          d = 3;
          break;
        default:
          d = 1
        }
      }
      var h = document.createEvent("Event");
      h.initEvent("midimessage", !1, !1), h.receivedTime = parseFloat(b.toString()) + this._jazzInstance._perfTimeZero, g || this._inLongSysexMessage ? (h.data = new Uint8Array(this._sysexBuffer), this._sysexBuffer = new Uint8Array(0), this._inLongSysexMessage = !1) : h.data = new Uint8Array(c.slice(e, d + e)), this.dispatchEvent(h)
    }
  }, h = function (b, c, d) {
    this._listeners = [], this._midiAccess = b, this._index = d, this.id = "" + d + "." + c, this.manufacturer = "", this.name = c, this.type = "output", this.version = "";
    for (var e = null, f = 0; f < b._jazzInstances.length && !e; f++) b._jazzInstances[f].outputInUse || (e = b._jazzInstances[f]);
    e || (e = new k, b._jazzInstances.push(e)), e.outputInUse = !0, this._jazzInstance = e._Jazz, this._jazzInstance.MidiOutOpen(this.name)
  }, h.prototype.send = function (a, b) {
    var c = 0;
    if (0 === a.length) return !1;
    if (b && (c = Math.floor(b - window.performance.now())), b && c > 1) {
      var d = new Object;
      d.jazz = this._jazzInstance, d.data = a, window.setTimeout(m.bind(d), c)
    } else this._jazzInstance.MidiOutLong(a);
    return !0
  }, window.navigator.requestMIDIAccess || (window.navigator.requestMIDIAccess = c)
}(window),
function (a) {
  function d() {
    for (var b = ["moz", "webkit", "o", "ms"], c = b.length, d = {
        value: function (a) {
          return function () {
            return Date.now() - a
          }
        }(Date.now())
      }; c >= 0; c--)
      if (b[c] + "Now" in a.performance) return d.value = function (b) {
        return function () {
          a.performance[b]()
        }
      }(b[c] + "Now"), d;
    return "timing" in a.performance && "connectStart" in a.performance.timing && (d.value = function (a) {
      return function () {
        Date.now() - a
      }
    }(a.performance.timing.connectStart)), d
  }
  var c, b = {};
  "performance" in a && "now" in a.performance || ("performance" in a || Object.defineProperty(a, "performance", {
    get: function () {
      return b
    }
  }), c = d(), Object.defineProperty(a.performance, "now", c))
}(window);