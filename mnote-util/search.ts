// search

export type Match = {
  start: number;
  end: number;
};

export function getMatches(value: string, searchTerm: string) {
  const matches: Match[] = [];

  while (true) {
    const start = value.indexOf(searchTerm);
    if (start === -1) break;
    const end = start + searchTerm.length;
    value = value.slice(end);
    matches.push({ start, end });
  }

  return matches;
}
