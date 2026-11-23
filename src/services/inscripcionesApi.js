import { solicitar } from "./api.js";

export const inscripcionesApi = {
  crear: (datos, token) => solicitar("inscripciones", { metodo: "POST", datos, token }),
  ocupados: (id) => solicitar(`inscripciones/cupos/${id}`),
};
