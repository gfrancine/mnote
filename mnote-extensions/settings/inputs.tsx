import { SettingsInputs, SettingsValue } from "mnote-core";
import React, { useEffect, useState } from "react";
import { useListener } from "mnote-util/useListener";
import Select from "mnote-components/react/dropdowns/Select";

export function BooleanInput(props: {
  initialValue?: SettingsValue; // must be generic, because JSON values are not guaranteed
  input: SettingsInputs.Boolean;
  onChange?: (value: boolean) => void;
}) {
  const [value, setValue] = useState(
    typeof props.initialValue === "boolean"
      ? props.initialValue
      : props.input.default,
  );

  useEffect(() => {
    if (!props.initialValue) props.onChange?.(value);
  }, []);

  useListener(() => {
    props.onChange?.(value);
  }, [value]);

  return (
    <div
      className={"inputs-boolean " + (value ? "on" : "off")}
      onClick={() => setValue(!value)}
    >
      <svg viewBox="0 0 48 24">
        <circle cx="12" cy="12" r="12" className="bg" />
        <circle cx="36" cy="12" r="12" className="bg" />
        <rect x="12" y="0" width="24" height="24" className="bg" />
        <circle cx={value ? "36" : "12"} cy="12" r="10" className="handle" />
      </svg>
    </div>
  );
}

export function SelectInput(props: {
  initialValue?: SettingsValue;
  input: SettingsInputs.Select;
  onChange?: (value: string) => void;
}) {
  const items = props.input.getItems();

  const initialValue = typeof props.initialValue === "string" &&
      Object.values(items)
        .map((item) => item.value)
        .includes(props.initialValue)
    ? props.initialValue
    : props.input.default;

  return (
    <div className="inputs-select">
      <Select
        initialValue={initialValue}
        options={items}
        onChange={props.onChange}
      />
    </div>
  );
}
