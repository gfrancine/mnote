import React from "react";
import { createRoot, Root } from "react-dom/client";
import { FileSearchModule } from "./filesearch";
import { LayoutModule } from "./layout";
import { el } from "mnote-util/elbuilder";
import { Mnote } from "..";
import OpenTabs from "./opentabs-component";
import { EditorsModule } from "./editors";
import { CtxmenuContext, Tab } from "./types";
import { CtxmenuModule } from "./ctxmenu";
import { FileIconsModule } from "./fileicons";
import { LogModule } from "./log";

export class OpenTabsModule {
  private log: LogModule;
  private layout: LayoutModule;
  private editors: EditorsModule;
  private element: HTMLElement;
  private ctxmenu: CtxmenuModule;
  private fileicons: FileIconsModule;
  private filesearch: FileSearchModule;

  private reactRoot: Root;
  private searchTerm?: string;
  private activeIndex?: number;

  constructor(app: Mnote) {
    this.log = app.modules.log;
    this.layout = app.modules.layout;
    this.editors = app.modules.editors;
    this.ctxmenu = app.modules.ctxmenu;
    this.fileicons = app.modules.fileicons;
    this.filesearch = app.modules.filesearch;

    this.element = el("div").class("opentabs-main").element;
    this.reactRoot = createRoot(this.element);
    this.layout.mountToOpenTabs(this.element);
    this.setActiveIndex();

    // opentabs updates editor      >
    // editor tabs update internally > editor tabs change > open tabs change
    const onEditorTabChange = () => {
      this.setActiveIndex(
        this.editors.currentTab
          ? this.editors.activeTabs.indexOf(this.editors.currentTab)
          : undefined
      );
    };

    this.editors.events.on("activeTabsChanged", onEditorTabChange);
    this.editors.events.on("currentTabSet", onEditorTabChange);
    // click > action up > event down > render

    const setSearchTerm = (searchTerm?: string) => {
      this.log.info("open tabs: set search term", searchTerm);
      this.searchTerm = searchTerm;
      this.updateComponent();
    };

    this.filesearch.events.on("search", setSearchTerm);
    this.filesearch.events.on("searchClear", setSearchTerm);

    const ctxmenuReducer = (ctx: CtxmenuContext) => {
      // find a file tree item
      let tabItem: Element | undefined;

      for (const el of ctx.elements) {
        if (el.classList.contains("opentabs-item")) {
          tabItem = el;
          break;
        }
      }

      if (tabItem) {
        const indexAttr = tabItem.getAttribute("data-mn-tab-index");
        if (!indexAttr) return;
        const index = parseInt(indexAttr, 10);
        const tab = this.editors.activeTabs[index];
        if (!tab) return;

        const ctx = this.getOpenFileTabCtx(tab);

        return [
          {
            name: "Open Editor",
            click: ctx.onOpen,
          },
          {
            name: "Close Editor",
            click: ctx.onClose,
          },
          {
            name: "Save Editor",
            click: ctx.onSave,
          },
        ];
      }
    };

    this.ctxmenu.addSectionReducer(ctxmenuReducer);
  }

  private setActiveIndex(activeIndex?: number) {
    this.log.info("open tabs: set active index", activeIndex);
    this.activeIndex = activeIndex;
    this.updateComponent();
  }

  private getOpenFileTabCtx = (tab: Tab) => ({
    getIcon: (fillClass: string, strokeClass: string) => {
      if (tab.info.document.path) {
        const icon = this.fileicons.getIconForPath(tab.info.document.path);
        return icon?.factory(fillClass, strokeClass);
      }
      if (tab.info.editorInfo.registeredIconKind) {
        const kind = tab.info.editorInfo.registeredIconKind;
        const icon = this.fileicons.getIcons()[kind];
        if (icon) return icon.factory(fillClass, strokeClass);
      }
    },
    onClose: () => {
      this.editors.close(tab);
    },
    onOpen: () => {
      this.editors.changeCurrentTab(tab);
    },
    onSave: () => {
      this.editors.save(tab);
    },
  });

  private updateComponent() {
    this.reactRoot.render(
      <OpenTabs
        tabs={[...this.editors.activeTabs]}
        getOpenFileTabCtx={this.getOpenFileTabCtx}
        setTabs={(tabs) => this.editors.setActiveTabs(tabs)}
        activeIndex={this.activeIndex}
        searchTerm={this.searchTerm}
      />
    );
  }
}
