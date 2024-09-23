import type { Ora } from "ora";
import fs from "fs/promises";

// internal files
import { Selections } from "../types.js";
import { TemplateProjectType, TemplateSigningOption } from "./constants.js";
import { createModulePublisherAccount } from "./createModulePublisherAccount.js";
import { copy, remove } from "./helpers.js";
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
      if (selection.signingOption === TemplateSigningOption.EXPLICIT) {
        copy(
          "frontend/components/explicitSigning/Counter.tsx",
          "frontend/components/Counter.tsx"
        );
        copy(
          "frontend/components/explicitSigning/WalletProvider.tsx",
          "frontend/components/WalletProvider.tsx"
        );
        copy(
          "frontend/components/explicitSigning/WalletSelector.tsx",
          "frontend/components/WalletSelector.tsx"
        );
        const packageJson = JSON.parse(
          await fs.readFile("package.json", "utf-8")
        );
        delete packageJson.dependencies["@mizuwallet-sdk/core"];
        await fs.writeFile(
          "package.json",
          JSON.stringify(packageJson, null, 2)
        );
        remove("frontend/components/seamlessSigning");
        remove("frontend/components/explicitSigning");
        return await generateEnvFile();
      } else if (selection.signingOption === TemplateSigningOption.SEAMLESS) {
        copy(
          "frontend/components/seamlessSigning/Counter.tsx",
          "frontend/components/Counter.tsx"
        );
        copy(
          "frontend/components/seamlessSigning/WalletProvider.tsx",
          "frontend/components/WalletProvider.tsx"
        );
        copy(
          "frontend/components/seamlessSigning/WalletSelector.tsx",
          "frontend/components/WalletSelector.tsx"
        );
        remove("frontend/components/seamlessSigning");
        remove("frontend/components/explicitSigning");
        return await generateEnvFile(`VITE_MIZU_WALLET_APP_ID=""`);
      } else {
        throw new Error(
          `Unsupported signing option: ${selection.signingOption}`
        );
      }
    default:
      throw new Error("Unsupported template to generate an .env file for");
  }
};
