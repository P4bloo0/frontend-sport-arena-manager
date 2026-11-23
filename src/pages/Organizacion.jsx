import { useEffect, useState } from "react";
import Campo from "../components/Campo.jsx";
import DosColumnas from "../components/DosColumnas.jsx";
import { Estado } from "../components/TarjetaTorneo.jsx";
import { useOperacion } from "../hooks/useOperacion.js";
import { organizacionApi as api } from "../services/organizacionApi.js";
import { equiposApi } from "../services/equiposApi.js";
import { torneosApi } from "../services/torneosApi.js";

import PartidasOrganizacion from "./PartidasOrganizacion.jsx";

const secciones = ["Inscripciones", "Sanciones", "Partidas y resultados"];

export default function Organizacion({ token }) {
  const [seccion, setSeccion] = useState("Inscripciones");
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const op = useOperacion();

  useEffect(() => {
    const control = new AbortController();
    const { signal } = control;
    Promise.all([torneosApi.cargarCatalogo(signal), api.equipos(signal), equiposApi.jugadores(signal)])
      .then(([catalogo, equipos, jugadores]) => {
        if (!signal.aborted) setDatos({ torneos: catalogo.torneos, equipos, jugadores });
      })
      .catch((fallo) => {
        if (!signal.aborted) setError(fallo.message);
      });
    return () => control.abort();
  }, []);

  return (
    <main className="contenedor pagina-detalle">
      <section className="titulo-pagina"><h1>Organización</h1></section>
      {error && <p role="alert">{error}</p>}
      {!datos && !error && <p role="status">Cargando organización.</p>}
      {datos && (
        <>
          <div className="acciones-filtros mb-4" role="group" aria-label="Secciones de organización">
            {secciones.map((nombre) => (
              <button key={nombre} type="button" disabled={op.ocupado}
                aria-pressed={seccion === nombre}
                className={`btn ${seccion === nombre ? "btn-primary" : "btn-outline-light"}`}
                onClick={() => {
                  if (nombre === seccion) return;
                  op.limpiar();
                  setSeccion(nombre);
                }}>{nombre}</button>
            ))}
          </div>
          {op.error && <p className="mensaje-error" role="alert">{op.error}</p>}
          {op.mensaje && <p role="status">{op.mensaje}</p>}
          {seccion === "Inscripciones" && <Inscripciones datos={datos} token={token} op={op} />}
          {seccion === "Sanciones" && <Sanciones datos={datos} token={token} op={op} />}
          {seccion === "Partidas y resultados" && (
            <PartidasOrganizacion datos={datos} token={token} op={op} nombre={participante} />
          )}
        </>
      )}
    </main>
  );
}

function participante(datos, equipoId, usuarioId) {
  const equipo = equipoId == null ? "" :
    datos.equipos.find((e) => e.equipoId === equipoId)?.nombre ?? `Equipo #${equipoId}`;
  const jugador = usuarioId == null ? "" :
    datos.jugadores.find((j) => j.usuarioId === usuarioId)?.nickname ?? `Jugador #${usuarioId}`;
  return [equipo, jugador].filter(Boolean).join(" / ");
}

function fechaVisible(fecha) {
  return fecha?.replace("T", " ").slice(0, 16) ?? "—";
}

function Inscripciones({ datos, token, op }) {
  const [torneoId, setTorneoId] = useState("");
  return (
    <section className="panel-filtros">
      <h2>Inscripciones por torneo</h2>
      <Campo id="org-torneo" etiqueta="Torneo">
        <select className="form-select" id="org-torneo" value={torneoId} disabled={op.ocupado}
          onChange={(e) => { op.limpiar(); setTorneoId(e.target.value); }}>
          <option value="">Selecciona un torneo</option>
          {datos.torneos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
        </select>
      </Campo>
      {torneoId && <InscripcionesTorneo key={torneoId}
        torneoId={torneoId} datos={datos} token={token} op={op} />}
    </section>
  );
}

function InscripcionesTorneo({ torneoId, datos, token, op }) {
  const [lista, setLista] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const control = new AbortController();
    api.inscripciones(torneoId, token, control.signal)
      .then((inscripciones) => {
        if (control.signal.aborted) return;
        setLista(inscripciones);
        setError("");
      })
      .catch((fallo) => {
        if (!control.signal.aborted) setError(fallo.message);
      });
    return () => control.abort();
  }, [torneoId, token]);

  function cambiar(inscripcion, estado, accion) {
    if (estado !== "CONFIRMADA" && !window.confirm(`¿${accion} esta inscripción?`)) return;
    op.ejecutar(async () => {
      const id = inscripcion.inscripcionId;
      const actualizada = estado === "CANCELADA"
        ? await api.cancelarInscripcion(id, token)
        : await api.actualizarInscripcion(id, estado, token);
      setLista((actual) => actual.map((i) => i.inscripcionId === id ? actualizada : i));
    }, "Inscripción actualizada.");
  }

  if (error) return <p role="alert">{error}</p>;
  if (!lista) return <p role="status">Cargando inscripciones.</p>;
  if (!lista.length) return <p>Este torneo todavía no tiene inscripciones.</p>;

  return (
    <div className="table-responsive tabla-scroll">
      <table className="table tabla">
        <thead><tr><th>Participante</th><th>Registro</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          {lista.map((i) => (
            <tr key={i.inscripcionId}>
              <td>{participante(datos, i.equipoId, i.jugadorId)}</td>
              <td>{fechaVisible(i.fechaInscripcion)}</td>
              <td><Estado estado={i.estado} /></td>
              <td>
                <div className="acciones-filtros">
                  {i.estado === "PENDIENTE" && (
                    <>
                      <button className="btn btn-primary btn-sm" type="button" disabled={op.ocupado}
                        onClick={() => cambiar(i, "CONFIRMADA", "Confirmar")}>Confirmar</button>
                      <button className="btn btn-outline-light btn-sm" type="button" disabled={op.ocupado}
                        onClick={() => cambiar(i, "RECHAZADA", "Rechazar")}>Rechazar</button>
                    </>
                  )}
                  {["PENDIENTE", "CONFIRMADA"].includes(i.estado) && (
                    <button className="btn btn-outline-light btn-sm" type="button" disabled={op.ocupado}
                      onClick={() => cambiar(i, "CANCELADA", "Cancelar")}>Cancelar inscripción</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Sanciones({ datos, token, op }) {
  const [lista, setLista] = useState(null);
  const [error, setError] = useState("");
  const [edicion, setEdicion] = useState(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const control = new AbortController();
    api.sanciones(token, control.signal)
      .then((sanciones) => {
        if (control.signal.aborted) return;
        setLista(sanciones);
        setError("");
      })
      .catch((fallo) => {
        if (!control.signal.aborted) setError(fallo.message);
      });
    return () => control.abort();
  }, [token]);

  function guardar(evento) {
    evento.preventDefault();
    const campos = Object.fromEntries(new FormData(evento.currentTarget));
    const usuarioId = edicion ? edicion.usuarioId : Number(campos.usuarioId) || null;
    const equipoId = edicion ? edicion.equipoId : Number(campos.equipoId) || null;

    op.ejecutar(async () => {
      if (usuarioId == null && equipoId == null) throw new Error("Selecciona un jugador, un equipo o ambos.");
      const fechaInicio = edicion?.fechaInicio ?? campos.fechaInicio;
      if (campos.fechaFin <= fechaInicio) throw new Error("El fin debe ser posterior al inicio.");
      const motivo = campos.motivo.trim();
      if (!motivo) throw new Error("Escribe el motivo de la sanción.");

      const guardada = await api.guardarSancion(edicion?.sancionId, {
        usuarioId, equipoId, motivo, fechaInicio, fechaFin: campos.fechaFin, severidad: campos.severidad,
      }, token);
      setLista((actual) => edicion
        ? actual.map((s) => s.sancionId === guardada.sancionId ? guardada : s)
        : [...actual, guardada]);
      setEdicion(null);
      setRevision((actual) => actual + 1);
    }, "Sanción guardada.");
  }

  function cerrar(sancion) {
    if (!window.confirm("¿Cerrar esta sanción?")) return;
    op.ejecutar(async () => {
      const cerrada = await api.cerrarSancion(sancion.sancionId, token);
      setLista((actual) => actual.map((s) => s.sancionId === cerrada.sancionId ? cerrada : s));
      if (edicion?.sancionId === cerrada.sancionId) setEdicion(null);
    }, "Sanción cerrada.");
  }

  if (error) return <p role="alert">{error}</p>;
  if (!lista) return <p role="status">Cargando sanciones.</p>;

  return (
    <DosColumnas>
      <section className="panel-filtros">
        <h2>Sanciones registradas</h2>
        {!lista.length && <p>Todavía no hay sanciones registradas.</p>}
        <ul className="list-group">
          {lista.map((s) => (
            <li key={s.sancionId} className="list-group-item bg-transparent text-light border-secondary">
              <strong>{participante(datos, s.equipoId, s.usuarioId)}</strong>
              <p className="mb-1">{s.motivo}</p>
              <p className="mb-1">{fechaVisible(s.fechaInicio)} a {fechaVisible(s.fechaFin)}</p>
              <p className="mb-2">{s.severidad} · <Estado estado={s.estado} /></p>
              {s.estado !== "CERRADA" && (
                <div className="acciones-filtros">
                  <button className="btn btn-outline-light" type="button" disabled={op.ocupado}
                    onClick={() => { op.limpiar(); setEdicion(s); }}>Editar</button>
                  <button className="btn btn-outline-light" type="button" disabled={op.ocupado}
                    onClick={() => cerrar(s)}>Cerrar sanción</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section className="panel-filtros">
        <h2>{edicion ? "Editar sanción" : "Aplicar sanción"}</h2>
        <form className="formulario" key={edicion?.sancionId ?? `nueva-${revision}`} onSubmit={guardar}>
          {edicion ? (
            <>
              <p>Destinatario: {participante(datos, edicion.equipoId, edicion.usuarioId)}</p>
              <p>Inicio: {fechaVisible(edicion.fechaInicio)}</p>
            </>
          ) : (
            <>
              <Campo id="org-jugador" etiqueta="Jugador">
                <select id="org-jugador" name="usuarioId" className="form-select">
                  <option value="">Selecciona un jugador</option>
                  {datos.jugadores.map((j) => (
                    <option key={j.usuarioId} value={j.usuarioId}>{j.nickname ?? j.nombre}</option>
                  ))}
                </select>
              </Campo>
              <Campo id="org-equipo" etiqueta="Equipo">
                <select id="org-equipo" name="equipoId" className="form-select">
                  <option value="">Selecciona un equipo</option>
                  {datos.equipos.map((e) => <option key={e.equipoId} value={e.equipoId}>{e.nombre}</option>)}
                </select>
              </Campo>
              <Campo id="org-inicio" etiqueta="Inicio de la sanción (hora de Santiago)">
                <input id="org-inicio" name="fechaInicio" className="form-control" type="datetime-local" step={1} required />
              </Campo>
            </>
          )}
          <Campo id="org-fin" etiqueta="Fin de la sanción (hora de Santiago)">
            <input id="org-fin" name="fechaFin" className="form-control" type="datetime-local" step={1}
              defaultValue={edicion?.fechaFin} required />
          </Campo>
          <Campo id="org-severidad" etiqueta="Severidad">
            <select id="org-severidad" name="severidad" className="form-select"
              defaultValue={edicion?.severidad ?? "MEDIA"}>
              <option value="BAJA">Baja</option><option value="MEDIA">Media</option><option value="ALTA">Alta</option>
            </select>
          </Campo>
          <Campo id="org-motivo" etiqueta="Motivo">
            <textarea id="org-motivo" name="motivo" className="form-control" defaultValue={edicion?.motivo} required />
          </Campo>
          <button className="btn btn-primary" disabled={op.ocupado}>Guardar sanción</button>
          {edicion && <button className="btn btn-outline-light" type="button" disabled={op.ocupado}
            onClick={() => { op.limpiar(); setEdicion(null); }}>Cancelar edición</button>}
        </form>
      </section>
    </DosColumnas>
  );
}
