// item heads used by filetree and opentabs
import React, { ReactNode, useEffect, useRef } from "react";
import { useButton } from "./useButton";

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
    innerRef?: React.RefObject<HTMLLIElement>;
    className?: string;
  }
) {
  const ref: React.RefObject<HTMLLIElement> =
    props.innerRef || useRef<HTMLLIElement>(null);

  const buttonProps = useButton(ref);

  const elementProps = omit(
    props,
    "text",
    "icon",
    "children",
    "focused",
    "className",
    "hovered",
    "innerRef"
  );

  return (
    <li
      className={
        "tree-item-li tree-item" +
        (props.hovered ? " tree-hovered" : "") +
        (props.focused ? " tree-focused" : "") +
        (props.hidden ? " tree-hidden" : "") +
        (props.disableHover ? "" : " tree-enable-hover") +
        (props.className ? " " + props.className : "")
      }
      ref={ref}
      tabIndex={buttonProps.tabIndex}
      {...elementProps}
    >
      <div className="tree-item-icon">{props.icon}</div>
      {props.text}
      {props.children}
    </li>
  );
}

export function TreeChildren(props: {
  hidden?: boolean;
  children?: ReactNode;
  innerRef?: React.Ref<HTMLUListElement>;
  hovered?: boolean;
}) {
  return (
    <ul
      ref={props.innerRef}
      className={
        "tree-children " +
        (props.hidden ? "tree-hidden " : "") +
        (props.hovered ? "tree-hovered " : "")
      }
    >
      {props.children}
    </ul>
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
