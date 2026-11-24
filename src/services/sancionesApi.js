import { solicitar } from "./api.js";

export const sancionesApi = {
  delUsuario: (id, token, signal) => solicitar(`sanciones/usuario/${id}`, { token, signal }),
  async verificar(parametros, token, signal) {
    const consulta = new URLSearchParams(parametros);
    const datos = await solicitar(`sanciones/verificar?${consulta}`, { token, signal });
    if (typeof datos?.sancionado !== "boolean") throw new Error("No se pudo comprobar la sanción.");
    return datos.sancionado;
  },
};
