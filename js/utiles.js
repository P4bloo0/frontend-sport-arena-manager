window.AAM = window.AAM || {};

(function (AAM) {
  "use strict";

  const $ = (selector, contexto) => (contexto || document).querySelector(selector);
  const $$ = (selector, contexto) => Array.from((contexto || document).querySelectorAll(selector));

  const vaciar = (nodo) => {
    while (nodo && nodo.firstChild) nodo.removeChild(nodo.firstChild);
  };

  const escaparHTML = (valor) =>
    String(valor)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const normalizarTexto = (valor) =>
    String(valor).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

  const MESES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  const aFecha = (iso) => new Date(String(iso).slice(0, 10) + "T00:00:00");

  const formatearFecha = (iso) => {
    if (!iso) return "Sin fecha";
    const f = aFecha(iso);
    return String(f.getDate()).padStart(2, "0") + " de " + MESES[f.getMonth()] + " de " + f.getFullYear();
  };

  const hoy = () => {
    const f = new Date();
    return f.getFullYear() + "-" +
      String(f.getMonth() + 1).padStart(2, "0") + "-" +
      String(f.getDate()).padStart(2, "0");
  };

  const parametroURL = (nombre) => new URLSearchParams(window.location.search).get(nombre);

  const ESTADOS_TORNEO = {
    abierto: { texto: "Inscripciones abiertas", modificador: "abierto", icono: "🟢" },
    en_curso: { texto: "En curso", modificador: "en-curso", icono: "🔴" },
    finalizado: { texto: "Finalizado", modificador: "finalizado", icono: "⚪" }
  };

  const ESTADOS_PARTIDA = {
    programada: { texto: "Programada", modificador: "programada", icono: "📅" },
    en_curso: { texto: "En curso", modificador: "en-curso", icono: "🔴" },
    finalizada: { texto: "Finalizada", modificador: "finalizada", icono: "✅" },
    cancelada: { texto: "Cancelada", modificador: "cancelada", icono: "✖️" }
  };

  const ESTADOS_INSCRIPCION = {
    pendiente: { texto: "Pendiente de revision", modificador: "pendiente", icono: "⏳" },
    aceptada: { texto: "Aceptada", modificador: "aceptada", icono: "✅" },
    rechazada: { texto: "Rechazada", modificador: "rechazada", icono: "⛔" }
  };

  const insigniaEstado = (claseBase, info) => {
    if (!info) return "";
    return '<span class="' + claseBase + " " + claseBase + "--" + info.modificador + '">' +
      '<span aria-hidden="true">' + info.icono + "</span> " + escaparHTML(info.texto) + "</span>";
  };

  AAM.utiles = {
    $, $$, vaciar, escaparHTML, normalizarTexto,
    aFecha, formatearFecha, hoy, parametroURL,
    ESTADOS_TORNEO, ESTADOS_PARTIDA, ESTADOS_INSCRIPCION, insigniaEstado
  };
})(window.AAM);
