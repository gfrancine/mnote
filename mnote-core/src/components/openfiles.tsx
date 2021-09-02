import React, { useState } from "react";
import { OpenFile } from "../common/types";
import {
  BlankFile,
  ChevronDown,
  ChevronRight,
  Circle,
  Close,
} from "mnote-components/react/icons-jsx";
import { ElementToReact, TreeChildren, TreeItem } from "./tree";

export default function (props: {
  openFiles: OpenFile[];
  activeIndex?: number;
  getIcon?: (
    file: OpenFile,
    fillClass: string,
    strokeClass: string,
  ) => Element | void;
}) {
  const [expanded, setExpanded] = useState(true);

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
        {props.openFiles.map((file) =>
          (
            <TreeItem
              key={file.index}
              text={file.name}
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
        )}
      </TreeChildren>
    </div>
  );
}
