import { Link } from "react-router-dom";
import TarjetaTorneo from "../components/TarjetaTorneo.jsx";
import { useCatalogoTorneos } from "../hooks/useCatalogoTorneos.js";
import { formatearFecha, hoy } from "../utils/logica.js";
export default function Inicio() {
  const { catalogo, error } = useCatalogoTorneos();
  const torneos = catalogo?.torneos ?? [];
  const fecha = hoy();
  const cierres = torneos
    .filter((t) => t.estado === "Abierto" && t.cierre >= fecha)
    .sort((a, b) => a.cierre.localeCompare(b.cierre))
    .slice(0, 3);
  const destacados = [...cierres, ...torneos.filter((t) => t.estado === "En curso")]
    .slice(0, 3);
  return (
    <main>
      <section className="hero">
        <div className="contenedor hero-contenido">
          <div>
            <p className="etiqueta">COMPITE · ORGANIZA · ASCIENDE</p>
            <h1>Tu próxima victoria comienza en la arena.</h1>
            <p className="texto-destacado">
              Encuentra torneos, reúne a tu equipo y demuestra quién domina la
              competencia.
            </p>
            <Link className="btn btn-primary boton boton-primario" to="/torneos.html">
              Explorar torneos
            </Link>
          </div>
          <img
            className="imagen-hero"
            src="https://statics.forbesargentina.com/2022/05/627bb6383de0d.jpeg"
            alt="Jugadores de eSports compitiendo frente a computadores"
          />
        </div>
      </section>
      <section
        className="seccion contenedor"
        aria-labelledby="titulo-destacados"
      >
        <div className="encabezado-seccion">
          <div>
            <p className="etiqueta">TORNEOS ACTIVOS</p>
            <h2 id="titulo-destacados">Torneos destacados</h2>
          </div>
          <Link className="enlace-texto" to="/torneos.html">
            Ver todos los torneos →
          </Link>
        </div>
        {error && <p role="alert">{error}</p>}
        {!catalogo && !error && <p role="status">Cargando torneos.</p>}
        {catalogo && !destacados.length && <p>No hay torneos activos.</p>}
        <div className="rejilla-torneos">
          {destacados.map((torneo) => <TarjetaTorneo key={torneo.id} torneo={torneo} />)}
        </div>
      </section>
      <section className="seccion seccion-oscura">
        <div className="contenedor dos-columnas">
          <article>
            <p className="etiqueta">INSCRIPCIONES</p>
            <h2>Próximos cierres</h2>
            <p>No dejes tu inscripción para el último minuto.</p>
            {catalogo && !cierres.length && <p>No hay cierres próximos.</p>}
            <ul className="lista-cierres">
              {cierres.map((t) => (
                <li key={t.id}>
                  <strong>{t.nombre}</strong>
                  <br />
                  Cierra el {formatearFecha(t.cierre)}
                </li>
              ))}
            </ul>
          </article>
          <article className="panel-reglas">
            <h2>¿Listo para jugar?</h2>
            <p>
              Revisa los requisitos del torneo, confirma que tu equipo esté
              completo y participa antes de la fecha de cierre.
            </p>
            <Link className="btn btn-secondary boton boton-secundario" to="/torneos.html">
              Ver torneos
            </Link>
          </article>
        </div>
      </section>
      <section className="seccion contenedor" aria-labelledby="titulo-video">
        <div className="encabezado-seccion">
          <div>
            <p className="etiqueta">VIVE LA COMPETENCIA</p>
            <h2 id="titulo-video">Momentos que hacen historia</h2>
          </div>
        </div>
        <div className="contenedor-video">
          <video
            controls
            preload="metadata"
            aria-label="Video de competencias eSports"
          >
            <source src="/assets/video/esports.mp4" type="video/mp4" />
            Tu navegador no puede reproducir este video.
          </video>
        </div>
      </section>
    </main>
  );
}
