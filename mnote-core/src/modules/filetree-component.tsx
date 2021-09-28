import React, { useEffect, useMemo, useState } from "react";
import {
  BlankFile,
  ChevronDown,
  ChevronRight,
} from "mnote-components/react/icons-jsx";
import {
  FileTreeHooks,
  FileTreeNode as Node,
  FileTreeNodeWithChildren as NodeWithChildren,
} from "../common/types";
import {
  ElementToReact,
  TreeChildren,
  TreeItem,
} from "mnote-components/react/tree";
import { getMatchingRanges, MatchRange } from "mnote-util/search";
import { sortChildren } from "mnote-util/nodes";
import { Highlight } from "mnote-components/react/highlight";

const DRAG_DATA_TYPE = "data-mn-filetree-drag-data";

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

function searchFileTree(
  tree: NodeWithChildren,
  searchTerm: string,
  getPathName: (path: string) => string,
) {
  const results: Record<string, MatchRange[]> = {};
  if (searchTerm.length < 1) return results;

  const recurse = (node: Node) => {
    const ranges = getMatchingRanges(getPathName(node.path), searchTerm);
    if (ranges.length > 0) results[node.path] = ranges;
    if (node.children) {
      node.children.forEach(recurse);
    }
  };

  recurse(tree);
  return results;
}

function FileNode(props: {
  parentPath: string;
  visible?: boolean;
  node: Node;
  focusedPath?: string; // path of the focused node
  hooks?: FileTreeHooks;
  getFileIcon?: FileIconFactory;
  searchResults?: Record<string, MatchRange[]>;
  disableRename?: boolean;
  getPathName: (path: string) => string;
}) {
  const name = useMemo(() => props.getPathName(props.node.path), [
    props.node.path,
  ]);

  const onClick = () => props.hooks?.fileFocused?.(props.node.path);

  const isSearching = props.searchResults !== undefined;
  const searchResultRanges = props.searchResults?.[props.node.path];

  const [isDraggedOver, setDraggedOver] = useState(false);

  return props.visible &&
      (isSearching ? searchResultRanges !== undefined : true)
    ? (
      <TreeItem
        text={searchResultRanges
          ? <Highlight text={name} ranges={searchResultRanges} />
          : name}
        icon={(() => {
          if (props.getFileIcon) {
            const icon = props.getFileIcon(props.node, "fill", "stroke");
            if (icon) return <ElementToReact element={icon} />;
          }
          return <BlankFile fillClass="fill" strokeClass="stroke" />;
        })()}
        focused={props.focusedPath === props.node.path}
        hovered={isDraggedOver}
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
        data-mn-file-path={props.node.path}
        data-mn-disable-rename={props.disableRename}
      />
    )
    : <></>;
}

function DirNode(props: {
  visible?: boolean; // dir is only shown if state is expanded and this boolean
  node: NodeWithChildren;
  draggable?: boolean;
  initExpanded?: boolean; // is the dir open at initialization?
  overrideAutoExpand?: boolean; // should it expand when it has the focused path?
  disableRename?: boolean;
  focusedPath?: string; // path of the focused node
  hooks?: FileTreeHooks;
  getFileIcon?: FileIconFactory;
  searchResults?: Record<string, MatchRange[]>;
  getPathName: (path: string) => string;
}) {
  const name = useMemo(() => props.getPathName(props.node.path), [
    props.node.path,
  ]);

  // sort by name and by type (directories go first)
  const sortedChildren = useMemo(
    () => sortChildren(props.getPathName, props.node),
    [props.node.children],
  );

  const [expanded, setExpanded] = useState<boolean>(
    props.initExpanded === undefined ? false : props.initExpanded,
  );

  useEffect(() => {
    if (!props.focusedPath) return;
    if (props.overrideAutoExpand) return;
    if (props.focusedPath.search(props.node.path) > -1) {
      setExpanded(true);
    }
  }, [props.focusedPath]);

  const hasSearchResult = useMemo(() => {
    if (!props.searchResults) return false;
    for (const path of Object.keys(props.searchResults)) {
      if (path !== props.node.path && path.search(props.node.path) > -1) {
        return true;
      }
    }
    return false;
  }, [props.searchResults]);

  useEffect(() => {
    if (hasSearchResult) setExpanded(true);
  }, [hasSearchResult]);

  const searchResultRanges = props.searchResults?.[props.node.path];

  const onClick = expanded ? () => setExpanded(false) : () => setExpanded(true);

  const [isDraggedOver, setDraggedOver] = useState(false);

  // hide the directory if it's not a search result or doesn't contain one
  // const isOrHasSearchResult = props.searchResults
  //  ? (hasSearchResult || (searchResultRanges !== undefined))
  //  : true;

  return (
    <div className="filetree-dir">
      <TreeItem
        hidden={!(props.visible /* && isOrHasSearchResult */)}
        text={searchResultRanges
          ? <Highlight text={name} ranges={searchResultRanges} />
          : name}
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
        hovered={isDraggedOver}
        data-mn-dir-path={props.node.path}
        data-mn-disable-rename={props.disableRename}
      />
      <TreeChildren hidden={!(props.visible && expanded)}>
        {sortedChildren.map((node) =>
          node.children
            ? (
              <DirNode
                visible={expanded}
                key={node.path}
                node={node as NodeWithChildren}
                hooks={props.hooks}
                focusedPath={props.focusedPath}
                getFileIcon={props.getFileIcon}
                searchResults={props.searchResults}
                getPathName={props.getPathName}
              />
            )
            : (
              <FileNode
                parentPath={props.node.path}
                visible={expanded}
                node={node}
                key={node.path}
                hooks={props.hooks}
                focusedPath={props.focusedPath}
                getFileIcon={props.getFileIcon}
                searchResults={props.searchResults}
                getPathName={props.getPathName}
              />
            )
        )}
      </TreeChildren>
    </div>
  );
}

// file tree component
// not meant to be used with another react component
export default function (props: {
  node: NodeWithChildren;
  initFocusedNode?: string; // path of the focused node
  hooks?: FileTreeHooks;
  getFileIcon?: FileIconFactory;
  searchTerm?: string;
  getPathName: (path: string) => string;
}) {
  const searchResults = useMemo(() => {
    if (!props.searchTerm) return;
    return searchFileTree(props.node, props.searchTerm, props.getPathName);
  }, [props.searchTerm, props.node]);

  return (
    <div className="filetree-main">
      {props.node
        ? (
          <DirNode
            visible
            hooks={props.hooks}
            key={props.node.path}
            initExpanded
            draggable={false}
            node={props.node}
            overrideAutoExpand
            focusedPath={props.initFocusedNode}
            getFileIcon={props.getFileIcon}
            searchResults={searchResults}
            disableRename
            getPathName={props.getPathName}
          />
        )
        : <></>}
    </div>
  );
}
