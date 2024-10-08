import { WalletContextState } from "@aptos-labs/wallet-adapter-react";
import { WebUploader } from "@irys/web-upload";
import { WebAptos } from "@irys/web-upload-aptos";

import { getAccountAPTBalance } from "@/view-functions/getAccountAPTBalance";
import { NETWORK } from "@/constants";

const getIrys = async (aptosWallet: WalletContextState) => {
  // If dapp's network is testnet, use the devnet irys node, otherwise use the mainnet irys node
  const irysNode = NETWORK === "testnet" ? "devnet" : "mainnet";
  const irys = WebUploader(WebAptos).withProvider(aptosWallet).network(irysNode);
  // Irys requires to configure a rpc provider for the devnet node
  if (irysNode === "devnet") {
    irys.withRpc(NETWORK);
  }
  return await irys;
};

export const checkIfFund = async (aptosWallet: WalletContextState, files: File[]) => {
  // 1. estimate the gas cost based on the data size https://docs.irys.xyz/developer-docs/irys-sdk/api/getPrice
  const webIrys = await getIrys(aptosWallet);

  const costToUpload = await webIrys.utils.estimateFolderPrice(files.map((f) => f.size));
  // 2. check the wallet balance on the irys node
  const irysBalance = await webIrys.getBalance();

  // 3. if balance is enough, then upload without funding
  if (irysBalance.toNumber() > costToUpload.toNumber()) {
    return true;
  }
  // 4. if balance is not enough,  check the payer balance
  const currentAccountAddress = await aptosWallet.account!.address;

  const currentAccountBalance = await getAccountAPTBalance({ accountAddress: currentAccountAddress });

  // 5. if payer balance > the amount based on the estimation, fund the irys node irys.fund, then upload
  if (currentAccountBalance > costToUpload.toNumber()) {
    try {
      await fundNode(aptosWallet, costToUpload.toNumber());
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(`Error funding node ${error}`);
    }
  }
  // 6. if payer balance < the amount, replenish the payer balance*/
  return false;
};

export const fundNode = async (aptosWallet: WalletContextState, amount?: number) => {
  const webIrys = await getIrys(aptosWallet);

  try {
    const fundTx = await webIrys.fund(amount ?? 1000000);
    console.log(`Successfully funded ${webIrys.utils.fromAtomic(fundTx.quantity)} ${webIrys.token}`);
    return true;
  } catch (e) {
    throw new Error(`Error uploading data ${e}`);
  }
};

export const uploadFile = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  aptosWallet: any,
  fileToUpload: File,
): Promise<string> => {
  const webIrys = await getIrys(aptosWallet);
  try {
    const receipt = await webIrys.uploadFile(fileToUpload, { tags: [] });
    return `https://gateway.irys.xyz/${receipt.id}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    throw new Error(`Error uploading file ${e}`);
  }
};

export const uploadFolder = async (aptosWallet: WalletContextState, files: File[]) => {
  const webIrys = await getIrys(aptosWallet);

  try {
    const receipt = await webIrys.uploadFolder(files); //returns the manifest ID

    console.log(
      `Files uploaded. Manifest Id=${receipt.manifestId} Receipt Id=${receipt.id}
      access with: https://gateway.irys.xyz/${receipt.manifestId}/<image-name>`,
    );
    return `https://gateway.irys.xyz/${receipt.manifestId}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    throw new Error(`Error uploading folder ${e}`);
  }
};
