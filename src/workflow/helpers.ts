import { Selections } from "../types.js";
import {
  FullstackBoilerplateTemplateInfo,
  TemplateProjectType,
} from "../utils/constants.js";

export const needTemplateChoice = (prev: any) => {
  switch (prev) {
    case TemplateProjectType.MOVE:
      return null;
    default:
      return "select";
  }
};

export const needSigningOptionChoice = (prev: any) => {
  switch (prev) {
    default:
      return null;
  }
};

export const needSurfChoice = (values: Selections) => {
  if (values.template.path === FullstackBoilerplateTemplateInfo.value.path) {
    return "select";
  }

  return null;
};

export const needFrameworkChoice = (prev: any) => {
  switch (prev) {
    case TemplateProjectType.MOVE:
      return null;
    default:
      return "select";
  }
};
