import { Mnote } from "..";

// When logging, have a prefix with a colon before the message
// e.g. log.info("editors: file opened")
// if it's coming from a module, use the module name

export class LogModule {
  private enabled = true;

  constructor(app: Mnote) {
    if (app.options.isProduction) {
      this.enabled = false;
      const noop = () => {};
      this.info = noop;
      this.err = noop;
      this.warn = noop;
    }
  }

  info(...messages: unknown[]) {
    if (this.enabled) {
      console.log("[INFO]", ...messages);
    }
  }

  err(...messages: unknown[]) {
    console.error("[ERR]", ...messages);
  }

  warn(...messages: unknown[]) {
    console.warn("[WARN]", ...messages);
  }
}
