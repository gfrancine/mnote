import { toHtml } from "mnote-util/dom";

// icons will require a stroke class and a fill class. stroke
// classes will have the color in the stroke property and so on

export type IconsList = typeof icons;

export const titleAlt = (alt?: string) => alt ? `<title>${alt}</title>` : "";

export function createIcon(
  name: keyof IconsList,
  fillClass: string,
  strokeClass: string,
  alt?: string,
) {
  return icons[name](fillClass, strokeClass, alt);
}

const icons = {
  //
  kebabMenu: (
    _fillClass: string,
    strokeClass: string,
    alt?: string,
  ) =>
    toHtml(`
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      ${titleAlt(alt)}
      <circle cx="256" cy="256" r="32" class="${strokeClass}" style="fill:none;stroke-miterlimit:10;stroke-width:32px"/>
      <circle cx="256" cy="416" r="32" class="${strokeClass}" style="fill:none;stroke-miterlimit:10;stroke-width:32px"/>
      <circle cx="256" cy="96" r="32" class="${strokeClass}" style="fill:none;stroke-miterlimit:10;stroke-width:32px"/>
    </svg>
  `),
  //
  add: (
    _fillClass: string,
    strokeClass: string,
    alt?: string,
  ) =>
    toHtml(`
    <svg viewBox="0 0 512 512" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg">
      ${titleAlt(alt)}
      <defs>
        <path d="M0 0L512 0L512 512L0 512L0 0Z" id="path_1" />
        <clipPath id="mask_1">
          <use xlink:href="#path_1" />
        </clipPath>
      </defs>
      <g id="add-outline-svgrepo-com" transform="translate(16 16)">
        <path d="M0 0L512 0L512 512L0 512L0 0Z" id="Background" fill="none" fill-rule="evenodd" stroke="none" />
        <g clip-path="url(#mask_1)">
          <path d="M1 0L1 288" transform="translate(255 112)"
            class="${strokeClass}" id="Line" fill="none" fill-rule="evenodd" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M288 1L0 1" transform="translate(112 255)"
            class="${strokeClass}" id="Line" fill="none" fill-rule="evenodd" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" />
        </g>
      </g>
    </svg>
  `),
  //
  leftSidebar: (
    _fillClass: string,
    strokeClass: string,
    alt?: string,
  ) =>
    toHtml(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    ${titleAlt(alt)}
      <line x1="50" y1="96" x2="462" y2="100" style="fill:none;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32px"
        class="${strokeClass}" />
      <line x1="50" y1="256" x2="330" y2="256" style="fill:none;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32px"
        class="${strokeClass}" />
      <line x1="50" y1="416" x2="360" y2="412" style="fill:none;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32px"
        class="${strokeClass}" />
    </svg>
  `),
};
