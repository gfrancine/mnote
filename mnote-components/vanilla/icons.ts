import { toHtml } from "mnote-util/dom";

// icons will require a stroke class and a fill class. stroke
// classes will have the color in the stroke property and so on

export type IconsList = typeof icons;

export const titleAlt = (alt?: string) => (alt ? `<title>${alt}</title>` : "");

export function createIcon(
  name: keyof IconsList,
  fillClass: string,
  strokeClass: string,
  alt?: string
) {
  return icons[name](fillClass, strokeClass, alt);
}

const icons = {
  //
  kebabMenu: (_fillClass: string, strokeClass: string, alt?: string) =>
    toHtml(`
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      ${titleAlt(alt)}
      <circle cx="256" cy="256" r="32" class="${strokeClass}" style="fill:none;stroke-miterlimit:10;stroke-width:32px"/>
      <circle cx="256" cy="416" r="32" class="${strokeClass}" style="fill:none;stroke-miterlimit:10;stroke-width:32px"/>
      <circle cx="256" cy="96" r="32" class="${strokeClass}" style="fill:none;stroke-miterlimit:10;stroke-width:32px"/>
    </svg>
  `),
  //
  add: (_fillClass: string, strokeClass: string, alt?: string) =>
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
  leftSidebar: (fillClass: string, strokeClass: string, alt?: string) =>
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
  close: (_fillClass: string, strokeClass: string, alt?: string) =>
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
  search: (_fillClass: string, strokeClass: string, alt?: string) =>
    toHtml(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      ${titleAlt(alt)}
      <path d="M221.09,64A157.09,157.09,0,1,0,378.18,221.09,157.1,157.1,0,0,0,221.09,64Z" style="fill:none;stroke-miterlimit:10;stroke-width:32px"
        class="${strokeClass}" />
      <line x1="338.29" y1="338.29" x2="448" y2="448" style="fill:none;stroke-linecap:round;stroke-miterlimit:10;stroke-width:32px"
        class="${strokeClass}" />
    </svg>
  `),
  //
  appearance: (fillClass: string, strokeClass: string, alt?: string) =>
    toHtml(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      ${titleAlt(alt)}
      <rect x="48" y="64" width="416" height="384" rx="48" ry="48" style="fill:none;stroke-linejoin:round;stroke-width:32px"
        class="${strokeClass}" />
      <path d="M397.82,64H114.18C77.69,64,48,94.15,48,131.2V176H64c0-16,16-32,32-32H416c16,0,32,16,32,32h16V131.2C464,94.15,434.31,64,397.82,64Z"
        class="${fillClass}" />
    </svg>
  `),
  //
  autosave: (_fillClass: string, strokeClass: string, alt?: string) =>
    toHtml(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    ${titleAlt(alt)}
    <path d="M380.93,57.37A32,32,0,0,0,358.3,48H94.22A46.21,46.21,0,0,0,48,94.22V417.78A46.21,46.21,0,0,0,94.22,464H417.78A46.36,46.36,0,0,0,464,417.78V153.7a32,32,0,0,0-9.37-22.63ZM256,416a64,64,0,1,1,64-64A63.92,63.92,0,0,1,256,416Zm48-224H112a16,16,0,0,1-16-16V112a16,16,0,0,1,16-16H304a16,16,0,0,1,16,16v64A16,16,0,0,1,304,192Z" 
      style="fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"
      class="${strokeClass}" />
  </svg>
`),
  //
  extensions: (_fillClass: string, strokeClass: string, alt?: string) =>
    toHtml(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      ${titleAlt(alt)}
      <path class=${strokeClass} fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M413.66 246.1H386a2 2 0 01-2-2v-77.24A38.86 38.86 0 00345.14 128H267.9a2 2 0 01-2-2V98.34c0-27.14-21.5-49.86-48.64-50.33a49.53 49.53 0 00-50.4 49.51V126a2 2 0 01-2 2H87.62A39.74 39.74 0 0048 167.62V238a2 2 0 002 2h26.91c29.37 0 53.68 25.48 54.09 54.85.42 29.87-23.51 57.15-53.29 57.15H50a2 2 0 00-2 2v70.38A39.74 39.74 0 0087.62 464H158a2 2 0 002-2v-20.93c0-30.28 24.75-56.35 55-57.06 30.1-.7 57 20.31 57 50.28V462a2 2 0 002 2h71.14A38.86 38.86 0 00384 425.14v-78a2 2 0 012-2h28.48c27.63 0 49.52-22.67 49.52-50.4s-23.2-48.64-50.34-48.64z"/>
    </svg>
  `),
};
