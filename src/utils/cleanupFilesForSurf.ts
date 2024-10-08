import fs from "node:fs";
import { Selections } from "../types.js";
import { TemplateFramework } from "./constants.js";
import { move, remove } from "./helpers.js";

export const cleanupFilesForSurf = (selection: Selections) => {
  let frontend_dir: string;
  if (selection.framework === TemplateFramework.VITE) {
    frontend_dir = "frontend";
  } else if (selection.framework === TemplateFramework.NEXTJS) {
    frontend_dir = "src";
  } else {
    throw new Error("Unsupported framework");
  }

  if (selection.useSurf) {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));
    packageJson.dependencies["@thalalabs/surf"] = "^1.7.3";
    packageJson.scripts["move:publish"] =
      "node ./scripts/move/publish && node ./scripts/move/get_abi";
    packageJson.scripts["move:upgrade"] =
      "node ./scripts/move/upgrade && node ./scripts/move/get_abi";

    fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));

    remove(`${frontend_dir}/entry-functions`);
    remove(`${frontend_dir}/view-functions`);

    move(
      `${frontend_dir}/components/MessageBoardWithSurf.tsx`,
      `${frontend_dir}/components/MessageBoard.tsx`
    );
    move(
      `${frontend_dir}/components/TransferAPTWithSurf.tsx`,
      `${frontend_dir}/components/TransferAPT.tsx`
    );
    move(
      `${frontend_dir}/view-functions-with-surf`,
      `${frontend_dir}/view-functions`
    );
  } else {
    remove("scripts/get_abi.js");

    remove(`${frontend_dir}/components/MessageBoardWithSurf.tsx`);
    remove(`${frontend_dir}/components/TransferAPTWithSurf.tsx`);
    remove(`${frontend_dir}/view-functions-with-surf`);
    remove(`${frontend_dir}/utils/surfClient.ts`);
    remove(`${frontend_dir}/utils/coin_abi.ts`);
    remove(`${frontend_dir}/utils/message_board_abi.ts`);
  }
};
