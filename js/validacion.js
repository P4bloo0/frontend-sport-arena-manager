window.ARENA = window.ARENA || {};

(function (ARENA) {
  const reglas = {
    requerido: (mensaje = "Este campo es obligatorio.") => (valor) =>
      String(valor).trim() === "" ? mensaje : "",

    minLongitud: (n, mensaje) => (valor) =>
      String(valor).trim().length < n ? (mensaje || `Debe tener al menos ${n} caracteres.`) : "",

    maxLongitud: (n, mensaje) => (valor) =>
      String(valor).length > n ? (mensaje || `No puede superar los ${n} caracteres.`) : "",

    correo: (mensaje = "Formato de correo no valido (ejemplo: nombre@dominio.com).") => (valor) => {
      if (String(valor).trim() === "") return "";
      return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(valor).trim()) ? "" : mensaje;
    },

    rango: (min, max, mensaje) => (valor) => {
      if (String(valor).trim() === "") return "";
      const numero = Number(valor);
      if (Number.isNaN(numero)) return "Debe ser un numero.";
      return numero < min || numero > max ? (mensaje || `Debe estar entre ${min} y ${max}.`) : "";
    },

    entero: (mensaje = "Debe ser un numero entero.") => (valor) => {
      if (String(valor).trim() === "") return "";
      return Number.isInteger(Number(valor)) ? "" : mensaje;
    },

    sinEspacios: (mensaje = "No se permiten espacios.") => (valor) =>
      /\s/.test(String(valor)) ? mensaje : "",

    contrasena: (min = 8) => (valor) => {
      if (String(valor) === "") return "La contrasena es obligatoria.";
      if (String(valor).length < min) return `Minimo ${min} caracteres.`;
      if (!/[a-zA-Z]/.test(valor)) return "Debe incluir al menos una letra.";
      if (!/\d/.test(valor)) return "Debe incluir al menos un numero.";
      return "";
    },

    igualA: (nombreCampo, mensaje = "Los valores no coinciden.") => (valor, formulario) => {
      const otro = formulario && formulario.elements[nombreCampo];
      return otro && String(valor) !== String(otro.value) ? mensaje : "";
    }
  };

  function contenedorCampo(campo) {
    return campo.closest(".campo") || campo.parentElement;
  }

  function valorDe(campo) {
    return campo.type === "checkbox" ? campo.checked : campo.value;
  }

  function pintarError(campo, mensaje) {
    const contenedor = contenedorCampo(campo);
    const hueco = contenedor ? contenedor.querySelector(".mensaje-error") : null;
    if (hueco) hueco.textContent = mensaje;
    campo.classList.toggle("invalido", mensaje !== "");
    campo.setAttribute("aria-invalid", mensaje !== "" ? "true" : "false");
  }

  function evaluarCampo(formulario, nombre, listaReglas) {
    const campo = formulario.elements[nombre];
    if (!campo) return "";
    const valor = valorDe(campo);
    for (const regla of listaReglas) {
      const error = regla(valor, formulario) || "";
      if (error) return error;
    }
    return "";
  }

  function validarFormulario(formulario, esquema) {
    const errores = {};
    Object.keys(esquema).forEach((nombre) => {
      const campo = formulario.elements[nombre];
      if (!campo) return;
      const error = evaluarCampo(formulario, nombre, esquema[nombre]);
      pintarError(campo, error);
      if (error) errores[nombre] = error;
    });
    return { valido: Object.keys(errores).length === 0, errores };
  }

  function esValido(formulario, esquema) {
    return Object.keys(esquema).every((nombre) => !evaluarCampo(formulario, nombre, esquema[nombre]));
  }

  function datosDe(formulario) {
    const datos = {};
    Array.from(formulario.elements).forEach((campo) => {
      if (!campo.name) return;
      datos[campo.name] = campo.type === "checkbox" ? campo.checked : campo.value;
    });
    return datos;
  }

  function conectar(formulario, esquema, alEnviar) {
    const boton = formulario.querySelector('[type="submit"]');
    const refrescarBoton = () => {
      if (boton) boton.disabled = !esValido(formulario, esquema);
    };

    formulario.addEventListener("focusout", (evento) => {
      const nombre = evento.target.name;
      if (nombre && esquema[nombre]) {
        pintarError(evento.target, evaluarCampo(formulario, nombre, esquema[nombre]));
      }
      refrescarBoton();
    });

    formulario.addEventListener("input", (evento) => {
      if (evento.target.classList.contains("invalido")) {
        pintarError(evento.target, "");
      }
      refrescarBoton();
    });

    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const resultado = validarFormulario(formulario, esquema);
      if (!resultado.valido) {
        const primero = formulario.querySelector(".invalido");
        if (primero) primero.focus();
        return;
      }
      alEnviar(datosDe(formulario), formulario);
    });

    refrescarBoton();
  }

  ARENA.validacion = { reglas, validarFormulario, esValido, conectar, pintarError, datosDe };
})(window.ARENA);
