const URL = (import.meta.env?.VITE_API_URL || "http://localhost:8080")
  .replace(/\/+$/, "");

async function enviar(ruta, { datos, token, signal } = {}) {
  const headers = { Accept: "application/json" };

  if (datos) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let respuesta;

  try {
    respuesta = await fetch(`${URL}/api/v1/auth/${ruta}`, {
      method: "POST",
      headers,
      body: datos ? JSON.stringify(datos) : undefined,
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error("No se pudo conectar con el backend. Revisa Docker Desktop.");
  }

  const contenido = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    let mensaje = contenido?.mensaje || `La solicitud falló (${respuesta.status}).`;
    if (respuesta.status === 401) {
      mensaje = token ? "Tu sesión venció." : "El apodo o la contraseña no son correctos.";
    }

    const error = new Error(mensaje);
    error.estado = respuesta.status;
    error.campos = contenido?.errores ?? {};
    throw error;
  }

  return contenido;
}

export const authApi = {
  registrar: (datos) => enviar("register", { datos }),
  ingresar: (datos) => enviar("login", { datos }),
  renovar: (token, signal) => enviar("renovar", { token, signal }),
};
