import { red } from "kolorist";
import prompts from "prompts";
import { Selections } from "./types.js";
import { getUserPackageManager } from "./utils/helpers.js";
import { validateProjectName } from "./utils/validation.js";

export async function startWorkflow() {
  let result: prompts.Answers<
    "projectName" | "template" | "network" | "packageManager"
  >;

  try {
    result = await prompts(
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
              message: "Start building your web dapp from scratch",
            },
            {
              title: "Node Boilerplate",
              value: "node-boilerplate",
              message: "Start building your node dapp from scratch",
            },
            {
              title: "Todolist dapp",
              value: "todolist-boilerplate",
              message: "A template to build todo list dapp",
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
