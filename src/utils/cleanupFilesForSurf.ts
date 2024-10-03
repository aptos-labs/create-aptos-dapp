import fs from "node:fs";
import { Selections } from "../types";
import { TemplateProjectType } from "./constants";
import { move, remove } from "./helpers";

export const cleanupFilesForSurf = (selection: Selections) => {
  if (
    !selection.useSurf ||
    selection.projectType === TemplateProjectType.MOVE
  ) {
    return;
  }

  if (selection.template.path === "boilerplate-template") {
    if (selection.useSurf) {
      move(
        "frontend/components/MessageBoardWithSurf.tsx",
        "frontend/components/MessageBoard.tsx"
      );
      move(
        "frontend/components/TransferAPTWithSurf.tsx",
        "frontend/components/TransferAPT.tsx"
      );
      move(
        "frontend/components/view-functions-with-surf",
        "frontend/components/view-functions"
      );

      remove("frontend/entry-functions");
    } else {
      const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));
      delete packageJson.dependencies["@thalalabs/surf"];
      fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));

      remove("frontend/components/MessageBoardWithSurf.tsx");
      remove("frontend/components/TransferAPTWithSurf.tsx");
      remove("frontend/components/view-functions-with-surf");
    }
  }
};
