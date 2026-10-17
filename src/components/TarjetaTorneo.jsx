// tu amigo separó la tarjeta; aquí usamos la misma tarjeta de tu repo
import { Link } from "react-router-dom";
import { cuposDisponibles, formatearFecha } from "../utils/logica.js";
// aquí va la imagen de cada juego
const logosJuegos = {
  "League of Legends": "/imagenes/juegos/lol.jpg",
  Valorant: "/imagenes/juegos/valorant.jpg",
  Minecraft: "/imagenes/juegos/Minecraft.jpg",
  Fortnite: "/imagenes/juegos/fortnite.jpg",
};
export function Estado({ estado }) {
  return (
    <span
      className={"badge estado estado-" + estado.toLowerCase().replaceAll(" ", "-")}
    >
      {estado}
    </span>
  );
}
export default function TarjetaTorneo({ torneo, inscripciones }) {
  const libres = cuposDisponibles(torneo, inscripciones);
  return (
    <article
      className="card tarjeta-torneo"
      style={{
        // le pasamos al fondo la imagen de este juego
        "--logo-juego": logosJuegos[torneo.juego]
          ? `url("${logosJuegos[torneo.juego]}")`
          : "none",
      }}
    >
      <Estado estado={torneo.estado} />
      <div>
        <h3>{torneo.nombre}</h3>
        <p>
          {torneo.juego} · {torneo.modalidad}
        </p>
      </div>
      <ul className="datos-torneo">
        <li>
          <strong>Equipos:</strong> {torneo.cupoMaximo - libres}/
          {torneo.cupoMaximo}
        </li>
        <li>
          <strong>Cupos libres:</strong> {libres}
        </li>
        <li>
          <strong>Cierre:</strong> {formatearFecha(torneo.cierre)}
        </li>
      </ul>
      <Link
        className="btn btn-secondary boton boton-secundario"
        to={"/detalle-torneo.html?id=" + torneo.id}
      >
        Ver detalle
      </Link>
    </article>
  );
}
