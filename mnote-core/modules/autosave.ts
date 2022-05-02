import { Mnote } from "../mnote";
import { Tab } from "./types";

export class AutosaveModule {
  private app: Mnote;
  private autosaveDir = "";
  private sessionDir = "";
  private lastSavedFiles: string[] = [];

  constructor(app: Mnote) {
    this.app = app;
  }

  async init() {
    const { fs, datadir, editors, system, log } = this.app.modules;

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

    const interval = setInterval(() => {
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
    }, 5 * 60 * 1000);

    system.hookToQuit(async () => {
      clearInterval(interval);
      await fs.removeDir(this.sessionDir);
    });

    return this;
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
