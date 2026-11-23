import { useEffect, useState } from "react";
import Campo from "../components/Campo.jsx";
import DosColumnas from "../components/DosColumnas.jsx";
import { equiposApi } from "../services/equiposApi.js";

const puedeGestionar = (equipo, sesion) =>
  equipo.capitanId === sesion.userId || sesion.roles.includes("ADMINISTRADOR");

export default function Equipo({ sesion }) {
  const [datos, setDatos] = useState(null);
  const [equipoId, setEquipoId] = useState(null);
  const [error, setError] = useState("");
  const { token, userId, nickname } = sesion;

  useEffect(() => {
    const control = new AbortController();
    Promise.all([
      equiposApi.listarMios(token, control.signal),
      equiposApi.juegos(control.signal),
      equiposApi.jugadores(control.signal),
    ]).then(([equipos, juegos, jugadores]) => {
      if (control.signal.aborted) return;
      setDatos({ equipos, juegos, jugadores });
      setError("");
    }).catch((fallo) => {
      if (!control.signal.aborted) setError(fallo.message);
    });

    return () => control.abort();
  }, [token]);

  function actualizarEquipo(equipo) {
    setDatos((actual) => {
      const restantes = actual.equipos.filter((e) => e.equipoId !== equipo.equipoId);
      return { ...actual, equipos: [...restantes, equipo] };
    });
  }

  const equipo = datos?.equipos.find((e) => e.equipoId === equipoId);
  const nombreJugador = (id) => {
    const jugador = datos.jugadores.find((j) => j.usuarioId === id);
    return jugador?.nickname || jugador?.nombre || (id === userId ? nickname : `Usuario #${id}`);
  };

  return (
    <main className="contenedor pagina-detalle">
      <section className="titulo-pagina">
        <h1>Gestión de equipo</h1>
        <p>Crea un equipo y administra su plantilla.</p>
      </section>
      {error && <p className="alert alert-warning" role="alert">{error}</p>}
      {!datos && !error && <p role="status">Cargando tus equipos.</p>}
      {datos && (
        <DosColumnas>
          <section className="panel-filtros">
            <h2>Crear equipo</h2>
            <p>Capitán: <strong>{nickname}</strong></p>
            {userId ? (
              <FichaEquipo juegos={datos.juegos} capitanId={userId}
                guardar={(campos) => equiposApi.crear(campos, token)}
                alGuardar={(nuevo) => {
                  actualizarEquipo(nuevo);
                  setEquipoId(nuevo.equipoId);
                }} />
            ) : (
              <p role="alert">Tu cuenta debe estar vinculada a un perfil para crear un equipo.</p>
            )}
          </section>
          <section className="panel-filtros">
            <h2>Mis equipos</h2>
            {datos.equipos.length === 0 ? (
              <p>Todavía no perteneces a un equipo.</p>
            ) : (
              <Campo id="eq-seleccion" etiqueta="Equipo">
                <select className="form-select" id="eq-seleccion"
                  value={equipo?.equipoId ?? ""}
                  onChange={(e) => setEquipoId(Number(e.target.value))}>
                  <option value="" disabled>Selecciona un equipo</option>
                  {datos.equipos.map((e) => (
                    <option key={e.equipoId} value={e.equipoId}>{e.nombre}</option>
                  ))}
                </select>
              </Campo>
            )}
            {equipo && (
              <Plantilla key={equipo.equipoId} equipo={equipo} sesion={sesion}
                juegos={datos.juegos} jugadores={datos.jugadores}
                nombreJugador={nombreJugador} alGuardar={actualizarEquipo} />
            )}
          </section>
        </DosColumnas>
      )}
    </main>
  );
}

function FichaEquipo({ equipo, juegos, capitanId, capitanes = [], guardar, alGuardar, bloqueado }) {
  const [nombre, setNombre] = useState(equipo?.nombre ?? "");
  const [juegoId, setJuegoId] = useState(equipo?.juegoPrincipalId ?? "");
  const [capitan, setCapitan] = useState(capitanId);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const capitanSeleccionado = equipo && !capitanes.some(({ id }) => id === Number(capitan))
    ? capitanId
    : capitan;

  async function enviar(evento) {
    evento.preventDefault();
    if (guardando || bloqueado) return;

    setGuardando(true);
    setError(null);
    setMensaje("");
    try {
      const actualizado = await guardar({
        nombre: nombre.trim(), juegoPrincipalId: Number(juegoId), capitanId: Number(capitanSeleccionado),
      });
      alGuardar(actualizado);
      if (!equipo) {
        setNombre("");
        setJuegoId("");
      }
      setMensaje(equipo ? "Equipo actualizado." : "Equipo creado.");
    } catch (fallo) {
      setError(fallo);
    } finally {
      setGuardando(false);
    }
  }

  const prefijo = equipo ? "eq-editar" : "eq-crear";
  return (
    <form className="formulario" onSubmit={enviar}>
      <Campo id={prefijo + "-nombre"} etiqueta="Nombre del equipo" error={error?.campos?.nombre}>
        <input className="form-control" id={prefijo + "-nombre"} required maxLength={40}
          value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </Campo>
      <Campo id={prefijo + "-juego"} etiqueta="Juego principal" error={error?.campos?.juegoPrincipalId}>
        <select className="form-select" id={prefijo + "-juego"} required
          value={juegoId} onChange={(e) => setJuegoId(e.target.value)}>
          <option value="">Selecciona un juego</option>
          {juegos.filter((j) => j.estado || j.juegoId === equipo?.juegoPrincipalId).map((j) => (
            <option key={j.juegoId} value={j.juegoId}>{j.nombre}</option>
          ))}
        </select>
      </Campo>
      {equipo && (
        <Campo id="eq-editar-capitan" etiqueta="Capitán" error={error?.campos?.capitanId}>
          <select className="form-select" id="eq-editar-capitan" value={capitanSeleccionado}
            onChange={(e) => setCapitan(e.target.value)}>
            {capitanes.map(({ id, texto }) => <option key={id} value={id}>{texto}</option>)}
          </select>
        </Campo>
      )}
      {error && <p className="mensaje-error" role="alert">{error.message}</p>}
      {mensaje && <p role="status">{mensaje}</p>}
      <button className="btn btn-primary boton boton-primario"
        disabled={guardando || bloqueado || !nombre.trim() || !juegoId}>
        {guardando ? "Guardando…" : equipo ? "Guardar equipo" : "Crear equipo"}
      </button>
    </form>
  );
}

function Plantilla({ equipo, sesion, juegos, jugadores, nombreJugador, alGuardar }) {
  const [integrantes, setIntegrantes] = useState(null);
  const [jugadorId, setJugadorId] = useState("");
  const [rol, setRol] = useState("TITULAR");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const { equipoId, capitanId } = equipo;
  const { token } = sesion;
  const puedeEditar = puedeGestionar(equipo, sesion);

  useEffect(() => {
    const control = new AbortController();
    equiposApi.integrantes(equipoId, control.signal).then((miembros) => {
      if (control.signal.aborted) return;
      setIntegrantes(miembros);
      setError("");
    }).catch((fallo) => {
      if (!control.signal.aborted) setError(fallo.message);
    });
    return () => control.abort();
  }, [equipoId, capitanId]);

  async function guardarEquipo(campos) {
    setOcupado(true);
    try {
      return await equiposApi.editar(equipoId, campos, token);
    } finally {
      setOcupado(false);
    }
  }

  async function modificar(accion) {
    if (ocupado || !puedeEditar) return;
    setOcupado(true);
    setError("");
    try {
      await accion();
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setOcupado(false);
    }
  }

  function agregar(evento) {
    evento.preventDefault();
    if (!jugadorId || !equipo.estado) return;
    modificar(async () => {
      const nuevo = await equiposApi.agregar({
        equipoId, usuarioId: Number(jugadorId), rolDentroEquipo: rol,
      }, token);
      setIntegrantes((actuales) => [...actuales, nuevo]);
      setJugadorId("");
    });
  }

  function quitar(usuarioId) {
    if (usuarioId === capitanId) return;
    modificar(async () => {
      await equiposApi.quitar(equipoId, usuarioId, token);
      setIntegrantes((actuales) => actuales.filter((m) => m.usuarioId !== usuarioId));
    });
  }

  const candidatos = jugadores.filter((j) =>
    j.usuarioId !== capitanId && !integrantes?.some((m) => m.usuarioId === j.usuarioId));
  const capitanes = [...new Set([capitanId, ...(integrantes ?? []).map((m) => m.usuarioId)])]
    .map((id) => ({ id, texto: nombreJugador(id) }));

  return (
    <>
      <h3>{equipo.nombre}</h3>
      <p>{juegos.find((j) => j.juegoId === equipo.juegoPrincipalId)?.nombre ?? `Juego #${equipo.juegoPrincipalId}`}</p>
      <p>{equipo.estado ? "Activo" : "Inactivo"} · Capitán: {nombreJugador(capitanId)}</p>
      {error && <p className="mensaje-error" role="alert">{error}</p>}
      {!integrantes && !error && <p role="status">Cargando integrantes.</p>}
      {integrantes && (
        <>
          <div className="table-responsive tabla-scroll">
            <table className="table tabla">
              <caption className="visually-hidden">Integrantes de {equipo.nombre}</caption>
              <thead><tr><th>Jugador</th><th>Rol</th>{puedeEditar && <th>Acción</th>}</tr></thead>
              <tbody>
                {integrantes.map((m) => (
                  <tr key={m.usuarioId}>
                    <td>{nombreJugador(m.usuarioId)}</td>
                    <td>{m.usuarioId === capitanId ? "Capitán" : m.rolDentroEquipo}</td>
                    {puedeEditar && (
                      <td>{m.usuarioId !== capitanId && (
                        <button className="btn btn-outline-light" type="button" disabled={ocupado}
                          aria-label={`Quitar a ${nombreJugador(m.usuarioId)}`}
                          onClick={() => quitar(m.usuarioId)}>Quitar</button>
                      )}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {puedeEditar && equipo.estado && (
            <form className="formulario" onSubmit={agregar}>
              <Campo id="int-jugador" etiqueta="Jugador">
                <select className="form-select" id="int-jugador" value={jugadorId}
                  onChange={(e) => setJugadorId(e.target.value)}>
                  <option value="">Selecciona un jugador</option>
                  {candidatos.map((j) => (
                    <option key={j.usuarioId} value={j.usuarioId}>{nombreJugador(j.usuarioId)}</option>
                  ))}
                </select>
              </Campo>
              <Campo id="int-rol" etiqueta="Rol en el equipo">
                <select className="form-select" id="int-rol" value={rol} onChange={(e) => setRol(e.target.value)}>
                  <option value="TITULAR">Titular</option>
                  <option value="SUPLENTE">Suplente</option>
                </select>
              </Campo>
              <button className="btn btn-secondary" disabled={ocupado || !jugadorId}>Agregar integrante</button>
            </form>
          )}
          {puedeEditar && (
            <>
              <h4>Editar equipo</h4>
              <FichaEquipo key={capitanId} equipo={equipo} juegos={juegos} capitanId={capitanId}
                capitanes={capitanes} bloqueado={ocupado}
                guardar={guardarEquipo} alGuardar={alGuardar} />
            </>
          )}
        </>
      )}
    </>
  );
}
