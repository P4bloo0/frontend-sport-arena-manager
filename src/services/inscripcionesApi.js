import { solicitar } from "./api.js";

export const inscripcionesApi = {
  crear: (datos, token) => solicitar("inscripciones", { metodo: "POST", datos, token }),
  ocupados: (id) => solicitar(`inscripciones/cupos/${id}`),
  delJugador: (id, token, signal) => solicitar(`inscripciones/jugador/${id}`, { token, signal }),
  delEquipo: (id, token, signal) => solicitar(`inscripciones/equipo/${id}`, { token, signal }),
};
