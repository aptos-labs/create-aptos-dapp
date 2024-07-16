import { validateProjectName } from "./utils/index.js";

/** workflow object containing all the text for the different prompt options */
export const workflowOptions = {
  projectName: {
    type: "text",
    name: "projectName",
    message: "Enter a new project name",
    validate: (value: string) => validateProjectName(value),
  },
  template: {
    type: "select",
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
        description: "A Boilerplate template to start an Aptos dapp with",
      },
      {
        title: "Digital Asset",
        value: {
          path: "digital-asset-template",
          name: "Digital Asset",
          doc: "https://aptos.dev/en/build/create-aptos-dapp/templates/digital-asset",
        },
        description: "A NFT minting dapp",
      },
      {
        title: "Fungible Asset",
        value: {
          path: "fungible-asset-template",
          name: "Fungible Asset",
          doc: "https://aptos.dev/en/build/create-aptos-dapp/templates/fungible-asset",
        },
        description: "A fungible asset minting dapp",
      },
    ],
    initial: 0,
  },
  network: {
    type: "select",
    name: "network",
    message: "Choose your network",
    choices(prev) {
      if (prev.path === "boilerplate-template") {
        return [
          { title: "Mainnet", value: "mainnet" },
          { title: "Testnet", value: "testnet" },
          { title: "Devnet", value: "devnet" },
        ];
      }
      return [
        { title: "Mainnet", value: "mainnet" },
        { title: "Testnet", value: "testnet" },
      ];
    },
    initial: 0,
    hint: "- You can change this later",
  },
  analytics: {
    type: "confirm",
    name: "telemetry",
    message: "Help us improve create-aptos-dapp by collection anonymous data",
    initial: true,
  },
};
