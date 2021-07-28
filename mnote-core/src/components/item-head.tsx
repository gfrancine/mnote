// item heads used by filetree and openfiles
import React from "react";

type DivProps =
  & React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
  & Record<string, unknown>;

function omit<
  K extends string | number | symbol,
  T extends Record<K, unknown>,
  O extends readonly K[],
>(object: T, ...keys: O) {
  const omitted = { ...object };
  for (const k of keys) delete omitted[k];
  return omitted as Omit<T, typeof keys[number]>;
}

export function ItemHead(
  props: DivProps & {
    text: string;
    icon: JSX.Element;
    focused?: boolean;
    hidden?: boolean;
    ref?: React.Ref<HTMLDivElement>;
  },
) {
  return (
    <div
      className={"filetree-item" +
        (props.focused ? " focused" : "") +
        (props.hidden ? " hidden" : "") +
        (props.className ? " " + props.className : "")}
      {...omit(props, "text", "icon", "children", "focused", "className")}
    >
      <div className="filetree-item-icon">
        {props.icon}
      </div>
      {props.text}
      {props.children}
    </div>
  );
}
