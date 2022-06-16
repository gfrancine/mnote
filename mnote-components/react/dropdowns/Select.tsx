import React, { useId, useState } from "react";
import * as Dropdown from "./Base";

export default function Select<T extends string>({
  initialValue,
  options,
  disabled,
  placeholder,
  onChange,
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
  containerClass?: string;
}) {
  const placeholderId = useId();

  const [selected, setSelected] = useState<T | null>(
    initialValue === undefined ? null : initialValue
  );

  const select = (value: T) => {
    if (value === placeholderId) {
      setSelected(null);
      return;
    }
    setSelected(value);
    onChange?.(value);
  };

  return (
    <Dropdown.Container className={containerClass}>
      <select
        className={"dropdown-toggle " + (disabled ? " disabled " : " ")}
        value={selected === null ? placeholderId : selected}
        onChange={(e) => select(e.target.value as T)}
        disabled={disabled}
      >
        {placeholder && (
          <option key={placeholderId} value={placeholderId}>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.text}
          </option>
        ))}
      </select>
    </Dropdown.Container>
  );
}
