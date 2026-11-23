// montamos la pantalla y probamos lo mismo que haría una persona
import React, { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App.jsx";
import RutaProtegida from "../src/components/RutaProtegida.jsx";
import TarjetaTorneo from "../src/components/TarjetaTorneo.jsx";
import { TablaRanking, LlaveTorneo } from "../src/components/Tablas.jsx";
import FormularioInscripcion from "../src/components/FormularioInscripcion.jsx";
import Equipo from "../src/pages/Equipo.jsx";
import Perfil from "../src/pages/Perfil.jsx";
import { arenaService } from "../src/services/arenaService.js";
import { torneosApi } from "../src/services/torneosApi.js";
import { perfiles } from "../src/data/datos.js";
import { prepararDatos } from "./logica.spec.js";
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const perfil = perfiles.find((p) => p.id === "jugador-elegible");
describe("pantallas de la evaluación", () => {
  let contenedor, raiz, db;
  beforeEach(() => {
    db = prepararDatos();
    db.torneos = db.torneos.map((torneo) => ({ ...torneo, cupoActual: 2 }));
    spyOn(torneosApi, "cargarCatalogo").and.callFake(async () => db);
    contenedor = document.createElement("div");
    document.body.appendChild(contenedor);
    raiz = createRoot(contenedor);
    spyOn(window, "scrollTo");
    spyOn(Storage.prototype, "setItem");
    spyOn(Storage.prototype, "getItem").and.returnValue(null);
  });
  afterEach(async () => {
    await act(async () => raiz.unmount());
    contenedor.remove();
  });
  const montar = async (elemento, ruta = "/index.html") => {
    await act(async () =>
      raiz.render(
        <MemoryRouter initialEntries={[ruta]}>{elemento}</MemoryRouter>,
      ),
    );
  };
  async function escribir(selector, valor) {
    const input = contenedor.querySelector(selector);
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      ).set.call(input, valor);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }
  async function elegir(selector, valor) {
    await act(async () => {
      const select = contenedor.querySelector(selector);
      select.value = valor;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }
  async function pulsar(selector) {
    await act(async () => contenedor.querySelector(selector).click());
  }
  function simularApiDeDetalle() {
    return spyOn(globalThis, "fetch").and.callFake(async (url) => {
      const ruta = new URL(url).pathname;
      const id = Number(ruta.split("/").at(-1));
      const partidas = db.partidas.filter((p) => p.torneoId === id);
      let datos;

      if (ruta.includes("/inscripciones/")) {
        datos = db.inscripciones.filter((i) => i.torneoId === id).map((i) => ({
          inscripcionId: i.id, equipoId: i.equipoId, jugadorId: i.jugadorId,
          estado: i.estado === "Aceptada" ? "CONFIRMADA" : i.estado.toUpperCase(),
          fechaInscripcion: i.fecha,
        }));
      } else if (ruta.includes("/partidas/")) {
        datos = partidas.map((p) => ({
          partidaId: p.id, participanteAId: p.localId, participanteBId: p.visitanteId,
          ronda: p.ronda, fechaHora: p.fechaHora, estado: p.estado.toUpperCase(),
        }));
      } else if (ruta.includes("/resultados/")) {
        datos = db.resultados.filter((r) => partidas.some((p) => p.id === r.partidaId)).map((r) => ({
          partidaId: r.partidaId, puntajeA: r.puntajeLocal, puntajeB: r.puntajeVisitante,
          estadoValidacion: r.validado ? "VALIDADO" : "PENDIENTE",
        }));
      } else if (ruta.includes("/rankings/")) {
        datos = id === 5 ? [{
          rankingId: 10, participanteId: 1, posicion: 1, victorias: 2,
          derrotas: 0, diferencia: 5, puntos: 6,
        }] : [];
      } else if (ruta.endsWith("/premios")) {
        const torneoId = Number(ruta.split("/").at(-2));
        datos = db.premios.filter((p) => p.torneoId === torneoId);
      } else if (ruta.endsWith("/equipos")) {
        datos = db.equipos.map((e) => ({ equipoId: e.id, nombre: e.nombre }));
      } else if (ruta.endsWith("/usuarios/jugadores")) {
        datos = db.jugadores.map((j) => ({ usuarioId: j.id, nickname: j.apodo }));
      } else {
        throw new Error(`Ruta inesperada: ${ruta}`);
      }

      return { ok: true, json: async () => datos };
    });
  }

  function Formulario({ alInscribir }) {
    const [datos, setDatos] = useState({
      torneoId: "2",
      tipo: "equipo",
      participanteId: "7",
      correo: "prueba@example.com",
      seed: "",
      acepta: true,
    });
    return (
      <FormularioInscripcion
        db={db}
        perfil={perfil}
        datos={datos}
        setDatos={setDatos}
        onInscribir={alInscribir}
      />
    );
  }
  it("7. tarjeta muestra nombre, juego, estado y enlace original", async () => {
    await montar(
      <TarjetaTorneo torneo={db.torneos[0]} inscripciones={db.inscripciones} />,
    );
    for (const texto of [
      "Copa Oro del Invocador",
      "League of Legends",
      "Abierto",
    ])
      expect(contenedor.textContent).toContain(texto);
    expect(contenedor.querySelector("a").getAttribute("href")).toBe(
      "/detalle-torneo.html?id=1",
    );
  });
  it("8. ranking muestra las filas en el orden recibido", async () => {
    await montar(
      <TablaRanking
        filas={[
          { id: 2, nombre: "Sur", puntos: 6 },
          { id: 1, nombre: "Norte", puntos: 3 },
        ]}
      />,
    );
    const filas = [...contenedor.querySelectorAll("tbody tr")];
    expect(filas.length).toBe(2);
    expect(filas[0].textContent).toContain("Sur");
  });
  it("9. equipo incompleto bloquea el envío y no llama a la acción", async () => {
    db.equipos.find((e) => e.id === 7).integrantes = [{ jugadorId: 5 }];
    const guardar = jasmine.createSpy("guardar");
    await montar(<Formulario alInscribir={guardar} />);
    expect(contenedor.querySelector("button").disabled).toBeTrue();
    await act(async () =>
      contenedor
        .querySelector("form")
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        ),
    );
    expect(guardar).not.toHaveBeenCalled();
    expect(contenedor.textContent).toContain("integrantes necesarios");
  });
  it("10. llave indica participante por definir", async () => {
    await montar(
      <LlaveTorneo
        partidas={[
          {
            id: 99,
            ronda: "Final",
            localId: 1,
            visitanteId: null,
            fechaHora: "2026-10-20 18:00",
          },
        ]}
        db={db}
      />,
    );
    expect(contenedor.textContent).toContain("Participante por definir");
  });
  it("un formulario correcto llama al manejador con los datos escritos", async () => {
    const guardar = jasmine.createSpy("guardar");
    await montar(<Formulario alInscribir={guardar} />);
    await escribir("#ins-seed", "16");
    await pulsar("button");
    expect(guardar).toHaveBeenCalledWith(
      jasmine.objectContaining({ seed: "16", participanteId: "7" }),
    );
  });
  it("seed fuera de rango desactiva la confirmación y muestra error al salir", async () => {
    await montar(<Formulario alInscribir={() => {}} />);
    await escribir("#ins-seed", "17");
    await act(async () =>
      contenedor
        .querySelector("#ins-seed")
        .dispatchEvent(new FocusEvent("focusout", { bubbles: true })),
    );
    expect(contenedor.querySelector("button").disabled).toBeTrue();
    expect(contenedor.textContent).toContain("entre 1 y 16");
  });
  const rutas = [
    ["/index.html", "Tu próxima victoria"],
    ["/torneos.html", "Explora los torneos"],
    ["/detalle-torneo.html?id=5", "Copa Del Vacio"],
    ["/inscripcion.html?id=2", "Inscripción a torneo"],
    ["/equipos.html", "Iniciar sesión"],
    ["/perfil.html", "Iniciar sesión"],
  ];
  for (const [ruta, texto] of rutas)
    it("abre la vista " + ruta, async () => {
      spyOn(arenaService, "cargar").and.resolveTo(db);
      if (ruta.startsWith("/detalle-torneo.html")) simularApiDeDetalle();
      await montar(<App />, ruta);
      expect(contenedor.textContent).toContain(texto);
      expect(contenedor.querySelectorAll("main").length).toBe(1);
    });
  it("carga la cuenta con el JWT y descarta el perfil al cerrar otra pestaña", async () => {
    const datos = { exp: Math.floor(Date.now() / 1000) + 120, sub: "real",
      userId: 17, roles: ["JUGADOR"] };
    const jwt = `cabecera.${btoa(JSON.stringify(datos)).replace(/=+$/, "")}.firma`;
    const getItem = localStorage.getItem;
    getItem.withArgs("arena_sesion").and.returnValue(jwt);
    spyOn(arenaService, "cargar").and.rejectWith(new Error("demo no disponible"));
    const fetchPerfil = spyOn(globalThis, "fetch").and.resolveTo({
      ok: true,
      json: async () => ({
        usuarioId: 17, nombre: "Cuenta real", email: "real@example.com",
        nickname: "real", rol: "JUGADOR", estado: "ACTIVO",
      }),
    });

    await montar(<App />, "/perfil.html");
    expect(fetchPerfil).toHaveBeenCalledWith(jasmine.stringMatching(/\/api\/v1\/usuarios\/me$/),
      jasmine.objectContaining({
        headers: jasmine.objectContaining({ Authorization: `Bearer ${jwt}` }),
      }));
    expect(contenedor.textContent).toContain("real@example.com");

    await act(async () => {
      getItem.withArgs("arena_sesion").and.returnValue(null);
      window.dispatchEvent(new StorageEvent("storage", { key: "arena_sesion" }));
    });
    expect(contenedor.textContent).toContain("Iniciar sesión");
    expect(contenedor.textContent).not.toContain("real@example.com");
  });

  it("el guard bloquea un rol sin permiso y admite un rol autorizado", async () => {
    const vista = (roles) => (
      <RutaProtegida sesion={{ roles }} roles={["ADMINISTRADOR"]}>
        <h1>Administración</h1>
      </RutaProtegida>
    );
    await montar(vista(["ORGANIZADOR"]));
    expect(contenedor.textContent).toContain("Acceso restringido");

    await montar(vista(["ADMINISTRADOR"]));
    expect(contenedor.textContent).toContain("Administración");
  });

  it("abre Acceso aunque falle la carga de datos de prueba", async () => {
    spyOn(arenaService, "cargar").and.rejectWith(new Error("fallo simulado"));
    await montar(<App />, "/acceso.html");

    expect(contenedor.querySelector("h1")?.textContent).toBe("Iniciar sesión");
    expect(contenedor.querySelector("#acceso-nickname")).not.toBeNull();
    expect(document.title).toBe("eSports Arena Manager | Acceso");
  });
  it("inicio conserva la imagen original con descripción y el video local", async () => {
    spyOn(arenaService, "cargar").and.resolveTo(db);
    await montar(<App />);
    expect(contenedor.querySelector(".imagen-hero").alt).toContain("Jugadores");
    expect(contenedor.querySelector(".lista-cierres").textContent).toContain("Arena Táctica De Peru");
    expect(contenedor.querySelector("source").getAttribute("src")).toBe(
      "/assets/video/esports.mp4",
    );
  });
  it("catálogo busca, limpia y avisa de fechas invertidas", async () => {
    spyOn(arenaService, "cargar").and.resolveTo(db);
    await montar(<App />, "/torneos.html");
    expect(contenedor.querySelector(".tarjeta-torneo a").getAttribute("href"))
      .toBe("/detalle-torneo.html?id=1");
    await escribir("#buscador", "no existe");
    expect(contenedor.textContent).toContain("No encontramos torneos");
    await pulsar('button[type="button"]');
    expect(contenedor.querySelectorAll(".tarjeta-torneo").length).toBe(6);
    await escribir("#fecha-inicio", "2026-10-20");
    await escribir("#fecha-fin", "2026-10-01");
    expect(contenedor.textContent).toContain("posterior");
  });
  it("abre desde Inicio un torneo de la API ajeno a la demostración", async () => {
    torneosApi.cargarCatalogo.and.callThrough();
    spyOn(arenaService, "cargar").and.rejectWith(new Error("demo no disponible"));
    const respuestas = {
      "/api/v1/torneos": [{
        torneoId: 81, nombre: "Copa real", juegoId: 11,
        modalidad: "ELIMINACION_DIRECTA", estado: "ABIERTO",
        fechaCierreInscripcion: "2099-12-31T23:59:00", cupoActual: 1, cupoMaximo: 8,
      }],
      "/api/v1/juegos": [{ juegoId: 11, nombre: "Valorant", estado: true }],
      "/api/v1/inscripciones/torneo/81": [{
        inscripcionId: 51, jugadorId: 9, estado: "CONFIRMADA",
        fechaInscripcion: "2099-12-01T15:00:00",
      }],
      "/api/v1/partidas/torneo/81": [],
      "/api/v1/resultados/torneo/81": [],
      "/api/v1/rankings/torneo/81": [],
      "/api/v1/torneos/81/premios": [],
      "/api/v1/usuarios/jugadores": [{ usuarioId: 9, nickname: "ArenaPlayer" }],
    };
    spyOn(globalThis, "fetch").and.callFake(async (url) => {
      const ruta = new URL(url).pathname;
      return { ok: Object.hasOwn(respuestas, ruta), json: async () => respuestas[ruta] };
    });

    await montar(<App />);
    expect(contenedor.querySelector(".tarjeta-torneo").textContent).toContain("Copa real");
    await pulsar(".tarjeta-torneo a");
    expect(contenedor.querySelector(".detalle-encabezado h2").textContent).toBe("Copa real");
    expect(contenedor.querySelector(".ficha-datos").textContent).toContain("1 / 8");
    expect(contenedor.querySelector(".detalle-torneo tbody").textContent).toContain("ArenaPlayer");
  });

  it("detalle muestra resultados, premios y cambia el torneo por el selector", async () => {
    spyOn(arenaService, "cargar").and.resolveTo(db);
    simularApiDeDetalle();
    await montar(<App />, "/detalle-torneo.html?id=5");
    expect(contenedor.textContent).toContain("1.000 USD");
    expect(contenedor.textContent).toContain("Los Salchipapas");
    expect(contenedor.querySelector(".detalle-torneo .ficha-datos").textContent).toContain("2 /");
    expect(contenedor.querySelector(".detalle-torneo .tabla tbody").textContent).toContain("Confirmada");
    expect(contenedor.querySelector(".detalle-torneo section:nth-last-of-type(2) tbody").textContent).toContain("Los Salchipapas");
    await elegir("#selector-torneo", "2");
    expect(contenedor.textContent).toContain("Arena Táctica De Peru");
    expect(contenedor.textContent).not.toContain("1.000 USD");
  });
  it("filtra calendario y llave por ronda y reinicia al cambiar de torneo", async () => {
    spyOn(arenaService, "cargar").and.resolveTo(db);
    simularApiDeDetalle();
    await montar(<App />, "/detalle-torneo.html?id=5");
    expect(contenedor.querySelectorAll("#calendario-visible tbody tr").length).toBe(3);
    await elegir("#selector-ronda", "Final");
    expect(contenedor.querySelectorAll("#calendario-visible tbody tr").length).toBe(1);
    expect(contenedor.querySelectorAll("#llave-visible .llave-cruce").length).toBe(1);
    expect(contenedor.querySelector("#calendario-visible").textContent).toContain("3 - 1");
    expect(contenedor.querySelector("#calendario-visible").textContent).not.toContain("Semifinal");
    await elegir("#selector-ronda", "");
    expect(contenedor.querySelectorAll("#calendario-visible tbody tr").length).toBe(3);
    await elegir("#selector-ronda", "Final");
    await elegir("#selector-torneo", "3");
    expect(contenedor.querySelector("#selector-ronda").value).toBe("");
    expect(contenedor.querySelectorAll("#calendario-visible tbody tr").length).toBe(2);
    await elegir("#selector-ronda", "Ronda 2");
    expect(contenedor.querySelector("#calendario-visible").textContent).toContain("Participante por definir");
    expect(contenedor.querySelector("#calendario-visible").textContent).toContain("Por definir");
  });
  it("muestra el calendario vacío sin selector si no hay partidas", async () => {
    spyOn(arenaService, "cargar").and.resolveTo(db);
    simularApiDeDetalle();
    await montar(<App />, "/detalle-torneo.html?id=2");
    expect(contenedor.querySelector("#selector-ronda")).toBeNull();
    expect(contenedor.querySelector("#calendario-visible").textContent).toContain("No hay partidas programadas");
  });
  it("un torneo inexistente muestra un aviso", async () => {
    spyOn(arenaService, "cargar").and.resolveTo(db);
    await montar(<App />, "/detalle-torneo.html?id=999");
    expect(contenedor.textContent).toContain("El torneo no existe");
  });
  it("inscripción completa actualiza cupo, muestra seed y bloquea repetir", async () => {
    spyOn(arenaService, "cargar").and.resolveTo(db);
    await montar(<App />, "/inscripcion.html?id=2");
    await elegir("#selector-perfil", "jugador-elegible");
    await elegir("#ins-participante", "7");
    await escribir("#ins-correo", "prueba@example.com");
    await escribir("#ins-seed", "16");
    await pulsar('input[type="checkbox"]');
    await pulsar('button[type="submit"]');
    expect(contenedor.textContent).toContain("Inscripción registrada");
    expect(contenedor.textContent).toContain("Seed solicitado");
    expect(contenedor.textContent).toContain("16");
    expect(
      contenedor.querySelector('button[type="submit"]').disabled,
    ).toBeTrue();
    expect(contenedor.textContent).toContain("inscripción vigente");
  });
  it("crea un equipo usando la cuenta autenticada como capitán", async () => {
    const sesion = { token: "token", userId: 17, nickname: "Capitana", roles: ["JUGADOR"] };
    const equipo = { equipoId: 31, nombre: "Equipo real", juegoPrincipalId: 9, capitanId: 17, estado: true };
    const fetchApi = spyOn(globalThis, "fetch").and.callFake(async (url, opciones) => {
      const ruta = new URL(url).pathname.replace("/api/v1/", "");
      if (opciones.method === "POST") {
        expect(ruta).toBe("equipos");
        expect(opciones.headers.Authorization).toBe("Bearer token");
        expect(JSON.parse(opciones.body)).toEqual({
          nombre: "Equipo real", juegoPrincipalId: 9, capitanId: 17,
        });
        return { ok: true, json: async () => equipo };
      }
      const respuestas = {
        "equipos/mis": [],
        juegos: [{ juegoId: 9, nombre: "Valorant", estado: true }],
        "usuarios/jugadores": [],
        "equipos/31/miembros": [{ usuarioId: 17, rolDentroEquipo: "CAPITAN" }],
      };
      return { ok: Object.hasOwn(respuestas, ruta), json: async () => respuestas[ruta] };
    });

    await montar(<Equipo sesion={sesion} />);
    await escribir("#eq-crear-nombre", "Equipo real");
    await elegir("#eq-crear-juego", "9");
    await pulsar("form button");
    expect(fetchApi).toHaveBeenCalled();
    expect(contenedor.textContent).toContain("Equipo creado.");
    expect(contenedor.querySelector("tbody").textContent).toContain("Capitana");
    expect(contenedor.querySelector("tbody button")).toBeNull();
  });
  it("perfil rechaza un correo malo y luego guarda el correcto", async () => {
    const alCambiar = jasmine.createSpy("alCambiar");
    await montar(<Perfil db={db} perfil={perfil} alCambiar={alCambiar} />);
    await escribir("#pf-correo", "mal");
    await pulsar("button");
    expect(contenedor.textContent).toContain("correo válido");
    expect(alCambiar).not.toHaveBeenCalled();
    await escribir("#pf-correo", "nuevo@example.com");
    await pulsar("button");
    expect(alCambiar).toHaveBeenCalled();
    expect(contenedor.textContent).toContain("Perfil actualizado");
  });
  it("se puede consultar otro perfil y ver su sanción sin editarlo", async () => {
    await montar(<Perfil db={db} perfil={perfil} alCambiar={() => {}} />);
    await elegir("#selector-jugador", "4");
    expect(contenedor.textContent).toContain("Alineación indebida");
    expect(contenedor.querySelector("button").disabled).toBeTrue();
  });
  it("la raíz abre inicio y una ruta desconocida avisa", async () => {
    spyOn(arenaService, "cargar").and.resolveTo(db);
    await montar(<App />, "/");
    expect(contenedor.textContent).toContain("Tu próxima victoria");
    await act(async () => raiz.unmount());
    raiz = createRoot(contenedor);
    await montar(<App />, "/inventada");
    expect(contenedor.textContent).toContain("Página no encontrada");
  });
  it("activar fechas y restablecer permiten repetir la demostración", async () => {
    spyOn(arenaService, "cargar").and.resolveTo(db);
    await montar(<App />, "/inscripcion.html?id=1");
    const botones = [...contenedor.querySelectorAll("footer button")];
    await act(async () => botones[0].click());
    expect(contenedor.textContent).toContain("Fechas de prueba activadas");
    await act(async () => botones[1].click());
    expect(contenedor.textContent).toContain("Demostración restablecida");
  });
  it("muestra un error cuando falla la carga de datos", async () => {
    spyOn(arenaService, "cargar").and.rejectWith(new Error("fallo simulado"));
    await montar(<App />, "/inscripcion.html");
    expect(contenedor.textContent).toContain("No se pudieron cargar");
  });
  it("permite al capitán agregar y quitar integrantes y limita al resto a consultar", async () => {
    const equipo = { equipoId: 31, nombre: "Equipo real", juegoPrincipalId: 9, capitanId: 17, estado: true };
    const respuestas = {
      "equipos/mis": [equipo],
      juegos: [{ juegoId: 9, nombre: "Valorant", estado: true }],
      "usuarios/jugadores": [
        { usuarioId: 17, nickname: "Capitana" },
        { usuarioId: 19, nickname: "Apoyo" },
      ],
      "equipos/31/miembros": [{ usuarioId: 17, rolDentroEquipo: "CAPITAN" }],
    };
    const fetchApi = spyOn(globalThis, "fetch").and.callFake(async (url, opciones) => {
      const ruta = new URL(url).pathname.replace("/api/v1/", "");
      if (opciones.method === "POST" && ruta === "equipos/miembros") {
        expect(JSON.parse(opciones.body)).toEqual({
          equipoId: 31, usuarioId: 19, rolDentroEquipo: "SUPLENTE",
        });
        return { ok: true, json: async () => ({ usuarioId: 19, rolDentroEquipo: "SUPLENTE" }) };
      }
      if (opciones.method === "PUT" && ruta === "equipos/31") {
        expect(JSON.parse(opciones.body)).toEqual({
          nombre: "Equipo actualizado", juegoPrincipalId: 9, capitanId: 17,
        });
        return { ok: true, json: async () => ({ ...equipo, nombre: "Equipo actualizado" }) };
      }
      if (opciones.method === "DELETE" && ruta === "equipos/31/miembros/19") {
        return { ok: true, json: async () => { throw new SyntaxError("Sin contenido"); } };
      }
      return { ok: Object.hasOwn(respuestas, ruta), json: async () => respuestas[ruta] };
    });

    const sesion = { token: "token", userId: 17, nickname: "Capitana", roles: ["JUGADOR"] };
    await montar(<Equipo sesion={sesion} />);
    await elegir("#eq-seleccion", "31");
    await elegir("#int-jugador", "19");
    await elegir("#int-rol", "SUPLENTE");
    await pulsar("form:has(#int-rol) button");
    expect(contenedor.querySelector("tbody").textContent).toContain("Apoyo");
    await escribir("#eq-editar-nombre", "Equipo actualizado");
    await pulsar("form:has(#eq-editar-nombre) button");
    expect(contenedor.querySelector("h3").textContent).toBe("Equipo actualizado");
    expect(contenedor.querySelector("tbody").textContent).toContain("Apoyo");
    await pulsar('button[aria-label="Quitar a Apoyo"]');
    expect(contenedor.querySelector("tbody").textContent).not.toContain("Apoyo");
    expect(fetchApi).toHaveBeenCalledWith(jasmine.stringMatching(/equipos\/31\/miembros\/19$/),
      jasmine.objectContaining({ method: "DELETE" }));

    await act(async () => raiz.unmount());
    raiz = createRoot(contenedor);
    await montar(<Equipo sesion={{ ...sesion, userId: 19, nickname: "Apoyo" }} />);
    await elegir("#eq-seleccion", "31");
    expect(contenedor.querySelector("tbody").textContent).toContain("Capitana");
    expect(contenedor.querySelector("#int-jugador")).toBeNull();
    expect(contenedor.querySelector("#eq-editar-nombre")).toBeNull();
  });
});
