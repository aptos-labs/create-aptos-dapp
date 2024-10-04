import fs from "node:fs";
import { Selections } from "../types.js";
import {
  FullstackBoilerplateTemplateInfo,
  TemplateFramework,
  TemplateProjectType,
} from "./constants.js";
import { move, remove } from "./helpers.js";

export const cleanupFilesForSurf = (selection: Selections) => {
  if (selection.projectType === TemplateProjectType.MOVE) {
    return;
  }

  let frontend_dir: string;
  if (selection.framework === TemplateFramework.VITE) {
    frontend_dir = "frontend";
  } else if (selection.framework === TemplateFramework.NEXTJS) {
    frontend_dir = "src";
  } else {
    throw new Error("Unsupported framework");
  }

  if (selection.template.path === FullstackBoilerplateTemplateInfo.value.path) {
    if (selection.useSurf) {
      const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));
      packageJson.dependencies["@thalalabs/surf"] = "^1.7.3";
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
      remove(`${frontend_dir}/components/MessageBoardWithSurf.tsx`);
      remove(`${frontend_dir}/components/TransferAPTWithSurf.tsx`);
      remove(`${frontend_dir}/view-functions-with-surf`);
      remove(`${frontend_dir}/utils/surf_client.ts`);
    }
  }
};
