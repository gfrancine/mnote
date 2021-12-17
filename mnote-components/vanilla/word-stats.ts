import { el } from "mnote-util/elbuilder";
import { countChars, countWords } from "mnote-util/wordcount";

export type CountMode = "words" | "characters";

// used by Markdown and Rich text

export class WordStats {
  private countMode: CountMode = "words";
  private text = "";

  element: HTMLElement;

  constructor() {
    this.element = el("div")
      .class("md-statsbar")
      .on("click", () => {
        this.countMode = this.countMode === "words" ? "characters" : "words";
        this.update();
      }).element;

    this.update();
  }

  setText(text: string) {
    this.text = text;
    this.update();
  }

  private update() {
    switch (this.countMode) {
      case "words": {
        const wordCount = countWords(this.text);
        this.element.innerHTML = "W " + wordCount;
        return;
      }
      case "characters": {
        const charCount = countChars(this.text);
        this.element.innerHTML = "C " + charCount;
        return;
      }
    }
  }
}
