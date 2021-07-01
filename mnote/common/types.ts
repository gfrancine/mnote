// common types used by the files
// has no dependencies, except for standalone
// utilities like Emitter

export type Module = unknown;

export type Mnote = {
  element: Element;

  modules: Record<string, Module>;

  addModule: (name: string, module: Module) => Mnote;
};
