const URL = (import.meta.env?.VITE_API_URL || "http://localhost:8080")
  .replace(/\/+$/, "");

export async function solicitar(ruta, {
  metodo = "GET", datos, token, signal, mensaje401,
} = {}) {
  const headers = { Accept: "application/json" };
  if (datos !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let respuesta;
  try {
    respuesta = await fetch(`${URL}/api/v1/${ruta}`, {
      method: metodo,
      headers,
      body: datos === undefined ? undefined : JSON.stringify(datos),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error("No se pudo conectar con el backend. Revisa que el Gateway esté activo.");
  }

  const contenido = await respuesta.json().catch(() => null);
  if (respuesta.ok) return contenido;

  const mensaje =
    (respuesta.status === 401 && mensaje401) ||
    contenido?.mensaje ||
    (respuesta.status === 403 && "Tu rol no tiene permiso para esta acción.") ||
    `La solicitud falló (${respuesta.status}).`;
  const error = new Error(mensaje);
  error.estado = respuesta.status;
  error.campos = contenido?.errores ?? {};
  throw error;
}
