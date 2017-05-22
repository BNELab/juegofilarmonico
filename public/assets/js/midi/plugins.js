/*
  ----------------------------------------------------------------------
  AudioTag <audio> - OGG or MPEG Soundbank
  ----------------------------------------------------------------------
  http://dev.w3.org/html5/spec/Overview.html#the-audio-element
  ----------------------------------------------------------------------
*/

(function (root) {
  'use strict';

  window.Audio && (function () {
    var midi = root.AudioTag = {
      api: 'audiotag'
    };
    var noteToKey = {};
    var volume = 127; // floating point
    var buffer_nid = -1; // current channel
    var audioBuffers = []; // the audio channels
    var notesOn = []; // instrumentId + noteId that is currently playing in each 'channel', for routing noteOff/chordOff calls
    var notes = {}; // the piano keys
    for (var nid = 0; nid < 12; nid++) {
      audioBuffers[nid] = new Audio();
    }

    var playChannel = function (channel, note) {
      if (!root.channels[channel]) return;
      var instrument = root.channels[channel].instrument;
      var instrumentId = root.GM.byId[instrument].id;
      var note = notes[note];
      if (note) {
        var instrumentNoteId = instrumentId + '' + note.id;
        var nid = (buffer_nid + 1) % audioBuffers.length;
        var audio = audioBuffers[nid];
        notesOn[nid] = instrumentNoteId;
        if (!root.Soundfont[instrumentId]) {
          if (root.DEBUG) {
            console.log('404', instrumentId);
          }
          return;
        }
        audio.src = root.Soundfont[instrumentId][note.id];
        audio.volume = volume / 127;
        audio.play();
        buffer_nid = nid;
      }
    };

    var stopChannel = function (channel, note) {
      if (!root.channels[channel]) return;
      var instrument = root.channels[channel].instrument;
      var instrumentId = root.GM.byId[instrument].id;
      var note = notes[note];
      if (note) {
        var instrumentNoteId = instrumentId + '' + note.id;
        for (var i = 0, len = audioBuffers.length; i < len; i++) {
          var nid = (i + buffer_nid + 1) % len;
          var cId = notesOn[nid];
          if (cId && cId == instrumentNoteId) {
            audioBuffers[nid].pause();
            notesOn[nid] = null;
            return;
          }
        }
      }
    };

    midi.audioBuffers = audioBuffers;
    midi.send = function (data, delay) {};
    midi.setController = function (channel, type, value, delay) {};
    midi.setVolume = function (channel, n) {
      volume = n; //- should be channel specific volume
    };

    midi.programChange = function (channel, program) {
      root.channels[channel].instrument = program;
    };

    midi.pitchBend = function (channel, program, delay) {};

    midi.noteOn = function (channel, note, velocity, delay) {
      var id = noteToKey[note];
      if (!notes[id]) return;
      if (delay) {
        return setTimeout(function () {
          playChannel(channel, id);
        }, delay * 1000);
      } else {
        playChannel(channel, id);
      }
    };

    midi.noteOff = function (channel, note, delay) {
      //      var id = noteToKey[note];
      //      if (!notes[id]) return;
      //      if (delay) {
      //        return setTimeout(function() {
      //          stopChannel(channel, id);
      //        }, delay * 1000)
      //      } else {
      //        stopChannel(channel, id);
      //      }
    };

    midi.chordOn = function (channel, chord, velocity, delay) {
      for (var idx = 0; idx < chord.length; idx++) {
        var n = chord[idx];
        var id = noteToKey[n];
        if (!notes[id]) continue;
        if (delay) {
          return setTimeout(function () {
            playChannel(channel, id);
          }, delay * 1000);
        } else {
          playChannel(channel, id);
        }
      }
    };

    midi.chordOff = function (channel, chord, delay) {
      for (var idx = 0; idx < chord.length; idx++) {
        var n = chord[idx];
        var id = noteToKey[n];
        if (!notes[id]) continue;
        if (delay) {
          return setTimeout(function () {
            stopChannel(channel, id);
          }, delay * 1000);
        } else {
          stopChannel(channel, id);
        }
      }
    };

    midi.stopAllNotes = function () {
      for (var nid = 0, length = audioBuffers.length; nid < length; nid++) {
        audioBuffers[nid].pause();
      }
    };

    midi.connect = function (opts) {
      root.setDefaultPlugin(midi);
      ///
      for (var key in root.keyToNote) {
        noteToKey[root.keyToNote[key]] = key;
        notes[key] = {
          id: key
        };
      }
      ///
      opts.onsuccess && opts.onsuccess();
    };
  })();

})(MIDI);



/*
  ----------------------------------------------------------
  Web Audio API - OGG or MPEG Soundbank
  ----------------------------------------------------------
  http://webaudio.github.io/web-audio-api/
  ----------------------------------------------------------
*/

(function (root) {
  'use strict';

  window.AudioContext && (function () {
    var audioContext = null; // new AudioContext();
    var useStreamingBuffer = false; // !!audioContext.createMediaElementSource;
    var midi = root.WebAudio = {
      api: 'webaudio'
    };
    var ctx; // audio context
    var sources = {};
    var effects = {};
    var masterVolume = 127;
    var audioBuffers = {};
    ///
    midi.audioBuffers = audioBuffers;
    midi.send = function (data, delay) {};
    midi.setController = function (channelId, type, value, delay) {};

    midi.setVolume = function (channelId, volume, delay) {
      if (delay) {
        setTimeout(function () {
          masterVolume = volume;
        }, delay * 1000);
      } else {
        masterVolume = volume;
      }
    };

    midi.programChange = function (channelId, program, delay) {
      //      if (delay) {
      //        return setTimeout(function() {
      //          var channel = root.channels[channelId];
      //          channel.instrument = program;
      //        }, delay);
      //      } else {
      var channel = root.channels[channelId];
      channel.instrument = program;
      //      }
    };

    midi.pitchBend = function (channelId, program, delay) {
      //      if (delay) {
      //        setTimeout(function() {
      //          var channel = root.channels[channelId];
      //          channel.pitchBend = program;
      //        }, delay);
      //      } else {
      var channel = root.channels[channelId];
      channel.pitchBend = program;
      //      }
    };

    midi.noteOn = function (channelId, noteId, velocity, delay) {
      delay = delay || 0;

      /// check whether the note exists
      var channel = root.channels[channelId];
      var instrument = channel.instrument;
      var bufferId = instrument + '' + noteId;
      var buffer = audioBuffers[bufferId];
      if (!buffer) {
        //        console.log(MIDI.GM.byId[instrument].id, instrument, channelId);
        return;
      }

      /// convert relative delay to absolute delay
      if (delay < ctx.currentTime) {
        delay += ctx.currentTime;
      }

      /// create audio buffer
      if (useStreamingBuffer) {
        var source = ctx.createMediaElementSource(buffer);
      } else { // XMLHTTP buffer
        var source = ctx.createBufferSource();
        source.buffer = buffer;
      }

      /// add effects to buffer
      if (effects) {
        var chain = source;
        for (var key in effects) {
          chain.connect(effects[key].input);
          chain = effects[key];
        }
      }

      /// add gain + pitchShift
      var gain = (velocity / 127) * (masterVolume / 127) * 2 - 1;
      source.connect(ctx.destination);
      source.playbackRate.value = 1; // pitch shift
      source.gainNode = ctx.createGain(); // gain
      source.gainNode.connect(ctx.destination);
      source.gainNode.gain.value = Math.min(1.0, Math.max(-1.0, gain));
      source.connect(source.gainNode);
      ///
      if (useStreamingBuffer) {
        if (delay) {
          return setTimeout(function () {
            buffer.currentTime = 0;
            buffer.play()
          }, delay * 1000);
        } else {
          buffer.currentTime = 0;
          buffer.play()
        }
      } else {
        source.start(delay || 0);
      }
      ///
      sources[channelId + '' + noteId] = source;
      ///
      return source;
    };

    midi.noteOff = function (channelId, noteId, delay) {
      delay = delay || 0;

      /// check whether the note exists
      var channel = root.channels[channelId];
      var instrument = channel.instrument;
      var bufferId = instrument + '' + noteId;
      var buffer = audioBuffers[bufferId];
      if (buffer) {
        if (delay < ctx.currentTime) {
          delay += ctx.currentTime;
        }
        ///
        var source = sources[channelId + '' + noteId];
        if (source) {
          if (source.gainNode) {
            // @Miranet: 'the values of 0.2 and 0.3 could of course be used as
            // a 'release' parameter for ADSR like time settings.'
            // add { 'metadata': { release: 0.3 } } to soundfont files
            var gain = source.gainNode.gain;
            gain.linearRampToValueAtTime(gain.value, delay);
            gain.linearRampToValueAtTime(-1.0, delay + 0.3);
          }
          ///
          if (useStreamingBuffer) {
            if (delay) {
              setTimeout(function () {
                buffer.pause();
              }, delay * 1000);
            } else {
              buffer.pause();
            }
          } else {
            if (source.noteOff) {
              source.noteOff(delay + 0.5);
            } else {
              source.stop(delay + 0.5);
            }
          }
          ///
          delete sources[channelId + '' + noteId];
          ///
          return source;
        }
      }
    };

    midi.chordOn = function (channel, chord, velocity, delay) {
      var res = {};
      for (var n = 0, note, len = chord.length; n < len; n++) {
        res[note = chord[n]] = midi.noteOn(channel, note, velocity, delay);
      }
      return res;
    };

    midi.chordOff = function (channel, chord, delay) {
      var res = {};
      for (var n = 0, note, len = chord.length; n < len; n++) {
        res[note = chord[n]] = midi.noteOff(channel, note, delay);
      }
      return res;
    };

    midi.stopAllNotes = function () {
      for (var sid in sources) {
        var delay = 0;
        if (delay < ctx.currentTime) {
          delay += ctx.currentTime;
        }
        var source = sources[sid];
        source.gain.linearRampToValueAtTime(1, delay);
        source.gain.linearRampToValueAtTime(0, delay + 0.3);
        if (source.noteOff) { // old api
          source.noteOff(delay + 0.3);
        } else { // new api
          source.stop(delay + 0.3);
        }
        delete sources[sid];
      }
    };

    midi.setEffects = function (list) {
      if (ctx.tunajs) {
        for (var n = 0; n < list.length; n++) {
          var data = list[n];
          var effect = new ctx.tunajs[data.type](data);
          effect.connect(ctx.destination);
          effects[data.type] = effect;
        }
      } else {
        return console.log('Effects module not installed.');
      }
    };

    midi.connect = function (opts) {
      root.setDefaultPlugin(midi);
      midi.setContext(ctx || createAudioContext(), opts.onsuccess);
    };

    midi.getContext = function () {
      return ctx;
    };

    midi.setContext = function (newCtx, onload, onprogress, onerror) {
      ctx = newCtx;

      /// tuna.js effects module - https://github.com/Dinahmoe/tuna
      if (typeof Tuna !== 'undefined' && !ctx.tunajs) {
        ctx.tunajs = new Tuna(ctx);
      }

      /// loading audio files
      var urls = [];
      var notes = root.keyToNote;
      for (var key in notes) urls.push(key);
      ///
      var waitForEnd = function (instrument) {
        for (var key in bufferPending) { // has pending items
          if (bufferPending[key]) return;
        }
        ///
        if (onload) { // run onload once
          onload();
          onload = null;
        }
      };
      ///
      var requestAudio = function (soundfont, instrumentId, index, key) {
        var url = soundfont[key];
        if (url) {
          bufferPending[instrumentId]++;
          loadAudio(url, function (buffer) {
            buffer.id = key;
            var noteId = root.keyToNote[key];
            audioBuffers[instrumentId + '' + noteId] = buffer;
            ///
            if (--bufferPending[instrumentId] === 0) {
              var percent = index / 87;
              //              console.log(MIDI.GM.byId[instrumentId], 'processing: ', percent);
              soundfont.isLoaded = true;
              waitForEnd(instrument);
            }
          }, function (err) {
            //        console.log(err);
          });
        }
      };
      ///
      var bufferPending = {};
      for (var instrument in root.Soundfont) {
        var soundfont = root.Soundfont[instrument];
        if (soundfont.isLoaded) {
          continue;
        }
        ///
        var synth = root.GM.byName[instrument];
        var instrumentId = synth.number;
        ///
        bufferPending[instrumentId] = 0;
        ///
        for (var index = 0; index < urls.length; index++) {
          var key = urls[index];
          requestAudio(soundfont, instrumentId, index, key);
        }
      }
      ///
      setTimeout(waitForEnd, 1);
    };

    /* Load audio file: streaming | base64 | arraybuffer
    ---------------------------------------------------------------------- */
    function loadAudio(url, onload, onerror) {
      if (useStreamingBuffer) {
        var audio = new Audio();
        audio.src = url;
        audio.controls = false;
        audio.autoplay = false;
        audio.preload = false;
        audio.addEventListener('canplay', function () {
          onload && onload(audio);
        });
        audio.addEventListener('error', function (err) {
          onerror && onerror(err);
        });
        document.body.appendChild(audio);
      } else if (url.indexOf('data:audio') === 0) { // Base64 string
        var base64 = url.split(',')[1];
        var buffer = Base64Binary.decodeArrayBuffer(base64);
        ctx.decodeAudioData(buffer, onload, onerror);
      } else { // XMLHTTP buffer
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function () {
          ctx.decodeAudioData(request.response, onload, onerror);
        };
        request.send();
      }
    };

    function createAudioContext() {
      return new(window.AudioContext || window.webkitAudioContext)();
    };
  })();
})(MIDI);


/*
  ----------------------------------------------------------------------
  Web MIDI API - Native Soundbanks
  ----------------------------------------------------------------------
  http://webaudio.github.io/web-midi-api/
  ----------------------------------------------------------------------
*/

(function (root) {
  'use strict';

  var plugin = null;
  var output = null;
  var channels = [];
  var midi = root.WebMIDI = {
    api: 'webmidi'
  };
  midi.send = function (data, delay) { // set channel volume
    output.send(data, delay * 1000);
  };

  midi.setController = function (channel, type, value, delay) {
    output.send([channel, type, value], delay * 1000);
  };

  midi.setVolume = function (channel, volume, delay) { // set channel volume
    output.send([0xB0 + channel, 0x07, volume], delay * 1000);
  };

  midi.programChange = function (channel, program, delay) { // change patch (instrument)
    output.send([0xC0 + channel, program], delay * 1000);
  };

  midi.pitchBend = function (channel, program, delay) { // pitch bend
    output.send([0xE0 + channel, program], delay * 1000);
  };

  midi.noteOn = function (channel, note, velocity, delay) {
    output.send([0x90 + channel, note, velocity], delay * 1000);
  };

  midi.noteOff = function (channel, note, delay) {
    output.send([0x80 + channel, note, 0], delay * 1000);
  };

  midi.chordOn = function (channel, chord, velocity, delay) {
    for (var n = 0; n < chord.length; n++) {
      var note = chord[n];
      output.send([0x90 + channel, note, velocity], delay * 1000);
    }
  };

  midi.chordOff = function (channel, chord, delay) {
    for (var n = 0; n < chord.length; n++) {
      var note = chord[n];
      output.send([0x80 + channel, note, 0], delay * 1000);
    }
  };

  midi.stopAllNotes = function () {
    output.cancel();
    for (var channel = 0; channel < 16; channel++) {
      output.send([0xB0 + channel, 0x7B, 0]);
    }
  };

  midi.connect = function (opts) {
    root.setDefaultPlugin(midi);
    var errFunction = function (err) { // well at least we tried!
      if (window.AudioContext) { // Chrome
        opts.api = 'webaudio';
      } else if (window.Audio) { // Firefox
        opts.api = 'audiotag';
      } else { // no support
        return;
      }
      root.loadPlugin(opts);
    };
    ///
    navigator.requestMIDIAccess().then(function (access) {
      plugin = access;
      var pluginOutputs = plugin.outputs;
      if (typeof pluginOutputs == 'function') { // Chrome pre-43
        output = pluginOutputs()[0];
      } else { // Chrome post-43
        output = pluginOutputs[0];
      }
      if (output === undefined) { // nothing there...
        errFunction();
      } else {
        opts.onsuccess && opts.onsuccess();
      }
    }, errFunction);
  };

})(MIDI);


/*
  ----------------------------------------------------------
  util/Request : 0.1.1 : 2015-03-26
  ----------------------------------------------------------
  util.request({
    url: './dir/something.extension',
    data: 'test!',
    format: 'text', // text | xml | json | binary
    responseType: 'text', // arraybuffer | blob | document | json | text
    headers: {},
    withCredentials: true, // true | false
    ///
    onerror: function(evt, percent) {
      console.log(evt);
    },
    onsuccess: function(evt, responseText) {
      console.log(responseText);
    },
    onprogress: function(evt, percent) {
      percent = Math.round(percent * 100);
      loader.create('thread', 'loading... ', percent);
    }
  });
*/

if (typeof MIDI === 'undefined') MIDI = {};

(function (root) {

  var util = root.util || (root.util = {});

  util.request = function (opts, onsuccess, onerror, onprogress) {
    'use strict';
    if (typeof opts === 'string') opts = {
      url: opts
    };
    ///
    var data = opts.data;
    var url = opts.url;
    var method = opts.method || (opts.data ? 'POST' : 'GET');
    var format = opts.format;
    var headers = opts.headers;
    var responseType = opts.responseType;
    var withCredentials = opts.withCredentials || false;
    ///
    var onsuccess = onsuccess || opts.onsuccess;
    var onerror = onerror || opts.onerror;
    var onprogress = onprogress || opts.onprogress;
    ///
    if (typeof NodeFS !== 'undefined' && root.loc.isLocalUrl(url)) {
      NodeFS.readFile(url, 'utf8', function (err, res) {
        if (err) {
          onerror && onerror(err);
        } else {
          onsuccess && onsuccess({
            responseText: res
          });
        }
      });
      return;
    }
    ///
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    ///
    if (headers) {
      for (var type in headers) {
        xhr.setRequestHeader(type, headers[type]);
      }
    } else if (data) { // set the default headers for POST
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    if (format === 'binary') { //- default to responseType="blob" when supported
      if (xhr.overrideMimeType) {
        xhr.overrideMimeType('text/plain; charset=x-user-defined');
      }
    }
    if (responseType) {
      xhr.responseType = responseType;
    }
    if (withCredentials) {
      xhr.withCredentials = 'true';
    }
    if (onerror && 'onerror' in xhr) {
      xhr.onerror = onerror;
    }
    if (onprogress && xhr.upload && 'onprogress' in xhr.upload) {
      if (data) {
        xhr.upload.onprogress = function (evt) {
          onprogress.call(xhr, evt, event.loaded / event.total);
        };
      } else {
        xhr.addEventListener('progress', function (evt) {
          var totalBytes = 0;
          if (evt.lengthComputable) {
            totalBytes = evt.total;
          } else if (xhr.totalBytes) {
            totalBytes = xhr.totalBytes;
          } else {
            var rawBytes = parseInt(xhr.getResponseHeader('Content-Length-Raw'));
            if (isFinite(rawBytes)) {
              xhr.totalBytes = totalBytes = rawBytes;
            } else {
              return;
            }
          }
          onprogress.call(xhr, evt, evt.loaded / totalBytes);
        });
      }
    }
    ///
    xhr.onreadystatechange = function (evt) {
      if (xhr.readyState === 4) { // The request is complete
        if (xhr.status === 200 || // Response OK
          xhr.status === 304 || // Not Modified
          xhr.status === 308 || // Permanent Redirect
          xhr.status === 0 && root.client.cordova // Cordova quirk
        ) {
          if (onsuccess) {
            var res;
            if (format === 'xml') {
              res = evt.target.responseXML;
            } else if (format === 'text') {
              res = evt.target.responseText;
            } else if (format === 'json') {
              try {
                res = JSON.parse(evt.target.response);
              } catch (err) {
                onerror && onerror.call(xhr, evt);
              }
            }
            ///
            onsuccess.call(xhr, evt, res);
          }
        } else {
          onerror && onerror.call(xhr, evt);
        }
      }
    };
    xhr.send(data);
    return xhr;
  };

  /// NodeJS
  if (typeof module !== 'undefined' && module.exports) {
    var NodeFS = require('fs');
    XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
    module.exports = root.util.request;
  }

})(MIDI);


/*
  -----------------------------------------------------------
  dom.loadScript.js : 0.1.4 : 2014/02/12 : http://mudcu.be
  -----------------------------------------------------------
  Copyright 2011-2014 Mudcube. All rights reserved.
  -----------------------------------------------------------
  /// No verification
  dom.loadScript.add("../js/jszip/jszip.js");
  /// Strict loading order and verification.
  dom.loadScript.add({
    strictOrder: true,
    urls: [
      {
        url: "../js/jszip/jszip.js",
        verify: "JSZip",
        onsuccess: function() {
          console.log(1)
        }
      },
      {
        url: "../inc/downloadify/js/swfobject.js",
        verify: "swfobject",
        onsuccess: function() {
          console.log(2)
        }
      }
    ],
    onsuccess: function() {
      console.log(3)
    }
  });
  /// Just verification.
  dom.loadScript.add({
    url: "../js/jszip/jszip.js",
    verify: "JSZip",
    onsuccess: function() {
      console.log(1)
    }
  });
*/

if (typeof (dom) === "undefined") var dom = {};

(function () {
  "use strict";

  dom.loadScript = function () {
    this.loaded = {};
    this.loading = {};
    return this;
  };

  dom.loadScript.prototype.add = function (config) {
    var that = this;
    if (typeof (config) === "string") {
      config = {
        url: config
      };
    }
    var urls = config.urls;
    if (typeof (urls) === "undefined") {
      urls = [{
        url: config.url,
        verify: config.verify
      }];
    }
    /// adding the elements to the head
    var doc = document.getElementsByTagName("head")[0];
    ///
    var testElement = function (element, test) {
      if (that.loaded[element.url]) return;
      if (test && globalExists(test) === false) return;
      that.loaded[element.url] = true;
      //
      if (that.loading[element.url]) that.loading[element.url]();
      delete that.loading[element.url];
      //
      if (element.onsuccess) element.onsuccess();
      if (typeof (getNext) !== "undefined") getNext();
    };
    ///
    var hasError = false;
    var batchTest = [];
    var addElement = function (element) {
      if (typeof (element) === "string") {
        element = {
          url: element,
          verify: config.verify
        };
      }
      if (/([\w\d.\[\]\'\"])$/.test(element.verify)) { // check whether its a variable reference
        var verify = element.test = element.verify;
        if (typeof (verify) === "object") {
          for (var n = 0; n < verify.length; n++) {
            batchTest.push(verify[n]);
          }
        } else {
          batchTest.push(verify);
        }
      }
      if (that.loaded[element.url]) return;
      var script = document.createElement("script");
      script.onreadystatechange = function () {
        if (this.readyState !== "loaded" && this.readyState !== "complete") return;
        testElement(element);
      };
      script.onload = function () {
        testElement(element);
      };
      script.onerror = function () {
        hasError = true;
        delete that.loading[element.url];
        if (typeof (element.test) === "object") {
          for (var key in element.test) {
            removeTest(element.test[key]);
          }
        } else {
          removeTest(element.test);
        }
      };
      script.setAttribute("type", "text/javascript");
      script.setAttribute("src", element.url);
      doc.appendChild(script);
      that.loading[element.url] = function () {};
    };
    /// checking to see whether everything loaded properly
    var removeTest = function (test) {
      var ret = [];
      for (var n = 0; n < batchTest.length; n++) {
        if (batchTest[n] === test) continue;
        ret.push(batchTest[n]);
      }
      batchTest = ret;
    };
    var onLoad = function (element) {
      if (element) {
        testElement(element, element.test);
      } else {
        for (var n = 0; n < urls.length; n++) {
          testElement(urls[n], urls[n].test);
        }
      }
      var istrue = true;
      for (var n = 0; n < batchTest.length; n++) {
        if (globalExists(batchTest[n]) === false) {
          istrue = false;
        }
      }
      if (!config.strictOrder && istrue) { // finished loading all the requested scripts
        if (hasError) {
          if (config.error) {
            config.error();
          }
        } else if (config.onsuccess) {
          config.onsuccess();
        }
      } else { // keep calling back the function
        setTimeout(function () { //- should get slower over time?
          onLoad(element);
        }, 10);
      }
    };
    /// loading methods;  strict ordering or loose ordering
    if (config.strictOrder) {
      var ID = -1;
      var getNext = function () {
        ID++;
        if (!urls[ID]) { // all elements are loaded
          if (hasError) {
            if (config.error) {
              config.error();
            }
          } else if (config.onsuccess) {
            config.onsuccess();
          }
        } else { // loading new script
          var element = urls[ID];
          var url = element.url;
          if (that.loading[url]) { // already loading from another call (attach to event)
            that.loading[url] = function () {
              if (element.onsuccess) element.onsuccess();
              getNext();
            }
          } else if (!that.loaded[url]) { // create script element
            addElement(element);
            onLoad(element);
          } else { // it's already been successfully loaded
            getNext();
          }
        }
      };
      getNext();
    } else { // loose ordering
      for (var ID = 0; ID < urls.length; ID++) {
        addElement(urls[ID]);
        onLoad(urls[ID]);
      }
    }
  };

  dom.loadScript = new dom.loadScript();

  var globalExists = function (path, root) {
    try {
      path = path.split('"').join('').split("'").join('').split(']').join('').split('[').join('.');
      var parts = path.split(".");
      var length = parts.length;
      var object = root || window;
      for (var n = 0; n < length; n++) {
        var key = parts[n];
        if (object[key] == null) {
          return false;
        } else { //
          object = object[key];
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  };

})();

/// For NodeJS
if (typeof (module) !== "undefined" && module.exports) {
  module.exports = dom.loadScript;
}