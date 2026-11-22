const URL = (import.meta.env?.VITE_API_URL || "http://localhost:8080")
  .replace(/\/+$/, "");

const estados = {
  BORRADOR: "Borrador",
  ABIERTO: "Abierto",
  EN_CURSO: "En curso",
  FINALIZADO: "Finalizado",
};

async function consultar(ruta, signal) {
  const respuesta = await fetch(`${URL}/api/v1/${ruta}`, { signal });
  if (!respuesta.ok) {
    throw new Error(`Error ${respuesta.status} al consultar ${ruta}.`);
  }
  return respuesta.json();
}

export const torneosApi = {
  async cargarCatalogo(signal) {
    const [torneos, juegos] = await Promise.all([
      consultar("torneos", signal),
      consultar("juegos", signal),
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
