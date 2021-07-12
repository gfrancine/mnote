import { Mnote /* , Module */ } from "../common/types";

export class LoggingModule /* implements Module */ {
  enabled = true;

  constructor(app: Mnote) {
    if (app.options.isProduction) {
      this.enabled = false;
      this.info = () => {};
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