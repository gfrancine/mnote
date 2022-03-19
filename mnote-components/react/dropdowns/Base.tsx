import React, { Fragment, ReactNode, RefObject } from "react";

export function Container({
  children,
  className = "",
  containerRef,
}: {
  children: ReactNode;
  className?: string;
  containerRef?: RefObject<HTMLDivElement>;
}) {
  return (
    <div ref={containerRef} className={"dropdown-container " + className}>
      {children}
    </div>
  );
}

export function Toggle({
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
  toggleRef?: RefObject<HTMLButtonElement>;
}) {
  return (
    <button
      className={
        "dropdown-toggle " +
        (toggled ? " toggled " : " ") +
        (disabled ? " disabled " : " ") +
        className
      }
      onClick={() => onClick?.()}
      ref={toggleRef}
    >
      <div className="content">
        {text ||
          (placeholder && <span className="placeholder">{placeholder}</span>)}
      </div>
      {getIcon && <div className="icon">{getIcon("fill", "stroke")}</div>}
    </button>
  );
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
  return visible ? (
    <div ref={menuRef} className={"dropdown-menu " + className}>
      <ul>{children}</ul>
    </div>
  ) : (
    <Fragment />
  );
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
  itemRef?: RefObject<HTMLButtonElement>;
}) {
  return (
    <li>
      <button
        className={
          "dropdown-menu-item " + (selected ? "selected " : " ") + className
        }
        onClick={() => onClick?.()}
        ref={itemRef}
      >
        {text}
      </button>
    </li>
  );
}
