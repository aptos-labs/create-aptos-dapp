import path from "path";
import { fileURLToPath } from "node:url";

import { Selections } from "../types.js";
import {
  FullstackBoilerplateTemplateInfo,
  TemplateFramework,
  TemplateProjectType,
} from "./constants.js";

export const getTemplateDirectory = (selection: Selections) => {
  const templatePath = resolveTemplateDirectory(selection);

  return path.resolve(
    fileURLToPath(import.meta.url),
    "../../../templates",
    templatePath
  );
};

export const resolveTemplateDirectory = (selection: Selections) => {
  // if project type is move, we only have boilerplate template
  if (selection.projectType === TemplateProjectType.MOVE) {
    return "contract-boilerplate-template";
  }
  // project type is fullstack. If is boilerplate template, check the framework
  if (selection.template.path === FullstackBoilerplateTemplateInfo.value.path) {
    if (selection.framework === TemplateFramework.NEXTJS) {
      return "nextjs-boilerplate-template";
    }
    return "boilerplate-template";
  }

  return selection.template.path;
};
