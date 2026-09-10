# eSports Arena Manager

Proyecto frontend para la asignatura Desarrollo FullStack II.

La idea del proyecto es tener una página donde se puedan ver torneos de videojuegos, revisar sus detalles, crear equipos e inscribirlos en competencias. Por ahora funciona con datos simulados en JavaScript, ya que corresponde a la primera entrega del proyecto.

## Integrantes

| Integrante | Usuario GitHub | Aporte principal |
|---|---|---|
| Benjamín Villalón | BillaET | Vista detalle de torneo, llave, tabla de posiciones y documentación |
| Pablo Salas | P4bloo0 | Inicio, listado de torneos y estilos |
| Bastián Figueroa | ... | Formularios, validaciones y perfiles de prueba |

## Tecnologías usadas

- HTML5
- CSS3
- JavaScript
- Datos simulados con arreglos JavaScript

No se usa framework ni backend en esta etapa.

## Cómo ejecutar el proyecto

Se puede abrir el archivo `index.html` directamente en el navegador.

También se puede usar Live Server en Visual Studio Code.

## Vistas del proyecto

| Vista | Archivo | Descripción |
|---|---|---|
| Inicio | `index.html` | Muestra torneos destacados, próximos cierres de inscripción y un video. |
| Torneos | `torneos.html` | Permite buscar torneos por nombre y filtrarlos por juego, estado o fecha. |
| Detalle de torneo | `detalle-torneo.html` | Muestra datos del torneo, participantes, llave, calendario, posiciones y premios. |
| Inscripción | `inscripcion.html` | Permite inscribir a un jugador o equipo y valida cupo, plazo, sanciones y duplicidad. |
| Equipos | `equipos.html` | Permite crear equipos, elegir capitán y agregar integrantes. |
| Perfil | `perfil.html` | Muestra datos del jugador, equipos, historial, estadísticas y sanciones. |

## Perfiles de prueba

Durante esta entrega los perfiles son simulados. Se pueden cambiar desde el selector que aparece en la parte superior de la página.

- Visitante: puede revisar torneos, detalles, posiciones y llaves.
- Jugador habilitado: puede probar una inscripción válida.
- Jugador con equipo incompleto: permite comprobar el bloqueo por falta de integrantes.
- Jugador sancionado: permite comprobar el mensaje de sanción vigente.
- Organizador: representa a quien administra partidas y resultados.
- Administrador: representa a quien configura torneos y juegos.

Estos perfiles se usan para probar distintos casos sin necesidad de iniciar sesión de verdad. Más adelante, en la integración con backend, los roles se obtendrán desde un token JWT.

## Función de la llave

La llave representa el avance del torneo por rondas.

Su función es mostrar quién juega contra quién, en qué ronda se encuentran, el horario de cada partida y el resultado cuando ya fue validado. Cuando una partida todavía no tiene rival asignado, se debe mostrar “Participante por definir”.

Cuando se valide un resultado, el ganador debe avanzar a la siguiente ronda. Por eso la llave no es solo una tabla visual: sirve para ordenar los cruces y mostrar el camino hasta la final.

## Validaciones implementadas

En los formularios se revisa lo siguiente:

- Campos obligatorios.
- Formato de correo.
- Contraseña de mínimo ocho caracteres, con letras y números.
- Confirmación de contraseña.
- Nombre de equipo sin duplicados.
- Capitán obligatorio.
- Jugadores sin repetir dentro de un equipo.
- Apodo sin espacios y con largo permitido.
- Fecha inicial no mayor que la fecha final.
- Inscripción dentro del plazo.
- Cupos disponibles.
- Equipo completo según el juego.
- Sanciones vigentes.
- Inscripción duplicada.

## Estructura de carpetas

```text
frontend-sport-arena-manager/
├── assets/
│   └── video/
│       └── esports.mp4
├── css/
│   └── estilos.css
├── js/
│   ├── app.js
│   ├── clases.js
│   ├── datos.js
│   ├── datos-torneo.js
│   ├── detalle.js
│   ├── equipos.js
│   ├── inscripcion.js
│   ├── perfil.js
│   ├── sesion.js
│   ├── ui.js
│   ├── utilidades.js
│   └── validacion.js
├── detalle-torneo.html
├── equipos.html
├── index.html
├── inscripcion.html
├── perfil.html
├── torneos.html
└── README.md
```

## Paleta de colores

Se utilizó la paleta “Oro competitivo” definida para el caso.

- Fondo: `#010A13`
- Superficie: `#0A1428`
- Primario: `#C89B3C`
- Acento: `#0AC8B9`
- Texto: `#F0E6D2`
- Error: `#E4572E`

Los colores están definidos como variables en `css/estilos.css`, para que sea más fácil mantener el mismo diseño en todas las vistas.

## Estado actual

El proyecto corresponde a EP1. La información todavía está simulada y no se conecta a una base de datos ni a una API.

En las siguientes entregas se espera migrar el proyecto a React, agregar pruebas unitarias e integrar el frontend con los microservicios mediante API REST y JWT.
