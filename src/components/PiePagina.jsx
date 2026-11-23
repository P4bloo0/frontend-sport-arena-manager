import { Link } from "react-router-dom";
export default function PiePagina() {
  return (
    <footer className="pie-pagina">
      <div className="contenedor pie-contenido">
        <div>
          <Link className="logo" to="/index.html">
            ◆ eSports Arena
          </Link>
          <p>Plataforma para gestión de torneos competitivos.</p>
        </div>
        <div>
          <h2>Información</h2>
          <ul>
            <li>
              <Link to="/torneos.html">Torneos</Link>
            </li>
            <li>
              <Link to="/equipos.html">Equipos</Link>
            </li>
            <li>
              <Link to="/perfil.html">Mi perfil</Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="copyright">
        © 2026 eSports Arena Manager · Proyecto académico
      </p>
    </footer>
  );
}
