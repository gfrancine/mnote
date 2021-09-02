import { getPathName } from "./path";
import { getMatchingRanges, MatchRange } from "./search";

export type Node = {
  path: string;
  children?: Node[];
};

export type NodeWithChildren = Required<Node>;

// get an array with a node's children sorted by their type
// (file/directory) and alphabetically

const sort = (a: Node, b: Node) =>
  getPathName(a.path) > getPathName(b.path) ? 1 : -1;

export function sortChildren(node: NodeWithChildren) {
  const files: Node[] = [];
  const dirs: Node[] = [];
  node.children.forEach((node) => {
    const list = node.children ? dirs : files;
    list.push(node);
  });
  return [...dirs.sort(sort), ...files.sort(sort)];
}

export type PathSearchResults = Record<string, MatchRange[]>;

export function searchForPaths(root: NodeWithChildren, searchTerm: string) {
  const results: PathSearchResults = {};
  if (searchTerm.length < 1) return results;

  const recurse = (node: Node) => {
    if (node.children) {
      node.children.forEach(recurse);
    } else {
      const ranges = getMatchingRanges(getPathName(node.path), searchTerm);
      if (ranges.length < 1) return;
      results[node.path] = ranges;
    }
  };

  recurse(root);
  return results;
}
