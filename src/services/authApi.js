import { solicitar } from "./api.js";

function enviar(ruta, opciones) {
  return solicitar(`auth/${ruta}`, { metodo: "POST", ...opciones });
}

export const authApi = {
  registrar: (datos) => enviar("register", { datos }),
  ingresar: (datos) => enviar("login", {
    datos,
    mensaje401: "El apodo o la contraseña no son correctos.",
  }),
  renovar: (token, signal) => enviar("renovar", {
    token,
    signal,
    mensaje401: "Tu sesión venció.",
  }),
};
