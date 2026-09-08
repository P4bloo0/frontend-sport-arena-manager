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
| Benjamín Villalón | _(completar)_ | Datos simulados, utilidades, vista Inicio (dinámica), Listado y Detalle de torneo |
| _(completar)_ | P4bloo0 | Vista Inicio (maquetado) y hoja de estilos |
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

| Vista | Archivo | Descripción |
|---|---|---|
| Inicio | `index.html` | Torneos destacados, próximos cierres de inscripción y video embebido. |
| Listado de torneos | `listado.html` | Exploración con filtros (juego, estado, rango de fechas) y buscador. |
| Detalle de torneo | `detalle-torneo.html` | Datos generales, participantes, llave, calendario, tabla de posiciones y premios. |
| Inscripción a torneo | `inscripcion.html` | Formulario principal del dominio, con validación de plazo, cupo, duplicidad y sanciones. |
| Gestión de equipo | `equipo.html` | Creación de equipo y administración de integrantes. |
| Perfil de jugador | `perfil.html` | Ficha competitiva: equipos, historial, estadísticas y sanciones. |

## Estructura de carpetas

```
frontend-sport-arena-manager/
├── index.html              Vista Inicio
├── listado.html            Vista Listado de torneos
├── detalle-torneo.html     Vista Detalle de torneo
├── inscripcion.html        Vista Inscripción a torneo
├── equipo.html             Vista Gestión de equipo
├── perfil.html             Vista Perfil de jugador
├── css/
│   └── estilos.css         Hoja de estilos externa y única (paleta "Oro competitivo")
├── js/
│   ├── datos.js            Datos simulados del dominio y API de consulta
│   ├── utiles.js           Utilidades compartidas (DOM, escape, fechas, estados)
│   ├── main.js             Lógica de la vista Inicio
│   ├── listado.js          Lógica de la vista Listado
│   ├── detalle-torneo.js   Lógica de la vista Detalle
│   ├── validacion.js       Motor de validación de formularios
│   ├── dominio.js          Reglas de negocio
│   ├── inscripcion.js      Lógica de la vista Inscripción
│   ├── equipo.js           Lógica de la vista Gestión de equipo
│   ├── perfil.js           Lógica de la vista Perfil
│   └── sesion.js           Simulación de rol (perfil de prueba)
├── HANDOFF.md              Modelo de datos y API de utilidades para el equipo
├── .env.example            Plantilla de variables de entorno (API para EP3)
├── .gitignore
└── README.md
```

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
