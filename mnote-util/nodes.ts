import { naturalCompare } from "../mnote-deps/natural-compare";

export type Node = {
  path: string;
  children?: Node[];
};

export type NodeWithChildren = Required<Node>;

// get an array with a node's children sorted by their type
// (file/directory) and alphabetically

const makeSort =
  (getPathName: (path: string) => string) => (a: Node, b: Node) =>
    naturalCompare(getPathName(a.path), getPathName(b.path));

export function sortChildren(
  getPathName: (path: string) => string,
  node: NodeWithChildren
) {
  const files: Node[] = [];
  const dirs: Node[] = [];
  node.children.forEach((node) => {
    const list = node.children ? dirs : files;
    list.push(node);
  });
  const sort = makeSort(getPathName);
  return [...dirs.sort(sort), ...files.sort(sort)];
}
