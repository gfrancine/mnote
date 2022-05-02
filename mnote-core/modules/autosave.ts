import { createIcon } from "mnote-components/vanilla/icons";
import { Mnote } from "../mnote";
import { Tab } from "./types";

const defaultAutosaveInterval = 5 * 60;

export class AutosaveModule {
  private app: Mnote;
  private autosaveDir = "";
  private sessionDir = "";
  private lastSavedFiles: string[] = [];
  private intervalId?: number;

  constructor(app: Mnote) {
    this.app = app;
  }

  async init() {
    const { fs, datadir, editors, system, log, settings } = this.app.modules;

    this.autosaveDir = fs.joinPath([datadir.getPath(), "autosaves"]);
    await fs.ensureDir(this.autosaveDir);

    this.sessionDir = fs.joinPath([
      this.autosaveDir,
      this.generateSessionDirName(),
    ]);
    await fs.ensureDir(this.sessionDir);

    editors.events.on("tabRemoved", async (tab) => {
      const fileName = this.getFileNameForTab(tab);

      if (this.lastSavedFiles.indexOf(fileName) === -1) return;
      const path = fs.joinPath([this.sessionDir, fileName]);
      try {
        await fs.removeFile(path);
      } catch (e) {
        log.err("autosave: error while removing autosaved file to", path, tab);
      }
    });

    system.hookToQuit(async () => {
      if (this.intervalId !== undefined) clearInterval(this.intervalId);
      await fs.removeDir(this.sessionDir);
    });

    settings.registerSubcategory({
      title: "Autosave",
      key: "core.autosave",
      category: "core",
      iconFactory: (_fillClass, strokeClass) =>
        createIcon("autosave", _fillClass, strokeClass),
    });

    settings.registerInput({
      title: "Autosave interval (in seconds)",
      description: `Files will be auto-saved in "${this.autosaveDir}".`,
      type: "number",
      min: 1,
      subcategory: "core.autosave",
      key: "core.autosaveInterval",
      default: defaultAutosaveInterval,
    });

    settings.events.on("change", () => {
      this.updateAutosaveInterval();
    });

    await this.updateAutosaveInterval();

    return this;
  }

  private async updateAutosaveInterval() {
    const { settings } = this.app.modules;

    const intervalInSeconds = await settings.getKeyWithDefault(
      "core.autosaveInterval",
      defaultAutosaveInterval,
      (value) => typeof value === "number" && value > 1
    );

    if (this.intervalId) clearInterval(this.intervalId);
    const runAutosave = this.runAutosave.bind(this);
    this.intervalId = window.setInterval(runAutosave, intervalInSeconds * 1000);
  }

  private runAutosave() {
    const { fs, editors, log } = this.app.modules;

    const newLastSavedFiles: string[] = [];
    this.lastSavedFiles = newLastSavedFiles;

    Promise.all(
      editors.activeTabs.map(async (tab) => {
        if (tab.info.document.saved) return;

        const fileName = this.getFileNameForTab(tab);

        newLastSavedFiles.push(fileName);
        const path = fs.joinPath([this.sessionDir, fileName]);
        try {
          await tab.info.editor.save(path);
        } catch (e) {
          log.err("autosave: error while saving to", path, tab);
        }
      })
    );
  }

  private getFileNameForTab(tab: Tab) {
    return tab.info.document.name + "_" + tab.id;
  }

  private generateSessionDirName() {
    const date = new Date();
    return (
      `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` +
      "_" +
      `${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}-` +
      date.getMilliseconds()
    );
  }
}
