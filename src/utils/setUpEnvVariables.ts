import { Ed25519Account } from "@aptos-labs/ts-sdk";
import { Selections } from "../types";

export const setUpEnvVariables = (
  selection: Selections,
  publisherAccount: Ed25519Account | null
): string => {
  let content = `PROJECT_NAME=${selection.projectName}`;

  if (selection.framework === "vite") {
    content += `\nVITE_APP_NETWORK=${selection.network}`;
  } else if (selection.framework === "nextjs") {
    content += `\nNEXT_PUBLIC_APP_NETWORK=${selection.network}`;
  }else if (selection.framework === "contract") {
    content += `\nAPP_NETWORK=${selection.network}`;
  } else {
    throw new Error(`Framework ${selection.framework} not supported`);
  }

  // If mainnet selected, we just want to populate .env file with the module publisher account variables without values
  if (selection.network === "mainnet" || !publisherAccount) {
    if (selection.framework === "vite") {
      content += `\nVITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS=`;
      content += `\n#This is the module publisher account's private key. Be cautious about who you share it with, and ensure it is not exposed when deploying your dApp.\nVITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=`;
    }else if (selection.framework === "contract") {
      content += `\nMODULE_PUBLISHER_ACCOUNT_ADDRESS=`;
      content += `\n#This is the module publisher account's private key. Be cautious about who you share it with, and ensure it is not exposed when deploying your dApp.\nMODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=`
    } else {
      content += `\nNEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS=`;
      content += `\n#This is the module publisher account's private key. Be cautious about who you share it with, and ensure it is not exposed when deploying your dApp.\nNEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=`;
    }
    return content;
  }

  if (selection.framework === "vite") {
    content += `\nVITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS=${publisherAccount.accountAddress.toString()}`;
    content += `\n#This is the module publisher account's private key. Be cautious about who you share it with, and ensure it is not exposed when deploying your dApp.\nVITE_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=${publisherAccount.privateKey.toString()}`;
  } else if (selection.framework === "contract") {
    content += `\nMODULE_PUBLISHER_ACCOUNT_ADDRESS=${publisherAccount.accountAddress.toString()}`;
    content += `\n#This is the module publisher account's private key. Be cautious about who you share it with, and ensure it is not exposed when deploying your dApp.\nMODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=${publisherAccount.privateKey.toString()}`;
  } else if (selection.framework === "nextjs") {
    content += `\nNEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS=${publisherAccount.accountAddress.toString()}`;
    content += `\n#This is the module publisher account's private key. Be cautious about who you share it with, and ensure it is not exposed when deploying your dApp.\nNEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=${publisherAccount.privateKey.toString()}`;
  } else {
    throw new Error(`Framework ${selection.framework} not supported`);
  }
  return content;
};
