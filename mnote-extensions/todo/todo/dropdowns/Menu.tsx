import React, { ReactNode, useEffect, useRef, useState } from "react";
import * as Dropdown from "./Base";
import { ChevronDown, ChevronUp } from "./icons";

export default function Select({
  text,
  items,
  getIcon,
  disabled,
  toggleClass,
  menuClass,
  itemClass,
  containerClass,
}: {
  text: string;
  items: {
    text: string;
    onClick?: () => unknown;
  }[];
  getIcon?: (fillClass: string, strokeClass: string) => ReactNode;
  disabled?: boolean;
  toggleClass?: string;
  menuClass?: string;
  itemClass?: string;
  containerClass?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const click = (handler?: () => unknown) => {
    setExpanded(false);
    handler?.();
  };

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!expanded) return;

      const rect = menuRef.current.getBoundingClientRect();
      const isWithin = e.clientX > rect.x &&
        e.clientX < rect.x + rect.width &&
        e.clientY > rect.y &&
        e.clientY < rect.y + rect.height;

      if (!isWithin) {
        setExpanded(false);
      }
    };

    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  });

  return (
    <Dropdown.Container className={containerClass}>
      <Dropdown.Toggle
        text={text}
        className={toggleClass}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          if (items.length < 1) return;
          setExpanded(!expanded);
        }}
        getIcon={
          // using getIcon || () => confuses the parser
          getIcon ? getIcon : (fillClass, strokeClass) =>
            expanded
              ? (
                <ChevronUp strokeClass={strokeClass} fillClass={fillClass} />
              )
              : (
                <ChevronDown
                  strokeClass={strokeClass}
                  fillClass={fillClass}
                />
              )
        }
      />
      <Dropdown.Menu menuRef={menuRef} visible={expanded} className={menuClass}>
        {items.map((item) => (
          <Dropdown.Item
            key={item.text}
            className={itemClass}
            text={item.text}
            onClick={() => click(item.onClick)}
          />
        ))}
      </Dropdown.Menu>
    </Dropdown.Container>
  );
}
