import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { aptosClient } from "@/utils/aptosClient";
import { uploadCollectionData } from "@/utils/assetsUploader";
import {
  APT_DECIMALS,
  convertAmountFromHumanReadableToOnChain,
} from "@/utils/helpers";
import { useNavigate } from "react-router-dom";

import { dateToSeconds } from "../utils/helpers";
import { LaunchpadHeader } from "@/components/LaunchpadHeader";
import { CREATOR_ADDRESS } from "@/constants";
import { WarningAlert } from "@/components/ui/warning-alert";
import { UploadSpinner } from "@/components/UploadSpinner";
import { LabeledInput } from "../components/ui/labeled-input";
import { DateTimeInput } from "@/components/ui/date-time-input";
import { ConfirmButton } from "@/components/ui/confirm-button";

export function CreateCollection() {
  // Wallet connect providers
  const aptosWallet = useWallet();
  const { account, signAndSubmitTransaction } = useWallet();

  // If we are on Production mode, redierct to the mint page
  const navigate = useNavigate();
  if (import.meta.env.PROD) navigate("/", { replace: true });

  // Collection data entered by the user on UI
  const [royaltyPercentage, setRoyaltyPercentage] = useState<string>();
  const [preMintAmount, setPreMintAmount] = useState<string>();
  const [publicMintStartDate, setPublicMintStartDate] = useState<Date>();
  const [publicMintStartTime, setPublicMintStartTime] = useState<string>();
  const [publicMintEndDate, setPublicMintEndDate] = useState<Date>();
  const [publicMintEndTime, setPublicMintEndTime] = useState<string>();
  const [mintLimitPerAccount, setMintLimitPerAccount] = useState<number>();
  const [mintFeePerNFT, setMintFeePerNFT] = useState<number>();
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const onPublicMintStartTime = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const timeValue = event.target.value;
    setPublicMintStartTime(timeValue);

    const [hours, minutes] = timeValue.split(":").map(Number);

    publicMintStartDate?.setHours(hours);
    publicMintStartDate?.setMinutes(minutes);
    publicMintStartDate?.setSeconds(0);
    setPublicMintStartDate(publicMintStartDate);
  };

  const onPublicMintEndTime = (event: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = event.target.value;
    setPublicMintEndTime(timeValue);

    const [hours, minutes] = timeValue.split(":").map(Number);

    publicMintEndDate?.setHours(hours);
    publicMintEndDate?.setMinutes(minutes);
    publicMintEndDate?.setSeconds(0);
    setPublicMintEndDate(publicMintEndDate);
  };

  const createCollection = async () => {
    try {
      if (!account) throw new Error("Please connect your wallet");
      if (!files) throw new Error("Please upload files");
      if (account.address !== CREATOR_ADDRESS) throw new Error("Wrong account");
      if (isUploading) throw new Error("Uploading in progress");

      setIsUploading(true);

      const { collectionName, collectionDescription, maxSupply, projectUri } =
        await uploadCollectionData(aptosWallet, files);

      const response = await signAndSubmitTransaction({
        data: {
          function: `${
            import.meta.env.VITE_MODULE_ADDRESS
          }::launchpad::create_collection`,
          typeArguments: [],
          functionArguments: [
            collectionDescription,
            collectionName,
            projectUri,
            maxSupply,
            royaltyPercentage,
            preMintAmount, // amount of NFT to premint for myself
            undefined, // addresses in the allow list
            undefined, // allow list start time (in seconds)
            undefined, // allow list end time (in seconds)
            undefined, // mint limit per address in the allow list
            undefined, // mint fee per NFT for the allow list
            dateToSeconds(publicMintStartDate), // public mint start time (in seconds)
            dateToSeconds(publicMintEndDate), // public mint end time (in seconds)
            mintLimitPerAccount, // mint limit per address in the public mint
            mintFeePerNFT
              ? convertAmountFromHumanReadableToOnChain(
                  mintFeePerNFT,
                  APT_DECIMALS
                )
              : 0, // mint fee per NFT for the public mint, on chain stored in smallest unit of APT (i.e. 1e8 oAPT = 1 APT)
          ],
        },
      });

      const committedTransactionResponse =
        await aptosClient().waitForTransaction({
          transactionHash: response.hash,
        });
      if (committedTransactionResponse.success) {
        navigate(`/my-collections`, { replace: true });
      }
    } catch (error) {
      alert(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <LaunchpadHeader />
      <div className="flex items-center justify-between px-6 py-2">
        <div className="w-2/4">
          {(!account || account.address !== CREATOR_ADDRESS) && (
            <WarningAlert
              title={
                account ? "Wrong account connected" : "No account connected"
              }
            >
              To continue with creating your collection, make sure you are
              connected with a Wallet and with the same profile account as in
              your CREATOR_ADDRESS in{" "}
              <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                .env
              </code>{" "}
              file
            </WarningAlert>
          )}

          <UploadSpinner on={isUploading} />

          <h3 className="display">Create NFT Collection</h3>

          <Card>
            <CardHeader>
              <CardDescription>
                Uploads collection files to Irys, a decentralized storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-start justify-between">
                {!files?.length && (
                  <Label
                    htmlFor="upload"
                    className={buttonVariants({
                      variant: "outline",
                      className: "cursor-pointer",
                    })}
                  >
                    Choose Files to Upload
                  </Label>
                )}
                <Input
                  className="hidden"
                  ref={inputRef}
                  id="upload"
                  disabled={isUploading || !account}
                  webkitdirectory="true"
                  multiple
                  type="file"
                  placeholder="Upload Assets"
                  onChange={(event) => {
                    setFiles(event.currentTarget.files);
                  }}
                />

                {!!files?.length && (
                  <div>
                    {files.length} files selected{" "}
                    <Button
                      variant="link"
                      className="text-destructive"
                      onClick={() => {
                        setFiles(null);
                        inputRef.current!.value = "";
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex item-center gap-4 mt-4">
            <DateTimeInput
              id="mint-start"
              label="Public mint start date"
              tooltip="When minting becomes active"
              disabled={isUploading || !account}
              date={publicMintStartDate}
              onDateChange={setPublicMintStartDate}
              time={publicMintStartTime}
              onTimeChange={onPublicMintStartTime}
              className="basis-1/2"
            />

            <DateTimeInput
              id="mint-end"
              label="Public mint end date"
              tooltip="When minting finishes"
              disabled={isUploading || !account}
              date={publicMintEndDate}
              onDateChange={setPublicMintEndDate}
              time={publicMintEndTime}
              onTimeChange={onPublicMintEndTime}
              className="basis-1/2"
            />
          </div>

          <LabeledInput
            id="mint-limit"
            required
            label="Mint limit per address"
            tooltip="How many NFTs an individual address is allowed to mint"
            disabled={isUploading || !account}
            onChange={(e) => {
              setMintLimitPerAccount(parseInt(e.target.value));
            }}
          />

          <LabeledInput
            id="royalty-percentage"
            label="Royalty Percentage"
            tooltip="The percentage of trading value that collection creator gets when an NFT is sold on marketplaces"
            disabled={isUploading || !account}
            onChange={(e) => {
              setRoyaltyPercentage(e.target.value);
            }}
          />

          <LabeledInput
            id="mint-fee"
            label="Mint fee per NFT in APT"
            tooltip="The fee the nft minter is paying the collection creator when they mint an NFT"
            disabled={isUploading || !account}
            onChange={(e) => {
              setMintFeePerNFT(parseInt(e.target.value));
            }}
          />

          <LabeledInput
            id="for-myself"
            label="Mint for myself"
            tooltip="How many NFTs to mint immediately for the creator"
            disabled={isUploading || !account}
            onChange={(e) => {
              setPreMintAmount(e.target.value);
            }}
          />

          <ConfirmButton
            title="Create Collection"
            onSubmit={createCollection}
            disabled={
              !account ||
              !files?.length ||
              !publicMintStartDate ||
              !mintLimitPerAccount ||
              !account ||
              isUploading
            }
            confirmMessage={
              <>
                <p>The upload process requires at least 2 message signatures</p>
                <ol className="list-decimal list-inside">
                  <li>
                    To upload collection cover image file and NFT image files
                    into Irys.
                  </li>

                  <li>
                    To upload collection metadata file and NFT metadata files
                    into Irys.
                  </li>
                </ol>
                <p>
                  In the case we need to fund a node on Irys, a transfer
                  transaction submission is required also.
                </p>
              </>
            }
          />
        </div>
      </div>
    </>
  );
}
