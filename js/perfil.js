window.ARENA = window.ARENA || {};

(function (ARENA) {
  const { fechaLegible } = ARENA.utiles;
  const { reglas, conectar } = ARENA.validacion;

  function escaparHTML(texto) {
    return String(texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function hoy() {
    return new Date().toISOString().slice(0, 10);
  }

  function jugadorPorId(id) {
    return ARENA.jugadores.find((jugador) => jugador.id === Number(id)) || null;
  }

  function torneoPorId(id) {
    return ARENA.torneos.find((torneo) => torneo.id === id) || null;
  }

  function equiposDe(jugadorId) {
    return ARENA.equipos.filter((equipo) =>
      equipo.integrantes.some((integrante) => integrante.jugadorId === jugadorId)
    );
  }

  function sancionesDe(jugadorId, idsEquipos) {
    return (ARENA.sanciones || []).filter(
      (sancion) => sancion.participanteId === jugadorId || idsEquipos.includes(sancion.participanteId)
    );
  }

  function sancionVigente(sancion) {
    const ahora = hoy();
    return sancion.inicio <= ahora && ahora <= sancion.fin;
  }

  function estadisticas(idsEquipos) {
    const partidas = (ARENA.partidas || []).filter(
      (partida) => idsEquipos.includes(partida.localId) || idsEquipos.includes(partida.visitanteId)
    );
    const idsPartidas = partidas.map((partida) => partida.id);
    const resultados = (ARENA.resultados || []).filter(
      (resultado) => idsPartidas.includes(resultado.partidaId) && resultado.validado
    );

    let ganadas = 0;
    let perdidas = 0;
    resultados.forEach((resultado) => {
      if (idsEquipos.includes(resultado.ganadorId)) ganadas += 1;
      else perdidas += 1;
    });

    const torneosJugados = new Set(partidas.map((partida) => partida.torneoId)).size;
    return { ganadas, perdidas, torneosJugados };
  }

  function bloqueFicha(jugador, conSancion) {
    return `
      <dl class="ficha-datos">
        <div><dt>Nombre</dt><dd>${escaparHTML(jugador.nombre)}</dd></div>
        <div><dt>Apodo</dt><dd>${escaparHTML(jugador.apodo)}</dd></div>
        <div><dt>Correo</dt><dd>${escaparHTML(jugador.correo || "Sin registrar")}</dd></div>
        <div><dt>País</dt><dd>${escaparHTML(jugador.pais || "Sin registrar")}</dd></div>
        <div><dt>Estado</dt><dd>${conSancion ? "Con sanción vigente" : "Habilitado"}</dd></div>
      </dl>`;
  }

  function bloqueEquipos(jugadorId, equipos) {
    if (!equipos.length) {
      return '<p class="aviso-vacio">Este jugador no pertenece a ningún equipo.</p>';
    }
    const filas = equipos
      .map((equipo) => {
        const integrante = equipo.integrantes.find((miembro) => miembro.jugadorId === jugadorId);
        return `
        <tr>
          <td>${escaparHTML(equipo.nombre)}</td>
          <td>${escaparHTML(integrante ? integrante.rol : "-")}</td>
          <td>${equipo.activo ? "Activo" : "Inactivo"}</td>
        </tr>`;
      })
      .join("");
    return `
      <div class="tabla-scroll">
        <table class="tabla">
          <thead><tr><th>Equipo</th><th>Rol</th><th>Estado</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>`;
  }

  function bloqueStats(stats) {
    return `
      <dl class="ficha-datos">
        <div><dt>Partidas ganadas</dt><dd>${stats.ganadas}</dd></div>
        <div><dt>Partidas perdidas</dt><dd>${stats.perdidas}</dd></div>
        <div><dt>Torneos jugados</dt><dd>${stats.torneosJugados}</dd></div>
      </dl>`;
  }

  function bloqueHistorial(idsEquipos) {
    const inscripciones = (ARENA.inscripciones || []).filter((inscripcion) =>
      idsEquipos.includes(inscripcion.equipoId)
    );
    if (!inscripciones.length) {
      return '<p class="aviso-vacio">Sin inscripciones registradas.</p>';
    }
    const filas = inscripciones
      .map((inscripcion) => {
        const torneo = torneoPorId(inscripcion.torneoId);
        const equipo = ARENA.equipos.find((posible) => posible.id === inscripcion.equipoId);
        return `
        <tr>
          <td>${escaparHTML(torneo ? torneo.nombre : "Torneo " + inscripcion.torneoId)}</td>
          <td>${escaparHTML(equipo ? equipo.nombre : "-")}</td>
          <td><span class="estado estado-${inscripcion.estado.toLowerCase()}">${escaparHTML(inscripcion.estado)}</span></td>
          <td>${fechaLegible(inscripcion.fecha)}</td>
        </tr>`;
      })
      .join("");
    return `
      <div class="tabla-scroll">
        <table class="tabla">
          <thead><tr><th>Torneo</th><th>Equipo</th><th>Inscripción</th><th>Fecha</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>`;
  }

  function bloqueSanciones(sanciones) {
    if (!sanciones.length) {
      return '<p class="aviso-vacio">Sin sanciones registradas.</p>';
    }
    const filas = sanciones
      .map(
        (sancion) => `
      <tr>
        <td>${escaparHTML(sancion.motivo)}</td>
        <td>${fechaLegible(sancion.inicio)}</td>
        <td>${fechaLegible(sancion.fin)}</td>
        <td>${sancionVigente(sancion) ? "Vigente" : "Cumplida"}</td>
      </tr>`
      )
      .join("");
    return `
      <div class="tabla-scroll">
        <table class="tabla">
          <thead><tr><th>Motivo</th><th>Desde</th><th>Hasta</th><th>Estado</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>`;
  }

  function render(jugadorId) {
    const jugador = jugadorPorId(jugadorId);
    if (!jugador) return;

    const equipos = equiposDe(jugador.id);
    const idsEquipos = equipos.map((equipo) => equipo.id);
    const sanciones = sancionesDe(jugador.id, idsEquipos);
    const conSancion = sanciones.some(sancionVigente);

    document.getElementById("ficha").innerHTML = bloqueFicha(jugador, conSancion);
    document.getElementById("pf-equipos").innerHTML = bloqueEquipos(jugador.id, equipos);
    document.getElementById("pf-stats").innerHTML = bloqueStats(estadisticas(idsEquipos));
    document.getElementById("pf-historial").innerHTML = bloqueHistorial(idsEquipos);
    document.getElementById("pf-sanciones").innerHTML = bloqueSanciones(sanciones);

    const formulario = document.getElementById("form-perfil");
    formulario.elements.apodo.value = jugador.apodo;
    formulario.elements.correo.value = jugador.correo || "";
    document.getElementById("pf-guardado").innerHTML = "";
  }

  function iniciar() {
    if (document.body.dataset.pagina !== "perfil") return;

    const selector = document.getElementById("selector-jugador");
    selector.innerHTML = ARENA.jugadores
      .map((jugador) => `<option value="${jugador.id}">${escaparHTML(jugador.nombre)} (${escaparHTML(jugador.apodo)})</option>`)
      .join("");
    selector.addEventListener("change", () => render(Number(selector.value)));

    conectar(
      document.getElementById("form-perfil"),
      {
        apodo: [reglas.requerido("El apodo es obligatorio."), reglas.sinEspacios("El apodo no admite espacios."), reglas.minLongitud(3), reglas.maxLongitud(16)],
        correo: [reglas.requerido("El correo es obligatorio."), reglas.correo()]
      },
      (datos) => {
        document.getElementById("pf-guardado").innerHTML =
          `<p class="aviso aviso-ok">Datos actualizados (simulado) para "${escaparHTML(datos.apodo)}".</p>`;
      }
    );

    render(Number(selector.value));
  }

  iniciar();
})(window.ARENA);
