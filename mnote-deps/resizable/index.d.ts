// adapted from http://jsfiddle.net/3jMQD/

declare function makeResizable(options: {
  element: Element;
  handle: Element;
  horizontal?: boolean;
  vertical?: boolean;
  cursor?: string;
}): void;

export default makeResizable;
