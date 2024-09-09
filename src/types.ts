import type prompts from "prompts";

// constants.ts

export type Result = prompts.Answers<"projectName" | "template" | "network">;

export type Template = {
  name: string;
  path: string;
  doc: string;
  video?: string;
};

export type Network = "mainnet" | "testnet";
export type Framework = "vite" | "nextjs";

export type Selections = {
  projectName: string;
  template: Template;
  network: Network;
  telemetry: boolean;
  framework: Framework;
};

export type TemplateTelemetryData = {
  command: string;
  project_name: string;
  template: string;
  network: string;
  framework: Framework;
};

export type ExampleTelemetryData = {
  command: string;
  example: string;
};
