# HANDOFF — base compartida (EP1)

Documento de traspaso: describe la base que dejan listos los módulos de
**datos, utilidades y dominio** para que el resto del equipo construya las
vistas de formularios (Inscripción, Gestión de equipo, Perfil) y la simulación
de roles.

## Convención de código

- Un único namespace global: `window.AAM`. Cada archivo lo extiende (`AAM.datos`, `AAM.utiles`, `AAM.dominio`, …).
- Cada archivo va envuelto en una IIFE con `"use strict"`.
- Los `<script>` se cargan al final del `<body>`, en orden de dependencia:
  `datos.js` → `utiles.js` → `dominio.js` → `<script de la vista>.js`.
- Sin comentarios en el código: nombres y estructura se explican solos.
- Antes de insertar cualquier dato en `innerHTML` se pasa por `AAM.utiles.escaparHTML`.

## Modelo de datos (`js/datos.js`)

Todas las fechas son cadenas ISO `AAAA-MM-DD` (las de partidas incluyen hora: `AAAA-MM-DD HH:MM`).

| Colección | Campos |
|---|---|
| `juegos` | `id`, `nombre`, `modalidad`, `minIntegrantes`, `activo` |
| `jugadores` | `id`, `nombre`, `apodo`, `correo`, `pais`, `ingreso` |
| `equipos` | `id`, `nombre`, `juegoId`, `capitanId`, `activo`, `integrantes: [{ jugadorId, rol }]` |
| `torneos` | `id`, `nombre`, `juegoId`, `estado` (`abierto` \| `en_curso` \| `finalizado`), `modalidad`, `cupoMaximo`, `cierreInscripcion`, `fechaInicio`, `fechaFin`, `descripcion`, `premios: [{ posicion, descripcion }]` |
| `inscripciones` | `id`, `torneoId`, `tipo` (`equipo` \| `jugador`), `participanteId`, `estado` (`pendiente` \| `aceptada` \| `rechazada`), `motivo`, `fecha` |
| `partidas` | `id`, `torneoId`, `ronda`, `localId`, `visitanteId` (puede ser `"POR DEFINIR"`), `fechaHora`, `estado` (`programada` \| `en_curso` \| `finalizada` \| `cancelada`) |
| `resultados` | `id`, `partidaId`, `puntajeLocal`, `puntajeVisitante`, `ganadorId`, `validado` |
| `sanciones` | `id`, `participanteId` (id de jugador o de equipo), `motivo`, `inicio`, `fin` |

## API `AAM.datos`

Todos los métodos devuelven **copias**: mutar el resultado no afecta a los datos base.

| Método | Devuelve |
|---|---|
| `juegos()`, `jugadores()`, `equipos()`, `torneos()`, `inscripciones()`, `partidas()`, `resultados()`, `sanciones()` | la lista completa |
| `juego(id)`, `torneo(id)`, `equipo(id)`, `jugador(id)` | el elemento, o `null` |
| `inscripcionesDeTorneo(torneoId)` | inscripciones de ese torneo |
| `partidasDeTorneo(torneoId)` | partidas de ese torneo |
| `resultadoDePartida(partidaId)` | el resultado, o `null` |
| `sancionesDeParticipante(participanteId)` | sanciones de ese jugador o equipo |
| `equiposDeJugador(jugadorId)` | equipos donde figura ese jugador |

## API `AAM.utiles`

| Nombre | Uso |
|---|---|
| `$(sel, ctx)`, `$$(sel, ctx)` | `querySelector` / `querySelectorAll` (array) |
| `vaciar(nodo)` | elimina todos los hijos de un contenedor |
| `escaparHTML(valor)` | escapa `& < > " '` antes de `innerHTML` |
| `normalizarTexto(valor)` | minúsculas y sin tildes (para buscadores) |
| `aFecha(iso)` | `Date` a medianoche local |
| `formatearFecha(iso)` | `"05 de octubre de 2026"` (o `"Sin fecha"`) |
| `hoy()` | fecha actual como `"AAAA-MM-DD"` |
| `parametroURL(nombre)` | valor de un query param (`?id=tor-01`) |
| `ESTADOS_TORNEO`, `ESTADOS_PARTIDA`, `ESTADOS_INSCRIPCION` | diccionarios `{ texto, modificador, icono }` |
| `insigniaEstado(claseBase, info)` | `<span class="claseBase claseBase--modificador">icono texto</span>` |

## API `AAM.dominio` (funciones puras, sin DOM)

| Función | Qué hace |
|---|---|
| `cuposDisponibles(torneo, inscripciones)` | `cupoMaximo` menos inscripciones vigentes (pendiente + aceptada); nunca negativo |
| `inscripcionFueraDePlazo(torneo, fechaActual)` | `true` si `fechaActual` supera `cierreInscripcion` |
| `ordenarRanking(filas)` | ordena por `puntos` desc y desempata por `diferencia` desc (no muta) |
| `construirTablaPosiciones(torneo, equipos, partidas, resultados)` | arma la tabla de posiciones con los resultados validados y la devuelve ordenada |
| `ESTADOS_INSCRIPCION_VIGENTES` | `["pendiente", "aceptada"]` |

Fila de `construirTablaPosiciones`:
`{ participanteId, nombre, jugadas, ganadas, perdidas, aFavor, enContra, diferencia, puntos }`

## Pendiente para el resto del equipo

- **`js/validacion.js`** — motor de validación de formularios (obligatorios, correo, rangos, longitud de contraseña, coherencia entre campos, envío bloqueado con errores).
- **`js/dominio.js`** — ampliar con las reglas de inscripción: `tieneSancionActiva`, `equipoCompleto`, `yaInscrito`, `evaluarInscripcion`.
- **`js/sesion.js`** — simulación de rol (perfil de prueba en `localStorage`, visibilidad por rol).
- **Vistas** `inscripcion.html`, `equipo.html`, `perfil.html` y sus `js/*.js`.

## Clases CSS ya disponibles en `css/estilos.css`

`.tarjeta`, `.tarjeta__cuerpo`, `.tarjeta__nombre`, `.tarjeta__juego`, `.tarjeta__cupos`,
`.tarjeta__fecha`, `.tarjeta__estado` + `--abierto` / `--en-curso` / `--finalizado`,
`.grid-tarjetas`, `.lista-cierres` + `__item` / `__fecha`,
`.form-filtros` + `__campo` / `__campo--busqueda` / `__error`, `.estado-vacio`,
`.boton` + `--primario` / `--secundario`, `.visualmente-oculta`.
