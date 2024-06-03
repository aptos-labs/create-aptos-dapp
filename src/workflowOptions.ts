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
        title: "Fungible Asset",
        value: "fungible-asset-template",
        description: "A dapp to mint a fungible asset",
      },
      {
        title: "NFT",
        value: "nft-template",
        description: "A dapp to mint a NFT",
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
