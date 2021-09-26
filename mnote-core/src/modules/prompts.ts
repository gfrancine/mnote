import { Mnote } from "..";
import { PromptButton } from "./types";
import { Prompt } from "./prompts-ui";
import { el } from "mnote-util/elbuilder";

export class PromptsModule {
  private app: Mnote;

  constructor(app: Mnote) {
    this.app = app;
  }

  // display a message with an "OK" button
  notify(message: string) {
    new Prompt({
      container: this.app.element,
      message: message,
      buttons: [{
        kind: "emphasis",
        text: "OK",
        command: "",
      }],
    }).prompt();
  }

  // display a message with actions, returns pressed
  // button's command
  promptButtons(message: string, buttons: PromptButton[]): Promise<string> {
    return new Prompt({
      container: this.app.element,
      message,
      buttons, // at the bottom of this file to avoid clutter
    }).prompt();
  }

  async promptTextInput(
    message: string,
    initialValue?: string,
  ): Promise<string | undefined> {
    const value = initialValue || "";

    const input = el("input")
      .class("prompt-input")
      .attr("spellcheck", "false")
      .attr("value", value)
      .element as HTMLInputElement;

    const prompt = new Prompt({
      container: this.app.element,
      message: message,
      insertedElements: [input],
      buttons: [{
        kind: "normal",
        text: "Cancel",
        command: "cancel",
      }, {
        kind: "emphasis",
        text: "Confirm",
        command: "confirm",
      }],
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        prompt.resolveEarly("confirm");
      }
    });

    prompt.show();
    input.focus();
    input.selectionStart = input.selectionEnd = value.length; // focus at end

    const action = await prompt.prompt();

    if (
      action === "cancel" ||
      input.value.length < 1
    ) {
      return;
    }

    return input.value;
  }
}
