import { Nothing } from "mnote-components/react/icons-jsx";
import {
  Settings,
  SettingsInput,
  SettingsInputIndex,
  SettingsSubcategory,
  SettingsSubcategoryInfo,
  SettingsValue,
} from "mnote-core";
import { ElementToReact, TreeItem } from "mnote-components/react/tree";
import React, { useMemo, useState } from "react";
import { useListener } from "mnote-util/useListener";
import { BooleanInput, NumberInput, SelectInput, StringInput } from "./inputs";

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
          switch (props.input.type) {
            case "boolean":
              return (
                <BooleanInput
                  initialValue={props.initialValue}
                  onChange={props.setValue}
                  input={props.input}
                />
              );
            case "select":
              return (
                <SelectInput
                  initialValue={props.initialValue}
                  input={props.input}
                  onChange={props.setValue}
                />
              );

            case "string":
              return (
                <StringInput
                  initialValue={props.initialValue}
                  input={props.input}
                  onChange={props.setValue}
                />
              );
            case "number":
              return (
                <NumberInput
                  initialValue={props.initialValue}
                  input={props.input}
                  onChange={props.setValue}
                />
              );
          }
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
  const icon = subcategoryInfo.subcategory.iconFactory;

  return (
    <div className="subcategory-main">
      <div className="subcategory-title">
        {icon
          ? (
            <div className="subcategory-icon">
              <ElementToReact element={icon("fill", "stroke")} />
            </div>
          )
          : <></>}
        <h1>{subcategoryInfo.subcategory.title}</h1>
      </div>
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
  saveSettings: () => void;
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

  useListener(() => {
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
        <div className="settings-contents-bottom">
          <button className="settings-save-button" onClick={props.saveSettings}>
            Save Settings
          </button>
        </div>
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
