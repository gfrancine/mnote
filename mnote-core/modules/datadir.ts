import { FSModule } from "./fs";
import { Mnote } from "..";

export class DataDirModule {
  private fs: FSModule;

  private dataDirPath = ""; // initialized in init()
  private dataDirName = "Mnote";

  constructor(app: Mnote) {
    this.fs = app.modules.fs;
    this.dataDirName = app.options.dataDirectoryName || this.dataDirName;
  }

  async init() {
    this.dataDirPath = this.fs.joinPath([
      await this.fs.getConfigDir(),
      this.dataDirName,
    ]);

    await this.fs.ensureDir(this.dataDirPath);
    return this;
  }

  getPath = () => this.dataDirPath;
}
