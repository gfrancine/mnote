// https://code.visualstudio.com/api/references/vscode-api#window.showInformationMessage
// https://vercel.com/design/prompt

import { el } from "mnote-util/elbuilder";
import { freeze, unfreeze } from "mnote-util/dom";
import { PromptButton } from "./types";
import { Signal } from "mnote-util/signal";

export class Prompt {
  container: Element;
  message: string;
  buttons: PromptButton[];
  insertedElements: HTMLElement[] = [];
  buttonEls: HTMLElement[];
  overlay: HTMLElement;
  resolveSignal = new Signal<(command: string) => unknown>();
  isShowing = false;

  constructor(opts: {
    container: Element;
    message: string;
    buttons: PromptButton[];
    insertedElements?: HTMLElement[];
  }) {
    this.message = opts.message;
    this.container = opts.container;
    this.buttons = opts.buttons;

    if (opts.insertedElements) {
      this.insertedElements = opts.insertedElements;
    }

    this.buttonEls = [];

    this.buttons.forEach((buttonData) => {
      const button = el("div")
        .class("prompt-button")
        .class(buttonData.kind)
        .inner(buttonData.text)
        .attr("prompt-command", buttonData.command).element;

      this.buttonEls.push(button);
    });

    const buttons = el("div")
      .class("prompt-buttons")
      .children(...this.buttonEls).element;

    const text = el("div").class("prompt-text").inner(this.message).element;

    const insertedContainer = el("div").children(
      ...this.insertedElements
    ).element;

    const menu = el("div")
      .class("prompt")
      .children(text, insertedContainer, buttons).element;

    this.overlay = el("div").class("prompt-overlay").children(menu).element;
  }

  resolveEarly(command: string) {
    this.resolveSignal.emitSync(command);
  }

  show() {
    if (this.isShowing) return;
    this.isShowing = true;
    freeze();
    this.container.appendChild(this.overlay);
  }

  hide() {
    if (!this.isShowing) return;
    if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    unfreeze();
    this.isShowing = false;
  }

  prompt(): Promise<string> {
    this.show();

    return new Promise((resolve) => {
      const listeners: Map<HTMLElement, () => void> = new Map();

      const makeListener = (command: string) => () => {
        for (const [k, v] of listeners.entries()) {
          k.removeEventListener("click", v);
        }
        this.hide();
        resolve(command);
      };

      const signalListener = (command: string) => {
        makeListener(command)();
        this.resolveSignal.unlisten(signalListener);
      };

      this.resolveSignal.listen(signalListener);

      this.buttonEls.forEach((element) => {
        const command = element.getAttribute("prompt-command");
        const listener = makeListener(command as string);
        listeners.set(element, listener);
        element.addEventListener("click", listener);
      });
    });
  }
}
