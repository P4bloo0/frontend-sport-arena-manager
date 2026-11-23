import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Ficha } from "../components/Tablas.jsx";
import { perfilApi } from "../services/perfilApi.js";

export default function PerfilCuenta({ token }) {
  const [estado, setEstado] = useState({ cuenta: null, error: null });

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
    </main>
  );
}
