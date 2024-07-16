import { red } from "kolorist";
import prompts from "prompts";
import { Selections, Result } from "./types.js";
import { rechoseWorkflow } from "./rechoseWorkflow.js";
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
        workflowOptions.network,
        workflowOptions.analytics,
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
  let result = { ...initialResult };

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
            message: "Do you want to make any changes? (Default is No)",
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
        // a seperate function for selecting the prompt you want to edit
        await rechoseWorkflow(result);
      } else {
        confirmOptions = false;
      }
    }
  } catch (err: any) {
    console.log(err.message);
    process.exit(0);
  }

  const { projectName, template, network, telemetry } = result;
  return {
    projectName,
    template,
    network,
    telemetry,
  } as Selections;
}
