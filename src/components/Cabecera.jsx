// viene de la idea de cabecera de tu amigo, con tu mismo menú y logo
import { Link, useLocation } from "react-router-dom";
import { perfiles } from "../data/datos.js";
const enlaces = [
  ["index.html", "Inicio"],
  ["torneos.html", "Torneos"],
  ["detalle-torneo.html", "Detalle"],
  ["inscripcion.html", "Inscripción"],
  ["equipos.html", "Equipos"],
  ["perfil.html", "Perfil"],
];
export default function Cabecera({ perfil, onPerfilChange }) {
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
                  {texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="selector-rol">
          <label htmlFor="selector-perfil">Perfil de prueba</label>
          <select className="form-select"
            id="selector-perfil"
            value={perfil}
            onChange={(e) => onPerfilChange(e.target.value)}
          >
            {perfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} · {p.rol}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
