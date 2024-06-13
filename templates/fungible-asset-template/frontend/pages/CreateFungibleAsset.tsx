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

import { checkIfFund, uploadFile } from "@/utils/Irys";
import {
  InputTransactionData,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { aptosClient } from "@/utils/aptosClient";
import { LaunchpadHeader } from "@/components/LaunchpadHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertOctagon } from "lucide-react";

export function CreateFungibleAsset() {
  const aptosWallet = useWallet();
  const { account, signAndSubmitTransaction } = useWallet();
  const navigate = useNavigate();
  const [name, setName] = useState<string>();
  const [symbol, setSymbol] = useState<string>();
  const [maxSupply, setMaxSupply] = useState<string>();
  const [mintFeePerFA, setMintFeePerFA] = useState<number>();
  const [maxMintPerAccount, setMaxMintPerAccount] = useState<string>();
  const [decimal, setDecimal] = useState<string>();
  const [iconURL, setIconURL] = useState<string>();
  const [projectURL, setProjectURL] = useState<string>();
  const [mintForMyself, setMintForMyself] = useState<number>();
  const [disableCreateAssetButton, setDisableCreateAssetButton] =
    useState<boolean>(true);

  useEffect(() => {
    if (
      name &&
      symbol &&
      maxSupply &&
      mintFeePerFA &&
      decimal &&
      iconURL &&
      projectURL
    ) {
      setDisableCreateAssetButton(false);
    }
  }, [
    name,
    symbol,
    maxSupply,
    mintFeePerFA,
    decimal,
    iconURL,
    projectURL,
    maxMintPerAccount,
  ]);

  const createAsset = async () => {
    if (!account) return;

    const transaction: InputTransactionData = {
      data: {
        function: `${
          import.meta.env.VITE_MODULE_ADDRESS
        }::fa_launchpad::create_fa`,
        typeArguments: [],
        functionArguments: [
          maxSupply,
          name,
          symbol,
          decimal,
          iconURL,
          projectURL,
          mintFeePerFA ? mintFeePerFA * 1e8 : 0,
          mintForMyself,
          maxMintPerAccount,
        ],
      },
    };
    const response = await signAndSubmitTransaction(transaction);

    const committedTransactionResponse = await aptosClient().waitForTransaction(
      {
        transactionHash: response.hash,
      }
    );
    if (committedTransactionResponse.success) {
      navigate(`/my-assets`, { replace: true });
    }
  };

  const onUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      const funded = await checkIfFund(aptosWallet, file);
      if (funded) {
        const uploadFileResponse = await uploadFile(aptosWallet, file);
        setIconURL(uploadFileResponse);
      } else {
        alert(
          "Current account balance is not enough to fund a decentrelized asset node"
        );
      }
    }
  };

  return (
    <>
      <LaunchpadHeader />
      <div className="flex items-center justify-between px-6 py-2">
        <div className="w-2/4">
          {!account && (
            <Alert variant="warning">
              <AlertOctagon className="w-4 h-5" />
              <AlertTitle className="body-md-semibold">
                Connect wallet
              </AlertTitle>
              <AlertDescription className="body-sm">
                To continue with creating your asset, first connect your wallet
                by copy the private_key from the .aptos/config.yaml file and
                import it into the wallet.
              </AlertDescription>
            </Alert>
          )}
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
                  setMaxSupply(e.target.value);
                }}
              />
            </div>
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Label>Mint fee per fungible asset</Label>
              <Input
                type="number"
                onChange={(e) => {
                  setMintFeePerFA(parseInt(e.target.value));
                }}
              />
            </div>
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Label>Max mint per account</Label>
              <Input
                type="number"
                onChange={(e) => {
                  setMaxMintPerAccount(e.target.value);
                }}
              />
            </div>
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Label>Decimal</Label>
              <Input
                type="number"
                onChange={(e) => {
                  setDecimal(e.target.value);
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
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Label>Mint for myself (Optional)</Label>
              <Input
                type="number"
                value={mintForMyself}
                onChange={(e) => {
                  setMintForMyself(parseInt(e.target.value));
                }}
              />
            </div>
          </div>
          <Button
            disabled={disableCreateAssetButton}
            onClick={createAsset}
            className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
          >
            Create Asset
          </Button>
        </div>

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
                <img src={iconURL}></img>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
