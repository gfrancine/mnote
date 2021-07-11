import React, { useMemo, useState } from "react";
import { BlankFile, ClosedFolder, OpenedFolder } from "./icons-jsx";
import { getPathName } from "mnote-util/path";
import {
  FileTreeNode as Node,
  FileTreeNodeWithChildren as NodeWithChildren,
} from "../common/types";

function FileNode(props: {
  visible?: boolean;
  node: Node;
  focusedNode?: string; // path of the focused node
  handleFocus: (path: string) => void;
}) {
  const name = useMemo(() => getPathName(props.node.path), [props.node.path]);

  const onClick = () => props.handleFocus(props.node.path);

  return <div
    className={"filetree-item file" +
      (props.focusedNode === props.node.path ? " focused" : "") +
      (props.visible ? "" : " hidden")}
    onClick={onClick}
  >
    <div className="filetree-item-icon">
      <BlankFile fillClass="fill" strokeClass="stroke" />
    </div>
    {name}
  </div>;
}

function DirNode(props: {
  visible?: boolean; // dir is only shown if state is expanded and this boolean
  node: NodeWithChildren;
  initExpanded?: boolean; // is the dir open at initialization?
  focusedNode?: string; // path of the focused node
  handleFocus: (path: string) => void;
}) {
  const name = useMemo(() => getPathName(props.node.path), [props.node.path]);

  const [expanded, setExpanded] = useState<boolean>(
    props.initExpanded === undefined ? false : props.initExpanded,
  );

  const onClick = expanded ? () => setExpanded(false) : () => setExpanded(true);

  return <div className="filetree-dir">
    <div
      className={"filetree-item" + (props.visible && expanded ? "" : " hidden")}
      onClick={onClick}
    >
      <div className="filetree-item-icon">
        {expanded
          ? <OpenedFolder fillClass="fill" strokeClass="stroke" />
          : <ClosedFolder fillClass="fill" strokeClass="stroke" />}
      </div>
      {name}
    </div>
    <div
      className={"filetree-dir-children" +
        (props.visible && expanded ? "" : " hidden")}
    >
      {props.node.children.map((node) =>
        node.children
          ? <DirNode
            visible={expanded}
            key={node.path}
            node={node as NodeWithChildren}
            focusedNode={props.focusedNode}
            handleFocus={props.handleFocus}
          />
          : <FileNode
            visible={expanded}
            node={node}
            key={node.path}
            focusedNode={props.focusedNode}
            handleFocus={props.handleFocus}
          />
      )}
    </div>
  </div>;
}

// file tree component
// not meant to be used with another react component
export default function (props: {
  node: NodeWithChildren;
  initFocusedNode?: string; // path of the focused node
  handleFocus: (path: string) => void;
}) {
  // console.log("filetree component", props);

  return <div className="filetree-main">
    <DirNode
      visible={true}
      key={props.node.path}
      initExpanded={true}
      node={props.node}
      focusedNode={props.initFocusedNode}
      handleFocus={props.handleFocus}
    />
  </div>;
}
