import React from "react";
import { render } from "react-dom";
import { LayoutModule } from ".";
import { el } from "mnote-util/elbuilder";
import { Mnote } from "../common/types";
import { OpenFile } from "../common/types";
import OpenFiles from "../components/openfiles";
import { EditorsModule } from "./editors";
import { Tab } from "./types";

export class OpenFilesModule {
  layout: LayoutModule;
  editors: EditorsModule;
  element: HTMLElement;

  constructor(app: Mnote) {
    this.layout = app.modules.layout as LayoutModule;
    this.editors = app.modules.editors as EditorsModule;
    this.element = el("div")
      .class("openfiles-main")
      .element;
    this.setOpenFiles([]);
    this.layout.mountToOpenFiles(this.element);

    const onEditorTabChange = () => {
      this.setOpenFiles(
        this.tabsToOpenFiles(this.editors.activeTabs),
        this.editors.currentTab
          ? this.editors.activeTabs.indexOf(this.editors.currentTab)
          : undefined,
      );
    };

    this.editors.events.on("activeTabsChanged", onEditorTabChange);
    this.editors.events.on("currentTabSet", onEditorTabChange);
    // click > action up > event down > render
  }

  setOpenFiles(files: OpenFile[], activeIndex?: number) {
    render(
      <OpenFiles openFiles={[...files]} activeIndex={activeIndex} />,
      this.element,
    );
  }

  private tabsToOpenFiles(tabs: Tab[]): OpenFile[] {
    return tabs.map((tab, index) => ({
      name: tab.info.document.name,
      index,
      path: tab.info.document.path,
      saved: tab.info.document.saved,
      onClose: () => {
        this.editors.close(tab);
      },
      onOpen: () => {
        this.editors.changeCurrentTab(tab);
      },
    }));
  }
}
