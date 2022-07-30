import { createIcon } from "mnote-components/vanilla/icons";
import { Mnote } from "..";
import { Extension } from "./types";

// if modules are services, think of
// extensions as the scripts

export class ExtensionsModule /* implements Module */ {
  private extensions: Extension[] = [];
  private app: Mnote;
  private userExtensionsEnabled = false;

  constructor(app: Mnote) {
    this.app = app;
  }

  async init() {
    const { settings } = this.app.modules;

    settings.registerSubcategory({
      key: "extensions",
      title: "Extensions",
      category: "core",
      iconFactory: (fillClass, strokeClass) =>
        createIcon("extensions", fillClass, strokeClass),
    });

    settings.registerInput({
      type: "boolean",
      title: "Enable User Extensions",
      description:
        "Enable loading user extensions. The app must be restarted for changes to apply. This feature is unstable and we recommend turning off this setting.",
      key: "core.extensions.enableUserExtensions",
      subcategory: "extensions",
      default: false,
    });

    this.userExtensionsEnabled = await settings.getKeyWithDefault(
      "core.extensions.enableUserExtensions",
      false,
      (value) => typeof value === "boolean"
    );

    return this;
  }

  async add(extension: Extension) {
    this.extensions.push(extension);
    await extension.startup(this.app);
    return this;
  }

  addAll(extensions: Extension[]) {
    return Promise.all(extensions.map((extension) => this.add(extension)));
  }

  async remove(extension: Extension) {
    const index = this.extensions.indexOf(extension);
    if (index === undefined) return;
    delete this.extensions[index];
    await extension.cleanup();
    return this;
  }
}
