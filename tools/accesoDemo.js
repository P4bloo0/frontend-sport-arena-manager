import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { perfilesPredefinidos } from "../src/data/perfilesPredefinidos.js";

const ruta = "/__arena/acceso-demo";
const hostsLocales = new Set(["localhost", "127.0.0.1", "::1"]);
const direccionesLocales = new Set(["::1", "127.0.0.1", "::ffff:127.0.0.1"]);

function responder(res, codigo, cuerpo) {
  res.writeHead(codigo, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(cuerpo));
}

export function accesoDemo() {
  return {
    name: "arena-acceso-demo",
    apply: "serve",
    configureServer(servidor) {
      if (!hostsLocales.has(servidor.config.server.host)) return;

      servidor.middlewares.use(async (req, res, next) => {
        if (req.url !== ruta) return next();

        const host = req.headers.host;
        const origen = `http://${host}`;
        if (
          req.method !== "POST" ||
          !direccionesLocales.has(req.socket.remoteAddress) ||
          !/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host ?? "") ||
          req.headers.origin !== origen ||
          req.headers["sec-fetch-site"] !== "same-origin" ||
          !req.headers["content-type"]?.startsWith("application/json")
        ) {
          responder(res, 403, { mensaje: "Este acceso rápido se usa desde la página local de Arena." });
          return;
        }

        let apodo;
        try {
          let cuerpo = "";
          for await (const fragmento of req) {
            cuerpo += fragmento;
            if (cuerpo.length > 256) {
              responder(res, 400, { mensaje: "Selecciona un perfil de demostración válido." });
              return;
            }
          }
          ({ apodo } = JSON.parse(cuerpo));
        } catch {
          // El perfil se valida de la misma forma si el cuerpo no se puede leer.
        }
        if (!perfilesPredefinidos.some((perfil) => perfil.apodo === apodo)) {
          responder(res, 400, { mensaje: "Selecciona un perfil de demostración válido." });
          return;
        }

        let password;
        try {
          const directorio = join(process.env.LOCALAPPDATA ?? join(homedir(), ".local", "state"), "eSportsArena");
          const claves = JSON.parse(await readFile(join(directorio, "perfiles-demo.json"), "utf8"));
          password = claves?.[apodo];
        } catch {
          // El archivo solo existe si se prepararon las cuentas desde el backend local.
        }
        if (typeof password !== "string" || !password) {
          responder(res, 404, { mensaje: "Este perfil aún no está preparado en el backend local." });
          return;
        }

        try {
          const sesion = await fetch("http://127.0.0.1:8080/api/v1/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nickname: apodo, password }),
            signal: AbortSignal.timeout(7000),
          });
          if (!sesion.ok) {
            responder(res, sesion.status, { mensaje: "El backend no pudo iniciar sesión con este perfil." });
            return;
          }
          const { token } = await sesion.json();
          if (typeof token !== "string" || !token) throw new Error();
          responder(res, 200, { token });
        } catch {
          responder(res, 502, { mensaje: "No se pudo conectar con el acceso del backend local." });
        }
      });
    },
  };
}
