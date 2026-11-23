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
  const consultar = (ruta) => solicitar(ruta, { signal });
  const [inscripciones, partidas, resultados, ranking, premios] = await Promise.all([
    consultar(`inscripciones/torneo/${id}`),
    consultar(`partidas/torneo/${id}`),
    consultar(`resultados/torneo/${id}`),
    consultar(`rankings/torneo/${id}`),
    consultar(`torneos/${id}/premios`),
  ]);

  const [equipos, jugadores] = await Promise.all([
    inscripciones.some((i) => i.equipoId != null) ? consultar("equipos") : [],
    inscripciones.some((i) => i.jugadorId != null) ? consultar("usuarios/jugadores") : [],
  ]);
  const nombresEquipos = new Map(equipos.map((e) => [e.equipoId, e.nombre]));
  const nombresJugadores = new Map(jugadores.map((j) => [j.usuarioId, j.nickname || j.nombre]));
  const nombresParticipantes = new Map();
  const inscritos = inscripciones.map((i) => {
    const esEquipo = i.equipoId != null;
    const participanteId = i.equipoId ?? i.jugadorId;
    const nombre = esEquipo
      ? nombresEquipos.get(participanteId) ?? `Equipo #${participanteId}`
      : nombresJugadores.get(participanteId) ?? `Jugador #${participanteId}`;

    // Partidas y ranking identifican al participante por ID sin indicar su tipo.
    const anterior = nombresParticipantes.get(participanteId);
    nombresParticipantes.set(participanteId,
      anterior != null && anterior !== nombre ? `Participante #${participanteId}` : nombre);
    return { id: i.inscripcionId, nombre, estado: etiqueta(i.estado), fecha: i.fechaInscripcion };
  });
  const nombreParticipante = (id) => id == null
    ? "Participante por definir"
    : nombresParticipantes.get(id) ?? `Participante #${id}`;

  return {
    inscritos,
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
    premios,
  };
}

export const torneosApi = {
  cargarDetalle,
  async cargarCatalogo(signal) {
    const [torneos, juegos] = await Promise.all([
      solicitar("torneos", { signal }),
      solicitar("juegos", { signal }),
    ]);

    const nombres = new Map(juegos.map((juego) => [juego.juegoId, juego.nombre]));

    return {
      juegos: juegos
        .filter((juego) => juego.estado)
        .map((juego) => ({ id: juego.juegoId, nombre: juego.nombre })),
      torneos: torneos.map((torneo) => ({
        id: torneo.torneoId,
        nombre: torneo.nombre,
        juegoId: torneo.juegoId,
        juego: nombres.get(torneo.juegoId) ?? `Juego #${torneo.juegoId}`,
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
