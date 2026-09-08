window.ARENA = window.ARENA || {};

ARENA.jugadores = [
  { id: 1, nombre: "Tomas Herrera", apodo: "tomyH" },
  { id: 2, nombre: "Valentina Rios", apodo: "valeR" },
  { id: 3, nombre: "Ignacio Fuentes", apodo: "nachoF" },
  { id: 4, nombre: "Camila Soto", apodo: "camsoto" },
  { id: 5, nombre: "Diego Navarro", apodo: "dnavarro" },
  { id: 6, nombre: "Fernanda Lagos", apodo: "ferl" },
  { id: 7, nombre: "Matias Rojas", apodo: "matiR" },
  { id: 8, nombre: "Antonia Vera", apodo: "toniv" },
  { id: 9, nombre: "Sebastian Pino", apodo: "sebap" },
  { id: 10, nombre: "Josefa Munoz", apodo: "josem" }
];

ARENA.equipos = [
  {
    id: 1, nombre: "Dragones de Hierro", juego: "League of Legends", activo: true,
    integrantes: [
      { jugadorId: 1, rol: "Capitan" },
      { jugadorId: 2, rol: "Tirador" },
      { jugadorId: 3, rol: "Soporte" }
    ]
  },
  {
    id: 2, nombre: "Fenix Rojo", juego: "League of Legends", activo: true,
    integrantes: [
      { jugadorId: 4, rol: "Capitan" },
      { jugadorId: 5, rol: "Jungla" },
      { jugadorId: 6, rol: "Central" }
    ]
  },
  {
    id: 3, nombre: "Sombras del Norte", juego: "League of Legends", activo: true,
    integrantes: [
      { jugadorId: 7, rol: "Capitan" },
      { jugadorId: 8, rol: "Tirador" }
    ]
  },
  {
    id: 4, nombre: "Titanes GG", juego: "League of Legends", activo: false,
    integrantes: [
      { jugadorId: 9, rol: "Capitan" },
      { jugadorId: 10, rol: "Soporte" }
    ]
  },
  {
    id: 5, nombre: "Bloques Unidos", juego: "Minecraft", activo: true,
    integrantes: [
      { jugadorId: 2, rol: "Capitan" },
      { jugadorId: 6, rol: "Constructor" }
    ]
  },
  {
    id: 6, nombre: "Creepers FC", juego: "Minecraft", activo: true,
    integrantes: [
      { jugadorId: 3, rol: "Capitan" },
      { jugadorId: 9, rol: "Explorador" }
    ]
  }
];

ARENA.inscripciones = [
  { id: 1, torneoId: 1, equipoId: 1, estado: "Aceptada", fecha: "2026-08-20" },
  { id: 2, torneoId: 1, equipoId: 2, estado: "Aceptada", fecha: "2026-08-21" },
  { id: 3, torneoId: 1, equipoId: 3, estado: "Pendiente", fecha: "2026-08-30" },
  { id: 4, torneoId: 1, equipoId: 4, estado: "Rechazada", fecha: "2026-08-22" },
  { id: 5, torneoId: 5, equipoId: 1, estado: "Aceptada", fecha: "2026-07-10" },
  { id: 6, torneoId: 5, equipoId: 2, estado: "Aceptada", fecha: "2026-07-11" },
  { id: 7, torneoId: 5, equipoId: 3, estado: "Aceptada", fecha: "2026-07-12" },
  { id: 8, torneoId: 5, equipoId: 4, estado: "Aceptada", fecha: "2026-07-13" },
  { id: 9, torneoId: 3, equipoId: 5, estado: "Aceptada", fecha: "2026-08-15" },
  { id: 10, torneoId: 3, equipoId: 6, estado: "Aceptada", fecha: "2026-08-16" }
];

ARENA.partidas = [
  { id: 1, torneoId: 5, ronda: "Semifinal 1", localId: 1, visitanteId: 3, fechaHora: "2026-08-22 18:00", estado: "Finalizada" },
  { id: 2, torneoId: 5, ronda: "Semifinal 2", localId: 2, visitanteId: 4, fechaHora: "2026-08-22 20:00", estado: "Finalizada" },
  { id: 3, torneoId: 5, ronda: "Final", localId: 1, visitanteId: 2, fechaHora: "2026-08-29 19:00", estado: "Finalizada" },
  { id: 4, torneoId: 3, ronda: "Ronda 1", localId: 5, visitanteId: 6, fechaHora: "2026-09-06 17:00", estado: "Finalizada" },
  { id: 5, torneoId: 3, ronda: "Ronda 2", localId: 5, visitanteId: null, fechaHora: "2026-09-13 17:00", estado: "Programada" }
];

ARENA.resultados = [
  { id: 1, partidaId: 1, puntajeLocal: 2, puntajeVisitante: 1, ganadorId: 1, validado: true },
  { id: 2, partidaId: 2, puntajeLocal: 2, puntajeVisitante: 0, ganadorId: 2, validado: true },
  { id: 3, partidaId: 3, puntajeLocal: 3, puntajeVisitante: 1, ganadorId: 1, validado: true },
  { id: 4, partidaId: 4, puntajeLocal: 1, puntajeVisitante: 0, ganadorId: 5, validado: true }
];

ARENA.sanciones = [
  { id: 1, participanteId: 4, motivo: "Alineacion indebida en un torneo anterior", inicio: "2026-07-01", fin: "2026-12-31" }
];

ARENA.premios = [
  { torneoId: 1, posicion: 1, descripcion: "Cupo a la liga mayor y 500 USD" },
  { torneoId: 1, posicion: 2, descripcion: "200 USD" },
  { torneoId: 3, posicion: 1, descripcion: "300 USD" },
  { torneoId: 5, posicion: 1, descripcion: "1.000 USD y trofeo" },
  { torneoId: 5, posicion: 2, descripcion: "400 USD" },
  { torneoId: 5, posicion: 3, descripcion: "150 USD" }
];
