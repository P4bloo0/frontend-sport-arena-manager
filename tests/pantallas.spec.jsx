// montamos la pantalla y probamos lo mismo que haría una persona
import React, { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App.jsx";
import TarjetaTorneo from "../src/components/TarjetaTorneo.jsx";
import { TablaRanking, LlaveTorneo } from "../src/components/Tablas.jsx";
import FormularioInscripcion from "../src/components/FormularioInscripcion.jsx";
import Equipo from "../src/pages/Equipo.jsx";
import Perfil from "../src/pages/Perfil.jsx";
import { arenaService } from "../src/services/arenaService.js";
import { perfiles } from "../src/data/datos.js";
import { prepararDatos } from "./logica.spec.js";
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const perfil = perfiles.find((p) => p.id === "jugador-elegible");
describe("pantallas de la evaluación", () => {
  let contenedor, raiz, db;
  beforeEach(() => {
    db = prepararDatos();
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
    ["/equipos.html", "Gestión de equipo"],
    ["/perfil.html", "Perfil de jugador"],
  ];
  for (const [ruta, texto] of rutas)
    it("abre la vista " + ruta, async () => {
      spyOn(arenaService, "cargar").and.resolveTo(db);
      await montar(<App />, ruta);
      expect(contenedor.textContent).toContain(texto);
      expect(contenedor.querySelectorAll("main").length).toBe(1);
    });
  it("inicio conserva la imagen original con descripción y el video local", async () => {
    spyOn(arenaService, "cargar").and.resolveTo(db);
    await montar(<App />);
    expect(contenedor.querySelector(".imagen-hero").alt).toContain("Jugadores");
    expect(contenedor.querySelector("source").getAttribute("src")).toBe(
      "/assets/video/esports.mp4",
    );
  });
  it("catálogo busca, limpia y avisa de fechas invertidas", async () => {
    spyOn(arenaService, "cargar").and.resolveTo(db);
    await montar(<App />, "/torneos.html");
    await escribir("#buscador", "no existe");
    expect(contenedor.textContent).toContain("No encontramos torneos");
    await pulsar('button[type="button"]');
    expect(contenedor.querySelectorAll(".tarjeta-torneo").length).toBe(6);
    await escribir("#fecha-inicio", "2026-10-20");
    await escribir("#fecha-fin", "2026-10-01");
    expect(contenedor.textContent).toContain("posterior");
  });
  it("detalle muestra resultados, premios y cambia el torneo por el selector", async () => {
    spyOn(arenaService, "cargar").and.resolveTo(db);
    await montar(<App />, "/detalle-torneo.html?id=5");
    expect(contenedor.textContent).toContain("1.000 USD");
    expect(contenedor.textContent).toContain("Los Salchipapas");
    await elegir("#selector-torneo", "2");
    expect(contenedor.textContent).toContain("Arena Táctica De Peru");
    expect(contenedor.textContent).not.toContain("1.000 USD");
  });
  it("filtra calendario y llave por ronda y reinicia al cambiar de torneo", async () => {
    spyOn(arenaService, "cargar").and.resolveTo(db);
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
  it("equipo permite escoger capitán y valida claves antes de guardar", async () => {
    const alCambiar = jasmine.createSpy("alCambiar");
    await montar(<Equipo db={db} perfil={perfil} alCambiar={alCambiar} />);
    await pulsar("button");
    expect(contenedor.textContent).toContain("8 caracteres");
    await escribir("#eq-nombre", "Equipo de prueba");
    await elegir("#eq-juego", "Valorant");
    await elegir("#eq-capitan", "2");
    await escribir("#eq-clave", "Equipo123");
    await escribir("#eq-clave2", "Equipo123");
    await pulsar("button");
    expect(alCambiar).toHaveBeenCalled();
    const guardado = alCambiar.calls.mostRecent().args[0].equipos.at(-1);
    expect(guardado.capitanId).toBe(2);
    expect(guardado.clave).toBeUndefined();
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
    await montar(<App />);
    expect(contenedor.textContent).toContain("No se pudieron cargar");
  });
  it("editar, agregar integrante y guardar conserva la nueva alineación", async () => {
    spyOn(arenaService, 'cargar').and.resolveTo(db);
    await montar(<App />, '/equipos.html');
    await elegir('#selector-perfil', 'jugador-elegible');
    const tarjeta = [...contenedor.querySelectorAll('.tarjeta-torneo')].find(t => t.textContent.includes('Lancer Fan Club'));
    await act(async () => [...tarjeta.querySelectorAll('button')].find(b => b.textContent === 'Editar equipo').click());
    await elegir('#int-jugador', '1');
    await escribir('#int-rol', 'Apoyo');
    await act(async () => contenedor.querySelectorAll('form')[1].querySelector('button').click());
    expect(contenedor.querySelectorAll('tbody tr').length).toBe(6);
    await act(async () => contenedor.querySelectorAll('form')[0].querySelector('button').click());
    expect(contenedor.querySelectorAll('tbody tr').length).toBe(6);
    expect([...contenedor.querySelectorAll('tbody tr')].some(f => f.textContent.includes('PepitoElPro'))).toBeTrue();
  });
});
