import React, { useMemo, useState } from "react";
import { OpenFile } from "../common/types";
import {
  BlankFile,
  ChevronDown,
  ChevronRight,
  Circle,
  Close,
} from "mnote-components/react/icons-jsx";
import { ElementToReact, TreeChildren, TreeItem } from "./tree";
import { Highlight } from "mnote-components/react/highlight";
import { getMatchingRanges, MatchRange } from "mnote-util/search";

function searchOpenFiles(openFiles: OpenFile[], searchTerm: string) {
  const results: Record<string, MatchRange[]> = {};

  for (const file of openFiles) {
    if (results[file.name]) continue;
    const ranges = getMatchingRanges(file.name, searchTerm);
    if (ranges.length > 0) results[file.name] = ranges;
  }

  return results;
}

export default function (props: {
  openFiles: OpenFile[];
  activeIndex?: number;
  searchTerm?: string;
  getIcon?: (
    file: OpenFile,
    fillClass: string,
    strokeClass: string,
  ) => Element | void;
}) {
  const [expanded, setExpanded] = useState(true);

  const searchResults = useMemo(() => {
    if (!props.searchTerm) return;
    return searchOpenFiles(props.openFiles, props.searchTerm);
  }, [props.searchTerm, props.openFiles]);

  return (
    <div>
      <TreeItem
        text="Open Files"
        icon={expanded
          ? <ChevronDown fillClass="fill" strokeClass="stroke" />
          : <ChevronRight fillClass="fill" strokeClass="stroke" />}
        onClick={() => setExpanded(!expanded)}
      />
      <TreeChildren hidden={!expanded}>
        {props.openFiles.map((file) => {
          const searchResultRanges = searchResults?.[file.name];

          return (searchResults ? searchResultRanges : true)
            ? (
              <TreeItem
                key={file.index}
                text={searchResultRanges
                  ? <Highlight text={file.name} ranges={searchResultRanges} />
                  : file.name}
                icon={(() => {
                  if (!file.saved) {
                    return <Circle fillClass="fill" strokeClass="stroke" />;
                  }

                  if (props.getIcon) {
                    const icon = props.getIcon(file, "fill", "stroke");
                    if (icon) return <ElementToReact element={icon} />;
                  }

                  return <BlankFile fillClass="fill" strokeClass="stroke" />;
                })()}
                focused={props.activeIndex === file.index}
                onClick={() => file.onOpen(file)}
                mn-tab-index={file.index} // used by context menu to open the right path
                className="openfiles-item" // also used by context menu
              >
                <div
                  className="openfiles-close tree-item-icon"
                  onClick={() => file.onClose(file)}
                >
                  <Close fillClass="fill" strokeClass="stroke" />
                </div>
              </TreeItem>
            )
            : <></>;
        })}
      </TreeChildren>
    </div>
  );
}
