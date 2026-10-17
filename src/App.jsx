// tu amigo comparte el perfil desde app; aquí también compartimos los datos
import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { perfiles } from "./data/datos.js";
import { arenaService } from "./services/arenaService.js";
import Cabecera from "./components/Cabecera.jsx";
import PiePagina from "./components/PiePagina.jsx";
import Inicio from "./pages/Inicio.jsx";
import Torneos from "./pages/Torneos.jsx";
import TorneoDetalle from "./pages/TorneoDetalle.jsx";
import Inscripcion from "./pages/Inscripcion.jsx";
import Equipo from "./pages/Equipo.jsx";
import Perfil from "./pages/Perfil.jsx";
export default function App() {
  const [db, setDb] = useState(null);
  const [error, setError] = useState("");
  const [perfilId, setPerfil] = useState(() => {
    try {
      const id = localStorage.getItem("arena_perfil_prueba");
      return perfiles.some((p) => p.id === id) ? id : "visitante";
    } catch {
      return "visitante";
    }
  });
  const ubicacion = useLocation();
  const perfil = perfiles.find((p) => p.id === perfilId) ?? perfiles[0];
  // al abrir cargamos la demo, al salir dejamos de esperar la respuesta
  useEffect(() => {
    let activo = true;
    arenaService
      .cargar()
      .then((datos) => {
        if (activo) setDb(datos);
      })
      .catch(() => {
        if (activo) setError("No se pudieron cargar los datos.");
      });
    return () => {
      activo = false;
    };
  }, []);
  // se guarda fuera del dibujo de la pantalla
  useEffect(() => {
    if (db) arenaService.guardar(db);
  }, [db]);
  useEffect(() => {
    try {
      localStorage.setItem("arena_perfil_prueba", perfilId);
    } catch {
      /* la elección sigue funcionando mientras no cierres */
    }
  }, [perfilId]);
  useEffect(() => {
    const nombres = {
      "/index.html": "Inicio",
      "/torneos.html": "Torneos",
      "/detalle-torneo.html": "Detalle de torneo",
      "/inscripcion.html": "Inscripción",
      "/equipos.html": "Equipos",
      "/perfil.html": "Perfil",
    };
    document.title =
      "eSports Arena Manager | " + (nombres[ubicacion.pathname] ?? "Inicio");
    window.scrollTo(0, 0);
  }, [ubicacion.pathname]);
  if (error)
    return (
      <main className="contenedor seccion">
        <p role="alert">{error}</p>
      </main>
    );
  if (!db)
    return (
      <main className="contenedor seccion">
        <p role="status">Cargando la arena…</p>
      </main>
    );
  const props = { db, perfil, alCambiar: setDb };
  return (
    <>
      <Cabecera perfil={perfilId} onPerfilChange={setPerfil} />
      <Routes>
        <Route path="/" element={<Navigate to="/index.html" replace />} />
        <Route path="/index.html" element={<Inicio db={db} />} />
        <Route path="/torneos.html" element={<Torneos db={db} />} />
        <Route
          path="/detalle-torneo.html"
          element={<TorneoDetalle db={db} />}
        />
        <Route
          path="/inscripcion.html"
          element={<Inscripcion key={perfilId + ubicacion.search} {...props} />}
        />
        <Route
          path="/equipos.html"
          element={<Equipo key={perfilId} {...props} />}
        />
        <Route
          path="/perfil.html"
          element={<Perfil key={perfilId} {...props} />}
        />
        <Route
          path="*"
          element={
            <main className="contenedor seccion">
              <h1>Página no encontrada</h1>
              <p>Usa el menú para volver.</p>
            </main>
          }
        />
      </Routes>
      <PiePagina
        alReiniciar={() => setDb(arenaService.reiniciar())}
        alActivarFechas={() => setDb(arenaService.activarFechas(db))}
      />
    </>
  );
}
