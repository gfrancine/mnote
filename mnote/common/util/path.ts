const EXTENSION_REGEX = /(\.[^.]+)$/;
const NAME_REGEX = /([^\\/])+$/;

/** returns the entire path if not found */
export function getPathName(path: string): string {
  const matches = path.match(NAME_REGEX);
  if (matches) return matches[0];
  return path;
}

/** returns a blank string if not found */
export function getPathExtension(path: string): string {
  const matches = path.match(EXTENSION_REGEX);
  if (matches) return matches[0];
  return "";
}
