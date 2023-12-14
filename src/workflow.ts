import { red } from "kolorist";
import prompts from "prompts";
import { Selections } from "./types.js";
import { getUserPackageManager } from "./utils/helpers.js";
import { validateProjectName } from "./utils/validation.js";

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

  let result = { ...initialResult };

  try {
    let confirmOptions = true;

    while (confirmOptions) {
      const { confirm } = await prompts(
        [
          {
            type: "confirm",
            name: "confirm",
            message: "Do you want to make any changes?(Default is No)",
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
        const changeOptions = await prompts(
          [
            {
              type: "select",
              name: "optionToChange",
              message: "Select the option you want to change",
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

        // Ask for new values based on the user's choice
        switch (changeOptions.optionToChange) {
          case "projectName":
            result.projectName = (
              await prompts({
                type: "text",
                name: "projectName",
                message: "Enter new project name",
                initial: result.projectName,
                validate: (value) => validateProjectName(value),
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
