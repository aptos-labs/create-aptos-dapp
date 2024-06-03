import { WebIrys } from "@irys/sdk";

const getWebIrys = async (aptosWallet: any) => {
  const network = "devnet"; // Irys network
  const token = "aptos";
  const rpcUrl = "testnet"; // Aptos network "mainnet" || "testnet"
  const wallet = { rpcUrl: rpcUrl, name: "aptos", provider: aptosWallet };
  const webIrys = new WebIrys({ network, token, wallet });
  await webIrys.ready();
  return webIrys;
};

export const fundNode = async (aptosWallet: any) => {
  const webIrys = await getWebIrys(aptosWallet);

  try {
    const fundTx = await webIrys.fund(1000);
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
  // Your file
  const tags = [{ name: "application-id", value: "MyNFTDrop" }];
  console.log("fileToUpload", fileToUpload);
  try {
    const receipt = await webIrys.uploadFile(fileToUpload, { tags: [] });
    console.log(`File uploaded ==> https://gateway.irys.xyz/${receipt.id}`);
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
