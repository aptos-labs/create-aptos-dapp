import type prompts from "prompts";

export type Result = prompts.Answers<
  "projectName" | "template" | "network" | "signingOption"
>;

export type Template = {
  name: string;
  path: string;
  doc: string;
  video?: string;
};

export type Network = "mainnet" | "testnet";
export type Framework = "vite" | "nextjs";
export type SigningOption = "explicit" | "seamless";

export type Selections = {
  projectName: string;
  template: Template;
  network: Network;
  framework: Framework;
  signingOption: SigningOption;
};

export type TemplateTelemetryData = {
  command: string;
  project_name: string;
  template: string;
  network: string;
  framework: Framework;
  signing_option: string;
};

export type ExampleTelemetryData = {
  command: string;
  example: string;
};
