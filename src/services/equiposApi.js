import { solicitar } from "./api.js";

export const equiposApi = {
  listar: (signal) => solicitar("equipos", { signal }),
  listarMios: (token, signal) => solicitar("equipos/mis", { token, signal }),
  juegos: (signal) => solicitar("juegos", { signal }),
  jugadores: (signal) => solicitar("usuarios/jugadores", { signal }),
  integrantes: (id, signal) => solicitar(`equipos/${id}/miembros`, { signal }),
  crear: (datos, token) => solicitar("equipos", { metodo: "POST", datos, token }),
  editar: (id, datos, token) => solicitar(`equipos/${id}`, { metodo: "PUT", datos, token }),
  desactivar: (id, token) => solicitar(`equipos/${id}`, { metodo: "DELETE", token }),
  agregar: (datos, token) => solicitar("equipos/miembros", { metodo: "POST", datos, token }),
  quitar: (id, usuarioId, token) => solicitar(`equipos/${id}/miembros/${usuarioId}`, {
    metodo: "DELETE", token,
  }),
};
