import { solicitar } from "./api.js";

function enviar(ruta, opciones) {
  return solicitar(`auth/${ruta}`, { metodo: "POST", ...opciones });
}

async function registrar(datos) {
  try {
    return await enviar("register", { datos });
  } catch (error) {
    if (!error.campos?.email && /^(?:el )?(?:email|correo)\b.*\bya est[aá] registrad[oa]\b/i.test(error.message)) {
      error.campos = {
        ...error.campos,
        email: "Este correo ya está registrado. Inicia sesión o usa otro correo.",
      };
    }
    throw error;
  }
}

export const authApi = {
  registrar,
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
