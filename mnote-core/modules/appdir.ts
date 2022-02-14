import { Mnote } from "..";
import { FSModule } from "./fs";
import { LogModule } from "./log";
import { MenubarModule } from "./menubar";
import { SystemModule } from "./system";
import { Emitter } from "mnote-util/emitter";
import { PopupsModule } from ".";

export class AppDirModule {
  private app: Mnote;

  private fs: FSModule;
  private log: LogModule;
  private popups: PopupsModule;
  private menubar: MenubarModule;
  private system: SystemModule;

  private directory?: string;

  events: Emitter<{
    directorySet: (path: string) => unknown;
    directoryClosed: () => unknown;
  }> = new Emitter();

  hooks: Emitter<{
    // meant for editors and file tree
    openFileRequested: () => unknown;
    refreshDirectoryRequested: () => unknown;
  }> = new Emitter();

  constructor(app: Mnote) {
    this.app = app;
    this.fs = app.modules.fs;
    this.system = app.modules.system;
    this.log = app.modules.log;
    this.popups = app.modules.popups;
    this.menubar = app.modules.menubar;

    this.bindToModules();
    this.app.hooks.on("startup", () => this.startup());
  }

  async startup() {
    const startPath = this.app.options.startPath;
    let startDirectory: string | undefined;

    if (startPath) {
      if (await this.fs.isDir(startPath)) {
        startDirectory = startPath;
      } else if (await this.fs.isFile(startPath)) {
        const parent = this.fs.getPathParent(startPath);
        if (await this.fs.isDir(parent)) {
          startDirectory = parent;
        }
      }
    }

    if (startDirectory) await this.setDirectory(startDirectory);
  }

  getDirectory = () => this.directory;

  async closeDirectory() {
    this.log.info("appdir: closeDirectory");
    if (!this.directory) {
      this.log.warn(
        "appdir: called closeDirectory when there is no current directory"
      );
      return;
    }

    await this.fs.unwatch(this.directory);
    delete this.directory;

    this.events.emit("directoryClosed");
  }

  async setDirectory(path: string) {
    this.log.info("appdir: setDirectory", path);

    try {
      await this.fs.readDir(path, { recursive: false });
    } catch (e) {
      this.log.err("Appdir - try readDir error", e);
      this.popups.notify(
        `Cannot open folder ${path}: ${e instanceof Error ? e.message : e}`
      );
      return;
    }

    if (this.directory) await this.closeDirectory();
    this.directory = path;
    await this.fs.watch(path);

    this.events.emit("directorySet", path);
  }

  private bindToModules() {
    const openFile = async () => {
      await this.hooks.emitAsync("openFileRequested");
    };

    const openFolder = async () => {
      const maybePath = await this.fs.dialogOpen({
        isDirectory: true,
        startingDirectory: this.directory,
      });
      this.log.info("appdir: open folder path", maybePath);
      if (!maybePath) return;
      this.setDirectory(maybePath);
    };

    const refreshFolder = async () => {
      await this.hooks.emitAsync("refreshDirectoryRequested");
    };

    const menuReducer = () => {
      const buttons = [];

      buttons.push({
        name: "Open File...",
        click: openFile,
      });

      buttons.push({
        name: "Open Folder...",
        click: openFolder,
      });

      if (this.directory) {
        buttons.push({
          name: "Close Folder",
          click: () => this.closeDirectory(),
        });
      }

      return buttons;
    };

    this.system.onAppMenuClick((menuId) => {
      switch (menuId) {
        case "open-file":
          return openFile();
        case "open-folder":
          return openFolder();
        case "close-folder":
          return this.closeDirectory();
        case "refresh-folder":
          return refreshFolder();
      }
    });

    this.menubar.addSectionReducer(menuReducer);
  }
}
