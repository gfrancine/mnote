import { Mnote } from "..";
import { FileIcon } from "./types";

export class FileIconsModule {
  private icons: Record<string, FileIcon> = {};

  constructor(_app: Mnote) {}

  registerIcon(icon: FileIcon) {
    if (this.icons[icon.kind]) {
      throw new Error(`Icon ${icon.kind} already exists!`);
    }
    this.icons[icon.kind] = icon;
  }

  getIcons() {
    return this.icons;
  }

  getIconForPath(path: string) {
    for (const icon of Object.values(this.icons)) {
      if (icon.shouldUse(path)) return icon;
    }
  }
}
