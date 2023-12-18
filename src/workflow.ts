import { red } from "kolorist";
import prompts from "prompts";
import { Selections } from "./types.js";
import { getUserPackageManager } from "./utils/helpers.js";
import { validateProjectName } from "./utils/validation.js";
import { rechoseWorkflow } from "./rechoseWorkflow.js";

export async function startWorkflow() {
  let initialResult: prompts.Answers<
    "projectName" | "template" | "network" | "packageManager"
  >;

  try {
    initialResult = await prompts(
      [
        {
          type: "text",
          name: "projectName",
          message: "Project name",
          initial: "my-aptos-dapp",
          validate: (value: string) => validateProjectName(value),
        },
        {
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
        {
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
        {
          type: "select",
          name: "packageManager",
          message: "Choose your package manager",
          choices: [
            { title: "npm", value: "npm" },
            { title: "yarn", value: "yarn" },
            { title: "pnpm", value: "pnpm" },
          ],
          initial: getUserPackageManager(),
        },
      ],
      {
        onCancel: () => {
          throw new Error(red("✖") + " Operation cancelled");
        },
      }
    );
  } catch (err: any) {
    console.log(err.message);
    process.exit(0);
  }

  // copy the initialResults
  let result = { ...initialResult };

  try {
    // A boolean variable that keeps track on whether the user wants to change their initial choices
    let confirmOptions = true;

    // loop until user confirms they want to create the project
    while (confirmOptions) {
      // confirm prompt
      const { confirm } = await prompts(
        [
          {
            type: "confirm",
            name: "confirm",
            message: "Do you want to make any changes? (Default is No)",
            initial: false,
          },
        ],
        {
          onCancel: () => {
            throw new Error(red("✖") + " Operation cancelled");
          },
        }
      );

      if (confirm) {
        // a seperate function for selecting the prompt you want to edit
        await rechoseWorkflow(result);
      } else {
        confirmOptions = false;
      }
    }
  } catch (err: any) {
    console.log(err.message);
    process.exit(0);
  }

  const { projectName, template, network, packageManager } = result;
  const environment = template === "node-boilerplate" ? "node" : "web";
  return {
    projectName,
    template,
    network,
    packageManager,
    environment,
  } as Selections;
}
