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
    choices: [
      { title: "Mainnet", value: "mainnet" },
      { title: "Testnet", value: "testnet" },
    ],
    initial: 0,
    hint: "- You can change this later",
  },
};
