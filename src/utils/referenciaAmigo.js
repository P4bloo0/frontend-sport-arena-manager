// estas ayudas vienen de la rama develo de jzzzn2110
// solo ordenan o dan formato, no cambian tus pantallas
export function formatearFecha(fechaISO) {
  if (!fechaISO) return "-";

  const esSoloFecha = /^\d{4}-\d{2}-\d{2}$/.test(String(fechaISO));
  const fecha = new Date(esSoloFecha ? `${fechaISO}T12:00:00` : fechaISO);

  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();

  return `${dia}/${mes}/${anio}`;
}

export function formatearFechaHora(fechaISO) {
  const fecha = new Date(fechaISO);

  return fecha.toLocaleString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ordenarRanking(lista = []) {
  return [...lista].sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;

    return b.diferencia - a.diferencia;
  });
}

export function inscripcionFueraDePlazo(torneo, fechaActual = new Date()) {
  if (!torneo?.fechaCierreInscripcion) return false;

  const valorCierre = String(torneo.fechaCierreInscripcion);
  const cierre = /^\d{4}-\d{2}-\d{2}$/.test(valorCierre)
    ? new Date(`${valorCierre}T23:59:59`)
    : new Date(valorCierre);

  return fechaActual > cierre;
}
