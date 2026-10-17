# Especificación de requisitos — eSports Arena Manager

Versión 3.0, 16 de octubre de 2026. Propuesta personalizada para Evaluación Parcial 2, conservando el diseño del repositorio P4bloo0.

## 1. Objetivo y alcance

Centralizar la consulta de torneos competitivos, sus participantes, llaves, calendario, posiciones y premios. Permitir practicar inscripción, gestión de equipos y edición de perfil con datos simulados. Migrar las seis pantallas de EP1 a React y verificar sus reglas con Jasmine y Karma.

Se utiliza React/Vite, Bootstrap para distribución adaptable y CSS propio. No se integra backend, base de datos remota, JWT ni acceso real. Los resultados y rondas son datos preparados; no se publica un resultado ni se genera una llave desde un panel organizador.

## 2. Actores y permisos simulados

| actor | alcance |
|---|---|
| Visitante | Consulta las seis vistas. No guarda inscripción, equipo o perfil. |
| Jugador | Puede practicar inscripción y gestionar equipos con el selector de capitán de EP1. Solo modifica su propia ficha al actuar como jugador. |
| Organizador y administrador | Perfiles de prueba que pueden practicar las operaciones locales; no tienen paneles propios ni acceso seguro de servidor. |

El selector conserva los seis perfiles de tu repositorio. No se exige capitán para inscribir en esta simulación: el formulario permite seleccionar participantes, como la base de EP1. No se presenta este comportamiento como autorización real.

## 3. Requisitos funcionales

| ID | requisito | aceptación |
|---|---|---|
| RF01 | Inicio con portada, destacados, próximos cierres y video. | Conserva contenido y estilo base; enlaces abren vistas React. |
| RF02 | Catálogo con búsqueda, juego, estado y rango de fechas. | Filtra sobre el nombre y cierre; rango invertido muestra error; limpiar recupera resultados. |
| RF03 | Selección y detalle de torneo. | Muestra ficha, participantes, llave, calendario, ranking y premios; ID inexistente muestra aviso. La ronda visible se conserva con useState y filtra LlaveTorneo y ListaPartidas; cambiar de torneo reinicia la selección. |
| RF04 | Inscripción controlada. | Exige torneo/participante válidos, correo y aceptación; seed opcional entero entre 1 y 16; confirmación muestra todo lo guardado. |
| RF05 | Bloqueos de inscripción. | Rechaza visitante, estado cerrado, plazo vencido, cupo lleno, duplicidad, sanción, equipo inactivo, juego diferente y equipo incompleto. La modalidad solo/individual/1 vs 1 exige jugador individual; las demás modalidades exigen equipo. La revisión se realiza también al guardar, no solo al habilitar el botón. |
| RF06 | Actualizar cupos. | Pendiente/Aceptada ocupan; Rechazada no. Cupos no negativos e iguales entre tarjetas, detalle y formulario. |
| RF07 | Crear/editar equipo. | Nombre de 3–40 caracteres sin duplicados, juego y capitán existentes. Se puede elegir capitán; se agrega automáticamente y no se puede quitar sin cambiarlo antes. Al editar se conserva la alineación actual de la base compartida, aunque se haya agregado o quitado un integrante después de abrir el formulario. |
| RF08 | Validar clave de demostración. | Crear exige ocho caracteres, letra, número y confirmación igual. Editar permite ambas vacías. Se descartan, sin iniciar sesión ni almacenarlas. |
| RF09 | Gestionar integrantes. | Agrega jugadores existentes con rol, impide duplicados y permite quitar integrantes que no sean el capitán. |
| RF10 | Perfil. | Consulta ficha, equipos, resultados agregados, historial y sanciones; valida apodo 3–16 sin espacios y correo. Respeta edición propia para Jugador. |
| RF11 | Persistencia y recuperación. | Conserva datos/perfil en localStorage cuando está disponible. Datos dañados recuperan base; almacenamiento bloqueado permite continuar en memoria. |
| RF12 | Ayudas de demostración. | Activar fechas cambia solo cierres abiertos a siete días; restablecer recupera datos y fechas base. |
| RF13 | Rutas heredadas. | Mantiene las seis direcciones .html y el parámetro id del torneo mediante navegación interna. |

## 4. Reglas y datos

Torneos conservan nombre, juego, modalidad, estado, cupo máximo, cierre y destacado. Juegos indican mínimo de integrantes. Equipos relacionan capitán e integrantes con IDs de jugadores. Inscripciones guardan torneoId y equipoId o jugadorId, estado, fecha, correo y seed. Partidas se relacionan con resultados por partidaId; las sanciones incluyen tipo de participante, ID, inicio, fin y motivo. Premios relacionan torneo y posición.

Los resultados originales de Minecraft están asociados a equipos aun cuando el rótulo del torneo indique solo; se conserva esa relación histórica. Las nuevas inscripciones individuales se identifican mediante jugadorId. No se mezclan esos IDs al detectar duplicidad o sanción.

Fecha de negocio: día de America/Santiago. El cierre acepta el mismo día y bloquea el posterior; las sanciones incluyen ambos extremos del período. Ranking cuenta solo resultados validados, con victoria tres y derrota cero, y desempata por diferencia. Los premios por posición se muestran al finalizar. El historial y estadísticas representan los equipos actuales, sin simular alineaciones históricas.

Los valores ocupados de la base no coinciden con su lista de inscripciones. Se utiliza la lista vigente como fuente única para los cupos. No se inventan participantes para completar contadores fijos.

## 5. Requisitos no funcionales

| ID | requisito | evidencia |
|---|---|---|
| RNF01 | Mantener identidad visual. | CSS base, Arial, paleta Oro Competitivo, portada original y logo de rombo. |
| RNF02 | Adaptarse a celular y escritorio. | Grilla Bootstrap en los paneles y componentes Bootstrap para botones, tarjetas, controles, tablas, estados y avisos. Tema Oro Competitivo en bootstrap-tema.css; verificar a 360/768/1280. |
| RNF03 | Accesibilidad básica. | Encabezados, labels, alt, controles nativos, mensajes asociados y tablas con títulos de columna. No es certificación completa. |
| RNF04 | Facilitar aprendizaje y mantenimiento. | Componentes y reglas separados; comentarios cortos en minúsculas y guía por archivo. |
| RNF05 | Verificar comportamiento. | 58 pruebas, incluyendo diez casos principales, mocks, espías y cobertura del código propio. |
| RNF06 | Ejecución local. | npm install y npm run dev, Node 22.12 o superior; Chrome para la suite normal. |

## 6. Organización

App comparte datos y perfil mediante propiedades. useState conserva valores y useEffect sincroniza carga, almacenamiento y título. components contiene cabecera, pie, tarjetas, campos, tablas y grilla. pages reúne las seis vistas. utils contiene reglas y ayudas adaptadas de develo. services realiza validación y devuelve datos actualizados sin modificar el objeto anterior. data conserva los ejemplos originales. tests ejecuta reglas e interacciones.

Esta estructura adopta la migración de develo sin copiar su presentación ni dejar páginas temporales. Las reglas se separan de la pantalla conforme al enfoque docente de funciones comprobables.

## 7. Flujos de aceptación

1. Visitante consulta Inicio, filtra torneos y entra al detalle de Copa Del Vacio con resultados/premios.
2. Activa fechas y selecciona Diego; inscribe Lancer Fan Club en Arena Táctica De Peru, recibe confirmación, ve cupo actualizado y no puede duplicar.
3. Selecciona equipo incompleto, otro juego o torneo cerrado y obtiene bloqueo.
4. Crea equipo, elige capitán y prueba claves distintas antes de corregirlas; agrega/quita un integrante.
5. Edita su perfil, prueba correo inválido, corrige y conserva el cambio al navegar.
6. Restablece y recupera la base original.

## 8. Pruebas y entrega

Las instrucciones, los casos comprobados y los resultados registrados están en [Pruebas y cobertura](COBERTURA_TESTING.md). El informe HTML actualizado se genera localmente con npm test, en coverage/index.html.

La entrega incluye código, recursos, package-lock.json, requisitos y resumen de pruebas. Los datos académicos y los aportes deben corresponder al trabajo real de los integrantes.
