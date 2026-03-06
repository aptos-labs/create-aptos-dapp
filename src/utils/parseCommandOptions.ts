import { red } from "kolorist";
import { generateDapp } from "../generateDapp.js";
import { generateExample } from "../generateExample.js";
import { startWorkflow } from "../workflow/index.js";
import { context } from "./context.js";
import { validateFlags } from "./validateFlags.js";
import { printOptionsJson } from "./listOptions.js";
import type { CliFlags } from "../types.js";

export const parseCommandOptions = async (options: CliFlags) => {
  // --list: output JSON and exit
  if (options.list) {
    printOptionsJson();
    return;
  }

  // --example: existing flow
  if (options.example) {
    // Check for conflicting flags
    const hasNewFlags =
      options.name !== undefined ||
      options.projectType !== undefined ||
      options.template !== undefined ||
      options.framework !== undefined ||
      options.network !== undefined ||
      options.useSurf !== undefined ||
      options.apiKey !== undefined;

    if (hasNewFlags) {
      console.error(
        red(
          "Error: --example cannot be combined with other flags (--project-type, --template, --framework, --network, --use-surf, --api-key, --name)"
        )
      );
      process.exit(1);
    }
    return await generateExample({ example: options.example as string });
  }

  if (options.verbose) {
    context.verbose = true;
  }

  // Check if any new flags were provided
  const hasNewFlags =
    options.name !== undefined ||
    options.projectType !== undefined ||
    options.template !== undefined ||
    options.framework !== undefined ||
    options.network !== undefined ||
    options.useSurf !== undefined ||
    options.apiKey !== undefined;

  if (hasNewFlags) {
    // Validate flags and get partial selections
    const prefilled = validateFlags(options);
    const selections = await startWorkflow(prefilled);
    generateDapp(selections);
  } else {
    // Existing interactive flow
    const selections = await startWorkflow();
    generateDapp(selections);
  }
};
