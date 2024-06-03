import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WebIrys } from "@irys/sdk";
import { useState } from "react";

const getWebIrys = async (aptosWallet: any) => {
  const network = "devnet"; // Irys network
  const token = "aptos";
  const rpcUrl = "testnet"; // Aptos network "mainnet" || "testnet"
  const wallet = { rpcUrl: rpcUrl, name: "aptos", provider: aptosWallet };
  const webIrys = new WebIrys({ network, token, wallet });
  await webIrys.ready();
  return webIrys;
};

const fundNode = async (aptosWallet: any) => {
  const webIrys = await getWebIrys(aptosWallet);

  try {
    const fundTx = await webIrys.fund(1000);
    console.log(
      `Successfully funded ${webIrys.utils.fromAtomic(fundTx.quantity)} ${
        webIrys.token
      }`
    );
  } catch (e) {
    console.log("Error uploading data ", e);
  }
};

const uploadFile = async (aptosWallet: any, fileToUpload: File) => {
  const webIrys = await getWebIrys(aptosWallet);
  // Your file
  const tags = [{ name: "application-id", value: "MyNFTDrop" }];

  try {
    const receipt = await webIrys.uploadFile(fileToUpload, { tags: tags });
    console.log(`File uploaded ==> https://gateway.irys.xyz/${receipt.id}`);
  } catch (e) {
    console.log("Error uploading file ", e);
  }
};
// TODO aptosWallet:WalletContextState
const uploadFolder = async (aptosWallet: any, files: File[]) => {
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

export default function Irys() {
  const aptosWallet = useWallet();
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[] | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleMultipleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = [];
    if (e.target.files) {
      for (let i = 0; i < e.target.files.length; i++) {
        files.push(e.target.files[i]);
      }
    }
    setFiles(files);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "50px" }}>
      {/* Fund a node on to upload the images to */}
      <div>
        <button onClick={() => fundNode(aptosWallet)}>Fund node</button>
      </div>
      {/* Upload a file */}
      <div>
        <div className="input-group">
          <label htmlFor="file" className="sr-only">
            Choose a file
          </label>
          <input id="file" type="file" onChange={handleFileChange} />
        </div>
        {file && (
          <section>
            File details:
            <ul>
              <li>Name: {file.name}</li>
              <li>Type: {file.type}</li>
              <li>Size: {file.size} bytes</li>
            </ul>
          </section>
        )}
        {file && (
          <button
            onClick={() => uploadFile(aptosWallet, file)}
            className="submit"
          >
            Upload a file
          </button>
        )}
      </div>
      {/* Upload files */}
      <div>
        <div className="input-group">
          <label htmlFor="file" className="sr-only">
            Choose Multiple Files
          </label>
          <input
            id="folder"
            type="file"
            multiple
            onChange={handleMultipleFiles}
          />
        </div>
        {files && (
          <section>
            Files details:
            <ul>
              {files.map((file) => {
                return (
                  <>
                    <hr />
                    <li>Name: {file.name}</li>

                    <li>Type: {file.type}</li>
                    <li>Size: {file.size} bytes</li>
                  </>
                );
              })}
            </ul>
          </section>
        )}
        {files && (
          <button
            onClick={() => uploadFolder(aptosWallet, files)}
            className="submit"
          >
            Upload Multiple files
          </button>
        )}
      </div>
    </div>
  );
}
