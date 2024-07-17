import prompts from "prompts";

// constants.ts

export type Result = prompts.Answers<"projectName" | "template" | "network">;

export type Template = {
  name: string;
  path: string;
  doc: string;
};

export type Network = "mainnet" | "testnet";

export type Selections = {
  projectName: string;
  template: Template;
  network: Network;
  telemetry: boolean;
};
