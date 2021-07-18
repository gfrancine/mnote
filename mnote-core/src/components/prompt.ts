// https://code.visualstudio.com/api/references/vscode-api#window.showInformationMessage
// https://vercel.com/design/prompt

import { el } from "mnote-util/elbuilder";
import { freeze, unfreeze } from "mnote-util/dom";
import { PromptButton } from "../modules/types";

export class Prompt {
  container: Element;
  message: string;
  buttons: PromptButton[];

  constructor(opts: {
    container: Element;
    message: string;
    buttons: PromptButton[];
  }) {
    this.message = opts.message;
    this.container = opts.container;
    this.buttons = opts.buttons;
  }

  prompt(): Promise<string> {
    const buttonEls: HTMLElement[] = [];

    this.buttons.forEach((buttonData) => {
      const button = el("div")
        .class("prompt-button")
        .class(buttonData.kind)
        .inner(buttonData.text)
        .attr("prompt-command", buttonData.command)
        .element;

      buttonEls.push(button);
    });

    const buttons = el("div")
      .class("prompt-buttons")
      .children(...buttonEls)
      .element;

    const text = el("div")
      .class("prompt-text")
      .inner(this.message)
      .element;

    const menu = el("div")
      .class("prompt")
      .children(
        text,
        buttons,
      )
      .element;

    const overlay = el("div")
      .class("prompt-overlay")
      .children(menu)
      .element;

    freeze();
    this.container.appendChild(overlay);

    return new Promise((resolve) => {
      const listeners: Map<HTMLElement, () => void> = new Map();

      buttonEls.forEach((element) => {
        const command = element.getAttribute("prompt-command");

        const listener = () => {
          for (const [k, v] of listeners.entries()) {
            k.removeEventListener("click", v);
          }

          // types can be cast safely as long as no one messes
          // with it manually

          (overlay.parentNode as HTMLElement).removeChild(overlay);
          unfreeze();
          resolve(command as string);
        };

        listeners.set(element, listener);
        element.addEventListener("click", listener);
      });
    });
  }
}
