import { useEffect, useState } from "react";
import ListaPartidas from "../components/ListaPartidas.jsx";
import { useSearchParams } from "react-router-dom";
import { Estado } from "../components/TarjetaTorneo.jsx";
import { Ficha, LlaveTorneo, TablaRanking } from "../components/Tablas.jsx";
import { useCatalogoTorneos } from "../hooks/useCatalogoTorneos.js";
import { torneosApi } from "../services/torneosApi.js";
import { formatearFecha } from "../utils/logica.js";

export default function TorneoDetalle() {
  const [busqueda, setBusqueda] = useSearchParams();
  const { catalogo, error } = useCatalogoTorneos();
  const torneos = catalogo?.torneos ?? [];
  const id = Number(busqueda.get("id") ?? torneos[0]?.id);
  const torneo = torneos.find((t) => t.id === id);
  return (
    <main className="contenedor pagina-detalle">
      <section className="titulo-pagina">
        <p className="etiqueta">FICHA DEL TORNEO</p>
        <h1>Detalle de torneo</h1>
        <p>
          Toda la información de un torneo: datos generales, participantes,
          llave, calendario de partidas, tabla de posiciones y premios.
        </p>
      </section>
      {error && <p role="alert">{error}</p>}
      {!catalogo && !error && <p role="status">Cargando torneos.</p>}
      {catalogo && (
        <>
          <div className="campo selector-detalle">
            <label htmlFor="selector-torneo">Ver torneo</label>
            <select className="form-select"
              id="selector-torneo"
              value={torneo ? id : ""}
              onChange={(e) => setBusqueda({ id: e.target.value })}
              disabled={!torneos.length}
            >
              <option value="" disabled>Selecciona un torneo</option>
              {torneos.map((t) => (
                <option value={t.id} key={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>
          {torneo ? (
            <FichaTorneo key={id} torneo={torneo} />
          ) : (
            <p className="alert alert-info aviso-vacio" role="status">
              {busqueda.has("id") ? "El torneo no existe." : "No hay torneos disponibles."}
            </p>
          )}
        </>
      )}
    </main>
  );
}

function FichaTorneo({ torneo }) {
  const [detalle, setDetalle] = useState(null);
  const [error, setError] = useState("");
  const { id, cupoActual, cupoMaximo } = torneo;

  useEffect(() => {
    const control = new AbortController();
    torneosApi.cargarDetalle(id, control.signal)
      .then((datos) => {
        if (!control.signal.aborted) setDetalle(datos);
      })
      .catch(() => {
        if (!control.signal.aborted) setError("No se pudieron cargar los datos de la competencia.");
      });

    return () => control.abort();
  }, [id]);

  return (
    <div className="detalle-torneo">
      <div className="detalle-encabezado">
        <h2>{torneo.nombre}</h2>
        <Estado estado={torneo.estado} />
      </div>
      <Ficha
        filas={[
          ["Juego", torneo.juego],
          ["Modalidad", torneo.modalidad],
          ["Estado", torneo.estado],
          ["Cupo", `${cupoActual} / ${cupoMaximo}`],
          ["Cupos disponibles", Math.max(0, cupoMaximo - cupoActual)],
          ["Cierre de inscripción", formatearFecha(torneo.cierre)],
        ]}
      />
      {error && <p role="alert">{error}</p>}
      {!detalle && !error && <p role="status">Cargando datos de la competencia.</p>}
      {detalle && <Competencia detalle={detalle} finalizado={torneo.estado === "Finalizado"} />}
    </div>
  );
}

function Competencia({ detalle, finalizado }) {
  return (
    <>
      <section>
        <h3>Participantes inscritos</h3>
        {!detalle.inscritos.length ? (
          <p className="alert alert-info aviso-vacio">
            Todavía no hay participantes inscritos.
          </p>
        ) : (
          <div className="table-responsive tabla-scroll">
            <table className="table table-hover tabla">
              <thead>
                <tr>
                  <th>Participante</th>
                  <th>Estado</th>
                  <th>Inscrito</th>
                </tr>
              </thead>
              <tbody>
                {detalle.inscritos.map((i) => (
                  <tr key={i.id}>
                    <td>{i.nombre}</td>
                    <td>
                      <Estado estado={i.estado} />
                    </td>
                    <td>{formatearFecha(i.fecha)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <DetallePartidas partidas={detalle.partidas} db={detalle} />
      <section>
        <h3>Tabla de posiciones</h3>
        <TablaRanking filas={detalle.ranking} />
      </section>
      <section>
        <h3>Premios</h3>
        {!finalizado && (
          <p className="alert alert-info aviso-vacio">
            Los premios por posición se publican al finalizar el torneo.
          </p>
        )}
        {finalizado && !detalle.premios.length && <p>No hay premios publicados.</p>}
        {finalizado && detalle.premios.length > 0 && (
          <ul>
            {detalle.premios.map((premio) => (
              <li key={premio.posicion}>{premio.posicion}º lugar: {premio.descripcion}</li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

// La clave del torneo reinicia la ronda al cambiar de torneo.
function DetallePartidas({ partidas, db }) {
  const [ronda, setRonda] = useState("");
  const rondas = [...new Set(partidas.map((p) => p.ronda))];
  const visibles = ronda ? partidas.filter((p) => p.ronda === ronda) : partidas;
  return (
    <>
      {!!partidas.length && (
        <div className="campo selector-detalle mb-0">
          <label htmlFor="selector-ronda">Ronda visible</label>
          <select className="form-select" id="selector-ronda" value={ronda}
            onChange={(e) => setRonda(e.target.value)}
            aria-controls="llave-visible calendario-visible">
            <option value="">Todas las rondas</option>
            {rondas.map((nombre) => <option key={nombre} value={nombre}>{nombre}</option>)}
          </select>
        </div>
      )}
      <section id="llave-visible" aria-labelledby="titulo-llave">
        <h3 id="titulo-llave">Llave del torneo</h3>
        <LlaveTorneo partidas={visibles} db={db} />
      </section>
      <section id="calendario-visible" aria-labelledby="titulo-calendario" aria-live="polite">
        <h3 id="titulo-calendario">Calendario de partidas</h3>
        <ListaPartidas partidas={visibles} db={db} />
      </section>
    </>
  );
}
