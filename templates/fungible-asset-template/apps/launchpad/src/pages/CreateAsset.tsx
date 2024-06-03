import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fundNode, uploadFile } from "@/utils/Irys";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import {
  InputTransactionData,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function CreateAsset() {
  const aptosWallet = useWallet();
  const { account, signAndSubmitTransaction } = useWallet();
  const navigate = useNavigate();

  const [name, setName] = useState<string>();
  const [symbol, setSymbol] = useState<string>();
  const [maxSupply, setMaxSupply] = useState<number>();
  const [costToMint, setCostToMint] = useState<number>();
  const [decimal, setDecimal] = useState<number>();
  const [iconURL, setIconURL] = useState<string>();
  const [projectURL, setProjectURL] = useState<string>();
  const [file, setFile] = useState<File | null>(null);

  const createAsset = async () => {
    if (!account) return;
    console.log(
      name,
      symbol,
      maxSupply,
      costToMint,
      decimal,
      iconURL,
      projectURL
    );

    const transaction: InputTransactionData = {
      data: {
        function: `${import.meta.env.VITE_MODULE_ADDRESS}::fa_launchpad::create_fa`,
        functionArguments: [
          maxSupply,
          name,
          symbol,
          decimal,
          iconURL,
          projectURL,
          costToMint,
          0,
          5,
        ],
      },
    };
    console.log("transaction", transaction);
    const response = await signAndSubmitTransaction(transaction);

    const aptosConfig = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(aptosConfig);

    const committedTransactionResponse = await aptos.waitForTransaction({
      transactionHash: response.hash,
    });
    console.log("committedTransactionResponse", committedTransactionResponse);
    if (committedTransactionResponse.success) {
      console.log("here");
      navigate(`/`, { replace: true });
    }
  };

  const onUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      console.log(event.target.files[0]);
      const funded = await fundNode(aptosWallet);
      if (funded) {
        setFile(event.target.files[0]);
      }
    }
  };

  const onUploadFile2 = async () => {
    if (file) {
      const uploadFileResponse = await uploadFile(aptosWallet, file);
      setIconURL(uploadFileResponse);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-6 py-2">
        <div className="w-2/4">
          <h3 className="font-bold leading-none tracking-tight md:text-xl dark:text-white py-2">
            Create Asset
          </h3>
          <div className="py-2">
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Label>Asset Name</Label>
              <Input
                type="text"
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </div>
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Label>Asset Symbol</Label>
              <Input
                type="text"
                onChange={(e) => {
                  setSymbol(e.target.value);
                }}
              />
            </div>
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Label>Max Supply</Label>
              <Input
                type="number"
                onChange={(e) => {
                  setMaxSupply(parseInt(e.target.value));
                }}
              />
            </div>
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Label>Cost to mint</Label>
              <Input
                type="number"
                onChange={(e) => {
                  setCostToMint(parseInt(e.target.value));
                }}
              />
            </div>
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Label>Decimal</Label>
              <Input
                type="number"
                onChange={(e) => {
                  setDecimal(parseInt(e.target.value));
                }}
              />
            </div>
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Label>Project URL</Label>
              <Input
                type="text"
                value={projectURL}
                onChange={(e) => {
                  setProjectURL(e.target.value);
                }}
              />
            </div>
          </div>
          <Button
            // disabled={true}
            onClick={createAsset}
            className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
          >
            Create Asset
          </Button>
        </div>

        {/* TODO, the steps would be:
1. estimate the gas cost based on the data size (run simulation for estimating how much it would cost to upload to irys: https://docs.irys.xyz/developer-docs/irys-sdk/api/getPrice)
2. check the wallet balance on the irys node: irys.getLoadedBalance()
3. if balance is enough, then upload without funding
4. if balance is not enough,  check the payer balance
5. if payer balance > the amount based on the estimation, fund the irys node irys.fund, then upload
6. if payer balance < the amount, replenish the payer balance */}

        <div className="w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Asset Image</CardTitle>
              <CardDescription>
                Uploads asset to a decentralized storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-between">
                <Input
                  type="file"
                  placeholder="Upload Image"
                  onChange={onUploadFile}
                />
                <Input type="text" readOnly value={iconURL} />
              </div>
              <div>
                <Button onClick={() => onUploadFile2()}>Upload file</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
