import { createIcon } from "mnote-components/vanilla/icons";
import { Mnote, FileItemWithChildren } from "..";
import { Extension, ExtensionManifest, UserExtensionInfo } from "./types";
import { Base64 } from "js-base64";
import * as s from "superstruct";

const manifestStruct: s.Struct<ExtensionManifest> = s.object({
  main: s.string(),
  stylesheets: s.optional(s.array(s.string())),
});

export class ExtensionsModule /* implements Module */ {
  private extensions: Extension[] = [];
  private app: Mnote;
  private userExtensionsEnabled = false;
  private displayUserExtensionsAtStartup = true;
  private extensionsDir = "";
  private userExtensions: UserExtensionInfo[] = [];

  constructor(app: Mnote) {
    this.app = app;
  }

  async init() {
    const { settings, datadir, fs } = this.app.modules;

    this.extensionsDir = fs.joinPath([datadir.getPath(), "extensions"]);
    await fs.ensureDir(this.extensionsDir);

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
        `Enable loading user extensions from the extensions folder (${this.extensionsDir}).` +
        ` The app must be restarted for changes to apply.` +
        ` This feature is still unstable and potentially unsafe. We recommend turning off this setting.`,
      key: "core.extensions.userExtensionsEnabled",
      subcategory: "extensions",
      default: false,
    });

    settings.registerInput({
      type: "boolean",
      title: "Display User Extensions at Startup",
      description:
        "Display a list of user extensions at startup before loading them.",
      key: "core.extensions.displayUserExtensionsAtStartup",
      subcategory: "extensions",
      default: true,
    });

    this.userExtensionsEnabled = await settings.getKeyWithDefault(
      "core.extensions.userExtensionsEnabled",
      false,
      (value) => typeof value === "boolean"
    );

    this.displayUserExtensionsAtStartup = await settings.getKeyWithDefault(
      "core.extensions.displayUserExtensionsAtStartup",
      true,
      (value) => typeof value === "boolean"
    );

    this.app.hooks.on("startup", async () => {
      await this.addAll(this.app.options.builtinExtensions || []);
      // this.userExtensionsEnabled = true;
      if (this.userExtensionsEnabled) await this.loadUserExtensions();
    });

    return this;
  }

  private async loadUserExtensions() {
    const { fs, popups } = this.app.modules;

    const extensionDirs = // new Array(50).fill({ path: "sdfasfads"})
      // /*
      (await fs.readDir(this.extensionsDir)).children.filter(
        (entry) => entry.children
      ) as FileItemWithChildren[];
    // */

    if (extensionDirs.length < 1) return;

    if (this.displayUserExtensionsAtStartup) {
      const shouldProceed = await popups.confirm(
        "<h2>User Extensions</h2>" +
          "<p>The following extensions will be loaded:</p><ul>" +
          extensionDirs
            .map((entry) => `<li>${fs.getPathName(entry.path)}</li>`)
            .join("\n") +
          "</ul><p>Would you like to proceed?</p>" +
          "<small>This message can be turned off in the Extensions settings category.</small>",
        "cancel"
      );

      if (!shouldProceed) return;
    }

    await Promise.all(
      extensionDirs.map(async (dir) => {
        // manifest file
        const manifestFile = dir.children.find(
          (entry) =>
            fs.getPathName(entry.path) === "extension.json" && !entry.children
        );
        if (!manifestFile) return;
        let manifest: ExtensionManifest = {} as unknown as ExtensionManifest;
        try {
          const contents = JSON.parse(await fs.readTextFile(manifestFile.path));
          s.assert(contents, manifestStruct);
          manifest = contents as ExtensionManifest;
        } catch (e) {
          popups.notify(
            `Error while reading extension manifest file at "${manifestFile.path}": ${e}`
          );
          return;
        }

        const userExtension: UserExtensionInfo = {
          extension: {} as Extension,
          styles: [],
        };

        // main script
        const mainScriptPath = fs.joinPath([dir.path, manifest.main]);
        try {
          const contents = await fs.readTextFile(mainScriptPath);
          // https://miyauchi.dev/posts/module-from-string/
          const module: { default: Extension } = await import(
            `data:text/javascript;base64,${Base64.encode(contents)}`
          );
          await this.add(module.default);
          userExtension.extension = module.default;
        } catch (e) {
          popups.notify(
            `Error while loading extension main script at "${mainScriptPath}": ${e}`
          );
          return;
        }

        // stylesheets
        if (manifest.stylesheets) {
          for (const path of manifest.stylesheets) {
            try {
              const contents = await fs.readTextFile(
                fs.joinPath([dir.path, path])
              );
              const element = document.createElement("style");
              element.innerHTML = contents;
              document.head.appendChild(element);
              userExtension.styles.push(element);
            } catch (e) {
              popups.notify(
                `Error while loading extension stylesheet at "${path}": ${e}`
              );
            }
          }
        }

        this.userExtensions.push(userExtension);
      })
    );
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
