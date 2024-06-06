import { WebIrys } from "@irys/sdk";
import { aptosClient } from "./aptosClient";

const getWebIrys = async (aptosWallet: any) => {
  const network = "devnet"; // Irys network
  const token = "aptos";
  const rpcUrl = "testnet"; // Aptos network "mainnet" || "testnet"
  const wallet = { rpcUrl: rpcUrl, name: "aptos", provider: aptosWallet };
  const webIrys = new WebIrys({ network, token, wallet });
  await webIrys.ready();
  return webIrys;
};

/* TODO, the steps would be:
1. estimate the gas cost based on the data size https://docs.irys.xyz/developer-docs/irys-sdk/api/getPrice
2. check the wallet balance on the irys node: irys.getLoadedBalance()
3. if balance is enough, then upload without funding
4. if balance is not enough,  check the payer balance
5. if payer balance > the amount based on the estimation, fund the irys node irys.fund, then upload
6. if payer balance < the amount, replenish the payer balance*/

export const checkIfFund = async (aptosWallet: any, file: File) => {
  const fileSize = file.size;
  // 1. estimate the gas cost based on the data size https://docs.irys.xyz/developer-docs/irys-sdk/api/getPrice
  const webIrys = await getWebIrys(aptosWallet);
  const priceConverted = webIrys.utils.fromAtomic(fileSize).toNumber();
  // 2. check the wallet balance on the irys node: irys.getLoadedBalance()
  const atomicBalance = await webIrys.getLoadedBalance();
  const convertedBalance = webIrys.utils.fromAtomic(atomicBalance).toNumber();
  // 3. if balance is enough, then upload without funding
  if (convertedBalance > priceConverted) {
    return true;
  }
  // 4. if balance is not enough,  check the payer balance
  const currentAccountAddress = await aptosWallet.account.address;

  const currentAccountBalance = await aptosClient().getAccountAPTAmount({
    accountAddress: currentAccountAddress,
  });
  const payerBalance = currentAccountBalance / 1e8;
  // 5. if payer balance > the amount based on the estimation, fund the irys node irys.fund, then upload
  if (payerBalance > priceConverted) {
    await fundNode(aptosWallet, priceConverted);
    return true;
  }
  // 6. if payer balance < the amount, replenish the payer balance*/
  return false;
};

export const fundNode = async (aptosWallet: any, amount?: number) => {
  const webIrys = await getWebIrys(aptosWallet);

  try {
    const fundTx = await webIrys.fund(amount ?? 1000000);
    console.log(
      `Successfully funded ${webIrys.utils.fromAtomic(fundTx.quantity)} ${
        webIrys.token
      }`
    );
    return true;
  } catch (e) {
    console.log("Error uploading data ", e);
    return false;
  }
};

export const uploadFile = async (
  aptosWallet: any,
  fileToUpload: File
): Promise<string> => {
  const webIrys = await getWebIrys(aptosWallet);
  try {
    const receipt = await webIrys.uploadFile(fileToUpload, { tags: [] });
    return `https://gateway.irys.xyz/${receipt.id}`;
  } catch (e) {
    console.log("Error uploading file ", e);
    return "";
  }
};
// TODO aptosWallet:WalletContextState
export const uploadFolder = async (aptosWallet: any, files: File[]) => {
  const webIrys = await getWebIrys(aptosWallet);

  try {
    const receipt = await webIrys.uploadFolder(files); //returns the manifest ID

    console.log(
      `Files uploaded. Manifest Id=${receipt.manifestId} Receipt Id=${receipt.id} 
      access with: https://gateway.irys.xyz/${receipt.manifestId}/<image-name>`
    );
  } catch (e) {
    console.log("Error uploading file ", e);
  }
};
