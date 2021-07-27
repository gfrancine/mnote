import { Mnote } from "../common/types";
import { FSModule } from "./fs";
import { PromptsModule } from "./prompts";
import { TabContext } from "./types";

// TODO
export class TabManager {
  ctx: TabContext;
  app: Mnote;

  fs: FSModule;
  prompts: PromptsModule;

  constructor(app: Mnote, ctx: TabContext) {
    this.ctx = ctx;
    this.app = app;

    this.fs = app.modules.fs as FSModule;
    this.prompts = app.modules.prompts as PromptsModule;
  }

  private makeContext() {}

  async save(): Promise<boolean> {}

  async saveAs(): Promise<boolean> {}

  async close(): Promise<boolean> {}
}
