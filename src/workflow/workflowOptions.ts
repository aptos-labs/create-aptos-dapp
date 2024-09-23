import {
  FullstackBoilerplateTemplateInfo,
  ClickerGameTgTemplateInfo,
  NftMintingDappTemplateInfo,
  TemplateFramework,
  TemplateNetwork,
  TemplateProjectType,
  TemplateSigningOption,
  TokenMintingDappTemplateInfo,
  TokenStakingDappTemplateInfo,
} from "../utils/constants.js";
import { validateProjectName } from "../utils/index.js";
import {
  needFrameworkChoice,
  needSigningOptionChoice,
  needTemplateChoice,
} from "./helpers.js";

/** workflow object containing all the text for the different prompt options */
export const workflowOptions = {
  projectName: {
    type: "text",
    name: "projectName",
    message: "Enter a new project name",
    validate: (value: string) => validateProjectName(value),
  },
  projectType: {
    type: "select",
    name: "projectType",
    message: "What type of project you want to create?",
    choices: [
      {
        title: "Move Contract Project",
        value: TemplateProjectType.MOVE,
        description:
          "A barebones Move project with only a generated Move contract",
      },
      {
        title: "Full-stack Project",
        value: TemplateProjectType.FULLSTACK,
        description:
          "A full stack project with a generated Move contract and front end",
      },
    ],
  },
  template: {
    type: (prev: any) => needTemplateChoice(prev),
    name: "template",
    message: "Choose how to start",
    choices: [
      FullstackBoilerplateTemplateInfo,
      ClickerGameTgTemplateInfo,
      NftMintingDappTemplateInfo,
      TokenMintingDappTemplateInfo,
      TokenStakingDappTemplateInfo,
    ],
    initial: 0,
  },
  signingOption: {
    type: (prev: any) => needSigningOptionChoice(prev),
    name: "signingOption",
    message: "Choose your signing option",
    choices: [
      {
        title: "Explicit signing (Aptos Wallet Adapter)",
        value: TemplateSigningOption.EXPLICIT,
      },
      {
        title: "Seamless signing (Mizu SDK Core)",
        value: TemplateSigningOption.SEAMLESS,
      },
    ],
    initial: 0,
  },
  framework: {
    type: (prev: any) => needFrameworkChoice(prev),
    name: "framework",
    message: "Choose your framework",
    choices(prev, values) {
      if (
        values.template.path === FullstackBoilerplateTemplateInfo.value.path
      ) {
        return [
          { title: "Client-side (Vite app)", value: TemplateFramework.VITE },
          {
            title: "Server-side (Next.js app)",
            value: TemplateFramework.NEXTJS,
          },
        ];
      }
      return [
        { title: "Client-side (Vite app)", value: TemplateFramework.VITE },
      ];
    },
    initial: 0,
  },
  network: {
    type: "select",
    name: "network",
    message: "Choose your network",
    choices(prev, values) {
      /**
       * We don't support devnet for NFT and Token minting dapps because
       * 1. Both templates depend on Irys to upload files, but Irys does not support Aptos devnet yet
       * 2. NFT minting dapp depends on token-minter contract and token-minter contract is not
       * deployed on devnet because devnet is reset frequently
       */
      if (
        values.template &&
        (values.template.path === NftMintingDappTemplateInfo.value.path ||
          values.template.path === TokenMintingDappTemplateInfo.value.path)
      ) {
        return [
          { title: "Mainnet", value: TemplateNetwork.MAINNET },
          { title: "Testnet", value: TemplateNetwork.TESTNET },
        ];
      }
      return [
        { title: "Mainnet", value: TemplateNetwork.MAINNET },
        { title: "Testnet", value: TemplateNetwork.TESTNET },
        { title: "Devnet", value: TemplateNetwork.DEVNET },
      ];
    },
    initial: 0,
    hint: "- You can change this later",
  },
};
