const WORD_REGEEX = /\b[^\d\W]+\b/g;
const CHAR_REGEX = /[^\d\W]/g;

export function countWords(text: string): number {
  const matches = text.match(WORD_REGEEX);
  return matches ? matches.length : 0;
}

export function countChars(text: string): number {
  const matches = text.match(CHAR_REGEX);
  return matches ? matches.length : 0;
}
