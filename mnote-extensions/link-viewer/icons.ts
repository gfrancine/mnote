import { toHtml } from "mnote-util/dom";

export const linkIcon = (_fillClass: string, strokeClass: string) =>
  toHtml(`
  <svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512">
    <path d="M208 352h-64a96 96 0 010-192h64M304 160h64a96 96 0 010 192h-64M163.29 256h187.42" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="36" class="${strokeClass}" />
  </svg>
`);
