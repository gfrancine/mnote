// https://code.visualstudio.com/api/references/vscode-api#window.showInformationMessage
// https://vercel.com/design/modal

import { el } from "../common/elbuilder";

export function confirmModal(message: string): Promise<boolean> {
  // a modal with two buttons, cancel and confirm
  // create element here..

  return new Promise((resolve) => {
    // connect resolve to onCancel / onConfirm
  });
}
