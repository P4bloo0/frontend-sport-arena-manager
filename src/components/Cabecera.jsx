import { Link, useLocation } from "react-router-dom";
import { rolesOrganizacion } from "../utils/roles.js";
const enlaces = [
  ["index.html", "Inicio"],
  ["torneos.html", "Torneos"],
  ["detalle-torneo.html", "Detalle"],
  ["inscripcion.html", "Inscripción"],
  ["equipos.html", "Equipos"],
  ["perfil.html", "Perfil"],
  ["acceso.html", "Acceso"],
];
export default function Cabecera({ sesion }) {
  const location = useLocation();
  const roles = sesion?.roles ?? [];
  const visibles = [...enlaces];
  if (roles.includes("ADMINISTRADOR")) visibles.push(["administracion.html", "Administración"]);
  if (rolesOrganizacion.some((rol) => roles.includes(rol))) visibles.push(["organizacion.html", "Organización"]);
  return (
    <header className="encabezado">
      <div className="contenedor barra-navegacion">
        <Link
          className="logo"
          to="/index.html"
          aria-label="Ir al inicio de eSports Arena Manager"
        >
          <span aria-hidden="true">◆</span> eSports Arena
        </Link>
        <nav aria-label="Navegación principal">
          <ul className="menu">
            {visibles.map(([ruta, texto]) => (
              <li key={ruta}>
                <Link
                  to={"/" + ruta}
                  aria-current={
                    location.pathname === "/" + ruta ? "page" : undefined
                  }
                >
                  {ruta === "acceso.html" && sesion ? "Mi sesión" : texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
