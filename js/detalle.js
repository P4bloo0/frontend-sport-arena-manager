window.ARENA = window.ARENA || {};

(function (ARENA) {
  const { fechaLegible } = ARENA.utiles;

  function escaparHTML(texto) {
    return String(texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function claseEstado(estado) {
    return String(estado).toLowerCase().replace(/\s+/g, "-");
  }

  function insigniaEstado(estado) {
    return `<span class="estado estado-${claseEstado(estado)}">${escaparHTML(estado)}</span>`;
  }

  function torneoPorId(id) {
    return ARENA.torneos.find((torneo) => torneo.id === id) || null;
  }

  function equipoPorId(id) {
    return (ARENA.equipos || []).find((equipo) => equipo.id === id) || null;
  }

  function nombreParticipante(id) {
    if (id === null || id === undefined) return "Participante por definir";
    const equipo = equipoPorId(id);
    return equipo ? equipo.nombre : "Participante " + id;
  }

  function cuposDisponibles(torneo) {
    return Math.max(0, torneo.cupoMaximo - torneo.ocupados);
  }

  function ordenarPosiciones(filas) {
    return [...filas].sort((a, b) =>
      b.puntos !== a.puntos ? b.puntos - a.puntos : b.diferencia - a.diferencia
    );
  }

  function construirTablaPosiciones(torneoId) {
    const partidas = (ARENA.partidas || []).filter((partida) => partida.torneoId === torneoId);
    const idsPartidas = partidas.map((partida) => partida.id);
    const resultados = (ARENA.resultados || []).filter(
      (resultado) => idsPartidas.includes(resultado.partidaId) && resultado.validado
    );

    const participantes = new Set();
    partidas.forEach((partida) => {
      if (partida.localId !== null && partida.localId !== undefined) participantes.add(partida.localId);
      if (partida.visitanteId !== null && partida.visitanteId !== undefined) participantes.add(partida.visitanteId);
    });

    const filas = [...participantes].map((equipoId) => {
      let ganadas = 0;
      let perdidas = 0;
      let aFavor = 0;
      let enContra = 0;

      resultados.forEach((resultado) => {
        const partida = partidas.find((p) => p.id === resultado.partidaId);
        const esLocal = partida.localId === equipoId;
        const esVisitante = partida.visitanteId === equipoId;
        if (!esLocal && !esVisitante) return;

        aFavor += esLocal ? resultado.puntajeLocal : resultado.puntajeVisitante;
        enContra += esLocal ? resultado.puntajeVisitante : resultado.puntajeLocal;
        if (resultado.ganadorId === equipoId) ganadas += 1;
        else perdidas += 1;
      });

      return {
        equipoId,
        nombre: nombreParticipante(equipoId),
        jugadas: ganadas + perdidas,
        ganadas,
        perdidas,
        aFavor,
        enContra,
        diferencia: aFavor - enContra,
        puntos: ganadas * 3
      };
    });

    return ordenarPosiciones(filas);
  }

  function bloqueDatos(torneo) {
    return `
      <dl class="ficha-datos">
        <div><dt>Juego</dt><dd>${escaparHTML(torneo.juego)}</dd></div>
        <div><dt>Modalidad</dt><dd>${escaparHTML(torneo.modalidad)}</dd></div>
        <div><dt>Estado</dt><dd>${insigniaEstado(torneo.estado)}</dd></div>
        <div><dt>Cupo</dt><dd>${torneo.ocupados} / ${torneo.cupoMaximo}</dd></div>
        <div><dt>Cupos disponibles</dt><dd>${cuposDisponibles(torneo)}</dd></div>
        <div><dt>Cierre de inscripcion</dt><dd>${fechaLegible(torneo.cierre)}</dd></div>
      </dl>`;
  }

  function bloqueParticipantes(torneoId) {
    const inscripciones = (ARENA.inscripciones || []).filter((inscripcion) => inscripcion.torneoId === torneoId);
    if (!inscripciones.length) {
      return `<p class="aviso-vacio">Todavia no hay participantes inscritos.</p>`;
    }
    const filas = inscripciones
      .map(
        (inscripcion) => `
      <tr>
        <td>${escaparHTML(nombreParticipante(inscripcion.equipoId))}</td>
        <td>${insigniaEstado(inscripcion.estado)}</td>
        <td>${fechaLegible(inscripcion.fecha)}</td>
      </tr>`
      )
      .join("");
    return `
      <div class="tabla-scroll">
        <table class="tabla">
          <thead><tr><th>Equipo</th><th>Estado</th><th>Inscrito</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>`;
  }

  function bloqueLlave(torneoId) {
    const partidas = (ARENA.partidas || []).filter((partida) => partida.torneoId === torneoId);
    if (!partidas.length) {
      return `<p class="aviso-vacio">La llave todavia no esta definida.</p>`;
    }
    const rondas = [];
    partidas.forEach((partida) => {
      let grupo = rondas.find((ronda) => ronda.nombre === partida.ronda);
      if (!grupo) {
        grupo = { nombre: partida.ronda, partidas: [] };
        rondas.push(grupo);
      }
      grupo.partidas.push(partida);
    });
    const columnas = rondas
      .map(
        (grupo) => `
      <div class="llave-ronda">
        <h4>${escaparHTML(grupo.nombre)}</h4>
        ${grupo.partidas
          .map(
            (partida) => `
          <div class="llave-cruce">
            <span>${escaparHTML(nombreParticipante(partida.localId))}</span>
            <span>${escaparHTML(nombreParticipante(partida.visitanteId))}</span>
          </div>`
          )
          .join("")}
      </div>`
      )
      .join("");
    return `<div class="llave">${columnas}</div>`;
  }

  function bloqueCalendario(torneoId) {
    const partidas = (ARENA.partidas || []).filter((partida) => partida.torneoId === torneoId);
    if (!partidas.length) {
      return `<p class="aviso-vacio">No hay partidas programadas.</p>`;
    }
    const filas = partidas
      .map((partida) => {
        const resultado = (ARENA.resultados || []).find((r) => r.partidaId === partida.id);
        const marcador = resultado ? `${resultado.puntajeLocal} - ${resultado.puntajeVisitante}` : "-";
        return `
        <tr>
          <td>${escaparHTML(partida.ronda)}</td>
          <td>${escaparHTML(nombreParticipante(partida.localId))} vs ${escaparHTML(nombreParticipante(partida.visitanteId))}</td>
          <td>${escaparHTML(partida.fechaHora)}</td>
          <td>${insigniaEstado(partida.estado)}</td>
          <td>${marcador}</td>
        </tr>`;
      })
      .join("");
    return `
      <div class="tabla-scroll">
        <table class="tabla">
          <thead><tr><th>Ronda</th><th>Enfrentamiento</th><th>Fecha y hora</th><th>Estado</th><th>Resultado</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>`;
  }

  function bloquePosiciones(torneoId) {
    const filas = construirTablaPosiciones(torneoId);
    if (!filas.length) {
      return `<p class="aviso-vacio">La tabla se genera con los resultados validados.</p>`;
    }
    const cuerpo = filas
      .map(
        (fila, indice) => `
      <tr>
        <td>${indice + 1}</td>
        <td>${escaparHTML(fila.nombre)}</td>
        <td>${fila.jugadas}</td>
        <td>${fila.ganadas}</td>
        <td>${fila.perdidas}</td>
        <td>${fila.diferencia > 0 ? "+" : ""}${fila.diferencia}</td>
        <td>${fila.puntos}</td>
      </tr>`
      )
      .join("");
    return `
      <div class="tabla-scroll">
        <table class="tabla">
          <thead><tr><th>#</th><th>Equipo</th><th>PJ</th><th>PG</th><th>PP</th><th>Dif</th><th>Pts</th></tr></thead>
          <tbody>${cuerpo}</tbody>
        </table>
      </div>`;
  }

  function bloquePremios(torneoId) {
    const premios = (ARENA.premios || []).filter((premio) => premio.torneoId === torneoId);
    if (!premios.length) {
      return `<p class="aviso-vacio">Este torneo no tiene premios registrados.</p>`;
    }
    const filas = premios
      .map((premio) => `<tr><td>${premio.posicion}</td><td>${escaparHTML(premio.descripcion)}</td></tr>`)
      .join("");
    return `
      <div class="tabla-scroll">
        <table class="tabla">
          <thead><tr><th>Puesto</th><th>Premio</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>`;
  }

  function render(torneoId) {
    const contenedor = document.getElementById("contenido-torneo");
    if (!contenedor) return;

    const torneo = torneoPorId(torneoId);
    if (!torneo) {
      contenedor.innerHTML = `<p class="aviso-vacio">No encontramos ese torneo.</p>`;
      return;
    }

    contenedor.innerHTML = `
      <article class="detalle-torneo">
        <header class="detalle-encabezado">
          <h2>${escaparHTML(torneo.nombre)}</h2>
          ${insigniaEstado(torneo.estado)}
        </header>
        <section><h3>Datos generales</h3>${bloqueDatos(torneo)}</section>
        <section><h3>Participantes inscritos</h3>${bloqueParticipantes(torneoId)}</section>
        <section><h3>Llave</h3>${bloqueLlave(torneoId)}</section>
        <section><h3>Calendario de partidas</h3>${bloqueCalendario(torneoId)}</section>
        <section><h3>Tabla de posiciones</h3>${bloquePosiciones(torneoId)}</section>
        <section><h3>Premios</h3>${bloquePremios(torneoId)}</section>
      </article>`;
  }

  function iniciarDetalle() {
    const selector = document.getElementById("selector-torneo");
    const parametro = Number(new URLSearchParams(window.location.search).get("id"));
    const idInicial = ARENA.torneos.some((torneo) => torneo.id === parametro)
      ? parametro
      : ARENA.torneos[0].id;

    if (selector) {
      selector.innerHTML = ARENA.torneos
        .map((torneo) => `<option value="${torneo.id}">${escaparHTML(torneo.nombre)}</option>`)
        .join("");
      selector.value = String(idInicial);
      selector.addEventListener("change", () => {
        const nuevoId = Number(selector.value);
        const url = new URL(window.location.href);
        url.searchParams.set("id", selector.value);
        window.history.replaceState({}, "", url);
        render(nuevoId);
      });
    }

    render(idInicial);
  }

  ARENA.detalle = { construirTablaPosiciones, ordenarPosiciones };

  if (document.body.dataset.pagina === "detalle") {
    iniciarDetalle();
  }
})(window.ARENA);
