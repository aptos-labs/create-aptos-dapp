import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { checkIfFund, uploadFile } from "@/utils/Irys";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { aptosClient } from "@/utils/aptosClient";
import {
  APT_DECIMALS,
  convertAmountFromHumanReadableToOnChain,
  convertAmountFromOnChainToHumanReadable,
} from "@/utils/helpers";
import { LaunchpadHeader } from "@/components/LaunchpadHeader";
import { CREATOR_ADDRESS } from "@/constants";
import { WarningAlert } from "@/components/ui/warning-alert";
import { UploadSpinner } from "@/components/UploadSpinner";
import { LabeledInput } from "@/components/ui/labeled-input";
import { ConfirmButton } from "@/components/ui/confirm-button";

export function CreateFungibleAsset() {
  const aptosWallet = useWallet();
  const { account, signAndSubmitTransaction } = useWallet();
  const navigate = useNavigate();
  const [name, setName] = useState<string>();
  const [symbol, setSymbol] = useState<string>();
  const [maxSupply, setMaxSupply] = useState<string>();
  const [maxMintPerAccount, setMaxMintPerAccount] = useState<number>();
  const [decimal, setDecimal] = useState<string>();
  const [image, setImage] = useState<File | null>(null);
  const [projectURL, setProjectURL] = useState<string>();
  const [mintFeePerFA, setMintFeePerFA] = useState<string>();
  const [mintForMyself, setMintForMyself] = useState<string>();
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const disableCreateAssetButton =
    !name || !symbol || !maxSupply || !decimal || !projectURL || !maxMintPerAccount || !account || isUploading;

  const createAsset = async () => {
    try {
      if (!account) throw new Error("Connect wallet first");
      if (!image) throw new Error("Select image first");

      setIsUploading(true);

      const funded = await checkIfFund(aptosWallet, image.size);
      if (!funded) throw new Error("Current account balance is not enough to fund a decentralized asset node");

      const iconURL = await uploadFile(aptosWallet, image);

      const response = await signAndSubmitTransaction({
        data: {
          function: `${import.meta.env.VITE_MODULE_ADDRESS}::launchpad::create_fa`,
          typeArguments: [],
          functionArguments: [
            convertAmountFromHumanReadableToOnChain(Number(maxSupply), Number(decimal)),
            name,
            symbol,
            decimal,
            iconURL,
            projectURL,
            mintFeePerFA
              ? convertAmountFromOnChainToHumanReadable(
                  convertAmountFromHumanReadableToOnChain(parseInt(mintFeePerFA), APT_DECIMALS),
                  Number(decimal),
                )
              : 0,
            mintForMyself ? convertAmountFromHumanReadableToOnChain(parseInt(mintForMyself), Number(decimal)) : 0,
            maxMintPerAccount ? convertAmountFromHumanReadableToOnChain(maxMintPerAccount, Number(decimal)) : 0,
          ],
        },
      });

      const committedTransactionResponse = await aptosClient().waitForTransaction({
        transactionHash: response.hash,
      });
      if (committedTransactionResponse.success) {
        navigate(`/my-assets`, { replace: true });
      }
    } catch (error) {
      alert(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <LaunchpadHeader title="Create Asset" />
      <div className="flex flex-col md:flex-row items-start justify-between px-4 py-2 gap-4 max-w-screen-xl mx-auto">
        <div className="w-full md:w-2/3 flex flex-col gap-y-4 order-2 md:order-1">
          {(!account || account.address !== CREATOR_ADDRESS) && (
            <WarningAlert title={account ? "Wrong account connected" : "No account connected"}>
              To continue with creating your collection, make sure you are connected with a Wallet and with the same
              profile account as in your CREATOR_ADDRESS in{" "}
              <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                .env
              </code>{" "}
              file
            </WarningAlert>
          )}

          <UploadSpinner on={isUploading} />

          <Card>
            <CardHeader>
              <CardTitle>Asset Image</CardTitle>
              <CardDescription>Uploads asset to a decentralized storage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-start justify-between">
                {!image && (
                  <Label
                    htmlFor="upload"
                    className={buttonVariants({
                      variant: "outline",
                      className: "cursor-pointer",
                    })}
                  >
                    Choose Image
                  </Label>
                )}
                <Input
                  disabled={isUploading || !account}
                  type="file"
                  className="hidden"
                  ref={inputRef}
                  id="upload"
                  placeholder="Upload Image"
                  onChange={(e) => {
                    setImage(e.target.files![0]);
                  }}
                />
                {image && (
                  <>
                    <img src={URL.createObjectURL(image)} />
                    <p className="body-sm">
                      {image.name}
                      <Button
                        variant="link"
                        className="text-destructive"
                        onClick={() => {
                          setImage(null);
                          inputRef.current!.value = "";
                        }}
                      >
                        Clear
                      </Button>
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <LabeledInput
            id="asset-name"
            label="Asset Name"
            tooltip="The name of the asset, e.g. Bitcoin, Ethereum, etc."
            required
            onChange={(e) => setName(e.target.value)}
            disabled={isUploading || !account}
            type="text"
          />

          <LabeledInput
            id="asset-symbol"
            label="Asset Symbol"
            tooltip="The symbol of the asset, e.g. BTC, ETH, etc."
            required
            onChange={(e) => setSymbol(e.target.value)}
            disabled={isUploading || !account}
            type="text"
          />

          <LabeledInput
            id="max-supply"
            label="Max Supply"
            tooltip="The total amount of the asset that can be minted."
            required
            onChange={(e) => setMaxSupply(e.target.value)}
            disabled={isUploading || !account}
            type="number"
          />

          <LabeledInput
            id="max-mint"
            label="Max mint in full unit of an asset per account"
            tooltip="The maximum any single individual address can mint"
            required
            onChange={(e) => setMaxMintPerAccount(parseInt(e.target.value))}
            disabled={isUploading || !account}
            type="number"
          />

          <LabeledInput
            id="decimal"
            label="Decimal"
            tooltip="How many 0's constitute one full unit of the asset. For example, APT has 8."
            required
            onChange={(e) => setDecimal(e.target.value)}
            disabled={isUploading || !account}
            type="number"
          />

          <LabeledInput
            id="project-url"
            label="Project URL"
            tooltip="Your website address"
            required
            onChange={(e) => setProjectURL(e.target.value)}
            disabled={isUploading || !account}
            type="text"
          />

          <LabeledInput
            id="mint-fee"
            label="Mint fee per one full unit of fungible asset in APT"
            tooltip="The fee cost for the minter to pay to mint one full unit of an asset. For example, if a user mints 10 assets in a single transaction, they are charged 10x the mint fee."
            onChange={(e) => setMintFeePerFA(e.target.value)}
            disabled={isUploading || !account}
            type="number"
          />

          <LabeledInput
            id="for-myself"
            label="Mint for myself"
            tooltip="How many assets to mint right away and send to your address."
            onChange={(e) => setMintForMyself(e.target.value)}
            disabled={isUploading || !account}
            type="number"
          />

          <ConfirmButton
            title="Create Asset"
            className="self-start"
            onSubmit={createAsset}
            disabled={disableCreateAssetButton}
            confirmMessage={
              <>
                <p>
                  The upload process requires at least 1 message signatures to upload the asset image file into Irys.
                </p>
                <p>In the case we need to fund a node on Irys, a transfer transaction submission is required also.</p>
              </>
            }
          />
        </div>

        <div className="w-full md:w-1/3 order-1 md:order-2">
          <Card>
            <CardHeader className="body-md-semibold">Learn More</CardHeader>
            <CardContent>
              <Link
                to="https://aptos.dev/standards/fungible-asset"
                style={{ textDecoration: "underline" }}
                target="_blank"
              >
                Find out more about Fungible Assets on Aptos
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
