import { selfDestroy } from "./selfDestroy";
import { validateProjectName } from "./validation";

export const parseCommandOptions = (options) => {
  if (options.builderTemplate) {
    if (
      !getTemplateSpecs(options.builderTemplate) &&
      options.builderTemplate !== "new"
    ) {
      selfDestroy(
        "No template with given name found. Check the docs to learn which templates are available\nADD LINK\n"
      );
    } else if (options.builderTemplate == "new") {
      context.dappInfo.template = "new";
      context.dappInfo.isTemplate = false;
    }
  }
  if (options.projectName) {
    const isValidProjectName = validateProjectName(options.projectName);
    if (typeof isValidProjectName == "boolean") {
      context.projectName = options.projectPath;
      context.resolvedProjectPath = path.resolve(options.projectPath);
      setRoot(context.resolvedProjectPath);
    } else {
      selfDestroy(`${isValidProjectName}`);
    }
  }

  if (options.chain) {
    const chains = ["mainnet", "testnet", "devnet"];
    if (!chains.includes(options.chain)) {
      selfDestroy("Error: no chain exists with the specified name\n");
    } else {
      context.dappInfo.chain = options.chain;
      getTestnet();
    }
  }
};
