// guardamos los filtros y mostramos solo los torneos que coinciden
import { useState } from "react";
import TarjetaTorneo from "../components/TarjetaTorneo.jsx";
const vacios = { nombre: "", juego: "", estado: "", desde: "", hasta: "" };
export default function Torneos({ db }) {
  const [filtros, setFiltros] = useState(vacios);
  const error =
    filtros.desde && filtros.hasta && filtros.desde > filtros.hasta
      ? "La fecha inicial no puede ser posterior a la final."
      : "";
  const lista = error
    ? []
    : db.torneos.filter(
        (t) =>
          t.nombre
            .toLowerCase()
            .includes(filtros.nombre.trim().toLowerCase()) &&
          (!filtros.juego || t.juego === filtros.juego) &&
          (!filtros.estado || t.estado === filtros.estado) &&
          (!filtros.desde || t.cierre >= filtros.desde) &&
          (!filtros.hasta || t.cierre <= filtros.hasta),
      );
  const cambiar = (e) =>
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  return (
    <main className="contenedor pagina-torneos">
      <section className="titulo-pagina">
        <p className="etiqueta">CATÁLOGO DE COMPETENCIAS</p>
        <h1>Explora los torneos</h1>
        <p>
          Usa los filtros para encontrar la competencia que mejor se adapte a tu
          equipo.
        </p>
      </section>
      <section className="panel-filtros">
        <h2>Buscar y filtrar</h2>
        <form onSubmit={(e) => e.preventDefault()} noValidate>
          <div className="rejilla-filtros">
            <div className="campo">
              <label htmlFor="buscador">Buscar por nombre</label>
              <input className="form-control"
                id="buscador"
                name="nombre"
                type="search"
                placeholder="Ejemplo: Copa Oro"
                value={filtros.nombre}
                onChange={cambiar}
              />
            </div>
            <div className="campo">
              <label htmlFor="filtro-juego">Juego</label>
              <select className="form-select"
                id="filtro-juego"
                name="juego"
                value={filtros.juego}
                onChange={cambiar}
              >
                <option value="">Todos los juegos</option>
                {db.juegos.map((j) => (
                  <option key={j.id}>{j.nombre}</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label htmlFor="filtro-estado">Estado</label>
              <select className="form-select"
                id="filtro-estado"
                name="estado"
                value={filtros.estado}
                onChange={cambiar}
              >
                <option value="">Todos los estados</option>
                {["Abierto", "En curso", "Finalizado"].map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label htmlFor="fecha-inicio">Desde la fecha</label>
              <input className="form-control"
                id="fecha-inicio"
                name="desde"
                type="date"
                value={filtros.desde}
                onChange={cambiar}
                aria-describedby="error-fechas"
              />
              <small>Fecha mínima de cierre de inscripción.</small>
            </div>
            <div className="campo">
              <label htmlFor="fecha-fin">Hasta la fecha</label>
              <input className="form-control"
                id="fecha-fin"
                name="hasta"
                type="date"
                value={filtros.hasta}
                onChange={cambiar}
                aria-describedby="error-fechas"
              />
              <small>Fecha máxima de cierre de inscripción.</small>
            </div>
          </div>
          <p id="error-fechas" className="mensaje-error" role="alert">
            {error}
          </p>
          <div className="acciones-filtros">
            <button className="btn btn-primary boton boton-primario">Aplicar filtros</button>
            <button
              type="button"
              className="btn btn-outline-light boton boton-limpio"
              onClick={() => setFiltros(vacios)}
            >
              Limpiar filtros
            </button>
          </div>
        </form>
      </section>
      <section className="seccion-resultados">
        <div className="encabezado-seccion">
          <h2>Resultados disponibles</h2>
          <p aria-live="polite">{lista.length} torneos encontrados</p>
        </div>
        <div className="rejilla-torneos">
          {lista.map((t) => (
            <TarjetaTorneo
              key={t.id}
              torneo={t}
              inscripciones={db.inscripciones}
            />
          ))}
        </div>
        {!lista.length && (
          <div className="estado-vacio">
            <p className="icono-estado" aria-hidden="true">
              ⌕
            </p>
            <h2>No encontramos torneos</h2>
            <p>
              Prueba quitando algunos filtros o usa otro nombre de búsqueda.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
