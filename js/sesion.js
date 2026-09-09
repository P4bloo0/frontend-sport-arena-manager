window.ARENA = window.ARENA || {};

(function (ARENA) {
  const CLAVE = "arena_rol";
  const ROLES = ["Visitante", "Jugador", "Organizador", "Administrador"];

  function leerRol() {
    try {
      const guardado = window.localStorage.getItem(CLAVE);
      return ROLES.includes(guardado) ? guardado : ROLES[0];
    } catch (error) {
      return ROLES[0];
    }
  }

  function guardarRol(rol) {
    try {
      window.localStorage.setItem(CLAVE, rol);
    } catch (error) {
      return;
    }
  }

  function puede(rolesPermitidos) {
    const lista = Array.isArray(rolesPermitidos)
      ? rolesPermitidos
      : String(rolesPermitidos).split(/\s+/).filter(Boolean);
    return lista.length === 0 || lista.includes(leerRol());
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

    document.dispatchEvent(new CustomEvent("arena:rol", { detail: { rol: leerRol() } }));
  }

  function construirSelector() {
    const barra = document.querySelector(".barra-navegacion");
    if (!barra || document.getElementById("selector-rol")) return;

    const contenedor = document.createElement("div");
    contenedor.className = "selector-rol";
    contenedor.innerHTML =
      '<label for="selector-rol">Perfil de prueba</label>' +
      '<select id="selector-rol">' +
      ROLES.map((rol) => `<option value="${rol}">${rol}</option>`).join("") +
      "</select>";
    barra.appendChild(contenedor);

    const select = contenedor.querySelector("#selector-rol");
    select.value = leerRol();
    select.addEventListener("change", () => {
      guardarRol(select.value);
      aplicarVisibilidad();
    });
  }

  ARENA.sesion = {
    ROLES,
    rol: leerRol,
    fijarRol: (rol) => {
      guardarRol(rol);
      aplicarVisibilidad();
    },
    puede,
    aplicarVisibilidad
  };

  construirSelector();
  aplicarVisibilidad();
})(window.ARENA);
