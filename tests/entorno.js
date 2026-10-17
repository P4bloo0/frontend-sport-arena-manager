// esta ayuda es solo para las pruebas cuando no se usa un navegador real
if (typeof globalThis.MessageChannel === "undefined") {
  globalThis.MessageChannel = class MessageChannelPruebas {
    constructor() {
      this.port1 = { onmessage: null };
      this.port2 = {
        postMessage: (dato) =>
          setTimeout(() => this.port1.onmessage?.({ data: dato }), 0),
      };
    }
  };
}
