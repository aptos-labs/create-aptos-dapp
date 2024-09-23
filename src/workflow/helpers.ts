import {
  ContractBoilerplateTemplateValues,
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
    case prev.path == "clicker-game-tg-mini-app-template":
      return "select";
    default:
      return null;
  }
};

export const needFrameworkChoice = (prev: any) => {
  switch (prev) {
    case TemplateProjectType.MOVE:
      return null;
    default:
      return "select";
  }
};
