import { OpenFilesModule } from "./openfiles";
import { FiletreeModule } from "./filetree";
import { Mnote } from "..";

export class FileSearchModule {
  private filetree: FiletreeModule;
  private openfiles: OpenFilesModule;
  // todo: element

  constructor(app: Mnote) {
    const { filetree, openfiles } = app.modules;
    this.filetree = filetree;
    this.openfiles = openfiles;
  }

  search(searchTerm: string) {
    this.filetree.setSearchTerm(searchTerm);
    this.openfiles.setSearchTerm(searchTerm);
  }

  clearSearch() {
    this.filetree.setSearchTerm();
    this.openfiles.setSearchTerm();
  }
}
