# eSports Arena Manager — Frontend

Capa de presentación del caso semestral **eSports Arena Manager** para
**Desarrollo FullStack II (DSY1104)**.

eSports Arena Manager es una plataforma para organizar torneos de videojuegos
competitivos: administra juegos habilitados, jugadores, equipos, torneos,
inscripciones, partidas, resultados, rankings, sanciones y premios.

Este repositorio corresponde a la **Evaluación Parcial 1 (EP1)**: base web
construida con HTML5, CSS3 y JavaScript, sin framework y sin backend. Los datos
provienen de estructuras simuladas en JavaScript y se renderizan mediante
manipulación del DOM.

## Integrantes

| Integrante | Usuario GitHub | Aporte principal |
|---|---|---|
| Benjamín Villalón | _(completar)_ | Vista Detalle de torneo, documentación e infraestructura del repositorio |
| _(completar)_ | P4bloo0 | Vista Inicio, Listado de torneos y hoja de estilos |
| _(completar)_ | _(completar)_ | Formularios (Inscripción, Gestión de equipo, Perfil), validación y simulación de roles |

## Requisitos previos

- Un navegador moderno (Chrome, Edge o Firefox actualizados).
- Opcional, para servir el sitio por HTTP: Python 3 o la extensión **Live Server** de VS Code.

## Cómo ejecutar

**Opción A — doble clic:** abrir `index.html`. Funciona con `file://` porque no se usan módulos ES ni `fetch`.

**Opción B — servidor local:**

```bash
python -m http.server 8000
```

y abrir `http://localhost:8000`.

## Vistas (alcance de EP1)

| Vista | Archivo | Estado | Descripción |
|---|---|---|---|
| Inicio | `index.html` | Implementada | Torneos destacados, próximos cierres de inscripción y video. |
| Listado de torneos | `torneos.html` | Implementada | Exploración con filtros (juego, estado, rango de fechas) y buscador. |
| Detalle de torneo | `detalle-torneo.html` | En desarrollo | Datos generales, participantes, llave, calendario, tabla de posiciones y premios. |
| Inscripción a torneo | `inscripcion.html` | En desarrollo | Formulario principal del dominio, con validación de plazo, cupo, duplicidad y sanciones. |
| Gestión de equipo | `equipos.html` | En desarrollo | Creación de equipo y administración de integrantes. |
| Perfil de jugador | `perfil.html` | En desarrollo | Ficha competitiva: equipos, historial, estadísticas y sanciones. |

## Estructura de carpetas

```
frontend-sport-arena-manager/
├── index.html              Vista Inicio
├── torneos.html            Vista Listado de torneos
├── assets/
│   └── video/esports.mp4   Video de la sección "Momentos que hacen historia"
├── css/
│   └── estilos.css         Hoja de estilos externa y única (paleta "Oro competitivo")
├── js/
│   ├── utilidades.js       Utilidades compartidas (fechas, normalización de texto)
│   ├── datos.js            Datos simulados de torneos
│   ├── clases.js           Clase Torneo (cálculos del torneo)
│   ├── ui.js               Construcción de tarjetas y listas
│   └── app.js              Arranque y lógica por página (enrutado con data-pagina)
├── .env.example            Plantilla de variables de entorno (API para EP3)
├── .gitignore
└── README.md
```

Las vistas Inscripción, Gestión de equipo y Perfil añadirán sus propios
`.html` y `.js` a medida que se desarrollen.

## Convención de código

- Un único espacio de nombres global: `window.ARENA`. Cada archivo lo extiende.
- El HTML de cada página lleva `<body data-pagina="...">` y `app.js` decide qué
  lógica ejecutar según ese valor.
- Los `<script>` se cargan al final del `<body>`, en orden de dependencia:
  `utilidades.js` → `datos.js` → `clases.js` → `ui.js` → `app.js`.

## Paleta de color

Paleta **3 · Oro competitivo** del caso, declarada como variables CSS en
`css/estilos.css`:

| Variable | Valor |
|---|---|
| `--color-fondo` | `#010a13` |
| `--color-superficie` | `#0a1428` |
| `--color-primario` | `#c89b3c` |
| `--color-acento` | `#0ac8b9` |
| `--color-texto` | `#f0e6d2` |
| `--color-error` | `#e4572e` |

## Configuración sensible

El repositorio no contiene credenciales, tokens ni claves. Las URL de la API se
configuran por variable de entorno; ver `.env.example`. El archivo `.env` real no
se versiona.
