// Esto permite que los archivos JavaScript compartan información.
window.ARENA = window.ARENA || {};

(function (ARENA) {
  // Convierte una fecha yyyy-mm-dd en una fecha facil de leer.
  function fechaLegible(fechaTexto) {
    const fecha = new Date(`${fechaTexto}T12:00:00`);

    return new Intl.DateTimeFormat("es-CL", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(fecha);
  }

  // Evita diferencias entre letras mayúsculas minúsculas y tildes al buscar
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