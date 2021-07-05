import { Fragment, h } from "preact";
import { useMemo, useState } from "preact/hooks";
import { getPathName } from "../common/util/path";

type Node = {
  path: string; // path is the unique id
  children?: Node[]; // if none, it's a file node
};

type NodeWithChildren = {
  path: string; // path is the unique id
  children?: Node[]; // if none, it's a file node
};

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

  return <div className="filetree-dir" onClick={onClick}>
    <div className="filetree-item">
      {name}
    </div>
    <div className="filetree-dir-children">
      {props.node.children.map((node) =>
        node.children
          ? <DirNode
            node={props.node}
            focusedNode={props.focusedNode}
            handleFocus={props.handleFocus}
          />
          : <FileNode
            node={props.node}
            focusedNode={props.focusedNode}
            handleFocus={props.handleFocus}
          />
      )}
    </div>
  </div>;
}

export default function (props: {
  node: NodeWithChildren;
  focusedNode?: string; // path of the focused node
  handleFocus: (path: string) => void;
}) {
  return <div className="filetree-main">
    <DirNode
      initExpanded={true}
      node={props.node}
      focusedNode={props.focusedNode}
      handleFocus={props.handleFocus}
    />
  </div>;
}
