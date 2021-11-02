declare module "iv-viewer" {
  type Options = {
    snapView?: boolean;
  };

  declare class IvViewer {
    constructor(element: HTMLElement, opts?: Options);
  }

  export default IvViewer;
}
