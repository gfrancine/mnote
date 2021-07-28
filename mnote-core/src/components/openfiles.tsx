import React, { useState } from "react";
import { OpenFile } from "../common/types";
import {
  BlankFile,
  ChevronDown,
  ChevronRight,
  Circle,
  Nothing,
} from "./icons-jsx";
import { ItemHead } from "./item-head";

export default function (props: {
  openFiles: OpenFile[];
  activeIndex?: number;
}) {
  const [expanded, setExpanded] = useState(true);

  return <div>
    <ItemHead
      text="Open Files"
      icon={expanded
        ? <ChevronDown fillClass="fill" strokeClass="stroke" />
        : <ChevronRight fillClass="fill" strokeClass="stroke" />}
      onClick={() => setExpanded(!expanded)}
    />
    {expanded
      ? <div className="filetree-dir-children">
        {props.openFiles.map((file) =>
          <ItemHead
            key={file.index}
            text={file.name}
            icon={file.saved
              ? <BlankFile fillClass="fill" strokeClass="stroke" />
              : <Circle fillClass="fill" strokeClass="stroke" />}
            focused={props.activeIndex === file.index}
            onClick={() => file.onOpen(file)}
          />
        )}
      </div>
      : <></>}
  </div>;
}
