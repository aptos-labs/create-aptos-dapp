import { red } from "kolorist";
import prompts from "prompts";
import { Selections } from "./types.js";
import { rechoseWorkflow } from "./rechoseWorkflow.js";
import { workflowOptions } from "./workflowOptions.js";
import { Result } from "./types.js";

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
        workflowOptions.packageManager,
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

  const { projectName, template, network, packageManager } = result;
  const environment = template === "node-boilerplate" ? "node" : "web";
  return {
    projectName,
    template,
    network,
    packageManager,
    environment,
  } as Selections;
}
