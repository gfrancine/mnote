import { Nothing } from "mnote-components/react/icons-jsx";
import {
  Settings,
  SettingsInput,
  SettingsInputIndex,
  SettingsInputs,
  SettingsSubcategory,
  SettingsSubcategoryInfo,
  SettingsValue,
} from "mnote-core";
import { ElementToReact, TreeItem } from "mnote-components/react/tree";
import React, { useEffect, useMemo, useState } from "react";

function BooleanInput(props: {
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

  useEffect(() => {
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

function InputRow<T extends SettingsInput>(props: {
  input: T;
  initialValue?: SettingsValue;
  setValue: (value: SettingsValue) => void;
}) {
  return (
    <div className="settings-input-row">
      <div className="left">
        <div className="title">{props.input.title}</div>
        <div className="description">{props.input.description}</div>
      </div>
      <div className="right">
        {(() => {
          if (props.input.type === "boolean") {
            return (
              <BooleanInput
                initialValue={props.initialValue}
                onChange={props.setValue}
                input={props.input}
              />
            );
          }

          return "";
        })()}
      </div>
    </div>
  );
}

function SubcategoryPage(props: {
  subcategoryInfo: SettingsSubcategoryInfo;
  settings: Settings;
  setSettings: (value: Settings) => void;
}) {
  const { subcategoryInfo } = props;

  return (
    <div className="subcategory-main">
      <h1>{subcategoryInfo.subcategory.title}</h1>
      {Object.values(subcategoryInfo.inputs).map((input) => (
        <InputRow
          key={input.key}
          input={input}
          initialValue={props.settings[input.key]}
          setValue={(value: SettingsValue) => {
            props.setSettings({ ...props.settings, [input.key]: value });
          }}
        />
      ))}
    </div>
  );
}

export function SettingsEditor(props: {
  inputIndex: SettingsInputIndex;
  subcategories: Record<string, SettingsSubcategory>;
  initialSettings: Settings;
  placeholder: string;
  onChange?: (value: Settings) => void;
}) {
  const sortSubcategoryInfos = (
    subcategoryInfos: Record<string, SettingsSubcategoryInfo>,
  ) =>
    Object.values(subcategoryInfos).sort((a, b) =>
      a.subcategory.title < b.subcategory.title ? -1 : 1
    );

  const coreSubcategoryInfos = useMemo(
    () => sortSubcategoryInfos(props.inputIndex.core),
    [props.inputIndex.core],
  );
  const extensionSubcategoryInfos = useMemo(
    () => sortSubcategoryInfos(props.inputIndex.extensions),
    [props.inputIndex.extensions],
  );

  const [currentSubcategoryKey, setCurrentSubcategoryKey] = useState<
    string | null
  >(
    coreSubcategoryInfos[0]?.subcategory.key || /* */ null,
  );

  const [settings, setSettings] = useState(props.initialSettings);

  useEffect(() => {
    props.onChange?.(settings);
  }, [settings]);

  const subcategoriesToTreeItem = (
    subcategories: SettingsSubcategoryInfo[],
  ) =>
    subcategories.map((subcategory) => (
      <TreeItem
        key={subcategory.subcategory.key}
        text={subcategory.subcategory.title}
        icon={subcategory.subcategory.iconFactory
          ? (
            <ElementToReact
              element={subcategory.subcategory.iconFactory(
                "fill",
                "stroke",
              )}
            />
          )
          : <Nothing />}
        focused={subcategory.subcategory.key === currentSubcategoryKey}
        onClick={() => setCurrentSubcategoryKey(subcategory.subcategory.key)}
      />
    ));

  return (
    <>
      {/* .settings-main */}
      <div className="settings-contents">
        {(() => {
          if (!currentSubcategoryKey) {
            return (
              <div className="placeholder-nothing">
                {props.placeholder}
              </div>
            );
          }
          const subcategory = props.subcategories[currentSubcategoryKey];
          const subcategoryInfo =
            props.inputIndex[subcategory.category][subcategory.key];
          return (
            <SubcategoryPage
              subcategoryInfo={subcategoryInfo}
              setSettings={setSettings}
              settings={settings}
            />
          );
        })()}
      </div>
      <div className="settings-toc">
        <div className="settings-toc-category">
          <strong>General</strong>
        </div>
        {subcategoriesToTreeItem(coreSubcategoryInfos)}
        <div className="settings-toc-category">
          <strong>Others</strong>
        </div>
        {subcategoriesToTreeItem(extensionSubcategoryInfos)}
      </div>
    </>
  );
}
