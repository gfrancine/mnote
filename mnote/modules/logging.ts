import { Mnote /* , Module */ } from "../common/types";

export class LoggingModule /* implements Module */ {
  constructor(_app: Mnote) {}
  // todo: disable in production

  info(...messages: unknown[]) {
    console.log("[INFO]", ...messages);
  }

  err(...messages: unknown[]) {
    console.error("[ERR]", ...messages);
  }
}
