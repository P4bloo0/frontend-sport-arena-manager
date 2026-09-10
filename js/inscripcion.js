window.ARENA = window.ARENA || {};

(function (ARENA) {
  const { fechaLegible } = ARENA.utiles;
  const { reglas, validarFormulario, esValido, pintarError } = ARENA.validacion;
  const ROLES_INSCRIBEN = "Jugador Organizador Administrador";

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

  const form = () => document.getElementById("form-inscripcion");
  const tipoActual = () => form().elements.tipo.value;

  function torneoPorId(id) {
    return ARENA.torneos.find((torneo) => torneo.id === Number(id)) || null;
  }

  function juegoPorNombre(nombre) {
    return (ARENA.juegos || []).find((juego) => juego.nombre === nombre) || null;
  }

  function equipoPorId(id) {
    return ARENA.equipos.find((equipo) => equipo.id === Number(id)) || null;
  }

  function jugadorPorId(id) {
    return ARENA.jugadores.find((jugador) => jugador.id === Number(id)) || null;
  }

  const esquema = {
    torneo: [reglas.requerido("Selecciona un torneo.")],
    participante: [reglas.requerido("Selecciona el participante.")],
    correo: [reglas.requerido("El correo de contacto es obligatorio."), reglas.correo()],
    seed: [reglas.rango(1, 16, "El seed debe estar entre 1 y 16.")],
    acepta: [(valor) => (valor === true ? "" : "Debes aceptar los requisitos del torneo.")]
  };

  function inscripcionesVigentes(torneoId) {
    return (ARENA.inscripciones || []).filter(
      (inscripcion) => inscripcion.torneoId === torneoId && inscripcion.estado !== "Rechazada"
    );
  }

  function sancionVigenteDe(participanteId) {
    const ahora = hoy();
    return (
      (ARENA.sanciones || []).find(
        (sancion) => sancion.participanteId === participanteId && sancion.inicio <= ahora && ahora <= sancion.fin
      ) || null
    );
  }

  function calcularBloqueos() {
    const torneo = torneoPorId(form().elements.torneo.value);
    const bloqueos = [];
    if (!torneo) return bloqueos;{
    }

    if (torneo.estado !== "Abierto") {
      bloqueos.push(`El torneo no admite inscripciones (estado: ${torneo.estado}).`);
    }
    if (hoy() > torneo.cierre) {
      bloqueos.push(`El plazo de inscripción cerró el ${fechaLegible(torneo.cierre)}.`);
    }
    const ocupados = inscripcionesVigentes(torneo.id).length;

    if (ocupados >= torneo.cupoMaximo) {
      bloqueos.push(`El torneo llegó a su cupo máximo (${torneo.cupoMaximo}).`);
    }

    const idParticipante = form().elements.participante.value;
    if (!idParticipante) return bloqueos;

    if (tipoActual() === "equipo") {
      const equipo = equipoPorId(idParticipante);
      if (equipo) {
        if (inscripcionesVigentes(torneo.id).some((inscripcion) => inscripcion.equipoId === equipo.id)) {
          bloqueos.push("Ese equipo ya tiene una inscripción vigente en este torneo.");
        }
        if (!equipo.activo) {
          bloqueos.push("El equipo está inactivo y no puede inscribirse.");
        }
        if (equipo.juego !== torneo.juego) {
          bloqueos.push(`El equipo juega ${equipo.juego} y el torneo es de ${torneo.juego}.`);
        }
        const juego = juegoPorNombre(torneo.juego);
        if (juego && equipo.integrantes.length < juego.minIntegrantes) {
          bloqueos.push(
            `El equipo tiene ${equipo.integrantes.length} integrante(s) y el juego exige al menos ${juego.minIntegrantes}.`
          );
        }
        const sancion = sancionVigenteDe(equipo.id);
        if (sancion) bloqueos.push(`El equipo tiene una sanción vigente: ${sancion.motivo}.`);
      }
    } else {
      const sancion = sancionVigenteDe(Number(idParticipante));
      if (sancion) bloqueos.push(`El jugador tiene una sanción vigente: ${sancion.motivo}.`);
    }

    return bloqueos;
  }

  function refrescarParticipantes() {
    const tipo = tipoActual();
    const select = form().elements.participante;
    document.getElementById("label-participante").textContent = tipo === "equipo" ? "Equipo" : "Jugador";
    document.getElementById("ayuda-participante").textContent =
      tipo === "equipo"
        ? "Debe coincidir con el juego del torneo."
        : "Jugador individual (para torneos en solitario).";

    const previo = select.value;
    const opciones =
      tipo === "equipo"
        ? ARENA.equipos.map(
            (equipo) => `<option value="${equipo.id}">${escaparHTML(equipo.nombre)} (${escaparHTML(equipo.juego)})</option>`
          )
        : ARENA.jugadores.map((jugador) => `<option value="${jugador.id}">${escaparHTML(jugador.nombre)}</option>`);
    select.innerHTML = '<option value="">Selecciona</option>' + opciones.join("");
    if (Array.from(select.options).some((opcion) => opcion.value === previo)) select.value = previo;
  }

  function refrescarResumen() {
    const zona = document.getElementById("resumen-torneo");
    const torneo = torneoPorId(form().elements.torneo.value);
    if (!torneo) {
      zona.innerHTML = '<p class="aviso-vacio">Selecciona un torneo para ver sus requisitos.</p>';
      return;
    }
    const juego = juegoPorNombre(torneo.juego);
    const fuera = hoy() > torneo.cierre;
    zona.innerHTML = `
      <dl class="ficha-datos">
        <div><dt>Estado</dt><dd>${escaparHTML(torneo.estado)}</dd></div>
        <div><dt>Juego</dt><dd>${escaparHTML(torneo.juego)}</dd></div>
        <div><dt>Integrantes mínimos</dt><dd>${juego ? juego.minIntegrantes : "-"}</dd></div>
        <div><dt>Cupos</dt><dd>${torneo.ocupados} / ${torneo.cupoMaximo}</dd></div>
        <div><dt>Cierre de inscripción</dt><dd>${fechaLegible(torneo.cierre)}</dd></div>
        <div><dt>Plazo</dt><dd>${fuera ? "Cerrado" : "Abierto"}</dd></div>
      </dl>`;
  }

  function refrescarEstado() {
    const bloqueos = calcularBloqueos();
    const zona = document.getElementById("bloqueos");
    if (bloqueos.length) {
      zona.innerHTML = `
        <div class="aviso aviso-error">
          <p>No se puede inscribir todavía:</p>
          <ul class="lista-bloqueos">${bloqueos.map((texto) => `<li>${escaparHTML(texto)}</li>`).join("")}</ul>
        </div>`;
    } else {
      zona.innerHTML = '<p class="aviso aviso-ok">Todos los requisitos se cumplen: la inscripción se puede enviar.</p>';
    }

    const formatoOk = esValido(form(), esquema);
    const permiso = ARENA.sesion.puede(ROLES_INSCRIBEN);
    form().querySelector('[type="submit"]').disabled = !formatoOk || bloqueos.length > 0 || !permiso;
  }

  function alEnviar(evento) {
    evento.preventDefault();
    const resultado = validarFormulario(form(), esquema);
    if (!resultado.valido) {
      const primero = form().querySelector(".invalido");
      if (primero) primero.focus();
      return;
    }
    if (calcularBloqueos().length || !ARENA.sesion.puede(ROLES_INSCRIBEN)) {
      refrescarEstado();
      return;
    }

    const torneo = torneoPorId(form().elements.torneo.value);
    const tipo = tipoActual();
    const idParticipante = form().elements.participante.value;
    const participante =
      tipo === "equipo" ? equipoPorId(idParticipante) : jugadorPorId(idParticipante);
    const seed = form().elements.seed.value;

    ARENA.inscripciones.push({
      id: Math.max(0, ...ARENA.inscripciones.map((inscripcion) => inscripcion.id)) + 1,
      torneoId: torneo.id,
      equipoId: tipo === "equipo" ? Number(idParticipante) : null,
      estado: "Pendiente",
      fecha: hoy()
    });

    document.getElementById("detalle-confirmacion").innerHTML = `
      <div class="tabla-scroll">
        <table class="tabla">
          <tbody>
            <tr><td>Torneo</td><td>${escaparHTML(torneo.nombre)}</td></tr>
            <tr><td>Participante</td><td>${escaparHTML(participante ? participante.nombre : "-")} (${escaparHTML(tipo)})</td></tr>
            <tr><td>Seed solicitado</td><td>${seed ? escaparHTML(seed) : "sin preferencia"}</td></tr>
            <tr><td>Correo</td><td>${escaparHTML(form().elements.correo.value)}</td></tr>
            <tr><td>Fecha</td><td>${fechaLegible(hoy())}</td></tr>
            <tr><td>Estado</td><td>Pendiente de revisión</td></tr>
          </tbody>
        </table>
      </div>`;
    document.getElementById("confirmacion").hidden = false;
    document.getElementById("confirmacion").scrollIntoView({ behavior: "smooth" });
  }

  function iniciar() {
    if (document.body.dataset.pagina !== "inscripcion") return;

    form().elements.torneo.insertAdjacentHTML(
      "beforeend",
      ARENA.torneos
        .map((torneo) => `<option value="${torneo.id}">${escaparHTML(torneo.nombre)} (${escaparHTML(torneo.estado)})</option>`)
        .join("")
    );

    refrescarParticipantes();
    refrescarResumen();
    refrescarEstado();

    form().addEventListener("change", (evento) => {
      if (evento.target.name === "tipo" || evento.target.name === "torneo") {
        refrescarParticipantes();
        refrescarResumen();
      }
      refrescarEstado();
    });
    form().addEventListener("input", refrescarEstado);
    form().addEventListener("focusout", (evento) => {
      const nombre = evento.target.name;
      if (nombre && esquema[nombre]) {
        validarFormulario(form(), { [nombre]: esquema[nombre] });
      }
    });
    form().addEventListener("submit", alEnviar);
    document.addEventListener("arena:rol", refrescarEstado);
  }

  iniciar();
})(window.ARENA);
