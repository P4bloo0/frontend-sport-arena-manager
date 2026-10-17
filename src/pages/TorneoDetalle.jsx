// el selector cambia la dirección y react muestra el torneo elegido
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
        <select
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
        <p className="aviso-vacio" role="alert">
          El torneo no existe.
        </p>
      ) : (
        <div className="detalle-torneo">
          <div className="detalle-encabezado">
            <h2>{torneo.nombre}</h2>
            <Estado estado={torneo.estado} />
            <Link
              className="boton boton-primario"
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
              <p className="aviso-vacio">
                Todavía no hay participantes inscritos.
              </p>
            ) : (
              <div className="tabla-scroll">
                <table className="tabla">
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
          <section>
            <h3>Llave del torneo</h3>
            <LlaveTorneo partidas={partidas} db={db} />
          </section>
          <section>
            <h3>Calendario de partidas</h3>
            {!partidas.length ? (
              <p className="aviso-vacio">No hay partidas programadas.</p>
            ) : (
              <div className="tabla-scroll">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Ronda</th>
                      <th>Enfrentamiento</th>
                      <th>Fecha y hora</th>
                      <th>Estado</th>
                      <th>Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partidas.map((p) => {
                      const r = db.resultados.find(
                        (r) => r.partidaId === p.id && r.validado,
                      );
                      return (
                        <tr key={p.id}>
                          <td>{p.ronda}</td>
                          <td>
                            {nombreParticipante(db, p.localId)} vs{" "}
                            {nombreParticipante(db, p.visitanteId)}
                          </td>
                          <td>{p.fechaHora}</td>
                          <td>{p.estado}</td>
                          <td>
                            {r
                              ? `${r.puntajeLocal} - ${r.puntajeVisitante}`
                              : "Por definir"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
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
              <p className="aviso-vacio">
                Los premios por posición se publican al finalizar el torneo.
              </p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
