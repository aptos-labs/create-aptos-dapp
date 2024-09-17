import { ProjectType } from "./consts.js";

export const needSigningOptionChoice = (prev: any) => {
  switch (prev) {
    case prev.path === "clicker-game-tg-mini-app-template":
      return "select";
    default:
      null;
  }
};

export const needFrameworkChoice = (prev: any) => {
  switch (prev) {
    case prev === ProjectType.MOVE:
      return null;
    default:
      "seelct";
  }
};
