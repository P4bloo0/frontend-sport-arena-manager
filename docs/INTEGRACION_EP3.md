# Integración y verificación de EP3

## Comunicación entre frontend y backend

React envía solicitudes JSON mediante el cliente compartido de `src/services/api.js`. El cliente agrega `/api/v1` a la URL del Gateway y envía el JWT de la sesión como `Authorization: Bearer …` cuando la operación lo requiere. El Gateway enruta las solicitudes a los microservicios Spring Boot. Las operaciones y los modelos de respuesta están disponibles en [Swagger del Gateway](http://localhost:8080/docs/swagger-ui.html) cuando el backend está levantado.

Acceso registra o autentica la cuenta. El frontend persiste el JWT en `localStorage`, con renovación programada antes de vencer y cierre sincronizado entre pestañas. Perfil consulta el usuario a través de `GET /usuarios/me`, cuyo ID se resuelve en el servidor a partir de la sesión. El guard de rutas controla la navegación de acuerdo con el rol. Spring Security valida el token y autoriza las operaciones protegidas.

| Flujo | Rutas a través del Gateway, bajo `/api/v1` |
|---|---|
| Sesión y perfil | `POST /auth/register`, `POST /auth/login`, `POST /auth/renovar`, `GET /usuarios/me`, `GET /notificaciones/me` |
| Catálogo y detalle | `GET /torneos`, `GET /juegos`, lecturas por torneo en `/inscripciones`, `/partidas`, `/resultados` y `/rankings`, `GET /torneos/{id}/premios` |
| Equipos | `GET /equipos/mis`, `POST /equipos`, `PUT /equipos/{id}`, listado, alta y baja de integrantes |
| Inscripción | `POST /inscripciones`, `GET /inscripciones/cupos/{id}` |
| Administración | Gestión de `/juegos`, `/torneos`, `/torneos/{id}/estado` y `/torneos/{id}/premios` |
| Organización | `PUT /inscripciones/{id}/estado`, cancelación de inscripciones, gestión de `/sanciones`, `/partidas`, y registro, edición, validación y anulación en `/resultados` |

El catálogo y el detalle usan los cupos que devuelve el servidor. El formulario ofrece únicamente los equipos activos del mismo juego que capitanea la cuenta. La API actual también acepta solicitudes de otros integrantes del equipo. El detalle muestra marcadores validados y consulta las posiciones calculadas por el backend.

## Preparación de cuentas de prueba

En una base local vacía, crea el administrador inicial con `tools/crear-admin.ps1` del backend y las variables de entorno generadas para esa instancia. Autentícate como administrador y usa `POST /api/v1/auth/admin/cuentas?rol=ORGANIZADOR` desde Swagger o un cliente HTTP, con el JWT de administrador y un cuerpo con `nombre`, `nickname`, `email` y `password`. Registra los jugadores desde **Acceso**. Usa cuentas y datos de prueba en las verificaciones que cambian información.

## Recorrido en navegador

| Cuenta | Pasos | Resultado esperado |
|---|---|---|
| Visitante | Navega desde Inicio o Torneos a **Ver detalle**. Abre el enlace **Inscribirme** de un torneo abierto. | Detalle muestra el torneo seleccionado y Acceso solicita iniciar sesión. Tras entrar, la aplicación vuelve al formulario del mismo torneo. |
| Jugador | Abre **Perfil**, recarga la página y verifica la sesión. En **Equipos**, crea un equipo y agrega integrantes. Inscribe al jugador en un torneo individual o a su equipo en uno por equipos. | Perfil muestra la cuenta y sus notificaciones. El creador figura como capitán y la inscripción comienza pendiente. El formulario consulta nuevamente los cupos. |
| Organizador | En **Organización**, confirma dos inscripciones. Cuando el torneo esté en curso, programa e inicia la partida, carga el marcador y valídalo. Finaliza la partida. Si hay un error, anula el resultado, corrígelo y vuelve a validarlo. | El detalle publica el marcador validado y lo retira al anularlo. La corrección queda pendiente hasta que se valida de nuevo y el ranking se recalcula. |
| Administrador | Crea un juego y un torneo. Configura un premio, abre inscripciones y, cuando existan participantes confirmados, inicia el torneo. Finaliza cuando corresponda. | La modalidad queda fija al abrir las inscripciones. Al finalizar, el premio aparece en el detalle y los ganadores reciben una notificación en Perfil. |
| Jugador | Abre directamente `/administracion.html` y `/organizacion.html`. Cierra sesión en otra pestaña. | Los paneles muestran acceso restringido. El cierre de sesión se refleja en ambas pestañas. |

## Verificación

- **Compilación del frontend:** `npm run build` completado correctamente.
- **Pruebas del frontend:** las 71 pruebas de Jasmine pasaron tanto en Edge como en jsdom. Las pruebas de pantalla simulan las respuestas HTTP y verifican los flujos por rol y los datos que el frontend envía a la API.
- **Verificación de la API:** 13 comprobaciones pasaron con un entorno Docker y MySQL temporal. Se inscribieron dos equipos, se verificó el bloqueo de modalidad, se corrigió un resultado anulado y se comprobó el ranking, el premio y la notificación del ganador.
- **Evidencia en navegador:** queda pendiente capturar el recorrido por rol para la entrega.

### Prueba HTTP del backend

En Windows, abre PowerShell en el repositorio del backend con Java 21 y Python 3 disponibles. Usa una instancia local nueva en modo Demo, sin un administrador previo. El modo Demo usa H2 en memoria y sus datos desaparecen al detener los servicios.

```powershell
.\mvnw.cmd verify
.\tools\iniciar-local.ps1 -Demo
python tools/smoke.py
```

El script espera a los servicios, crea cuentas y datos de prueba, comprueba respuestas HTTP y guarda su informe en `work/smoke-result.json`. Si ejecutas el smoke, usa una instancia Demo nueva para el recorrido manual que requiere crear el administrador inicial. Para detener la instancia de prueba, usa `.\tools\detener-local.ps1` desde el backend.

### Evidencia para la entrega

Durante el recorrido en navegador, registra los casos aprobados y los errores reales. Captura el inicio de sesión, la inscripción, los paneles por rol, el bloqueo de acceso de un jugador y el detalle antes y después de validar un resultado. Para el documento de integración, acompaña las capturas con el método, la ruta y el estado HTTP correspondientes. Guarda las capturas sin contraseñas, JWT ni secretos de configuración.
