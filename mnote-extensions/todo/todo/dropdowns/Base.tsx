import React, { Fragment, ReactNode, RefObject } from "react";

export function Container(
  { children, className = "", containerRef }: {
    children: ReactNode;
    className?: string;
    containerRef?: RefObject<HTMLDivElement>;
  },
) {
  return <div ref={containerRef} className={"dropdown-container " + className}>
    {children}
  </div>;
}

export function Toggle(
  {
    text,
    className = "",
    toggled,
    placeholder,
    onClick,
    disabled,
    getIcon,
    toggleRef,
  }: {
    text?: string;
    className?: string;
    toggled?: boolean;
    placeholder?: string;
    disabled?: boolean;
    onClick?: () => unknown;
    getIcon?: (fillClass: string, strokeClass: string) => ReactNode;
    toggleRef?: RefObject<HTMLDivElement>;
  },
) {
  return <div
    className={"dropdown-toggle " +
      (toggled ? " toggled " : " ") +
      (disabled ? " disabled " : " ") +
      className}
    onClick={() => onClick?.()}
    ref={toggleRef}
  >
    <div className="content">
      {text || (placeholder && <span className="placeholder">
        {placeholder}
      </span>)}
    </div>
    {getIcon && <div className="icon">{getIcon("fill", "stroke")}</div>}
  </div>;
}

export function Menu({
  children,
  visible = false,
  className = "",
  menuRef,
}: {
  children: ReactNode;
  visible?: boolean;
  className?: string;
  menuRef?: RefObject<HTMLDivElement>;
}) {
  return visible
    ? <div ref={menuRef} className={"dropdown-menu " + className}>
      {children}
    </div>
    : <Fragment />;
}

export function Item({
  text,
  selected = false,
  onClick,
  className = "",
  itemRef,
}: {
  text?: string;
  selected?: boolean;
  className?: string;
  onClick?: () => unknown;
  itemRef?: RefObject<HTMLDivElement>;
}) {
  return <div
    className={"dropdown-menu-item " + (selected ? "selected " : " ") +
      className}
    onClick={() => onClick?.()}
    ref={itemRef}
  >
    {text}
  </div>;
}
