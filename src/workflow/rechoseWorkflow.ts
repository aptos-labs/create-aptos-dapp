import prompts from "prompts";
import { red } from "kolorist";
import { workflowOptions } from "./workflowOptions.js";
import { Result } from "../types.js";
import {
  ContractBoilerplateTemplateValues,
  TemplateNetwork,
  TemplateProjectType,
} from "../utils/constants.js";

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
        choices() {
          if (result.projectType === TemplateProjectType.MOVE) {
            return [
              { title: "Project Name", value: "projectName" },
              { title: "Project Type", value: "projectType" },
              { title: "Network", value: "network" },
            ];
          } else {
            return [
              { title: "Project Name", value: "projectName" },
              { title: "Project Type", value: "projectType" },
              { title: "Template", value: "template" },
              { title: "Network", value: "network" },
            ];
          }
        },
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
    case "projectType":
      const previousProjectType = result.projectType;

      result.projectType = (
        await prompts(workflowOptions.projectType)
      ).projectType;

      if (previousProjectType === result.projectType) {
        break;
      } else if (result.projectType === TemplateProjectType.MOVE) {
        result.template = ContractBoilerplateTemplateValues;
        result.framework = undefined;
        break;
      }
    case "template":
      Object.assign(
        result,
        await prompts([
          { ...workflowOptions.template, type: "select" },
          {
            ...workflowOptions.signingOption,
            type: (prev) =>
              prev?.path == "clicker-game-tg-mini-app-template"
                ? "select"
                : null,
          },
          { ...workflowOptions.framework, type: "select" },
          {
            ...workflowOptions.network,
            type: result.network === TemplateNetwork.DEVNET ? "select" : null,
          },
        ])
      );
      break;
    case "network":
      result.network = (
        await prompts([
          {
            ...workflowOptions.network,
            // NFT and Token minting dapps only support Mainnet and Testnet
            choices:
              result.template.path === "nft-minting-dapp-template" ||
              result.template.path === "token-minting-dapp-template"
                ? [
                    { title: "Mainnet", value: TemplateNetwork.MAINNET },
                    { title: "Testnet", value: TemplateNetwork.TESTNET },
                  ]
                : [
                    { title: "Mainnet", value: TemplateNetwork.MAINNET },
                    { title: "Testnet", value: TemplateNetwork.TESTNET },
                    { title: "Devnet", value: TemplateNetwork.DEVNET },
                  ],
          },
        ])
      ).network;
      break;

    default:
      console.log("Invalid option selected");
      break;
  }
}
