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
import { LaunchpadHeader } from "@/components/LaunchpadHeader";
import {
  InputTransactionData,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { aptosClient } from "@/utils/aptosClient";
import { uploadCollectionData } from "@/utils/assetsUploader";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertOctagon } from "lucide-react";

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
  const [publicMintEndDate, setPublicMintEndDate] = useState<Date>();
  const [mintLimitPerAccount, setMintLimitPerAccount] = useState<number>();
  const [mintFeePerNFT, setMintFeePerNFT] = useState<number>();

  // Collection data from collection metadata upload by the user
  const [maxSupply, setMaxSupply] = useState<number>();
  const [collectionName, setCollectionName] = useState<string>();
  const [collectionDescription, setCollectionDescription] = useState<string>();
  const [projectUri, setProjectUri] = useState<string>();

  const [files, setFiles] = useState<FileList | null>(null);

  // UI internal state
  const [uploadStatus, setUploadStatus] = useState("Upload Files");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // So we can upload a folder
    if (inputRef.current) {
      inputRef.current.setAttribute("webkitdirectory", "true");
    }
  }, []);

  // Function to upload Collection data to Irys - a decentralized asset server
  const onUploadFile = async () => {
    if (files) {
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

  const dateToSeconds = (date: Date | undefined) => {
    if (!date) return;
    const dateInSeconds = Math.floor(+date / 1000);
    return dateInSeconds;
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
          mintFeePerNFT, // mint fee per NFT for the public mint
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
                wallet.
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
                  <CardDescription>
                    Uploads collection data to a decentralized storage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-between">
                    <Input
                      ref={inputRef}
                      multiple
                      type="file"
                      placeholder="Upload Assets"
                      onChange={(event) => setFiles(event.target.files)}
                    />
                  </div>
                  <Button
                    disabled={!account || !files}
                    className="mt-4"
                    onClick={onUploadFile}
                  >
                    {uploadStatus}
                  </Button>
                </CardContent>
              </Card>
            </div>
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Label>Royalty Percentage</Label>
              <Input
                type="text"
                onChange={(e) => {
                  setRoyaltyPercentage(parseInt(e.target.value));
                }}
              />
            </div>

            <div className="mb-5 flex flex-col item-center space-y-4">
              <div className="flex flex-row space-between">
                <div className="flex flex-col mr-4">
                  <Label className="mb-4">Public mint start date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[280px] justify-start text-left font-normal",
                          !publicMintStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {publicMintStartDate ? (
                          format(publicMintStartDate, "PPP")
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
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex flex-col">
                  <Label className="mb-4">Public mint end date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[280px] justify-start text-left font-normal",
                          !publicMintEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {publicMintEndDate ? (
                          format(publicMintEndDate, "PPP")
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
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-5 flex flex-col item-center space-y-4">
            <Label>Limit mint per address</Label>
            <Input
              type="number"
              value={mintLimitPerAccount}
              onChange={(e) => {
                setMintLimitPerAccount(parseInt(e.target.value));
              }}
            />
          </div>
          <div className="mb-5 flex flex-col item-center space-y-4">
            <Label>Mint fee per NFT</Label>
            <Input
              type="number"
              value={mintFeePerNFT}
              onChange={(e) => {
                setMintFeePerNFT(parseInt(e.target.value));
              }}
            />
          </div>
          <div className="mb-5 flex flex-col item-center space-y-4">
            <Label>Mint for myself (optional)</Label>
            <Input
              type="number"
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
              !royaltyPercentage
            }
            className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            onClick={createCollection}
          >
            Create Collection
          </Button>
        </div>
      </div>
    </>
  );
}
