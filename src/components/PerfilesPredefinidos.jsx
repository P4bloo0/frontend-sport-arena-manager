import { useRef } from "react";
import { Link } from "react-router-dom";

const perfiles = [
  { apodo: "admin", nombre: "Admin", descripcion: "Administración" },
  { apodo: "leo", nombre: "Leo", descripcion: "Minecraft" },
  { apodo: "camila", nombre: "Camila", descripcion: "League of Legends" },
  { apodo: "felipe", nombre: "Felipe", descripcion: "Líder de equipo" },
];

export default function PerfilesPredefinidos() {
  const menu = useRef(null);

  return (
    <details className="perfiles-predefinidos" ref={menu}>
      <summary>Accesos rápidos</summary>
      <ul aria-label="Perfiles predefinidos">
        {perfiles.map(({ apodo, nombre, descripcion }) => (
          <li key={apodo}>
            <Link
              to="/acceso.html"
              state={{ apodoPredefinido: apodo }}
              onClick={() => { menu.current.open = false; }}
            >
              <strong>{nombre}</strong>
              <span>{descripcion}</span>
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
