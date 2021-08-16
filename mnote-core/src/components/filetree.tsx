import React, { useMemo, useState } from "react";
import { BlankFile, ChevronDown, ChevronRight } from "./icons-jsx";
import { getPathName } from "mnote-util/path";
import {
  FileTreeHooks,
  FileTreeNode as Node,
  FileTreeNodeWithChildren as NodeWithChildren,
} from "../common/types";
import { TreeChildren, TreeItem } from "./tree";

const DRAG_DATA_TYPE = "mn-filetree-drag-data";

type FileTreeDragData = {
  kind: "file" | "dir";
  path: string;
};

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
      e.dataTransfer.setData(
        DRAG_DATA_TYPE,
        JSON.stringify({
          path: props.node.path,
          kind: "file",
        }),
      );
    }}
    //@ts-ignore: custom dom attribute
    mn-file-path={props.node.path}
  />;
}

function DirNode(props: {
  visible?: boolean; // dir is only shown if state is expanded and this boolean
  node: NodeWithChildren;
  draggable?: boolean;
  initExpanded?: boolean; // is the dir open at initialization?
  focusedNode?: string; // path of the focused node
  hooks?: FileTreeHooks;
}) {
  const name = useMemo(() => getPathName(props.node.path), [props.node.path]);

  // sort by name and by type (directories go first)
  const sortedChildren = useMemo(
    () =>
      props.node.children
        .slice()
        .sort((a, b) => getPathName(a.path) > getPathName(b.path) ? 1 : -1)
        .sort((a, b) => {
          if (a.children && b.children) return 0;
          if (!a.children && !b.children) return 0;
          if (a.children) return -1;
          return 1;
        }),
    [props.node.children],
  );

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
        const data = e.dataTransfer.getData(DRAG_DATA_TYPE);
        try {
          const dragData: FileTreeDragData = JSON.parse(data);
          console.log("dropped on dir", dragData);
          if (dragData.kind === "file") {
            props.hooks?.fileDroppedOnDir?.(props.node.path, dragData.path);
          } else {
            props.hooks?.dirDroppedOnDir?.(props.node.path, dragData.path);
          }
        } catch (err) {
          console.log("drag failure", err, data);
        }
      }}
      draggable
      onDragStart={(e) => {
        console.log("dragstart");
        e.dataTransfer.setData(
          DRAG_DATA_TYPE,
          JSON.stringify({
            path: props.node.path,
            kind: "dir",
          }),
        );
      }}
      //@ts-ignore: custom dom attribute
      mn-dir-path={props.node.path}
    />
    <TreeChildren hidden={!(props.visible && expanded)}>
      {sortedChildren.map((node) =>
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
        visible
        hooks={props.hooks}
        key={props.node.path}
        initExpanded
        draggable={false}
        node={props.node}
        focusedNode={props.initFocusedNode}
      />
      : <></>}
  </div>;
}
