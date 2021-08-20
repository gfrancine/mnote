// adapted from http://jsfiddle.net/3jMQD/

export default function ({
  element,
  handle,
  horizontal = true,
  vertical = true,
  cursor,
}) {
  let startX, startY, startWidth, startHeight;

  const drag = (e) => {
    if (horizontal) {
      element.style.width = (startWidth + (e.pageX - startX)) +
        "px";
    }
    if (vertical) {
      element.style.height = (startHeight + (e.pageY - startY)) +
        "px";
    }
  };

  const startDrag = (e) => {
    startX = e.pageX;
    startY = e.pageY;
    startWidth = element.offsetWidth;
    startHeight = element.offsetHeight;
    document.documentElement.addEventListener("mousemove", drag, false);
    document.documentElement.addEventListener("mouseup", stopDrag, false);
    document.body.style.cursor = cursor;
  };

  const stopDrag = () => {
    document.documentElement.removeEventListener("mousemove", drag, false);
    document.documentElement.removeEventListener("mouseup", stopDrag, false);
    document.body.style.cursor = "";
  };

  handle.addEventListener("mousedown", startDrag, false);
}
