window.ARENA = window.ARENA || {};

ARENA.juegos = [
  { id: "lol", nombre: "League of Legends", minIntegrantes: 5 },
  { id: "valorant", nombre: "Valorant", minIntegrantes: 5 },
  { id: "minecraft", nombre: "Minecraft", minIntegrantes: 1 },
  { id: "fortnite", nombre: "Fortnite", minIntegrantes: 2 }
];

ARENA.jugadores = [
  { id: 1, nombre: "Pedro Tapia", apodo: "PepitoElPro", correo: "PedroOFC@gmail.com", pais: "Chile" },
  { id: 2, nombre: "Valentina Figueroa", apodo: "NayaFacilShot", correo: "@gmail.com", pais: "Chile" },
  { id: 3, nombre: "Ignacio Salas", apodo: "nachoF", correo: "ignacio.DeadLock@gmail.com", pais: "Argentina" },
  { id: 4, nombre: "Camila Soto", apodo: "camsoto727", correo: "camila.soto@gmail.com", pais: "Perú" },
  { id: 5, nombre: "Diego Navarro", apodo: "dNavarroSahur", correo: "diego.pro@gmail.com", pais: "Chile" },
  { id: 6, nombre: "Fernanda Lagos", apodo: "ferl", correo: "fernanda.lagos@gmail.com", pais: "Colombia" },
  { id: 7, nombre: "Matías Rojas", apodo: "TungSahurPro666", correo: "matias.rojas@gmail.com", pais: "Chile" },
  { id: 8, nombre: "Antonia Jara", apodo: "Toña777", correo: "antonia.vera@gmail.com", pais: "Uruguay" },
  { id: 9, nombre: "Sebastián Espinoza", apodo: "kirksniper", correo: "sebastian.pino@gmail.com", pais: "Chile" },
  { id: 10, nombre: "Josefa Muñoz", apodo: "josem", correo: "josefa.munoz@gmail.com", pais: "Bolivia" }
];

ARENA.equipos = [
  {
    id: 1,
    nombre: "Los Salchipapas",
    juego: "League of Legends",
    capitanId: 1,
    activo: true,
    integrantes: [
      { jugadorId: 1, rol: "Capitán" },
      { jugadorId: 2, rol: "Tirador" },
      { jugadorId: 3, rol: "Soporte" },
      { jugadorId: 4, rol: "Jungla" },
      { jugadorId: 6, rol: "Central" }
    ]
  },
  {
    id: 2,
    nombre: "Torpeza Suprema",
    juego: "League of Legends",
    capitanId: 4,
    activo: true,
    integrantes: [
      { jugadorId: 4, rol: "Capitán" },
      { jugadorId: 5, rol: "Jungla" },
      { jugadorId: 6, rol: "Central" }
    ]
  },
  {
    id: 3,
    nombre: "Sombras del Peru",
    juego: "League of Legends",
    capitanId: 7,
    activo: true,
    integrantes: [
      { jugadorId: 7, rol: "Capitán" },
      { jugadorId: 8, rol: "Tirador" }
    ]
  },
  {
    id: 4,
    nombre: "Los GG EZZZ",
    juego: "League of Legends",
    capitanId: 9,
    activo: false,
    integrantes: [
      { jugadorId: 9, rol: "Capitán" },
      { jugadorId: 10, rol: "Soporte" }
    ]
  },
  {
    id: 5,
    nombre: "Saqueadores del Nether",
    juego: "Minecraft",
    capitanId: 2,
    activo: true,
    integrantes: [
      { jugadorId: 2, rol: "Capitán" },
      { jugadorId: 6, rol: "Constructor" }
    ]
  },
  {
    id: 6,
    nombre: "Creepers FC",
    juego: "Minecraft",
    capitanId: 3,
    activo: true,
    integrantes: [
      { jugadorId: 3, rol: "Capitán" },
      { jugadorId: 9, rol: "Explorador" }
    ]
  },
  {
    id: 7,
    nombre: "Lancer Fan Club",
    juego: "Valorant",
    capitanId: 5,
    activo: true,
    integrantes: [
      { jugadorId: 5, rol: "Capitán" },
      { jugadorId: 7, rol: "Entrada" },
      { jugadorId: 8, rol: "Francotirador" },
      { jugadorId: 9, rol: "Apoyo" },
      { jugadorId: 10, rol: "Ancla" }
    ]
  }
];

ARENA.inscripciones = [
  { id: 1, torneoId: 1, equipoId: 1, jugadorId: null, estado: "Aceptada", fecha: "2026-08-20" },
  { id: 2, torneoId: 1, equipoId: 2, jugadorId: null, estado: "Aceptada", fecha: "2026-08-21" },
  { id: 3, torneoId: 1, equipoId: 3, jugadorId: null, estado: "Pendiente", fecha: "2026-08-30" },
  { id: 4, torneoId: 1, equipoId: 4, jugadorId: null, estado: "Rechazada", fecha: "2026-08-22" },
  { id: 5, torneoId: 5, equipoId: 1, jugadorId: null, estado: "Aceptada", fecha: "2026-07-10" },
  { id: 6, torneoId: 5, equipoId: 2, jugadorId: null, estado: "Aceptada", fecha: "2026-07-11" },
  { id: 7, torneoId: 5, equipoId: 3, jugadorId: null, estado: "Aceptada", fecha: "2026-07-12" },
  { id: 8, torneoId: 5, equipoId: 4, jugadorId: null, estado: "Aceptada", fecha: "2026-07-13" },
  { id: 9, torneoId: 3, equipoId: 5, jugadorId: null, estado: "Aceptada", fecha: "2026-08-15" },
  { id: 10, torneoId: 3, equipoId: 6, jugadorId: null, estado: "Aceptada", fecha: "2026-08-16" }
];

ARENA.partidas = [
  {
    id: 1,
    torneoId: 5,
    ronda: "Semifinal 1",
    localId: 1,
    visitanteId: 3,
    fechaHora: "2026-08-22 18:00",
    estado: "Finalizada",
    siguientePartidaId: 3,
    siguienteRanura: "local"
  },
  {
    id: 2,
    torneoId: 5,
    ronda: "Semifinal 2",
    localId: 2,
    visitanteId: 4,
    fechaHora: "2026-08-22 20:00",
    estado: "Finalizada",
    siguientePartidaId: 3,
    siguienteRanura: "visitante"
  },
  {
    id: 3,
    torneoId: 5,
    ronda: "Final",
    localId: 1,
    visitanteId: 2,
    fechaHora: "2026-08-29 19:00",
    estado: "Finalizada",
    siguientePartidaId: null,
    siguienteRanura: null
  },
  {
    id: 4,
    torneoId: 3,
    ronda: "Ronda 1",
    localId: 5,
    visitanteId: 6,
    fechaHora: "2026-09-06 17:00",
    estado: "Finalizada",
    siguientePartidaId: 5,
    siguienteRanura: "local"
  },
  {
    id: 5,
    torneoId: 3,
    ronda: "Ronda 2",
    localId: 5,
    visitanteId: null,
    fechaHora: "2026-09-13 17:00",
    estado: "Programada",
    siguientePartidaId: null,
    siguienteRanura: null
  }
];

ARENA.resultados = [
  { id: 1, partidaId: 1, puntajeLocal: 2, puntajeVisitante: 1, ganadorId: 1, validado: true },
  { id: 2, partidaId: 2, puntajeLocal: 2, puntajeVisitante: 0, ganadorId: 2, validado: true },
  { id: 3, partidaId: 3, puntajeLocal: 3, puntajeVisitante: 1, ganadorId: 1, validado: true },
  { id: 4, partidaId: 4, puntajeLocal: 1, puntajeVisitante: 0, ganadorId: 5, validado: true }
];

ARENA.sanciones = [
  {
    id: 1,
    participanteId: 4,
    motivo: "Alineación indebida en un torneo anterior",
    inicio: "2026-07-01",
    fin: "2026-12-31"
  }
];

ARENA.premios = [
  { torneoId: 1, posicion: 1, descripcion: "Cupo a la liga mayor y 500 USD" },
  { torneoId: 1, posicion: 2, descripcion: "200 USD" },
  { torneoId: 3, posicion: 1, descripcion: "300 USD" },
  { torneoId: 5, posicion: 1, descripcion: "1.000 USD y trofeo" },
  { torneoId: 5, posicion: 2, descripcion: "400 USD" },
  { torneoId: 5, posicion: 3, descripcion: "150 USD" }
];