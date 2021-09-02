import React, { ReactNode } from "react";
import { Range } from "mnote-util/search";

export function Highlight({ text, ranges }: {
  text: string,
  ranges: Range[],
}) {
  const nodes: ReactNode[] = [];

  let lastEnd = 0;
  for (const range of ranges) {
    const start = range.start > lastEnd ? range.start : lastEnd;
    const before = text.slice(lastEnd, start);
    const highlighted = text.slice(start, range.end);
    nodes.push(before);
    nodes.push(<mark>{highlighted}</mark>);
    lastEnd = range.end;
  }

  return <>{nodes}</>;
}