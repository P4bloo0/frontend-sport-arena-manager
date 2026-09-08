window.ARENA = window.ARENA || {};

(function (ARENA) {
  class Torneo {
    constructor(datos) {
      Object.assign(this, datos);
    }

    get cuposDisponibles() {
      return Math.max(0, this.cupoMaximo - this.ocupados);
    }
  }

  ARENA.Torneo = Torneo;
})(window.ARENA);