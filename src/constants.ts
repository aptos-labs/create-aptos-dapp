// constants.ts

export type Template =
  | "dapp-boilerplate"
  | "node-boilerplate"
  | "todolist-boilerplate";

export type Network = "mainnet" | "testnet" | "devnet";

export type PackageManager = "npm" | "pnpm" | "yarn";

export type Arguments = {
  name: string;
  template: Template;
  network: Network;
  packageManager: PackageManager;
};

export type ArgumentOption = {
  shorthand: string;
  flag: ArgumentsKeys;
  description: string;
};

export type ArgumentsKeys = keyof Arguments;

export const ARGUMENT_NAMES = {
  NAME: "name",
  TEMPLATE: "template",
  NETWORK: "network",
  PACKAGE_MANAGER: "packageManager",
};
