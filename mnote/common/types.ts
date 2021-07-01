// common types used by the files
// has no dependencies, except for standalone
// utilities like Emitter

export type Module = unknown;

export type Mnote = {
  element: Element;

  modules: Record<string, Module>;

  addModule: (name: string, module: Module) => Mnote;
};

// options mainly for interop
// 1. app receives these options, including functions for modules
// 2. app creates some of the modules with arguments from here
//    (for example, instantiate fs module with the fs object)
// 3. modules: if they don't receive the argument, mock all the
//    functionality
export type MnoteOptions = {
  /*
  args?: string[]
  fs?: { readDir, readFile, etc }
  */
};
