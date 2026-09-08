window.AAM = window.AAM || {};

(function (AAM) {
  "use strict";

  const {
    $, escaparHTML, normalizarTexto, formatearFecha, aFecha,
    insigniaEstado, ESTADOS_TORNEO
  } = AAM.utiles;
  const { cuposDisponibles } = AAM.dominio;

  let torneos = [];
  let juegos = [];
  let inscripciones = [];

  const tarjetaTorneo = (torneo, juego, ocupados) =>
    '<article class="tarjeta">' +
      '<div class="tarjeta__cuerpo">' +
        insigniaEstado("tarjeta__estado", ESTADOS_TORNEO[torneo.estado]) +
        '<h3 class="tarjeta__nombre">' + escaparHTML(torneo.nombre) + "</h3>" +
        '<p class="tarjeta__juego">' +
          escaparHTML(juego ? juego.nombre : "Juego no disponible") + " &middot; " + escaparHTML(torneo.modalidad) +
        "</p>" +
        '<p class="tarjeta__cupos">' + ocupados + " / " + torneo.cupoMaximo + " cupos ocupados</p>" +
        '<p class="tarjeta__fecha">Cierre de inscripcion: ' + formatearFecha(torneo.cierreInscripcion) + "</p>" +
        '<a href="detalle-torneo.html?id=' + encodeURIComponent(torneo.id) + '">Ver detalle</a>' +
      "</div>" +
    "</article>";

  const rangoInvalido = (desde, hasta) => Boolean(desde && hasta && aFecha(desde) > aFecha(hasta));

  const aplicarFiltros = () => {
    const form = $("#form-filtros");
    const texto = normalizarTexto(form.elements.busqueda.value);
    const juegoId = form.elements.juego.value;
    const estado = form.elements.estado.value;
    const desde = form.elements.desde.value;
    const hasta = form.elements.hasta.value;

    const fechasInvalidas = rangoInvalido(desde, hasta);
    $("#error-fechas").textContent = fechasInvalidas
      ? 'La fecha "desde" no puede ser posterior a la fecha "hasta".'
      : "";
    form.elements.desde.setAttribute("aria-invalid", String(fechasInvalidas));
    form.elements.hasta.setAttribute("aria-invalid", String(fechasInvalidas));

    let visibles = torneos.slice();
    if (texto) visibles = visibles.filter((t) => normalizarTexto(t.nombre).includes(texto));
    if (juegoId) visibles = visibles.filter((t) => t.juegoId === juegoId);
    if (estado) visibles = visibles.filter((t) => t.estado === estado);
    if (!fechasInvalidas) {
      if (desde) visibles = visibles.filter((t) => aFecha(t.fechaInicio) >= aFecha(desde));
      if (hasta) visibles = visibles.filter((t) => aFecha(t.fechaInicio) <= aFecha(hasta));
    }

    const grid = $("#grid-torneos");
    const vacio = $("#estado-vacio");

    $("#resumen-resultados").textContent =
      "Mostrando " + visibles.length + " de " + torneos.length + " torneos";

    if (visibles.length === 0) {
      grid.innerHTML = "";
      grid.hidden = true;
      vacio.hidden = false;
      vacio.textContent = "Ningún torneo coincide con los filtros. Prueba a quitar alguno, ampliar el rango de fechas o limpiar la búsqueda.";
      return;
    }

    vacio.hidden = true;
    grid.hidden = false;
    grid.innerHTML = visibles
      .map((torneo) => {
        const juego = juegos.find((j) => j.id === torneo.juegoId);
        const ocupados = torneo.cupoMaximo - cuposDisponibles(torneo, inscripciones);
        return tarjetaTorneo(torneo, juego, ocupados);
      })
      .join("");
  };

  document.addEventListener("DOMContentLoaded", () => {
    torneos = AAM.datos.torneos();
    juegos = AAM.datos.juegos();
    inscripciones = AAM.datos.inscripciones();

    const selectJuego = $("#filtro-juego");
    selectJuego.insertAdjacentHTML(
      "beforeend",
      juegos.map((j) => '<option value="' + j.id + '">' + escaparHTML(j.nombre) + "</option>").join("")
    );

    const form = $("#form-filtros");
    form.addEventListener("input", aplicarFiltros);
    form.addEventListener("change", aplicarFiltros);
    form.addEventListener("submit", (evento) => {
      evento.preventDefault();
      aplicarFiltros();
    });
    form.addEventListener("reset", () => {
      window.setTimeout(aplicarFiltros, 0);
    });

    const anio = $("#anio-actual");
    if (anio) anio.textContent = new Date().getFullYear();

    aplicarFiltros();
  });
})(window.AAM);
