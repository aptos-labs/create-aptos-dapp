import {
  FullstackBoilerplateTemplateInfo,
  NftMintingDappTemplateInfo,
  TemplateFramework,
  TemplateNetwork,
  TemplateProjectType,
  TokenMintingDappTemplateInfo,
  TokenStakingDappTemplateInfo,
  CustomIndexerTemplateInfo,
} from "../utils/constants.js";
import { validateProjectName } from "../utils/index.js";
import {
  needApiKey,
  needFrameworkChoice,
  needSurfChoice,
  needTemplateChoice,
  canUseApiKey,
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
      NftMintingDappTemplateInfo,
      TokenMintingDappTemplateInfo,
      TokenStakingDappTemplateInfo,
      CustomIndexerTemplateInfo,
    ],
    initial: 0,
  },
  useSurf: {
    type: (prev, values) => needSurfChoice(values),
    name: "useSurf",
    message:
      "Would you like to use Surf, the TypeScript type safety tool maintained by Thala Labs, learn more at https://aptos.dev/en/build/sdks/ts-sdk/type-safe-contract",
    choices(prev, values) {
      if (
        values.template.path === FullstackBoilerplateTemplateInfo.value.path
      ) {
        return [
          {
            title: "Do not use Surf and handle types manually",
            value: false,
          },
          {
            title:
              "Use Surf to auto generate TypeScript Types for your Move contracts",
            value: true,
          },
        ];
      } else {
        return [
          {
            title: "Do not use Surf and handle types manually",
            value: false,
          },
        ];
      }
    },
    initial: false,
  },
  framework: {
    type: (prev, values) => needFrameworkChoice(values),
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
      } else if (
        values.template.path === CustomIndexerTemplateInfo.value.path
      ) {
        return [
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
        {
          title: "Mainnet",
          description: "A production network with real assets",
          value: TemplateNetwork.MAINNET,
        },
        {
          title: "Testnet",
          description:
            "A shared resource for the community, data will be preserved, network configuration will mimic Mainnet.",
          value: TemplateNetwork.TESTNET,
        },
        {
          title: "Devnet",
          description:
            "A shared resource for the community, data resets weekly, weekly update from aptos-core main branch.",
          value: TemplateNetwork.DEVNET,
        },
      ];
    },
    initial: 0,
    hint: "- You can change this later",
  },
  useApiKey: {
    type: (prev, values) => canUseApiKey(values),
    name: "useApiKey",
    message:
      "Would you like to use an API key? It is highly recommended to use with the Aptos API",
    initial: true,
  },
  apiKey: {
    type: (prev, values) => needApiKey(values),
    name: "apiKey",
    message:
      "Enter your API key for the chosen network (you can get one at https://developers.aptoslabs.com/docs/api-access)",
    initial: "",
  },
};
