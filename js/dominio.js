window.AAM = window.AAM || {};

(function (AAM) {
  "use strict";

  const ESTADOS_INSCRIPCION_VIGENTES = ["pendiente", "aceptada"];
  const PUNTOS_VICTORIA = 3;
  const PUNTOS_DERROTA = 0;

  const aFecha = (iso) => new Date(String(iso).slice(0, 10) + "T00:00:00");

  const cuposDisponibles = (torneo, inscripciones) => {
    const ocupados = inscripciones.filter(
      (i) => i.torneoId === torneo.id && ESTADOS_INSCRIPCION_VIGENTES.includes(i.estado)
    ).length;
    return Math.max(0, torneo.cupoMaximo - ocupados);
  };

  const inscripcionFueraDePlazo = (torneo, fechaActual) =>
    aFecha(fechaActual) > aFecha(torneo.cierreInscripcion);

  const ordenarRanking = (filas) =>
    [...filas].sort((a, b) =>
      b.puntos !== a.puntos ? b.puntos - a.puntos : b.diferencia - a.diferencia
    );

  const construirTablaPosiciones = (torneo, equipos, partidas, resultados) => {
    const partidasTorneo = partidas.filter((p) => p.torneoId === torneo.id);
    const idsPartidas = partidasTorneo.map((p) => p.id);
    const resultadosValidados = resultados.filter(
      (r) => idsPartidas.includes(r.partidaId) && r.validado
    );

    const participantes = new Set();
    partidasTorneo.forEach((p) => {
      if (p.localId && p.localId !== "POR DEFINIR") participantes.add(p.localId);
      if (p.visitanteId && p.visitanteId !== "POR DEFINIR") participantes.add(p.visitanteId);
    });

    const filas = Array.from(participantes).map((id) => {
      let ganadas = 0;
      let perdidas = 0;
      let aFavor = 0;
      let enContra = 0;

      resultadosValidados.forEach((r) => {
        const partida = partidasTorneo.find((p) => p.id === r.partidaId);
        const esLocal = partida.localId === id;
        const esVisitante = partida.visitanteId === id;
        if (!esLocal && !esVisitante) return;

        aFavor += esLocal ? r.puntajeLocal : r.puntajeVisitante;
        enContra += esLocal ? r.puntajeVisitante : r.puntajeLocal;
        if (r.ganadorId === id) ganadas += 1;
        else perdidas += 1;
      });

      const equipo = equipos.find((e) => e.id === id);
      return {
        participanteId: id,
        nombre: equipo ? equipo.nombre : id,
        jugadas: ganadas + perdidas,
        ganadas,
        perdidas,
        aFavor,
        enContra,
        diferencia: aFavor - enContra,
        puntos: ganadas * PUNTOS_VICTORIA + perdidas * PUNTOS_DERROTA
      };
    });

    return ordenarRanking(filas);
  };

  AAM.dominio = {
    ESTADOS_INSCRIPCION_VIGENTES,
    cuposDisponibles,
    inscripcionFueraDePlazo,
    ordenarRanking,
    construirTablaPosiciones
  };
})(window.AAM);
