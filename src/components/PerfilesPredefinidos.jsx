import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { perfilesPredefinidos } from "../data/perfilesPredefinidos.js";
import { authApi } from "../services/authApi.js";

const desarrolloLocal = import.meta.env?.DEV &&
  ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);

export default function PerfilesPredefinidos({ iniciarSesion, accesoDirecto = desarrolloLocal }) {
  const menu = useRef(null);
  const navegar = useNavigate();
  const [pendiente, setPendiente] = useState("");
  const [fallo, setFallo] = useState(null);
  const cerrarMenu = () => { menu.current.open = false; };

  async function entrar({ apodo, destino }) {
    if (pendiente) return;
    setPendiente(apodo);
    setFallo(null);
    try {
      const sesion = await authApi.ingresarDemo(apodo);
      iniciarSesion(sesion?.token);
      navegar(destino, { replace: true });
    } catch (error) {
      setFallo({ mensaje: error.message, apodo });
    } finally {
      setPendiente("");
    }
  }

  return (
    <details className="perfiles-predefinidos" ref={menu}>
      <summary>Accesos rápidos</summary>
      <ul aria-label="Perfiles predefinidos" aria-busy={Boolean(pendiente)}>
        {perfilesPredefinidos.map((perfil) => {
          const { apodo, nombre, descripcion } = perfil;
          const contenido = <><strong>{nombre}</strong><span>{pendiente === apodo ? "Entrando…" : descripcion}</span></>;
          return (
            <li key={apodo}>
              {accesoDirecto
                ? <button type="button" disabled={Boolean(pendiente)} onClick={() => entrar(perfil)}>{contenido}</button>
                : <Link to="/acceso.html" state={{ apodoPredefinido: apodo }} onClick={cerrarMenu}>{contenido}</Link>}
            </li>
          );
        })}
        {fallo && (
          <li>
            <p className="perfiles-error" role="alert">{fallo.mensaje}</p>
            <Link to="/acceso.html" state={{ apodoPredefinido: fallo.apodo }} onClick={cerrarMenu}>
              Abrir formulario de acceso
            </Link>
          </li>
        )}
      </ul>
    </details>
  );
}
