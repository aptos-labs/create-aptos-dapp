import {
  Account,
  AptosConfig,
  Aptos,
  Network,
  Ed25519Account,
} from "@aptos-labs/ts-sdk";
import { blue } from "kolorist";
import { Selections } from "../types.js";
import { TemplateNetwork } from "./constants.js";

export const createModulePublisherAccount = async (
  selection: Selections
): Promise<Ed25519Account | null> => {
  if (selection.network === TemplateNetwork.MAINNET) {
    return null;
  }
  // If is not mainnet, generate a new account for the module publisher account .env variables and values
  const publisherAccount = Account.generate();
  const aptosConfig = new AptosConfig({
    network: selection.network as unknown as Network,
  });
  const aptos = new Aptos(aptosConfig);
  try {
    await aptos.fundAccount({
      accountAddress: publisherAccount.accountAddress,
      amount: 1_000_000_000,
    });

    return publisherAccount;
  } catch (error: any) {
    console.log(
      `${blue(
        "Could not create a module publisher account, please fill out manually the MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY and MODULE_PUBLISHER_ACCOUNT_ADDRESS in your project .env file."
      )} \nError: ${error}`
    );
    return null;
  }
};
