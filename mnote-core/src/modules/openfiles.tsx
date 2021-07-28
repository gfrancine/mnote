import React from "react";
import { render } from "react-dom";
import { LayoutModule } from ".";
import { el } from "../../../mnote-util/elbuilder";
import { Mnote } from "../common/types";
import { OpenFile } from "../common/types";
import OpenFiles from "../components/openfiles";

export class OpenFilesModule {
  layout: LayoutModule;
  element: HTMLElement;

  constructor(app: Mnote) {
    this.layout = app.modules.layout as LayoutModule;
    this.element = el("div")
      .class("openfiles-main")
      .element;
    this.setOpenFiles([]);
    this.layout.mountToOpenFiles(this.element);
  }

  setOpenFiles(files: OpenFile[], activeIndex?: number) {
    console.log("setOpenFiles");
    render(
      <OpenFiles openFiles={[...files]} activeIndex={activeIndex} />,
      this.element,
    );
  }
}
