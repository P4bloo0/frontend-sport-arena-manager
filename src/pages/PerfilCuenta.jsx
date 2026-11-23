import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Ficha } from "../components/Tablas.jsx";
import { perfilApi } from "../services/perfilApi.js";

export default function PerfilCuenta({ token }) {
  const [estado, setEstado] = useState({ cuenta: null, error: null });
  const [bandeja, setBandeja] = useState({ mensajes: null, error: "" });

  useEffect(() => {
    const control = new AbortController();

    perfilApi.consultar(token, control.signal)
      .then((cuenta) => {
        if (!cuenta?.usuarioId) throw new Error("El servidor no devolvió los datos de tu cuenta.");
        if (!control.signal.aborted) setEstado({ cuenta, error: null });
      })
      .catch((error) => {
        if (!control.signal.aborted) setEstado({ cuenta: null, error });
      });

    perfilApi.notificaciones(token, control.signal)
      .then((mensajes) => {
        if (control.signal.aborted) return;
        const visibles = mensajes.filter((aviso) => aviso.estado !== "ARCHIVADA");
        visibles.sort((a, b) => b.fecha.localeCompare(a.fecha));
        setBandeja({ mensajes: visibles, error: "" });
      })
      .catch((error) => {
        if (!control.signal.aborted) setBandeja({ mensajes: null, error: error.message });
      });

    return () => control.abort();
  }, [token]);

  const { cuenta, error } = estado;
  return (
    <main className="contenedor seccion">
      <h1>Mi perfil</h1>
      {error && (
        <div className="alert alert-warning" role="alert">
          <p>{error.message}</p>
          {error.estado === 401 && <Link to="/acceso.html">Ir a Acceso</Link>}
        </div>
      )}
      {!cuenta && !error && <p role="status">Cargando los datos de tu cuenta.</p>}
      {cuenta && (
        <Ficha filas={[
          ["Nombre", cuenta.nombre],
          ["Apodo", cuenta.nickname],
          ["Correo", cuenta.email],
          ["Rol", cuenta.rol],
          ["Estado", cuenta.estado],
        ]} />
      )}
      <section aria-labelledby="perfil-notificaciones">
        <h2 id="perfil-notificaciones">Notificaciones</h2>
        {bandeja.error && <p role="alert">{bandeja.error}</p>}
        {!bandeja.mensajes && !bandeja.error && <p role="status">Cargando notificaciones.</p>}
        {bandeja.mensajes?.length === 0 && <p>No tienes notificaciones.</p>}
        {bandeja.mensajes?.length > 0 && (
          <ul className="list-group">
            {bandeja.mensajes.map(({ notificacionId, mensaje, fecha }) => (
              <li key={notificacionId} className="list-group-item">
                <p className="mb-1">{mensaje}</p>
                <time dateTime={fecha}>{fecha.replace("T", " ").slice(0, 16)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
