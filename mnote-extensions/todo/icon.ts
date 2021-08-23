import { toHtml } from "mnote-util/dom";

export const todoIcon = (_fillClass: string, strokeClass: string) =>
  toHtml(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <line x1="160" y1="144" x2="448" y2="144" style="fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"
    class="${strokeClass}"/>
    <line x1="160" y1="256" x2="448" y2="256" style="fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"
    class="${strokeClass}"/>
    <line x1="160" y1="368" x2="448" y2="368" style="fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"
    class="${strokeClass}"/>
    <circle cx="80" cy="144" r="16" style="fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"
    class="${strokeClass}"/>
    <circle cx="80" cy="256" r="16" style="fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"
    class="${strokeClass}"/>
    <circle cx="80" cy="368" r="16" style="fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"
    class="${strokeClass}"/>
  </svg>`);
