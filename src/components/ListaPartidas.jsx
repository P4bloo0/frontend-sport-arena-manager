import { Estado } from "./TarjetaTorneo.jsx";
import { nombreParticipante } from "../utils/logica.js";

// Recibe las partidas de la ronda elegida; el detalle conserva la selección.
export default function ListaPartidas({ partidas, db }) {
  if (!partidas.length)
    return <p className="aviso-vacio">No hay partidas programadas.</p>;

  return (
    <div className="tabla-scroll">
      <table className="tabla">
        <caption className="visually-hidden">Calendario de las partidas visibles</caption>
        <thead>
          <tr>
            {["Ronda", "Enfrentamiento", "Fecha y hora", "Estado", "Resultado"].map((titulo) => (
              <th scope="col" key={titulo}>{titulo}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {partidas.map((partida) => {
            const resultado = db.resultados.find(
              (r) => r.partidaId === partida.id && r.validado,
            );
            return (
              <tr key={partida.id}>
                <td>{partida.ronda}</td>
                <td>{nombreParticipante(db, partida.localId)} vs {nombreParticipante(db, partida.visitanteId)}</td>
                <td>{partida.fechaHora}</td>
                <td><Estado estado={partida.estado} /></td>
                <td>{resultado ? `${resultado.puntajeLocal} - ${resultado.puntajeVisitante}` : "Por definir"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
