import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Campo from "../components/Campo.jsx";
import DosColumnas from "../components/DosColumnas.jsx";
import { Ficha } from "../components/Tablas.jsx";
import { useCatalogoTorneos } from "../hooks/useCatalogoTorneos.js";
import { equiposApi } from "../services/equiposApi.js";
import { inscripcionesApi } from "../services/inscripcionesApi.js";
import { esTorneoIndividual, formatearFecha, motivoCierreInscripcion } from "../utils/logica.js";

export default function Inscripcion({ sesion }) {
  const [busqueda, setBusqueda] = useSearchParams();
  const { catalogo, error: errorCatalogo } = useCatalogoTorneos();
  const [equipos, setEquipos] = useState(null);
  const [errorEquipos, setErrorEquipos] = useState("");
  const [equipoId, setEquipoId] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [confirmacion, setConfirmacion] = useState(null);
  const [registrados, setRegistrados] = useState([]);
  const [ocupacion, setOcupacion] = useState({});
  const { token, userId, nickname } = sesion;
  const torneo = catalogo?.torneos.find((t) => t.id === Number(busqueda.get("id")));
  const opciones = catalogo?.torneos.filter((t) =>
    t.id === torneo?.id || !motivoCierreInscripcion(t, ocupacion[t.id]));
  const individual = esTorneoIndividual(torneo);
  const elegibles = equipos?.filter((e) =>
    e.estado && e.capitanId === userId && e.juegoPrincipalId === torneo?.juegoId);
  const equipo = elegibles?.find((e) => e.equipoId === Number(equipoId));
  const participanteId = individual ? userId : equipo?.equipoId;
  const tipo = individual ? "INDIVIDUAL" : "EQUIPO";
  const clave = `${torneo?.id}/${tipo}/${participanteId}`;
  const ocupados = ocupacion[torneo?.id] ?? torneo?.cupoActual;
  const disponibles = torneo ? Math.max(0, torneo.cupoMaximo - ocupados) : 0;

  useEffect(() => {
    if (!torneo || individual) return;
    const control = new AbortController();
    equiposApi.listarMios(token, control.signal)
      .then((lista) => {
        if (control.signal.aborted) return;
        setEquipos(lista);
        setErrorEquipos("");
      })
      .catch((fallo) => {
        if (!control.signal.aborted) setErrorEquipos(fallo.message);
      });
    return () => control.abort();
  }, [token, torneo, individual]);

  function bloqueo() {
    if (!torneo) return busqueda.has("id")
      ? "El torneo no existe. Selecciona otro torneo."
      : "Selecciona un torneo.";
    if (!userId) return "Tu cuenta debe estar vinculada a un perfil.";
    if (registrados.includes(clave)) return "Este participante ya está inscrito en el torneo.";
    const motivoCierre = motivoCierreInscripcion(torneo, ocupados);
    if (motivoCierre) return motivoCierre;
    if (individual) return "";
    if (errorEquipos) return errorEquipos;
    if (!elegibles) return "Cargando tus equipos.";
    if (!elegibles.length) return "Necesitas capitanear un equipo activo del mismo juego.";
    return equipo ? "" : "Selecciona el equipo que quieres inscribir.";
  }

  async function inscribir(evento) {
    evento.preventDefault();
    if (enviando || bloqueo()) return;
    setEnviando(true);
    setError("");
    setConfirmacion(null);
    try {
      const registro = await inscripcionesApi.crear({
        torneoId: torneo.id,
        tipoParticipante: tipo,
        ...(individual ? { jugadorId: userId } : { equipoId: equipo.equipoId }),
      }, token);

      setRegistrados((actuales) => [...actuales, clave]);
      setConfirmacion({
        torneoId: torneo.id,
        torneo: torneo.nombre,
        participante: individual ? nickname : equipo.nombre,
        estado: registro.estado,
      });

      const actualizado = await inscripcionesApi.ocupados(torneo.id).catch(() => null);
      setOcupacion((actual) => ({
        ...actual, [torneo.id]: Number.isInteger(actualizado) ? actualizado : ocupados + 1,
      }));
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setEnviando(false);
    }
  }

  function cambiarSeleccion() {
    setError("");
    setConfirmacion(null);
  }

  const aviso = bloqueo();
  return (
    <main className="contenedor pagina-detalle">
      <section className="titulo-pagina">
        <h1>Inscripción a torneo</h1>
      </section>
      {errorCatalogo && <p role="alert">{errorCatalogo}</p>}
      {!catalogo && !errorCatalogo && <p role="status">Cargando torneos.</p>}
      {opciones?.length === 0 && (
        <div className="alert alert-info aviso-vacio">
          <p role="status">No hay torneos disponibles para inscribirte.</p>
          <Link className="btn btn-outline-light" to="/torneos.html">Ver torneos</Link>
        </div>
      )}
      {opciones?.length > 0 && (
        <DosColumnas>
          <section className="panel-filtros">
            <h2>Datos de la inscripción</h2>
            <form className="formulario" onSubmit={inscribir}>
              <Campo id="ins-torneo" etiqueta="Torneo">
                <select id="ins-torneo" className="form-select" value={torneo?.id ?? ""}
                  disabled={enviando} onChange={(e) => {
                    setBusqueda({ id: e.target.value });
                    setEquipoId("");
                    cambiarSeleccion();
                  }}>
                  <option value="" disabled>Selecciona un torneo</option>
                  {opciones.map((t) => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
              </Campo>
              {torneo && (individual ? (
                <p>Inscripción individual: <strong>{nickname}</strong></p>
              ) : (
                <Campo id="ins-participante" etiqueta="Equipo">
                  <select id="ins-participante" className="form-select" value={equipo?.equipoId ?? ""}
                    disabled={enviando || !elegibles?.length}
                    onChange={(e) => {
                      setEquipoId(e.target.value);
                      cambiarSeleccion();
                    }}>
                    <option value="">Selecciona un equipo</option>
                    {elegibles?.map((e) => (
                      <option key={e.equipoId} value={e.equipoId}>{e.nombre}</option>
                    ))}
                  </select>
                </Campo>
              ))}
              {aviso && <p role="status">{aviso}</p>}
              {error && <p className="mensaje-error" role="alert">{error}</p>}
              <button className="btn btn-primary boton boton-primario" disabled={enviando || Boolean(aviso)}>
                {enviando ? "Registrando…" : "Confirmar inscripción"}
              </button>
            </form>
          </section>
          {torneo && (
            <aside className="panel-filtros">
              <h2>Requisitos del torneo</h2>
              <Ficha filas={[
                ["Juego", torneo.juego],
                ["Modalidad", torneo.modalidad],
                ["Estado", torneo.estado],
                ["Cupos disponibles", disponibles],
                ["Cierre", formatearFecha(torneo.cierre)],
              ]} />
            </aside>
          )}
        </DosColumnas>
      )}
      {confirmacion && confirmacion.torneoId === torneo?.id && (
        <section className="seccion-resultados" role="status">
          <h2>Inscripción registrada</h2>
          <Ficha filas={[
            ["Torneo", confirmacion.torneo],
            ["Participante", confirmacion.participante],
            ["Estado", confirmacion.estado],
          ]} />
          <Link className="btn btn-secondary" to={`/detalle-torneo.html?id=${torneo.id}`}>Ver torneo</Link>
        </section>
      )}
    </main>
  );
}
