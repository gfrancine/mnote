export const strings = {
  noStartPath: (startPath: string) =>
    `Oops - we couldn't find the path "${startPath}". Try relaunching the app.`,
  confirmSaveBeforeClose: () =>
    "Would you like to save the current document before closing?",
  loadError: (err: unknown) => `An error occurred while loading: ${err}`,
  saveError: (err: unknown) => `An error occurred while saving: ${err}`,
  openErrorUnsupported: (path: string) =>
    `Cannot open file ${path} because its document type is not supported.`,
  editorDoesNotExist: (kind: string) =>
    `Editor of kind "${kind}" does not exist!`,
  editorAlreadyExists: (kind: string) =>
    `Editor of kind "${kind}" already exists!`,
};
