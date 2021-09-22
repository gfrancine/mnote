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
    fillClass: string,
    strokeClass: string,
    alt?: string,
  ) =>
    toHtml(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      ${titleAlt(alt)}
      <path xmlns="http://www.w3.org/2000/svg" d="M50,48H186a0,0,0,0,1,0,0V464a0,0,0,0,1,0,0H50a18,18,0,0,1-18-18V66A18,18,0,0,1,50,48Z"
        class="${strokeClass} ${fillClass}" style="stroke-miterlimit:10;stroke-width:32px" />
      <path xmlns="http://www.w3.org/2000/svg" d="M190,48H462a18,18,0,0,1,18,18V446a18,18,0,0,1-18,18H190a0,0,0,0,1,0,0V48A0,0,0,0,1,190,48Z"
        class="${strokeClass}" style="fill:none;stroke-miterlimit:10;stroke-width:32px" />
    </svg>
  `),
  //
  close: (
    _fillClass: string,
    strokeClass: string,
    alt?: string,
  ) =>
    toHtml(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      ${titleAlt(alt)}
      <line x1="368" y1="368" x2="144" y2="144" style="fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"
        class="${strokeClass}" />
      <line x1="368" y1="144" x2="144" y2="368" style="fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"
        class="${strokeClass}" />
    </svg>
  `),
  //
  search: (
    _fillClass: string,
    strokeClass: string,
    alt?: string,
  ) =>
    toHtml(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      ${titleAlt(alt)}
      <path d="M221.09,64A157.09,157.09,0,1,0,378.18,221.09,157.1,157.1,0,0,0,221.09,64Z" style="fill:none;stroke-miterlimit:10;stroke-width:32px"
        class="${strokeClass}" />
      <line x1="338.29" y1="338.29" x2="448" y2="448" style="fill:none;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32px"
        class="${strokeClass}" />
    </svg>
  `),
};
