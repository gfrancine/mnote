import React, { useEffect, useRef, useMemo, useState } from "react";
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

type FileIconFactory = (
  node: Node,
  fillClass: string,
  strokeClass: string
) => Element | void;

function searchFileTree(
  tree: NodeWithChildren,
  searchTerm: string,
  getPathName: (path: string) => string
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
  isParentDraggedOver: boolean;
  setParentDraggedOver: (value: boolean) => unknown;
  handleDrop: (targetPath: string, targetDirPath: string) => unknown;
  node: Node;
  openedFilePath?: string; // path of the selected file
  isShiftDown: boolean;
  hooks?: FileTreeHooks;
  selectedPaths: Record<string, "file" | "dir">;
  setSelectedPaths: (paths: Record<string, "file" | "dir">) => unknown;
  togglePathSelected: (path: string, kind: "file" | "dir") => unknown;
  getFileIcon?: FileIconFactory;
  searchResults?: Record<string, MatchRange[]>;
  disableRename?: boolean;
  getPathName: (path: string) => string;
}) {
  const name = useMemo(
    () => props.getPathName(props.node.path),
    [props.node.path]
  );

  const onClick = () => {
    if (props.isShiftDown) {
      props.togglePathSelected(props.node.path, "file");
    } else {
      props.hooks?.fileClicked?.(props.node.path);
      props.setSelectedPaths({});
    }
  };

  const isSearching = props.searchResults !== undefined;
  const searchResultRanges = props.searchResults?.[props.node.path];

  return props.visible &&
    (isSearching ? searchResultRanges !== undefined : true) ? (
    <TreeItem
      text={
        searchResultRanges ? (
          <Highlight text={name} ranges={searchResultRanges} />
        ) : (
          name
        )
      }
      icon={(() => {
        if (props.getFileIcon) {
          const icon = props.getFileIcon(props.node, "fill", "stroke");
          if (icon) return <ElementToReact element={icon} />;
        }
        return <BlankFile fillClass="fill" strokeClass="stroke" />;
      })()}
      selected={
        props.openedFilePath === props.node.path ||
        props.selectedPaths[props.node.path] !== undefined
      }
      hovered={props.isParentDraggedOver}
      onClick={onClick}
      draggable
      onDragStart={() => {
        if (props.selectedPaths[props.node.path] === undefined) {
          props.setSelectedPaths({
            [props.node.path]: "file",
          });
        }
      }}
      onDragEnter={() => props.setParentDraggedOver(true)}
      onDragLeave={() => props.setParentDraggedOver(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => {
        props.handleDrop(props.node.path, props.parentPath);
        props.setParentDraggedOver(false);
      }}
      className="filetree-item" // used by context menu
      data-mn-file-path={props.node.path}
      data-mn-disable-rename={props.disableRename}
    />
  ) : (
    <></>
  );
}

function DirNode(props: {
  visible?: boolean; // dir is only shown if state is expanded and this boolean
  node: NodeWithChildren;
  draggable?: boolean;
  handleDrop: (targetPath: string, targetDirPath: string) => unknown;
  initExpanded?: boolean; // is the dir open at initialization?
  overrideAutoExpand?: boolean; // should it expand when it has the selected path?
  disableRename?: boolean;
  openedFilePath?: string; // path of the selected file
  selectable?: boolean;
  isShiftDown: boolean;
  selectedPaths: Record<string, "file" | "dir">;
  setSelectedPaths: (paths: Record<string, "file" | "dir">) => unknown;
  togglePathSelected: (path: string, kind: "file" | "dir") => unknown;
  hooks?: FileTreeHooks;
  getFileIcon?: FileIconFactory;
  searchResults?: Record<string, MatchRange[]>;
  getPathName: (path: string) => string;
  ensureSeparatorAtEnd: (path: string) => string;
}) {
  const name = props.getPathName(props.node.path);

  // sort by name and by type (directories go first)
  const sortedChildren = useMemo(
    () => sortChildren(props.getPathName, props.node),
    [props.node.children]
  );

  const [expanded, setExpanded] = useState<boolean>(
    props.initExpanded === undefined ? false : props.initExpanded
  );

  useEffect(() => {
    if (!props.openedFilePath) return;
    if (props.overrideAutoExpand) return;
    if (
      props.openedFilePath.startsWith(
        props.ensureSeparatorAtEnd(props.node.path)
      )
    ) {
      setExpanded(true);
    }
  }, [props.openedFilePath]);

  const hasSearchResult = useMemo(() => {
    if (!props.searchResults) return false;
    for (const path of Object.keys(props.searchResults)) {
      if (path !== props.node.path && path.startsWith(props.node.path)) {
        return true;
      }
    }
    return false;
  }, [props.searchResults]);

  useEffect(() => {
    if (hasSearchResult) setExpanded(true);
  }, [hasSearchResult]);

  const searchResultRanges = props.searchResults?.[props.node.path];

  const onClick = () => {
    if (props.isShiftDown && props.selectable) {
      props.togglePathSelected(props.node.path, "dir");
    } else {
      setExpanded(!expanded);
      props.setSelectedPaths({});
    }
  };

  const [isDraggedOver, setDraggedOver] = useState(false);

  // hide the directory if it's not a search result or doesn't contain one
  // const isOrHasSearchResult = props.searchResults
  //  ? (hasSearchResult || (searchResultRanges !== undefined))
  //  : true;

  return (
    <div className={"filetree-dir " + (isDraggedOver ? "dragged-over " : "")}>
      <TreeItem
        hidden={!(props.visible /* && isOrHasSearchResult */)}
        text={
          searchResultRanges ? (
            <Highlight text={name} ranges={searchResultRanges} />
          ) : (
            name
          )
        }
        icon={
          expanded ? (
            <ChevronDown fillClass="fill" strokeClass="stroke" />
          ) : (
            <ChevronRight fillClass="fill" strokeClass="stroke" />
          )
        }
        onClick={onClick}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={() => {
          props.handleDrop(props.node.path, props.node.path);
          setDraggedOver(false);
        }}
        onDragEnter={() => setDraggedOver(true)}
        onDragLeave={() => setDraggedOver(false)}
        draggable
        onDragStart={() => {
          if (props.selectedPaths[props.node.path] === undefined) {
            props.setSelectedPaths({
              [props.node.path]: "dir",
            });
          }
        }}
        className="filetree-item"
        selected={props.selectedPaths[props.node.path] !== undefined}
        hovered={isDraggedOver}
        data-mn-dir-path={props.node.path}
        data-mn-disable-rename={props.disableRename}
      />
      <TreeChildren hidden={!(props.visible && expanded)}>
        {sortedChildren.map((node) =>
          node.children ? (
            <DirNode
              visible={expanded}
              key={node.path}
              node={node as NodeWithChildren}
              handleDrop={props.handleDrop}
              hooks={props.hooks}
              openedFilePath={props.openedFilePath}
              isShiftDown={props.isShiftDown}
              selectable
              selectedPaths={props.selectedPaths}
              setSelectedPaths={props.setSelectedPaths}
              togglePathSelected={props.togglePathSelected}
              getFileIcon={props.getFileIcon}
              searchResults={props.searchResults}
              getPathName={props.getPathName}
              ensureSeparatorAtEnd={props.ensureSeparatorAtEnd}
            />
          ) : (
            <FileNode
              parentPath={props.node.path}
              visible={expanded}
              isParentDraggedOver={isDraggedOver}
              setParentDraggedOver={setDraggedOver}
              handleDrop={props.handleDrop}
              node={node}
              key={node.path}
              hooks={props.hooks}
              openedFilePath={props.openedFilePath}
              isShiftDown={props.isShiftDown}
              selectedPaths={props.selectedPaths}
              setSelectedPaths={props.setSelectedPaths}
              togglePathSelected={props.togglePathSelected}
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
  initOpenedFile?: string; // path of the selected node
  hooks?: FileTreeHooks;
  getFileIcon?: FileIconFactory;
  searchTerm?: string;
  getPathName: (path: string) => string;
  ensureSeparatorAtEnd: (path: string) => string;
}) {
  // selection
  const [isShiftDown, setIsShiftDown] = useState(false);
  const [selectedPaths, setSelectedPaths] = useState<
    Record<string, "file" | "dir">
  >({});

  const ref = useRef<HTMLDivElement>(null);

  const togglePathSelected = (path: string, kind: "file" | "dir") => {
    if (selectedPaths[path]) {
      const newSelectedPaths = { ...selectedPaths };
      delete newSelectedPaths[path];
      setSelectedPaths(newSelectedPaths);
    } else {
      const newSelectedPaths = { ...selectedPaths };
      newSelectedPaths[path] = kind;
      setSelectedPaths(newSelectedPaths);
    }
  };

  const handleDrop = (targetPath: string, targetDirPath: string) => {
    if (selectedPaths[targetPath]) return;
    setSelectedPaths({});
    // files go first
    const files: string[] = [];
    const dirs: string[] = [];
    Object.entries(selectedPaths).forEach(([path, kind]) => {
      if (kind === "dir") dirs.push(path);
      else files.push(path);
    });
    files.forEach((path) =>
      props.hooks?.fileDroppedOnDir?.(targetDirPath, path)
    );
    // dirs shouldn't be dropped on a dir inside it
    dirs.forEach((path) => {
      if (path.startsWith(props.ensureSeparatorAtEnd(targetDirPath))) {
        props.hooks?.dirDroppedOnDir?.(targetDirPath, path);
      }
    });
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShiftDown(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShiftDown(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  });

  useEffect(() => {
    const onClickAway = (e: MouseEvent) => {
      if (
        ref.current &&
        e.target &&
        !ref.current.contains(e.target as Element)
      ) {
        setSelectedPaths({});
      }
    };
    window.addEventListener("click", onClickAway);
    return () => window.removeEventListener("click", onClickAway);
  });

  // search
  const searchResults = useMemo(() => {
    if (!props.searchTerm) return;
    return searchFileTree(props.node, props.searchTerm, props.getPathName);
  }, [props.searchTerm, props.node]);

  return (
    <div className="filetree-main" ref={ref}>
      {props.node ? (
        <DirNode
          visible
          hooks={props.hooks}
          key={props.node.path}
          initExpanded
          draggable={false}
          selectable={false}
          handleDrop={handleDrop}
          node={props.node}
          overrideAutoExpand
          openedFilePath={props.initOpenedFile}
          isShiftDown={isShiftDown}
          selectedPaths={selectedPaths}
          setSelectedPaths={setSelectedPaths}
          togglePathSelected={togglePathSelected}
          getFileIcon={props.getFileIcon}
          searchResults={searchResults}
          disableRename
          getPathName={props.getPathName}
          ensureSeparatorAtEnd={props.ensureSeparatorAtEnd}
        />
      ) : (
        <></>
      )}
    </div>
  );
}
