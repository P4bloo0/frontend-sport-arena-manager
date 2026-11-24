# eSports Arena Manager

Frontend de la Evaluación Parcial 3 de Desarrollo FullStack II. Usa React, Vite y Bootstrap. El catálogo, las cuentas y las operaciones de los paneles consumen la API REST del [backend de Arena](https://github.com/P4bloo0/esports-arena-manager).

## Integrantes

| Integrante | GitHub |
|---|---|
| Benjamín Villalón | BillaET |
| Pablo Salas | P4bloo0 |
| Bastián Figueroa | Por completar |

## Ejecución local

1. Levanta el backend y su base de datos siguiendo las instrucciones de su repositorio. Espera a que el Gateway responda en [la ruta de torneos](http://localhost:8080/api/v1/torneos). Un arreglo vacío también indica que la consulta funciona.
2. En la raíz del frontend, instala las dependencias y levanta Vite. Usa Node.js 22.12 o superior.

   ```bash
   npm ci
   npm run dev
   ```

3. Abre la dirección que muestre Vite, normalmente [localhost:5173](http://localhost:5173). Para detenerlo, presiona Ctrl+C.

El frontend usa el Gateway en `http://localhost:8080`. Para cambiarlo, copia `.env.example` a `.env.local`, modifica `VITE_API_URL` y reinicia Vite. El valor contiene la URL base sin el prefijo `/api/v1`. Si cambia el origen del frontend, inclúyelo en `CORS_ORIGINS` del Gateway y reinícialo. Las variables `VITE_*` son públicas en el navegador.

## Acceso por rol

| Acceso | Funciones |
|---|---|
| Visitante | Inicio, catálogo, detalle de torneo, login y registro público. |
| Jugador | Perfil con equipos, historial, resultados, sanciones y notificaciones. Creación y gestión de equipos cuando es capitán e inscripción con verificación previa de sanciones. |
| Organizador | Panel Organización con inscripciones, sanciones, partidas y resultados. |
| Administrador | Panel Administración con juegos, torneos y premios, además del panel Organización. |

El registro público crea cuentas de jugador. Para preparar cuentas privilegiadas, consulta [la guía de integración](docs/INTEGRACION_EP3.md).

**Accesos rápidos** en la esquina inferior derecha permite entrar como Admin, Leo, Camila o Felipe. Si ejecutas `npm run dev` en `localhost`, Vite inicia sesión con el backend local usando las claves que prepara `node tools/preparar-perfiles-demo.mjs` desde el repositorio del backend. Las claves se leen desde el archivo local y el navegador recibe el JWT. En la versión compilada, el recuadro abre el formulario con el apodo seleccionado y solicita la contraseña.

## Pruebas

```bash
npm run build
npm test
npm run test:dom
npm run test:manual
```

`npm test` usa Jasmine y Karma con Chrome Headless y genera cobertura en `coverage/`. `test:dom` y `test:manual` son alternativas para cuando el navegador no está disponible o se necesita iniciar la suite manualmente. La [guía de integración](docs/INTEGRACION_EP3.md) incluye un recorrido por rol y los resultados verificados para EP3.

Los documentos [ERS_EP2](docs/ERS_EP2.md) y [COBERTURA_TESTING](docs/COBERTURA_TESTING.md) registran la versión de demostración de EP2.
