import prompts from "prompts";
import { red } from "kolorist";
import { workflowOptions } from "./workflowOptions.js";

/**
 * allows users to select a prompt option and change the initial results
 *
 * @export
 * @param {(prompts.Answers<
 *     "projectName" | "template" | "network" | "packageManager"
 *   >)} result
 * @return {*}  {Promise<void>}
 */
export async function rechoseWorkflow(
  result: prompts.Answers<
    "projectName" | "template" | "network" | "packageManager"
  >
): Promise<void> {
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
          { title: "Package Manager", value: "packageManager" },
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
    case "packageManager":
      result.packageManager = (
        await prompts(workflowOptions.packageManager)
      ).packageManager;
      break;

    default:
      console.log("Invalid option selected");
      break;
  }
}
