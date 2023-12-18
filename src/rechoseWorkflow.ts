import prompts from "prompts";
import { red } from "kolorist";
import { validateProjectName } from "./utils/validation.js";

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
    initial: 0,
  },
};

/**
 * dwadwadawdawdawdawd
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
          type: "text",
          name: "projectName",
          message: "Enter a new project name",
          initial: result.projectName,
          validate: (value: string) => validateProjectName(value),
        })
      ).projectName;
      break;
    case "template":
      result.template = (
        await prompts({
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
        })
      ).template;
      break;
    case "network":
      result.network = (
        await prompts({
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
        })
      ).network;
      break;
    case "packageManager":
      result.packageManager = (
        await prompts({
          type: "select",
          name: "packageManager",
          message: "Choose your package manager",
          choices: [
            { title: "npm", value: "npm" },
            { title: "yarn", value: "yarn" },
            { title: "pnpm", value: "pnpm" },
          ],
          initial: 0,
        })
      ).packageManager;
      break;

    default:
      console.log("Invalid option selected");
      break;
  }
}
