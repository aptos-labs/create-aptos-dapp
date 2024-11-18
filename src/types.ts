import type prompts from "prompts";
import {
  TemplateFramework,
  TemplateNetwork,
  TemplateProjectType,
  TemplateSigningOption,
} from "./utils/constants";

export type Result = prompts.Answers<
  | "projectName"
  | "projectType"
  | "template"
  | "network"
  | "signingOption"
  | "useSurf"
  | "useApiKey"
  | "apiKey"
>;

export type Template = {
  name: string;
  path: string;
  doc: string;
  video?: string;
};

export type ProjectType =
  | TemplateProjectType.MOVE
  | TemplateProjectType.FULLSTACK;

export type Network =
  | TemplateNetwork.MAINNET
  | TemplateNetwork.TESTNET
  | TemplateNetwork.DEVNET;

export type Framework = TemplateFramework.VITE | TemplateFramework.NEXTJS;

export type SigningOption =
  | TemplateSigningOption.EXPLICIT
  | TemplateSigningOption.SEAMLESS;

export type Selections = {
  projectName: string;
  projectType: ProjectType;
  template: Template;
  network: Network;
  framework: Framework;
  signingOption: SigningOption;
  useSurf: boolean;
  useApiKey: boolean;
  apiKey: string;
};

export type TemplateTelemetryData = {
  command: string;
  project_name: string;
  project_type: string;
  template: string;
  network: string;
  framework: Framework;
  signing_option: string;
  use_surf: boolean;
  use_api_key: boolean;
};

export type ExampleTelemetryData = {
  command: string;
  example: string;
};
