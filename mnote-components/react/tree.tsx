// item heads used by filetree and openfiles
import React, { ReactNode, useEffect, useRef } from "react";

type DivProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> &
  Record<string, unknown>;

function omit<
  K extends string | number,
  T extends Record<K, unknown>,
  O extends readonly K[]
>(object: T, ...keys: O) {
  const omitted = { ...object };
  for (const k of keys) delete omitted[k];
  return omitted as Omit<T, typeof keys[number]>;
}

export function TreeItem(
  props: DivProps & {
    text: ReactNode;
    icon: ReactNode;
    hovered?: boolean;
    disableHover?: boolean;
    focused?: boolean;
    hidden?: boolean;
    ref?: React.Ref<HTMLDivElement>;
    className?: string;
  }
) {
  return (
    <div
      className={
        "tree-item" +
        (props.hovered ? " tree-hovered" : "") +
        (props.focused ? " tree-focused" : "") +
        (props.hidden ? " tree-hidden" : "") +
        (props.disableHover ? "" : " tree-enable-hover") +
        (props.className ? " " + props.className : "")
      }
      {...omit(
        props,
        "text",
        "icon",
        "children",
        "focused",
        "className",
        "hovered"
      )}
    >
      <div className="tree-item-icon">{props.icon}</div>
      {props.text}
      {props.children}
    </div>
  );
}

export function TreeChildren(props: {
  hidden?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={"tree-children " + (props.hidden ? "tree-hidden" : "")}>
      {props.children}
    </div>
  );
}

export function ElementToReact(props: { element: Element }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.appendChild(props.element);

    return () => {
      if (!containerRef.current) return;
      containerRef.current.removeChild(props.element);
    };
  });

  return (
    <div style={{ width: "100%", height: "100%" }} ref={containerRef}></div>
  );
}
