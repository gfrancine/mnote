import { StringsDictionary } from "./types";
import { enStrings, errorStrings } from "../common/strings";
import { Mnote } from "..";
import { LogModule } from "./log";

/* Note
localization support for the app is incomplete and will not be worked on anytime
soon because I'm the only user and I don't plan to release this app openly. The
purpose of this module is just to organize long strings into a separate place and
to make localization *possible* */
// todo: some strings are retrieved only once and don't update, e.g. in tooltips

export class StringsModule {
  private log: LogModule;
  private dictionaries: Record<string, StringsDictionary> = {
    en: enStrings,
  };

  currentLocale = "en";

  constructor(app: Mnote) {
    this.log = app.modules.log;
  }

  registerLocale(kind: string, dictionary: Partial<StringsDictionary>) {
    const existingDictionary = this.dictionaries[kind];
    if (existingDictionary) {
      this.log.warn(
        "strings: registerLocale - writing to existing dictionary",
        kind,
        existingDictionary,
        dictionary,
      );
    }

    this.dictionaries[kind] = {
      ...(existingDictionary || enStrings),
      ...dictionary,
    };
    this.log.info(
      "strings: registerLocale",
      kind,
      dictionary,
      this.dictionaries,
    );
  }

  setLocale(kind: string) {
    if (!this.dictionaries[kind]) throw new Error(errorStrings.noLocale(kind));
    this.currentLocale = kind;
  }

  // use closure so it's possible to alias the function
  get = <K extends keyof StringsDictionary>(key: K): StringsDictionary[K] => {
    return this.dictionaries[this.currentLocale][key];
  };
}
