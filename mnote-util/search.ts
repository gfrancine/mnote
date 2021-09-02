// search

export type Range = {
  start: number;
  end: number;
};

export function getMatchingRanges(value: string, searchTerm: string) {
  const matches: Range[] = [];

  let offset = 0;
  while (true) {
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
