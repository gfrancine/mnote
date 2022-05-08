import { FSModule } from "./fs";
import { Mnote } from "..";

export class DataDirModule {
  private fs: FSModule;
  private dataDirPath = ""; // initialized in init()

  constructor(app: Mnote) {
    this.fs = app.modules.fs;
  }

  async init() {
    this.dataDirPath = await this.fs.getDataDir();
    await this.fs.ensureDir(this.dataDirPath);
    return this;
  }

  getPath = () => this.dataDirPath;
}
