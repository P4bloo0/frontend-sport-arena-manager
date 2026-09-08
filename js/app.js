window.ARENA = window.ARENA || {};

(function (ARENA) {
  const { normalizarTexto } = ARENA.utiles;
  const { mostrarTorneos, mostrarCierres, llenarJuegos } = ARENA.ui;

  // Convierte los objetos simples en objetos Torneo para usar sus cálculos.
  const torneos = ARENA.torneos.map((datos) => new ARENA.Torneo(datos));

  function iniciarInicio() {
    const contenedorDestacados = document.getElementById("torneos-destacados");
    const contenedorCierres = document.getElementById("proximos-cierres");

    const destacados = torneos.filter((torneo) => torneo.destacado);

    // Ordenamos para mostrar primero el cierre más cercano.
    const proximosCierres = torneos
      .filter((torneo) => torneo.estado === "Abierto")
      .sort((a, b) => new Date(a.cierre) - new Date(b.cierre));

    mostrarTorneos(contenedorDestacados, destacados);
    mostrarCierres(contenedorCierres, proximosCierres);
  }

  function iniciarListadoTorneos() {
    const formulario = document.getElementById("formulario-filtros");
    const buscador = document.getElementById("buscador");
    const filtroJuego = document.getElementById("filtro-juego");
    const filtroEstado = document.getElementById("filtro-estado");
    const fechaInicio = document.getElementById("fecha-inicio");
    const fechaFin = document.getElementById("fecha-fin");
    const errorFechas = document.getElementById("error-fechas");
    const listaTorneos = document.getElementById("lista-torneos");
    const contador = document.getElementById("contador-resultados");
    const estadoVacio = document.getElementById("estado-vacio");
    const botonLimpiar = document.getElementById("limpiar-filtros");

    llenarJuegos(filtroJuego, torneos);

    function renderizarResultados() {
      const textoBuscado = normalizarTexto(buscador.value.trim());

      const resultados = torneos.filter((torneo) => {
        const textoDelTorneo = `${torneo.nombre} ${torneo.juego} ${torneo.modalidad}`;

        const coincideNombre = normalizarTexto(textoDelTorneo).includes(textoBuscado);
        const coincideJuego =
          filtroJuego.value === "todos" || torneo.juego === filtroJuego.value;
        const coincideEstado =
          filtroEstado.value === "todos" || torneo.estado === filtroEstado.value;

        const coincideFechaInicial =
          !fechaInicio.value || torneo.cierre >= fechaInicio.value;

        const coincideFechaFinal =
          !fechaFin.value || torneo.cierre <= fechaFin.value;

        return (
          coincideNombre &&
          coincideJuego &&
          coincideEstado &&
          coincideFechaInicial &&
          coincideFechaFinal
        );
      });

      mostrarTorneos(listaTorneos, resultados);

      contador.textContent = `${resultados.length} torneo(s) encontrado(s).`;
      estadoVacio.hidden = resultados.length !== 0;
      listaTorneos.hidden = resultados.length === 0;
    }

    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();

      // La fecha inicial no puede ser posterior a la fecha final.
      if (fechaInicio.value && fechaFin.value && fechaInicio.value > fechaFin.value) {
        errorFechas.textContent =
          "La fecha inicial no puede ser posterior a la fecha final.";
        listaTorneos.innerHTML = "";
        contador.textContent = "Corrige las fechas para ver los resultados.";
        estadoVacio.hidden = true;
        return;
      }

      errorFechas.textContent = "";
      renderizarResultados();
    });

    // El buscador responde mientras la persona escribe.
    buscador.addEventListener("input", () => {
      errorFechas.textContent = "";
      renderizarResultados();
    });

    filtroJuego.addEventListener("change", renderizarResultados);
    filtroEstado.addEventListener("change", renderizarResultados);

    botonLimpiar.addEventListener("click", () => {
      formulario.reset();
      errorFechas.textContent = "";
      renderizarResultados();
    });

    // Al abrir la página se muestran todos los torneos.
    renderizarResultados();
  }

  // Decide qué código usar según la página que se abrió.
  if (document.body.dataset.pagina === "inicio") {
    iniciarInicio();
  }

  if (document.body.dataset.pagina === "torneos") {
    iniciarListadoTorneos();
  }
})(window.ARENA);