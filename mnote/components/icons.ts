import { toHtml } from "../common/util/dom";

/* class requires stroke property */
export function kebabMenu(className: string): HTMLElement {
  return toHtml(`
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <title>ionicons-v5-f</title>
      <circle cx="256" cy="256" r="32" class="${className}" style="fill:none;stroke-miterlimit:10;stroke-width:32px"/>
      <circle cx="256" cy="416" r="32" class="${className}" style="fill:none;stroke-miterlimit:10;stroke-width:32px"/>
      <circle cx="256" cy="96" r="32" class="${className}" style="fill:none;stroke-miterlimit:10;stroke-width:32px"/>
    </svg>
  `);
}
