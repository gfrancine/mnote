// https://code.visualstudio.com/api/references/vscode-api#window.showInformationMessage
// https://vercel.com/design/modal

import { el } from "mnote-util/elbuilder";
import { freeze, unfreeze } from "mnote-util/dom";
import { ModalButton } from "../modules/types";

export class Modal {
  container: Element;
  message: string;
  buttons: ModalButton[];

  constructor(opts: {
    container: Element;
    message: string;
    buttons: ModalButton[];
  }) {
    this.message = opts.message;
    this.container = opts.container;
    this.buttons = opts.buttons;
  }

  prompt(): Promise<string> {
    const buttonEls: HTMLElement[] = [];

    this.buttons.forEach((buttonData) => {
      const button = el("div")
        .class("modal-button")
        .class(buttonData.kind)
        .inner(buttonData.text)
        .attr("modal-command", buttonData.command)
        .element;

      buttonEls.push(button);
    });

    const buttons = el("div")
      .class("modal-buttons")
      .children(...buttonEls)
      .element;

    const text = el("div")
      .class("modal-text")
      .inner(this.message)
      .element;

    const menu = el("div")
      .class("modal")
      .children(
        text,
        buttons,
      )
      .element;

    const overlay = el("div")
      .class("modal-overlay")
      .children(menu)
      .element;

    freeze();
    this.container.appendChild(overlay);

    return new Promise((resolve) => {
      const listeners: Map<HTMLElement, () => void> = new Map();

      buttonEls.forEach((element) => {
        const command = element.getAttribute("modal-command");

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
