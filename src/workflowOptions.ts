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
        value: "digital-asset-template",
        description: "A dapp to mint a fungible asset",
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
      { title: "Devnet", value: "devnet" },
    ],
    initial: 0,
    hint: "- You can change this later",
  },
};
