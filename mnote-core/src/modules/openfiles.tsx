import React from "react";
import { render } from "react-dom";
import { LayoutModule } from ".";
import { el } from "mnote-util/elbuilder";
import { Mnote } from "../common/types";
import { OpenFile } from "../common/types";
import OpenFiles from "../components/openfiles";
import { EditorsModule } from "./editors";
import { Context, Tab } from "./types";
import { CtxmenuModule } from "./ctxmenu";
import { FileIconsModule } from "./fileicons";

export class OpenFilesModule {
  layout: LayoutModule;
  editors: EditorsModule;
  element: HTMLElement;
  ctxmenu: CtxmenuModule;
  fileicons: FileIconsModule;

  openFiles: OpenFile[] = [];

  constructor(app: Mnote) {
    this.layout = app.modules.layout as LayoutModule;
    this.editors = app.modules.editors as EditorsModule;
    this.ctxmenu = app.modules.ctxmenu as CtxmenuModule;
    this.fileicons = app.modules.fileicons as FileIconsModule;

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

    const ctxmenuReducer = (ctx: Context) => {
      // find a file tree item
      let tabItem: Element | undefined;

      for (const el of ctx.elements) {
        if (el.classList.contains("openfiles-item")) {
          tabItem = el;
          break;
        }
      }

      if (tabItem) {
        const indexAttr = tabItem.getAttribute("mn-tab-index");
        if (!indexAttr) return;
        const index = parseInt(indexAttr);
        const file = this.openFiles[index];
        if (!file) return;

        return [{
          name: "Open editor",
          click: () => file.onOpen(file),
        }, {
          name: "Close editor",
          click: () => file.onClose(file),
        }, {
          name: "Save editor",
          click: () => file.onSave(file),
        }];
      }
    };

    this.ctxmenu.addSectionReducer(ctxmenuReducer);
  }

  setOpenFiles(files: OpenFile[], activeIndex?: number) {
    this.openFiles = [...files];

    render(
      <OpenFiles
        openFiles={[...files]}
        activeIndex={activeIndex}
        getIcon={(file: OpenFile, fillClass: string, strokeClass: string) =>
          file.getIcon(fillClass, strokeClass)}
      />,
      this.element,
    );
  }

  private tabsToOpenFiles(tabs: Tab[]): OpenFile[] {
    return tabs.map((tab, index) => ({
      name: tab.info.document.name,
      index,
      path: tab.info.document.path,
      saved: tab.info.document.saved,
      getIcon: (fillClass: string, strokeClass: string) => {
        if (tab.info.editorInfo.provider.getRegisteredIconKind) {
          const kind = tab.info.editorInfo.provider.getRegisteredIconKind();
          const icon = this.fileicons.getIcons()[kind];
          if (icon) return icon.factory(fillClass, strokeClass);
        }

        if (tab.info.document.path) {
          const icon = this.fileicons.getIconForPath(tab.info.document.path);
          return icon?.factory(fillClass, strokeClass);
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
    }));
  }
}
