import { toHtml } from "mnote-util/dom";

export const excalidrawIcon = (_fillClass: string, strokeClass: string) =>
  toHtml(`
  <svg viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 364L184.93 57L112 0L0 86L56.3956 270.378" transform="matrix(-1 0 0 -1 368 480.00024)"
      fill="none" fill-rule="evenodd"  stroke-width="32" stroke-linecap="round" stroke-linejoin="round"
      class="${strokeClass}"/>
    <path d="M0 364L184.93 57L112 0L0 86L56.3956 270.378" transform="translate(144 32.000244)"
      fill="none" fill-rule="evenodd" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"
      class="${strokeClass}"/>
  </svg>
`);
