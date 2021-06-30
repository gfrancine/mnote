// used by the extension module
export interface Extension {
  startup(): void;
  cleanup(): void;
}
