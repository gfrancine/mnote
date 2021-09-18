// strings for throwing errors internally
export const errorStrings = {
  editorDoesNotExist: (kind: string) =>
    `Editor of kind "${kind}" does not exist!`,
  editorAlreadyExists: (kind: string) =>
    `Editor of kind "${kind}" already exists!`,
  noLocale: (kind: string) => `No registered locale of kind ${kind}!`,
};

// strings presented to the end user
export const enStrings = {
  // prompt messages
  confirmSaveBeforeClose:
    "Would you like to save the current document before closing?",
  noStartPath: (startPath: string) =>
    `The path "${startPath}" could not be found. Try relaunching the app or manually opening a file from the menu in the top right`,
  loadError: (err: unknown) => `An error occurred while loading: ${err}`,
  saveError: (err: unknown) => `An error occurred while saving: ${err}`,
  openErrorUnsupported: (path: string) =>
    `Cannot open file ${path} because its document type is not supported.`,
  // prompt buttons
  cancel: "Cancel",
  save: "Save",
  dontSave: "Don't save",
  // placeholders
  fileTreePlaceholder: "No Opened Folder",
  editorPlaceholder:
    "Click the three dots on the top right to open a file or folder.",
  // context menu & menu
  openEditor: "Open Editor",
  closeEditor: "Close Editor",
  saveEditor: "Save Editor",
  dialogOpenFile: "Open File...",
  dialogOpenFolder: "Open Folder...",
  refreshFolder: "Refresh Folder",
  newFolder: "New Folder", // displayed on context menu
  createNewFolder: "Create new folder", // displayed on prompt
  newFile: "New File",
  createNewFile: "Create new file",
  openFile: "Open file",
  deleteFile: "Delete file",
  renameFile: "Rename file",
  renameFilePrompt: (fullFileName: string) => `Rename file "${fullFileName}"`,
  deleteFolder: "Delete folder",
  renameFolder: "Rename folder",
  renameFolderPrompt: (folderName: string) => `Rename folder "${folderName}"`,
  dialogSaveAs: "Save As...",
  // tips from createIcon
  createNewFileTip: "Create a new file",
  toggleSidebarTip: "Toggle the sidebar",
  menuTip: "Menu",
};
