# Pruebas y cobertura

Verificación del 17 de octubre de 2026, después de incorporar ListaPartidas,
el selector de ronda y los componentes de Bootstrap.

## Ejecución

```bash
npm test
```

Jasmine ejecuta las comprobaciones y Karma las abre en Chrome Headless.
Se necesita Chrome instalado. `npm run test:manual` permite abrir el ejecutor
manualmente y `npm run test:dom` utiliza un entorno simulado.
La ejecución normal genera el informe HTML en `coverage/index.html`.
Esta revisión guardó los informes fuera del proyecto para conservar sus archivos fuente.

## Alcance

- Los diez casos obligatorios del PDF: ranking, puntos, cupos, cierre, sanciones,
  equipo completo, TarjetaTorneo, TablaRanking, bloqueo del formulario y LlaveTorneo.
- Reglas de modalidad, inscripción duplicada, validación y edición de equipos/perfiles.
- Servicios simulados, persistencia y almacenamiento bloqueado mediante espías de Jasmine.
- Navegación y recorridos de formularios en React.
- Selección de ronda: filtra conjuntamente llave y calendario, permite volver a todas
  las rondas y reinicia la selección cuando cambia el torneo.
- ListaPartidas: resultados validados, rival por definir y calendario sin partidas.

## Resultado actual

**58 pruebas aprobadas de 58**, ejecutadas con Jasmine y Karma en Chrome Headless.
La compilación de producción también finalizó correctamente.

| Medición | Resultado |
|---|---:|
| Líneas | 94,84 % |
| Sentencias | 95,23 % |
| Funciones | 94,73 % |
| Ramas | 89,44 % |

## Cobertura por archivo

| Archivo | Líneas | Sentencias | Funciones | Ramas |
|---|---:|---:|---:|---:|
| `src/App.jsx` | 96,96 % | 97,36 % | 100 % | 81,81 % |
| `src/components/Cabecera.jsx` | 100 % | 100 % | 100 % | 100 % |
| `src/components/Campo.jsx` | 100 % | 100 % | 100 % | 100 % |
| `src/components/DosColumnas.jsx` | 100 % | 100 % | 100 % | 100 % |
| `src/components/FormularioInscripcion.jsx` | 91,3 % | 92,3 % | 91,66 % | 93,33 % |
| `src/components/ListaPartidas.jsx` | 100 % | 100 % | 100 % | 100 % |
| `src/components/PiePagina.jsx` | 100 % | 100 % | 100 % | 100 % |
| `src/components/Tablas.jsx` | 94,11 % | 94,44 % | 91,66 % | 100 % |
| `src/components/TarjetaTorneo.jsx` | 100 % | 100 % | 100 % | 50 % |
| `src/data/datos.js` | 100 % | 100 % | 100 % | 100 % |
| `src/pages/Equipo.jsx` | 83,92 % | 84,21 % | 80,95 % | 95,83 % |
| `src/pages/Inicio.jsx` | 100 % | 100 % | 100 % | 100 % |
| `src/pages/Inscripcion.jsx` | 100 % | 100 % | 100 % | 85,71 % |
| `src/pages/Perfil.jsx` | 97,36 % | 97,67 % | 95,83 % | 78,94 % |
| `src/pages/TorneoDetalle.jsx` | 100 % | 100 % | 100 % | 83,33 % |
| `src/pages/Torneos.jsx` | 92,3 % | 92,3 % | 87,5 % | 83,33 % |
| `src/services/arenaService.js` | 92,64 % | 92,68 % | 94,11 % | 88,88 % |
| `src/utils/logica.js` | 100 % | 100 % | 100 % | 96,07 % |
| `src/utils/referenciaAmigo.js` | 87,5 % | 89,47 % | 80 % | 66,66 % |

Los porcentajes describen el código JavaScript instrumentado por la suite;
no representan una certificación de todos los requisitos del caso. El punto de entrada
main.jsx y el CSS se verifican mediante compilación y navegador, fuera de esta cobertura.

## Comprobación en navegador

Se recorrieron las seis vistas a **360, 768 y 1280 píxeles**, sin desborde horizontal
de la página ni errores de JavaScript. Las tablas anchas conservan desplazamiento
interno mediante `table-responsive`. Se comprobó el filtro y reinicio de ronda
en los tres tamaños y se inspeccionaron capturas de Inicio y Detalle.

Bootstrap se carga completo y aporta grilla, botones, tarjetas, controles,
tablas adaptables, insignias y avisos. La hoja bootstrap-tema.css conserva
la paleta Oro Competitivo y adapta los estados de foco, selección y botones.
