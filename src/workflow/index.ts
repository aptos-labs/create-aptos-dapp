import { red } from "kolorist";
import prompts from "prompts";
import { rechoseWorkflow } from "./rechoseWorkflow.js";
import type { PartialSelections, Result, Selections } from "../types.js";
import { workflowOptions } from "./workflowOptions.js";
import {
  ContractBoilerplateTemplateValues,
  TemplateFramework,
  TemplateProjectType,
} from "../utils/constants.js";

function isComplete(partial: PartialSelections): boolean {
  if (!partial.projectName || !partial.projectType || !partial.network)
    return false;
  if (partial.projectType === TemplateProjectType.FULLSTACK) {
    if (!partial.template || !partial.framework) return false;
  }
  return true;
}

export async function startWorkflow(prefilled?: PartialSelections) {
  // If all required values are present, skip prompts entirely
  if (prefilled && isComplete(prefilled)) {
    const isMoveProject = prefilled.projectType === TemplateProjectType.MOVE;
    return {
      projectName: prefilled.projectName!,
      projectType: prefilled.projectType!,
      template: isMoveProject
        ? ContractBoilerplateTemplateValues
        : prefilled.template!,
      network: prefilled.network!,
      framework: isMoveProject
        ? TemplateFramework.VITE
        : prefilled.framework!,
      useSurf: prefilled.useSurf ?? false,
      useApiKey: prefilled.useApiKey ?? false,
      apiKey: prefilled.apiKey ?? "",
    } as Selections;
  }

  // Build prompt array
  const promptArray = [
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
  ];

  // In hybrid mode, wrap each prompt's type function to skip prefilled values
  // and inject prefilled values into the values accumulator so subsequent
  // prompts can reference them in their type/choices functions.
  const effectivePrompts = prefilled
    ? promptArray.map((prompt) => ({
        ...prompt,
        type: (prev: any, values: any) => {
          // Inject prefilled values so subsequent prompts see them
          for (const [key, val] of Object.entries(prefilled)) {
            if (val !== undefined && values[key] === undefined) {
              values[key] = val;
            }
          }
          // Skip if this prompt's value is already prefilled
          if (
            prefilled[prompt.name as keyof PartialSelections] !== undefined
          ) {
            return null;
          }
          // Call original type (may be a string or function)
          return typeof prompt.type === "function"
            ? prompt.type(prev, values)
            : prompt.type;
        },
      }))
    : promptArray;

  let initialResult: Result;

  try {
    initialResult = await prompts(effectivePrompts, {
      onCancel: () => {
        throw new Error(red("✖") + " Operation cancelled");
      },
    });
  } catch (err: any) {
    console.log(err.message);
    process.exit(0);
  }

  // Merge: prefilled values take precedence over prompted values
  const merged = prefilled
    ? { ...initialResult, ...prefilled }
    : initialResult;

  // copy the results
  const result = {
    ...merged,
    template:
      merged.projectType === TemplateProjectType.MOVE
        ? ContractBoilerplateTemplateValues
        : merged.template,
  };

  // Skip confirmation/rechose loop when flags were provided
  if (!prefilled) {
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
    useSurf: useSurf ?? false,
    network,
    useApiKey: useApiKey ?? false,
    apiKey: apiKey ?? "",
  } as Selections;
}
