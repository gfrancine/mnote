import React, { createRef, useEffect, useMemo, useRef, useState } from "react";
import {
  BlankFile,
  ChevronDown,
  ChevronRight,
  ClosedFolder,
  Nothing,
  OpenedFolder,
} from "./icons-jsx";
import { getPathName } from "mnote-util/path";
import {
  FileTreeHooks,
  FileTreeNode as Node,
  FileTreeNodeWithChildren as NodeWithChildren,
} from "../common/types";
import { TreeChildren, TreeItem } from "./tree";

function FileNode(props: {
  visible?: boolean;
  node: Node;
  focusedNode?: string; // path of the focused node
  hooks?: FileTreeHooks;
}) {
  const name = useMemo(() => getPathName(props.node.path), [props.node.path]);

  const onClick = () => props.hooks?.fileFocused?.(props.node.path);

  return <TreeItem
    text={name}
    icon={<BlankFile fillClass="fill" strokeClass="stroke" />}
    hidden={!props.visible}
    focused={props.focusedNode === props.node.path}
    onClick={onClick}
    draggable
    onDragStart={(e) => {
      console.log("dragstart");
      e.dataTransfer.setData("text/plain", props.node.path);
    }}
    //@ts-ignore: custom dom attribute
    mn-file-path={props.node.path}
  />;
}

function DirNode(props: {
  visible?: boolean; // dir is only shown if state is expanded and this boolean
  node: NodeWithChildren;
  initExpanded?: boolean; // is the dir open at initialization?
  focusedNode?: string; // path of the focused node
  hooks?: FileTreeHooks;
}) {
  const name = useMemo(() => getPathName(props.node.path), [props.node.path]);

  const [expanded, setExpanded] = useState<boolean>(
    props.initExpanded === undefined ? false : props.initExpanded,
  );

  const onClick = expanded ? () => setExpanded(false) : () => setExpanded(true);

  return <div className="filetree-dir">
    <TreeItem
      text={name}
      icon={expanded
        ? <ChevronDown fillClass="fill" strokeClass="stroke" />
        : <ChevronRight fillClass="fill" strokeClass="stroke" />}
      onClick={onClick}
      onDragOver={(e) => {
        console.log("dragover");
        e.preventDefault();
      }}
      onDrop={(e) => {
        const path = e.dataTransfer.getData("text/plain");
        console.log("dropped on dir", path);
        props.hooks?.fileDroppedOnDir?.(props.node.path, path);
      }}
      //@ts-ignore: custom dom attribute
      mn-dir-path={props.node.path}
    />
    <TreeChildren hidden={!(props.visible && expanded)}>
      {props.node.children.map((node) =>
        node.children
          ? <DirNode
            visible={expanded}
            key={node.path}
            node={node as NodeWithChildren}
            hooks={props.hooks}
            focusedNode={props.focusedNode}
          />
          : <FileNode
            visible={expanded}
            node={node}
            key={node.path}
            hooks={props.hooks}
            focusedNode={props.focusedNode}
          />
      )}
    </TreeChildren>
  </div>;
}

// file tree component
// not meant to be used with another react component
export default function (props: {
  node?: NodeWithChildren;
  initFocusedNode?: string; // path of the focused node
  hooks?: FileTreeHooks;
}) {
  // console.log("filetree component", props);

  return <div className="filetree-main">
    {props.node
      ? <DirNode
        visible={true}
        hooks={props.hooks}
        key={props.node.path}
        initExpanded={true}
        node={props.node}
        focusedNode={props.initFocusedNode}
      />
      : <></>}
  </div>;
}
