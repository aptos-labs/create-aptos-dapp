import prompts from "prompts";
import { red } from "kolorist";
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
    initial: getUserPackageManager()
  },
};

/**
 * allows users to select a prompt option and change the initial results 
 *
 * @export
 * @param {(prompts.Answers<
 *     "projectName" | "template" | "network" | "packageManager"
 *   >)} result
 * @return {*}  {Promise<void>}
 */
export async function rechoseWorkflow(
  result: prompts.Answers<
    "projectName" | "template" | "network" | "packageManager"
  >
): Promise<void> {
  // choose the option prompt
  const changeOptions = await prompts(
    [
      {
        type: "select",
        name: "optionToChange",
        message: "Select the choice you want to change",
        choices: [
          { title: "Project Name", value: "projectName" },
          { title: "Template", value: "template" },
          { title: "Network", value: "network" },
          { title: "Package Manager", value: "packageManager" },
        ],
      },
    ],
    {
      onCancel: () => {
        throw new Error(red("✖") + " Operation cancelled");
      },
    }
  );

  // Ask for new values based on the user's choice and update the result object
  switch (changeOptions.optionToChange) {
    case "projectName":
      result.projectName = (
        await prompts({
          ...workflowOptions.projectName,
          initial: result.projectName,
        })
      ).projectName;
      break;
    case "template":
      result.template = (await prompts(workflowOptions.template)).template;
      break;
    case "network":
      result.network = (await prompts(workflowOptions.network)).network;
      break;
    case "packageManager":
      result.packageManager = (
        await prompts(workflowOptions.packageManager)
      ).packageManager;
      break;

    default:
      console.log("Invalid option selected");
      break;
  }
}
