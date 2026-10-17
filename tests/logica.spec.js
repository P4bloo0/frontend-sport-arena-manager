// cada caso prueba algo que la página debe permitir o bloquear
import { datosOriginales, perfiles } from "../src/data/datos.js";
import { arenaService } from "../src/services/arenaService.js";
import {
  ordenarRanking,
  calcularPuntos,
  cuposDisponibles,
  inscripcionFueraDePlazo,
  tieneSancionActiva,
  equipoCompleto,
  validarSeed,
  validarEquipo,
  validarPerfil,
  validarInscripcion,
  rankingTorneo,
  formatearFecha,
} from "../src/utils/logica.js";
import { inscripcionFueraDePlazo as cierreAmigo } from "../src/utils/referenciaAmigo.js";
const jugador = perfiles.find((p) => p.id === "jugador-elegible");
const visitante = perfiles[0];
export function prepararDatos() {
  const db = JSON.parse(JSON.stringify(datosOriginales));
  db.version = 1;
  db.torneos.find((t) => t.id === 2).cierre = "2099-10-20";
  return db;
}
const formulario = {
  torneoId: "2",
  tipo: "equipo",
  participanteId: "7",
  correo: "prueba@example.com",
  acepta: true,
  seed: "",
};
describe("reglas de la evaluación", () => {
  let db;
  beforeEach(() => {
    db = prepararDatos();
  });
  it("1. ordena por puntos y diferencia sin cambiar la lista original", () => {
    const filas = [
      { id: 1, puntos: 3, diferencia: 0 },
      { id: 2, puntos: 6, diferencia: 1 },
      { id: 3, puntos: 6, diferencia: 5 },
    ];
    expect(ordenarRanking(filas).map((f) => f.id)).toEqual([3, 2, 1]);
    expect(filas.map((f) => f.id)).toEqual([1, 2, 3]);
  });
  it("2. suma victoria y derrota solo si el resultado está validado", () => {
    const resultados = [
      { localId: 1, visitanteId: 2, ganadorId: 1, validado: true },
      { localId: 3, visitanteId: 1, ganadorId: 3, validado: true },
      { localId: 1, visitanteId: 4, ganadorId: 1, validado: false },
    ];
    expect(calcularPuntos(resultados, 1, 3, 1)).toBe(4);
    expect(calcularPuntos(resultados, 9)).toBe(0);
  });
  it("3. los cupos nunca son negativos y las rechazadas no ocupan", () => {
    const ins = ["Aceptada", "Pendiente", "Rechazada"].map((estado, id) => ({
      id,
      estado,
      torneoId: 1,
    }));
    expect(cuposDisponibles({ id: 1, cupoMaximo: 4 }, ins)).toBe(2);
    expect(cuposDisponibles({ id: 1, cupoMaximo: 1 }, ins)).toBe(0);
    expect(cuposDisponibles(null)).toBe(0);
  });
  it("4. el cierre permite el mismo día y bloquea el siguiente", () => {
    expect(
      inscripcionFueraDePlazo({ cierre: "2026-10-20" }, "2026-10-20"),
    ).toBeFalse();
    expect(
      inscripcionFueraDePlazo({ cierre: "2026-10-20" }, "2026-10-21"),
    ).toBeTrue();
  });
  it("5. distingue sanción vigente, vencida y de otro tipo", () => {
    const sanciones = [
      {
        tipoParticipante: "jugador",
        participanteId: 4,
        inicio: "2026-10-01",
        fin: "2026-10-20",
      },
    ];
    expect(
      tieneSancionActiva(sanciones, "jugador", 4, "2026-10-20"),
    ).toBeTrue();
    expect(
      tieneSancionActiva(sanciones, "equipo", 4, "2026-10-20"),
    ).toBeFalse();
    expect(
      tieneSancionActiva(sanciones, "jugador", 4, "2026-10-21"),
    ).toBeFalse();
  });
  it("6. un equipo necesita suficientes jugadores distintos", () => {
    expect(equipoCompleto({ integrantes: [{ jugadorId: 1 }] }, 2)).toBeFalse();
    expect(
      equipoCompleto({ integrantes: [{ jugadorId: 1 }, { jugadorId: 2 }] }, 2),
    ).toBeTrue();
    expect(
      equipoCompleto({ integrantes: [{ jugadorId: 1 }, { jugadorId: 1 }] }, 2),
    ).toBeFalse();
    expect(equipoCompleto(null, 5)).toBeFalse();
  });
  it("mantiene seed opcional entre uno y dieciséis", () => {
    for (const v of ["", "1", "16"]) expect(validarSeed(v)).toBe("");
    for (const v of ["0", "17", "1.5", "hola"])
      expect(validarSeed(v)).not.toBe("");
  });
  it("guarda inscripción sin cambiar el objeto inicial y rechaza duplicidad", () => {
    const resultado = arenaService.inscribir(db, formulario, jugador);
    expect(resultado.registro.equipoId).toBe(7);
    expect(resultado.registro.jugadorId).toBeNull();
    expect(resultado.registro.seed).toBeNull();
    expect(resultado.db.inscripciones.length).toBe(db.inscripciones.length + 1);
    expect(() =>
      arenaService.inscribir(resultado.db, formulario, jugador),
    ).toThrowError(/vigente/);
  });
  it("guarda el identificador del jugador en modalidad individual", () => {
    db.torneos[2].estado = "Abierto";
    db.torneos[2].cierre = "2099-10-20";
    const resultado = arenaService.inscribir(
      db,
      {
        ...formulario,
        torneoId: "3",
        tipo: "jugador",
        participanteId: "5",
        seed: "16",
      },
      jugador,
    );
    expect(resultado.registro.jugadorId).toBe(5);
    expect(resultado.registro.equipoId).toBeNull();
    expect(resultado.registro.seed).toBe(16);
  });
  it("bloquea visitante, correo inválido y aceptación pendiente", () => {
    const e = validarInscripcion(
      db,
      { ...formulario, correo: "mal", acepta: false },
      visitante,
    );
    expect(e.permiso).toBeDefined();
    expect(e.correo).toBeDefined();
    expect(e.acepta).toBeDefined();
  });
  it("bloquea equipo incompleto, inactivo y juego distinto", () => {
    const e = validarInscripcion(
      db,
      { ...formulario, participanteId: "3" },
      jugador,
    );
    expect(e.juego).toBeDefined();
    expect(e.integrantes).toBeDefined();
    db.equipos.find((e) => e.id === 7).activo = false;
    expect(validarInscripcion(db, formulario, jugador).activo).toBeDefined();
  });
  it("bloquea estado, plazo, cupo y participantes inexistentes", () => {
    db.torneos[1].estado = "Finalizado";
    db.torneos[1].cupoMaximo = 0;
    db.torneos[1].cierre = "2000-01-01";
    const e = validarInscripcion(
      db,
      { ...formulario, participanteId: "900" },
      jugador,
    );
    for (const campo of ["estado", "plazo", "cupo", "participanteId"])
      expect(e[campo]).toBeDefined();
    expect(
      validarInscripcion(db, { ...formulario, torneoId: "" }, jugador).torneoId,
    ).toBeDefined();
  });
  it("no permite jugador individual en torneo de equipos ni un tipo desconocido", () => {
    expect(
      validarInscripcion(
        db,
        { ...formulario, tipo: "jugador", participanteId: "5" },
        jugador,
      ).modalidad,
    ).toBeDefined();
    expect(
      validarInscripcion(db, { ...formulario, tipo: "otro" }, jugador).tipo,
    ).toBeDefined();
  });
  it("bloquea la sanción del jugador sin sancionar a un equipo con el mismo número", () => {
    db.torneos[2].estado = "Abierto";
    db.torneos[2].cierre = "2099-01-01";
    expect(
      validarInscripcion(
        db,
        { ...formulario, torneoId: "3", tipo: "jugador", participanteId: "4" },
        jugador,
        "2026-10-16",
      ).sancion,
    ).toBeDefined();
    expect(
      tieneSancionActiva(db.sanciones, "equipo", 4, "2026-10-16"),
    ).toBeFalse();
  });
  it("exige equipo único, capitán, juego y claves correctas", () => {
    const datos = {
      nombre: "Los Salchipapas",
      juego: "",
      capitanId: "",
      clave: "abc",
      clave2: "diferente",
    };
    const e = validarEquipo(db, datos);
    for (const campo of ["nombre", "juego", "capitanId", "clave", "clave2"])
      expect(e[campo]).toBeDefined();
  });
  it("crea con el capitán elegido, no guarda las claves y permite editar sin ellas", () => {
    const datos = {
      nombre: "Mi equipo",
      juego: "Valorant",
      capitanId: "2",
      clave: "Equipo123",
      clave2: "Equipo123",
      integrantes: [],
    };
    const r = arenaService.guardarEquipo(db, datos, jugador);
    expect(r.equipo.capitanId).toBe(2);
    expect(r.equipo.integrantes).toEqual([{ jugadorId: 2, rol: "Capitán" }]);
    expect(r.equipo.clave).toBeUndefined();
    expect(r.equipo.clave2).toBeUndefined();
    const editado = arenaService.guardarEquipo(
      r.db,
      { ...r.equipo, nombre: "Otro nombre", clave: "", clave2: "" },
      jugador,
      r.equipo.id,
    );
    expect(editado.equipo.nombre).toBe("Otro nombre");
    expect(() => arenaService.guardarEquipo(db, datos, visitante)).toThrowError(
      /visitante/,
    );
  });
  it("agrega integrantes, impide repetir y protege al capitán", () => {
    const siguiente = arenaService.agregarIntegrante(
      db,
      7,
      "1",
      "Soporte",
      jugador,
    );
    expect(siguiente.equipos.find((e) => e.id === 7).integrantes.length).toBe(
      6,
    );
    expect(() =>
      arenaService.agregarIntegrante(siguiente, 7, "1", "", jugador),
    ).toThrowError(/ya está/);
    expect(() => arenaService.quitarIntegrante(db, 7, 5, jugador)).toThrowError(
      /capitán/,
    );
    expect(
      arenaService
        .quitarIntegrante(siguiente, 7, 1, jugador)
        .equipos.find((e) => e.id === 7).integrantes.length,
    ).toBe(5);
    expect(() =>
      arenaService.agregarIntegrante(db, 0, 0, "", jugador),
    ).toThrow();
  });
  it("valida perfil y solo permite al jugador editar el suyo", () => {
    expect(
      validarPerfil({ apodo: "con espacio", correo: "mal" }).apodo,
    ).toBeDefined();
    const datos = { apodo: "NuevoApodo", correo: "nuevo@example.com" };
    expect(
      arenaService.guardarPerfil(db, 5, datos, jugador).jugadores[4].apodo,
    ).toBe("NuevoApodo");
    expect(db.jugadores[4].apodo).not.toBe("NuevoApodo");
    expect(() =>
      arenaService.guardarPerfil(db, 2, datos, jugador),
    ).toThrowError(/propio/);
  });
  it("arma el ranking con los resultados originales validados", () => {
    const ranking = rankingTorneo(db, 5);
    expect(ranking[0].nombre).toBe("Los Salchipapas");
    expect(ranking[0].puntos).toBe(6);
    expect(rankingTorneo(db, 2)).toEqual([]);
  });
  it("las ayudas adaptadas de develo dan formato y respetan el cierre", () => {
    expect(formatearFecha("2026-10-20")).toBe("20/10/2026");
    expect(formatearFecha(null)).toBe("-");
    expect(
      cierreAmigo(
        { fechaCierreInscripcion: "2026-10-20" },
        new Date("2026-10-21T12:00:00"),
      ),
    ).toBeTrue();
    expect(cierreAmigo({})).toBeFalse();
  });
  it("activar fechas no cambia los datos originales y restablecer los recupera", () => {
    const antes = db.torneos[1].cierre;
    const otra = arenaService.activarFechas(db);
    expect(otra.torneos[1].cierre).not.toBe(antes);
    expect(db.torneos[1].cierre).toBe(antes);
    expect(arenaService.reiniciar().torneos[0].nombre).toBe(
      "Copa Oro del Invocador",
    );
  });
  it("usa un espía para comprobar que guarda la demostración", () => {
    spyOn(Storage.prototype, "setItem");
    arenaService.guardar(db);
    expect(Storage.prototype.setItem).toHaveBeenCalledWith(
      "arena-react-diseno-original-v1",
      jasmine.any(String),
    );
  });
  it("recupera datos válidos y maneja contenido roto o almacenamiento bloqueado", async () => {
    spyOn(Storage.prototype, "getItem").and.returnValue(JSON.stringify(db));
    expect((await arenaService.cargar()).version).toBe(1);
    Storage.prototype.getItem.and.returnValue("{roto");
    expect((await arenaService.cargar()).torneos.length).toBe(6);
    Storage.prototype.getItem.and.throwError("bloqueado");
    expect((await arenaService.cargar()).equipos.length).toBe(7);
    spyOn(Storage.prototype, "setItem").and.throwError("bloqueado");
    expect(() => arenaService.guardar(db)).not.toThrow();
  });
  it("conserva el integrante agregado después de abrir la edición", () => {
    const borrador = { ...db.equipos.find(e => e.id === 7), clave: '', clave2: '' };
    const actualizado = arenaService.agregarIntegrante(db, 7, 1, 'Apoyo', jugador);
    const guardado = arenaService.guardarEquipo(actualizado, borrador, jugador, 7);
    expect(guardado.equipo.integrantes.length).toBe(6);
    expect(guardado.equipo.integrantes.some(i => i.jugadorId === 1)).toBeTrue();
    expect(db.equipos.find(e => e.id === 7).integrantes.length).toBe(5);
  });
  it("no vuelve a agregar al integrante quitado mientras se edita", () => {
    const borrador = { ...db.equipos.find(e => e.id === 7), clave: '', clave2: '' };
    const actualizado = arenaService.quitarIntegrante(db, 7, 7, jugador);
    const guardado = arenaService.guardarEquipo(actualizado, borrador, jugador, 7);
    expect(guardado.equipo.integrantes.length).toBe(4);
    expect(guardado.equipo.integrantes.some(i => i.jugadorId === 7)).toBeFalse();
  });
  it("cambia capitán sin perder los integrantes recién agregados", () => {
    const borrador = { ...db.equipos.find(e => e.id === 7), capitanId: '1', clave: '', clave2: '' };
    const actualizado = arenaService.agregarIntegrante(db, 7, 1, 'Apoyo', jugador);
    const guardado = arenaService.guardarEquipo(actualizado, borrador, jugador, 7);
    expect(guardado.equipo.integrantes.length).toBe(6);
    expect(guardado.equipo.integrantes.find(i => i.jugadorId === 1).rol).toBe('Capitán');
    expect(guardado.equipo.integrantes.find(i => i.jugadorId === 5).rol).toBe('Titular');
  });
});
