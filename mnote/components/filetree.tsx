import { Fragment, h } from "preact";
import { useMemo, useState } from "preact/hooks";
import { getPathName } from "../common/util/path";
import {
  FileTreeNode as Node,
  FileTreeNodeWithChildren,
  FileTreeNodeWithChildren as NodeWithChildren,
} from "../common/types";

function FileNode(props: {
  node: Node;
  focusedNode?: string; // path of the focused node
  handleFocus: (path: string) => void;
}) {
  const name = useMemo(() => getPathName(props.node.path), [props.node.path]);

  const onClick = () => props.handleFocus(props.node.path);

  return <div
    className={"filetree-item" +
      (props.focusedNode === props.node.path ? " focused" : "")}
    onClick={onClick}
  >
    {name}
  </div>;
}

function DirNode(props: {
  node: NodeWithChildren;
  initExpanded?: boolean;
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
      className="filetree-item"
      onClick={onClick}
    >
      {name}
    </div>
    <div className="filetree-dir-children">
      {expanded && props.node.children.map((node) =>
        node.children
          ? <DirNode
            node={node as FileTreeNodeWithChildren}
            focusedNode={props.focusedNode}
            handleFocus={props.handleFocus}
          />
          : <FileNode
            node={node}
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
  console.log("filetree component", props);

  return <div className="filetree-main">
    <DirNode
      initExpanded={true}
      node={props.node}
      focusedNode={props.initFocusedNode}
      handleFocus={props.handleFocus}
    />
  </div>;
}
