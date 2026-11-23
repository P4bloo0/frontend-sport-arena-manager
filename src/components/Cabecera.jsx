import { Link, useLocation } from "react-router-dom";
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
            {enlaces.map(([ruta, texto]) => (
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
