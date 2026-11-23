import { useState } from "react";

export function useOperacion() {
  const [estado, setEstado] = useState({ ocupado: false, error: "", mensaje: "" });
  async function ejecutar(accion, mensaje) {
    if (estado.ocupado) return;
    setEstado({ ocupado: true, error: "", mensaje: "" });
    try {
      await accion();
      setEstado({ ocupado: false, error: "", mensaje });
    } catch (fallo) {
      setEstado({ ocupado: false, error: fallo.message, mensaje: "" });
    }
  }
  return { ...estado, ejecutar, limpiar: () => setEstado({ ocupado: false, error: "", mensaje: "" }) };
}
