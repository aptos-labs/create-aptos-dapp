import type { Ora } from "ora";

// internal files
import { Selections } from "../types.js";
import { TemplateProjectType } from "./constants.js";
import { createModulePublisherAccount } from "./createModulePublisherAccount.js";
import { setUpEnvVariables } from "./setUpEnvVariables.js";

export const generateTemplateEnvFile = async (
  selection: Selections,
  spinner: (text: any) => Ora
) => {
  // create .env file
  const generateEnvFile = async (additionalContent?: string) => {
    let content = "";

    const accountCreationSpinner = spinner(
      `Creating a module publisher account\n`
    ).start();
    const publisherAccount = await createModulePublisherAccount(selection);
    accountCreationSpinner.succeed();

    content += setUpEnvVariables(selection, publisherAccount);

    return additionalContent
      ? content.concat("\n", additionalContent)
      : content;
  };

  if (selection.projectType === TemplateProjectType.MOVE) {
    return await generateEnvFile();
  }

  switch (selection.template.path) {
    case "nft-minting-dapp-template":
      return await generateEnvFile(
        `VITE_COLLECTION_CREATOR_ADDRESS=""\n#To fill after you create a collection, will be used for the minting page\nVITE_COLLECTION_ADDRESS=""`
      );
    case "token-minting-dapp-template":
      return await generateEnvFile(
        `VITE_FA_CREATOR_ADDRESS=""\n#To fill after you create a fungible asset, will be used for the minting page\nVITE_FA_ADDRESS=""`
      );
    case "token-staking-dapp-template":
      return await generateEnvFile(
        `VITE_FA_ADDRESS=""\nVITE_REWARD_CREATOR_ADDRESS=""`
      );
    case "boilerplate-template":
      return await generateEnvFile();
    case "nextjs-boilerplate-template":
      return await generateEnvFile();
    case "clicker-game-tg-mini-app-template":
      return await generateEnvFile();
    default:
      throw new Error("Unsupported template to generate an .env file for");
  }
};
