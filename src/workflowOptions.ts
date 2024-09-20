import { validateProjectName } from "./utils/index.js";

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
        value: "move",
        description:"A barebones Move project with only a generated Move contract"
      },
      {
        title: "Full-stack Project",
        value: "fullstack",
        description:"A full stack project with a generated Move contract and front end"
      }
    ]
  },
  template: {
    type: (prev: any) => prev == "move" ? null : "select",
    name: "template",
    message: "Choose how to start",
    choices: [
      {
        title: "Boilerplate Template",
        value: {
          path: "boilerplate-template",
          name: "Boilerplate Template",
          doc: "https://aptos.dev/en/build/create-aptos-dapp/templates/boilerplate",
        },
        description: "A boilerplate template to start an Aptos dapp with",
      },
      {
        title: "A clicker game Telegram Mini App",
        value: {
          path: "clicker-game-tg-mini-app-template",
          name: "Clicker Game Telegram Mini App Template",
          doc: "https://aptos.dev/en/build/create-aptos-dapp/templates/clicker-game-tg-mini-app",
        },
        description:
          "A clicker game Telegram Mini App template to start an Aptos dapp with",
      },
      {
        title: "NFT minting dapp",
        value: {
          path: "nft-minting-dapp-template",
          name: "NFT minting dapp",
          doc: "https://aptos.dev/en/build/create-aptos-dapp/templates/nft-minting-dapp",
          video: "https://www.youtube.com/watch?v=ik4GfsKZDOQ",
        },
        description:
          "A production ready template to create an NFT collection minting dapp",
      },
      {
        title: "Token minting dapp",
        value: {
          path: "token-minting-dapp-template",
          name: "Token minting dapp",
          doc: "https://aptos.dev/en/build/create-aptos-dapp/templates/token-minting-dapp",
          video: "https://www.youtube.com/watch?v=cr7LS-k4nQo",
        },
        description:
          "A production ready template to create your own token minting dapp",
      },
      {
        title: "Token staking dapp",
        value: {
          path: "token-staking-dapp-template",
          name: "Token staking dapp",
          doc: "https://aptos.dev/en/build/create-aptos-dapp/templates/token-staking-dapp",
          video: "https://www.youtube.com/watch?v=xWkAVVE4WXk",
        },
        description:
          "A production ready template to create a token staking dapp",
      },
    ],
    initial: 0,
  },
  signingOption: {
    type: (prev:any) =>
      prev == "move" ? null : prev?.path == "clicker-game-tg-mini-app-template" ? "select" : null,
    name: "signingOption",
    message: "Choose your signing option",
    choices: [
      {
        title: "Explicit signing (Aptos Wallet Adapter)",
        value: "explicit",
      },
      {
        title: "Seamless signing (Mizu SDK Core)",
        value: "seamless",
      },
    ],
    initial: 0,
  },
  framework: {
    type:  (prev:any) =>
      prev == "move" ? null :"select",
    name: "framework",
    message: "Choose your framework",
    choices(prev, values) {
      if (values.template.path === "boilerplate-template") {
        return [
          { title: "Client-side (Vite app)", value: "vite" },
          { title: "Server-side (Next.js app)", value: "nextjs" },
        ];
      }
      return [{ title: "Client-side (Vite app)", value: "vite" }];
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
        ( values.template.path === "nft-minting-dapp-template" ||
        values.template.path === "token-minting-dapp-template" )
      ) {
        return [
          { title: "Mainnet", value: "mainnet" },
          { title: "Testnet", value: "testnet" },
        ];
      }
      return [
        { title: "Mainnet", value: "mainnet" },
        { title: "Testnet", value: "testnet" },
        { title: "Devnet", value: "devnet" },
      ];
    },
    initial: 0,
    hint: "- You can change this later",
  },
};

export const contractBoilerplateTemplate = {
  path: "contract-boilerplate-template",
  name: "Move Contract Template",
  doc: "https://aptos.dev/en/build/create-aptos-dapp/templates/boilerplate",
}
