window.ARENA = window.ARENA || {};

(function (ARENA) {
  const { fechaLegible } = ARENA.utiles;

  function claseEstado(estado) {
    return estado.toLowerCase().replace(" ", "-");
  }

  function crearTarjeta(torneo) {
    return `
      <article class="tarjeta-torneo">
        <span class="estado estado-${claseEstado(torneo.estado)}">
          ${torneo.estado}
        </span>

        <div>
          <h3>${torneo.nombre}</h3>
          <p>${torneo.juego} · ${torneo.modalidad}</p>
        </div>

        <ul class="datos-torneo">
          <li><strong>Equipos:</strong> ${torneo.ocupados}/${torneo.cupoMaximo}</li>
          <li><strong>Cupos libres:</strong> ${torneo.cuposDisponibles}</li>
          <li><strong>Cierre:</strong> ${fechaLegible(torneo.cierre)}</li>
        </ul>

        <a class="boton boton-secundario" href="detalle-torneo.html?id=${torneo.id}">
          Ver detalle
        </a>
      </article>
    `;
  }

  function mostrarTorneos(contenedor, torneos) {
    contenedor.innerHTML = torneos.map(crearTarjeta).join("");
  }

  function mostrarCierres(contenedor, torneos) {
    contenedor.innerHTML = torneos
      .slice(0, 3)
      .map(
        (torneo) => `
          <li>
            <strong>${torneo.nombre}</strong><br>
            Cierra el ${fechaLegible(torneo.cierre)}
          </li>
        `
      )
      .join("");
  }

  function llenarJuegos(select, torneos) {
    const juegos = [...new Set(torneos.map((torneo) => torneo.juego))].sort();

    select.innerHTML += juegos
      .map((juego) => `<option value="${juego}">${juego}</option>`)
      .join("");
  }

  ARENA.ui = {
    mostrarTorneos,
    mostrarCierres,
    llenarJuegos
  };
})(window.ARENA);