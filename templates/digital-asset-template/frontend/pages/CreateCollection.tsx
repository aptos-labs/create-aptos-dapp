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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useRef, useState } from "react";
import { LaunchpadHeader } from "@/components/LaunchpadHeader";
import {
  InputTransactionData,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { aptosClient } from "@/utils/aptosClient";
import { uploadCollectionData } from "@/utils/assetsUploader";
import { useNavigate } from "react-router-dom";

const currentUnixTimestamp = Math.floor(Date.now() / 1000);
const secondsInAWeek = 7 * 24 * 60 * 60;

export function CreateCollection() {
  // Wallet connect providers
  const aptosWallet = useWallet();
  const { account, signAndSubmitTransaction } = useWallet();

  const navigate = useNavigate();

  // Collection data internal state
  const [maxSupply, setMaxSupply] = useState<string>();
  const [royaltyPercentage, setRoyaltyPercentage] = useState<number>();
  const [preMintAmount, setPreMintAmount] = useState<number>();

  const [collectionName, setCollectionName] = useState<string>();
  const [collectionDescription, setCollectionDescription] = useState<string>();
  const [projectUri, setProjectUri] = useState<string>();

  const [files, setFiles] = useState<FileList | null>(null);

  const [publicMintStartTime, setPublicMintStartTime] =
    useState<number>(currentUnixTimestamp);
  const [publicMintEndTime, setPublicMintEndTime] = useState<number>(
    currentUnixTimestamp + secondsInAWeek
  );

  // UI internal state
  const [uploadStatus, setUploadStatus] = useState("Upload Files");
  const [disableCreateCollectionButton, setDisableCreateCollectionButton] =
    useState<boolean>(true);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (maxSupply && royaltyPercentage && maxSupply && preMintAmount) {
      setDisableCreateCollectionButton(false);
    }
    // So we can upload a folder
    if (inputRef.current) {
      inputRef.current.setAttribute("webkitdirectory", "true");
    }
  }, [maxSupply, royaltyPercentage, maxSupply, preMintAmount]);

  // Function to upload Collection data to Irys - a decentralized asset server
  const onUploadFile = async () => {
    if (files) {
      alert(`The upload process requires at least 4 message signatures
      1. To upload a collection image into Irys
      2. To upload a collection metadata file into Irys
      3. To upload NFT image files into Irys
      4. To upload NFT metadata files into Irys

      In the case we need to fund a node on Irys, a transfer transaction submission is required also.`);

      await uploadCollectionData(
        aptosWallet,
        files,
        setCollectionName,
        setCollectionDescription,
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
          "0", // amount of NFT to premint for myself
          undefined, // addresses in the allow list
          undefined, // allow list start time (in seconds)
          undefined, // allow list end time (in seconds)
          undefined, // mint limit per address in the allow list
          undefined, // mint fee per NFT for the allow list
          publicMintStartTime, // public mint start time (in seconds)
          publicMintEndTime, // public mint end time (in seconds)
          1, // mint limit per address in the public mint
          "0", // mint fee per NFT for the public mint
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
          <h3 className="font-bold leading-none tracking-tight md:text-xl dark:text-white py-2">
            Create NFT Collection
          </h3>
          <div className="py-2">
            <div className="mb-5 flex flex-col item-center space-y-4">
              <Label>Max Supply</Label>
              <Input
                type="text"
                onChange={(e) => {
                  setMaxSupply(e.target.value);
                }}
              />
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
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>Advanced options</AccordionTrigger>
                  <AccordionContent className="border p-4">
                    <div className="mb-5 flex flex-col item-center space-y-4">
                      <Label>Mint for myself</Label>
                      <Input
                        type="number"
                        value={preMintAmount}
                        onChange={(e) => {
                          setPreMintAmount(parseInt(e.target.value));
                        }}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          <Button
            //disabled={disableCreateCollectionButton}
            className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            onClick={createCollection}
          >
            Create Collection
          </Button>
        </div>

        <div className="w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Upload Collection Data</CardTitle>
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
              <Button className="mt-4" onClick={onUploadFile}>
                {uploadStatus}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
