// estas reglas se revisan antes de guardar cualquier cosa
import { ordenarRanking } from "./referenciaAmigo.js";
export {
  ordenarRanking,
  formatearFecha,
  formatearFechaHora,
} from "./referenciaAmigo.js";

// usamos el día de chile para no cerrar un torneo antes de tiempo
export function hoy() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Santiago",
  }).format(new Date());
}

// pendiente también ocupa un cupo, rechazada no
export function inscripcionesVigentes(db, torneoId) {
  return db.inscripciones.filter(
    (i) =>
      i.torneoId === torneoId && ["Aceptada", "Pendiente"].includes(i.estado),
  );
}
export function cuposDisponibles(torneo, inscripciones = []) {
  if (!torneo) return 0;
  const ocupados = inscripciones.filter(
    (i) =>
      i.torneoId === torneo.id && ["Aceptada", "Pendiente"].includes(i.estado),
  ).length;
  return Math.max(0, torneo.cupoMaximo - ocupados);
}
export function inscripcionFueraDePlazo(torneo, fecha = hoy()) {
  return Boolean(torneo && fecha > torneo.cierre);
}

// el número de un equipo puede repetirse en un jugador, por eso miramos el tipo
export function tieneSancionActiva(sanciones, tipo, id, fecha = hoy()) {
  return sanciones.some(
    (s) =>
      s.tipoParticipante === tipo &&
      s.participanteId === Number(id) &&
      s.inicio <= fecha &&
      fecha <= s.fin,
  );
}
export function equipoCompleto(equipo, minimo) {
  if (!equipo || !Number.isInteger(minimo) || minimo < 1) return false;
  const ids = equipo.integrantes.map((i) => i.jugadorId);
  return ids.length >= minimo && new Set(ids).size === ids.length;
}
export function correoValido(correo = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
}

// dejamos el mismo rango que ya tenías en tu formulario
export function validarSeed(valor) {
  if (String(valor ?? "").trim() === "") return "";
  return Number.isInteger(Number(valor)) &&
    Number(valor) >= 1 &&
    Number(valor) <= 16
    ? ""
    : "El seed debe ser un entero entre 1 y 16.";
}

// solo, individual y uno contra uno se juegan sin equipo
export function esTorneoIndividual(torneo) {
  return /\b(solo|individual)\b|\b1\s*(?:vs|v)\s*1\b/i.test(
    torneo?.modalidad ?? "",
  );
}

export function validarInscripcion(db, datos, perfil, fecha = hoy()) {
  const errores = {};
  const torneo = db.torneos.find((t) => t.id === Number(datos.torneoId));
  if (!torneo) return { torneoId: "Selecciona un torneo." };
  if (!["Jugador", "Organizador", "Administrador"].includes(perfil.rol))
    errores.permiso = "Cambia el perfil de prueba para poder inscribirte.";
  if (torneo.estado !== "Abierto")
    errores.estado = "El torneo no admite inscripciones.";
  if (inscripcionFueraDePlazo(torneo, fecha))
    errores.plazo = "El plazo de inscripción ya cerró.";
  if (!cuposDisponibles(torneo, db.inscripciones))
    errores.cupo = "El torneo no tiene cupos disponibles.";
  if (!correoValido(datos.correo)) errores.correo = "Escribe un correo válido.";
  if (!datos.acepta)
    errores.acepta = "Debes aceptar los requisitos del torneo.";
  const seed = validarSeed(datos.seed);
  if (seed) errores.seed = seed;
  const id = Number(datos.participanteId);
  if (!["equipo", "jugador"].includes(datos.tipo))
    errores.tipo = "Elige un tipo de participante.";
  const lista = datos.tipo === "equipo" ? db.equipos : db.jugadores;
  const participante = lista.find((p) => p.id === id);
  if (!participante)
    errores.participanteId = "Selecciona un participante válido.";
  if (participante && datos.tipo === "equipo") {
    if (!participante.activo) errores.activo = "El equipo está inactivo.";
    if (participante.juego !== torneo.juego)
      errores.juego = "El equipo y el torneo deben ser del mismo juego.";
    const juego = db.juegos.find((j) => j.nombre === torneo.juego);
    if (!equipoCompleto(participante, juego?.minIntegrantes))
      errores.integrantes = "El equipo no tiene los integrantes necesarios.";
  }
  if (datos.tipo === "equipo" && esTorneoIndividual(torneo))
    errores.modalidad = "Este torneo es individual. Selecciona Jugador individual.";
  if (datos.tipo === "jugador" && !esTorneoIndividual(torneo))
    errores.modalidad = "Este torneo requiere un equipo.";
  if (tieneSancionActiva(db.sanciones, datos.tipo, id, fecha))
    errores.sancion = "El participante tiene una sanción vigente.";
  const campo = datos.tipo === "equipo" ? "equipoId" : "jugadorId";
  if (inscripcionesVigentes(db, torneo.id).some((i) => i[campo] === id))
    errores.duplicado = "El participante ya tiene una inscripción vigente.";
  return errores;
}

// esta clave solo sirve para practicar la validación, después se descarta
export function validarEquipo(db, datos, idActual = null) {
  const errores = {};
  const nombre = datos.nombre.trim();
  if (nombre.length < 3 || nombre.length > 40)
    errores.nombre = "Usa entre 3 y 40 caracteres.";
  if (
    db.equipos.some(
      (e) =>
        e.id !== idActual &&
        e.nombre.trim().toLowerCase() === nombre.toLowerCase(),
    )
  )
    errores.nombre = "Ya existe un equipo con ese nombre.";
  if (!db.juegos.some((j) => j.nombre === datos.juego))
    errores.juego = "Selecciona un juego.";
  if (!db.jugadores.some((j) => j.id === Number(datos.capitanId)))
    errores.capitanId = "Selecciona un capitán.";
  if (!idActual || datos.clave || datos.clave2) {
    if (
      datos.clave.length < 8 ||
      !/[a-z]/i.test(datos.clave) ||
      !/\d/.test(datos.clave)
    )
      errores.clave = "Usa al menos 8 caracteres, una letra y un número.";
    if (!datos.clave2 || datos.clave !== datos.clave2)
      errores.clave2 = "Las dos claves deben coincidir.";
  }
  return errores;
}
export function validarPerfil(datos) {
  const errores = {};
  if (!/^\S{3,16}$/.test(datos.apodo))
    errores.apodo = "Usa de 3 a 16 caracteres, sin espacios.";
  if (!correoValido(datos.correo)) errores.correo = "Escribe un correo válido.";
  return errores;
}

// solo sumamos resultados que ya están validados
export function calcularPuntos(
  resultados,
  participanteId,
  victoria = 3,
  derrota = 0,
) {
  return resultados
    .filter(
      (r) =>
        r.validado &&
        (r.localId === participanteId || r.visitanteId === participanteId),
    )
    .reduce(
      (total, r) =>
        total + (r.ganadorId === participanteId ? victoria : derrota),
      0,
    );
}
export function nombreParticipante(db, id, tipo = "equipo") {
  if (id == null) return "Participante por definir";
  const participante = (tipo === "equipo" ? db.equipos : db.jugadores).find(
    (p) => p.id === id,
  );
  return (
    participante?.apodo ?? participante?.nombre ?? "Participante por definir"
  );
}
export function rankingTorneo(db, torneoId) {
  const partidas = db.partidas.filter((p) => p.torneoId === torneoId);
  const resultados = partidas.flatMap((p) =>
    db.resultados
      .filter((r) => r.partidaId === p.id && r.validado)
      .map((r) => ({ ...p, ...r })),
  );
  const ids = [
    ...new Set(
      partidas
        .flatMap((p) => [p.localId, p.visitanteId])
        .filter((id) => id != null),
    ),
  ];
  return ordenarRanking(
    ids.map((id) => {
      const propias = resultados.filter(
        (r) => r.localId === id || r.visitanteId === id,
      );
      const ganadas = propias.filter((r) => r.ganadorId === id).length;
      const diferencia = propias.reduce(
        (total, r) =>
          total +
          (r.localId === id
            ? r.puntajeLocal - r.puntajeVisitante
            : r.puntajeVisitante - r.puntajeLocal),
        0,
      );
      return {
        id,
        nombre: nombreParticipante(db, id),
        jugadas: propias.length,
        ganadas,
        perdidas: propias.length - ganadas,
        diferencia,
        puntos: calcularPuntos(propias, id),
      };
    }),
  );
}
