import { Navigate } from "react-router-dom";

export default function RutaProtegida({ sesion, roles = [], children }) {
  if (!sesion) return <Navigate to="/acceso.html" replace />;

  if (roles.length && !roles.some((rol) => sesion.roles.includes(rol))) {
    return (
      <main className="contenedor seccion">
        <h1>Acceso restringido</h1>
        <p role="alert">Tu rol no tiene permiso para acceder a esta página.</p>
      </main>
    );
  }

  return children;
}
