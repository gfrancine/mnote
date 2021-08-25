import React, { useEffect, useMemo, useRef, useState } from "react";
import * as Dropdown from "./Base";
import { ChevronDown, ChevronUp } from "./icons";

export default function Select<T extends string>({
  initialValue,
  options,
  disabled,
  placeholder,
  onChange,
  toggleClass,
  menuClass,
  itemClass,
  containerClass,
}: {
  initialValue?: T;
  options: {
    value: T;
    text: string;
  }[];
  disabled?: boolean;
  placeholder?: string;
  onChange?: (value: T) => unknown;
  toggleClass?: string;
  menuClass?: string;
  itemClass?: string;
  containerClass?: string;
}) {
  const optionsMap = useMemo(() => {
    const map: Record<string, string> = {};
    options.forEach(({ value, text }) => {
      map[value] = text;
    });
    return map;
  }, [options]);

  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<T | null>(
    initialValue === undefined ? null : initialValue,
  );

  const select = (value: T) => {
    setSelected(value);
    setExpanded(false);
    onChange?.(value);
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
        text={selected === null ? undefined : optionsMap[selected]}
        placeholder={placeholder}
        className={toggleClass}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          if (options.length < 1) return;
          setExpanded(!expanded);
        }}
        getIcon={(fillClass, strokeClass) =>
          expanded
            ? <ChevronUp strokeClass={strokeClass} fillClass={fillClass} />
            : <ChevronDown strokeClass={strokeClass} fillClass={fillClass} />}
      />
      <Dropdown.Menu visible={expanded} className={menuClass} menuRef={menuRef}>
        {options.map((option) => (
          <Dropdown.Item
            key={option.value}
            className={itemClass}
            text={option.text}
            selected={selected === option.value}
            onClick={() => select(option.value)}
          />
        ))}
      </Dropdown.Menu>
    </Dropdown.Container>
  );
}
