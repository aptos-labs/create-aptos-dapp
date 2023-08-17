import prompts from "prompts";

export type Template = "new" | "todolist" | "nft-marketplace" | "defi";

export type Network = "mainnet" | "testnet" | "devnet";

export type PackageManager = "npm" | "pnpm" | "yarn";

/// Figures out what package manager to use based on how you ran the command
/// E.g. npx, pnpm dlx, yarn dlx...
const NPM_CONFIG_USER_AGENT = process.env.npm_config_user_agent || "";
const DEFAULT_PACKAGE_MANAGER = NPM_CONFIG_USER_AGENT.startsWith("yarn")
  ? "yarn"
  : NPM_CONFIG_USER_AGENT.startsWith("pnpm")
  ? "pnpm"
  : "npm";

export async function startStandardWorkflow() {
  const { projectPath } = await prompts({
    type: "text",
    name: "projectPath",
    message: "Project name",
    initial: "my-aptos-dapp",
  });
  if (!projectPath) {
    console.log("Exiting.");
    process.exit(0);
  }

  const { template } = await prompts({
    type: "select",
    name: "template",
    message: "Choose how to start",
    choices: [
      {
        title: "Boilerplate dapp",
        value: "new",
        message: "Start building your application from scratch",
      },
      {
        title: "Todolist dapp",
        value: "todolist",
        message: "A template to build todo list dapp",
      },
      {
        title: "NFT marketplace (coming soon)",
        value: "nft-marketplace",
        message: "A template to build NFTs marketplace",
        disabled: true,
      },
      {
        title: "Defi (coming soon)",
        value: "defi",
        message: "A template to build defi dapp",
        disabled: true,
      },
    ],
    initial: 0,
    hint: "- Create a default dapp ",
  });
  if (!template) {
    console.log("Exiting.");
    process.exit(0);
  }

  const { network } = await prompts({
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
  });
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
  const { packageManager } = await prompts({
    type: "select",
    name: "packageManager",
    message: "Choose your package manager",
    choices: [
      { title: "npm", value: "npm" },
      { title: "yarn", value: "yarn" },
      { title: "pnpm", value: "pnpm" },
    ],
    initial: packageManagerInitialIndex,
  });
  if (!packageManager) {
    console.log("Exiting.");
    process.exit(0);
  }

  return {
    projectPath,
    template,
    network,
    packageManager,
  } as {
    projectPath: string;
    template: Template;
    network: Network;
    packageManager: PackageManager;
  };
}
