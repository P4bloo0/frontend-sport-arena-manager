window.AAM = window.AAM || {};

(function (AAM) {
  "use strict";

  const juegos = [
    { id: "jg-gl", nombre: "Grieta Legendaria", modalidad: "5v5 MOBA", minIntegrantes: 5, activo: true },
    { id: "jg-pt", nombre: "Protocolo Tactico", modalidad: "5v5 Shooter", minIntegrantes: 5, activo: true },
    { id: "jg-fa", nombre: "Filo de Agente", modalidad: "5v5 Shooter", minIntegrantes: 5, activo: true },
    { id: "jg-ca", nombre: "Cohete Arena", modalidad: "3v3 Deportivo", minIntegrantes: 3, activo: true },
    { id: "jg-ce", nombre: "Combate Estelar", modalidad: "1v1 Lucha", minIntegrantes: 1, activo: false }
  ];

  const jugadores = [
    { id: "jug-01", nombre: "Valentina Rojas", apodo: "ValkyrieVR", correo: "valentina@arena.gg", pais: "Chile", ingreso: "2024-03-11" },
    { id: "jug-02", nombre: "Diego Fuentes", apodo: "d1egoShot", correo: "diego@arena.gg", pais: "Chile", ingreso: "2024-05-02" },
    { id: "jug-03", nombre: "Camila Soto", apodo: "camyx", correo: "camila@arena.gg", pais: "Argentina", ingreso: "2024-01-20" },
    { id: "jug-04", nombre: "Nicolas Pardo", apodo: "nixpardo", correo: "nicolas@arena.gg", pais: "Peru", ingreso: "2023-11-15" },
    { id: "jug-05", nombre: "Fernanda Lagos", apodo: "ferzz", correo: "fernanda@arena.gg", pais: "Chile", ingreso: "2024-06-30" },
    { id: "jug-06", nombre: "Matias Vega", apodo: "MattVega", correo: "matias@arena.gg", pais: "Uruguay", ingreso: "2024-02-08" },
    { id: "jug-07", nombre: "Antonia Ruiz", apodo: "toniRuiz", correo: "antonia@arena.gg", pais: "Chile", ingreso: "2024-04-19" },
    { id: "jug-08", nombre: "Sebastian Molina", apodo: "sebaM", correo: "sebastian@arena.gg", pais: "Colombia", ingreso: "2024-07-01" }
  ];

  const equipos = [
    {
      id: "eq-01", nombre: "Lobos de Acero", juegoId: "jg-gl", capitanId: "jug-01", activo: true,
      integrantes: [
        { jugadorId: "jug-01", rol: "Capitan" },
        { jugadorId: "jug-02", rol: "Tirador" },
        { jugadorId: "jug-03", rol: "Soporte" },
        { jugadorId: "jug-05", rol: "Jungla" },
        { jugadorId: "jug-07", rol: "Central" }
      ]
    },
    {
      id: "eq-02", nombre: "Nova Esports", juegoId: "jg-pt", capitanId: "jug-04", activo: true,
      integrantes: [
        { jugadorId: "jug-04", rol: "Capitan" },
        { jugadorId: "jug-06", rol: "Entrada" },
        { jugadorId: "jug-08", rol: "Francotirador" },
        { jugadorId: "jug-02", rol: "Apoyo" },
        { jugadorId: "jug-03", rol: "Ancla" }
      ]
    },
    {
      id: "eq-03", nombre: "Cometas RL", juegoId: "jg-ca", capitanId: "jug-05", activo: true,
      integrantes: [
        { jugadorId: "jug-05", rol: "Capitan" },
        { jugadorId: "jug-07", rol: "Delantero" },
        { jugadorId: "jug-01", rol: "Defensa" }
      ]
    },
    {
      id: "eq-04", nombre: "Halcones del Sur", juegoId: "jg-gl", capitanId: "jug-06", activo: false,
      integrantes: [
        { jugadorId: "jug-06", rol: "Capitan" },
        { jugadorId: "jug-08", rol: "Tirador" }
      ]
    }
  ];

  const torneos = [
    {
      id: "tor-01", nombre: "Copa Apertura Grieta", juegoId: "jg-gl", estado: "abierto",
      modalidad: "5v5 - Eliminacion directa", cupoMaximo: 8,
      cierreInscripcion: "2026-10-05", fechaInicio: "2026-10-12", fechaFin: "2026-10-26",
      descripcion: "Torneo de apertura de temporada para equipos de Grieta Legendaria.",
      premios: [
        { posicion: 1, descripcion: "Cupo a la final regional y 1.500 USD" },
        { posicion: 2, descripcion: "700 USD y perifericos oficiales" },
        { posicion: 3, descripcion: "300 USD" }
      ]
    },
    {
      id: "tor-02", nombre: "Liga Tactica Invierno", juegoId: "jg-pt", estado: "en_curso",
      modalidad: "5v5 - Liga con playoffs", cupoMaximo: 6,
      cierreInscripcion: "2026-07-20", fechaInicio: "2026-08-01", fechaFin: "2026-09-30",
      descripcion: "Liga de Protocolo Tactico con formato de todos contra todos y playoffs.",
      premios: [
        { posicion: 1, descripcion: "2.000 USD y clasificacion al circuito nacional" },
        { posicion: 2, descripcion: "900 USD" }
      ]
    },
    {
      id: "tor-03", nombre: "Cohete Arena Showdown", juegoId: "jg-ca", estado: "abierto",
      modalidad: "3v3 - Doble eliminacion", cupoMaximo: 12,
      cierreInscripcion: "2026-09-28", fechaInicio: "2026-10-04", fechaFin: "2026-10-05",
      descripcion: "Fin de semana intensivo de Cohete Arena en formato 3v3.",
      premios: [
        { posicion: 1, descripcion: "1.000 USD" },
        { posicion: 2, descripcion: "400 USD" },
        { posicion: 3, descripcion: "150 USD" }
      ]
    },
    {
      id: "tor-04", nombre: "Masters Filo de Agente", juegoId: "jg-fa", estado: "finalizado",
      modalidad: "5v5 - Eliminacion directa", cupoMaximo: 8,
      cierreInscripcion: "2026-04-10", fechaInicio: "2026-04-18", fechaFin: "2026-05-02",
      descripcion: "Torneo cerrado de la temporada pasada, con llave y resultados completos.",
      premios: [
        { posicion: 1, descripcion: "3.000 USD y trofeo" },
        { posicion: 2, descripcion: "1.200 USD" },
        { posicion: 3, descripcion: "500 USD" }
      ]
    }
  ];

  const inscripciones = [
    { id: "ins-01", torneoId: "tor-01", tipo: "equipo", participanteId: "eq-01", estado: "aceptada", motivo: "", fecha: "2026-09-20" },
    { id: "ins-02", torneoId: "tor-01", tipo: "equipo", participanteId: "eq-04", estado: "rechazada", motivo: "Equipo inactivo", fecha: "2026-09-21" },
    { id: "ins-03", torneoId: "tor-02", tipo: "equipo", participanteId: "eq-02", estado: "aceptada", motivo: "", fecha: "2026-07-10" },
    { id: "ins-04", torneoId: "tor-03", tipo: "equipo", participanteId: "eq-03", estado: "pendiente", motivo: "", fecha: "2026-09-15" },
    { id: "ins-05", torneoId: "tor-04", tipo: "equipo", participanteId: "eq-01", estado: "aceptada", motivo: "", fecha: "2026-04-01" },
    { id: "ins-06", torneoId: "tor-04", tipo: "equipo", participanteId: "eq-02", estado: "aceptada", motivo: "", fecha: "2026-04-02" }
  ];

  const partidas = [
    { id: "par-01", torneoId: "tor-04", ronda: "Semifinal 1", localId: "eq-01", visitanteId: "eq-03", fechaHora: "2026-04-25 20:00", estado: "finalizada" },
    { id: "par-02", torneoId: "tor-04", ronda: "Semifinal 2", localId: "eq-02", visitanteId: "eq-04", fechaHora: "2026-04-26 20:00", estado: "finalizada" },
    { id: "par-03", torneoId: "tor-04", ronda: "Final", localId: "eq-01", visitanteId: "eq-02", fechaHora: "2026-05-02 20:00", estado: "finalizada" },
    { id: "par-04", torneoId: "tor-02", ronda: "Jornada 1", localId: "eq-02", visitanteId: "POR DEFINIR", fechaHora: "2026-08-05 19:00", estado: "finalizada" },
    { id: "par-05", torneoId: "tor-02", ronda: "Jornada 2", localId: "eq-02", visitanteId: "POR DEFINIR", fechaHora: "2026-08-12 19:00", estado: "programada" }
  ];

  const resultados = [
    { id: "res-01", partidaId: "par-01", puntajeLocal: 2, puntajeVisitante: 1, ganadorId: "eq-01", validado: true },
    { id: "res-02", partidaId: "par-02", puntajeLocal: 2, puntajeVisitante: 0, ganadorId: "eq-02", validado: true },
    { id: "res-03", partidaId: "par-03", puntajeLocal: 3, puntajeVisitante: 1, ganadorId: "eq-01", validado: true },
    { id: "res-04", partidaId: "par-04", puntajeLocal: 16, puntajeVisitante: 9, ganadorId: "eq-02", validado: true }
  ];

  const sanciones = [
    { id: "san-01", participanteId: "jug-08", motivo: "Conducta antideportiva", inicio: "2026-08-01", fin: "2026-12-31" },
    { id: "san-02", participanteId: "eq-04", motivo: "No presentacion a partida", inicio: "2026-03-01", fin: "2026-03-20" }
  ];

  const clonar = (valor) => JSON.parse(JSON.stringify(valor));
  const porId = (lista, id) => lista.find((item) => item.id === id) || null;

  AAM.datos = {
    juegos: () => clonar(juegos),
    jugadores: () => clonar(jugadores),
    equipos: () => clonar(equipos),
    torneos: () => clonar(torneos),
    inscripciones: () => clonar(inscripciones),
    partidas: () => clonar(partidas),
    resultados: () => clonar(resultados),
    sanciones: () => clonar(sanciones),

    juego: (id) => clonar(porId(juegos, id)),
    torneo: (id) => clonar(porId(torneos, id)),
    equipo: (id) => clonar(porId(equipos, id)),
    jugador: (id) => clonar(porId(jugadores, id)),

    inscripcionesDeTorneo: (torneoId) => clonar(inscripciones.filter((i) => i.torneoId === torneoId)),
    partidasDeTorneo: (torneoId) => clonar(partidas.filter((p) => p.torneoId === torneoId)),
    resultadoDePartida: (partidaId) => clonar(resultados.find((r) => r.partidaId === partidaId) || null),
    sancionesDeParticipante: (participanteId) => clonar(sanciones.filter((s) => s.participanteId === participanteId)),
    equiposDeJugador: (jugadorId) => clonar(equipos.filter((e) => e.integrantes.some((m) => m.jugadorId === jugadorId)))
  };
})(window.AAM);
