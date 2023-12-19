import prompts from "prompts";

// constants.ts

export type Result = prompts.Answers<
  "projectName" | "template" | "network" | "packageManager"
>;

export type Template =
  | "dapp-boilerplate"
  | "node-boilerplate"
  | "todolist-boilerplate";

export type Network = "mainnet" | "testnet" | "devnet";

export type PackageManager = "npm" | "pnpm" | "yarn";

export type Selections = {
  projectName: string;
  template: Template;
  network: Network;
  packageManager: PackageManager;
  environment: string;
};
