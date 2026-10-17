// el pie es el mismo de tu página, los dos botones sirven para repetir la demo
import { Link } from "react-router-dom";
import { useState } from "react";
export default function PiePagina({ alReiniciar, alActivarFechas }) {
  const [mensaje, setMensaje] = useState("");
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
      <div className="contenedor acciones-demo">
        <button
          className="boton boton-limpio"
          onClick={() => {
            alActivarFechas();
            setMensaje("Fechas de prueba activadas durante siete días.");
          }}
        >
          Activar fechas de prueba
        </button>
        <button
          className="boton boton-limpio"
          onClick={() => {
            alReiniciar();
            setMensaje("Demostración restablecida.");
          }}
        >
          Restablecer demostración
        </button>
        <span role="status">{mensaje}</span>
      </div>
      <p className="copyright">
        © 2026 eSports Arena Manager · Proyecto académico
      </p>
    </footer>
  );
}
