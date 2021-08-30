import { FSModule } from ".";
import { Mnote } from "..";

export class AppDirModule {
  private fs: FSModule;

  private appDirPath = ""; // initialized in init()
  private appDirName = "Mnote";

  constructor(app: Mnote) {
    this.fs = app.modules.fs;
    this.appDirName = app.options.appDirectoryName || this.appDirName;
  }

  async init() {
    this.appDirPath = this.fs.joinPath([
      await this.fs.getConfigDir(),
      this.appDirName,
    ]);

    if (!await this.fs.isDir(this.appDirPath)) {
      if (await this.fs.isFile(this.appDirPath)) {
        this.fs.removeFile(this.appDirPath);
      }
      await this.fs.createDir(this.appDirPath);
    }

    return this;
  }

  getPath = () => this.appDirPath;
}
