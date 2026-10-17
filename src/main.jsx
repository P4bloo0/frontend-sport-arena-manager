// acá parte la página, no hace falta tocarlo para cambiar textos
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/estilos.css";
import "./styles/ajustes.css";
import "./styles/centrado.css";
import "./styles/bootstrap-tema.css";
import App from "./App.jsx";
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
