import React, { useState } from "react";
import { OpenFile } from "../common/types";
import {
  BlankFile,
  ChevronDown,
  ChevronRight,
  Circle,
  Close,
  Nothing,
} from "./icons-jsx";
import { TreeChildren, TreeItem } from "./tree";

export default function (props: {
  openFiles: OpenFile[];
  activeIndex?: number;
}) {
  const [expanded, setExpanded] = useState(true);

  return <div>
    <TreeItem
      text="Open Files"
      icon={expanded
        ? <ChevronDown fillClass="fill" strokeClass="stroke" />
        : <ChevronRight fillClass="fill" strokeClass="stroke" />}
      onClick={() => setExpanded(!expanded)}
    />
    <TreeChildren hidden={!expanded}>
      {props.openFiles.map((file) =>
        <TreeItem
          key={file.index}
          text={file.name}
          icon={file.saved
            ? <BlankFile fillClass="fill" strokeClass="stroke" />
            : <Circle fillClass="fill" strokeClass="stroke" />}
          focused={props.activeIndex === file.index}
          onClick={() => file.onOpen(file)}
        >
          <div
            className="openfiles-close tree-item-icon"
            onClick={() => file.onClose(file)}
          >
            <Close fillClass="fill" strokeClass="stroke" />
          </div>
        </TreeItem>
      )}
    </TreeChildren>
  </div>;
}
