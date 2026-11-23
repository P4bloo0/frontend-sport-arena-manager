import { useEffect, useState } from "react";
import { useOperacion } from "../hooks/useOperacion.js";
import Campo from "../components/Campo.jsx";
import DosColumnas from "../components/DosColumnas.jsx";
import { administracionApi as api } from "../services/administracionApi.js";

const secciones = ["Juegos", "Torneos", "Premios"];
const transiciones = {
  BORRADOR: { estado: "ABIERTO", texto: "Abrir inscripciones" },
  ABIERTO: { estado: "EN_CURSO", texto: "Iniciar torneo" },
  EN_CURSO: { estado: "FINALIZADO", texto: "Finalizar torneo" },
};
const configurable = (torneo) => ["BORRADOR", "ABIERTO"].includes(torneo.estado);

export default function Administracion({ token }) {
  const [seccion, setSeccion] = useState("Juegos");
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const op = useOperacion();

  useEffect(() => {
    const control = new AbortController();
    Promise.all([api.juegos(control.signal), api.torneos(control.signal)])
      .then(([juegos, torneos]) => {
        if (!control.signal.aborted) setDatos({ juegos, torneos });
      })
      .catch((fallo) => {
        if (!control.signal.aborted) setError(fallo.message);
      });
    return () => control.abort();
  }, []);

  const cambiar = (campo) => (actualizar) => setDatos((prev) => ({
    ...prev, [campo]: actualizar(prev[campo]),
  }));

  return (
    <main className="contenedor pagina-detalle">
      <section className="titulo-pagina"><h1>Administración</h1></section>
      {error && <p role="alert">{error}</p>}
      {!datos && !error && <p role="status">Cargando administración.</p>}
      {datos && (
        <>
          <div className="acciones-filtros mb-4" role="group" aria-label="Secciones de administración">
            {secciones.map((nombre) => (
              <button key={nombre} type="button"
                className={`btn ${seccion === nombre ? "btn-primary" : "btn-outline-light"}`}
                aria-pressed={seccion === nombre} disabled={op.ocupado} onClick={() => {
                  if (seccion === nombre) return;
                  op.limpiar();
                  setSeccion(nombre);
                }}>{nombre}</button>
            ))}
          </div>
          {seccion === "Juegos" && <Juegos juegos={datos.juegos} cambiar={cambiar("juegos")} token={token} op={op} />}
          {seccion === "Torneos" && <Torneos torneos={datos.torneos} juegos={datos.juegos}
            cambiar={cambiar("torneos")} token={token} op={op} />}
          {seccion === "Premios" && <Premios torneos={datos.torneos} token={token} op={op} />}
        </>
      )}
    </main>
  );
}

function Avisos({ operacion }) {
  return (
    <>
      {operacion.error && <p className="mensaje-error" role="alert">{operacion.error}</p>}
      {operacion.mensaje && <p role="status">{operacion.mensaje}</p>}
    </>
  );
}

function Entrada({ nombre, etiqueta, valor, tipo = "text", ...atributos }) {
  return (
    <Campo id={`admin-${nombre}`} etiqueta={etiqueta}>
      <input className="form-control" id={`admin-${nombre}`} name={nombre}
        type={tipo} defaultValue={valor ?? ""} required {...atributos} />
    </Campo>
  );
}

function actualizarPor(lista, campo, elemento) {
  return lista.some((actual) => actual[campo] === elemento[campo])
    ? lista.map((actual) => actual[campo] === elemento[campo] ? elemento : actual)
    : [...lista, elemento];
}

function Juegos({ juegos, cambiar, token, op }) {
  const [seleccion, setSeleccion] = useState(null);
  const juego = juegos.find((j) => j.juegoId === seleccion);

  function guardar(evento) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    op.ejecutar(async () => {
      const nuevo = await api.guardarJuego(juego?.juegoId, {
        nombre: String(datos.get("nombre")).trim(),
        genero: String(datos.get("genero")).trim(),
        modalidad: String(datos.get("modalidad")).trim(),
        jugadoresPorEquipo: Number(datos.get("jugadoresPorEquipo")),
      }, token);
      cambiar((lista) => actualizarPor(lista, "juegoId", nuevo));
      setSeleccion(nuevo.juegoId);
    }, "Juego guardado.");
  }

  return (
    <DosColumnas>
      <section className="panel-filtros">
        <h2>Juegos registrados</h2>
        {!juegos.length && <p>Todavía no hay juegos.</p>}
        <ul className="list-group">
          {juegos.map((j) => (
            <li key={j.juegoId} className="list-group-item bg-transparent text-light border-secondary">
              <button className="btn btn-outline-light" type="button" disabled={op.ocupado}
                onClick={() => setSeleccion(j.juegoId)}>{j.nombre}</button>
              <span className="ms-2">{j.estado ? "Activo" : "Inactivo"}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="panel-filtros">
        <h2>{juego ? "Editar juego" : "Crear juego"}</h2>
        {juego && <button className="btn btn-outline-light mb-3" type="button" disabled={op.ocupado}
          onClick={() => setSeleccion(null)}>Nuevo juego</button>}
        <form key={juego?.juegoId ?? "nuevo"} className="formulario" onSubmit={guardar}>
          <Entrada nombre="nombre" etiqueta="Nombre" valor={juego?.nombre} readOnly={Boolean(juego)} />
          <Entrada nombre="genero" etiqueta="Género" valor={juego?.genero} />
          <Entrada nombre="modalidad" etiqueta="Modalidad" valor={juego?.modalidad} />
          <Entrada nombre="jugadoresPorEquipo" etiqueta="Jugadores por equipo" tipo="number"
            min={1} valor={juego?.jugadoresPorEquipo} />
          <button className="btn btn-primary" disabled={op.ocupado}>Guardar juego</button>
        </form>
        {juego?.estado && (
          <button className="btn btn-outline-light mt-3" type="button" disabled={op.ocupado}
            onClick={() => {
              if (!window.confirm(`¿Desactivar ${juego.nombre}?`)) return;
              op.ejecutar(async () => {
                const nuevo = await api.desactivarJuego(juego.juegoId, token);
                cambiar((lista) => actualizarPor(lista, "juegoId", nuevo));
              }, "Juego desactivado.");
            }}>Desactivar juego</button>
        )}
        <Avisos operacion={op} />
      </section>
    </DosColumnas>
  );
}

function SelectorTorneo({ torneos, id, seleccionar, ocupado }) {
  return (
    <Campo id="admin-torneo" etiqueta="Torneo">
      <select id="admin-torneo" className="form-select" value={id ?? ""}
        onChange={(e) => seleccionar(e.target.value ? Number(e.target.value) : null)} disabled={ocupado}>
        <option value="">Selecciona un torneo</option>
        {torneos.map((t) => (
          <option key={t.torneoId} value={t.torneoId}>{t.nombre}</option>
        ))}
      </select>
    </Campo>
  );
}

function Torneos({ torneos, juegos, cambiar, token, op }) {
  const [seleccion, setSeleccion] = useState(null);
  const torneo = torneos.find((t) => t.torneoId === seleccion);
  const siguiente = transiciones[torneo?.estado];
  const modalidadFija = torneo?.estado === "ABIERTO";
  const activos = juegos.filter((j) => j.estado);

  function guardar(evento) {
    evento.preventDefault();
    const datos = Object.fromEntries(new FormData(evento.currentTarget));
    op.ejecutar(async () => {
      if (!(datos.fechaCierreInscripcion < datos.fechaInicio && datos.fechaInicio < datos.fechaFin)) {
        throw new Error("El cierre debe ser anterior al inicio y el inicio anterior al fin.");
      }
      const nuevo = await api.guardarTorneo(torneo?.torneoId, {
        ...datos,
        nombre: datos.nombre.trim(),
        modalidad: modalidadFija ? torneo.modalidad : datos.modalidad.trim(),
        juegoId: torneo?.juegoId ?? Number(datos.juegoId),
        cupoMaximo: Number(datos.cupoMaximo),
      }, token);
      cambiar((lista) => actualizarPor(lista, "torneoId", nuevo));
      setSeleccion(nuevo.torneoId);
    }, "Torneo guardado.");
  }

  function avanzar() {
    if (siguiente.estado === "FINALIZADO" && !window.confirm(`¿Finalizar ${torneo.nombre}?`)) return;
    op.ejecutar(async () => {
      const nuevo = await api.cambiarEstado(torneo.torneoId, siguiente.estado, token);
      cambiar((lista) => actualizarPor(lista, "torneoId", nuevo));
    }, "Estado actualizado.");
  }

  function eliminar() {
    if (!window.confirm(`¿Eliminar el borrador ${torneo.nombre}?`)) return;
    op.ejecutar(async () => {
      await api.eliminarTorneo(torneo.torneoId, token);
      cambiar((lista) => lista.filter((t) => t.torneoId !== torneo.torneoId));
      setSeleccion(null);
    }, "Borrador eliminado.");
  }

  return (
    <DosColumnas>
      <section className="panel-filtros">
        <h2>Torneos registrados</h2>
        <SelectorTorneo torneos={torneos} id={seleccion} seleccionar={setSeleccion} ocupado={op.ocupado} />
        {torneo && (
          <>
            <p>Estado: {torneo.estado.replaceAll("_", " ")}</p>
            <div className="acciones-filtros">
              {siguiente && <button type="button" className="btn btn-primary"
                disabled={op.ocupado} onClick={avanzar}>{siguiente.texto}</button>}
              {torneo.estado === "BORRADOR" && <button type="button" className="btn btn-outline-light"
                disabled={op.ocupado} onClick={eliminar}>Eliminar borrador</button>}
              <button type="button" className="btn btn-outline-light" disabled={op.ocupado}
                onClick={() => setSeleccion(null)}>Nuevo torneo</button>
            </div>
          </>
        )}
        <Avisos operacion={op} />
      </section>
      <section className="panel-filtros">
        <h2>{torneo ? "Editar torneo" : "Crear torneo"}</h2>
        {!torneo && !activos.length && <p>Registra un juego activo antes de crear un torneo.</p>}
        {torneo && !configurable(torneo) ? (
          <p>Los datos se pueden editar en borrador o mientras las inscripciones estén abiertas.</p>
        ) : (
          <form key={torneo?.torneoId ?? "nuevo"} className="formulario" onSubmit={guardar}>
            <Entrada nombre="nombre" etiqueta="Nombre" valor={torneo?.nombre} />
            <Campo id="admin-juegoId" etiqueta="Juego">
              <select className="form-select" id="admin-juegoId" name="juegoId" required
                disabled={Boolean(torneo)} defaultValue={torneo?.juegoId ?? ""}>
                <option value="">Selecciona un juego</option>
                {(torneo ? juegos : activos).map((j) => (
                  <option key={j.juegoId} value={j.juegoId}>{j.nombre}</option>
                ))}
              </select>
            </Campo>
            <Entrada nombre="modalidad" etiqueta="Modalidad" valor={torneo?.modalidad}
              placeholder="Ej. Individual o 5 vs 5" disabled={modalidadFija}
              aria-describedby={modalidadFija ? "admin-modalidad-fija" : undefined} />
            {modalidadFija && (
              <p id="admin-modalidad-fija">La modalidad queda fija al abrir las inscripciones.</p>
            )}
            <Entrada nombre="cupoMaximo" etiqueta="Cupo máximo" tipo="number" min={2} valor={torneo?.cupoMaximo} />
            <p>Fechas y horas de Santiago de Chile.</p>
            <Entrada nombre="fechaCierreInscripcion" etiqueta="Cierre de inscripción" tipo="datetime-local"
              step={1} valor={torneo?.fechaCierreInscripcion} />
            <Entrada nombre="fechaInicio" etiqueta="Inicio del torneo" tipo="datetime-local"
              step={1} valor={torneo?.fechaInicio} />
            <Entrada nombre="fechaFin" etiqueta="Fin del torneo" tipo="datetime-local"
              step={1} valor={torneo?.fechaFin} />
            <button className="btn btn-primary" disabled={op.ocupado || (!torneo && !activos.length)}>Guardar torneo</button>
          </form>
        )}
      </section>
    </DosColumnas>
  );
}

function Premios({ torneos, token, op }) {
  const [seleccion, setSeleccion] = useState(null);
  const torneo = torneos.find((t) => t.torneoId === seleccion);
  return (
    <section className="panel-filtros">
      <h2>Premios por posición</h2>
      <SelectorTorneo torneos={torneos} id={seleccion} seleccionar={setSeleccion} ocupado={op.ocupado} />
      {torneo && <PremiosTorneo key={torneo.torneoId} torneo={torneo} token={token} op={op} />}
    </section>
  );
}

function PremiosTorneo({ torneo, token, op }) {
  const [premios, setPremios] = useState(null);
  const [errorCarga, setErrorCarga] = useState("");
  const [edicion, setEdicion] = useState(null);
  const { torneoId } = torneo;

  useEffect(() => {
    const control = new AbortController();
    api.premios(torneoId, token, control.signal)
      .then((lista) => {
        if (!control.signal.aborted) {
          setPremios(lista);
          setErrorCarga("");
        }
      })
      .catch((fallo) => {
        if (!control.signal.aborted) setErrorCarga(fallo.message);
      });
    return () => control.abort();
  }, [torneoId, token]);

  function guardar(evento) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const datos = new FormData(formulario);
    op.ejecutar(async () => {
      const premio = await api.guardarPremio(torneoId, {
        posicion: Number(datos.get("posicion")),
        descripcion: String(datos.get("descripcion")).trim(),
      }, token);
      setPremios((lista) => actualizarPor(lista, "posicion", premio).sort((a, b) => a.posicion - b.posicion));
      formulario.reset();
      setEdicion(null);
    }, "Premio guardado.");
  }

  if (errorCarga) return <p role="alert">{errorCarga}</p>;
  if (!premios) return <p role="status">Cargando premios.</p>;
  const editable = configurable(torneo);

  return (
    <>
      {!editable && <p>Los premios se configuran antes de iniciar el torneo.</p>}
      {!premios.length && <p>Todavía no hay premios configurados.</p>}
      <ul className="list-group mb-3">
        {premios.map((p) => (
          <li className="list-group-item bg-transparent text-light border-secondary" key={p.posicion}>
            <strong>{p.posicion}.º lugar</strong> · {p.descripcion}
            {editable && (
              <div className="acciones-filtros">
                <button className="btn btn-outline-light" type="button" disabled={op.ocupado}
                  onClick={() => setEdicion(p)}>Editar premio</button>
                <button className="btn btn-outline-light" type="button" disabled={op.ocupado}
                  onClick={() => {
                    if (!window.confirm(`¿Quitar el premio del puesto ${p.posicion}?`)) return;
                    op.ejecutar(async () => {
                      await api.quitarPremio(torneoId, p.posicion, token);
                      setPremios((lista) => lista.filter((premio) => premio.posicion !== p.posicion));
                      if (edicion?.posicion === p.posicion) setEdicion(null);
                    }, "Premio eliminado.");
                  }}>Quitar premio</button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {editable && (
        <form key={edicion?.posicion ?? "nuevo"} className="formulario" onSubmit={guardar}>
          <Entrada nombre="posicion" etiqueta="Posición" tipo="number" min={1}
            valor={edicion?.posicion} readOnly={Boolean(edicion)} />
          <Entrada nombre="descripcion" etiqueta="Descripción del premio" valor={edicion?.descripcion} maxLength={500} />
          <button className="btn btn-primary" disabled={op.ocupado}>Guardar premio</button>
          {edicion && <button className="btn btn-outline-light" type="button" disabled={op.ocupado}
            onClick={() => setEdicion(null)}>Cancelar edición</button>}
        </form>
      )}
      <Avisos operacion={op} />
    </>
  );
}
