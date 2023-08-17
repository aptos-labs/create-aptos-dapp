// constants.ts

export type Template = "new" | "todolist" | "nft-marketplace" | "defi";

export type Network = "mainnet" | "testnet" | "devnet";

export type PackageManager = "npm" | "pnpm" | "yarn";

export type Arguments = {
  name: string;
  template: Template;
  network: Network;
  packageManager: PackageManager;
};

export type ArgumentsKeys = keyof Arguments;

export const ARGUMENT_NAMES = {
  NAME: "name",
  TEMPLATE: "template",
  NETWORK: "network",
  PACKAGE_MANAGER: "packageManager",
};