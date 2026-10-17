import DosColumnas from "../components/DosColumnas.jsx";
// esta pantalla estaba vacía en develo, conservamos la ficha y el editor de tu repo
import { useState } from "react";
import Campo from "../components/Campo.jsx";
import { Ficha } from "../components/Tablas.jsx";
import { Estado } from "../components/TarjetaTorneo.jsx";
import { arenaService } from "../services/arenaService.js";
import { formatearFecha, tieneSancionActiva } from "../utils/logica.js";
function Editor({ db, jugador, perfil, alCambiar }) {
  const [datos, setDatos] = useState({
    apodo: jugador.apodo,
    correo: jugador.correo,
  });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const puede =
    perfil.rol === "Organizador" ||
    perfil.rol === "Administrador" ||
    (perfil.rol === "Jugador" && perfil.jugadorId === jugador.id);
  function guardar(e) {
    e.preventDefault();
    setErrores({});
    setMensaje("");
    try {
      alCambiar(arenaService.guardarPerfil(db, jugador.id, datos, perfil));
      setMensaje("Perfil actualizado.");
    } catch (e) {
      setErrores(e.campos ?? { general: e.message });
    }
  }
  return (
    <>
      <form className="formulario" onSubmit={guardar} noValidate>
        <Campo
          id="pf-apodo"
          etiqueta="Apodo"
          ayuda="Obligatorio, sin espacios, de 3 a 16 caracteres."
          error={errores.apodo}
        >
          <input
            id="pf-apodo"
            maxLength="16"
            value={datos.apodo}
            onChange={(e) => setDatos({ ...datos, apodo: e.target.value })}
            aria-describedby="pf-apodo-error"
          />
        </Campo>
        <Campo id="pf-correo" etiqueta="Correo" error={errores.correo}>
          <input
            id="pf-correo"
            type="email"
            value={datos.correo}
            onChange={(e) => setDatos({ ...datos, correo: e.target.value })}
            aria-describedby="pf-correo-error"
          />
        </Campo>
        <p className="mensaje-error" role="alert">
          {errores.general}
        </p>
        <button className="boton boton-primario" disabled={!puede}>
          Guardar cambios
        </button>
      </form>
      <p role="status">
        {mensaje ||
          (!puede ? "Solo puedes editar tu propio perfil como jugador." : "")}
      </p>
    </>
  );
}
export default function Perfil({ db, perfil, alCambiar }) {
  const [consulta, setConsulta] = useState(
    perfil.jugadorId ?? db.jugadores[0].id,
  );
  const jugador =
    db.jugadores.find((j) => j.id === Number(consulta)) ?? db.jugadores[0];
  const equipos = db.equipos.filter((e) =>
    e.integrantes.some((i) => i.jugadorId === jugador.id),
  );
  const ids = equipos.map((e) => e.id);
  const historial = db.inscripciones.filter(
    (i) => i.jugadorId === jugador.id || ids.includes(i.equipoId),
  );
  const partidas = db.partidas.filter(
    (p) => ids.includes(p.localId) || ids.includes(p.visitanteId),
  );
  const resultados = db.resultados.filter(
    (r) => r.validado && partidas.some((p) => p.id === r.partidaId),
  );
  const ganadas = resultados.filter((r) => ids.includes(r.ganadorId)).length;
  const sanciones = db.sanciones.filter(
    (s) =>
      (s.tipoParticipante === "jugador" && s.participanteId === jugador.id) ||
      (s.tipoParticipante === "equipo" && ids.includes(s.participanteId)),
  );
  return (
    <main className="contenedor pagina-detalle">
      <section className="titulo-pagina">
        <p className="etiqueta">FICHA</p>
        <h1>Perfil de jugador</h1>
      </section>
      <div className="campo selector-detalle">
        <label htmlFor="selector-jugador">Ver ficha de</label>
        <select
          id="selector-jugador"
          value={jugador.id}
          onChange={(e) => setConsulta(Number(e.target.value))}
        >
          {db.jugadores.map((j) => (
            <option key={j.id} value={j.id}>
              {j.apodo}
            </option>
          ))}
        </select>
      </div>
      <DosColumnas>
        <section className="panel-filtros">
          <h2>Datos</h2>
          <Ficha
            filas={[
              ["Nombre", jugador.nombre],
              ["Apodo", jugador.apodo],
              ["Correo", jugador.correo],
              ["País", jugador.pais],
              [
                "Estado",
                tieneSancionActiva(db.sanciones, "jugador", jugador.id)
                  ? "Con sanción vigente"
                  : "Habilitado",
              ],
            ]}
          />
        </section>
        <section className="panel-filtros">
          <h2>Editar contacto</h2>
          <Editor
            key={jugador.id}
            db={db}
            jugador={jugador}
            perfil={perfil}
            alCambiar={alCambiar}
          />
        </section>
      </DosColumnas>
      <section className="seccion-resultados">
        <h2>Equipos</h2>
        {!equipos.length ? (
          <p className="aviso-vacio">
            Este jugador no pertenece a ningún equipo.
          </p>
        ) : (
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {equipos.map((e) => (
                  <tr key={e.id}>
                    <td>{e.nombre}</td>
                    <td>
                      {
                        e.integrantes.find((i) => i.jugadorId === jugador.id)
                          ?.rol
                      }
                    </td>
                    <td>{e.activo ? "Activo" : "Inactivo"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="seccion-resultados">
        <h2>Historial y estadísticas</h2>
        <Ficha
          filas={[
            ["Partidas ganadas", ganadas],
            ["Partidas perdidas", resultados.length - ganadas],
            ["Torneos jugados", new Set(partidas.map((p) => p.torneoId)).size],
          ]}
        />
        {!historial.length ? (
          <p className="aviso-vacio">Sin inscripciones registradas.</p>
        ) : (
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Torneo</th>
                  <th>Participación</th>
                  <th>Inscripción</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((i) => (
                  <tr key={i.id}>
                    <td>
                      {db.torneos.find((t) => t.id === i.torneoId)?.nombre}
                    </td>
                    <td>
                      {i.equipoId == null
                        ? jugador.apodo
                        : db.equipos.find((e) => e.id === i.equipoId)?.nombre}
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
      <section className="seccion-resultados">
        <h2>Sanciones</h2>
        {!sanciones.length ? (
          <p className="aviso-vacio">No tiene sanciones registradas.</p>
        ) : (
          sanciones.map((s) => (
            <article key={s.id} className="aviso">
              <strong>{s.motivo}</strong>
              <p>
                {formatearFecha(s.inicio)} — {formatearFecha(s.fin)}
              </p>
              <p>
                {tieneSancionActiva([s], s.tipoParticipante, s.participanteId)
                  ? "Vigente"
                  : "Fuera de vigencia"}
              </p>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
