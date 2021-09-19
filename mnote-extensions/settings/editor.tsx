import { Nothing } from "mnote-components/react/icons-jsx";
import {
  Settings,
  SettingsInputIndex,
  settingsInputs,
  SettingsSubcategory,
  SettingsSubcategoryInfo,
} from "mnote-core";
import { ElementToReact, TreeItem } from "mnote-components/react/tree";
import React, { useMemo, useState } from "react";

function InputRow(props: {
  input: settingsInputs.Inputs;
  // value
  // setvalue
}) {
  return (
    <div className="settings-input-row">
      <div className="left">
        <div className="title">{props.input.generalOpts.title}</div>
        <div className="description">{props.input.generalOpts.description}</div>
      </div>
      <div className="right">
        {(() => {
          return "";
        })()}
      </div>
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

  const [_settings, _setSettings] = useState(props.initialSettings);

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
          const subcategoryIndex =
            props.inputIndex[subcategory.category][subcategory.key];
          return (
            <div className="category-main">
              <h1>{subcategory.title}</h1>
              {Object.values(subcategoryIndex.inputs).map((input) =>
                <InputRow key={input.generalOpts.key} input={input} />
              )}
            </div>
          );
        })()}
      </div>
      <div className="settings-navbar">
        <div className="settings-navbar-category">
          <strong>General</strong>
        </div>
        {subcategoriesToTreeItem(coreSubcategoryInfos)}
        <div className="settings-navbar-category">
          <strong>Others</strong>
        </div>
        {subcategoriesToTreeItem(extensionSubcategoryInfos)}
      </div>
    </>
  );
}
