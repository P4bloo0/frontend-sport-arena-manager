import { solicitar } from "./api.js";

const estados = {
  BORRADOR: "Borrador",
  ABIERTO: "Abierto",
  EN_CURSO: "En curso",
  FINALIZADO: "Finalizado",
};

export const torneosApi = {
  async cargarCatalogo(signal) {
    const [torneos, juegos] = await Promise.all([
      solicitar("torneos", { signal }),
      solicitar("juegos", { signal }),
    ]);

    const nombres = new Map(juegos.map((juego) => [juego.juegoId, juego.nombre]));

    return {
      juegos: juegos
        .filter((juego) => juego.estado)
        .map((juego) => ({ id: juego.juegoId, nombre: juego.nombre })),
      torneos: torneos.map((torneo) => ({
        id: torneo.torneoId,
        nombre: torneo.nombre,
        juego: nombres.get(torneo.juegoId) ?? `Juego #${torneo.juegoId}`,
        modalidad: torneo.modalidad,
        estado: estados[torneo.estado] ?? torneo.estado,
        cierre: torneo.fechaCierreInscripcion?.slice(0, 10) ?? "",
        cupoMaximo: torneo.cupoMaximo,
        cupoActual: torneo.cupoActual ?? 0,
      })),
    };
  },
};
