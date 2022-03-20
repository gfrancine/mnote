// search

export type MatchRange = {
  start: number;
  end: number;
};

export function getMatchingRanges(value: string, searchTerm: string) {
  const matches: MatchRange[] = [];

  let offset = 0;
  for (;;) {
    const slice = value.slice(offset);
    const index = slice.indexOf(searchTerm);
    if (index === -1) break;
    const start = index + offset;
    const end = start + searchTerm.length;
    matches.push({ start, end });
    offset = end;
  }

  return matches;
}
