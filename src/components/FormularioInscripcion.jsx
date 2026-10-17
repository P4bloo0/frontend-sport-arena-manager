// sigue el formulario con estado de develo, pero conserva tus campos y sus nombres
import { useState } from "react";
import Campo from "./Campo.jsx";
import { validarInscripcion } from "../utils/logica.js";
export default function FormularioInscripcion({
  db,
  perfil,
  datos,
  setDatos,
  onInscribir,
}) {
  const [tocados, setTocados] = useState({});
  const [error, setError] = useState("");
  const errores = validarInscripcion(db, datos, perfil);
  const cambiar = (e) => {
    setDatos({
      ...datos,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
    setError("");
  };
  const tocar = (e) => setTocados({ ...tocados, [e.target.name]: true });
  const campoError = (campo) => (tocados[campo] ? errores[campo] : "");
  const bloqueos = Object.entries(errores).filter(
    ([k]) =>
      !["torneoId", "participanteId", "correo", "seed", "acepta"].includes(k),
  );
  function enviar(e) {
    e.preventDefault();
    setTocados({
      torneoId: true,
      participanteId: true,
      correo: true,
      seed: true,
      acepta: true,
    });
    if (Object.keys(errores).length) return;
    try {
      onInscribir(datos);
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <form
      id="form-inscripcion"
      className="formulario"
      onSubmit={enviar}
      noValidate
    >
      <Campo id="ins-torneo" etiqueta="Torneo" error={campoError("torneoId")}>
        <select
          id="ins-torneo"
          name="torneoId"
          value={datos.torneoId}
          onChange={(e) => {
            setDatos({
              ...datos,
              torneoId: e.target.value,
              participanteId: "",
            });
          }}
          onBlur={tocar}
          aria-describedby="ins-torneo-error"
        >
          <option value="">Selecciona un torneo</option>
          {db.torneos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
      </Campo>
      <fieldset className="campo">
        <legend>Tipo de participante</legend>
        <div className="opciones-linea">
          {[
            ["equipo", "Equipo"],
            ["jugador", "Jugador individual"],
          ].map(([tipo, texto]) => (
            <label key={tipo}>
              <input
                type="radio"
                name="tipo"
                value={tipo}
                checked={datos.tipo === tipo}
                onChange={() =>
                  setDatos({ ...datos, tipo, participanteId: "" })
                }
              />{" "}
              {texto}
            </label>
          ))}
        </div>
      </fieldset>
      <Campo
        id="ins-participante"
        etiqueta={datos.tipo === "equipo" ? "Equipo" : "Jugador"}
        ayuda="Debe coincidir con el juego y la modalidad del torneo."
        error={campoError("participanteId")}
      >
        <select
          id="ins-participante"
          name="participanteId"
          value={datos.participanteId}
          onChange={cambiar}
          onBlur={tocar}
          aria-describedby="ins-participante-error"
        >
          <option value="">Selecciona</option>
          {(datos.tipo === "equipo" ? db.equipos : db.jugadores).map((p) => (
            <option key={p.id} value={p.id}>
              {p.apodo ?? p.nombre}
            </option>
          ))}
        </select>
      </Campo>
      <Campo
        id="ins-seed"
        etiqueta="Seed solicitado (opcional)"
        ayuda="Preferencia de posición en la llave. Entre 1 y 16."
        error={campoError("seed")}
      >
        <input
          id="ins-seed"
          name="seed"
          type="number"
          min="1"
          max="16"
          value={datos.seed}
          onChange={cambiar}
          onBlur={tocar}
          aria-describedby="ins-seed-error"
        />
      </Campo>
      <Campo
        id="ins-correo"
        etiqueta="Correo de contacto"
        error={campoError("correo")}
      >
        <input
          id="ins-correo"
          name="correo"
          type="email"
          autoComplete="email"
          value={datos.correo}
          onChange={cambiar}
          onBlur={tocar}
          aria-describedby="ins-correo-error"
        />
      </Campo>
      <div className="campo">
        <label>
          <input
            type="checkbox"
            name="acepta"
            checked={datos.acepta}
            onChange={cambiar}
          />{" "}
          He leído y acepto los requisitos del torneo
        </label>
        <span className="mensaje-error">{campoError("acepta")}</span>
      </div>
      {!!bloqueos.length && (
        <ul className="lista-bloqueos">
          {bloqueos.map(([k, texto]) => (
            <li key={k}>{texto}</li>
          ))}
        </ul>
      )}
      {error && (
        <p role="alert" className="mensaje-error">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="boton boton-primario"
        disabled={Object.keys(errores).length > 0}
      >
        Confirmar inscripción
      </button>
    </form>
  );
}
