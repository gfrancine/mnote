import { toHtml } from "mnote-util/dom";

export function htmlIcon(_fillClass: string, strokeClass: string) {
  return toHtml(
    `<svg viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <path d="M104 0L0 104L104 208" transform="translate(48 152)" fill="none" fill-rule="evenodd" 
      class="${strokeClass}" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M0 0L104 104L0 208" transform="translate(360 152)" fill="none" fill-rule="evenodd" 
      class="${strokeClass}" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M103 0L0 312" transform="translate(204 100)" fill="none" fill-rule="evenodd" 
      class="${strokeClass}" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" />
  </svg>`,
  );
}
