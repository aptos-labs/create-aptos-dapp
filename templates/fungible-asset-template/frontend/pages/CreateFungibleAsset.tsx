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
import { Spinner } from "@/components/ui/spinner";

import { checkIfFund, uploadFile } from "@/utils/Irys";
import {
  InputTransactionData,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { aptosClient } from "@/utils/aptosClient";
import {
  APT_DECIMALS,
  convertAmountFromHumanReadableToOnChain,
} from "@/utils/helpers";
import { LaunchpadHeader } from "@/components/LaunchpadHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertOctagon } from "lucide-react";
import { CREATOR_ADDRESS } from "@/constants";
import { cn } from "@/lib/utils";

export function CreateFungibleAsset() {
  const aptosWallet = useWallet();
  const { account, signAndSubmitTransaction } = useWallet();
  const navigate = useNavigate();
  const [name, setName] = useState<string>();
  const [symbol, setSymbol] = useState<string>();
  const [maxSupply, setMaxSupply] = useState<string>();
  const [maxMintPerAccount, setMaxMintPerAccount] = useState<number>();
  const [decimal, setDecimal] = useState<number>();
  const [iconURL, setIconURL] = useState<string>();
  const [projectURL, setProjectURL] = useState<string>();
  const [mintFeePerFA, setMintFeePerFA] = useState<string>();
  const [mintForMyself, setMintForMyself] = useState<string>();

  const [isUploading, setIsUploading] = useState(false);

  const disableCreateAssetButton =
    !name ||
    !symbol ||
    !maxSupply ||
    !decimal ||
    !iconURL ||
    !projectURL ||
    !maxMintPerAccount ||
    !account ||
    isUploading;

  const createAsset = async () => {
    if (!account) return;

    const transaction: InputTransactionData = {
      data: {
        function: `${
          import.meta.env.VITE_MODULE_ADDRESS
        }::launchpad::create_fa`,
        typeArguments: [],
        functionArguments: [
          convertAmountFromHumanReadableToOnChain(
            Number(maxSupply),
            Number(decimal)
          ),
          name,
          symbol,
          decimal,
          iconURL,
          projectURL,
          mintFeePerFA
            ? convertAmountFromHumanReadableToOnChain(
                parseInt(mintFeePerFA),
                APT_DECIMALS
              )
            : 0,
          mintForMyself,
          maxMintPerAccount
            ? convertAmountFromHumanReadableToOnChain(
                maxMintPerAccount,
                decimal!
              )
            : 0,
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
    try {
      if (event.target.files) {
        setIsUploading(true);
        const file = event.target.files[0];
        alert(`The upload process requires at least 1 message signatures to upload the asset image file into Irys.

        In the case we need to fund a node on Irys, a transfer transaction submission is required also.`);
        const funded = await checkIfFund(aptosWallet, file.size);
        if (funded) {
          const uploadFileResponse = await uploadFile(aptosWallet, file);
          setIconURL(uploadFileResponse);
        } else {
          alert(
            "Current account balance is not enough to fund a decentrelized asset node"
          );
        }
      }
    } finally {
      setIsUploading(false);
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
                by copy the private_key from the{" "}
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                  .aptos/config.yaml
                </code>{" "}
                file and import it into the wallet.
              </AlertDescription>
            </Alert>
          )}
          {account && account.address !== CREATOR_ADDRESS && (
            <Alert variant="warning">
              <AlertOctagon className="w-4 h-5" />
              <AlertTitle className="body-md-semibold">
                Wrong account connected
              </AlertTitle>
              <AlertDescription className="body-sm">
                To continue with creating your asset, make sure you are
                connected with the same profile account as in your creator
                address in{" "}
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                  .env
                </code>{" "}
                file
              </AlertDescription>
            </Alert>
          )}

          <div
            className={cn(
              "top-0 left-0 fixed w-full h-full bg-gray-500 bg-opacity-30 flex justify-center items-center flex-col transition-all",
              isUploading
                ? "opacity-100 z-10"
                : "opacity-0 z-0 pointer-events-none"
            )}
          >
            <p className="display">Uploading Files...</p>
            <Spinner size="lg" />
          </div>

          <h3 className="font-bold leading-none tracking-tight md:text-xl dark:text-white py-2">
            Create Asset
          </h3>
          <div className="py-2">
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Label
                tooltip="The name of the asset, e.g. Bitcoin, Ethereum, etc."
                htmlFor="asset-name"
              >
                Asset Name
              </Label>
              <Input
                id="asset-name"
                disabled={isUploading || !account}
                type="text"
                required
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </div>
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Label
                tooltip="The symbol of the asset, e.g. BTC, ETH, etc."
                htmlFor="asset-symbol"
              >
                Asset Symbol
              </Label>
              <Input
                disabled={isUploading || !account}
                id="asset-symbol"
                type="text"
                required
                onChange={(e) => {
                  setSymbol(e.target.value);
                }}
              />
            </div>
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Label
                tooltip="The total amount of the asset that can be minted."
                htmlFor="max-supply"
              >
                Max Supply
              </Label>
              <Input
                disabled={isUploading || !account}
                type="number"
                id="max-supply"
                required
                onChange={(e) => {
                  setMaxSupply(e.target.value);
                }}
              />
            </div>
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Label
                tooltip="The maximum any single individual address can mint."
                htmlFor="max-mint"
              >
                Max mint per account
              </Label>
              <Input
                disabled={isUploading || !account}
                id="max-mint"
                type="number"
                required
                onChange={(e) => {
                  setMaxMintPerAccount(parseInt(e.target.value));
                }}
              />
            </div>
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Label
                tooltip="How many 0's constitute one full unit of the asset. For example, APT has 8."
                htmlFor="decimal"
              >
                Decimal
              </Label>
              <Input
                disabled={isUploading || !account}
                id="decimal"
                type="number"
                required
                onChange={(e) => {
                  setDecimal(parseInt(e.target.value));
                }}
              />
            </div>
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Label tooltip="Your website address" htmlFor="project-url">
                Project URL
              </Label>
              <Input
                disabled={isUploading || !account}
                id="project-url"
                type="text"
                required
                onChange={(e) => {
                  setProjectURL(e.target.value);
                }}
              />
            </div>
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Label
                htmlFor="mint-fee"
                tooltip="The fee cost for the minter to pay to mint one asset. For example, if a user mints 10 assets in a single transaction, they are charged 10x the mint fee."
              >
                Mint fee per fungible asset in APT (Optional)
              </Label>
              <Input
                disabled={isUploading || !account}
                id="mint-fee"
                type="number"
                onChange={(e) => {
                  setMintFeePerFA(e.target.value);
                }}
              />
            </div>
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Label
                tooltip="How many assets to mint right away and send to your address."
                htmlFor="for-myself"
              >
                Mint for myself (Optional)
              </Label>
              <Input
                disabled={isUploading || !account}
                id="for-myself"
                type="number"
                value={mintForMyself}
                onChange={(e) => {
                  setMintForMyself(e.target.value);
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
                  disabled={isUploading || !account}
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
