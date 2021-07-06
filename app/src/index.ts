import { EditorsModule, Mnote } from "../../mnote";
import { FS } from "./fs";
import "../../mnote-styles/light.scss";
import * as cli from "@tauri-apps/api/cli";
cli.getMatches().then(console.log);

console.log("hey");

(async () => {
  console.log("YoO");
  const matches = await cli.getMatches();
  let startPath: string | undefined;
  console.log("YO", matches);

  const app = new Mnote("#root", {
    startPath: "D:\\Notes\\written\\sample.md",
    fs: new FS(),
  });

  await app.startup();

  // (app.modules.editors as EditorsModule).newEditor("plaintext");
})();
