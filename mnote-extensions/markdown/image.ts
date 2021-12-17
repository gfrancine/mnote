/* Copyright 2021, Milkdown by Mirone. */
/*

Fork of https://github.com/Saul-Mirone/milkdown/blob/ce8634b783c3608651d06a6d36
8d7973f713ccc2/packages/preset-commonmark/src/index.ts
- add ability to resolve image paths
- removed styled divs
- removed loading and error states

*/

import { createCmd, createCmdKey } from "@milkdown/core";
import { createNode } from "@milkdown/utils";
import { findSelectedNodeOfType } from "@milkdown/prose";
import { InputRule } from "prosemirror-inputrules";
import { NodeSelection } from "prosemirror-state";

export const ModifyImage = createCmdKey<string>();
export const InsertImage = createCmdKey<string>();
const id = "image";
export type ImageOptions = {
  placeholder: {
    loading: string;
    empty: string;
  };
};
export function makeImageNode(resolveImageSrc: (src: string) => string) {
  return createNode<string, ImageOptions>(() => {
    return {
      id,
      schema: {
        inline: true,
        group: "inline",
        draggable: true,
        selectable: true,
        marks: "",
        attrs: {
          src: { default: "" },
          alt: { default: null },
          title: { default: null },
        },
        parseDOM: [
          {
            tag: "img[src]",
            getAttrs: (dom) => {
              if (!(dom instanceof HTMLElement)) {
                throw new Error();
              }
              return {
                src: dom.getAttribute("data-original-src") || "",
                alt: dom.getAttribute("alt"),
                title: dom.getAttribute("title"),
              };
            },
          },
        ],
        toDOM: (node) => {
          // note to self:
          // this is what prosemirror checks the actual DOM node with, whether its
          // attributes are correct. if it doesn't match, it creates a DOM node
          // based on this and replaces it
          const sourceUrl = node.attrs.src as string;
          return [
            "img",
            {
              ...node.attrs,
              "data-original-src": sourceUrl,
              src: resolveImageSrc(sourceUrl),
            },
          ];
        },
      },
      parser: {
        match: ({ type }) => type === id,
        runner: (state, node, type) => {
          const url = node.url as string;
          const alt = node.alt as string;
          const title = node.title as string;
          state.addNode(type, {
            src: url,
            alt,
            title,
          });
        },
      },
      serializer: {
        match: (node) => node.type.name === id,
        runner: (state, node) => {
          state.addNode("image", undefined, undefined, {
            title: node.attrs.title,
            url: node.attrs.src,
            alt: node.attrs.alt,
          });
        },
      },
      commands: (nodeType, schema) => [
        createCmd(InsertImage, (src = "") => (state, dispatch) => {
          if (!dispatch) return true;
          const { tr } = state;
          const node = nodeType.create({ src });
          if (!node) {
            return true;
          }
          const _tr = tr.replaceSelectionWith(node);
          const { $from } = _tr.selection;
          const start = $from.start();
          const __tr = _tr.replaceSelectionWith(schema.node("paragraph"));
          const sel = NodeSelection.create(__tr.doc, start);
          dispatch(__tr.setSelection(sel));
          return true;
        }),
        createCmd(ModifyImage, (src = "") => (state, dispatch) => {
          const node = findSelectedNodeOfType(state.selection, nodeType);
          if (!node) return false;

          const { tr } = state;
          dispatch?.(
            tr
              .setNodeMarkup(node.pos, undefined, {
                ...node.node.attrs,
                src,
              })
              .scrollIntoView()
          );

          return true;
        }),
      ],
      inputRules: (nodeType) => [
        new InputRule(
          /!\[(?<alt>.*?)]\((?<filename>.*?)(?=“|\))"?(?<title>[^"]+)?"?\)/,
          (state, match, start, end) => {
            const [okay, alt, src = "", title] = match;
            const { tr } = state;
            if (okay) {
              tr.replaceWith(start, end, nodeType.create({ src, alt, title }));
            }

            return tr;
          }
        ),
      ],
      view: (node, _view, _getPos) => {
        const content = document.createElement("img");

        const { src, title, alt } = node.attrs;
        content.setAttribute("data-original-src", src);
        content.src = resolveImageSrc(src);
        content.title = title;
        content.alt = alt;

        return {
          contentDOM: content,
        };
      },
    };
  });
}
