import { red } from "kolorist";
import prompts from "prompts";
import { rechoseWorkflow } from "./rechoseWorkflow.js";
import type { Result, Selections } from "../types.js";
import { workflowOptions } from "./workflowOptions.js";
import {
  ContractBoilerplateTemplateValues,
  TemplateProjectType,
} from "../utils/constants.js";

export async function startWorkflow() {
  let initialResult: Result;

  try {
    initialResult = await prompts(
      [
        {
          ...workflowOptions.projectName,
          initial: "my-aptos-dapp",
        },
        workflowOptions.projectType,
        workflowOptions.template,
        workflowOptions.useSurf,
        workflowOptions.framework,
        workflowOptions.network,
        workflowOptions.useApiKey,
        workflowOptions.apiKey,
      ],
      {
        onCancel: () => {
          throw new Error(red("✖") + " Operation cancelled");
        },
      }
    );
  } catch (err: any) {
    console.log(err.message);
    process.exit(0);
  }

  // copy the initialResults
  const result = {
    ...initialResult,
    template:
      initialResult.projectType === TemplateProjectType.MOVE
        ? ContractBoilerplateTemplateValues
        : initialResult.template,
  };

  try {
    // A boolean variable that keeps track on whether the user wants to change their initial choices
    let confirmOptions = true;

    // loop until user confirms they want to create the project
    while (confirmOptions) {
      // confirm prompt
      const { confirm } = await prompts(
        [
          {
            type: "confirm",
            name: "confirm",
            message:
              "Do you want to make any changes to your selections? (Default is No)",
            initial: false,
          },
        ],
        {
          onCancel: () => {
            throw new Error(red("✖") + " Operation cancelled");
          },
        }
      );

      if (confirm) {
        // a separate function for selecting the prompt you want to edit
        await rechoseWorkflow(result);
      } else {
        confirmOptions = false;
      }
    }
  } catch (err: any) {
    console.log(err.message);
    process.exit(0);
  }

  const {
    projectName,
    template,
    framework,
    useSurf,
    network,
    projectType,
    useApiKey,
    apiKey,
  } = result;
  return {
    projectName,
    template,
    projectType,
    framework,
    useSurf,
    network,
    useApiKey,
    apiKey,
  } as Selections;
}
