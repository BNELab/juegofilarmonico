 if (typeof (Minuetos) == 'undefined') {


   /* Constructor of Minuetos class.
    * @param midi    MIDI file path.
    */
   var Minuetos = function (MIDI) {
     var self = this;

     self.midi = "";

     self.MIDI = MIDI;
     self.MIDIPLAYER = MIDI.Player;

     self.debug_div = "debug";
     self.midiFile = null;

     self.synth = null;
     self.replayer = null;
     self.audio = null;
     self.ct = 0; // loop counter.
     self.started = false; // state of play: started/stopped.
     self.nFicherosVisiblesCanvas = 4;

     self.listener_added = false;
     self.notas = [];
     self.arrayNotasAux = [];
     self.gw = 15000;
     self.gh = 175;

     // almacen de los tracks
     self.tracks = [];
     self.tracksTemp = [];
     self.tracksTrios = [];
     self.tracksTriosTemp = [];
     self.header = null;

     self.datosTirada;


     self.chanel1 = [];
     self.chanel2 = [];

     self.ficheros = [];
     self.trios = [];

     self.totalnotasficheros = [];

     self.acumulado = 0;
     self.iniciox = 20;
     self.iniciocanvas = 0;

     self.docuActivo = 0;
     self.notasplayed = 0;
     self.tablaturaActiva = 0;

     self.intervalosNotas = [];

     self.tiradasDados = 0;

     self.notasChanel0 = [];
     self.notasChanel1 = [];

     self.isPlaying = 0;
     self.token = -1;


     self.iClips = [
       [96, 32, 69, 40, 148, 104, 152, 119, 98, 3, 54],
       [22, 6, 95, 17, 74, 157, 60, 84, 142, 87, 130],
       [141, 128, 158, 113, 163, 27, 171, 114, 42, 165, 10],
       [41, 63, 13, 85, 45, 167, 53, 50, 156, 61, 103],
       [105, 146, 153, 161, 80, 154, 99, 140, 75, 135, 28],
       [122, 46, 55, 2, 97, 68, 133, 86, 129, 47, 37],
       [11, 134, 110, 159, 36, 118, 21, 169, 62, 147, 106],
       [30, 81, 24, 100, 107, 91, 127, 94, 123, 33, 5],
       [70, 117, 66, 90, 25, 138, 16, 120, 65, 102, 35],
       [121, 39, 139, 176, 143, 71, 155, 88, 77, 4, 20],
       [26, 126, 15, 7, 64, 150, 57, 48, 19, 31, 108],
       [9, 56, 132, 34, 125, 29, 175, 166, 82, 164, 92],
       [112, 174, 73, 67, 76, 101, 43, 51, 137, 144, 12],
       [49, 18, 58, 160, 136, 162, 168, 115, 38, 59, 124],
       [109, 116, 145, 52, 1, 23, 89, 72, 149, 173, 44],
       [14, 83, 79, 170, 93, 151, 172, 111, 8, 78, 131]
     ];
     self.iTrios = [
       [72, 56, 75, 40, 83, 18],
       [6, 82, 39, 73, 3, 45],
       [59, 42, 54, 16, 28, 62],
       [25, 74, 1, 68, 53, 38],
       [81, 14, 65, 29, 37, 4],
       [41, 7, 43, 55, 17, 27],
       [89, 26, 15, 2, 44, 52],
       [13, 71, 80, 61, 70, 94],
       [36, 76, 9, 22, 63, 11],
       [5, 20, 34, 67, 85, 92],
       [46, 64, 93, 49, 32, 24],
       [79, 84, 48, 77, 96, 86],
       [30, 8, 69, 57, 12, 51],
       [95, 35, 58, 87, 23, 60],
       [19, 47, 90, 33, 50, 78],
       [66, 88, 21, 10, 91, 31]
     ];

     iClips = self.iClips;
     iTrios = self.iTrios;

     self.idMinueto = idMinueto ? idMinueto : null;
     self.jsonMinueto = jsonMinueto ? jsonMinueto : null;

     self.init();

   }

   Minuetos.prototype.init = function (debug_div_id) {
     var self = this;

     var idPieceCompartido = self.comprobarParametros();
     self.tipoNavegador = self.comprobarNavegador();
     var anchura = parseInt($(window).width());

     $("#control").css("opacity", 0.4);
     $(".capacreacion").css("opacity", 0.4);

     //capas para mostrar compartido
     if (idPieceCompartido) {
       self.idCompartido = idPieceCompartido;

       if (anchura < 992) {
         $(".tablero1.visible-xs").addClass("oculto");
       }

       $("#btnTwitter").removeAttr("disabled");
       $("#btnFacebook").removeAttr("disabled");
       $("#furl").removeAttr("disabled");

       $("#control").css("opacity", 1);
       $(".capacreacion").css("opacity", 1);
       $(".capacreacion .container.game-sharing").css("padding", "0.5em 0em 1.5em 2em");
       $(".capacreacion .container.game-sharing").css("margin-top", "-2.3em");
       $(".tablaturas").css("opacity", 1);

       self.TirarDados(idPieceCompartido);
     }

     $(".game-creation").removeClass("oculto");
     self._binds();
   }

   /**
    * [comprobarParametros comprueba si llega la variable de minueto creado]
    * @return {[type]}
    */
   Minuetos.prototype.comprobarParametros = function () {
     var self = this;

     if (self.idMinueto) {
       return self.idMinueto;
     } else {
       return null;
     }
   }

   /**
    * [comprobarNavegador comprueba si el navegador es chrome para despues
    * tenerlo en cuenta al hacer play de la melodía
    * ]
    * @return {[type]} [description]
    */
   Minuetos.prototype.comprobarNavegador = function () {
     var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

     var anchura = parseInt($(window).width());
     return isChrome;
   };

   /********************
    * [_binds eventos ]
    */
   Minuetos.prototype._binds = function () {
     var self = this;

     var iOS = ['iPad', 'iPhone', 'iPod'].indexOf(navigator.platform) >= 0;
     var anchura = parseInt($(window).width());

     $("#btnCreate").unbind("click");
     $("#btnCreate").bind("click", function () {
       if (iOS) {
         MIDI.noteOn(0, 78, 1);
       }

       // Google Analytics
       ga("send", "event", "Click Botón", "Click", "Botón Tirar Dados", {
         nonInteraction: true
       });

       $("#fnombre").removeAttr("disabled");
       $(".btnSave").removeAttr("disabled");
       $("#btnTwitter").removeAttr("disabled");
       $("#btnFacebook").removeAttr("disabled");
       $("#furl").removeAttr("disabled");

       if (!self.idCompartido) { // si es una melodía compartida se refresca la pagina
         self.TirarDados();
         $(".game-step ul li:first-child").toggle();
         $(".game-counter").removeClass("oculto");
       } else {
         document.location = "/";
       }
     });

     if (anchura >= 800) {
       $("[id=btnPlay]").unbind("click");
       $("[id=btnPlay]").bind("click", function () {

         if (iOS) {
           MIDI.noteOn(0, 78, 1);
         }

         // Google Analytics
         ga("send", "event", "Click Botón", "Click", "Botón Escuchar Melodía", {
           nonInteraction: true
         });

         if (self.isPlaying == 0) {
           self.playNotes();

           MIDI.noteOn(0, 1, 1, 0);
           self.isPlaying = 1;
           $("[id=btnPlay]").addClass("btnstop");

         } else if (self.isPlaying == 1) {
           self.isPlaying = 0;
           self._resetPlayer();
           $("[id=btnPlay]").removeClass("btnstop");
         }
       });
     }

     if (anchura < 800) {
       $("#player").unbind("click");
       $("#player").bind("click", function (e) {

         if (iOS) {
           MIDI.noteOn(0, 78, 1);
         }

         // Google Analytics
         ga("send", "event", "Click Botón", "Click", "Botón Escuchar Melodía", {
           nonInteraction: true
         });

         if (self.isPlaying == 0) {
           self.playNotes();
           self.isPlaying = 1;
           $("#btnPlay").addClass("btnstop");
           $(".btnplaymobile").addClass("oculto");

         } else if (self.isPlaying == 1) {
           self.isPlaying = 0;
           self._resetPlayer();
           $(".btnplaymobile").removeClass("oculto");
         }
       });
     }

     $("#btnFacebook").unbind("click");
     $("#btnFacebook").bind("click", function () {

       if (self.idCompartido) {
         var rute = document.location.protocol + "//" + document.location.hostname + document.location.pathname;

         ga("send", "social", "Facebook", "Compartir", rute, {
           nonInteraction: true
         });
       } else {
         var preruta = document.location.protocol + "//" + document.location.hostname + document.location.pathname + "minueto/";
         var key = self.datosTirada.key;
         var link = preruta + key;

         // Google Analytics
         ga("send", "social", "Facebook", "Compartir", link, {
           nonInteraction: true
         });
       }

     });

     $("#btnTwitter").unbind("click");
     $("#btnTwitter").bind("click", function () {

       if (self.idCompartido) {
         var rute = document.location.protocol + "//" + document.location.hostname + document.location.pathname;

         ga("send", "social", "Twitter", "Tweet", rute, {
           nonInteraction: true
         });
       } else {
         var preruta = document.location.protocol + "//" + document.location.hostname + document.location.pathname + "minueto/";
         var key = self.datosTirada.key;
         var link = preruta + key;

         // Google Analytics
         ga("send", "social", "Twitter", "Tweet", link, {
           nonInteraction: true
         });
       }

     });

     $(".btnSave").unbind("click");
     $(".btnSave").bind("click", function () {

       // Google Analytics
       ga("send", "event", "Click Botón", "Click", "Botón Guardar Minueto", {
         nonInteraction: true
       });

       var nombre = $("#fnombre").val();
       var key = self.datosTirada.key;
       var token = self.token;

       var url = "/api/piece/" + key + "/name";
       var data = {};
       data.name = nombre;
       if (token != -1) data.token = token;

       $.ajax({
         type: "POST",
         url: url,
         data: data,
         success: function (datos) {
           var preruta = document.location.protocol + "//" + document.location.hostname + document.location.pathname + "minueto/";
           var link = preruta + key;

           window.location.href = link;
         }

       });

     });

   }

   /**
    * [_resetAll reseteo de todos los estados]
    * @return {[type]} [description]
    */
   Minuetos.prototype._resetAll = function () {

     var self = this;
     $(".tablero1 .tminu").removeClass("activo");
     $(".tablaturas").css("left", "0px");
     $('.tminu').removeClass("activo-marron");
     $(".tminu").css("background-color", "#fff");

     $(".docu").html("&nbsp;");
     $(".trio").html("&nbsp;");
     $(".tablaturas").empty();

     $("[id=btnPlay]").removeClass("btnstop");

     self.PintarSecuencia("stop");

     // se resetean las notas lanzadas según navegador
     if (self.isChrome) {
       $.each(self.intervalosNotas, function (i, item) {
         self.intervalosNotas[i].clear();
       });
     } else {
       $.each(self.intervalosNotas, function (i, item) {
         clearTimeout(self.intervalosNotas[i]);
       });
     }

     self.isPlaying = 0;
   }

   /**
    * [dataDados parseo del json de tirada creando las promesas de las notas]
    * @param  {[object]} datos [el json de la tirada de dados]
    */
   Minuetos.prototype.dataDados = function (data) {
     var self = this;

     self.notas = [];
     self.ficheros = [];
     self.ficherosTrios = [];

     self.datosTirada = JSON.parse(data);

     if (self.datosTirada.error) {
       window.location.href = "/";
     }

     self.token = self.datosTirada.token;

     var dminuetos = self.datosTirada.measures.minue;
     var dtrios = self.datosTirada.measures.trio;

     // se visualiza el bloque de compartir y se rellena los campos
     if (self.idCompartido) {
       var rute = document.location.protocol + "//" + document.location.hostname + "/minueto/";

       $(".placeholder").remove();
       $("#furl").val(rute + self.idMinueto);
       $("#minuetLink").attr("href", rute + self.idMinueto);

       var urlShareFB = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURI(rute + self.idMinueto);
       var urlShareTwitter = "https://twitter.com/intent/tweet?url=" + encodeURI(rute + self.idMinueto) + "&amp;text=¡He creado mi propio minueto! Crea tú el tuyo con el Juego Filarmónico de la BNE.";

     } else {
       var preruta = document.location.protocol + "//" + document.location.hostname + document.location.pathname + "minueto/";

       $(".placeholder").remove();
       $("#fnombre").val(self.datosTirada.key);
       $("#furl").val(preruta + self.datosTirada.key);
       $("#minuetLink").attr("href", preruta + self.datosTirada.key);

       var urlShareFB = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURI(preruta + self.datosTirada.key);
       var urlShareTwitter = "https://twitter.com/intent/tweet?url=" + encodeURI(preruta + self.datosTirada.key) + "&amp;text=¡He creado mi propio minueto! Crea tú el tuyo con el Juego Filarmónico de la BNE.";
     }

     $(".botonera_social a:nth-child(1)").attr("href", urlShareTwitter);
     $(".botonera_social a:nth-child(2)").attr("href", urlShareFB);

     if (self.idCompartido) {
       $(".titulo_compartido h3").html("Título: <i>" + self.datosTirada.title + "</i>");

       if (!self.datosTirada.title) {
         $(".titulo_compartido h3").html("Título: <i>Obra anónima</i>");
       }
     }

     // Generacion de los minuetos
     $(".tablaturas").empty();
     var contaTablaturas = 0;

     var anchura = parseInt($(window).width());
     var anchuraTablatura = parseInt(anchura / 2);

     $.each(dminuetos, function (i, item) {

       self.ficheros[i] = {};
       self.ficheros[i].f = "/assets/sounds/M" + self.iClips[i][item] + ".MID";
       self.ficheros[i].numero = self.iClips[i][item];
       self.ficheros[i].valor = item;

       $("div[posiMinu='" + i + "']").attr("id", "docu_" + self.iClips[i][item]).html(self.iClips[i][item]);

       var fondoTablatura = "";
       var divTablatura = $("<div></div>").addClass("imagen").attr("id", "tablatura_" + contaTablaturas).css("background", fondoTablatura);
       if (anchura < 992) {

         if (i == 0) {
           divTablatura.css("width", anchura);
         } else {
           divTablatura.css("width", anchuraTablatura);
         }
       }

       var imgDivTablatura = $("<img></img>").attr("src", '/assets/measures/M' + self.iClips[i][item] + '.png').addClass("imagenTablatura");
       divTablatura.append(imgDivTablatura);

       $(".tablaturas").append(divTablatura);
       contaTablaturas++;
     });

     // promesas de los ficheros de minuetos
     promesas = [];
     $.each(self.ficheros, function (i, item) {
       promesas[i] = self.parsearFichero(self.ficheros[i].f, i, self.ficheros[i].numero, "minueto");
     });

     // Generacion de los trios
     $.each(dtrios, function (i, item) {

       self.ficherosTrios[i] = {};
       self.ficherosTrios[i].f = "/assets/sounds/T" + self.iTrios[i][item] + ".MID";
       self.ficherosTrios[i].numero = self.iTrios[i][item];
       self.ficherosTrios[i].valor = item;

       $("div[posiTrio='" + i + "']").attr("id", "trio_" + self.iTrios[i][item]).html(self.iTrios[i][item]);

       var fondoTablatura = "url('/assets/measures/T" + self.iTrios[i][item] + ".png')";
       var fondoTablatura = "";
       var divTablatura = $("<div></div>").addClass("imagen").attr("id", "tablatura_" + contaTablaturas).css("background", fondoTablatura);

       if (anchura < 992) {
         divTablatura.css("width", anchuraTablatura);
       }

       var imgDivTablatura = $("<img></img>").attr("src", '/assets/measures/T' + self.iTrios[i][item] + '.png').addClass("imagenTablatura");
       divTablatura.append(imgDivTablatura);

       $(".tablaturas").append(divTablatura);
       contaTablaturas++;
     });

     if (self.idCompartido) {
       $("#control").removeClass("oculto");
     }

     // promesas de los ficheros de trio
     promesasTrios = [];
     $.each(self.ficherosTrios, function (i, item) {
       promesasTrios[i] = self.parsearFichero(self.ficherosTrios[i].f, i, self.ficherosTrios[i].numero, "trio");
     });

     Promise.all(promesas).done(function (values) {
       Promise.all(promesasTrios).done(function (values) {


         self.crearSecuencia();
       });
     });
   }

   Minuetos.prototype.TirarDados = function (idCompartido) {
     /*********************************************************************************************************
      * [TirarDados llamada a la api para obtener datos de la tirada o NO dependiendo di existe el idMinueto]
      * @param {[string]} idCompartido [si exite el id de Minueto creado]
      */
     var self = this;

     console.clear();
     self._resetAll();
     self.tablaturaActiva = 0;

     if (idCompartido) {
       var urlApi = "/api/piece/" + idCompartido;
       self.dataDados(self.jsonMinueto);
     } else {
       var urlApi = "/api/piece/";
       $.ajax({
         method: 'GET',
         url: urlApi
       }).done(function (datos) {
         self.dataDados(datos);
       });
     }
   }

   /********************************************************************************
    * [PintarSecuencia se lanza la secuencia de pintado de numeros de las tablas]
    *******************************************************************************/
   Minuetos.prototype.PintarSecuencia = function (parar) {
     var self = this;

     self.MinuetoPintado = 0;
     self.TrioPintado = 0;

     if (!self.idCompartido) {

       if (!parar) {

         self.tiradasDados = 0;

         // reseteo de los valores de control
         $(".control_minueto .docu").html("&nbsp;");

         $(".control_trio .trio").html("&nbsp;");

         $(window).scrollTo($(".game-step"), 800);

         var anchura = parseInt($(window).width());

         self.IntervalDrawMinuetos = setInterval(function () {

             if (self.MinuetoPintado >= self.ficheros.length) {
               clearInterval(self.IntervalDrawMinuetos);
               if (anchura < 768) {
                 $(window).scrollTo($("#tablaTrios"), 800);
               } else {
                 $(window).scrollTo($("#tablaTrios.hidden-xs"), 800);
               }

               self.IntervalDrawTrios = setInterval(function () {

                   if (self.TrioPintado >= self.ficherosTrios.length) {
                     clearInterval(self.IntervalDrawTrios);
                     $("#control").removeClass("oculto");
                     $("#player").removeClass("oculto");
                     $(".capacreacion").removeClass("oculto");

                     $(window).scrollTo($("#control"), 800);
                     $("#control").css("opacity", 1);
                     $(".tminu").css("background-color", "#fff");
                     $("#control .docu").removeClass("selected");
                     $("#control .trio").removeClass("selected");

                     $(".player .tablaturas").fadeTo(500, 1);

                     self.CrearCurva();

                     $('.tminu.activo').addClass("activo-marron").removeClass("activo");
                     setTimeout(function () {
                       $(".capacreacion").fadeTo(1000, 1);
                     }, 800);
                     return;
                   }
                   if (self.ficherosTrios[self.TrioPintado]) {
                     var trioPint = self.TrioPintado;

                     if (self.TrioPintado < 10) {
                       trioPint = "0" + self.TrioPintado;
                     }

                     cajaTirada = ".ctrio" + trioPint + self.ficherosTrios[self.TrioPintado].valor;
                     cajaControl = "#trio_" + self.ficherosTrios[self.TrioPintado].numero;

                     $(".tminu").css("background-color", "#fff");

                     var posiTirada = self.TrioPintado;
                     var posiMarcado = self.ficherosTrios[self.TrioPintado].valor;

                     for (i = 0; i < posiTirada; i++) {
                       var iTemp = i;
                       if (i < 10) {
                         iTemp = "0" + i;
                       }
                       var celda = iTemp.toString() + posiMarcado;

                       $(".ctrio" + celda).css("background-color", "rgba(243, 128, 158, 0.2)");
                     }

                     $('.tminu.activo').addClass("activo-marron").removeClass("activo");
                     $(cajaTirada).addClass("activo");
                     $(cajaControl).html(self.ficherosTrios[self.TrioPintado].numero);
                     $("#control .trio").removeClass("selected");
                     $(cajaControl).addClass("selected");

                     self.tiradasDados++;
                     $("#ntiradas").html(self.tiradasDados);
                     self.TrioPintado++;
                   }
                 },
                 150);

             }

             // condición para evitar concurrencia de minuetos seleccionados aleatoriamente en la tabla
             if (self.ficheros[self.MinuetoPintado]) {
               var minuPintado = self.MinuetoPintado;

               if (self.MinuetoPintado < 10) {
                 minuPintado = "0" + self.MinuetoPintado;
               }

               cajaTirada = ".cminu" + minuPintado + self.ficheros[self.MinuetoPintado].valor;
               cajaControl = "#docu_" + self.ficheros[self.MinuetoPintado].numero;

               $(".tminu").css("background-color", "#fff");

               var posiTirada = self.MinuetoPintado;
               var posiMarcado = self.ficheros[self.MinuetoPintado].valor;

               for (i = 0; i < posiTirada; i++) {
                 var iTemp = i;
                 if (i < 10) {
                   iTemp = "0" + i;
                 }
                 var celda = iTemp.toString() + posiMarcado;
                 $(".cminu" + celda).css("background-color", "rgba(243, 128, 158, 0.2)");
               }

               $('.tminu.activo').addClass("activo-marron").removeClass("activo");
               $(cajaTirada).addClass("activo");
               $(cajaControl).html(self.ficheros[self.MinuetoPintado].numero);
               $("#control .docu").removeClass("selected");
               $(cajaControl).addClass("selected");

               self.tiradasDados++;
               $("#ntiradas").html(self.tiradasDados);
               self.MinuetoPintado++;
             }

           },
           150);

       } else {

         if (self.IntervalDrawMinuetos) clearInterval(self.IntervalDrawMinuetos);
         if (self.IntervalDrawTrios) clearInterval(self.IntervalDrawTrios);
         $('.tminu.activo').addClass("activo-marron").removeClass("activo");
         $(".tminu").css("background-color", "#fff");

       }

     } else {

       $("#control").removeClass("oculto");
       $("#player").removeClass("oculto");
       // $(window).scrollTo($("#control"), 800);
       $('.tminu.activo').addClass("activo-marron").removeClass("activo");
       self.CrearCurva();
     }

   }

   /****************************************************************************
    * [crearSecuencia crea la secuencia de todas las notas minuetos y trios]
    **************************************************************************/
   Minuetos.prototype.crearSecuencia = function () {

     var self = this;
     self.acumulado = 0;

     // los tracs de los minuetos
     $.each(self.tracks, function (i, track) {

       if (i > 0) {
         var microAcumulado = 0;
       }

       $.each(track.track, function (a, nota) {
         if (a == 0 && i > 0) {
           self.acumulado = self.acumulado + microAcumulado;
           nota.tiempo = self.acumulado;

         } else {
           self.acumulado = self.acumulado + nota.deltaTime;
           nota.tiempo = self.acumulado;
         }
         nota.tipofichero = "Minueto";
         self.notas.push(nota);

       });
     });

     // los tracs de los trios
     $.each(self.tracksTrios, function (i, track) {

       var microAcumulado = 0;

       $.each(track.track, function (a, nota) {

         if (a == 0 && i > 0) {

           self.acumulado = self.acumulado + microAcumulado;
           nota.tiempo = self.acumulado;

         } else {
           self.acumulado = self.acumulado + nota.deltaTime;
           nota.tiempo = self.acumulado;
         }
         nota.tipofichero = "Trio";
         self.notas.push(nota);

       });

     });

     self.PintarSecuencia();
   }


   /**
    * [parsearFichero parsea el fichero y extra los tracks y notas]
    * @param  {[type]} fichero       [url del fichero .MID]
    * @param  {[type]} posifichero   [posicion del fichero en la secuencia]
    * @param  {[type]} nombreFichero [el nombre del fichero sin extension]
    * @param  {[type]} tipofichero   [si es minueto o trio]
    * @return {[type]}               [devuelve una promesa]
    */
   Minuetos.prototype.parsearFichero = function (fichero, posifichero, nombreFichero, tipofichero) {

     var self = this;

     var promesa1 = new Promise(function (resolve, reject) {


       loadRemote(fichero, function (data) {

         if (tipofichero == "minueto") {

           self.tracksTemp[posifichero] = [];
           self.tracks[posifichero] = [];

           self.tracks[posifichero] = [];
           if (self.ct == 0) {
             self.midiFile = MidiFile(data, posifichero);
             self.synth = Synth(44100);
           }

           self.tracksTemp[posifichero] = self.midiFile.tracks;
           self.tracks[posifichero].header = self.midiFile.header;
           self.tracks[posifichero].track = [];

           var notesO = 0;
           var numeroNota = 1000 * posifichero;
           $.each(self.tracksTemp[posifichero][0], function (i, item) {
             var chanel = item.channel ? item.channel : 0;

             if (item.subtype == "noteOn" || item.subtype == "noteOff") {
               var note = item.noteNumber; // the MIDI note
               var velocity = item.velocity; // how hard the note hits

               item.nombreFichero = nombreFichero;
               item.i = numeroNota;
               item.posifichero = posifichero;
               numeroNota++;
               self.tracks[posifichero].track.push(item);
             }

           });
           resolve(data);

         } else {
           // es un trio
           self.tracksTriosTemp[posifichero] = [];
           self.tracksTrios[posifichero] = [];

           self.tracksTrios[posifichero] = [];
           if (self.ct == 0) {
             self.midiFile = MidiFile(data, posifichero);
             self.synth = Synth(44100);
           }

           self.tracksTriosTemp[posifichero] = self.midiFile.tracks;
           self.tracksTrios[posifichero].header = self.midiFile.header;
           self.tracksTrios[posifichero].track = [];

           var notesO = 0;
           var numeroNota = 1000 * posifichero;
           $.each(self.tracksTriosTemp[posifichero][0], function (i, item) {
             var chanel = item.channel ? item.channel : 0;

             if (item.subtype == "noteOn" || item.subtype == "noteOff") {
               var note = item.noteNumber; // the MIDI note
               var velocity = item.velocity; // how hard the note hits

               item.nombreFichero = nombreFichero;
               item.i = numeroNota;
               item.posifichero = posifichero;
               numeroNota++;
               self.tracksTrios[posifichero].track.push(item);
             }

           });

           resolve(data);

         }

       });

     });

     return promesa1;

   }


   Minuetos.prototype.aleatorio = function (a, b) {
     return Math.round(Math.random() * (b - a) + parseInt(a));
   }

   Minuetos.prototype._resetPlayer = function () {
     var self = this;
     var anchura = parseInt($(window).width());

     self.tablaturaActiva = 0;
     // self.contaTablaturas = 0;

     $("[id=btnPlay]").removeClass("btnstop");
     if (anchura < 768) {
       $("#btnPlay").removeClass("btnstop");
     }
     $(".btnplaymobile").removeClass("oculto");
     $(".tablaturas").css("left", "0px");
     $("#canvas").css("left", "0px");
     $(".docu").removeClass("active");
     $(".trio").removeClass("active");
     $(".imagen").removeClass("activo");

     // reseteo de notas lanzadas según navegador
     if (self.isChrome) {
       $.each(self.intervalosNotas, function (i, item) {
         self.intervalosNotas[i].clear();
       });
     } else {
       $.each(self.intervalosNotas, function (i, item) {
         clearTimeout(self.intervalosNotas[i]);
       });
     }

     self.isPlaying = 0;

   }

   Minuetos.prototype.CrearCurva = function () {
     var self = this;

     var self = this;
     self.iniciox = 20;
     $("#canvas").css("left", "0px");

     //self.dc.clearRect(0, 0, self.gw, self.gh);

     self.notasplayed = 0;
     self.notas.sort(function (a, b) {
       return a.tiempo - b.tiempo;
     })
     $.each(self.notas, function (i, nota) {
       nota.posicionTimeLine = i;
     });

     //self.dc.moveTo(0,0);
     anteriorx = 0;
     anteriory = 0;

     self.puntos = [];
     // primer punto
     self.puntos.push(0);
     self.puntos.push(self.gh);

     $.each(self.notas, function (i, nota) {
       if (nota.subtype == "noteOn") {
         self.puntos.push(self.iniciox);
         self.puntos.push(nota.velocity + Math.pow(nota.velocity, 0.8));
         self.iniciox = self.iniciox + 30;
       }
     });

     //ultimo punto para cerrar el path
     self.puntos.push(self.iniciox);
     self.puntos.push(self.gh);

     self.iniciox = 20;
     //self.drawCurve(self.dc, self.puntos, 0.5); //default tension=0.5
   }

   Minuetos.prototype._incrementarPlays = function () {
     var self = this;
     var urlApi = "/api/piece/" + self.datosTirada.key + "/plays";
     $.ajax({
       method: 'GET',
       url: urlApi
     });
   }

   Minuetos.prototype.playNotes = function () {
     var self = this;

     if (self.isPlaying == 1) {
       self._resetAll();
     }

     self.iniciox = 20;

     self._incrementarPlays();

     self.notasplayed = 0;
     self.notas.sort(function (a, b) {
       return a.tiempo - b.tiempo;
     })
     $.each(self.notas, function (i, nota) {
       nota.posicionTimeLine = i;
     });

     anteriorx = 0;
     anteriory = 0;

     //$("#btnPlay").addClass("btnstop");
     $.each(self.notas, function (i, nota) {

       if (nota.subtype == "noteOn") {

         self._playNote(nota, i, nota.posicionTimeLine);

         anteriorx = self.iniciox;
         anteriory = nota.velocity;
         self.iniciox = self.iniciox + 30;

       } else {
         self._playNote(nota, i, nota.posicionTimeLine, 1);
       }

     });
     self.iniciox = 20;

     // array auxiliar para vaciado
     self.arrayNotasAux = self.notas.slice(0);


   }

   Minuetos.prototype._playNote = function (note, posicion, posiTime, off) {
     var self = this;
     var noteNumber = note.noteNumber;
     var tiempo = note.tiempo;
     var velocidad = note.velocity;

     self.isChrome = self.tipoNavegador;

     if (self.isChrome) {


       var mTimeOut = window.rtimeOut(function () {

         if (off) {
           MIDI.noteOff(0, noteNumber);

         } else {

           var frecuencia = parseInt(midiToFrequency(noteNumber));
           //MIDI.setVolume(0, 100);
           MIDI.noteOn(0, noteNumber, velocidad);

           self.iniciox = self.iniciox + 30;
           var puntoNoAnimado = parseInt(self.notas.length / 2) - 24;

           self.notasplayed++;
           // elimina cada vez un elemento del array para posterior reseteo del Player
           self.arrayNotasAux.splice(0, 1);
           self.arrayNotasAux.length--;

           // comprobacion del fichero activo para mover las tablaturas
           if (note.nombreFichero != self.docuActivo) {
             self.docuActivo = note.nombreFichero;
             $(".docu").removeClass("active");
             $(".trio").removeClass("active");

             if (note.tipofichero == "Minueto") {
               $("#docu_" + note.nombreFichero).addClass("active");
             } else {
               $("#trio_" + note.nombreFichero).addClass("active");
             }
             self._AnimarTablatura();
           }

           // condición de vaciado completo del array para reseteo del Player
           if (self.arrayNotasAux.length === 0) {
             self._resetPlayer();
           }

         }
       }, tiempo);

     } else {

       var mTimeOut = setTimeout(function () {

         if (off) {
           MIDI.noteOff(0, noteNumber);

         } else {

           var frecuencia = parseInt(midiToFrequency(noteNumber));

           MIDI.noteOn(0, noteNumber, velocidad);

           self.iniciox = self.iniciox + 30;
           var puntoNoAnimado = parseInt(self.notas.length / 2) - 24;

           if (self.notasplayed > 7 && self.notasplayed < puntoNoAnimado) {
             var left = parseInt($("#canvas").css("left")) - 30;
             $("#canvas").css("left", left + "px");
           }
           self.notasplayed++;
           // elimina cada vez un elemento del array para posterior reseteo del Player
           self.arrayNotasAux.splice(0, 1);
           self.arrayNotasAux.length--;

           // comprobacion del fichero activo para mover las tablaturas
           if (note.nombreFichero != self.docuActivo) {
             self.docuActivo = note.nombreFichero;
             $(".docu").removeClass("active");
             $(".trio").removeClass("active");

             if (note.tipofichero == "Minueto") {
               $("#docu_" + note.nombreFichero).addClass("active");
             } else {
               $("#trio_" + note.nombreFichero).addClass("active");
             }
             self._AnimarTablatura();
           }

           // condición de vaciado completo del array para reseteo del Player
           if (self.arrayNotasAux.length === 0) {
             self._resetPlayer();
           }

         }
       }, tiempo);



     }

     self.intervalosNotas.push(mTimeOut);

   }

   /**
    * [_AnimarTablatura mueve el slider de tablaturas hasta la posicion x de la que esta activa]
    */
   Minuetos.prototype._AnimarTablatura = function () {

     var self = this;
     $(".tablaturas .imagen").removeClass("activo");

     var anchura = parseInt($(window).width());

     var totalTablaturasCargadas = $(".tablaturas .imagen").length;
     var anchura = parseInt($(window).width());

     if (anchura < 992) {
       var puntoNoAnimado = totalTablaturasCargadas;
     } else {
       var puntoNoAnimado = totalTablaturasCargadas - 3;
     }

     if (self.tablaturaActiva > 0 && self.tablaturaActiva < puntoNoAnimado) {
       $(".tablaturas #tablatura_" + self.tablaturaActiva).addClass("activo");
       var anchoTabla = parseInt($(".tablaturas .activo").css("width"));
       var nLeft = parseInt($(".tablaturas").css("left")) - anchoTabla;
       //$(".tablaturas").css("left", nLeft + "px");
       if (self.isPlaying === 1) {
         $(".tablaturas").animate({
           left: nLeft + 'px'
         }, 500, function () {
           if (self.isPlaying == 0) {
             $(".tablaturas").css("left", "0px");
           }
         });

       }

     } else {
       $(".tablaturas #tablatura_" + self.tablaturaActiva).addClass("activo");
     }
     self.tablaturaActiva++;
   }


   /*********************************************
   conversion de intervals a request animation
   ***********************************************/
   window.rInterval = function (callback, delay) {
     var dateNow = Date.now,
       requestAnimation = window.requestAnimationFrame,
       start = dateNow(),
       stop,
       intervalFunc = function () {
         dateNow() - start < delay || (start += delay, callback());
         stop || requestAnimation(intervalFunc)
       }
     requestAnimation(intervalFunc);
     return {
       clear: function () {
         stop = 1
       }
     }
   }

   window.rtimeOut = function (callback, delay) {
     var dateNow = Date.now,
       requestAnimation = window.requestAnimationFrame,
       start = dateNow(),
       stop,
       timeoutFunc = function () {
         dateNow() - start < delay ? stop || requestAnimation(timeoutFunc) : callback()
       };
     requestAnimation(timeoutFunc);
     return {
       clear: function () {
         stop = 1
       }
     }
   }



 }

 /*
  * A Promises/A+ compliant implementation of promises
  */

 //(function () {
 /************** Promises ***************************************************/
 function resolve(promise, o) {
   if (promise === o) {
     throw new TypeError();
   }
   try {
     var then = o && o.then;
     if (then && (typeof then == 'function')) {
       then.call(o, function (value) {
         resolve(promise, value);
       }, function (reason) {
         promise.reject(reason);
       });
     } else {
       promise.resolve(o);
     }
   } catch (e) {
     promise.reject(e);
   }
 }

 function Promise(resolveRejectCallback) {
   var _value;
   var _reason;
   var _state = Promise.PENDING;
   this._successCallbacks = [];
   this._failCallbacks = [];
   this._finallyCallbacks = [];

   this.value = function () {
     return _value;
   };

   this.reason = function () {
     return _reason;
   };

   this.state = function () {
     return _state;
   };

   var self = this;
   this.resolve = function (value) {
     if (_state !== Promise.PENDING) return;

     _state = Promise.FULFILLED;
     _value = value;
     self.processCallbacks();
   };

   this.reject = function (reason) {
     if (_state !== Promise.PENDING) return;

     _state = Promise.REJECTED;
     _reason = reason;
     self.processCallbacks();
   };

   var _resolve = function (value) {
     self.resolve(value);
   };

   var _reject = function (value) {
     self.reject(value);
   };

   if (typeof resolveRejectCallback === 'function') {
     try {
       resolveRejectCallback(_resolve, _reject);
     } catch (e) {
       this.reject(e);
     }
   }
 }

 //states
 Promise.PENDING = 0;
 Promise.FULFILLED = 1;
 Promise.REJECTED = 2;

 Promise.prototype.done = function (callback) {
   return this.then(callback);
 };

 Promise.prototype.Catch = function (callback) {
   return this.then(undefined, callback);
 };

 Promise.prototype.Finally = function (callback) {
   return this.then(undefined, undefined, callback);
 };

 Promise.prototype.then = function (success, fail, always) {
   var promise = new Promise();
   if (typeof success == 'function') {
     success._promise = promise;
   } else {
     success = {
       value: success,
       _promise: promise
     };
   }
   if (typeof fail == 'function') {
     fail._promise = promise;
   } else {
     fail = {
       value: fail,
       _promise: promise
     };
   }

   this._successCallbacks.push(success);
   this._failCallbacks.push(fail);
   if (typeof always == 'function') {
     this._finallyCallbacks.push(always);
   }

   if (this.state() != Promise.PENDING) {
     this.processCallbacks();
   }
   return promise;
 };

 Promise.prototype.processCallbacks = function () {
   var self = this;
   if (self.state() == Promise.PENDING) {
     return;
   }
   setTimeout(function () {
     if (self.state() == Promise.FULFILLED) {
       while (self._successCallbacks.length) {
         var callback = self._successCallbacks.shift();
         self._call(callback, true);
       }
     } else {
       while (self._failCallbacks.length) {
         var callback = self._failCallbacks.shift();
         self._call(callback, false);
       }
     }
     //final callbacks, if any
     while (self._finallyCallbacks.length) {
       var callback = self._finallyCallbacks.shift();
       try {
         callback(self.value(), self.reason());
       } catch (e) {} //ignore errors happening here.
     }
   }, 0);
 };

 Promise.prototype._call = function (callback, bFulfilled) {
   if (!callback._promise) {
     return;
   }
   if (!(typeof callback == 'function')) {
     if (bFulfilled) {
       callback._promise.resolve(this.value());
     } else {
       callback._promise.reject(this.reason());
     }
     return;
   }
   try {
     var result = callback(bFulfilled ? this.value() : this.reason());
     resolve(callback._promise, result);
   } catch (e) {
     callback._promise.reject(e);
     if (window.console) {
       console.log(e);
     }
   }
 };

 //returns a promise that fulfills when all the promises passed to it fulfill, and rejects otherwise.
 //It admits a comma-separated list of objects as arguments or an array object (in this case, the rest of the arguments, if any, are ignored).
 //In case a non promise-like object is passed, it is considered fulfilled.
 //If the returned promise fulfills, 'value' is an array with as many values as the list passed to it, and in the same order. The values are:
 //-For promises, the value of the fulfilled promise.
 //-For any other object, the object itself.
 //If the returned promise rejects, it returns the rejection reason of the first promise that rejects.
 Promise.all = function () {
   var promise = new Promise();
   var list = (Object.prototype.toString.call(arguments[0]) == '[object Array]') ? arguments[0] : arguments;
   results = new Array(list.length);
   var pending = 0;
   $.each(list, function (i, _promise) {
     if (_promise && (typeof _promise.then == 'function')) { //thenable, promise-like object
       pending++;
       _promise.then(function (value) {
         results[i] = value;
         pending--;
         if (!pending) {
           promise.resolve(results);
         }
       }, function (error) {
         promise.reject(error);
       });
     } else {
       results[i] = _promise;
     }
   });

   return promise;
 };

 Promise.allNoRejection = function () {
   var promise = new Promise();
   var list = (Object.prototype.toString.call(arguments[0]) == '[object Array]') ? arguments[0] : arguments;
   results = new Array(list.length);
   var pending = 0;
   $.each(list, function (i, _promise) {
     if (_promise && (typeof _promise.then == 'function')) { //thenable, promise-like object
       pending++;
       _promise.then(function (value) {
         results[i] = value;
         pending--;
         if (!pending) {
           promise.resolve(results);
         }
       }, function (error) {
         //promise.reject(error);
         results[i] = null;
         pending--;
         if (!pending) {
           promise.resolve(results);
         }
       });
     } else {
       results[i] = _promise;
     }
   });

   return promise;

 };

 //returns a promise that fulfills when any of the promises passed to it fulfill, and rejects only when all promises reject.
 //It admits a comma-separated list of objects as arguments or an array object (in this case, the rest of the arguments, if any, are ignored).
 //In case a non promise-like object is passed, it is considered fulfilled.
 //If the returned promise fulfills, 'value' is the value of the first fulfilled promise.
 //If the returned promise rejects, 'reason' is undefined.
 Promise.any = function () {
   var promise = new Promise();
   var list = (Object.prototype.toString.call(arguments[0]) == '[object Array]') ? arguments[0] : arguments;
   var pending = 0;
   for (var i = 0; i < list.length; i++) {
     var _promise = list[0];
     pending++;
     if (_promise && (typeof _promise.then == 'function')) { //thenable, promise-like object
       _promise.then(function (value) {
         promise.resolve(value);
       }, function (error) {
         pending--;
         if (!pending) {
           promise.reject();
         }
       });
     } else {
       promise.resolve(_promise);
     }
   }

   return promise;
 };


 Promise.makePromise = function (o) {
   Promise.call(o);
 };

 Promise.cast = function (thenable) {
   var promise = new Promise();
   try {
     thenable.then(function (value) {
       promise.resolve(value);
     }, function (reason) {
       promise.reject(value);
     });
   } catch (error) {
     promise.reject(error);
   }

   return promise;
 };

 window.Promise = Promise;