import { red } from "kolorist";
import type { CliFlags, PartialSelections, Template } from "../types.js";
import {
  TemplateProjectType,
  TemplateNetwork,
  TemplateFramework,
  FullstackBoilerplateTemplateInfo,
  NftMintingDappTemplateInfo,
  TokenMintingDappTemplateInfo,
  TokenStakingDappTemplateInfo,
  CustomIndexerTemplateInfo,
} from "./constants.js";
import { validateProjectName } from "./validation.js";

const TEMPLATE_MAP: Record<string, Template> = {
  "boilerplate-template": FullstackBoilerplateTemplateInfo.value,
  "nft-minting-dapp-template": NftMintingDappTemplateInfo.value,
  "token-minting-dapp-template": TokenMintingDappTemplateInfo.value,
  "token-staking-dapp-template": TokenStakingDappTemplateInfo.value,
  "custom-indexer-template": CustomIndexerTemplateInfo.value,
};

const PROJECT_TYPES = Object.values(TemplateProjectType);
const NETWORKS = Object.values(TemplateNetwork);
const FRAMEWORKS = Object.values(TemplateFramework);
const TEMPLATE_IDS = Object.keys(TEMPLATE_MAP);

const VITE_ONLY_TEMPLATES = [
  "nft-minting-dapp-template",
  "token-minting-dapp-template",
  "token-staking-dapp-template",
];

const NEXTJS_ONLY_TEMPLATES = ["custom-indexer-template"];

const NO_DEVNET_TEMPLATES = [
  "nft-minting-dapp-template",
  "token-minting-dapp-template",
];

function fail(message: string): never {
  console.error(red(`Error: ${message}`));
  process.exit(1);
}

export function validateFlags(flags: CliFlags): PartialSelections {
  const result: PartialSelections = {};

  // Validate project name
  if (flags.name !== undefined) {
    const nameValidation = validateProjectName(flags.name);
    if (nameValidation !== true) {
      fail((nameValidation as string).trim());
    }
    result.projectName = flags.name;
  }

  // Validate project type
  if (flags.projectType !== undefined) {
    if (!PROJECT_TYPES.includes(flags.projectType as any)) {
      fail(
        `Invalid project type: "${flags.projectType}"\nValid values for --project-type: ${PROJECT_TYPES.join(", ")}`
      );
    }
    result.projectType = flags.projectType as TemplateProjectType;
  }

  // Validate template
  if (flags.template !== undefined) {
    if (!TEMPLATE_IDS.includes(flags.template)) {
      fail(
        `Invalid template: "${flags.template}"\nValid values for --template: ${TEMPLATE_IDS.join(", ")}`
      );
    }
    result.template = TEMPLATE_MAP[flags.template];
  }

  // Validate framework
  if (flags.framework !== undefined) {
    if (!FRAMEWORKS.includes(flags.framework as any)) {
      fail(
        `Invalid framework: "${flags.framework}"\nValid values for --framework: ${FRAMEWORKS.join(", ")}`
      );
    }
    result.framework = flags.framework as TemplateFramework;
  }

  // Validate network
  if (flags.network !== undefined) {
    if (!NETWORKS.includes(flags.network as any)) {
      fail(
        `Invalid network: "${flags.network}"\nValid values for --network: ${NETWORKS.join(", ")}`
      );
    }
    result.network = flags.network as TemplateNetwork;
  }

  // Handle useSurf
  if (flags.useSurf !== undefined) {
    result.useSurf = flags.useSurf;
  }

  // Handle apiKey
  if (flags.apiKey !== undefined) {
    result.useApiKey = true;
    result.apiKey = flags.apiKey;
  }

  // --- Cross-validation ---

  // Move project cannot have template/framework/useSurf/apiKey
  if (result.projectType === TemplateProjectType.MOVE) {
    if (flags.template !== undefined) {
      fail("--template cannot be used with move projects");
    }
    if (flags.framework !== undefined) {
      fail("--framework cannot be used with move projects");
    }
    if (flags.useSurf !== undefined) {
      fail("--use-surf cannot be used with move projects");
    }
    if (flags.apiKey !== undefined) {
      fail("--api-key cannot be used with move projects");
    }
  }

  // Template + network devnet restriction
  if (flags.template && flags.network === TemplateNetwork.DEVNET) {
    if (NO_DEVNET_TEMPLATES.includes(flags.template)) {
      fail(
        `devnet is not supported for ${flags.template} (Irys does not support devnet).\nValid networks for this template: mainnet, testnet`
      );
    }
  }

  // Template + framework restrictions
  if (flags.template && flags.framework) {
    if (
      VITE_ONLY_TEMPLATES.includes(flags.template) &&
      flags.framework === "nextjs"
    ) {
      fail(
        `${flags.template} only supports the vite framework.\nValid values for --framework with this template: vite`
      );
    }
    if (
      NEXTJS_ONLY_TEMPLATES.includes(flags.template) &&
      flags.framework === "vite"
    ) {
      fail(
        `${flags.template} only supports the nextjs framework.\nValid values for --framework with this template: nextjs`
      );
    }
  }

  // useSurf restriction
  if (
    flags.useSurf &&
    flags.template &&
    flags.template !== "boilerplate-template"
  ) {
    fail("--use-surf is only supported with the boilerplate-template");
  }

  // Auto-infer framework when template constrains to one option
  if (flags.template && !flags.framework) {
    if (NEXTJS_ONLY_TEMPLATES.includes(flags.template)) {
      result.framework = TemplateFramework.NEXTJS;
    } else if (VITE_ONLY_TEMPLATES.includes(flags.template)) {
      result.framework = TemplateFramework.VITE;
    }
  }

  return result;
}
