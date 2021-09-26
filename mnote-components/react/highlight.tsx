import React, { ReactNode } from "react";
import { MatchRange } from "mnote-util/search";

export function Highlight({ text, ranges }: {
  text: string;
  ranges: MatchRange[];
}) {
  const nodes: ReactNode[] = [];

  let lastEnd = 0;
  for (const range of ranges) {
    const start = range.start > lastEnd ? range.start : lastEnd;
    const before = text.slice(lastEnd, start);
    const highlighted = text.slice(start, range.end);
    nodes.push(<span key={nodes.length}>{before}</span>);
    nodes.push(<mark key={nodes.length}>{highlighted}</mark>);
    lastEnd = range.end;
  }

  nodes.push(
    <span key={nodes.length}>{text.slice(lastEnd, text.length)}</span>,
  );

  return <span>{nodes}</span>;
}
