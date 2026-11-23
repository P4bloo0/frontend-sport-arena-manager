import { solicitar } from "./api.js";

export const perfilApi = {
  consultar: (token, signal) => solicitar("usuarios/me", { token, signal }),
  notificaciones: (token, signal) => solicitar("notificaciones/me", { token, signal }),
};
