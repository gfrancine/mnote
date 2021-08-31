import React, { useEffect, useMemo, useState } from "react";
import { BlankFile, ChevronDown, ChevronRight } from "./icons-jsx";
import { getPathName } from "mnote-util/path";
import {
  FileTreeHooks,
  FileTreeNode as Node,
  FileTreeNodeWithChildren as NodeWithChildren,
} from "../common/types";
import { ElementToReact, TreeChildren, TreeItem } from "./tree";
import { sortChildren } from "mnote-util/nodes";

const DRAG_DATA_TYPE = "mn-filetree-drag-data";

type FileTreeDragData = {
  kind: "file" | "dir";
  path: string;
};

type FileIconFactory = (
  node: Node,
  fillClass: string,
  strokeClass: string,
) => Element | void;

// dry for the drop handler
const makeDropHandler = (dirPath: string, hooks?: FileTreeHooks) =>
  (e: React.DragEvent<HTMLElement>) => {
    const data = e.dataTransfer.getData(DRAG_DATA_TYPE);
    const dragData: FileTreeDragData = JSON.parse(data);
    if (dragData.kind === "file") {
      hooks?.fileDroppedOnDir?.(dirPath, dragData.path);
    } else {
      hooks?.dirDroppedOnDir?.(dirPath, dragData.path);
    }
  };

function FileNode(props: {
  parentPath: string;
  visible?: boolean;
  node: Node;
  focusedPath?: string; // path of the focused node
  hooks?: FileTreeHooks;
  getFileIcon?: FileIconFactory;
}) {
  const name = useMemo(() => getPathName(props.node.path), [props.node.path]);

  const onClick = () => props.hooks?.fileFocused?.(props.node.path);

  const [isDraggedOver, setDraggedOver] = useState(false);

  return props.visible
    ? <TreeItem
      text={name}
      icon={(() => {
        if (props.getFileIcon) {
          const icon = props.getFileIcon(props.node, "fill", "stroke");
          if (icon) return <ElementToReact element={icon} />;
        }
        return <BlankFile fillClass="fill" strokeClass="stroke" />;
      })()}
      focused={props.focusedPath === props.node.path || isDraggedOver}
      onClick={onClick}
      draggable
      onDragStart={(e) =>
        e.dataTransfer.setData(
          DRAG_DATA_TYPE,
          JSON.stringify({
            path: props.node.path,
            kind: "file",
          }),
        )}
      onDragEnter={() => setDraggedOver(true)}
      onDragLeave={() => setDraggedOver(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        makeDropHandler(props.parentPath, props.hooks)(e);
        setDraggedOver(false);
      }}
      className="filetree-item" // used by context menu
      //@ts-ignore: custom dom attribute
      mn-file-path={props.node.path}
    />
    : <></>;
}

function DirNode(props: {
  visible?: boolean; // dir is only shown if state is expanded and this boolean
  node: NodeWithChildren;
  draggable?: boolean;
  initExpanded?: boolean; // is the dir open at initialization?
  focusedPath?: string; // path of the focused node
  hooks?: FileTreeHooks;
  getFileIcon?: FileIconFactory;
}) {
  const name = useMemo(() => getPathName(props.node.path), [props.node.path]);

  // sort by name and by type (directories go first)
  const sortedChildren = useMemo(
    () => sortChildren(props.node),
    [props.node.children],
  );

  const [expanded, setExpanded] = useState<boolean>(
    props.initExpanded === undefined ? false : props.initExpanded,
  );

  useEffect(() => {
    if (!props.focusedPath) return;
    if (props.focusedPath.search(props.node.path) > -1) {
      setExpanded(true);
    }
  }, [props.focusedPath]);

  const onClick = expanded ? () => setExpanded(false) : () => setExpanded(true);

  const [isDraggedOver, setDraggedOver] = useState(false);

  return <div className="filetree-dir">
    <TreeItem
      text={name}
      icon={expanded
        ? <ChevronDown fillClass="fill" strokeClass="stroke" />
        : <ChevronRight fillClass="fill" strokeClass="stroke" />}
      onClick={onClick}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        makeDropHandler(props.node.path, props.hooks)(e);
        setDraggedOver(false);
      }}
      onDragEnter={() => setDraggedOver(true)}
      onDragLeave={() => setDraggedOver(false)}
      draggable
      onDragStart={(e) =>
        e.dataTransfer.setData(
          DRAG_DATA_TYPE,
          JSON.stringify({
            path: props.node.path,
            kind: "dir",
          }),
        )}
      className="filetree-item"
      focused={isDraggedOver}
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
            focusedPath={props.focusedPath}
            getFileIcon={props.getFileIcon}
          />
          : <FileNode
            parentPath={props.node.path}
            visible={expanded}
            node={node}
            key={node.path}
            hooks={props.hooks}
            focusedPath={props.focusedPath}
            getFileIcon={props.getFileIcon}
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
  getFileIcon?: FileIconFactory;
}) {
  return <div className="filetree-main">
    {props.node
      ? <DirNode
        visible
        hooks={props.hooks}
        key={props.node.path}
        initExpanded
        draggable={false}
        node={props.node}
        focusedPath={props.initFocusedNode}
        getFileIcon={props.getFileIcon}
      />
      : <></>}
  </div>;
}
