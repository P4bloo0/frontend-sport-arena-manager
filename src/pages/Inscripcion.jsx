import DosColumnas from "../components/DosColumnas.jsx";
// junta tu formulario y su resumen, sin cambiar el diseño de la página
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FormularioInscripcion from "../components/FormularioInscripcion.jsx";
import { Ficha } from "../components/Tablas.jsx";
import { arenaService } from "../services/arenaService.js";
import {
  cuposDisponibles,
  formatearFecha,
  nombreParticipante,
} from "../utils/logica.js";
export default function Inscripcion({ db, perfil, alCambiar }) {
  const [busqueda] = useSearchParams();
  const [datos, setDatos] = useState({
    torneoId: busqueda.get("id") ?? "",
    tipo: "equipo",
    participanteId: "",
    seed: "",
    correo: "",
    acepta: false,
  });
  const [confirmacion, setConfirmacion] = useState(null);
  const torneo = db.torneos.find((t) => t.id === Number(datos.torneoId));
  function inscribir(datos) {
    const resultado = arenaService.inscribir(db, datos, perfil);
    alCambiar(resultado.db);
    setConfirmacion(resultado.registro);
  }
  return (
    <main className="contenedor pagina-detalle">
      <section className="titulo-pagina">
        <p className="etiqueta">PARTICIPA</p>
        <h1>Inscripción a torneo</h1>
        <p>
          Registra la participación de un jugador o de un equipo. El envío se
          bloquea mientras exista cualquier incumplimiento.
        </p>
      </section>
      {perfil.rol === "Visitante" && (
        <p className="aviso aviso-error">
          Estás viendo esta página como Visitante. Cambia el Perfil de prueba de
          la cabecera para poder inscribirte.
        </p>
      )}
      <DosColumnas>
        <section className="panel-filtros">
          <h2>Datos de la inscripción</h2>
          <FormularioInscripcion
            db={db}
            perfil={perfil}
            datos={datos}
            setDatos={setDatos}
            onInscribir={inscribir}
          />
        </section>
        <aside className="panel-filtros">
          <h2>Requisitos del torneo</h2>
          {!torneo ? (
            <p className="aviso-vacio">
              Selecciona un torneo para ver sus requisitos.
            </p>
          ) : (
            <Ficha
              filas={[
                ["Juego", torneo.juego],
                ["Modalidad", torneo.modalidad],
                ["Estado", torneo.estado],
                [
                  "Cupos disponibles",
                  cuposDisponibles(torneo, db.inscripciones),
                ],
                ["Cierre", formatearFecha(torneo.cierre)],
                [
                  "Integrantes mínimos",
                  db.juegos.find((j) => j.nombre === torneo.juego)
                    ?.minIntegrantes,
                ],
              ]}
            />
          )}
        </aside>
      </DosColumnas>
      {confirmacion && (
        <section className="seccion-resultados" role="status">
          <h2>Inscripción registrada</h2>
          <div className="aviso aviso-ok">
            <Ficha
              filas={[
                [
                  "Torneo",
                  db.torneos.find((t) => t.id === confirmacion.torneoId)
                    ?.nombre,
                ],
                [
                  "Participante",
                  nombreParticipante(
                    db,
                    confirmacion.equipoId ?? confirmacion.jugadorId,
                    confirmacion.equipoId == null ? "jugador" : "equipo",
                  ),
                ],
                ["Seed solicitado", confirmacion.seed ?? "sin preferencia"],
                ["Correo", confirmacion.correo],
                ["Estado", confirmacion.estado],
              ]}
            />
          </div>
          <p>
            <Link className="boton boton-secundario" to="/torneos.html">
              Volver a los torneos
            </Link>
          </p>
        </section>
      )}
    </main>
  );
}
