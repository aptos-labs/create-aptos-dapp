import { validateProjectName } from "./utils/validation.js";

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
        title: "Dapp Boilerplate",
        value: "dapp-boilerplate",
        description:
          "A simple and light-weight web based dapp template that includes the basic structure needed for starting a dapp",
      },
      {
        title: "Node Boilerplate",
        value: "node-boilerplate",
        description:
          "A simple and light-weight node template that includes the basic structure needed for starting a node project on Aptos",
      },
      {
        title: "Todolist dapp",
        value: "todolist-boilerplate",
        description:
          "A fully working todo list dapp with pre-implemented smart contract and UI",
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
  packageManager: {
    type: "select",
    name: "packageManager",
    message: "Choose your package manager",
    choices: [
      { title: "npm", value: "npm" },
      { title: "yarn", value: "yarn" },
      { title: "pnpm", value: "pnpm" },
    ],
    //   initial: getUserPackageManager(),
    initial: 0,
  },
};
