import { toHtml } from "mnote-util/dom";

export const linkIcon = (_fillClass: string, strokeClass: string) =>
  toHtml(`
  <svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512">
    <path d="M208 352h-64a96 96 0 010-192h64M304 160h64a96 96 0 010 192h-64M163.29 256h187.42" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="36" class="${strokeClass}" />
  </svg>
`);

export const copyIcon = (_fillClass: string, strokeClass: string) =>
  toHtml(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect x="128" y="128" width="336" height="336" rx="57" ry="57" fill="none" stroke-linejoin="round" stroke-width="32" class="${strokeClass}" />
    <path d="M383.5 128l.5-24a56.16 56.16 0 00-56-56H112a64.19 64.19 0 00-64 64v216a56.16 56.16 0 0056 56h24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" class="${strokeClass}" />
  </svg>
`);
