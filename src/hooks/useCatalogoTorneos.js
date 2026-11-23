import { useEffect, useState } from "react";
import { torneosApi } from "../services/torneosApi.js";

export function useCatalogoTorneos() {
  const [estado, setEstado] = useState({ catalogo: null, error: "" });

  useEffect(() => {
    const control = new AbortController();

    torneosApi.cargarCatalogo(control.signal)
      .then((catalogo) => {
        if (!control.signal.aborted) setEstado({ catalogo, error: "" });
      })
      .catch(() => {
        if (!control.signal.aborted) {
          setEstado({ catalogo: null, error: "No se pudieron cargar los torneos. Revisa que el backend esté encendido." });
        }
      });

    return () => control.abort();
  }, []);

  return estado;
}
