import { Ed25519Account } from "@aptos-labs/ts-sdk";
import { Selections } from "../types";
import {
  MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY_DESCRIPTION,
  TemplateFramework,
  TemplateNetwork,
  TemplateProjectType,
} from "./constants.js";

export const setUpEnvVariables = (
  selection: Selections,
  publisherAccount: Ed25519Account | null
): string => {
  let content = `PROJECT_NAME=${selection.projectName}`;

  if (selection.framework === TemplateFramework.VITE) {
    content += `\nVITE_APP_NETWORK=${selection.network}`;
    content += `\nVITE_APTOS_API_KEY="${selection.apiKey ?? ""}"`;
  } else if (selection.framework === TemplateFramework.NEXTJS) {
    content += `\nNEXT_PUBLIC_APP_NETWORK=${selection.network}`;
    content += `\nNEXT_PUBLIC_APTOS_API_KEY="${selection.apiKey ?? ""}"`;
  } else if (selection.projectType === TemplateProjectType.MOVE) {
    content += `\nAPP_NETWORK=${selection.network}`;
  } else {
    throw new Error(`Framework ${selection.framework} not supported`);
  }

  // If mainnet selected, we just want to populate .env file with the module publisher account variables without values
  if (selection.network === TemplateNetwork.MAINNET || !publisherAccount) {
    if (selection.framework === TemplateFramework.VITE) {
      content += `\nVITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS=`;
      content += `\n${MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY_DESCRIPTION}\nVITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=`;
    } else if (selection.projectType === TemplateProjectType.MOVE) {
      content += `\nMODULE_PUBLISHER_ACCOUNT_ADDRESS=`;
      content += `\n${MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY_DESCRIPTION}\nMODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=`;
    } else {
      content += `\nNEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS=`;
      content += `\n${MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY_DESCRIPTION}\nNEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=`;
    }
    return content;
  }

  if (selection.framework === TemplateFramework.VITE) {
    content += `\nVITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS=${publisherAccount.accountAddress.toString()}`;
    content += `\n${MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY_DESCRIPTION}\nVITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=${publisherAccount.privateKey.toString()}`;
  } else if (selection.projectType === TemplateProjectType.MOVE) {
    content += `\nMODULE_PUBLISHER_ACCOUNT_ADDRESS=${publisherAccount.accountAddress.toString()}`;
    content += `\n${MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY_DESCRIPTION}\nMODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=${publisherAccount.privateKey.toString()}`;
  } else if (selection.framework === TemplateFramework.NEXTJS) {
    content += `\nNEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS=${publisherAccount.accountAddress.toString()}`;
    content += `\n${MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY_DESCRIPTION}\nNEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=${publisherAccount.privateKey.toString()}`;
  } else {
    throw new Error(`Framework ${selection.framework} not supported`);
  }
  return content;
};
