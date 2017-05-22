window.AudioContext = window.AudioContext || window.webkitAudioContext || null, window.OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext || null,
  function (a) {
    var d, e, f, b = function (a) {
        return "[object Function]" === Object.prototype.toString.call(a) || "[object AudioContextConstructor]" === Object.prototype.toString.call(a)
      },
      c = [
        ["createGainNode", "createGain"],
        ["createDelayNode", "createDelay"],
        ["createJavaScriptNode", "createScriptProcessor"]
      ];
    b(a) && (e = new a, e.destination && e.sampleRate && (d = a.prototype, f = Object.getPrototypeOf(e.createBufferSource()), b(f.start) || b(f.noteOn) && (f.start = function (a, b, c) {
      switch (arguments.length) {
      case 0:
        throw new Error("Not enough arguments.");
      case 1:
        this.noteOn(a);
        break;
      case 2:
        if (!this.buffer) throw new Error("Missing AudioBuffer");
        this.noteGrainOn(a, b, this.buffer.duration - b);
        break;
      case 3:
        this.noteGrainOn(a, b, c)
      }
    }), b(f.noteOn) || (f.noteOn = f.start), b(f.noteGrainOn) || (f.noteGrainOn = f.start), b(f.stop) || (f.stop = f.noteOff), b(f.noteOff) || (f.noteOff = f.stop), c.forEach(function (a) {
      for (var c, d; a.length;) c = a.pop(), b(this[c]) ? this[a.pop()] = this[c] : (d = a.pop(), this[c] = this[d])
    }, d)))
  }(window.AudioContext);