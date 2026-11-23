import { solicitar } from "./api.js";

export const organizacionApi = {
  equipos: (signal) => solicitar("equipos", { signal }),
  inscripciones: (id, token, signal) => solicitar(`inscripciones/torneo/${id}`, { token, signal }),
  actualizarInscripcion: (id, estado, token) => solicitar(
    `inscripciones/${id}/estado?nuevoEstado=${estado}`, { metodo: "PUT", token },
  ),
  cancelarInscripcion: (id, token) => solicitar(`inscripciones/${id}`, { metodo: "DELETE", token }),
  partidas: (id, signal) => solicitar(`partidas/torneo/${id}`, { signal }),
  guardarPartida: (id, datos, token) => solicitar(id ? `partidas/${id}` : "partidas", {
    metodo: id ? "PUT" : "POST", datos, token,
  }),
  cambiarEstadoPartida: (id, estado, token) => solicitar(`partidas/${id}/estado?nuevo=${estado}`, {
    metodo: "PATCH", token,
  }),
  cancelarPartida: (id, token) => solicitar(`partidas/${id}`, { metodo: "DELETE", token }),
  resultados: (id, signal) => solicitar(`resultados/torneo/${id}`, { signal }),
  guardarResultado: (id, datos, token) => solicitar(id ? `resultados/${id}` : "resultados", {
    metodo: id ? "PUT" : "POST", datos, token,
  }),
  validarResultado: (id, token) => solicitar(`resultados/${id}/validar`, { metodo: "PATCH", token }),
  anularResultado: (id, justificacion, token) => solicitar(`resultados/${id}/anular`, {
    metodo: "PATCH", datos: { justificacion }, token,
  }),
  sanciones: (token, signal) => solicitar("sanciones", { token, signal }),
  guardarSancion: (id, datos, token) => solicitar(id ? `sanciones/${id}` : "sanciones", {
    metodo: id ? "PUT" : "POST", datos, token,
  }),
  cerrarSancion: (id, token) => solicitar(`sanciones/${id}`, { metodo: "DELETE", token }),
};
