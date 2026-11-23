import { useEffect, useState } from "react";
import Campo from "../components/Campo.jsx";
import DosColumnas from "../components/DosColumnas.jsx";
import { Estado } from "../components/TarjetaTorneo.jsx";
import { organizacionApi as api } from "../services/organizacionApi.js";
import { esTorneoIndividual } from "../utils/logica.js";

export default function PartidasOrganizacion({ datos, token, op, nombre }) {
  const [torneoId, setTorneoId] = useState("");
  const torneo = datos.torneos.find((t) => t.id === Number(torneoId));

  return (
    <>
      <section className="panel-filtros mb-3">
        <h2>Partidas y resultados por torneo</h2>
        <Campo id="part-torneo" etiqueta="Torneo">
          <select id="part-torneo" className="form-select" value={torneoId} disabled={op.ocupado}
            onChange={(e) => { setTorneoId(e.target.value); op.limpiar(); }}>
            <option value="">Selecciona un torneo</option>
            {datos.torneos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </Campo>
      </section>
      {torneo && (
        <PartidasTorneo key={torneo.id} torneo={torneo} token={token} op={op}
          nombrar={(id) => esTorneoIndividual(torneo) ? nombre(datos, null, id) : nombre(datos, id, null)} />
      )}
    </>
  );
}

function PartidasTorneo({ torneo, token, op, nombrar }) {
  const [carga, setCarga] = useState(null);
  const [error, setError] = useState("");
  const [seleccion, setSeleccion] = useState("");
  const { id } = torneo;

  useEffect(() => {
    const control = new AbortController();
    const { signal } = control;
    Promise.all([api.partidas(id, signal), api.resultados(id, signal), api.inscripciones(id, token, signal)])
      .then(([partidas, resultados, inscripciones]) => {
        if (!signal.aborted) {
          setCarga({ partidas, resultados, inscripciones });
          setError("");
        }
      })
      .catch((fallo) => {
        if (!signal.aborted) setError(fallo.message);
      });
    return () => control.abort();
  }, [id, token]);

  if (error) return <p role="alert">{error}</p>;
  if (!carga) return <p role="status">Cargando partidas y resultados.</p>;

  const participanteIds = [...new Set(carga.inscripciones
    .filter((i) => i.estado === "CONFIRMADA")
    .map((i) => esTorneoIndividual(torneo) ? i.jugadorId : i.equipoId)
    .filter((idParticipante) => idParticipante != null))];
  const partida = carga.partidas.find((p) => p.partidaId === Number(seleccion));
  const resultado = carga.resultados.find((r) => r.partidaId === partida?.partidaId);
  const puedeCrear = torneo.estado === "En curso" && participanteIds.length >= 2;
  const puedeEditar = ["PROGRAMADA", "EN_CURSO"].includes(partida?.estado);

  function actualizarPartida(nueva) {
    setCarga((actual) => ({
      ...actual,
      partidas: actual.partidas.some((p) => p.partidaId === nueva.partidaId)
        ? actual.partidas.map((p) => p.partidaId === nueva.partidaId ? nueva : p)
        : [...actual.partidas, nueva],
    }));
    setSeleccion(String(nueva.partidaId));
  }

  function actualizarResultado(nuevo) {
    setCarga((actual) => ({
      ...actual,
      resultados: [...actual.resultados.filter((r) => r.partidaId !== nuevo.partidaId), nuevo],
    }));
  }

  function cambiarEstado() {
    const estado = partida.estado === "PROGRAMADA" ? "EN_CURSO" : "FINALIZADA";
    op.ejecutar(async () => {
      actualizarPartida(await api.cambiarEstadoPartida(partida.partidaId, estado, token));
    }, "Estado de la partida actualizado.");
  }

  function cancelar() {
    if (!window.confirm("¿Cancelar esta partida?")) return;
    op.ejecutar(async () => {
      actualizarPartida(await api.cancelarPartida(partida.partidaId, token));
    }, "Partida cancelada.");
  }

  return (
    <DosColumnas>
      <section className="panel-filtros">
        <h2>Partidas</h2>
        <Campo id="part-seleccion" etiqueta="Partida">
          <select id="part-seleccion" className="form-select" value={seleccion} disabled={op.ocupado}
            onChange={(e) => { setSeleccion(e.target.value); op.limpiar(); }}>
            <option value="">Nueva partida</option>
            {carga.partidas.map((p) => (
              <option key={p.partidaId} value={p.partidaId}>
                {p.ronda} · {nombrar(p.participanteAId)} vs {nombrar(p.participanteBId)}
              </option>
            ))}
          </select>
        </Campo>
        {partida && <p><Estado estado={partida.estado} /></p>}
        {(partida ? puedeEditar : puedeCrear) && (
          <FormularioPartida key={partida?.partidaId ?? "nueva"} partida={partida}
            torneoId={id} ids={participanteIds} nombrar={nombrar} token={token} op={op}
            alGuardar={actualizarPartida} />
        )}
        {!partida && !puedeCrear && (
          <p>Para programar una partida, el torneo debe estar en curso y tener al menos dos participantes confirmados.</p>
        )}
        {partida && !puedeEditar && (
          <p>{partida.ronda} · {partida.fechaHora?.replace("T", " ").slice(0, 16) ?? "Sin horario"}</p>
        )}
        {puedeEditar && (
          <div className="acciones-filtros mt-3">
            <button type="button" className="btn btn-primary" disabled={op.ocupado} onClick={cambiarEstado}>
              {partida.estado === "PROGRAMADA" ? "Iniciar partida" : "Finalizar partida"}
            </button>
            <button type="button" className="btn btn-outline-light" disabled={op.ocupado} onClick={cancelar}>
              Cancelar partida
            </button>
          </div>
        )}
      </section>
      <section className="panel-filtros">
        <h2>Resultados</h2>
        {partida ? (
          <ResultadoPartida key={partida.partidaId} partida={partida} resultado={resultado}
            nombrar={nombrar} token={token} op={op} alGuardar={actualizarResultado} />
        ) : <p>Selecciona una partida para consultar su resultado.</p>}
      </section>
    </DosColumnas>
  );
}

function SelectorParticipante({ campo, etiqueta, ids, nombrar, valor = "" }) {
  return (
    <Campo id={`part-${campo}`} etiqueta={etiqueta}>
      <select id={`part-${campo}`} name={campo} className="form-select" defaultValue={valor} required>
        <option value="">Selecciona un participante</option>
        {ids.map((id) => <option key={id} value={id}>{nombrar(id)}</option>)}
      </select>
    </Campo>
  );
}

function FormularioPartida({ partida, torneoId, ids, nombrar, token, op, alGuardar }) {
  function guardar(evento) {
    evento.preventDefault();
    const campos = Object.fromEntries(new FormData(evento.currentTarget));
    op.ejecutar(async () => {
      const participanteAId = partida?.participanteAId ?? Number(campos.participanteAId);
      const participanteBId = partida?.participanteBId ?? Number(campos.participanteBId);
      if (participanteAId === participanteBId) throw new Error("Elige dos participantes distintos.");
      const ronda = campos.ronda.trim();
      if (!ronda) throw new Error("Escribe la ronda.");
      alGuardar(await api.guardarPartida(partida?.partidaId, {
        torneoId, participanteAId, participanteBId, ronda, fechaHora: campos.fechaHora || null,
      }, token));
    }, "Partida guardada.");
  }

  return (
    <form className="formulario" onSubmit={guardar}>
      {partida ? (
        <p>{nombrar(partida.participanteAId)} vs {nombrar(partida.participanteBId)}</p>
      ) : (
        <>
          <SelectorParticipante campo="participanteAId" etiqueta="Participante A" ids={ids} nombrar={nombrar} />
          <SelectorParticipante campo="participanteBId" etiqueta="Participante B" ids={ids} nombrar={nombrar} />
        </>
      )}
      <Campo id="part-ronda" etiqueta="Ronda">
        <input id="part-ronda" name="ronda" className="form-control" defaultValue={partida?.ronda} required />
      </Campo>
      <Campo id="part-fecha" etiqueta="Fecha y hora (Santiago)">
        <input id="part-fecha" name="fechaHora" className="form-control" type="datetime-local"
          step={1} defaultValue={partida?.fechaHora} />
      </Campo>
      <button className="btn btn-primary" disabled={op.ocupado}>Guardar partida</button>
    </form>
  );
}

function ResultadoPartida({ partida, resultado, nombrar, token, op, alGuardar }) {
  const [anulando, setAnulando] = useState(false);
  const admiteResultado = ["EN_CURSO", "FINALIZADA"].includes(partida.estado);
  const pendiente = resultado?.estadoValidacion === "PENDIENTE";
  const ids = [partida.participanteAId, partida.participanteBId];

  function guardar(evento) {
    evento.preventDefault();
    const campos = new FormData(evento.currentTarget);
    op.ejecutar(async () => {
      alGuardar(await api.guardarResultado(resultado?.resultadoId, {
        partidaId: partida.partidaId, ganadorId: Number(campos.get("ganadorId")),
        puntajeA: Number(campos.get("puntajeA")), puntajeB: Number(campos.get("puntajeB")),
      }, token));
    }, "Resultado guardado.");
  }

  function anular(evento) {
    evento.preventDefault();
    const justificacion = String(new FormData(evento.currentTarget).get("justificacion")).trim();
    op.ejecutar(async () => {
      if (!justificacion) throw new Error("Escribe la justificación de la anulación.");
      alGuardar(await api.anularResultado(resultado.resultadoId, justificacion, token));
      setAnulando(false);
    }, "Resultado anulado.");
  }

  return (
    <>
      {resultado && (
        <>
          <p><Estado estado={resultado.estadoValidacion} /></p>
          <p>{nombrar(ids[0])} {resultado.puntajeA} – {resultado.puntajeB} {nombrar(ids[1])}</p>
          <p>Ganador: {nombrar(resultado.ganadorId)}</p>
          {resultado.justificacionAnulacion && <p>Justificación: {resultado.justificacionAnulacion}</p>}
        </>
      )}
      {!resultado && !admiteResultado && <p>Inicia la partida para registrar un resultado.</p>}
      {admiteResultado && (!resultado || pendiente) && !anulando && (
        <form className="formulario" onSubmit={guardar}>
          <SelectorParticipante campo="ganadorId" etiqueta="Ganador" ids={ids} nombrar={nombrar}
            valor={resultado?.ganadorId} />
          {ids.map((id, indice) => {
            const campo = indice === 0 ? "puntajeA" : "puntajeB";
            return (
              <Campo key={campo} id={`part-${campo}`} etiqueta={`Puntaje de ${nombrar(id)}`}>
                <input id={`part-${campo}`} name={campo} className="form-control" type="number"
                  min={0} defaultValue={resultado?.[campo]} required />
              </Campo>
            );
          })}
          <button className="btn btn-primary" disabled={op.ocupado}>Guardar resultado</button>
        </form>
      )}
      {resultado && resultado.estadoValidacion !== "ANULADO" && !anulando && (
        <div className="acciones-filtros mt-3">
          {pendiente && admiteResultado && (
            <button type="button" className="btn btn-primary" disabled={op.ocupado}
              onClick={() => op.ejecutar(async () => {
                alGuardar(await api.validarResultado(resultado.resultadoId, token));
              }, "Resultado validado.")}>Validar resultado</button>
          )}
          <button type="button" className="btn btn-outline-light" disabled={op.ocupado}
            onClick={() => { op.limpiar(); setAnulando(true); }}>Anular resultado</button>
        </div>
      )}
      {anulando && (
        <form className="formulario" onSubmit={anular}>
          <Campo id="part-justificacion" etiqueta="Justificación de la anulación">
            <textarea id="part-justificacion" name="justificacion" className="form-control" required />
          </Campo>
          <button type="submit" className="btn btn-primary" disabled={op.ocupado}>Confirmar anulación</button>
          <button type="button" className="btn btn-outline-light" disabled={op.ocupado}
            onClick={() => { op.limpiar(); setAnulando(false); }}>Volver</button>
        </form>
      )}
    </>
  );
}
