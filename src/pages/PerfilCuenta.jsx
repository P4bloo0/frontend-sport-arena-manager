import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Fecha, Ficha } from "../components/Tablas.jsx";
import { perfilApi } from "../services/perfilApi.js";
import { sancionesApi } from "../services/sancionesApi.js";
import { ahoraSantiago } from "../utils/logica.js";

const estadosInscripcion = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  RECHAZADA: "Rechazada",
  CANCELADA: "Cancelada",
};

function ActividadCompetitiva({ datos, usuarioId }) {
  const { equipos, historial, ranking } = datos;
  return (
    <>
      <section className="seccion-resultados" aria-labelledby="perfil-equipos">
        <h2 id="perfil-equipos">Mis equipos</h2>
        {equipos.length ? (
          <ul className="list-group">
            {equipos.map((equipo) => (
              <li key={equipo.equipoId} className="list-group-item">
                <strong>{equipo.nombre}</strong>
                <span className="ms-2">
                  {equipo.capitanId === usuarioId ? "Capitán" : "Integrante"} · {equipo.estado ? "Activo" : "Inactivo"}
                </span>
              </li>
            ))}
          </ul>
        ) : <p>Todavía no perteneces a un equipo.</p>}
      </section>

      <section className="seccion-resultados" aria-labelledby="perfil-historial">
        <h2 id="perfil-historial">Historial y estadísticas</h2>
        {ranking ? (
          <>
            <p>Resultados individuales y de tus equipos actuales.</p>
            <Ficha filas={[
              ["Partidas ganadas", ranking.ganadas],
              ["Partidas perdidas", ranking.perdidas],
              ["Torneos jugados", ranking.torneosJugados],
            ]} />
          </>
        ) : <p role="alert">No se pudieron cargar las estadísticas.</p>}
        {historial.length ? (
          <div className="table-responsive tabla-scroll">
            <table className="table tabla">
              <thead><tr><th>Torneo</th><th>Participación</th><th>Estado</th><th>Fecha</th></tr></thead>
              <tbody>
                {historial.map((inscripcion) => (
                  <tr key={inscripcion.inscripcionId}>
                    <td><Link to={`/detalle-torneo.html?id=${inscripcion.torneoId}`}>{inscripcion.torneo}</Link></td>
                    <td>{inscripcion.participante}</td>
                    <td>{estadosInscripcion[inscripcion.estado] ?? inscripcion.estado}</td>
                    <td><Fecha valor={inscripcion.fechaInscripcion} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p>Sin inscripciones registradas.</p>}
      </section>
    </>
  );
}

function estadoSancion(sancion, ahora) {
  if (sancion.estado === "CERRADA") return "Cerrada";
  if (ahora < sancion.fechaInicio) return "Programada";
  if (ahora > sancion.fechaFin) return "Cumplida";
  return "Vigente";
}

export default function PerfilCuenta({ token }) {
  const [estado, setEstado] = useState({ cuenta: null, error: null });
  const [bandeja, setBandeja] = useState({ mensajes: null, error: "" });
  const [actividad, setActividad] = useState({ datos: null, error: "" });
  const [sanciones, setSanciones] = useState({ lista: null, error: "" });
  const usuarioId = estado.cuenta?.usuarioId;

  useEffect(() => {
    const control = new AbortController();

    perfilApi.consultar(token, control.signal)
      .then((cuenta) => {
        if (!cuenta?.usuarioId) throw new Error("El servidor no devolvió los datos de tu cuenta.");
        if (!control.signal.aborted) setEstado({ cuenta, error: null });
      })
      .catch((error) => {
        if (!control.signal.aborted) setEstado({ cuenta: null, error });
      });

    perfilApi.notificaciones(token, control.signal)
      .then((mensajes) => {
        if (control.signal.aborted) return;
        const visibles = mensajes.filter((aviso) => aviso.estado !== "ARCHIVADA");
        visibles.sort((a, b) => b.fecha.localeCompare(a.fecha));
        setBandeja({ mensajes: visibles, error: "" });
      })
      .catch((error) => {
        if (!control.signal.aborted) setBandeja({ mensajes: null, error: error.message });
      });

    return () => control.abort();
  }, [token]);

  useEffect(() => {
    if (!usuarioId) return;
    const control = new AbortController();
    const { signal } = control;

    perfilApi.competitivo(usuarioId, token, signal)
      .then((datos) => {
        if (!signal.aborted) setActividad({ datos, error: "" });
      })
      .catch((error) => {
        if (!signal.aborted) setActividad({ datos: null, error: error.message });
      });
    sancionesApi.delUsuario(usuarioId, token, signal)
      .then((lista) => {
        if (signal.aborted) return;
        const ordenadas = [...lista].sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio));
        setSanciones({ lista: ordenadas, error: "" });
      })
      .catch((error) => {
        if (!signal.aborted) setSanciones({ lista: null, error: error.message });
      });

    return () => control.abort();
  }, [usuarioId, token]);

  const { cuenta, error } = estado;
  const ahora = ahoraSantiago();
  return (
    <main className="contenedor seccion">
      <h1>Mi perfil</h1>
      {error && (
        <div className="alert alert-warning" role="alert">
          <p>{error.message}</p>
          {error.estado === 401 && <Link to="/acceso.html">Ir a Acceso</Link>}
        </div>
      )}
      {!cuenta && !error && <p role="status">Cargando los datos de tu cuenta.</p>}
      {cuenta && (
        <Ficha filas={[
          ["Nombre", cuenta.nombre],
          ["Apodo", cuenta.nickname],
          ["Correo", cuenta.email],
          ["Rol", cuenta.rol],
          ["Estado", cuenta.estado],
        ]} />
      )}
      {cuenta && !actividad.datos && !actividad.error && <p role="status">Cargando tu actividad competitiva.</p>}
      {actividad.error && <p role="alert">{actividad.error}</p>}
      {actividad.datos && <ActividadCompetitiva datos={actividad.datos} usuarioId={usuarioId} />}
      {cuenta && (
        <section className="seccion-resultados" aria-labelledby="perfil-sanciones">
          <h2 id="perfil-sanciones">Mis sanciones</h2>
          {sanciones.error && <p role="alert">{sanciones.error}</p>}
          {!sanciones.lista && !sanciones.error && <p role="status">Cargando sanciones.</p>}
          {sanciones.lista?.length === 0 && <p>No tienes sanciones registradas.</p>}
          {sanciones.lista?.length > 0 && (
            <ul className="list-group">
              {sanciones.lista.map((sancion) => (
                <li key={sancion.sancionId} className="list-group-item">
                  <strong>{sancion.motivo}</strong>
                  <p className="mb-0">
                    {estadoSancion(sancion, ahora)} · <Fecha valor={sancion.fechaInicio} /> a <Fecha valor={sancion.fechaFin} />
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
      <section className="seccion-resultados" aria-labelledby="perfil-notificaciones">
        <h2 id="perfil-notificaciones">Notificaciones</h2>
        {bandeja.error && <p role="alert">{bandeja.error}</p>}
        {!bandeja.mensajes && !bandeja.error && <p role="status">Cargando notificaciones.</p>}
        {bandeja.mensajes?.length === 0 && <p>No tienes notificaciones.</p>}
        {bandeja.mensajes?.length > 0 && (
          <ul className="list-group">
            {bandeja.mensajes.map(({ notificacionId, mensaje, fecha }) => (
              <li key={notificacionId} className="list-group-item">
                <p className="mb-1">{mensaje}</p>
                <time dateTime={fecha}>{fecha.replace("T", " ").slice(0, 16)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
