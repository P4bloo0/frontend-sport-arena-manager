import { solicitar } from "./api.js";

export const equiposApi = {
  listarMios: (token, signal) => solicitar("equipos/mis", { token, signal }),
  juegos: (signal) => solicitar("juegos", { signal }),
  jugadores: (signal) => solicitar("usuarios/jugadores", { signal }),
  integrantes: (id, signal) => solicitar(`equipos/${id}/miembros`, { signal }),
  crear: (datos, token) => solicitar("equipos", { metodo: "POST", datos, token }),
  editar: (id, datos, token) => solicitar(`equipos/${id}`, { metodo: "PUT", datos, token }),
  agregar: (datos, token) => solicitar("equipos/miembros", { metodo: "POST", datos, token }),
  quitar: (id, usuarioId, token) => solicitar(`equipos/${id}/miembros/${usuarioId}`, {
    metodo: "DELETE", token,
  }),
};
