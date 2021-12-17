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
      : props.input.default
  );

  useEffect(() => {
    if (typeof props.initialValue !== "boolean") props.onChange?.(value);
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

  const initialValue =
    typeof props.initialValue === "string" &&
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

export function StringInput(props: {
  initialValue?: SettingsValue;
  input: SettingsInputs.String;
  onChange?: (value: string) => void;
}) {
  const getInvalidMessage = props.input.getInvalidMessage;

  const [value, setValue] = useState(
    typeof props.initialValue === "string" &&
      (getInvalidMessage
        ? getInvalidMessage(props.initialValue) === undefined
        : true)
      ? props.initialValue
      : props.input.default
  );

  const [invalidMessage, setInvalidMessage] = useState<string | void>();

  useEffect(() => {
    if (typeof props.initialValue !== "string") props.onChange?.(value);
  }, []);

  useListener(() => {
    if (props.input.getInvalidMessage) {
      const message = props.input.getInvalidMessage(value);
      if (message) {
        setInvalidMessage(message);
        return;
      }
    }

    if (invalidMessage) setInvalidMessage();
    props.onChange?.(value);
  }, [value]);

  return (
    <div className="inputs-string">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={"input " + (invalidMessage ? "invalid" : "")}
      />
      {invalidMessage && (
        <div className="invalid-message">{invalidMessage}</div>
      )}
    </div>
  );
}

export function NumberInput(props: {
  initialValue?: SettingsValue;
  input: SettingsInputs.Number;
  onChange?: (value: number) => void;
}) {
  const getInvalidMessage = (value: null | number) => {
    if (typeof value !== "number") return "Value must be a number";
    if (props.input.min !== undefined && value < props.input.min) {
      return `Value must be at least ${props.input.min}`;
    }
    if (props.input.max !== undefined && value > props.input.max) {
      return `Value must not be greater than ${props.input.max}`;
    }
    return props.input.getInvalidMessage?.(value);
  };

  const [value, setValue] = useState<null | number>(
    typeof props.initialValue === "number" &&
      getInvalidMessage(props.initialValue) === undefined
      ? props.initialValue
      : props.input.default
  );

  const [invalidMessage, setInvalidMessage] = useState<string | void>();

  useEffect(() => {
    if (typeof props.initialValue !== "number") props.onChange?.(value || 0);
  }, []);

  useListener(() => {
    const message = getInvalidMessage(value);
    if (message) {
      setInvalidMessage(message);
      return;
    }

    if (invalidMessage) setInvalidMessage();
    props.onChange?.(value as number);
  }, [value]);

  return (
    <div className="inputs-number">
      <input
        value={value === null ? "" : value}
        type="number"
        onChange={(e) => {
          const value = parseInt(e.target.value, 10);
          setValue(Number.isNaN(value) ? null : value);
        }}
        className={"input " + (invalidMessage ? "invalid" : "")}
      />
      {invalidMessage && (
        <div className="invalid-message">{invalidMessage}</div>
      )}
    </div>
  );
}
