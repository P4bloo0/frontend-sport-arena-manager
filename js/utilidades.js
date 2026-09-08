window.ARENA = window.ARENA || {};

(function (ARENA) {

  function fechaLegible(fechaTexto) {
    const fecha = new Date(`${fechaTexto}T12:00:00`);

    return new Intl.DateTimeFormat("es-CL", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(fecha);
  }


  function normalizarTexto(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  ARENA.utiles = {
    fechaLegible,
    normalizarTexto
  };
})(window.ARENA);