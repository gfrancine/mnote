import { createIcon } from "mnote-components/vanilla/icons";
import { el } from "mnote-util/elbuilder";
import { Emitter } from "mnote-util/emitter";
import { Mnote } from "..";
import { LayoutModule } from "./layout";

export class FileSearchModule {
  private layout: LayoutModule;
  private element: HTMLElement;
  private input: HTMLInputElement;
  private button: HTMLElement;

  private isSearching = false;

  events: Emitter<{
    searchClear: () => unknown;
    search: (term: string) => unknown;
  }> = new Emitter();

  constructor(app: Mnote) {
    const { layout, strings } = app.modules;
    this.layout = layout;

    this.input = el("input")
      .class("filesearch-input")
      .attr("placeholder", strings.get("searchPlaceholder"))
      .element as HTMLInputElement;

    this.input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (this.input.value.length < 1) return;
      this.setSearchTerm(this.input.value);
      this.input.blur();
    });

    const searchIcon = createIcon(
      "search",
      "fill",
      "stroke",
      strings.get("searchFilesTip"),
    );
    searchIcon.classList.add("icon", "search");

    const closeIcon = createIcon(
      "close",
      "fill",
      "stroke",
      strings.get("clearSearchTip"),
    );
    closeIcon.classList.add("icon", "close");

    this.button = el("div")
      .class("filesearch-button")
      .children(
        searchIcon,
        closeIcon,
      )
      .on("click", () => {
        this.setIsSearching(!this.isSearching);
      })
      .element;

    this.element = el("div")
      .class("filesearch")
      .children(
        this.button,
        this.input,
      )
      .element;

    this.layout.mountToFileSearchbar(this.element);
  }

  private setIsSearching(value: boolean) {
    this.isSearching = value;

    if (value) {
      this.element.classList.add("searching");
      this.input.focus();
    } else {
      this.element.classList.remove("searching");
      this.input.value = "";
      this.input.blur();
      this.events.emit("searchClear");
    }
  }

  private setSearchTerm(value: string) {
    this.events.emit("search", value);
  }
}
