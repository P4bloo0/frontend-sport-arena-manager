import { useEffect, useState } from "react";
import { authApi } from "../services/authApi.js";

const CLAVE = "arena_sesion";

function leerToken(token) {
  try {
    const carga = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(carga), (caracter) => caracter.charCodeAt(0));
    const { exp, sub, roles, userId } = JSON.parse(new TextDecoder().decode(bytes));
    const vence = exp * 1000;

    if (!Number.isFinite(vence) || vence <= Date.now()) return null;

    return {
      token,
      nickname: sub,
      roles: Array.isArray(roles) ? roles : [],
      userId,
      vence,
    };
  } catch {
    return null;
  }
}

export function useSesion() {
  const [sesion, setSesion] = useState(() => {
    try {
      return leerToken(localStorage.getItem(CLAVE));
    } catch {
      return null;
    }
  });

  function iniciarSesion(token) {
    const nuevaSesion = leerToken(token);
    if (!nuevaSesion) throw new Error("El servidor no devolvió una sesión válida.");
    setSesion(nuevaSesion);
  }

  function cerrarSesion() {
    setSesion(null);
  }

  useEffect(() => {
    try {
      if (sesion) localStorage.setItem(CLAVE, sesion.token);
      else localStorage.removeItem(CLAVE);
    } catch {
      // La sesión sigue funcionando mientras esta pestaña esté abierta.
    }
  }, [sesion]);

  useEffect(() => {
    if (!sesion) return;

    const control = new AbortController();
    const restante = Math.max(0, sesion.vence - Date.now());
    let intento;

    function terminar() {
      setSesion((actual) => actual?.token === sesion.token ? null : actual);
    }

    async function renovar() {
      if (control.signal.aborted || Date.now() >= sesion.vence) return;

      try {
        const respuesta = await authApi.renovar(sesion.token, control.signal);
        if (control.signal.aborted) return;

        const nueva = leerToken(respuesta?.token);
        if (!nueva) {
          terminar();
          return;
        }

        setSesion((actual) => actual?.token === sesion.token ? nueva : actual);
      } catch (error) {
        if (control.signal.aborted) return;
        if ([401, 403, 409].includes(error.estado)) terminar();
        else if (sesion.vence - Date.now() > 10000) {
          intento = setTimeout(renovar, 10000);
        }
      }
    }

    const vencimiento = setTimeout(terminar, restante);
    const margen = Math.min(60000, restante / 2);
    intento = setTimeout(renovar, restante - margen);

    return () => {
      control.abort();
      clearTimeout(intento);
      clearTimeout(vencimiento);
    };
  }, [sesion]);

  return { sesion, iniciarSesion, cerrarSesion };
}