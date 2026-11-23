import { solicitar } from "./api.js";

export const administracionApi = {
  juegos: (signal) => solicitar("juegos", { signal }),
  torneos: (signal) => solicitar("torneos", { signal }),
  guardarJuego: (id, datos, token) => solicitar(id ? `juegos/${id}` : "juegos", {
    metodo: id ? "PUT" : "POST", datos, token,
  }),
  desactivarJuego: (id, token) => solicitar(`juegos/${id}`, { metodo: "DELETE", token }),
  guardarTorneo: (id, datos, token) => solicitar(id ? `torneos/${id}` : "torneos", {
    metodo: id ? "PUT" : "POST", datos, token,
  }),
  cambiarEstado: (id, estado, token) => solicitar(`torneos/${id}/estado?nuevo=${estado}`, {
    metodo: "PUT", token,
  }),
  eliminarTorneo: (id, token) => solicitar(`torneos/${id}`, { metodo: "DELETE", token }),
  premios: (id, token, signal) => solicitar(`torneos/${id}/premios/configuracion`, { token, signal }),
  guardarPremio: (id, datos, token) => solicitar(`torneos/${id}/premios`, {
    metodo: "POST", datos, token,
  }),
  quitarPremio: (id, posicion, token) => solicitar(`torneos/${id}/premios/${posicion}`, {
    metodo: "DELETE", token,
  }),
};
