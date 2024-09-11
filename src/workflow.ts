import { red } from "kolorist";
import prompts from "prompts";
import { rechoseWorkflow } from "./rechoseWorkflow.js";
import type { Result, Selections } from "./types.js";
import { workflowOptions } from "./workflowOptions.js";

export async function startWorkflow() {
  let initialResult: Result;

  try {
    initialResult = await prompts(
      [
        {
          ...workflowOptions.projectName,
          initial: "my-aptos-dapp",
        },
        workflowOptions.template,
        workflowOptions.signingOption,
        workflowOptions.framework,
        workflowOptions.network,
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
  const result = { ...initialResult };

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

  const { projectName, template, framework, signingOption, network } = result;
  return {
    projectName,
    template:
      template && framework === "nextjs"
        ? { ...template, path: "nextjs-boilerplate-template" }
        : template,
    framework,
    signingOption,
    network,
  } as Selections;
}
