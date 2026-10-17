// el selector cambia la dirección y react muestra el torneo elegido
import { useState } from "react";
import ListaPartidas from "../components/ListaPartidas.jsx";
import { Link, useSearchParams } from "react-router-dom";
import { Estado } from "../components/TarjetaTorneo.jsx";
import { Ficha, LlaveTorneo, TablaRanking } from "../components/Tablas.jsx";
import {
  cuposDisponibles,
  formatearFecha,
  nombreParticipante,
  rankingTorneo,
} from "../utils/logica.js";
export default function TorneoDetalle({ db }) {
  const [busqueda, setBusqueda] = useSearchParams();
  const id = Number(busqueda.get("id") ?? 1);
  const torneo = db.torneos.find((t) => t.id === id);
  const partidas = db.partidas.filter((p) => p.torneoId === id);
  const inscritos = db.inscripciones.filter((i) => i.torneoId === id);
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
      <div className="campo selector-detalle">
        <label htmlFor="selector-torneo">Ver torneo</label>
        <select className="form-select"
          id="selector-torneo"
          value={torneo ? id : ""}
          onChange={(e) => setBusqueda({ id: e.target.value })}
        >
          <option value="" disabled>
            Selecciona un torneo
          </option>
          {db.torneos.map((t) => (
            <option value={t.id} key={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
      </div>
      {!torneo ? (
        <p className="alert alert-info aviso-vacio" role="alert">
          El torneo no existe.
        </p>
      ) : (
        <div className="detalle-torneo">
          <div className="detalle-encabezado">
            <h2>{torneo.nombre}</h2>
            <Estado estado={torneo.estado} />
            <Link
              className="btn btn-primary boton boton-primario"
              to={"/inscripcion.html?id=" + id}
            >
              Inscribirme
            </Link>
          </div>
          <Ficha
            filas={[
              ["Juego", torneo.juego],
              ["Modalidad", torneo.modalidad],
              ["Estado", torneo.estado],
              [
                "Cupo",
                `${torneo.cupoMaximo - cuposDisponibles(torneo, db.inscripciones)} / ${torneo.cupoMaximo}`,
              ],
              ["Cupos disponibles", cuposDisponibles(torneo, db.inscripciones)],
              ["Cierre de inscripción", formatearFecha(torneo.cierre)],
            ]}
          />
          <section>
            <h3>Participantes inscritos</h3>
            {!inscritos.length ? (
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
                    {inscritos.map((i) => (
                      <tr key={i.id}>
                        <td>
                          {nombreParticipante(
                            db,
                            i.equipoId ?? i.jugadorId,
                            i.equipoId == null ? "jugador" : "equipo",
                          )}
                        </td>
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
          <DetallePartidas key={id} partidas={partidas} db={db} />
          <section>
            <h3>Tabla de posiciones</h3>
            <TablaRanking filas={rankingTorneo(db, id)} />
          </section>
          <section>
            <h3>Premios</h3>
            {torneo.estado === "Finalizado" ? (
              <ul>
                {db.premios
                  .filter((p) => p.torneoId === id)
                  .map((p) => (
                    <li key={p.posicion}>
                      {p.posicion}° lugar: {p.descripcion}
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="alert alert-info aviso-vacio">
                Los premios por posición se publican al finalizar el torneo.
              </p>
            )}
          </section>
        </div>
      )}
    </main>
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
