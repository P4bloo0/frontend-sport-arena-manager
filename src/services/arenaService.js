// sigue la idea del servicio de develo, pero usa los datos de tu repo
import { datosOriginales } from "../data/datos.js";
import {
  validarEquipo,
  validarInscripcion,
  validarPerfil,
  hoy,
} from "../utils/logica.js";
const CLAVE = "arena-react-diseno-original-v1";
const copiar = (datos) => JSON.parse(JSON.stringify(datos));
const nuevoId = (lista) => Math.max(0, ...lista.map((e) => e.id)) + 1;
function comprobar(errores) {
  if (!Object.keys(errores).length) return;
  const error = new Error(Object.values(errores)[0]);
  error.campos = errores;
  throw error;
}
function permiso(perfil) {
  if (!["Jugador", "Organizador", "Administrador"].includes(perfil.rol))
    throw new Error("El visitante solo puede consultar.");
}

export const arenaService = {
  // el async permite practicar la carga como en la rama de tu amigo
  async cargar() {
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE));
      if (
        guardado?.version === 1 &&
        Object.keys(datosOriginales).every((k) => Array.isArray(guardado[k]))
      )
        return guardado;
    } catch {
      /* si no se puede leer, partimos con los datos originales */
    }
    return { ...copiar(datosOriginales), version: 1 };
  },
  guardar(db) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(db));
    } catch {
      /* puedes seguir usando la página en memoria */
    }
  },
  async listarTorneos(db) {
    return db.torneos;
  },
  async listarJuegos(db) {
    return db.juegos;
  },
  inscribir(db, datos, perfil) {
    comprobar(validarInscripcion(db, datos, perfil));
    const registro = {
      id: nuevoId(db.inscripciones),
      torneoId: Number(datos.torneoId),
      equipoId: datos.tipo === "equipo" ? Number(datos.participanteId) : null,
      jugadorId: datos.tipo === "jugador" ? Number(datos.participanteId) : null,
      correo: datos.correo.trim(),
      seed: datos.seed === "" ? null : Number(datos.seed),
      estado: "Pendiente",
      fecha: hoy(),
    };
    return {
      db: { ...db, inscripciones: [...db.inscripciones, registro] },
      registro,
    };
  },
  guardarEquipo(db, datos, perfil, idActual = null) {
    permiso(perfil);
    const actual = db.equipos.find((e) => e.id === idActual);
    if (idActual && !actual)
      throw new Error("El equipo no existe.");
    comprobar(validarEquipo(db, datos, idActual));
    // al editar tomamos la lista actual, no la copia vieja del formulario
    let integrantes = copiar(actual?.integrantes ?? datos.integrantes ?? []);
    if (!integrantes.some((i) => i.jugadorId === Number(datos.capitanId)))
      integrantes.push({ jugadorId: Number(datos.capitanId), rol: "Capitán" });
    integrantes = integrantes.map((i) => ({
      ...i,
      rol:
        i.jugadorId === Number(datos.capitanId)
          ? "Capitán"
          : i.rol === "Capitán"
            ? "Titular"
            : i.rol,
    }));
    if (
      new Set(integrantes.map((i) => i.jugadorId)).size !==
        integrantes.length ||
      integrantes.some((i) => !db.jugadores.some((j) => j.id === i.jugadorId))
    )
      throw new Error("Revisa que los jugadores existan y no estén repetidos.");
    // no copiamos la clave al equipo que queda guardado
    const equipo = {
      id: idActual ?? nuevoId(db.equipos),
      nombre: datos.nombre.trim(),
      juego: datos.juego,
      capitanId: Number(datos.capitanId),
      activo: datos.activo ?? true,
      integrantes,
    };
    return {
      db: {
        ...db,
        equipos: idActual
          ? db.equipos.map((e) => (e.id === idActual ? equipo : e))
          : [...db.equipos, equipo],
      },
      equipo,
    };
  },
  agregarIntegrante(db, equipoId, jugadorId, rol, perfil) {
    permiso(perfil);
    const equipo = db.equipos.find((e) => e.id === equipoId);
    if (!equipo || !db.jugadores.some((j) => j.id === Number(jugadorId)))
      throw new Error("Selecciona un equipo y un jugador.");
    if (equipo.integrantes.some((i) => i.jugadorId === Number(jugadorId)))
      throw new Error("Ese jugador ya está en el equipo.");
    return {
      ...db,
      equipos: db.equipos.map((e) =>
        e.id === equipoId
          ? {
              ...e,
              integrantes: [
                ...e.integrantes,
                { jugadorId: Number(jugadorId), rol: rol.trim() || "Titular" },
              ],
            }
          : e,
      ),
    };
  },
  quitarIntegrante(db, equipoId, jugadorId, perfil) {
    permiso(perfil);
    const equipo = db.equipos.find((e) => e.id === equipoId);
    if (!equipo) throw new Error("El equipo no existe.");
    if (equipo.capitanId === jugadorId)
      throw new Error("Primero elige otro capitán para poder quitarlo.");
    return {
      ...db,
      equipos: db.equipos.map((e) =>
        e.id === equipoId
          ? {
              ...e,
              integrantes: e.integrantes.filter(
                (i) => i.jugadorId !== jugadorId,
              ),
            }
          : e,
      ),
    };
  },
  guardarPerfil(db, jugadorId, datos, perfil) {
    permiso(perfil);
    if (perfil.rol === "Jugador" && perfil.jugadorId !== jugadorId)
      throw new Error("Solo puedes editar tu propio perfil.");
    if (!db.jugadores.some((j) => j.id === jugadorId))
      throw new Error("El jugador no existe.");
    comprobar(validarPerfil(datos));
    return {
      ...db,
      jugadores: db.jugadores.map((j) =>
        j.id === jugadorId
          ? { ...j, apodo: datos.apodo.trim(), correo: datos.correo.trim() }
          : j,
      ),
    };
  },
  // los nombres y el diseño siguen igual, solo abrimos fechas para probar la inscripción
  activarFechas(db) {
    const fecha = new Date(`${hoy()}T12:00:00Z`);
    fecha.setUTCDate(fecha.getUTCDate() + 7);
    return {
      ...db,
      torneos: db.torneos.map((t) =>
        t.estado === "Abierto"
          ? { ...t, cierre: fecha.toISOString().slice(0, 10) }
          : t,
      ),
    };
  },
  reiniciar() {
    return { ...copiar(datosOriginales), version: 1 };
  },
};
