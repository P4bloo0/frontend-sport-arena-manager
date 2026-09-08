window.AAM = window.AAM || {};

(function (AAM) {
  "use strict";

  const {
    $, escaparHTML, formatearFecha, insigniaEstado, parametroURL,
    ESTADOS_TORNEO, ESTADOS_PARTIDA, ESTADOS_INSCRIPCION
  } = AAM.utiles;
  const { cuposDisponibles, construirTablaPosiciones } = AAM.dominio;

  let equipos = [];
  let jugadores = [];

  const nombreParticipante = (id) => {
    if (!id || id === "POR DEFINIR") return "Participante por definir";
    const equipo = equipos.find((e) => e.id === id);
    if (equipo) return equipo.nombre;
    const jugador = jugadores.find((j) => j.id === id);
    if (jugador) return jugador.nombre;
    return id;
  };

  const seccion = (titulo, cuerpo) =>
    "<section><h3>" + escaparHTML(titulo) + "</h3>" + cuerpo + "</section>";

  const bloqueDatos = (torneo, juego, cuposLibres) =>
    '<dl class="datos-torneo">' +
      "<div><dt>Juego</dt><dd>" + escaparHTML(juego ? juego.nombre : "No disponible") + "</dd></div>" +
      "<div><dt>Modalidad</dt><dd>" + escaparHTML(torneo.modalidad) + "</dd></div>" +
      "<div><dt>Cupo maximo</dt><dd>" + torneo.cupoMaximo + "</dd></div>" +
      "<div><dt>Cupos disponibles</dt><dd>" + cuposLibres + "</dd></div>" +
      "<div><dt>Cierre de inscripcion</dt><dd>" + formatearFecha(torneo.cierreInscripcion) + "</dd></div>" +
      "<div><dt>Inicio</dt><dd>" + formatearFecha(torneo.fechaInicio) + "</dd></div>" +
      "<div><dt>Fin</dt><dd>" + formatearFecha(torneo.fechaFin) + "</dd></div>" +
    "</dl>";

  const tablaParticipantes = (inscripciones) => {
    if (inscripciones.length === 0) {
      return '<p class="estado-vacio">Todavía no hay participantes inscritos.</p>';
    }
    const filas = inscripciones.map((inscripcion) =>
      "<tr>" +
        "<td>" + escaparHTML(nombreParticipante(inscripcion.participanteId)) + "</td>" +
        "<td>" + escaparHTML(inscripcion.tipo) + "</td>" +
        "<td>" + insigniaEstado("insignia", ESTADOS_INSCRIPCION[inscripcion.estado]) + "</td>" +
        "<td>" + formatearFecha(inscripcion.fecha) + "</td>" +
      "</tr>"
    ).join("");
    return '<div class="tabla-scroll"><table class="tabla">' +
      "<thead><tr><th>Participante</th><th>Tipo</th><th>Estado</th><th>Fecha</th></tr></thead>" +
      "<tbody>" + filas + "</tbody></table></div>";
  };

  const bloqueLlave = (partidas) => {
    if (partidas.length === 0) {
      return '<p class="estado-vacio">La llave aún no está definida.</p>';
    }
    const rondas = [];
    partidas.forEach((partida) => {
      let grupo = rondas.find((r) => r.ronda === partida.ronda);
      if (!grupo) {
        grupo = { ronda: partida.ronda, partidas: [] };
        rondas.push(grupo);
      }
      grupo.partidas.push(partida);
    });
    const columnas = rondas.map((grupo) =>
      '<div class="llave__ronda">' +
        '<h4 class="llave__titulo">' + escaparHTML(grupo.ronda) + "</h4>" +
        grupo.partidas.map((partida) =>
          '<div class="llave__cruce">' +
            "<span>" + escaparHTML(nombreParticipante(partida.localId)) + "</span>" +
            "<span>" + escaparHTML(nombreParticipante(partida.visitanteId)) + "</span>" +
          "</div>"
        ).join("") +
      "</div>"
    ).join("");
    return '<div class="llave">' + columnas + "</div>";
  };

  const bloqueCalendario = (partidas) => {
    if (partidas.length === 0) {
      return '<p class="estado-vacio">Todavía no hay partidas programadas.</p>';
    }
    const filas = partidas.map((partida) => {
      const resultado = AAM.datos.resultadoDePartida(partida.id);
      const marcador = resultado
        ? resultado.puntajeLocal + " - " + resultado.puntajeVisitante
        : "—";
      return "<tr>" +
        "<td>" + escaparHTML(partida.ronda) + "</td>" +
        "<td>" + escaparHTML(nombreParticipante(partida.localId)) + " vs " +
          escaparHTML(nombreParticipante(partida.visitanteId)) + "</td>" +
        "<td>" + escaparHTML(partida.fechaHora) + "</td>" +
        "<td>" + insigniaEstado("insignia", ESTADOS_PARTIDA[partida.estado]) + "</td>" +
        "<td>" + marcador + "</td>" +
      "</tr>";
    }).join("");
    return '<div class="tabla-scroll"><table class="tabla">' +
      "<thead><tr><th>Ronda</th><th>Enfrentamiento</th><th>Fecha y hora</th><th>Estado</th><th>Resultado</th></tr></thead>" +
      "<tbody>" + filas + "</tbody></table></div>";
  };

  const bloquePosiciones = (filas) => {
    if (filas.length === 0) {
      return '<p class="estado-vacio">Aún no hay resultados validados para calcular la tabla.</p>';
    }
    const cuerpo = filas.map((fila, indice) =>
      "<tr>" +
        "<td>" + (indice + 1) + "</td>" +
        "<td>" + escaparHTML(fila.nombre) + "</td>" +
        "<td>" + fila.jugadas + "</td>" +
        "<td>" + fila.ganadas + "</td>" +
        "<td>" + fila.perdidas + "</td>" +
        "<td>" + (fila.diferencia > 0 ? "+" : "") + fila.diferencia + "</td>" +
        "<td>" + fila.puntos + "</td>" +
      "</tr>"
    ).join("");
    return '<div class="tabla-scroll"><table class="tabla">' +
      "<thead><tr><th>#</th><th>Participante</th><th>PJ</th><th>PG</th><th>PP</th><th>Dif</th><th>Pts</th></tr></thead>" +
      "<tbody>" + cuerpo + "</tbody></table></div>";
  };

  const bloquePremios = (premios) => {
    const filas = premios.map((premio) =>
      "<tr><td>" + premio.posicion + "º</td><td>" + escaparHTML(premio.descripcion) + "</td></tr>"
    ).join("");
    return '<div class="tabla-scroll"><table class="tabla">' +
      "<thead><tr><th>Posición</th><th>Premio</th></tr></thead>" +
      "<tbody>" + filas + "</tbody></table></div>";
  };

  const render = (torneoId) => {
    const contenedor = $("#contenido-torneo");
    const torneo = AAM.datos.torneo(torneoId);

    if (!torneo) {
      contenedor.innerHTML = '<p class="estado-vacio">No encontramos ningún torneo con ese identificador.</p>';
      return;
    }

    const juego = AAM.datos.juego(torneo.juegoId);
    const inscripciones = AAM.datos.inscripcionesDeTorneo(torneo.id);
    const partidas = AAM.datos.partidasDeTorneo(torneo.id);
    const cuposLibres = cuposDisponibles(torneo, AAM.datos.inscripciones());
    const posiciones = construirTablaPosiciones(torneo, equipos, AAM.datos.partidas(), AAM.datos.resultados());

    contenedor.innerHTML =
      '<div class="detalle">' +
        '<div class="detalle__cabecera">' +
          "<h2>" + escaparHTML(torneo.nombre) + "</h2>" +
          insigniaEstado("insignia", ESTADOS_TORNEO[torneo.estado]) +
        "</div>" +
        "<p>" + escaparHTML(torneo.descripcion) + "</p>" +
        seccion("Datos generales", bloqueDatos(torneo, juego, cuposLibres)) +
        seccion("Participantes inscritos", tablaParticipantes(inscripciones)) +
        seccion("Llave", bloqueLlave(partidas)) +
        seccion("Calendario de partidas", bloqueCalendario(partidas)) +
        seccion("Tabla de posiciones", bloquePosiciones(posiciones)) +
        seccion("Premios", bloquePremios(torneo.premios)) +
      "</div>";
  };

  document.addEventListener("DOMContentLoaded", () => {
    equipos = AAM.datos.equipos();
    jugadores = AAM.datos.jugadores();

    const torneos = AAM.datos.torneos();
    const pedido = parametroURL("id");
    const idInicial = torneos.some((t) => t.id === pedido) ? pedido : torneos[0].id;

    const selector = $("#selector-torneo");
    selector.innerHTML = torneos
      .map((torneo) => '<option value="' + torneo.id + '">' + escaparHTML(torneo.nombre) + "</option>")
      .join("");
    selector.value = idInicial;
    selector.addEventListener("change", () => {
      const url = new URL(window.location.href);
      url.searchParams.set("id", selector.value);
      window.history.replaceState({}, "", url);
      render(selector.value);
    });

    const anio = $("#anio-actual");
    if (anio) anio.textContent = new Date().getFullYear();

    render(idInicial);
  });
})(window.AAM);
