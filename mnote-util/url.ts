export const isWeb = (src: string) =>
  src.startsWith("https://") || src.startsWith("http://");

export const isData = (src: string) => src.startsWith("data:");
