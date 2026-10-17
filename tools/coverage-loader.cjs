// esto marca qué partes del código pasaron por las pruebas
const { createInstrumenter } = require("istanbul-lib-instrument");
module.exports = function (codigo, mapa) {
  const terminar = this.async();
  // no contamos las pruebas como si fueran parte de la página
  if (
    /\.spec\.[jt]sx?$/.test(this.resourcePath) ||
    this.resourcePath.replace(/\\/g, "/").includes("/tests/")
  ) {
    terminar(null, codigo, mapa);
    return;
  }
  const instrumento = createInstrumenter({
    esModules: true,
    produceSourceMap: true,
  });
  instrumento.instrument(
    codigo,
    this.resourcePath,
    (error, resultado) => {
      terminar(error, resultado, instrumento.lastSourceMap());
    },
    mapa,
  );
};
