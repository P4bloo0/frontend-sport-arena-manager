import DosColumnas from "../components/DosColumnas.jsx";
// tu amigo dejó esta pantalla pendiente, aquí pasamos tus dos formularios a react
import { useState } from "react";
import Campo from "../components/Campo.jsx";
import { arenaService } from "../services/arenaService.js";
const vacio = {
  nombre: "",
  juego: "",
  capitanId: "",
  clave: "",
  clave2: "",
  integrantes: [],
  activo: true,
};
export default function Equipo({ db, perfil, alCambiar }) {
  const [datos, setDatos] = useState(vacio);
  const [equipoId, setEquipoId] = useState(null);
  const [edicion, setEdicion] = useState(null);
  const [jugadorId, setJugadorId] = useState("");
  const [rol, setRol] = useState("");
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const equipo = db.equipos.find((e) => e.id === equipoId);
  const puede = perfil.rol !== "Visitante";
  const cambiar = (e) =>
    setDatos({ ...datos, [e.target.name]: e.target.value });
  function guardar(e) {
    e.preventDefault();
    setErrores({});
    setMensaje("");
    try {
      const resultado = arenaService.guardarEquipo(db, datos, perfil, edicion);
      alCambiar(resultado.db);
      setEquipoId(resultado.equipo.id);
      setDatos(vacio);
      setEdicion(null);
      setMensaje("Equipo guardado. Ahora puedes agregar integrantes.");
    } catch (e) {
      setErrores(e.campos ?? { general: e.message });
    }
  }
  function agregar(e) {
    e.preventDefault();
    setMensaje("");
    try {
      alCambiar(
        arenaService.agregarIntegrante(db, equipoId, jugadorId, rol, perfil),
      );
      setJugadorId("");
      setRol("");
      setMensaje("Integrante agregado.");
    } catch (e) {
      setMensaje(e.message);
    }
  }
  function quitar(id) {
    try {
      alCambiar(arenaService.quitarIntegrante(db, equipoId, id, perfil));
      setMensaje("Integrante eliminado.");
    } catch (e) {
      setMensaje(e.message);
    }
  }
  function editar(equipo) {
    setEquipoId(equipo.id);
    setEdicion(equipo.id);
    setDatos({ ...equipo, clave: "", clave2: "" });
    setErrores({});
    setMensaje("");
  }
  return (
    <main className="contenedor pagina-detalle">
      <section className="titulo-pagina">
        <p className="etiqueta">MI EQUIPO</p>
        <h1>Gestión de equipo</h1>
        <p>
          Crea un equipo y administra su plantilla. El nombre no puede repetirse
          y el capitán es obligatorio.
        </p>
      </section>
      {!puede && (
        <p className="alert alert-info aviso">
          El visitante puede consultar. Cambia el perfil de prueba para guardar.
        </p>
      )}
      <DosColumnas>
        <section className="panel-filtros">
          <h2>{edicion ? "Editar equipo" : "Crear equipo"}</h2>
          <form className="formulario" onSubmit={guardar} noValidate>
            <Campo
              id="eq-nombre"
              etiqueta="Nombre del equipo"
              ayuda="Entre 3 y 40 caracteres, sin repetir un equipo existente."
              error={errores.nombre}
            >
              <input className="form-control"
                id="eq-nombre"
                name="nombre"
                maxLength="40"
                value={datos.nombre}
                onChange={cambiar}
                aria-describedby="eq-nombre-error"
              />
            </Campo>
            <Campo
              id="eq-juego"
              etiqueta="Juego principal"
              error={errores.juego}
            >
              <select className="form-select"
                id="eq-juego"
                name="juego"
                value={datos.juego}
                onChange={cambiar}
                aria-describedby="eq-juego-error"
              >
                <option value="">Selecciona un juego</option>
                {db.juegos.map((j) => (
                  <option key={j.id}>{j.nombre}</option>
                ))}
              </select>
            </Campo>
            <Campo
              id="eq-capitan"
              etiqueta="Capitán"
              ayuda="Se agrega automáticamente a la lista de integrantes."
              error={errores.capitanId}
            >
              <select className="form-select"
                id="eq-capitan"
                name="capitanId"
                value={datos.capitanId}
                onChange={cambiar}
                aria-describedby="eq-capitan-error"
              >
                <option value="">Selecciona un jugador</option>
                {db.jugadores.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.apodo}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo
              id="eq-clave"
              etiqueta="Clave de acceso"
              ayuda={
                edicion
                  ? "Puedes dejar ambas claves vacías al editar."
                  : "Mínimo 8 caracteres, con una letra y un número. Es de prueba y no se guarda."
              }
              error={errores.clave}
            >
              <input className="form-control"
                id="eq-clave"
                name="clave"
                type="password"
                autoComplete="new-password"
                value={datos.clave}
                onChange={cambiar}
                aria-describedby="eq-clave-error"
              />
            </Campo>
            <Campo
              id="eq-clave2"
              etiqueta="Repetir clave"
              error={errores.clave2}
            >
              <input className="form-control"
                id="eq-clave2"
                name="clave2"
                type="password"
                autoComplete="new-password"
                value={datos.clave2}
                onChange={cambiar}
                aria-describedby="eq-clave2-error"
              />
            </Campo>
            <p className="mensaje-error" role="alert">
              {errores.general}
            </p>
            <button className="btn btn-primary boton boton-primario" disabled={!puede}>
              {edicion ? "Guardar equipo" : "Crear equipo"}
            </button>
            {edicion && (
              <button
                className="btn btn-outline-light boton boton-limpio"
                type="button"
                onClick={() => {
                  setEdicion(null);
                  setDatos(vacio);
                }}
              >
                Cancelar edición
              </button>
            )}
          </form>
        </section>
        <section className="panel-filtros">
          <h2>Integrantes del equipo</h2>
          {equipo && (
            <p>
              Equipo seleccionado: <strong>{equipo.nombre}</strong>
            </p>
          )}
          <form className="formulario" onSubmit={agregar} noValidate>
            <Campo id="int-jugador" etiqueta="Jugador">
              <select className="form-select"
                id="int-jugador"
                value={jugadorId}
                onChange={(e) => setJugadorId(e.target.value)}
              >
                <option value="">Selecciona un jugador</option>
                {db.jugadores.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.apodo}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo id="int-rol" etiqueta="Rol en el equipo">
              <input className="form-control"
                id="int-rol"
                placeholder="Ej: Soporte"
                maxLength="30"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
              />
            </Campo>
            <button
              className="btn btn-secondary boton boton-secundario"
              disabled={!puede || !equipo}
            >
              Agregar integrante
            </button>
          </form>
          {!equipo ? (
            <p className="alert alert-info aviso-vacio">
              Crea un equipo o elige uno de la lista.
            </p>
          ) : (
            <div className="table-responsive tabla-scroll">
              <table className="table table-hover tabla">
                <thead>
                  <tr>
                    <th>Jugador</th>
                    <th>Rol</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {equipo.integrantes.map((i) => (
                    <tr key={i.jugadorId}>
                      <td>
                        {db.jugadores.find((j) => j.id === i.jugadorId)?.apodo}
                      </td>
                      <td>{i.rol}</td>
                      <td>
                        <button
                          className="btn btn-outline-light boton boton-limpio"
                          disabled={!puede || i.jugadorId === equipo.capitanId}
                          onClick={() => quitar(i.jugadorId)}
                          aria-label={
                            "Quitar a " +
                            db.jugadores.find((j) => j.id === i.jugadorId)
                              ?.apodo
                          }
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </DosColumnas>
      <p className="alert alert-info aviso" role="status">
        {mensaje || "Los cambios se guardan solo en este navegador."}
      </p>
      <section className="seccion-resultados">
        <h2>Equipos existentes</h2>
        <div className="rejilla-torneos">
          {db.equipos.map((e) => (
            <article className="card tarjeta-torneo" key={e.id}>
              <h3>{e.nombre}</h3>
              <p>{e.juego}</p>
              <p>
                Capitán: {db.jugadores.find((j) => j.id === e.capitanId)?.apodo}
              </p>
              <p>
                {e.integrantes.length} integrantes ·{" "}
                {e.activo ? "Activo" : "Inactivo"}
              </p>
              <div className="acciones-filtros">
                <button
                  className="btn btn-secondary boton boton-secundario"
                  onClick={() => setEquipoId(e.id)}
                >
                  Ver integrantes
                </button>
                <button
                  className="btn btn-outline-light boton boton-limpio"
                  disabled={!puede}
                  onClick={() => editar(e)}
                >
                  Editar equipo
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
