const EXTENSION_REGEX = /(\.[^.]+)[\\/]?$/;
const NAME_REGEX = /([^\\/]+)[\\/]?$/;
const PARENT_REGEX = /(.+)[\\/][^\\/]+[\\/]?$/;

/** returns the entire path if not found */
export function getPathName(path: string): string {
  const matches = path.match(NAME_REGEX);
  if (matches) return matches[1];
  return path;
}

/** returns a blank string if not found */
export function getPathExtension(path: string): string {
  const matches = path.match(EXTENSION_REGEX);
  if (matches) return matches[1];
  return "";
}

/** returns the parent directory path */
export function getPathParent(path: string): string {
  const matches = path.match(PARENT_REGEX);
  if (matches) return matches[1];
  return path;
}
