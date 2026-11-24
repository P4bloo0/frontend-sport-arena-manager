import { solicitar } from "./api.js";

const estados = {
  BORRADOR: "Borrador",
  ABIERTO: "Abierto",
  EN_CURSO: "En curso",
  FINALIZADO: "Finalizado",
};

function etiqueta(valor) {
  const texto = valor.toLowerCase().replaceAll("_", " ");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

async function cargarDetalle(id, signal) {
  const errores = {};
  const consultar = (ruta, seccion) => solicitar(ruta, { signal }).catch((error) => {
    if (signal?.aborted) throw error;
    if (seccion) errores[seccion] = true;
    return [];
  });
  const [inscripciones, partidas, resultados, ranking, premios] = await Promise.all([
    consultar(`inscripciones/torneo/${id}`, "inscritos"),
    consultar(`partidas/torneo/${id}`, "partidas"),
    consultar(`resultados/torneo/${id}`, "resultados"),
    consultar(`rankings/torneo/${id}`, "ranking"),
    consultar(`torneos/${id}/premios`, "premios"),
  ]);

  const hayEquipos = inscripciones.some((i) => i.equipoId != null)
    || premios.some((premio) => premio.tipoParticipante === "EQUIPO");
  const hayJugadores = inscripciones.some((i) => i.jugadorId != null)
    || premios.some((premio) => premio.tipoParticipante === "INDIVIDUAL");
  const [equipos, jugadores] = await Promise.all([
    hayEquipos ? consultar("equipos") : [],
    hayJugadores ? consultar("usuarios/jugadores") : [],
  ]);
  const nombresEquipos = new Map(equipos.map((e) => [e.equipoId, e.nombre]));
  const nombresJugadores = new Map(jugadores.map((j) => [j.usuarioId, j.nickname || j.nombre]));
  const nombrePorTipo = (participanteId, esEquipo) => esEquipo
    ? nombresEquipos.get(participanteId) ?? `Equipo #${participanteId}`
    : nombresJugadores.get(participanteId) ?? `Jugador #${participanteId}`;
  const nombresParticipantes = new Map();
  const inscritos = inscripciones.map((i) => {
    const esEquipo = i.equipoId != null;
    const participanteId = i.equipoId ?? i.jugadorId;
    const nombre = nombrePorTipo(participanteId, esEquipo);

    // Partidas y ranking identifican al participante por ID sin indicar su tipo.
    const anterior = nombresParticipantes.get(participanteId);
    nombresParticipantes.set(participanteId,
      anterior != null && anterior !== nombre ? `Participante #${participanteId}` : nombre);
    return { id: i.inscripcionId, nombre, estado: etiqueta(i.estado), fecha: i.fechaInscripcion };
  });
  const nombreParticipante = (id) => id == null
    ? "Participante por definir"
    : nombresParticipantes.get(id) ?? `Participante #${id}`;

  function ganadorPremio({ participanteId, tipoParticipante }) {
    if (participanteId == null) return null;
    if (tipoParticipante === "EQUIPO" || tipoParticipante === "INDIVIDUAL") {
      return nombrePorTipo(participanteId, tipoParticipante === "EQUIPO");
    }
    return nombreParticipante(participanteId);
  }

  return {
    inscritos,
    errores,
    partidas: partidas.map((p) => ({
      id: p.partidaId,
      ronda: p.ronda,
      fechaHora: p.fechaHora?.replace("T", " ").slice(0, 16) ?? "Por definir",
      estado: etiqueta(p.estado),
      localNombre: nombreParticipante(p.participanteAId),
      visitanteNombre: nombreParticipante(p.participanteBId),
    })),
    resultados: resultados.filter((r) => r.estadoValidacion === "VALIDADO").map((r) => ({
      partidaId: r.partidaId,
      puntajeLocal: r.puntajeA,
      puntajeVisitante: r.puntajeB,
      validado: true,
    })),
    ranking: ranking.slice().sort((a, b) =>
      (a.posicion || Infinity) - (b.posicion || Infinity) ||
      b.puntos - a.puntos || b.diferencia - a.diferencia,
    ).map((r) => ({
      id: r.rankingId,
      nombre: nombreParticipante(r.participanteId),
      posicion: r.posicion || undefined,
      jugadas: r.victorias + r.derrotas,
      ganadas: r.victorias,
      perdidas: r.derrotas,
      diferencia: r.diferencia,
      puntos: r.puntos,
    })),
    premios: premios.map((premio) => ({ ...premio, ganador: ganadorPremio(premio) })),
  };
}

export const torneosApi = {
  cargarDetalle,
  async cargarCatalogo(signal) {
    const [torneos, juegos] = await Promise.all([
      solicitar("torneos", { signal }),
      solicitar("juegos", { signal }),
    ]);

    const juegosPorId = new Map(juegos.map((juego) => [juego.juegoId, juego]));

    return {
      juegos: juegos
        .filter((juego) => juego.estado)
        .map((juego) => ({ id: juego.juegoId, nombre: juego.nombre })),
      torneos: torneos.map((torneo) => ({
        id: torneo.torneoId,
        nombre: torneo.nombre,
        juegoId: torneo.juegoId,
        juego: juegosPorId.get(torneo.juegoId)?.nombre ?? `Juego #${torneo.juegoId}`,
        jugadoresPorEquipo: juegosPorId.get(torneo.juegoId)?.jugadoresPorEquipo,
        juegoActivo: juegosPorId.get(torneo.juegoId)?.estado,
        modalidad: torneo.modalidad,
        estado: estados[torneo.estado] ?? torneo.estado,
        fechaCierre: torneo.fechaCierreInscripcion,
        cierre: torneo.fechaCierreInscripcion?.slice(0, 10) ?? "",
        cupoMaximo: torneo.cupoMaximo,
        cupoActual: torneo.cupoActual ?? 0,
      })),
    };
  },
};
