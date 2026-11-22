import { Link } from "react-router-dom";
import { cuposDisponibles, formatearFecha } from "../utils/logica.js";

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

export default function TarjetaTorneo({
  torneo,
  inscripciones,
  mostrarDetalle = true,
}) {
  const ocupados =
    torneo.cupoActual ??
    (torneo.cupoMaximo - cuposDisponibles(torneo, inscripciones));

  const libres = Math.max(0, torneo.cupoMaximo - ocupados);

  return (
    <article
      className="card tarjeta-torneo"
      style={{
        "--logo-juego": logosJuegos[torneo.juego]
          ? `url("${logosJuegos[torneo.juego]}")`
          : "none",
      }}
    >
      <Estado estado={torneo.estado} />

      <div>
        <h3>{torneo.nombre}</h3>
        <p>{torneo.juego} · {torneo.modalidad}</p>
      </div>

      <ul className="datos-torneo">
        <li>
          <strong>Inscritos:</strong> {ocupados}/{torneo.cupoMaximo}
        </li>
        <li>
          <strong>Cupos libres:</strong> {libres}
        </li>
        <li>
          <strong>Cierre:</strong> {formatearFecha(torneo.cierre)}
        </li>
      </ul>

      {mostrarDetalle && (
        <Link
          className="btn btn-secondary boton boton-secundario"
          to={"/detalle-torneo.html?id=" + torneo.id}
        >
          Ver detalle
        </Link>
      )}
    </article>
  );
}