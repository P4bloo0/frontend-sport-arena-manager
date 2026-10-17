// jasmine hace las comprobaciones y karma las abre en el navegador
const path = require("node:path");
module.exports = (config) =>
  config.set({
    frameworks: ["jasmine", "webpack"],
    files: [
      { pattern: "tests/entrada.spec.jsx", watched: true },
      {
        pattern: "public/assets/video/*.mp4",
        included: false,
        served: true,
        watched: false,
      },
    ],
    proxies: { "/assets/": "/base/public/assets/" },
    preprocessors: { "tests/entrada.spec.jsx": ["webpack"] },
    webpack: {
      mode: "development",
      devtool: "inline-source-map",
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: [
              { loader: path.resolve(__dirname, "tools/coverage-loader.cjs") },
              {
                loader: "babel-loader",
                options: {
                  presets: [
                    ["@babel/preset-env", { targets: { chrome: "120" } }],
                    ["@babel/preset-react", { runtime: "automatic" }],
                  ],
                },
              },
            ],
          },
        ],
      },
    },
    // estos archivos te muestran qué partes sí pasaron por las pruebas
    reporters: ["progress", "coverage"],
    coverageReporter: {
      dir: "coverage",
      subdir: ".",
      reporters: [
        { type: "html" },
        { type: "text-summary" },
        { type: "lcovonly" },
        { type: "json-summary" },
      ],
    },
    browsers: ["ChromeHeadless"],
    singleRun: true,
    concurrency: 1,
    client: { jasmine: { random: true } },
    browserNoActivityTimeout: 60000,
  });
