import React, { useMemo, useState } from "react";
import { Tab } from "./types";
import {
  BlankFile,
  ChevronDown,
  ChevronRight,
  Circle,
  Close,
} from "mnote-components/react/icons-jsx";
import {
  ElementToReact,
  TreeChildren,
  TreeItem,
} from "mnote-components/react/tree";
import { Highlight } from "mnote-components/react/highlight";
import { getMatchingRanges, MatchRange } from "mnote-util/search";
import { List, Items } from "mnote-components/react/beautiful-dnd-list";
import { OpenFileTabContext } from "./types";

function searchOpenTabs(tabs: Tab[], searchTerm: string) {
  const results: Record<string, MatchRange[]> = {};

  for (const tab of tabs) {
    const name = tab.info.document.name;
    if (results[name]) continue;
    const ranges = getMatchingRanges(name, searchTerm);
    if (ranges.length > 0) results[name] = ranges;
  }

  return results;
}

export default function (props: {
  tabs: Tab[];
  setTabs: (tabs: Tab[]) => unknown;
  getOpenFileTabCtx: (tab: Tab) => OpenFileTabContext;
  activeIndex?: number;
  searchTerm?: string;
}) {
  const [expanded, setExpanded] = useState(true);

  const searchResults = useMemo(() => {
    if (!props.searchTerm) return;
    return searchOpenTabs(props.tabs, props.searchTerm);
  }, [props.searchTerm, props.tabs]);

  return (
    <div>
      <TreeItem
        text="Open Tabs"
        icon={
          expanded ? (
            <ChevronDown fillClass="fill" strokeClass="stroke" />
          ) : (
            <ChevronRight fillClass="fill" strokeClass="stroke" />
          )
        }
        onClick={() => setExpanded(!expanded)}
      />
      <TreeChildren hidden={!expanded}>
        <List items={props.tabs} onReorder={props.setTabs}>
          {(listProps) => (
            <div ref={listProps.ref} {...listProps.droppableProps}>
              <Items items={props.tabs}>
                {(itemProps) => {
                  const tab = itemProps.item;
                  const name = tab.info.document.name;
                  const searchResultRanges = searchResults?.[name];
                  const openFileTabCtx = props.getOpenFileTabCtx(tab);

                  return (searchResults ? searchResultRanges : true) ? (
                    <TreeItem
                      key={tab.id}
                      text={
                        searchResultRanges ? (
                          <Highlight text={name} ranges={searchResultRanges} />
                        ) : (
                          name
                        )
                      }
                      icon={(() => {
                        if (!tab.info.document.saved) {
                          return (
                            <Circle fillClass="fill" strokeClass="stroke" />
                          );
                        }

                        const icon = openFileTabCtx.getIcon("fill", "stroke");
                        if (icon) return <ElementToReact element={icon} />;

                        return (
                          <BlankFile fillClass="fill" strokeClass="stroke" />
                        );
                      })()}
                      focused={props.activeIndex === itemProps.index}
                      onClick={() => openFileTabCtx.onOpen()}
                      // used by context menu to open the right path
                      data-mn-tab-index={itemProps.index}
                      // also used by context menu
                      className="opentabs-item"
                      innerRef={itemProps.ref}
                      {...itemProps.draggableProps}
                      {...itemProps.dragHandleProps}
                    >
                      <div
                        className="opentabs-close tree-item-icon"
                        onClick={() => openFileTabCtx.onClose()}
                      >
                        <Close fillClass="fill" strokeClass="stroke" />
                      </div>
                    </TreeItem>
                  ) : (
                    <></>
                  );
                }}
              </Items>
              {listProps.placeholder}
            </div>
          )}
        </List>
      </TreeChildren>
    </div>
  );
}
