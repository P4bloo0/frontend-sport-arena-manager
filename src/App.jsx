import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Cabecera from "./components/Cabecera.jsx";
import PiePagina from "./components/PiePagina.jsx";
import Inicio from "./pages/Inicio.jsx";
import Torneos from "./pages/Torneos.jsx";
import TorneoDetalle from "./pages/TorneoDetalle.jsx";
import Inscripcion from "./pages/Inscripcion.jsx";
import Equipo from "./pages/Equipo.jsx";
import PerfilCuenta from "./pages/PerfilCuenta.jsx";
import RutaProtegida from "./components/RutaProtegida.jsx";
import Acceso from "./pages/Acceso.jsx";
import { useSesion } from "./hooks/useSesion.js";
export default function App() {
  const { sesion, avisoSesion, iniciarSesion, cerrarSesion } = useSesion();
  const ubicacion = useLocation();
  useEffect(() => {
    const nombres = {
      "/index.html": "Inicio",
      "/torneos.html": "Torneos",
      "/detalle-torneo.html": "Detalle de torneo",
      "/inscripcion.html": "Inscripción",
      "/equipos.html": "Equipos",
      "/perfil.html": "Perfil",
      "/acceso.html": "Acceso",
    };
    document.title =
      "eSports Arena Manager | " + (nombres[ubicacion.pathname] ?? "Inicio");
    window.scrollTo(0, 0);
  }, [ubicacion.pathname]);
  return (
    <>
      <Cabecera sesion={sesion} />
      <Routes>
        <Route path="/" element={<Navigate to="/index.html" replace />} />
        <Route path="/index.html" element={<Inicio />} />
        <Route path="/torneos.html" element={<Torneos />} />
        <Route
          path="/acceso.html"
          element={
            <Acceso
              sesion={sesion}
              avisoSesion={avisoSesion}
              iniciarSesion={iniciarSesion}
              cerrarSesion={cerrarSesion}
            />
          }
        />
        <Route
          path="/detalle-torneo.html"
          element={<TorneoDetalle />}
        />
        <Route
          path="/inscripcion.html"
          element={
            <RutaProtegida sesion={sesion}>
              {sesion && <Inscripcion key={sesion.userId ?? sesion.nickname} sesion={sesion} />}
            </RutaProtegida>
          }
        />
        <Route
          path="/equipos.html"
          element={
            <RutaProtegida sesion={sesion}>
              {sesion && <Equipo key={sesion.userId ?? sesion.nickname} sesion={sesion} />}
            </RutaProtegida>
          }
        />
        <Route
          path="/perfil.html"
          element={
            <RutaProtegida sesion={sesion}>
              {sesion && <PerfilCuenta key={sesion.userId ?? sesion.nickname} token={sesion.token} />}
            </RutaProtegida>
          }
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
      <PiePagina />
    </>
  );
}
