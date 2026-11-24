import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Campo from "../components/Campo.jsx";
import { authApi } from "../services/authApi.js";
import { correoValido } from "../utils/logica.js";

function EntradaContrasena(atributos) {
  const [visible, setVisible] = useState(false);
  const accion = visible ? "Ocultar contraseña" : "Mostrar contraseña";

  return (
    <div className="acceso-contrasena">
      <input {...atributos} type={visible ? "text" : "password"} />
      <button
        type="button"
        className="acceso-ver-contrasena"
        aria-label={accion}
        aria-controls={atributos.id}
        title={accion}
        onClick={() => setVisible((actual) => !actual)}
      >
        <span className="acceso-ojo" data-visible={visible} aria-hidden="true" />
      </button>
    </div>
  );
}

export default function Acceso({ sesion, avisoSesion, iniciarSesion, cerrarSesion }) {
  const { state } = useLocation();
  const navegar = useNavigate();
  const [registro, setRegistro] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");

  async function enviar(e) {
    e.preventDefault();
    if (enviando) return;

    const form = new FormData(e.currentTarget);
    const nickname = String(form.get("nickname") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const nombre = String(form.get("nombre") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const fallos = {};

    if (!nickname) fallos.nickname = "Escribe tu apodo.";
    if (!password.trim()) fallos.password = "Escribe tu contraseña.";

    if (registro) {
      if (!nombre) fallos.nombre = "Escribe tu nombre.";
      if (!correoValido(email)) fallos.email = "Escribe un correo válido.";
      if (!/^\S{3,16}$/.test(nickname)) {
        fallos.nickname = "Usa de 3 a 16 caracteres, sin espacios.";
      }
      if (password.trim() && (password.length < 8 || password.length > 72)) {
        fallos.password = "Usa una contraseña de 8 a 72 caracteres.";
      }
    }

    setErrores(fallos);
    setMensaje("");
    if (Object.keys(fallos).length) return;

    setEnviando(true);

    try {
      const respuesta = registro
        ? await authApi.registrar({ nombre, email, nickname, password })
        : await authApi.ingresar({ nickname, password });

      iniciarSesion(respuesta?.token);
      setRegistro(false);
      const vuelta = state?.volver;
      if (typeof vuelta?.pathname === "string" && /^\/[a-z-]+\.html$/i.test(vuelta.pathname)) {
        navegar(vuelta, { replace: true });
      }
    } catch (error) {
      const camposVisibles = registro ? ["nombre", "email", "nickname", "password"] : ["nickname", "password"];
      const fallosServidor = Object.fromEntries(
        camposVisibles.filter((campo) => error.campos?.[campo]).map((campo) => [campo, error.campos[campo]]),
      );
      setErrores(fallosServidor);
      setMensaje(Object.keys(fallosServidor).length ? "" : error.message);
    } finally {
      setEnviando(false);
    }
  }

  function campo(nombre, etiqueta, tipo, autocompletar) {
    const id = `acceso-${nombre}`;
    const atributos = {
      className: errores[nombre] ? "form-control is-invalid" : "form-control",
      id,
      name: nombre,
      autoComplete: autocompletar,
      "aria-invalid": Boolean(errores[nombre]),
      "aria-describedby": `${id}-error`,
      onChange: () => {
        if (errores[nombre]) setErrores((actuales) => ({ ...actuales, [nombre]: "" }));
      },
      required: true,
    };

    return (
      <Campo id={id} etiqueta={etiqueta} error={errores[nombre]}>
        {tipo === "password"
          ? <EntradaContrasena {...atributos} />
          : <input {...atributos} type={tipo} />}
      </Campo>
    );
  }

  return (
    <main className={`contenedor seccion acceso${registro && !sesion ? " acceso-registro" : ""}`}>
      <h1>{sesion ? "Mi sesión" : registro ? "Crear cuenta" : "Iniciar sesión"}</h1>
      {!sesion && avisoSesion && <p role="status">{avisoSesion}</p>}

      {sesion ? (
        <>
          <p>Entraste como <strong>{sesion.nickname}</strong>.</p>
          <p>Rol: {sesion.roles.join(", ")}</p>
          <button className="btn btn-outline-light" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </>
      ) : (
        <form key={registro ? "registro" : "login"} onSubmit={enviar} noValidate>
          {registro && campo("nombre", "Nombre", "text", "name")}
          {registro && campo("email", "Correo", "email", "email")}
          {campo("nickname", "Apodo", "text", "username")}
          {campo("password", "Contraseña", "password",
            registro ? "new-password" : "current-password")}

          {mensaje && <p className="mensaje-error" role="alert">{mensaje}</p>}

          <button className="btn btn-primary" type="submit" disabled={enviando}>
            {enviando ? "Enviando…" : registro ? "Crear cuenta" : "Entrar"}
          </button>

          <button
            className="btn btn-outline-light"
            type="button"
            disabled={enviando}
            onClick={() => {
              setRegistro((actual) => !actual);
              setErrores({});
              setMensaje("");
            }}
          >
            {registro ? "Ya tengo cuenta" : "Registrarme"}
          </button>
        </form>
      )}
    </main>
  );
}
