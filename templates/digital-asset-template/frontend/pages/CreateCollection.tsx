import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  InputTransactionData,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { aptosClient } from "@/utils/aptosClient";
import { uploadCollectionData } from "@/utils/assetsUploader";
import {
  APT_DECIMALS,
  convertAmountFromHumanReadableToOnChain,
} from "@/utils/helpers";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertOctagon } from "lucide-react";

import { dateToSeconds } from "../utils/helpers";
import { LaunchpadHeader } from "@/components/LaunchpadHeader";
import { MODULE_ADDRESS } from "@/constants";

export function CreateCollection() {
  // Wallet connect providers
  const aptosWallet = useWallet();
  const { account, signAndSubmitTransaction } = useWallet();

  // If we are on Production mode, redierct to the mint page
  const navigate = useNavigate();
  if (import.meta.env.PROD) navigate("/", { replace: true });

  // Collection data entered by the user on UI
  const [royaltyPercentage, setRoyaltyPercentage] = useState<number>();
  const [preMintAmount, setPreMintAmount] = useState<number>();
  const [publicMintStartDate, setPublicMintStartDate] = useState<Date>();
  const [publicMintStartTime, setPublicMintStartTime] = useState<string>();
  const [publicMintEndDate, setPublicMintEndDate] = useState<Date>();
  const [publicMintEndTime, setPublicMintEndTime] = useState<string>();
  const [mintLimitPerAccount, setMintLimitPerAccount] = useState<number>();
  const [mintFeePerNFT, setMintFeePerNFT] = useState<number>();

  // Collection data from collection metadata upload by the user
  const [maxSupply, setMaxSupply] = useState<number>();
  const [collectionName, setCollectionName] = useState<string>();
  const [collectionDescription, setCollectionDescription] = useState<string>();
  const [projectUri, setProjectUri] = useState<string>();

  // UI internal state
  const [uploadStatus, setUploadStatus] = useState(
    "Uploads collection files to Irys, a decentralized storage"
  );

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // So we can upload a folder
    if (inputRef.current) {
      inputRef.current.setAttribute("webkitdirectory", "true");
    }
  }, []);

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

  // Function to upload Collection data to Irys - a decentralized asset server
  const onUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = event.target.files;
      alert(`The upload process requires at least 2 message signatures
      1. To upload collection cover image file and NFT image files into Irys
      2. To upload collection metadata file and NFT metadata files into Irys

      In the case we need to fund a node on Irys, a transfer transaction submission is required also.`);
      await uploadCollectionData(
        aptosWallet,
        files,
        setCollectionName,
        setCollectionDescription,
        setMaxSupply,
        setProjectUri,
        setUploadStatus
      );
    }
  };

  const createCollection = async () => {
    if (!account) return;

    const transaction: InputTransactionData = {
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
          preMintAmount ?? 0, // amount of NFT to premint for myself
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
    };

    const response = await signAndSubmitTransaction(transaction);

    const committedTransactionResponse = await aptosClient().waitForTransaction(
      {
        transactionHash: response.hash,
      }
    );
    if (committedTransactionResponse.success) {
      navigate(`/my-collections`, { replace: true });
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
                To continue with creating your collection, first connect your
                wallet by copy the private_key from the{" "}
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                  .aptos/config.yaml
                </code>{" "}
                file and import it into the wallet.
              </AlertDescription>
            </Alert>
          )}
          {account && account.address !== MODULE_ADDRESS && (
            <Alert variant="warning">
              <AlertOctagon className="w-4 h-5" />
              <AlertTitle className="body-md-semibold">
                Wrong account connected
              </AlertTitle>
              <AlertDescription className="body-sm">
                To continue with creating your collection, make sure you are
                connected with the same profile account as in your
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                  .aptos/config.yaml
                </code>{" "}
                file
              </AlertDescription>
            </Alert>
          )}

          <h3 className="font-bold leading-none tracking-tight md:text-xl dark:text-white py-2">
            Create NFT Collection
          </h3>
          <div className="py-2">
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Card>
                <CardHeader>
                  <CardDescription>{uploadStatus}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-between">
                    <Input
                      ref={inputRef}
                      multiple
                      type="file"
                      placeholder="Upload Assets"
                      onChange={(event) => onUploadFile(event)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Label
                tooltip="The royalty the collection creator gets when an NFT is being sold on marketplaces."
                htmlFor="royalty-percentage">
                Royalty Percentage
              </Label>
              <Input
                id="royalty-percentage"
                type="text"
                onChange={(e) => {
                  setRoyaltyPercentage(parseInt(e.target.value));
                }}
              />
            </div>

            <div className="mb-5 flex flex-col item-center space-y-4">
              <div className="flex flex-row space-between">
                <div className="flex flex-col mr-4">
                  <Label
                    htmlFor="mint-start"
                    tooltip="When minting becomes active"
                    className="mb-4">
                    Public mint start date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="mint-start"
                        variant={"outline"}
                        className={cn(
                          "w-[280px] justify-start text-left font-normal",
                          !publicMintStartDate && "text-muted-foreground"
                        )}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {publicMintStartDate ? (
                          format(publicMintStartDate, "MM/dd/yyyy hh:mm a")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={publicMintStartDate}
                        onSelect={setPublicMintStartDate}
                        initialFocus
                        footer={
                          <Input
                            type="time"
                            className="w-max py-6"
                            value={publicMintStartTime}
                            onChange={(event) => onPublicMintStartTime(event)}
                          />
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex flex-col">
                  <Label
                    htmlFor="mint-end"
                    tooltip="When minting finishes."
                    className="mb-4">
                    Public mint end date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="mint-end"
                        variant={"outline"}
                        className={cn(
                          "w-[280px] justify-start text-left font-normal",
                          !publicMintEndDate && "text-muted-foreground"
                        )}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {publicMintEndDate ? (
                          format(publicMintEndDate, "MM/dd/yyyy hh:mm a")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={publicMintEndDate}
                        onSelect={setPublicMintEndDate}
                        initialFocus
                        footer={
                          <Input
                            type="time"
                            className="w-max py-6"
                            value={publicMintEndTime}
                            onChange={(event) => onPublicMintEndTime(event)}
                          />
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-5 flex flex-col item-center space-y-4">
            <Label
              htmlFor="mint-limit"
              tooltip="How many NFTs an individual account is allowed to mint.">
              Limit mint per address
            </Label>
            <Input
              id="mint-limit"
              type="number"
              value={mintLimitPerAccount}
              onChange={(e) => {
                setMintLimitPerAccount(parseInt(e.target.value));
              }}
            />
          </div>
          <div className="mb-5 flex flex-col item-center space-y-4">
            <Label
              htmlFor="mint-fee"
              tooltip="The fee the nft minter is paying the collection creator when they mint a NFT">
              Mint fee per NFT in APT (optional)
            </Label>
            <Input
              type="number"
              id="mint-fee"
              value={mintFeePerNFT}
              onChange={(e) => {
                setMintFeePerNFT(parseFloat(e.target.value));
              }}
            />
          </div>
          <div className="mb-5 flex flex-col item-center space-y-4">
            <Label
              htmlFor="for-myself"
              tooltip="How many NFTs to mint immediately for the creator.">
              Mint for myself (optional)
            </Label>
            <Input
              type="number"
              id="for-myself"
              value={preMintAmount}
              onChange={(e) => {
                setPreMintAmount(parseInt(e.target.value));
              }}
            />
          </div>
          <Button
            disabled={
              !maxSupply ||
              !royaltyPercentage ||
              !account ||
              !publicMintStartDate ||
              !royaltyPercentage ||
              !mintLimitPerAccount
            }
            className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            onClick={createCollection}>
            Create Collection
          </Button>
        </div>
      </div>
    </>
  );
}
