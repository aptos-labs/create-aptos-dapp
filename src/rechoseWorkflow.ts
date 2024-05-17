import prompts from "prompts";
import { red } from "kolorist";
import { workflowOptions } from "./workflowOptions.js";
import { Result } from "./types.js";

/**
 * allows users to select a prompt option and change the initial results
 *
 * @export
 * @param {Result} result
 * @return {*}  {Promise<void>}
 */
export async function rechoseWorkflow(result: Result): Promise<void> {
  // choose the option prompt
  const changeOptions = await prompts(
    [
      {
        type: "select",
        name: "optionToChange",
        message: "Select the choice you want to change",
        choices: [
          { title: "Project Name", value: "projectName" },
          { title: "Template", value: "template" },
          { title: "Network", value: "network" },
        ],
      },
    ],
    {
      onCancel: () => {
        throw new Error(red("✖") + " Operation cancelled");
      },
    }
  );

  // Ask for new values based on the user's choice and update the result object
  switch (changeOptions.optionToChange) {
    case "projectName":
      result.projectName = (
        await prompts({
          ...workflowOptions.projectName,
          initial: result.projectName,
        })
      ).projectName;
      break;
    case "template":
      result.template = (await prompts(workflowOptions.template)).template;
      break;
    case "network":
      result.network = (await prompts(workflowOptions.network)).network;
      break;

    default:
      console.log("Invalid option selected");
      break;
  }
}
