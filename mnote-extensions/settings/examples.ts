import { Extension, Mnote } from "mnote-core";

export class SettingsInputsExamples implements Extension {
  startup(app: Mnote) {
    const settings = app.modules.settings;
    const prefix = "settingsinputs.";

    const genericInput = {
      subcategory: "settingsinputs",
      title: "Input",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    };

    settings.registerSubcategory({
      category: "extensions",
      title: "Settings Inputs",
      key: "settingsinputs",
    });

    settings.registerInput({
      ...genericInput,
      type: "boolean",
      key: prefix + "boolean",
      default: true,
    });

    settings.registerInput({
      ...genericInput,
      type: "string",
      key: prefix + "string",
      default: "erase me",
      getInvalidMessage: (value) => {
        if (value.length === 0) return "Error message";
      },
    });

    settings.registerInput({
      ...genericInput,
      type: "number",
      key: prefix + "number",
      default: 2,
      min: 0,
      max: 5,
      getInvalidMessage: (value) => {
        if (value === 5) return "Error message";
      },
    });

    settings.registerInput({
      ...genericInput,
      type: "select",
      key: prefix + "select",
      default: "two",
      getItems: () => [{
        value: "one",
        text: "One",
      }, {
        value: "two",
        text: "Two",
      }, {
        value: "three",
        text: "Three",
      }],
    });
  }

  cleanup() {}
}
