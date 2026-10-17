// abre la dirección en chrome para ver si pasan las pruebas
const path = require("node:path");
const { Server, config } = require("karma");
console.log("Abre Chrome en http://127.0.0.1:9877 para ejecutar las pruebas.");
config
  .parseConfig(
    path.resolve(__dirname, "../karma.conf.cjs"),
    {
      browsers: [],
      singleRun: true,
      port: 9877,
      hostname: "127.0.0.1",
      listenAddress: "127.0.0.1",
    },
    { promiseConfig: true, throwErrors: true },
  )
  .then((configuracion) =>
    new Server(configuracion, (codigo) => {
      process.exitCode = codigo;
    }).start(),
  )
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
