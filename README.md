# eSports Arena Manager

Proyecto frontend para Desarrollo FullStack II, correspondiente a la Evaluación Parcial 2. Permite consultar torneos de videojuegos, gestionar equipos e inscribir participantes.

Está desarrollado con React y Vite. Bootstrap aporta la grilla, botones, tarjetas, tablas adaptables, controles, insignias de estado y avisos; `src/styles/bootstrap-tema.css` adapta sus variables a la paleta del proyecto. Mantiene la fuente Arial y la paleta Oro Competitivo del diseño original.

## Integrantes

| Integrante | GitHub |
|---|---|
| Benjamín Villalón | BillaET |
| Pablo Salas | P4bloo0 |
| Bastián Figueroa | Por completar |

## Cómo ejecutarlo

Necesitas Node.js 22.12 o superior. Abre la carpeta que contiene `package.json` en VS Code y ejecuta:

```bash
npm install
npm run dev
```

Abre el localhost que indique la terminal, normalmente `http://localhost:5173`. Para detener la página, presiona Ctrl + C en la terminal.

## Funciones

- Inicio con torneos destacados, próximos cierres y video.
- Búsqueda de torneos y filtros por juego, estado y fechas.
- Detalle con participantes, calendario, llave, posiciones y premios. El selector de ronda filtra la llave y el componente `ListaPartidas`; al cambiar de torneo se muestran todas las rondas.
- Inscripción de jugadores o equipos con validación de modalidad, plazo, cupos, sanciones y duplicados.
- Creación y edición de equipos, capitán e integrantes.
- Perfil de prueba con datos del jugador e historial.

Los juegos disponibles son League of Legends, Valorant, Minecraft y Fortnite. Los datos se guardan en el navegador mediante localStorage. No hay backend ni inicio de sesión real; el selector de perfiles permite probar distintos casos.

## Probar una inscripción

Las fechas originales son de septiembre de 2026. Para probar el formulario después de esas fechas:

1. Pulsa **Activar fechas de prueba** en el pie de página.
2. Selecciona **Diego Navarro · Jugador** en el menú superior.
3. En Inscripción, elige **Arena Táctica De Peru** y **Lancer Fan Club**.
4. Completa el correo, acepta los requisitos y confirma. El seed es opcional; si lo usas, debe ser un entero de 1 a 16.

**Restablecer demostración** recupera los datos iniciales y descarta los cambios guardados en el navegador.

## Organización

```text
src/components/   menú, tarjetas, formularios y tablas
src/pages/        pantallas de la aplicación
src/data/         datos de ejemplo
src/services/     carga y guardado local
src/utils/        validaciones y cálculos
src/styles/       estilos y distribución
public/           imágenes y video
tests/            pruebas automáticas
docs/             requisitos y resumen de pruebas
```

Para cambiar textos de portada, edita `src/pages/Inicio.jsx`. Los colores están en `src/styles/estilos.css` y los ajustes de centrado en `src/styles/centrado.css`.

Los fondos de las tarjetas están en `public/imagenes/juegos/`: `lol.jpg`, `valorant.jpg`, `Minecraft.jpg` y `fortnite.jpg`. La relación entre imagen y juego está en `src/components/TarjetaTorneo.jsx`.

Si cambias `src/data/datos.js`, pulsa **Restablecer demostración** para dejar de usar la copia anterior del navegador.

## Pruebas

Se utilizan Jasmine y Karma para comprobar la lógica y el comportamiento de los componentes.

```bash
npm run build       # comprueba la compilación
npm test            # ejecuta las pruebas y genera cobertura
npm run test:manual # alternativa si no se encuentra Chrome
```



