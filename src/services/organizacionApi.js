import { solicitar } from "./api.js";

export const organizacionApi = {
  equipos: (signal) => solicitar("equipos", { signal }),
  inscripciones: (id, token, signal) => solicitar(`inscripciones/torneo/${id}`, { token, signal }),
  actualizarInscripcion: (id, estado, token) => solicitar(
    `inscripciones/${id}/estado?nuevoEstado=${estado}`, { metodo: "PUT", token },
  ),
  cancelarInscripcion: (id, token) => solicitar(`inscripciones/${id}`, { metodo: "DELETE", token }),
  sanciones: (token, signal) => solicitar("sanciones", { token, signal }),
  guardarSancion: (id, datos, token) => solicitar(id ? `sanciones/${id}` : "sanciones", {
    metodo: id ? "PUT" : "POST", datos, token,
  }),
  cerrarSancion: (id, token) => solicitar(`sanciones/${id}`, { metodo: "DELETE", token }),
};
