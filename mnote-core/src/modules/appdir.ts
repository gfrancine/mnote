import { FSModule } from ".";
import { Mnote } from "../common/types";

const APPDIR_NAME = "Mnote";

export class AppDirModule {
  private fs: FSModule;

  private appDirPath = "";

  constructor(app: Mnote) {
    this.fs = app.modules.fs as FSModule;
  }

  async init() {
    this.appDirPath = this.fs.joinPath([
      await this.fs.getConfigDir(),
      APPDIR_NAME,
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
