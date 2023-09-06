import prompts from "prompts";
import { ARGUMENT_NAMES, Arguments } from "./constants.js";

/// Figures out what package manager to use based on how you ran the command
/// E.g. npx, pnpm dlx, yarn dlx...
const NPM_CONFIG_USER_AGENT = process.env.npm_config_user_agent || "";
const DEFAULT_PACKAGE_MANAGER = NPM_CONFIG_USER_AGENT.startsWith("yarn")
  ? "yarn"
  : NPM_CONFIG_USER_AGENT.startsWith("pnpm")
  ? "pnpm"
  : "npm";

export async function startStandardWorkflow(options) {
  const { name } =
    options[ARGUMENT_NAMES.NAME] == undefined
      ? await prompts({
          type: "text",
          name: ARGUMENT_NAMES.NAME,
          message: "Project name",
          initial: "my-aptos-dapp",
        })
      : options;
  if (!name) {
    console.log("Exiting.");
    process.exit(0);
  }

  const { template } =
    options[ARGUMENT_NAMES.TEMPLATE] == undefined
      ? await prompts({
          type: "select",
          name: ARGUMENT_NAMES.TEMPLATE,
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
        })
      : options;

  if (!template) {
    console.log("Exiting.");
    process.exit(0);
  }

  const { network } =
    options[ARGUMENT_NAMES.NETWORK] == undefined
      ? await prompts({
          type: "select",
          name: ARGUMENT_NAMES.NETWORK,
          message: "Choose your network",
          choices: [
            { title: "Mainnet", value: "mainnet" },
            { title: "Testnet", value: "testnet" },
            { title: "Devnet", value: "devnet" },
          ],
          initial: 0,
          hint: "- You can change this later",
        })
      : options;

  if (!network) {
    console.log("Exiting.");
    process.exit(0);
  }

  const packageManagerInitialIndex =
    DEFAULT_PACKAGE_MANAGER === "npm"
      ? 0
      : DEFAULT_PACKAGE_MANAGER === "yarn"
      ? 1
      : DEFAULT_PACKAGE_MANAGER === "pnpm"
      ? 2
      : 0;
  const { packageManager } =
    options[ARGUMENT_NAMES.PACKAGE_MANAGER] == undefined
      ? await prompts({
          type: "select",
          name: ARGUMENT_NAMES.PACKAGE_MANAGER,
          message: "Choose your package manager",
          choices: [
            { title: "npm", value: "npm" },
            { title: "yarn", value: "yarn" },
            { title: "pnpm", value: "pnpm" },
          ],
          initial: packageManagerInitialIndex,
        })
      : options;

  if (!packageManager) {
    console.log("Exiting.");
    process.exit(0);
  }

  return {
    name,
    template,
    network,
    packageManager,
  } as Arguments;
}
