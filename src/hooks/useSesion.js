import { useCallback, useEffect, useRef, useState } from "react";
import { authApi } from "../services/authApi.js";

const CLAVE = "arena_sesion";
const AVISO_VENCIMIENTO = "Tu sesión venció. Vuelve a iniciar sesión.";

function leerToken(token) {
  try {
    const carga = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(carga), (caracter) => caracter.charCodeAt(0));
    const { exp, sub, roles, userId } = JSON.parse(new TextDecoder().decode(bytes));
    const vence = exp * 1000;

    if (typeof exp !== "number" || !Number.isFinite(vence) || vence <= Date.now()) {
      return null;
    }

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

function leerTokenGuardado() {
  try {
    return localStorage.getItem(CLAVE);
  } catch {
    return undefined;
  }
}

function guardarToken(token) {
  try {
    if (token) localStorage.setItem(CLAVE, token);
    else localStorage.removeItem(CLAVE);
    return true;
  } catch {
    return false;
  }
}

export function useSesion() {
  const [sesion, setSesion] = useState(() => leerToken(leerTokenGuardado()));
  const [avisoSesion, setAvisoSesion] = useState("");
  const activa = useRef(sesion);
  const persistida = useRef(Boolean(sesion));

  const aplicar = useCallback((nueva, aviso = "") => {
    activa.current = nueva;
    setSesion(nueva);
    setAvisoSesion(aviso);
  }, []);

  const sincronizar = useCallback(() => {
    const token = leerTokenGuardado();
    if (token === undefined || token === (activa.current?.token ?? null)) return;

    const nueva = leerToken(token);
    persistida.current = Boolean(nueva);
    aplicar(nueva, nueva ? "" : "Tu sesión se cerró en otra pestaña.");
  }, [aplicar]);

  function iniciarSesion(token) {
    const nuevaSesion = leerToken(token);
    if (!nuevaSesion) throw new Error("El servidor no devolvió una sesión válida.");
    persistida.current = guardarToken(token);
    aplicar(nuevaSesion);
  }

  function cerrarSesion() {
    guardarToken(null);
    persistida.current = false;
    aplicar(null);
  }

  useEffect(() => {
    function cambioDeAlmacenamiento(evento) {
      if (evento.key === CLAVE || evento.key === null) sincronizar();
    }

    window.addEventListener("storage", cambioDeAlmacenamiento);

    const guardado = leerTokenGuardado();
    if (guardado && !leerToken(guardado) && !activa.current) {
      guardarToken(null);
      aplicar(null, AVISO_VENCIMIENTO);
    } else {
      sincronizar();
    }

    return () => window.removeEventListener("storage", cambioDeAlmacenamiento);
  }, [aplicar, sincronizar]);

  useEffect(() => {
    if (!sesion) return;

    const control = new AbortController();
    const restante = Math.max(0, sesion.vence - Date.now());
    let intento;

    function sigueActiva() {
      if (control.signal.aborted || activa.current?.token !== sesion.token) return false;
      const guardado = leerTokenGuardado();
      if (persistida.current && guardado !== undefined && guardado !== sesion.token) {
        sincronizar();
        return false;
      }
      return true;
    }

    function terminar(aviso = AVISO_VENCIMIENTO) {
      if (!sigueActiva()) return;
      guardarToken(null);
      persistida.current = false;
      aplicar(null, aviso);
    }

    async function renovar() {
      if (!sigueActiva() || Date.now() >= sesion.vence) return;

      try {
        const respuesta = await authApi.renovar(sesion.token, control.signal);
        if (!sigueActiva()) return;

        const nueva = leerToken(respuesta?.token);
        if (!nueva) {
          terminar();
          return;
        }

        persistida.current = guardarToken(nueva.token);
        aplicar(nueva);
      } catch (error) {
        if (!sigueActiva()) return;
        if ([401, 403, 409].includes(error.estado)) terminar(error.message);
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
  }, [sesion, aplicar, sincronizar]);

  return { sesion, avisoSesion, iniciarSesion, cerrarSesion };
}
