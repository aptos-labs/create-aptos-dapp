import prompts from "prompts";

// constants.ts

export type Result = prompts.Answers<"projectName" | "template" | "network">;

export type Template = "todolist-boilerplate";

export type Network = "mainnet" | "testnet" | "devnet";

export type Selections = {
  projectName: string;
  template: Template;
  network: Network;
  environment: string;
};
