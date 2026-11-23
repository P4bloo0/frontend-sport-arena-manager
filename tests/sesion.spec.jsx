import { act } from "react";
import { createRoot } from "react-dom/client";
import { useSesion } from "../src/hooks/useSesion.js";
import { authApi } from "../src/services/authApi.js";

const clave = "arena_sesion";

function token(apodo, segundos = 120) {
  const datos = { exp: Math.floor(Date.now() / 1000) + segundos, sub: apodo, roles: ["JUGADOR"] };
  return `cabecera.${btoa(JSON.stringify(datos)).replace(/=+$/, "")}.firma`;
}

function capturarTemporizadoresDeSesion() {
  const temporizadores = [];
  const programar = globalThis.setTimeout.bind(globalThis);
  spyOn(globalThis, "setTimeout").and.callFake((fn, espera, ...args) => {
    if ((espera ?? 0) < 5000) return programar(fn, espera, ...args);
    temporizadores.push({ fn, espera });
    return -temporizadores.length;
  });
  return temporizadores;
}

describe("sesión de Arena", () => {
  let contenedor, raiz, estado, decoder;

  function Vista() {
    estado = useSesion();
    return <p>{estado.sesion?.nickname ?? estado.avisoSesion}</p>;
  }

  async function montar() {
    raiz = createRoot(contenedor);
    await act(async () => raiz.render(<Vista />));
  }

  beforeEach(() => {
    decoder = globalThis.TextDecoder;
    if (!decoder) {
      // Las cargas de estas pruebas solo contienen caracteres ASCII.
      globalThis.TextDecoder = class {
        decode(bytes) { return String.fromCharCode(...bytes); }
      };
    }
    localStorage.removeItem(clave);
    contenedor = document.createElement("div");
    document.body.appendChild(contenedor);
  });

  afterEach(async () => {
    await act(async () => raiz?.unmount());
    raiz = null;
    contenedor.remove();
    localStorage.removeItem(clave);
    if (!decoder) delete globalThis.TextDecoder;
  });

  it("conserva la sesión al recargar y borra el token al salir", async () => {
    const jwt = token("jugador1");
    await montar();
    await act(async () => estado.iniciarSesion(jwt));
    expect(localStorage.getItem(clave)).toBe(jwt);

    await act(async () => raiz.unmount());
    await montar();
    expect(estado.sesion?.nickname).toBe("jugador1");

    await act(async () => estado.cerrarSesion());
    expect(estado.sesion).toBeNull();
    expect(localStorage.getItem(clave)).toBeNull();
  });

  it("cierra la sesión cuando otra pestaña borra el token", async () => {
    localStorage.setItem(clave, token("jugador1"));
    await montar();

    await act(async () => {
      localStorage.removeItem(clave);
      window.dispatchEvent(new StorageEvent("storage", { key: clave, newValue: null }));
    });

    expect(estado.sesion).toBeNull();
    expect(contenedor.textContent).toContain("se cerró en otra pestaña");
  });

  it("reemplaza el token guardado al renovar la sesión", async () => {
    const temporizadores = capturarTemporizadoresDeSesion();
    const jwt = token("jugador1");
    const renovado = token("jugador1", 240);
    const renovar = spyOn(authApi, "renovar").and.resolveTo({ token: renovado });
    localStorage.setItem(clave, jwt);
    await montar();

    const siguiente = temporizadores.sort((a, b) => a.espera - b.espera)[0];
    await act(async () => { siguiente.fn(); });

    expect(renovar).toHaveBeenCalledWith(jwt, jasmine.any(AbortSignal));
    expect(estado.sesion?.token).toBe(renovado);
    expect(localStorage.getItem(clave)).toBe(renovado);
  });

  it("borra un token vencido y avisa al usuario al recargar", async () => {
    localStorage.setItem(clave, token("jugador1", -1));
    await montar();

    expect(estado.sesion).toBeNull();
    expect(localStorage.getItem(clave)).toBeNull();
    expect(contenedor.textContent).toContain("Tu sesión venció.");
  });

  it("descarta una renovación que responde después del cierre en otra pestaña", async () => {
    const temporizadores = capturarTemporizadoresDeSesion();
    let responder;
    const renovar = spyOn(authApi, "renovar").and.callFake(() =>
      new Promise((resolve) => { responder = resolve; })
    );
    const jwt = token("jugador1");
    localStorage.setItem(clave, jwt);
    await montar();

    const siguiente = temporizadores.sort((a, b) => a.espera - b.espera)[0];
    await act(async () => { siguiente.fn(); });
    expect(renovar).toHaveBeenCalledWith(jwt, jasmine.any(AbortSignal));

    await act(async () => {
      localStorage.removeItem(clave);
      responder({ token: token("renovado") });
    });

    expect(estado.sesion).toBeNull();
    expect(localStorage.getItem(clave)).toBeNull();
  });
});
