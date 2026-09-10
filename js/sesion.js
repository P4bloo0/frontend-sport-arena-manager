window.ARENA = window.ARENA || {};

(function (ARENA) {
  const CLAVE = "arena_perfil_prueba";

  const PERFILES = [
    {
      id: "visitante",
      nombre: "Visitante",
      rol: "Visitante",
      jugadorId: null,
      equiposPropios: [],
      descripcion: "Solo puede consultar torneos, posiciones y llave."
    },
    {
      id: "jugador-elegible",
      nombre: "Diego Navarro",
      rol: "Jugador",
      jugadorId: 5,
      equiposPropios: [7],
      descripcion: "Puede inscribir a Lancer Fan Club en un torneo de Valorant."
    },
    {
      id: "jugador-incompleto",
      nombre: "Matías Rojas",
      rol: "Jugador",
      jugadorId: 7,
      equiposPropios: [3],
      descripcion: "Permite probar el bloqueo por equipo incompleto."
    },
    {
      id: "jugador-sancionado",
      nombre: "Camila Soto",
      rol: "Jugador",
      jugadorId: 4,
      equiposPropios: [],
      descripcion: "Permite probar el bloqueo por sanción vigente."
    },
    {
      id: "organizador",
      nombre: "Alex Organizador",
      rol: "Organizador",
      jugadorId: null,
      equiposPropios: [],
      descripcion: "Representa al encargado de partidas y resultados."
    },
    {
      id: "administrador",
      nombre: "Morgan Administrador",
      rol: "Administrador",
      jugadorId: null,
      equiposPropios: [],
      descripcion: "Representa al encargado de juegos y torneos."
    }
  ];

  function leerPerfilId() {
    try {
      const id = window.localStorage.getItem(CLAVE);
      return PERFILES.some((perfil) => perfil.id === id) ? id : "visitante";
    } catch (error) {
      return "visitante";
    }
  }

  function guardarPerfil(id) {
    try {
      window.localStorage.setItem(CLAVE, id);
    } catch (error) {
      return;
    }
  }

  function perfilActual() {
    return PERFILES.find((perfil) => perfil.id === leerPerfilId()) || PERFILES[0];
  }

  function puede(rolesPermitidos) {
    const roles = Array.isArray(rolesPermitidos)
      ? rolesPermitidos
      : String(rolesPermitidos).split(/\s+/).filter(Boolean);

    return roles.length === 0 || roles.includes(perfilActual().rol);
  }

  function aplicarVisibilidad() {
    document.querySelectorAll("[data-rol]").forEach((elemento) => {
      const permitido = puede(elemento.getAttribute("data-rol"));

      if ("disabled" in elemento) {
        elemento.disabled = !permitido;
        elemento.setAttribute("aria-disabled", String(!permitido));
      } else {
        elemento.hidden = !permitido;
      }
    });

    document.querySelectorAll("[data-rol-bloqueado]").forEach((elemento) => {
      elemento.hidden = puede(elemento.getAttribute("data-rol-bloqueado"));
    });

    document.dispatchEvent(
      new CustomEvent("arena:perfil", {
        detail: { perfil: perfilActual() }
      })
    );
  }

  function construirSelector() {
    const barra = document.querySelector(".barra-navegacion");

    if (!barra || document.getElementById("selector-perfil")) return;

    const contenedor = document.createElement("div");
    contenedor.className = "selector-rol";
    contenedor.innerHTML = `
      <label for="selector-perfil">Perfil de prueba</label>
      <select id="selector-perfil">
        ${PERFILES.map(
          (perfil) =>
            `<option value="${perfil.id}">${perfil.nombre} · ${perfil.rol}</option>`
        ).join("")}
      </select>
    `;

    barra.appendChild(contenedor);

    const select = document.getElementById("selector-perfil");
    select.value = leerPerfilId();

    select.addEventListener("change", () => {
      guardarPerfil(select.value);
      aplicarVisibilidad();
    });
  }

  ARENA.sesion = {
    perfiles: PERFILES,
    perfilActual,
    rol: () => perfilActual().rol,
    jugadorActual: () => perfilActual().jugadorId,
    equiposPropios: () => perfilActual().equiposPropios,
    fijarPerfil: (id) => {
      guardarPerfil(id);
      aplicarVisibilidad();
    },
    puede,
    aplicarVisibilidad
  };

  construirSelector();
  aplicarVisibilidad();
})(window.ARENA);