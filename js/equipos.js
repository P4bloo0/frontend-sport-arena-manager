window.ARENA = window.ARENA || {};

(function (ARENA) {
  const { reglas, conectar, validarFormulario } = ARENA.validacion;

  function escaparHTML(texto) {
    return String(texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function jugadorPorId(id) {
    return ARENA.jugadores.find((jugador) => jugador.id === Number(id)) || null;
  }

  function nombreDuplicado(valor) {
    const limpio = String(valor).trim().toLowerCase();
    return ARENA.equipos.some((equipo) => equipo.nombre.trim().toLowerCase() === limpio)
      ? "Ya existe un equipo con ese nombre."
      : "";
  }

  const plantel = [];

  function pintarIntegrantes() {
    const contenedor = document.getElementById("tabla-integrantes");
    if (!plantel.length) {
      contenedor.innerHTML = '<p class="aviso-vacio">Todavía no hay integrantes. Empieza eligiendo un capitán.</p>';
      return;
    }
    const filas = plantel
      .map((integrante) => {
        const jugador = jugadorPorId(integrante.jugadorId) || {};
        return `
        <tr>
          <td>${escaparHTML(jugador.nombre || integrante.jugadorId)}</td>
          <td>${escaparHTML(jugador.apodo || "")}</td>
          <td>${escaparHTML(integrante.rol)}</td>
          <td><button type="button" class="boton boton-limpio" data-quitar="${integrante.jugadorId}">Quitar</button></td>
        </tr>`;
      })
      .join("");
    contenedor.innerHTML = `
      <div class="tabla-scroll">
        <table class="tabla">
          <thead><tr><th>Jugador</th><th>Apodo</th><th>Rol</th><th></th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>`;
  }

  function quitarIntegrante(jugadorId) {
    const indice = plantel.findIndex((integrante) => integrante.jugadorId === Number(jugadorId));
    if (indice >= 0) plantel.splice(indice, 1);
    pintarIntegrantes();
  }

  function fijarCapitan(jugadorId) {
    const indiceCapitan = plantel.findIndex((integrante) => integrante.rol === "Capitán");
    if (indiceCapitan >= 0) plantel.splice(indiceCapitan, 1);
    if (!jugadorId) {
      pintarIntegrantes();
      return;
    }
    const id = Number(jugadorId);
    const yaEsta = plantel.find((integrante) => integrante.jugadorId === id);
    if (yaEsta) yaEsta.rol = "Capitán";
    else plantel.unshift({ jugadorId: id, rol: "Capitán" });
    pintarIntegrantes();
  }

  function pintarEquipos() {
    const contenedor = document.getElementById("lista-equipos");
    contenedor.innerHTML = ARENA.equipos
      .map((equipo) => {
        const capitan = jugadorPorId(equipo.capitanId);
        const estado = equipo.activo ? "abierto" : "finalizado";
        const textoEstado = equipo.activo ? "Activo" : "Inactivo";
        return `
        <article class="tarjeta-torneo">
          <span class="estado estado-${estado}">${textoEstado}</span>
          <div>
            <h3>${escaparHTML(equipo.nombre)}</h3>
            <p>${escaparHTML(equipo.juego)}</p>
          </div>
          <ul class="datos-torneo">
            <li><strong>Capitán:</strong> ${escaparHTML(capitan ? capitan.nombre : "Sin asignar")}</li>
            <li><strong>Integrantes:</strong> ${equipo.integrantes.length}</li>
          </ul>
        </article>`;
      })
      .join("");
  }

  function agregarIntegrante(evento) {
    evento.preventDefault();
    const formulario = evento.target;
    const jugadorId = Number(formulario.elements.jugador.value);
    const rol = formulario.elements.rol.value.trim() || "Integrante";
    const hueco = formulario.elements.jugador.closest(".campo").querySelector(".mensaje-error");

    if (!jugadorId) {
      hueco.textContent = "Selecciona un jugador.";
      return;
    }
    if (plantel.some((integrante) => integrante.jugadorId === jugadorId)) {
      hueco.textContent = "Ese jugador ya está en el equipo.";
      return;
    }
    hueco.textContent = "";
    plantel.push({ jugadorId, rol });
    formulario.reset();
    pintarIntegrantes();
  }

  function crearEquipo(datos, formulario) {
    const resultado = document.getElementById("eq-resultado");

    if (!plantel.some((integrante) => integrante.rol === "Capitán")) {
      resultado.innerHTML = '<p class="aviso aviso-error">Debes elegir un capitán antes de crear el equipo.</p>';
      return;
    }

    const equipoNuevo = {
      id: Math.max(0, ...ARENA.equipos.map((equipo) => equipo.id)) + 1,
      nombre: datos.nombre.trim(),
      juego: datos.juego,
      capitanId: Number(datos.capitan),
      activo: true,
      integrantes: plantel.slice()
    };
    ARENA.equipos.push(equipoNuevo);

    resultado.innerHTML = `
      <p class="aviso aviso-ok">Equipo "${escaparHTML(equipoNuevo.nombre)}" creado (simulado) con ${equipoNuevo.integrantes.length} integrante(s).</p>`;
    formulario.reset();
    plantel.length = 0;
    pintarIntegrantes();
    pintarEquipos();
  }

  function iniciar() {
    if (document.body.dataset.pagina !== "equipos") return;

    const selectJuego = document.getElementById("eq-juego");
    selectJuego.insertAdjacentHTML(
      "beforeend",
      ARENA.juegos.map((juego) => `<option value="${escaparHTML(juego.nombre)}">${escaparHTML(juego.nombre)}</option>`).join("")
    );

    const opcionesJugadores = ARENA.jugadores
      .map((jugador) => `<option value="${jugador.id}">${escaparHTML(jugador.nombre)} (${escaparHTML(jugador.apodo)})</option>`)
      .join("");
    document.getElementById("eq-capitan").insertAdjacentHTML("beforeend", opcionesJugadores);
    document.getElementById("int-jugador").insertAdjacentHTML("beforeend", opcionesJugadores);

    document.getElementById("eq-capitan").addEventListener("change", (evento) => fijarCapitan(evento.target.value));
    document.getElementById("form-integrante").addEventListener("submit", agregarIntegrante);

    document.getElementById("tabla-integrantes").addEventListener("click", (evento) => {
      const boton = evento.target.closest("[data-quitar]");
      if (boton) quitarIntegrante(boton.getAttribute("data-quitar"));
    });

    const formEquipo = document.getElementById("form-equipo");
    const esquema = {
      nombre: [reglas.requerido(), reglas.minLongitud(3), reglas.maxLongitud(40), (valor) => nombreDuplicado(valor)],
      juego: [reglas.requerido("Selecciona el juego principal.")],
      capitan: [reglas.requerido("Selecciona el capitán.")],
      clave: [reglas.contrasena(8)],
      clave2: [reglas.requerido("Repite la clave."), reglas.igualA("clave", "Las claves no coinciden.")]
    };
    conectar(formEquipo, esquema, crearEquipo);

    formEquipo.elements.clave.addEventListener("input", () => {
      if (formEquipo.elements.clave2.value) {
        validarFormulario(formEquipo, { clave2: esquema.clave2 });
      }
    });

    pintarIntegrantes();
    pintarEquipos();
  }

  iniciar();
})(window.ARENA);
