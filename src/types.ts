import prompts from "prompts";

// constants.ts

export type Result = prompts.Answers<"projectName" | "template" | "network">;

export type Template = {
  name: string;
  path: string;
  doc: string;
  video?: string;
};

export type Network = "mainnet" | "testnet";

export type Selections = {
  projectName: string;
  template: Template;
  network: Network;
  telemetry: boolean;
};

export type TemplateTelemetryData = {
  command: string;
  project_name: string;
  template: string;
  network: string;
};

export type ExampleTelemetryData = {
  command: string;
  example: string;
};
