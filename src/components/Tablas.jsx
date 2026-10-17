// estas tablas usan tus mismas clases y ahora reciben datos de react
import { nombreParticipante, formatearFecha } from "../utils/logica.js";
export function TablaRanking({ filas }) {
  if (!filas.length)
    return (
      <p className="aviso-vacio">Todavía no hay posiciones disponibles.</p>
    );
  return (
    <div className="tabla-scroll">
      <table className="tabla">
        <thead>
          <tr>
            {["Pos.", "Equipo", "PJ", "PG", "PP", "Dif.", "Puntos"].map((t) => (
              <th key={t}>{t}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={f.id}>
              <td>{i + 1}</td>
              <td>{f.nombre}</td>
              <td>{f.jugadas}</td>
              <td>{f.ganadas}</td>
              <td>{f.perdidas}</td>
              <td>{f.diferencia}</td>
              <td>{f.puntos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function LlaveTorneo({ partidas, db }) {
  if (!partidas.length)
    return <p className="aviso-vacio">La llave todavía no está definida.</p>;
  const rondas = [...new Set(partidas.map((p) => p.ronda))];
  return (
    <div className="llave">
      {rondas.map((ronda) => (
        <div className="llave-ronda" key={ronda}>
          <h4>{ronda}</h4>
          {partidas
            .filter((p) => p.ronda === ronda)
            .map((p) => {
              const resultado = db.resultados.find(
                (r) => r.partidaId === p.id && r.validado,
              );
              return (
                <article className="llave-cruce" key={p.id}>
                  <strong>
                    {nombreParticipante(db, p.localId)}{" "}
                    {resultado ? resultado.puntajeLocal : "—"}
                  </strong>
                  <span>
                    {nombreParticipante(db, p.visitanteId)}{" "}
                    {resultado ? resultado.puntajeVisitante : "—"}
                  </span>
                  <small>{p.fechaHora}</small>
                </article>
              );
            })}
        </div>
      ))}
    </div>
  );
}
export function Ficha({ filas }) {
  return (
    <dl className="ficha-datos">
      {filas.map(([titulo, valor]) => (
        <div key={titulo}>
          <dt>{titulo}</dt>
          <dd>{valor}</dd>
        </div>
      ))}
    </dl>
  );
}
export function Fecha({ valor }) {
  return <time dateTime={valor}>{formatearFecha(valor)}</time>;
}
