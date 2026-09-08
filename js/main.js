window.AAM = window.AAM || {};

(function (AAM) {
  "use strict";

  const { $, escaparHTML, formatearFecha, insigniaEstado, ESTADOS_TORNEO } = AAM.utiles;
  const { cuposDisponibles } = AAM.dominio;

  const tarjetaTorneo = (torneo, juego, ocupados) =>
    '<article class="tarjeta">' +
      '<div class="tarjeta__cuerpo">' +
        insigniaEstado("tarjeta__estado", ESTADOS_TORNEO[torneo.estado]) +
        '<h3 class="tarjeta__nombre">' + escaparHTML(torneo.nombre) + "</h3>" +
        '<p class="tarjeta__juego">' + escaparHTML(juego ? juego.nombre : "Juego no disponible") + "</p>" +
        '<p class="tarjeta__cupos">' + ocupados + " / " + torneo.cupoMaximo + " cupos ocupados</p>" +
        '<p class="tarjeta__fecha">Cierre de inscripcion: ' + formatearFecha(torneo.cierreInscripcion) + "</p>" +
        '<a href="detalle-torneo.html?id=' + encodeURIComponent(torneo.id) + '">Ver detalle</a>' +
      "</div>" +
    "</article>";

  const pintarDestacados = (torneos, juegos, inscripciones) => {
    const grid = $("#grid-destacados");
    if (!grid) return;

    const destacados = torneos.filter((t) => t.estado === "abierto" || t.estado === "en_curso");

    if (destacados.length === 0) {
      grid.innerHTML = '<p class="estado-vacio">No hay torneos abiertos ni en curso en este momento.</p>';
      return;
    }

    grid.innerHTML = destacados
      .map((torneo) => {
        const juego = juegos.find((j) => j.id === torneo.juegoId);
        const ocupados = torneo.cupoMaximo - cuposDisponibles(torneo, inscripciones);
        return tarjetaTorneo(torneo, juego, ocupados);
      })
      .join("");
  };

  const pintarCierres = (torneos) => {
    const lista = $("#lista-cierres");
    if (!lista) return;

    const proximos = torneos
      .filter((t) => t.estado === "abierto")
      .sort((a, b) => a.cierreInscripcion.localeCompare(b.cierreInscripcion));

    if (proximos.length === 0) {
      lista.innerHTML = '<li class="lista-cierres__item">Sin cierres proximos.</li>';
      return;
    }

    lista.innerHTML = proximos
      .map((torneo) =>
        '<li class="lista-cierres__item">' +
          "<span>" + escaparHTML(torneo.nombre) + "</span>" +
          '<span class="lista-cierres__fecha">' + formatearFecha(torneo.cierreInscripcion) + "</span>" +
        "</li>"
      )
      .join("");
  };

  const pintarAnio = () => {
    const nodo = $("#anio-actual");
    if (nodo) nodo.textContent = new Date().getFullYear();
  };

  document.addEventListener("DOMContentLoaded", () => {
    const torneos = AAM.datos.torneos();
    const juegos = AAM.datos.juegos();
    const inscripciones = AAM.datos.inscripciones();

    pintarDestacados(torneos, juegos, inscripciones);
    pintarCierres(torneos);
    pintarAnio();
  });
})(window.AAM);
