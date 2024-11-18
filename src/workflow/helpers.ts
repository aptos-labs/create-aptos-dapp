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
  if (
    values.projectType === TemplateProjectType.MOVE ||
    values.template.path != FullstackBoilerplateTemplateInfo.value.path
  ) {
    return null;
  }

  return "select";
};

export const needFrameworkChoice = (values: Selections) => {
  if (values.projectType === TemplateProjectType.MOVE) {
    return null;
  }

  return "select";
};

export const canUseApiKey = (values: Selections) => {
  if (values.projectType === TemplateProjectType.FULLSTACK) {
    return "confirm";
  }
  return null;
};

export const needApiKey = (values: Selections) => {
  if (values.useApiKey) {
    return "text";
  }
  return null;
};
