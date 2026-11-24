import { solicitar } from "./api.js";
import { equiposApi } from "./equiposApi.js";
import { inscripcionesApi } from "./inscripcionesApi.js";

async function calcularEstadisticas(inscripciones, signal) {
  const porTorneo = new Map();
  for (const { torneoId, jugadorId, equipoId } of inscripciones) {
    if (!porTorneo.has(torneoId)) porTorneo.set(torneoId, new Set());
    porTorneo.get(torneoId).add(equipoId ?? jugadorId);
  }

  const totales = { ganadas: 0, perdidas: 0, torneosJugados: 0 };
  const rankings = await Promise.all([...porTorneo].map(async ([torneoId, participantes]) => {
    const filas = await solicitar(`rankings/torneo/${torneoId}`, { signal });
    return filas.filter((fila) => participantes.has(fila.participanteId));
  }));

  for (const filas of rankings) {
    let jugado = false;
    for (const { victorias, derrotas } of filas) {
      totales.ganadas += victorias;
      totales.perdidas += derrotas;
      jugado ||= victorias > 0 || derrotas > 0;
    }
    if (jugado) totales.torneosJugados += 1;
  }
  return totales;
}

async function competitivo(usuarioId, token, signal) {
  const [equipos, individuales] = await Promise.all([
    equiposApi.listarMios(token, signal),
    inscripcionesApi.delJugador(usuarioId, token, signal),
  ]);
  const porEquipo = await Promise.all(equipos.map(({ equipoId }) => inscripcionesApi.delEquipo(equipoId, token, signal)));
  const inscripciones = [...individuales, ...porEquipo.flat()];
  const [torneos, ranking] = await Promise.all([
    inscripciones.length ? solicitar("torneos", { signal }) : [],
    calcularEstadisticas(inscripciones, signal).catch((error) => {
      if (signal.aborted) throw error;
      return null;
    }),
  ]);
  const nombresTorneos = new Map(torneos.map((torneo) => [torneo.torneoId, torneo.nombre]));
  const nombresEquipos = new Map(equipos.map((equipo) => [equipo.equipoId, equipo.nombre]));
  const historial = inscripciones
    .sort((a, b) => b.fechaInscripcion.localeCompare(a.fechaInscripcion))
    .map((inscripcion) => ({
      ...inscripcion,
      torneo: nombresTorneos.get(inscripcion.torneoId) ?? `Torneo #${inscripcion.torneoId}`,
      participante: inscripcion.equipoId == null ? "Individual"
        : nombresEquipos.get(inscripcion.equipoId) ?? `Equipo #${inscripcion.equipoId}`,
    }));

  return { equipos, historial, ranking };
}

export const perfilApi = {
  consultar: (token, signal) => solicitar("usuarios/me", { token, signal }),
  competitivo,
  notificaciones: (token, signal) => solicitar("notificaciones/me", { token, signal }),
};
