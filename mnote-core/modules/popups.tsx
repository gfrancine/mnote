import { Mnote } from "..";
import { PromptButton } from "./types";
import React from "react";
import { Prompt } from "./popups-prompt";
import { el } from "mnote-util/elbuilder";
import { createRoot } from "react-dom/client";
import Select from "mnote-components/react/dropdowns/Select";

export class PopupsModule {
  private app: Mnote;

  constructor(app: Mnote) {
    this.app = app;
  }

  // display a message with an "OK" button
  notify(message: string) {
    new Prompt({
      container: this.app.element,
      message: message,
      buttons: [
        {
          kind: "emphasis",
          text: "OK",
          command: "",
        },
      ],
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
    additionalContent?: () => Element | undefined
  ): Promise<string | undefined> {
    const value = initialValue || "";

    const input = el("input")
      .class("prompt-input")
      .attr("spellcheck", "false")
      .attr("value", value).element as HTMLInputElement;

    const insertedElements: Element[] = [input];
    const additionalContent_ = additionalContent?.();
    if (additionalContent_) insertedElements.push(additionalContent_);

    const prompt = new Prompt({
      container: this.app.element,
      message,
      insertedElements,
      buttons: [
        {
          kind: "normal",
          text: "Cancel",
          command: "cancel",
        },
        {
          kind: "emphasis",
          text: "Confirm",
          command: "confirm",
        },
      ],
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

    if (action === "cancel" || input.value.length < 1) {
      return;
    }

    return input.value;
  }

  async promptTextInputWithSelect<T extends string>(opts: {
    message: string;
    textInputValue?: string;
    selectValue?: T;
    selectPlaceholder?: string;
    selectOptions: { value: T; text: string }[];
  }) {
    const select = el("div").class("prompt-dropdown").element;
    const reactRoot = createRoot(select);
    let selectValue: T | undefined = opts.selectValue;

    reactRoot.render(
      <Select
        placeholder={opts.selectPlaceholder}
        initialValue={opts.selectValue}
        onChange={(value) => (selectValue = value)}
        options={opts.selectOptions}
      />
    );

    const textInputValue = await this.promptTextInput(
      opts.message,
      opts.textInputValue,
      () => select
    );
    reactRoot.unmount();

    return {
      textInputValue,
      selectValue,
    };
  }
}
